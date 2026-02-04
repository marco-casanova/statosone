/**
 * STL Dimension Utilities
 * Functions for calculating dimensions, validating sizes, and scaling models
 */

import * as THREE from "three";
import type {
  ModelDimensions,
  BoundingBox,
  BuildVolume,
  ValidationResult,
  ScaleConfig,
} from "@/types/model";

/**
 * Default printer build volume (in mm)
 * Adjust based on your printer specifications
 */
export const DEFAULT_BUILD_VOLUME: BuildVolume = {
  x: 220,
  y: 220,
  z: 250,
};

/**
 * Calculate bounding box from Three.js geometry
 * @param geometry - Three.js BufferGeometry
 * @returns Bounding box with min, max, size, and center
 */
export function calculateBoundingBox(
  geometry: THREE.BufferGeometry,
): BoundingBox {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;

  const min: ModelDimensions = {
    x: bbox.min.x,
    y: bbox.min.y,
    z: bbox.min.z,
  };

  const max: ModelDimensions = {
    x: bbox.max.x,
    y: bbox.max.y,
    z: bbox.max.z,
  };

  const size: ModelDimensions = {
    x: max.x - min.x,
    y: max.y - min.y,
    z: max.z - min.z,
  };

  const center: ModelDimensions = {
    x: (min.x + max.x) / 2,
    y: (min.y + max.y) / 2,
    z: (min.z + max.z) / 2,
  };

  return { min, max, size, center };
}

/**
 * Calculate dimensions from a mesh
 * @param mesh - Three.js Mesh
 * @returns Model dimensions in current units
 */
export function calculateMeshDimensions(mesh: THREE.Mesh): ModelDimensions {
  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box.getSize(size);

  return {
    x: size.x,
    y: size.y,
    z: size.z,
  };
}

/**
 * Validate if model fits within build volume
 * @param dimensions - Model dimensions in mm
 * @param buildVolume - Printer build volume in mm
 * @returns Validation result with warnings and suggestions
 */
export function validateModelSize(
  dimensions: ModelDimensions,
  buildVolume: BuildVolume = DEFAULT_BUILD_VOLUME,
): ValidationResult {
  const oversizedDimensions: ("x" | "y" | "z")[] = [];
  const warnings: string[] = [];

  // Check each dimension
  if (dimensions.x > buildVolume.x) {
    oversizedDimensions.push("x");
  }
  if (dimensions.y > buildVolume.y) {
    oversizedDimensions.push("y");
  }
  if (dimensions.z > buildVolume.z) {
    oversizedDimensions.push("z");
  }

  const fitsInBuildVolume = oversizedDimensions.length === 0;

  // Generate warnings
  if (!fitsInBuildVolume) {
    warnings.push(
      `Model exceeds build volume in ${oversizedDimensions.join(", ")} dimension(s)`,
    );

    // Calculate suggested scale factor
    const scaleFactors = [
      buildVolume.x / dimensions.x,
      buildVolume.y / dimensions.y,
      buildVolume.z / dimensions.z,
    ];
    const suggestedScaleFactor = Math.min(...scaleFactors) * 0.95; // 95% to add margin

    return {
      fitsInBuildVolume,
      oversizedDimensions,
      suggestedScaleFactor,
      warnings,
    };
  }

  return {
    fitsInBuildVolume,
    oversizedDimensions,
    warnings,
  };
}

/**
 * Calculate scale factor needed to fit model in build volume
 * @param dimensions - Current model dimensions
 * @param buildVolume - Printer build volume
 * @returns Scale factor to apply (e.g., 0.5 = 50%)
 */
export function calculateScaleToFit(
  dimensions: ModelDimensions,
  buildVolume: BuildVolume = DEFAULT_BUILD_VOLUME,
): number {
  const scaleX = buildVolume.x / dimensions.x;
  const scaleY = buildVolume.y / dimensions.y;
  const scaleZ = buildVolume.z / dimensions.z;

  // Use smallest scale factor and add 5% margin
  return Math.min(scaleX, scaleY, scaleZ) * 0.95;
}

/**
 * Apply scale factor to dimensions
 * @param dimensions - Original dimensions
 * @param scaleFactor - Scale factor to apply
 * @returns Scaled dimensions
 */
export function applyScaleToDimensions(
  dimensions: ModelDimensions,
  scaleFactor: number,
): ModelDimensions {
  return {
    x: dimensions.x * scaleFactor,
    y: dimensions.y * scaleFactor,
    z: dimensions.z * scaleFactor,
  };
}

/**
 * Calculate scale factor from target dimension
 * Maintains aspect ratio by scaling based on the specified axis
 * @param originalDimensions - Original dimensions
 * @param targetDimension - Target size for one axis
 * @param axis - Which axis to use for calculation
 * @returns Uniform scale factor
 */
export function calculateScaleFromTarget(
  originalDimensions: ModelDimensions,
  targetDimension: number,
  axis: "x" | "y" | "z",
): number {
  return targetDimension / originalDimensions[axis];
}

/**
 * Format dimensions for display
 * @param dimensions - Dimensions to format
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatDimensions(
  dimensions: ModelDimensions,
  decimals = 2,
): string {
  return `${dimensions.x.toFixed(decimals)} × ${dimensions.y.toFixed(decimals)} × ${dimensions.z.toFixed(decimals)} mm`;
}

/**
 * Format scale factor as percentage
 * @param scaleFactor - Scale factor (1.0 = 100%)
 * @returns Formatted percentage string
 */
export function formatScalePercentage(scaleFactor: number): string {
  return `${(scaleFactor * 100).toFixed(0)}%`;
}

/**
 * Create a build volume helper for Three.js scene
 * @param buildVolume - Build volume dimensions
 * @returns Three.js box helper
 */
export function createBuildVolumeHelper(
  buildVolume: BuildVolume = DEFAULT_BUILD_VOLUME,
): THREE.LineSegments {
  const geometry = new THREE.BoxGeometry(
    buildVolume.x,
    buildVolume.y,
    buildVolume.z,
  );
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: 0x00ff00,
      opacity: 0.3,
      transparent: true,
    }),
  );
  line.position.y = buildVolume.z / 2;
  return line;
}

/**
 * Detect if STL is likely in inches instead of mm
 * @param dimensions - Model dimensions
 * @returns True if likely in inches
 */
export function isLikelyInches(dimensions: ModelDimensions): boolean {
  // If all dimensions are very small (< 25mm), likely in inches
  const maxDim = Math.max(dimensions.x, dimensions.y, dimensions.z);
  return maxDim < 25;
}

/**
 * Convert inches to millimeters
 * @param dimensions - Dimensions in inches
 * @returns Dimensions in millimeters
 */
export function inchesToMm(dimensions: ModelDimensions): ModelDimensions {
  const MM_PER_INCH = 25.4;
  return {
    x: dimensions.x * MM_PER_INCH,
    y: dimensions.y * MM_PER_INCH,
    z: dimensions.z * MM_PER_INCH,
  };
}
