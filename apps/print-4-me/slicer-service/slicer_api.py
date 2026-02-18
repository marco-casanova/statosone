"""
PrusaSlicer API Service
Exposes /estimate and /slice endpoints for the Print-4-Me pipeline.
Runs PrusaSlicer CLI in a sandboxed environment.
"""

import os
import re
import json
import uuid
import shutil
import asyncio
import tempfile
import logging
from pathlib import Path
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("slicer-api")

app = FastAPI(title="Print-4-Me Slicer Service")

PRUSA_SLICER_BIN = os.getenv("PRUSA_SLICER_BIN", "prusa-slicer")
WORKDIR = Path(os.getenv("SLICER_WORKDIR", "/tmp/slicer-workdir"))
PROFILES_DIR = Path(os.getenv("PROFILES_DIR", "/profiles"))
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "100"))

WORKDIR.mkdir(parents=True, exist_ok=True)


class SliceRequest(BaseModel):
    stl_url: str
    order_id: Optional[str] = None
    layer_height: float = 0.2
    infill_percent: int = 20
    supports: bool = False
    printer_ini: Optional[str] = None
    filament_ini: Optional[str] = None


class EstimateRequest(BaseModel):
    stl_url: str
    layer_height: float = 0.2
    infill_percent: int = 20
    supports: bool = False
    printer_profile_id: Optional[str] = None
    material_profile_id: Optional[str] = None


