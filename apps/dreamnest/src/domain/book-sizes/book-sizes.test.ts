/**
 * Book Sizes Unit Tests
 * Tests for conversion, lookups, formatting, and recommendations
 *
 * To run these tests, install vitest:
 * pnpm add -D vitest
 *
 * Then add to package.json scripts:
 * "test": "vitest"
 */

// @ts-nocheck - Tests require vitest to be installed
import { describe, it, expect } from "vitest";
import {
  // Conversion
  inToCm,
  cmToIn,
  // Lookups
  getBookSizeById,
  getBookSizesByCategory,
  searchBookSizes,
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
  sizeExistsInCategory,
  // Data
  BOOK_SIZES,
} from "./index";

// ============================================================
// CONVERSION TESTS
// ============================================================

describe("inToCm", () => {
  it("converts inches to cm with 1 decimal precision", () => {
    expect(inToCm(1)).toBe(2.5);
    expect(inToCm(5)).toBe(12.7);
    expect(inToCm(8)).toBe(20.3);
    expect(inToCm(11)).toBe(27.9);
  });

  it("handles zero", () => {
    expect(inToCm(0)).toBe(0);
  });

  it("handles decimal inches", () => {
    expect(inToCm(5.5)).toBe(14.0);
    expect(inToCm(8.5)).toBe(21.6);
  });
});

describe("cmToIn", () => {
  it("converts cm to inches with 2 decimal precision", () => {
    expect(cmToIn(2.54)).toBe(1);
    expect(cmToIn(12.7)).toBe(5);
    expect(cmToIn(20.3)).toBe(7.99);
    expect(cmToIn(27.9)).toBe(10.98);
  });

  it("handles zero", () => {
    expect(cmToIn(0)).toBe(0);
  });

  it("handles common book dimensions", () => {
    expect(cmToIn(21.0)).toBe(8.27);
    expect(cmToIn(29.7)).toBe(11.69);
  });
});

// ============================================================
// LOOKUP TESTS
// ============================================================

describe("getBookSizeById", () => {
  it("returns correct size for valid ID", () => {
    const size = getBookSizeById("trade_pb_5x8");
    expect(size).toBeDefined();
    expect(size?.name).toBe("Trade Paperback (US)");
    expect(size?.widthIn).toBe(5);
    expect(size?.heightIn).toBe(8);
  });

  it("returns undefined for invalid ID", () => {
    expect(getBookSizeById("invalid_id")).toBeUndefined();
    expect(getBookSizeById("")).toBeUndefined();
  });

  it("finds children's book sizes", () => {
    const boardBook = getBookSizeById("board_book_5x5");
    expect(boardBook?.category).toBe("CHILDREN");
    expect(boardBook?.widthIn).toBe(5);
    expect(boardBook?.heightIn).toBe(5);

    const pictureBook = getBookSizeById("picture_book_8x8");
    expect(pictureBook?.category).toBe("CHILDREN");
  });
});

describe("getBookSizesByCategory", () => {
  it("returns all sizes in CHILDREN category", () => {
    const children = getBookSizesByCategory("CHILDREN");
    expect(children.length).toBeGreaterThan(0);
    expect(children.every((s) => s.category === "CHILDREN")).toBe(true);
  });

  it("returns all sizes in FICTION category", () => {
    const fiction = getBookSizesByCategory("FICTION");
    expect(fiction.length).toBeGreaterThan(0);
    expect(fiction.every((s) => s.category === "FICTION")).toBe(true);
  });

  it("returns empty array for non-existent category", () => {
    // @ts-expect-error Testing invalid category
    const invalid = getBookSizesByCategory("INVALID");
    expect(invalid).toEqual([]);
  });
});

describe("searchBookSizes", () => {
  it("finds sizes by name", () => {
    const results = searchBookSizes("paperback");
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some((s) => s.name.toLowerCase().includes("paperback"))
    ).toBe(true);
  });

  it("finds sizes by tag", () => {
    const results = searchBookSizes("children");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((s) => s.category === "CHILDREN")).toBe(true);
  });

  it("finds sizes by notes", () => {
    const results = searchBookSizes("toddler");
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns all sizes for empty query", () => {
    const results = searchBookSizes("");
    expect(results).toEqual(BOOK_SIZES);
  });

  it("is case-insensitive", () => {
    const upper = searchBookSizes("PAPERBACK");
    const lower = searchBookSizes("paperback");
    expect(upper).toEqual(lower);
  });
});

// ============================================================
// FORMATTING TESTS
// ============================================================

describe("formatSize", () => {
  it("formats in inches correctly", () => {
    const size = getBookSizeById("trade_pb_5x8")!;
    expect(formatSize(size, "in")).toBe("5 × 8 in");
  });

  it("formats in cm correctly", () => {
    const size = getBookSizeById("trade_pb_5x8")!;
    expect(formatSize(size, "cm")).toBe("12.7 × 20.3 cm");
  });

  it("handles square sizes", () => {
    const size = getBookSizeById("board_book_5x5")!;
    expect(formatSize(size, "in")).toBe("5 × 5 in");
    expect(formatSize(size, "cm")).toBe("12.7 × 12.7 cm");
  });
});

describe("formatSizeBoth", () => {
  it("formats with inches primary", () => {
    const size = getBookSizeById("trade_pb_5x8")!;
    expect(formatSizeBoth(size, "in")).toBe("5 × 8 in (12.7 × 20.3 cm)");
  });

  it("formats with cm primary", () => {
    const size = getBookSizeById("trade_pb_5x8")!;
    expect(formatSizeBoth(size, "cm")).toBe("12.7 × 20.3 cm (5 × 8 in)");
  });
});

