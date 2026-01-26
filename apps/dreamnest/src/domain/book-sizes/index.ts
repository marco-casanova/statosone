/**
 * Book Sizes Module
 * Exports all book size types, data, and utilities
 */

// Types
export type {
  Unit,
  BookCategory,
  UseCase,
  BookSize,
  Recommendation,
  BookSizePickerProps,
} from "./types";

// Data
export { BOOK_SIZES, CATEGORY_INFO, CATEGORY_ORDER } from "./data";

// Utilities
export {
  // Conversion
  inToCm,
  cmToIn,
  // Lookups
  getBookSizeById,
  getBookSizesByCategory,
  searchBookSizes,
  getAllCategories,
  // Formatting
  formatSize,
  formatSizeBoth,
  formatSizeShort,
  getAspectRatioLabel,
  // Recommendations
  recommendSize,
  getRecommendedSize,
  // Validation
  isValidSizeId,
  getDefaultSizeForCategory,
  sizeExistsInCategory,
} from "./utils";
