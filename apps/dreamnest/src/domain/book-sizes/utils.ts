/**
 * Book Size Utility Functions
 * Pure, unit-testable helpers for book size operations
 */

import { BookSize, BookCategory, Unit, UseCase, Recommendation } from "./types";
import { BOOK_SIZES } from "./data";

// ============================================================
// CONVERSION FUNCTIONS
// ============================================================

/**
 * Convert inches to centimeters (rounded to 1 decimal)
 */
export function inToCm(valueIn: number): number {
  return Math.round(valueIn * 2.54 * 10) / 10;
}

/**
 * Convert centimeters to inches (rounded to 2 decimals)
 */
export function cmToIn(valueCm: number): number {
  return Math.round((valueCm / 2.54) * 100) / 100;
}

// ============================================================
// LOOKUP FUNCTIONS
// ============================================================

/**
 * Get a book size by its unique ID
 */
export function getBookSizeById(id: string): BookSize | undefined {
  return BOOK_SIZES.find((size) => size.id === id);
}

/**
 * Get all book sizes in a category
 */
export function getBookSizesByCategory(category: BookCategory): BookSize[] {
  return BOOK_SIZES.filter((size) => size.category === category);
}

/**
 * Search book sizes by query string
 * Matches against name, notes, tags, and id (case-insensitive)
 */
export function searchBookSizes(query: string): BookSize[] {
  const q = query.toLowerCase().trim();
  if (!q) return BOOK_SIZES;

  return BOOK_SIZES.filter((size) => {
    const searchableText = [
      size.id,
      size.name,
      size.notes || "",
      ...(size.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(q);
  });
}

/**
 * Get all unique categories from the dataset
 */
export function getAllCategories(): BookCategory[] {
  return [...new Set(BOOK_SIZES.map((size) => size.category))];
}

// ============================================================
// FORMATTING FUNCTIONS
// ============================================================

/**
 * Format a book size's dimensions in the specified unit
 * Returns string like "5 × 8 in" or "12.7 × 20.3 cm"
 */
export function formatSize(size: BookSize, unit: Unit): string {
  if (unit === "in") {
    return `${size.widthIn} × ${size.heightIn} in`;
  }
  return `${size.widthCm} × ${size.heightCm} cm`;
}

/**
 * Format both units for display
 * Returns string like "5 × 8 in (12.7 × 20.3 cm)"
 */
export function formatSizeBoth(size: BookSize, primaryUnit: Unit): string {
  if (primaryUnit === "in") {
    return `${size.widthIn} × ${size.heightIn} in (${size.widthCm} × ${size.heightCm} cm)`;
  }
  return `${size.widthCm} × ${size.heightCm} cm (${size.widthIn} × ${size.heightIn} in)`;
}

/**
 * Format size as a short label
 * Returns string like "5×8"
 */
export function formatSizeShort(size: BookSize, unit: Unit): string {
  if (unit === "in") {
    return `${size.widthIn}×${size.heightIn}`;
  }
  return `${size.widthCm}×${size.heightCm}`;
}

/**
 * Get aspect ratio description
 */
export function getAspectRatioLabel(size: BookSize): string {
  const ratio = size.widthIn / size.heightIn;
  if (Math.abs(ratio - 1) < 0.05) return "Square";
  if (ratio > 1) return "Landscape";
  return "Portrait";
}

// ============================================================
// RECOMMENDATION LOGIC
// ============================================================

/**
 * Use case to size mapping with reasons
 */
const RECOMMENDATIONS: Record<UseCase, { sizeId: string; reason: string }> = {
  NOVEL: {
    sizeId: "trade_pb_5x8",
    reason: "The most popular size for fiction, comfortable to hold and read",
  },
  BUSINESS: {
    sizeId: "royal_6x9",
    reason: "Professional format with room for charts and diagrams",
  },
  CHILD_BOARD: {
    sizeId: "board_book_5x5",
    reason: "Durable square format perfect for little hands",
  },
  CHILD_PICTURE: {
    sizeId: "picture_book_8x8",
    reason: "Popular square format ideal for illustrations and bedtime reading",
  },
  TECHNICAL: {
    sizeId: "b5_format",
    reason: "Spacious format for technical content and code samples",
  },
  POETRY: {
    sizeId: "hardcover_5x8",
    reason: "Elegant compact size that highlights verse layout",
  },
};

/**
 * Get recommended book size for a use case
 */
export function recommendSize(useCase: UseCase): Recommendation {
  const rec = RECOMMENDATIONS[useCase];
  return {
    useCase,
    sizeId: rec.sizeId,
    reason: rec.reason,
  };
}

/**
 * Get the recommended size object for a use case
 */
export function getRecommendedSize(useCase: UseCase): BookSize | undefined {
  const rec = recommendSize(useCase);
  return getBookSizeById(rec.sizeId);
}

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

/**
 * Check if a size ID is valid
 */
export function isValidSizeId(id: string): boolean {
  return BOOK_SIZES.some((size) => size.id === id);
}

/**
 * Get default size for a category
 */
export function getDefaultSizeForCategory(
  category: BookCategory
): BookSize | undefined {
  const sizes = getBookSizesByCategory(category);
  return sizes[0];
}

/**
 * Check if a size exists in a category
 */
export function sizeExistsInCategory(
  sizeId: string,
  category: BookCategory
): boolean {
  return getBookSizesByCategory(category).some((size) => size.id === sizeId);
}