async def download_file(url: str, dest: Path) -> None:
    """Download a file from a signed URL."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        dest.write_bytes(response.content)
        size_mb = len(response.content) / (1024 * 1024)
        if size_mb > MAX_FILE_SIZE_MB:
            dest.unlink()
            raise HTTPException(400, f"File too large: {size_mb:.1f} MB (max {MAX_FILE_SIZE_MB} MB)")
        logger.info(f"Downloaded {size_mb:.1f} MB to {dest}")


def build_slicer_command(
    stl_path: Path,
    output_path: Path,
    layer_height: float,
    infill_percent: int,
    supports: bool,
    printer_ini: Optional[str] = None,
    filament_ini: Optional[str] = None,
) -> list[str]:
    """Build the PrusaSlicer CLI command."""
    cmd = [PRUSA_SLICER_BIN]

    # Load profiles if provided
    if printer_ini:
        ini_path = PROFILES_DIR / printer_ini
        if ini_path.exists():
            cmd.extend(["--load", str(ini_path)])

    if filament_ini:
        ini_path = PROFILES_DIR / filament_ini
        if ini_path.exists():
            cmd.extend(["--load", str(ini_path)])

    cmd.extend([
        "--layer-height", str(layer_height),
        "--fill-density", f"{infill_percent}%",
    ])

    if supports:
        cmd.append("--support-material")

    cmd.extend([
        "--export-gcode",
        "--output", str(output_path),
        str(stl_path),
    ])

    return cmd


def parse_slicer_output(output: str, gcode_path: Path) -> dict:
    """Parse PrusaSlicer output and G-code header for estimates."""
    result = {
        "grams_used": 0.0,
        "print_time_seconds": 0,
        "layers": None,
        "filament_length_mm": None,
    }

    # Try parsing G-code file header comments
    if gcode_path.exists():
        try:
            with open(gcode_path, "r", errors="ignore") as f:
                header_lines = []
                for line in f:
                    if not line.startswith(";"):
                        if header_lines:
                            break
                        continue
                    header_lines.append(line)

                header = "\n".join(header_lines)

                # Extract filament used (grams)
                m = re.search(r"filament used \[g\]\s*=\s*([\d.]+)", header)
                if m:
                    result["grams_used"] = round(float(m.group(1)), 2)

                # Extract filament used (mm)
                m = re.search(r"filament used \[mm\]\s*=\s*([\d.]+)", header)
                if m:
                    result["filament_length_mm"] = round(float(m.group(1)), 2)

                # Extract estimated time
                m = re.search(r"estimated printing time.*?=\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?", header)
                if m:
                    days = int(m.group(1) or 0)
                    hours = int(m.group(2) or 0)
                    mins = int(m.group(3) or 0)
                    secs = int(m.group(4) or 0)
                    result["print_time_seconds"] = days * 86400 + hours * 3600 + mins * 60 + secs

                # Extract total layers
                m = re.search(r"total layers count\s*=\s*(\d+)", header)
                if m:
                    result["layers"] = int(m.group(1))

        except Exception as e:
            logger.warning(f"Failed to parse G-code header: {e}")

    # Fallback: parse CLI output
    if result["grams_used"] == 0:
        m = re.search(r"([\d.]+)\s*g", output)
        if m:
            result["grams_used"] = round(float(m.group(1)), 2)

    return result


@app.get("/health")
async def health():
    return {"status": "ok", "slicer": PRUSA_SLICER_BIN}


@app.post("/estimate")
async def estimate(req: EstimateRequest):
    """Quick estimate: slice to get time/grams but discard G-code."""
    job_id = str(uuid.uuid4())[:8]
    job_dir = WORKDIR / job_id
    job_dir.mkdir(parents=True)

    try:
        stl_path = job_dir / "model.stl"
        gcode_path = job_dir / "model.gcode"

        await download_file(req.stl_url, stl_path)

        cmd = build_slicer_command(
            stl_path, gcode_path,
            req.layer_height, req.infill_percent, req.supports,
        )

        logger.info(f"[{job_id}] Running estimate: {' '.join(cmd)}")

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=300)
        output = stdout.decode(errors="ignore")

        if proc.returncode != 0:
            logger.error(f"[{job_id}] Slicer failed: {output}")
            raise HTTPException(500, f"Slicer failed: {output[:500]}")

        result = parse_slicer_output(output, gcode_path)
        logger.info(f"[{job_id}] Estimate: {result}")

        return result

    finally:
        shutil.rmtree(job_dir, ignore_errors=True)


@app.post("/slice")
async def slice(req: SliceRequest):
    """Full slice: produce G-code and return download URL or path."""
    job_id = req.order_id or str(uuid.uuid4())[:8]
    job_dir = WORKDIR / job_id
    job_dir.mkdir(parents=True)

    try:
        stl_path = job_dir / "model.stl"
        gcode_path = job_dir / "model.gcode"

        await download_file(req.stl_url, stl_path)

        cmd = build_slicer_command(
            stl_path, gcode_path,
            req.layer_height, req.infill_percent, req.supports,
            req.printer_ini, req.filament_ini,
        )

        logger.info(f"[{job_id}] Running slice: {' '.join(cmd)}")

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=600)
        output = stdout.decode(errors="ignore")

        if proc.returncode != 0:
            logger.error(f"[{job_id}] Slicer failed: {output}")
            raise HTTPException(500, f"Slicer failed: {output[:500]}")

        if not gcode_path.exists():
            raise HTTPException(500, "G-code file was not produced")

        estimate = parse_slicer_output(output, gcode_path)
        gcode_size = gcode_path.stat().st_size

        logger.info(f"[{job_id}] Slice complete: {gcode_size} bytes, {estimate}")

        # In production, upload G-code to object storage and return the key.
        # For now, serve the file via a temporary endpoint or return its path.
        # The Next.js API will handle uploading to Supabase Storage.

        # Read G-code into memory for the response (or use file streaming)
        gcode_bytes = gcode_path.read_bytes()

        return {
            "success": True,
            "estimate": estimate,
            "gcode_size_bytes": gcode_size,
            "gcode_storage_key": f"gcode/{job_id}.gcode",
            # In production: upload to S3/Supabase and return signed URL
            # "gcode_url": "https://storage.example.com/..."
        }

    finally:
        # Clean up after response is sent
        # In production use background cleanup
        pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
