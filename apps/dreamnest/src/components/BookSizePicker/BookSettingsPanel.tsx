"use client";

import { useState } from "react";
import { BookSizePicker } from "@/components/BookSizePicker";
import { BookSize, getBookSizeById, formatSizeBoth } from "@/domain/book-sizes";
import { Settings, Info } from "lucide-react";

interface BookSettingsPanelProps {
  bookId: string;
  initialTrimSize?: string | null;
  onSave: (trimSize: string) => Promise<void>;
}

/**
 * Example panel showing how to integrate BookSizePicker
 * into book settings/creation flow
 */
export function BookSettingsPanel({
  bookId,
  initialTrimSize,
  onSave,
}: BookSettingsPanelProps) {
  const [selectedSize, setSelectedSize] = useState<BookSize | undefined>(
    initialTrimSize ? getBookSizeById(initialTrimSize) : undefined
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSizeChange = (size: BookSize) => {
    setSelectedSize(size);
    setSavedMessage(null);
  };

  const handleSave = async () => {
    if (!selectedSize) return;

    setIsSaving(true);
    try {
      await onSave(selectedSize.id);
      setSavedMessage("Book size saved!");
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save book size:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-amber-900">Book Settings</h3>
      </div>

      {/* Book Size Picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-amber-800">
          Book Size (Trim Size)
        </label>
        <BookSizePicker
          valueId={selectedSize?.id}
          onChange={handleSizeChange}
          defaultCategory="CHILDREN"
          unit="cm"
          useCase="CHILD_PICTURE"
          showRecommendation={true}
        />
      </div>

      {/* Info Box */}
      {selectedSize && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              {selectedSize.name}
            </p>
            <p className="text-sm text-blue-700">
              {formatSizeBoth(selectedSize, "cm")}
            </p>
            {selectedSize.notes && (
              <p className="text-xs text-blue-600 mt-1">{selectedSize.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={!selectedSize || isSaving}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Book Size"}
        </button>
        {savedMessage && (
          <span className="text-sm text-green-600">{savedMessage}</span>
        )}
      </div>
    </div>
  );
}

export default BookSettingsPanel;
