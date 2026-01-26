"use client";

import Link from "next/link";

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

interface EditorHeaderProps {
  book: Book;
  isSaving: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
}

export function EditorHeader({
  book,
  isSaving,
  hasChanges,
  onSave,
  onPreview,
  onPublish,
}: EditorHeaderProps) {
  const statusColors: Record<BookStatus, string> = {
    draft: "bg-gray-100 text-gray-700",
    pending_review: "bg-yellow-100 text-yellow-700",
    in_review: "bg-yellow-100 text-yellow-700",
    published: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    archived: "bg-gray-100 text-gray-700",
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/author"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-gray-900">{book.title}</h1>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                statusColors[book.status]
              }`}
            >
              {formatStatus(book.status)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {book.page_count ?? 0} pages • Last edited{" "}
            {formatDate(book.updated_at ?? new Date().toISOString())}
          </p>
        </div>
      </div>

      {/* Center: Save Status */}
      <div className="flex items-center gap-2 text-sm">
        {isSaving ? (
          <span className="text-gray-500 flex items-center gap-2">
            <LoadingSpinner className="w-4 h-4" />
            Saving...
          </span>
        ) : hasChanges ? (
          <span className="text-orange-500">• Unsaved changes</span>
        ) : (
          <span className="text-green-500">✓ Saved</span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            hasChanges && !isSaving
              ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
              : "bg-gray-50 text-gray-400 cursor-not-allowed"
          }`}
        >
          Save
        </button>

        <button
          onClick={onPreview}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
        >
          Preview
        </button>

        {book.status === "draft" && (
          <button
            onClick={onPublish}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Submit for Review
          </button>
        )}
      </div>
    </header>
  );
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    draft: "Draft",
    pending_review: "Pending Review",
    published: "Published",
    rejected: "Rejected",
  };
  return labels[status] || status;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