describe("formatSizeShort", () => {
  it("formats short in inches", () => {
    const size = getBookSizeById("trade_pb_5x8")!;
    expect(formatSizeShort(size, "in")).toBe("5×8");
  });

  it("formats short in cm", () => {
    const size = getBookSizeById("trade_pb_5x8")!;
    expect(formatSizeShort(size, "cm")).toBe("12.7×20.3");
  });
});

describe("getAspectRatioLabel", () => {
  it("identifies square sizes", () => {
    const square = getBookSizeById("board_book_5x5")!;
    expect(getAspectRatioLabel(square)).toBe("Square");
  });

  it("identifies portrait sizes", () => {
    const portrait = getBookSizeById("trade_pb_5x8")!;
    expect(getAspectRatioLabel(portrait)).toBe("Portrait");
  });

  it("identifies landscape sizes", () => {
    const landscape = getBookSizeById("picture_book_10x8")!;
    expect(getAspectRatioLabel(landscape)).toBe("Landscape");
  });
});

// ============================================================
// RECOMMENDATION TESTS
// ============================================================

describe("recommendSize", () => {
  it("recommends trade paperback for novels", () => {
    const rec = recommendSize("NOVEL");
    expect(rec.useCase).toBe("NOVEL");
    expect(rec.sizeId).toBe("trade_pb_5x8");
    expect(rec.reason).toBeTruthy();
  });

  it("recommends royal for business books", () => {
    const rec = recommendSize("BUSINESS");
    expect(rec.sizeId).toBe("royal_6x9");
  });

  it("recommends board book for toddlers", () => {
    const rec = recommendSize("CHILD_BOARD");
    expect(rec.sizeId).toBe("board_book_5x5");
  });

  it("recommends square picture book for children", () => {
    const rec = recommendSize("CHILD_PICTURE");
    expect(rec.sizeId).toBe("picture_book_8x8");
  });

  it("recommends B5 for technical books", () => {
    const rec = recommendSize("TECHNICAL");
    expect(rec.sizeId).toBe("b5_format");
  });

  it("recommends small hardcover for poetry", () => {
    const rec = recommendSize("POETRY");
    expect(rec.sizeId).toBe("hardcover_5x8");
  });

  it("all recommendations have valid size IDs", () => {
    const useCases: Array<
      | "NOVEL"
      | "BUSINESS"
      | "CHILD_BOARD"
      | "CHILD_PICTURE"
      | "TECHNICAL"
      | "POETRY"
    > = [
      "NOVEL",
      "BUSINESS",
      "CHILD_BOARD",
      "CHILD_PICTURE",
      "TECHNICAL",
      "POETRY",
    ];

    useCases.forEach((useCase) => {
      const rec = recommendSize(useCase);
      const size = getBookSizeById(rec.sizeId);
      expect(size).toBeDefined();
    });
  });
});

describe("getRecommendedSize", () => {
  it("returns full size object for use case", () => {
    const size = getRecommendedSize("CHILD_PICTURE");
    expect(size).toBeDefined();
    expect(size?.id).toBe("picture_book_8x8");
    expect(size?.category).toBe("CHILDREN");
  });
});

// ============================================================
// VALIDATION TESTS
// ============================================================

describe("isValidSizeId", () => {
  it("returns true for valid IDs", () => {
    expect(isValidSizeId("trade_pb_5x8")).toBe(true);
    expect(isValidSizeId("board_book_5x5")).toBe(true);
    expect(isValidSizeId("iso_a5")).toBe(true);
  });

  it("returns false for invalid IDs", () => {
    expect(isValidSizeId("invalid")).toBe(false);
    expect(isValidSizeId("")).toBe(false);
    expect(isValidSizeId("TRADE_PB_5X8")).toBe(false); // case sensitive
  });
});

describe("sizeExistsInCategory", () => {
  it("returns true when size exists in category", () => {
    expect(sizeExistsInCategory("board_book_5x5", "CHILDREN")).toBe(true);
    expect(sizeExistsInCategory("trade_pb_5x8", "FICTION")).toBe(true);
  });

  it("returns false when size does not exist in category", () => {
    expect(sizeExistsInCategory("board_book_5x5", "FICTION")).toBe(false);
    expect(sizeExistsInCategory("trade_pb_5x8", "CHILDREN")).toBe(false);
  });
});

// ============================================================
// DATA INTEGRITY TESTS
// ============================================================

describe("BOOK_SIZES data integrity", () => {
  it("all sizes have unique IDs", () => {
    const ids = BOOK_SIZES.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all sizes have required fields", () => {
    BOOK_SIZES.forEach((size) => {
      expect(size.id).toBeTruthy();
      expect(size.name).toBeTruthy();
      expect(size.category).toBeTruthy();
      expect(typeof size.widthIn).toBe("number");
      expect(typeof size.heightIn).toBe("number");
      expect(typeof size.widthCm).toBe("number");
      expect(typeof size.heightCm).toBe("number");
    });
  });

  it("all dimensions are positive", () => {
    BOOK_SIZES.forEach((size) => {
      expect(size.widthIn).toBeGreaterThan(0);
      expect(size.heightIn).toBeGreaterThan(0);
      expect(size.widthCm).toBeGreaterThan(0);
      expect(size.heightCm).toBeGreaterThan(0);
    });
  });

  it("inch and cm values are consistent", () => {
    BOOK_SIZES.forEach((size) => {
      // Allow for small rounding differences (0.5 cm tolerance)
      const expectedWidthCm = inToCm(size.widthIn);
      const expectedHeightCm = inToCm(size.heightIn);
      expect(Math.abs(size.widthCm - expectedWidthCm)).toBeLessThan(0.5);
      expect(Math.abs(size.heightCm - expectedHeightCm)).toBeLessThan(0.5);
    });
  });
});
