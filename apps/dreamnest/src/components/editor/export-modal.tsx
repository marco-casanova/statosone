"use client";

import { useState } from "react";
import { X, Download, FileImage, FileText, Loader2, Check } from "lucide-react";

interface Book {
  id: string;
  title: string;
}

interface ExportModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = "pdf" | "images" | "epub";

interface ExportOption {
  id: ExportFormat;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: "pdf",
    name: "PDF Document",
    description: "High-quality print-ready PDF",
    icon: <FileText className="w-6 h-6" />,
    available: true,
  },
  {
    id: "images",
    name: "Image Pack",
    description: "Individual PNG images for each page",
    icon: <FileImage className="w-6 h-6" />,
    available: true,
  },
  {
    id: "epub",
    name: "EPUB eBook",
    description: "Digital book format (coming soon)",
    icon: <FileText className="w-6 h-6" />,
    available: false,
  },
];

export function ExportModal({ book, isOpen, onClose }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    try {
      // Simulate export progress
      // In production, this would call an actual export API
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setExportProgress(i);
      }

      // TODO: Implement actual export functionality
      // const response = await fetch(`/api/books/${book.id}/export?format=${selectedFormat}`);
      // const blob = await response.blob();
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `${book.title}.${selectedFormat}`;
      // a.click();

      setExportComplete(true);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setExportComplete(false);
    setExportProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Export Book</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isExporting && !exportComplete ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Choose an export format for &ldquo;{book.title}&rdquo;
              </p>

              {/* Format Options */}
              <div className="space-y-2">
                {EXPORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      option.available && setSelectedFormat(option.id)
                    }
                    disabled={!option.available}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      selectedFormat === option.id && option.available
                        ? "border-purple-500 bg-purple-50"
                        : option.available
                        ? "border-gray-200 hover:border-purple-200 hover:bg-purple-50/50"
                        : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        selectedFormat === option.id && option.available
                          ? "bg-purple-100 text-purple-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className={`font-medium ${
                          selectedFormat === option.id && option.available
                            ? "text-purple-700"
                            : "text-gray-700"
                        }`}
                      >
                        {option.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                    {selectedFormat === option.id && option.available && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : isExporting ? (
            <div className="py-8 text-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Exporting your book...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                {exportProgress}% complete
              </p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Export Complete!
              </p>
              <p className="text-sm text-gray-500">
                Your book has been exported successfully.
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Note: Full export functionality coming soon. This is a preview.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {exportComplete ? "Close" : "Cancel"}
          </button>
          {!isExporting && !exportComplete && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
