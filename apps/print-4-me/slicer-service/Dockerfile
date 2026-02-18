FROM ubuntu:22.04

# Avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install PrusaSlicer and dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgtk-3-0 \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install PrusaSlicer (latest AppImage)
# Check https://github.com/prusa3d/PrusaSlicer/releases for latest version
ARG PRUSASLICER_VERSION=2.7.4
RUN wget -q "https://github.com/prusa3d/PrusaSlicer/releases/download/version_${PRUSASLICER_VERSION}/PrusaSlicer-${PRUSASLICER_VERSION}+linux-x64-GTK3-202403271417.AppImage" \
    -O /usr/local/bin/prusa-slicer.AppImage && \
    chmod +x /usr/local/bin/prusa-slicer.AppImage && \
    cd /usr/local/bin && \
    ./prusa-slicer.AppImage --appimage-extract && \
    ln -sf /usr/local/bin/squashfs-root/AppRun /usr/local/bin/prusa-slicer

# Install Python web server for the slicer API
RUN pip3 install fastapi uvicorn httpx aiofiles

# Working directories
RUN mkdir -p /app /tmp/slicer-workdir /profiles
WORKDIR /app

# Copy the slicer API server
COPY slicer_api.py /app/slicer_api.py

# Default printer/filament profiles (copy your .ini files here)
# COPY profiles/ /profiles/

EXPOSE 8080

# Resource limits (adjust in docker-compose or k8s)
# Memory: 2GB recommended
# CPU: 2 cores recommended

CMD ["uvicorn", "slicer_api:app", "--host", "0.0.0.0", "--port", "8080"]
