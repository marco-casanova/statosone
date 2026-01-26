/**
 * Canonical Book Sizes Dataset
 * Classic trim sizes for various book categories
 */

import { BookSize, BookCategory } from "./types";

export const BOOK_SIZES: BookSize[] = [
  // ============================================================
  // FICTION / NOVELS
  // ============================================================
  {
    id: "mass_market_pb",
    name: "Mass Market Paperback",
    category: "FICTION",
    widthIn: 4.25,
    heightIn: 6.87,
    widthCm: 10.8,
    heightCm: 17.5,
    notes: "Compact, pocket-sized format",
    tags: ["novel", "portable", "pocket"],
  },
  {
    id: "trade_pb_5x8",
    name: "Trade Paperback (US)",
    category: "FICTION",
    widthIn: 5,
    heightIn: 8,
    widthCm: 12.7,
    heightCm: 20.3,
    notes: "Most popular fiction size",
    tags: ["novel", "popular", "standard"],
  },
  {
    id: "trade_pb_5_5x8_5",
    name: "Trade Paperback (Alt)",
    category: "FICTION",
    widthIn: 5.5,
    heightIn: 8.5,
    widthCm: 14.0,
    heightCm: 21.6,
    notes: "Slightly larger trade format",
    tags: ["novel", "trade"],
  },
  {
    id: "a_format_uk",
    name: "A-format (UK/EU)",
    category: "FICTION",
    widthIn: 4.33,
    heightIn: 7.09,
    widthCm: 11.0,
    heightCm: 18.0,
    notes: "Standard UK paperback size",
    tags: ["novel", "uk", "eu", "paperback"],
  },

  // ============================================================
  // NON-FICTION / BUSINESS
  // ============================================================
  {
    id: "trade_nf_5_5x8_5",
    name: "Trade Paperback",
    category: "NON_FICTION",
    widthIn: 5.5,
    heightIn: 8.5,
    widthCm: 14.0,
    heightCm: 21.6,
    notes: "Common non-fiction format",
    tags: ["business", "self-help", "trade"],
  },
  {
    id: "royal_6x9",
    name: "Royal",
    category: "NON_FICTION",
    widthIn: 6,
    heightIn: 9,
    widthCm: 15.2,
    heightCm: 22.9,
    notes: "Professional, spacious layout",
    tags: ["business", "professional", "textbook"],
  },
  {
    id: "b5_format",
    name: "B5",
    category: "NON_FICTION",
    widthIn: 6.93,
    heightIn: 9.84,
    widthCm: 17.6,
    heightCm: 25.0,
    notes: "Technical and academic books",
    tags: ["technical", "academic", "iso"],
  },

  // ============================================================
  // HARDCOVER
  // ============================================================
  {
    id: "hardcover_6x9",
    name: "Standard Hardcover",
    category: "HARDCOVER",
    widthIn: 6,
    heightIn: 9,
    widthCm: 15.2,
    heightCm: 22.9,
    notes: "Classic hardcover dimensions",
    tags: ["hardcover", "standard", "gift"],
  },
  {
    id: "hardcover_7x10",
    name: "Large Hardcover",
    category: "HARDCOVER",
    widthIn: 7,
    heightIn: 10,
    widthCm: 17.8,
    heightCm: 25.4,
    notes: "Premium, coffee table style",
    tags: ["hardcover", "large", "premium", "coffee-table"],
  },
  {
    id: "hardcover_5x8",
    name: "Small Hardcover",
    category: "HARDCOVER",
    widthIn: 5,
    heightIn: 8,
    widthCm: 12.7,
    heightCm: 20.3,
    notes: "Compact hardcover edition",
    tags: ["hardcover", "small", "compact", "poetry"],
  },

  // ============================================================
  // CHILDREN'S BOOKS
  // ============================================================
  {
    id: "board_book_5x5",
    name: "Board Book",
    category: "CHILDREN",
    widthIn: 5,
    heightIn: 5,
    widthCm: 12.7,
    heightCm: 12.7,
    notes: "Durable for toddlers, square format",
    tags: ["children", "board", "toddler", "square", "baby"],
  },
  {
    id: "picture_book_8x8",
    name: "Square Picture Book",
    category: "CHILDREN",
    widthIn: 8,
    heightIn: 8,
    widthCm: 20.0,
    heightCm: 20.0,
    notes: "Popular picture book format",
    tags: ["children", "picture", "square", "illustrated"],
  },
  {
    id: "picture_book_8_5x11",
    name: "Large Picture Book",
    category: "CHILDREN",
    widthIn: 8.5,
    heightIn: 11,
    widthCm: 21.6,
    heightCm: 27.9,
    notes: "Full-page illustrations",
    tags: ["children", "picture", "large", "illustrated", "landscape"],
  },
  {
    id: "picture_book_10x8",
    name: "Landscape Picture Book",
    category: "CHILDREN",
    widthIn: 10,
    heightIn: 8,
    widthCm: 25.4,
    heightCm: 20.3,
    notes: "Wide format for panoramic art",
    tags: ["children", "picture", "landscape", "wide"],
  },
  {
    id: "picture_book_7x10",
    name: "Standard Picture Book",
    category: "CHILDREN",
    widthIn: 7,
    heightIn: 10,
    widthCm: 17.8,
    heightCm: 25.4,
    notes: "Classic children's book size",
    tags: ["children", "picture", "standard", "classic"],
  },

  // ============================================================
  // ISO / EU FORMATS
  // ============================================================
  {
    id: "iso_a6",
    name: "A6",
    category: "ISO_EU",
    widthIn: 4.1,
    heightIn: 5.8,
    widthCm: 10.5,
    heightCm: 14.8,
    notes: "Pocket-sized ISO format",
    tags: ["iso", "eu", "pocket", "small"],
  },
  {
    id: "iso_a5",
    name: "A5",
    category: "ISO_EU",
    widthIn: 5.8,
    heightIn: 8.3,
    widthCm: 14.8,
    heightCm: 21.0,
    notes: "Standard EU book format",
    tags: ["iso", "eu", "standard", "paperback"],
  },
  {
    id: "iso_a4",
    name: "A4",
    category: "ISO_EU",
    widthIn: 8.27,
    heightIn: 11.7,
    widthCm: 21.0,
    heightCm: 29.7,
    notes: "Large format, manuals & workbooks",
    tags: ["iso", "eu", "large", "manual", "workbook"],
  },
];

/**
 * Category display names and descriptions
 */
export const CATEGORY_INFO: Record<
  BookCategory,
  { name: string; description: string }
> = {
  FICTION: {
    name: "Fiction / Novels",
    description: "Standard sizes for novels and fiction paperbacks",
  },
  NON_FICTION: {
    name: "Non-Fiction / Business",
    description: "Professional and business book formats",
  },
  HARDCOVER: {
    name: "Hardcover",
    description: "Premium hardcover editions",
  },
  CHILDREN: {
    name: "Children's Books",
    description: "Picture books and board books for kids",
  },
  ISO_EU: {
    name: "ISO / European",
    description: "International standard paper sizes",
  },
};

/**
 * Ordered list of categories for UI display
 */
export const CATEGORY_ORDER: BookCategory[] = [
  "CHILDREN",
  "FICTION",
  "NON_FICTION",
  "HARDCOVER",
  "ISO_EU",
];
