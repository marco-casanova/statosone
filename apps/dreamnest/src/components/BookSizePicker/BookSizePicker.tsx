"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  Maximize2,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Sparkles,
} from "lucide-react";
import {
  BookSize,
  BookCategory,
  Unit,
  UseCase,
  BookSizePickerProps,
  CATEGORY_INFO,
  CATEGORY_ORDER,
  getBookSizeById,
  getBookSizesByCategory,
  formatSize,
  formatSizeBoth,
  getAspectRatioLabel,
  recommendSize,
  sizeExistsInCategory,
  getDefaultSizeForCategory,
} from "@/domain/book-sizes";

interface BookSizePickerFullProps extends BookSizePickerProps {
  showRecommendation?: boolean;
  compact?: boolean;
}

export function BookSizePicker({
  valueId,
  onChange,
  defaultCategory = "CHILDREN",
  unit = "cm",
  useCase,
  disabled = false,
  showRecommendation = true,
  compact = false,
}: BookSizePickerFullProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<BookCategory>(defaultCategory);
  const [displayUnit, setDisplayUnit] = useState<Unit>(unit);
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Get sizes for current category
  const categorySizes = useMemo(
    () => getBookSizesByCategory(selectedCategory),
    [selectedCategory]
  );

  // Get currently selected size
  const selectedSize = useMemo(
    () => (valueId ? getBookSizeById(valueId) : undefined),
    [valueId]
  );

  // Get recommendation if use case is provided
  const recommendation = useMemo(
    () => (useCase ? recommendSize(useCase) : undefined),
    [useCase]
  );

  // Auto-select first size if none selected
  useEffect(() => {
    if (!valueId && categorySizes.length > 0) {
      // If we have a use case recommendation, try to use it
      if (recommendation) {
        const recSize = getBookSizeById(recommendation.sizeId);
        if (recSize) {
          onChange(recSize);
          // Also switch to the recommended size's category
          setSelectedCategory(recSize.category);
          return;
        }
      }
      // Otherwise select first in category
      onChange(categorySizes[0]);
    }
  }, [valueId, categorySizes, recommendation, onChange]);

  // Handle category change
  const handleCategoryChange = useCallback(
    (category: BookCategory) => {
      setSelectedCategory(category);
      // Keep selection if it exists in new category, otherwise select first
      if (valueId && sizeExistsInCategory(valueId, category)) {
        // Selection is valid in new category
        return;
      }
      // Select first size in new category
      const defaultSize = getDefaultSizeForCategory(category);
      if (defaultSize) {
        onChange(defaultSize);
      }
    },
    [valueId, onChange]
  );

  // Handle size selection
  const handleSizeSelect = useCallback(
    (size: BookSize) => {
      onChange(size);
    },
    [onChange]
  );

  // Toggle unit display
  const toggleUnit = useCallback(() => {
    setDisplayUnit((u) => (u === "cm" ? "in" : "cm"));
  }, []);

  // Get aspect ratio icon
  const getAspectIcon = (size: BookSize) => {
    const ratio = getAspectRatioLabel(size);
    if (ratio === "Square") return <Square className="h-4 w-4" />;
    if (ratio === "Landscape")
      return <RectangleHorizontal className="h-4 w-4" />;
    return <RectangleVertical className="h-4 w-4" />;
  };

  // Compact view (dropdown style)
  if (compact && !isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-amber-200 rounded-xl hover:border-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Select book size"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-amber-600" />
          <div className="text-left">
            <div className="font-medium text-amber-900">
              {selectedSize?.name || "Select Size"}
            </div>
            {selectedSize && (
              <div className="text-sm text-amber-600">
                {formatSize(selectedSize, displayUnit)}
              </div>
            )}
          </div>
        </div>
        <ChevronDown className="h-5 w-5 text-amber-400" />
      </button>
    );
  }

  return (
    <div
      className={`bg-white border border-amber-200 rounded-xl overflow-hidden ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-600" />
          <span className="font-medium text-amber-900">Book Size</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Unit toggle */}
          <button
            type="button"
            onClick={toggleUnit}
            className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded hover:bg-amber-200 transition-colors"
            aria-label={`Switch to ${
              displayUnit === "cm" ? "inches" : "centimeters"
            }`}
          >
            {displayUnit === "cm" ? "cm → in" : "in → cm"}
          </button>
          {compact && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 text-amber-500 hover:text-amber-700"
              aria-label="Collapse"
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto border-b border-amber-100 scrollbar-hide">
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "text-amber-900 border-b-2 border-amber-500 bg-amber-50"
                : "text-amber-600 hover:text-amber-800 hover:bg-amber-50"
            }`}
            aria-selected={selectedCategory === cat}
            role="tab"
          >
            {CATEGORY_INFO[cat].name}
          </button>
        ))}
      </div>

      {/* Recommendation Banner */}
      {showRecommendation && recommendation && (
        <div className="px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm text-purple-700">
            <span className="font-medium">Recommended:</span>{" "}
            {getBookSizeById(recommendation.sizeId)?.name} —{" "}
            {recommendation.reason}
          </span>
        </div>
      )}

      {/* Size List */}
      <div className="max-h-64 overflow-y-auto" role="listbox">
        {categorySizes.map((size) => {
          const isSelected = valueId === size.id;
          const isRecommended = recommendation?.sizeId === size.id;

          return (
            <button
              key={size.id}
              type="button"
              onClick={() => handleSizeSelect(size)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "bg-amber-100 border-l-4 border-amber-500"
                  : "hover:bg-amber-50 border-l-4 border-transparent"
              }`}
              role="option"
              aria-selected={isSelected}
            >
              {/* Aspect Icon */}
              <div
                className={`text-amber-400 ${
                  isSelected ? "text-amber-600" : ""
                }`}
              >
                {getAspectIcon(size)}
              </div>

              {/* Size Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      isSelected ? "text-amber-900" : "text-amber-800"
                    }`}
                  >
                    {size.name}
                  </span>
                  {isRecommended && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="text-sm text-amber-600">
                  {formatSize(size, displayUnit)}
                  {size.notes && (
                    <span className="text-amber-400"> · {size.notes}</span>
                  )}
                </div>
              </div>

              {/* Selection Check */}
              {isSelected && <Check className="h-5 w-5 text-amber-600" />}
            </button>
          );
        })}
      </div>

      {/* Selected Size Details */}
      {selectedSize && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-amber-900">
                {selectedSize.name}
              </div>
              <div className="text-xs text-amber-600">
                {formatSizeBoth(selectedSize, displayUnit)}
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-500">
              <Maximize2 className="h-4 w-4" />
              <span className="text-xs">
                {getAspectRatioLabel(selectedSize)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookSizePicker;
