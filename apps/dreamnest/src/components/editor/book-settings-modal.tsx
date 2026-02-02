"use client";

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  Book,
  Ruler,
  Languages,
  Users,
  LayoutTemplate,
} from "lucide-react";
import { BookSizePicker } from "@/components/BookSizePicker";
import { BookSize, getBookSizeById, formatSizeBoth } from "@/domain/book-sizes";
import { BookTemplateConfigurator } from "./book-template-configurator";
import { type TemplateId } from "@/domain/templates";

type BookStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "in_review"
  | "archived";

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  description?: string | null;
  age_min?: number;
  age_max?: number;
  language?: string;
  trim_size?: string | null;
  primary_template_id?: string | null;
  secondary_template_id?: string | null;
  design_width?: number;
  design_height?: number;
  status?: BookStatus;
}

interface BookSettingsModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Book>) => Promise<void>;
}

const AGE_RANGES = [
  { min: 0, max: 2, label: "0-2 years (Baby)" },
  { min: 2, max: 4, label: "2-4 years (Toddler)" },
  { min: 4, max: 6, label: "4-6 years (Preschool)" },
  { min: 6, max: 8, label: "6-8 years (Early Reader)" },
  { min: 8, max: 12, label: "8-12 years (Middle Grade)" },
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
];

export function BookSettingsModal({
  book,
  isOpen,
  onClose,
  onSave,
}: BookSettingsModalProps) {
  const [title, setTitle] = useState(book.title);
  const [subtitle, setSubtitle] = useState(book.subtitle || "");
  const [description, setDescription] = useState(book.description || "");
  const [ageMin, setAgeMin] = useState(book.age_min ?? 4);
  const [ageMax, setAgeMax] = useState(book.age_max ?? 8);
  const [language, setLanguage] = useState(book.language || "en");
  const [selectedSize, setSelectedSize] = useState<BookSize | undefined>(
    book.trim_size ? getBookSizeById(book.trim_size) : undefined
  );
  const [primaryTemplateId, setPrimaryTemplateId] = useState<TemplateId | null>(
    (book.primary_template_id as TemplateId) || null
  );
  const [secondaryTemplateId, setSecondaryTemplateId] =
    useState<TemplateId | null>(
      (book.secondary_template_id as TemplateId) || null
    );
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "size" | "template" | "audience"
  >("general");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(book.title);
      setSubtitle(book.subtitle || "");
      setDescription(book.description || "");
      setAgeMin(book.age_min ?? 4);
      setAgeMax(book.age_max ?? 8);
      setLanguage(book.language || "en");
      setSelectedSize(
        book.trim_size ? getBookSizeById(book.trim_size) : undefined
      );
      setPrimaryTemplateId((book.primary_template_id as TemplateId) || null);
      setSecondaryTemplateId(
        (book.secondary_template_id as TemplateId) || null
      );
    }
  }, [isOpen, book]);

  const handleAgeRangeChange = (min: number, max: number) => {
    setAgeMin(min);
    setAgeMax(max);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: Partial<Book> = {
        title,
        subtitle: subtitle || null,
        description: description || null,
        age_min: ageMin,
        age_max: ageMax,
        language,
        primary_template_id: primaryTemplateId,
        secondary_template_id: secondaryTemplateId,
      };

      // Add trim size if selected
      if (selectedSize) {
        updates.trim_size = selectedSize.id;
        // Also update design dimensions based on trim size (convert cm to pixels at 96 DPI)
        // Using a scale factor for nice canvas dimensions
        const scaleFactor = 100; // 1cm = 100px for design
        updates.design_width = Math.round(selectedSize.widthCm * scaleFactor);
        updates.design_height = Math.round(selectedSize.heightCm * scaleFactor);
      }

      await onSave(updates);
      onClose();
    } catch (error) {
      console.error("Error saving book settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90vw] max-w-5xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Book Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "general"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Book className="w-4 h-4" />
            General
          </button>
          <button
            onClick={() => setActiveTab("size")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "size"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Ruler className="w-4 h-4" />
            Size
          </button>
          <button
            onClick={() => setActiveTab("template")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "template"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => setActiveTab("audience")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "audience"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Audience
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                  placeholder="Enter book title"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subtitle (optional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                  placeholder="Enter subtitle"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none resize-none"
                  placeholder="Describe your book..."
                />
                <p className="text-xs text-gray-400">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Languages className="w-4 h-4 inline mr-1" />
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none bg-white"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Size Tab */}
          {activeTab === "size" && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-700">
                  Choose the print size for your book. This affects the layout
                  and how your book will look when exported or printed.
                </p>
              </div>

              <BookSizePicker
                valueId={selectedSize?.id}
                onChange={setSelectedSize}
                defaultCategory="CHILDREN"
                unit="cm"
                useCase="CHILD_PICTURE"
                showRecommendation={true}
              />

              {/* Current Size Info */}
              {selectedSize && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700">
                    Selected: {selectedSize.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatSizeBoth(selectedSize, "cm")}
                  </p>
                  {selectedSize.notes && (
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedSize.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Template Tab */}
          {activeTab === "template" && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-700">
                  Choose templates for your book. Every book must have a primary
                  template, and you can optionally add a secondary template for
                  variety. Only certain template combinations are allowed based
                  on the age group.
                </p>
              </div>

              <BookTemplateConfigurator
                ageMin={ageMin}
                ageMax={ageMax}
                primaryTemplateId={primaryTemplateId}
                secondaryTemplateId={secondaryTemplateId}
                onPrimaryChange={setPrimaryTemplateId}
                onSecondaryChange={setSecondaryTemplateId}
              />
            </div>
          )}

          {/* Audience Tab */}
          {activeTab === "audience" && (
            <div className="space-y-6">
              {/* Age Range */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Target Age Range
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {AGE_RANGES.map((range) => (
                    <button
                      key={`${range.min}-${range.max}`}
                      onClick={() => handleAgeRangeChange(range.min, range.max)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        ageMin === range.min && ageMax === range.max
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          ageMin === range.min && ageMax === range.max
                            ? "border-purple-500"
                            : "border-gray-300"
                        }`}
                      >
                        {ageMin === range.min && ageMax === range.max && (
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        )}
                      </div>
                      <span className="font-medium">{range.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Age Range */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-3">
                  Or set a custom age range:
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Min Age
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={18}
                      value={ageMin}
                      onChange={(e) => setAgeMin(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    />
                  </div>
                  <span className="text-gray-400 mt-5">to</span>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Max Age
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={18}
                      value={ageMax}
                      onChange={(e) => setAgeMax(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookSettingsModal;
