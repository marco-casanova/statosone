"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Cloud,
  CloudOff,
  Loader2,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Settings,
  Download,
  Share2,
  Undo2,
  Redo2,
} from "lucide-react";
import { useState } from "react";

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
  status: BookStatus;
  page_count?: number;
  updated_at?: string;
}

interface ModernEditorHeaderProps {
  book: Book;
  isSaving: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenSettings?: () => void;
  onOpenExport?: () => void;
  onOpenShare?: () => void;
}

const STATUS_CONFIG: Record<
  BookStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Draft",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: <Clock className="w-3 h-3" />,
  },
  pending_review: {
    label: "Pending Review",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    icon: <Clock className="w-3 h-3" />,
  },
  in_review: {
    label: "In Review",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  published: {
    label: "Published",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: <CloudOff className="w-3 h-3" />,
  },
  archived: {
    label: "Archived",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: <Cloud className="w-3 h-3" />,
  },
};

export function ModernEditorHeader({
  book,
  isSaving,
  hasChanges,
  onSave,
  onPreview,
  onPublish,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onOpenSettings,
  onOpenExport,
  onOpenShare,
}: ModernEditorHeaderProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const statusConfig = STATUS_CONFIG[book.status];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-purple-100 flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <Link
          href="/author"
          className="p-2 hover:bg-purple-50 rounded-xl transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-purple-600 transition-colors" />
        </Link>

        {/* Divider */}
        <div className="h-8 w-px bg-purple-100" />

        {/* Book Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg">
            📖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-gray-900 max-w-[200px] truncate">
                {book.title}
              </h1>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{book.page_count ?? 0} pages</span>
              <span>•</span>
              <span>
                {book.updated_at
                  ? formatDate(book.updated_at)
                  : "Not saved yet"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Section - Save Status */}
      <div className="flex items-center gap-4">
        {/* Undo/Redo */}
        {(onUndo || onRedo) && (
          <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition-colors ${
                canUndo
                  ? "hover:bg-gray-100 text-gray-600"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition-colors ${
                canRedo
                  ? "hover:bg-gray-100 text-gray-600"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Save Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
              <span className="text-sm text-gray-600">Saving...</span>
            </>
          ) : hasChanges ? (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm text-amber-600">Unsaved changes</span>
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">All saved</span>
            </>
          )}
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            hasChanges && !isSaving
              ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
              : "bg-gray-50 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Preview Button */}
        <button
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-colors border border-purple-200"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        {/* Publish Button */}
        <button
          onClick={onPublish}
          disabled={book.status === "published" || book.status === "in_review"}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            book.status === "published" || book.status === "in_review"
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg"
          }`}
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">
            {book.status === "published"
              ? "Published"
              : book.status === "in_review"
              ? "In Review"
              : "Publish"}
          </span>
        </button>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>

          {showMoreMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMoreMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenSettings?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4" />
                  Book Settings
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenExport?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenShare?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
