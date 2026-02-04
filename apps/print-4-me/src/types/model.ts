/**
 * 3D Model Dimension Types
 * Used for STL dimension calculations, scaling, and validation
 */

/** 3D dimensions in millimeters */
export interface ModelDimensions {
  x: number;
  y: number;
  z: number;
}

/** Bounding box data for a 3D model */
export interface BoundingBox {
  min: ModelDimensions;
  max: ModelDimensions;
  size: ModelDimensions;
  center: ModelDimensions;
}

/** Printer build volume configuration */
export interface BuildVolume {
  x: number; // width in mm
  y: number; // depth in mm
  z: number; // height in mm
}

/** Model scaling configuration */
export interface ScaleConfig {
  /** Uniform scale factor (1.0 = 100%) */
  factor: number;
  /** Target dimensions (if using exact dimension input) */
  targetDimensions?: ModelDimensions;
  /** Lock aspect ratio when scaling */
  lockAspectRatio: boolean;
}

/** Model validation result */
export interface ValidationResult {
  /** Whether the model fits in the build volume */
  fitsInBuildVolume: boolean;
  /** Dimensions that exceed build volume */
  oversizedDimensions: ("x" | "y" | "z")[];
  /** Suggested scale factor to fit */
  suggestedScaleFactor?: number;
  /** Warning messages */
  warnings: string[];
}

/** Model metadata stored in database */
export interface ModelMetadata {
  id: string;
  userId: string;
  /** Original filename */
  filename: string;
  /** Original file path in storage */
  originalFilePath: string;
  /** Scaled file path in storage (if scaled) */
  scaledFilePath?: string;
  /** Original dimensions in mm */
  originalDimensions: ModelDimensions;
  /** Final dimensions after scaling */
  finalDimensions: ModelDimensions;
  /** Applied scale factor */
  scaleFactor: number;
  /** File size in bytes */
  fileSize: number;
  /** Whether user confirmed dimensions */
  dimensionsConfirmed: boolean;
  /** Validation result */
  validation?: ValidationResult;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/** STL processing request */
export interface STLProcessingRequest {
  /** Model ID */
  modelId: string;
  /** Scale factor to apply */
  scaleFactor: number;
  /** Target dimensions (alternative to scale factor) */
  targetDimensions?: ModelDimensions;
  /** Lock aspect ratio */
  lockAspectRatio: boolean;
}

/** STL processing response */
export interface STLProcessingResponse {
  success: boolean;
  /** Path to scaled STL file */
  scaledFilePath?: string;
  /** Final dimensions */
  finalDimensions?: ModelDimensions;
  /** Applied scale factor */
  appliedScaleFactor?: number;
  /** Validation result */
  validation?: ValidationResult;
  /** Error message if failed */
  error?: string;
}
