/**
 * Backend STL Scaling Utility
 * Server-side STL file processing and scaling
 */

import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { STLExporter } from "three/addons/exporters/STLExporter.js";
import type { ModelDimensions } from "@/types/model";

/**
 * Load STL file from buffer
 * @param buffer - STL file buffer
 * @returns Three.js BufferGeometry
 */
export async function loadSTLFromBuffer(
  buffer: ArrayBuffer,
): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    const loader = new STLLoader();
    try {
      const geometry = loader.parse(buffer);
      resolve(geometry);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Scale STL geometry
 * @param geometry - Three.js BufferGeometry
 * @param scaleFactor - Scale factor to apply
 * @returns Scaled geometry
 */
export function scaleGeometry(
  geometry: THREE.BufferGeometry,
  scaleFactor: number,
): THREE.BufferGeometry {
  const clonedGeometry = geometry.clone();
  clonedGeometry.scale(scaleFactor, scaleFactor, scaleFactor);
  return clonedGeometry;
}

/**
 * Export geometry to STL binary format
 * @param geometry - Three.js BufferGeometry
 * @returns ArrayBuffer containing STL binary data
 */
export function exportSTL(geometry: THREE.BufferGeometry): ArrayBuffer {
  const exporter = new STLExporter();
  const mesh = new THREE.Mesh(geometry);
  const stlData = exporter.parse(mesh, { binary: true });

  if (stlData instanceof DataView) {
    // DataView.buffer is ArrayBufferLike, but we need ArrayBuffer
    // In practice, it's always ArrayBuffer in browser contexts
    return stlData.buffer as ArrayBuffer;
  }

  // If string (ASCII), convert to buffer
  const encoder = new TextEncoder();
  return encoder.encode(stlData).buffer;
}

/**
 * Process and scale STL file
 * @param inputBuffer - Original STL file buffer
 * @param scaleFactor - Scale factor to apply
 * @returns Scaled STL file buffer
 */
export async function processAndScaleSTL(
  inputBuffer: ArrayBuffer,
  scaleFactor: number,
): Promise<ArrayBuffer> {
  // Load original geometry
  const geometry = await loadSTLFromBuffer(inputBuffer);

  // Apply scaling
  const scaledGeometry = scaleGeometry(geometry, scaleFactor);

  // Export to STL
  const outputBuffer = exportSTL(scaledGeometry);

  // Cleanup
  geometry.dispose();
  scaledGeometry.dispose();

  return outputBuffer;
}

/**
 * Calculate dimensions from STL buffer
 * @param buffer - STL file buffer
 * @returns Model dimensions
 */
export async function calculateDimensionsFromBuffer(
  buffer: ArrayBuffer,
): Promise<ModelDimensions> {
  const geometry = await loadSTLFromBuffer(buffer);
  geometry.computeBoundingBox();

  const bbox = geometry.boundingBox!;
  const dimensions: ModelDimensions = {
    x: bbox.max.x - bbox.min.x,
    y: bbox.max.y - bbox.min.y,
    z: bbox.max.z - bbox.min.z,
  };

  geometry.dispose();
  return dimensions;
}

/**
 * Validate STL file integrity
 * @param buffer - STL file buffer
 * @returns Validation result
 */
export async function validateSTLFile(
  buffer: ArrayBuffer,
): Promise<{ valid: boolean; error?: string }> {
  try {
    const geometry = await loadSTLFromBuffer(buffer);

    // Check if geometry has vertices
    const positionAttribute = geometry.getAttribute("position");
    if (!positionAttribute || positionAttribute.count === 0) {
      geometry.dispose();
      return { valid: false, error: "STL file contains no geometry" };
    }

    // Check for degenerate triangles
    if (positionAttribute.count % 3 !== 0) {
      geometry.dispose();
      return { valid: false, error: "Invalid triangle count" };
    }

    geometry.dispose();
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid STL file",
    };
  }
}

/**
 * Normalize STL to millimeters
 * Detects if STL is in inches and converts to mm
 * @param buffer - STL file buffer
 * @returns Normalized buffer and applied scale factor
 */
export async function normalizeSTLUnits(
  buffer: ArrayBuffer,
): Promise<{ buffer: ArrayBuffer; scaleFactor: number }> {
  const dimensions = await calculateDimensionsFromBuffer(buffer);

  // If all dimensions are very small (< 25mm), assume inches
  const maxDim = Math.max(dimensions.x, dimensions.y, dimensions.z);

  if (maxDim < 25) {
    // Likely in inches, convert to mm
    const MM_PER_INCH = 25.4;
    const scaledBuffer = await processAndScaleSTL(buffer, MM_PER_INCH);
    return { buffer: scaledBuffer, scaleFactor: MM_PER_INCH };
  }

  // Already in mm
  return { buffer, scaleFactor: 1.0 };
}

/**
 * Center STL geometry at origin
 * @param geometry - Three.js BufferGeometry
 * @returns Centered geometry
 */
export function centerGeometry(
  geometry: THREE.BufferGeometry,
): THREE.BufferGeometry {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;

  const center = new THREE.Vector3(
    (bbox.min.x + bbox.max.x) / 2,
    (bbox.min.y + bbox.max.y) / 2,
    (bbox.min.z + bbox.max.z) / 2,
  );

  geometry.translate(-center.x, -center.y, -center.z);
  return geometry;
}
