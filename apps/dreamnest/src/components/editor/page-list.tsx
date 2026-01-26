"use client";

import { useState } from "react";
import Image from "next/image";

interface Page {
  id: string;
  page_index: number;
  background_color: string;
  blocks: { id: string }[];
}

interface PageListProps {
  pages: Page[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDelete: (pageId: string) => void;
  onReorder: (newOrder: string[]) => void;
}

export function PageList({
  pages,
  selectedIndex,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: PageListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder logic
    const newPages = [...pages];
    const draggedPage = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);

    onReorder(newPages.map((p) => p.id));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {/* Page Thumbnails */}
      <div className="space-y-2">
        {pages.map((page, index) => (
          <div
            key={page.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelect(index)}
            className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              selectedIndex === index
                ? "border-purple-500 shadow-md"
                : "border-transparent hover:border-purple-200"
            } ${draggedIndex === index ? "opacity-50" : ""}`}
          >
            {/* Thumbnail */}
            <div
              className="aspect-[4/3] relative"
              style={{ backgroundColor: page.background_color }}
            >
              {/* Page number badge */}
              <div className="absolute top-1 left-1 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                {index + 1}
              </div>

              {/* Block count indicator */}
              <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/50 rounded text-xs text-white">
                {page.blocks.length} blocks
              </div>

              {/* Delete button (on hover) */}
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(page.id);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Page Button */}
      <button
        onClick={onAdd}
        className="w-full mt-4 py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 font-medium hover:border-purple-500 hover:bg-purple-50 transition-colors"
      >
        + Add Page
      </button>
    </div>
  );
}

function TrashIcon({ className }: { className?: string }) {
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
