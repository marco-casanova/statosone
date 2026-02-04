"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  GripVertical,
  BookOpen,
  Sparkles,
  Copy,
} from "lucide-react";
import { getAssetPublicUrl } from "@/lib/storage";

interface Page {
  id: string;
  page_index: number;
  background_color: string;
  background_asset_id?: string | null;
  blocks: { id: string; type: string }[];
}

interface Asset {
  id: string;
  file_path: string;
  type?: string;
}

interface Book {
  cover_gradient?: string | null;
  cover_image_url?: string | null;
  cover_asset_id?: string | null;
}

interface ModernPageListProps {
  pages: Page[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDelete: (pageId: string) => void;
  onReorder: (newOrder: string[]) => void;
  onDuplicate?: (pageId: string) => void;
  assets?: Asset[];
  book?: Book;
}

export function ModernPageList({
  pages,
  selectedIndex,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
  onDuplicate,
  assets = [],
  book,
}: ModernPageListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";

    // Create custom drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    dragImage.style.opacity = "0.8";
    dragImage.style.transform = "rotate(3deg) scale(0.9)";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 80, 60);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPages = [...pages];
    const draggedPage = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);

    onReorder(newPages.map((p) => p.id));
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getPagePreviewStyle = (page: Page, isCover: boolean) => {
    // For cover page, use book's cover gradient
    if (isCover && book?.cover_gradient) {
      return {
        background: book.cover_gradient,
      };
    }
    // Simple preview based on background color
    return {
      backgroundColor: page.background_color || "#ffffff",
    };
  };

  const getPageBackgroundImage = (
    page: Page,
    isCover: boolean,
  ): { url: string; isVideo: boolean } | null => {
    // For cover page, use book's cover image
    if (isCover) {
      if (book?.cover_image_url) {
        return { url: book.cover_image_url, isVideo: false };
      }
      if (book?.cover_asset_id) {
        const coverAsset = assets.find((a) => a.id === book.cover_asset_id);
        if (coverAsset) {
          return {
            url: getAssetPublicUrl(coverAsset.file_path),
            isVideo:
              coverAsset.type === "video" ||
              coverAsset.file_path.toLowerCase().match(/\.(mp4|mov|webm)$/) !==
                null,
          };
        }
      }
      return null;
    }

    // For regular pages, use background_asset_id
    if (page.background_asset_id) {
      const bgAsset = assets.find((a) => a.id === page.background_asset_id);
      if (bgAsset) {
        return {
          url: getAssetPublicUrl(bgAsset.file_path),
          isVideo:
            bgAsset.type === "video" ||
            bgAsset.file_path.toLowerCase().match(/\.(mp4|mov|webm)$/) !== null,
        };
      }
    }
    return null;
  };

  const getBlockIndicators = (blocks: { type: string }[]) => {
    const types = blocks.reduce(
      (acc, block) => {
        acc[block.type] = (acc[block.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(types).map(([type, count]) => ({
      type,
      count,
      icon: getBlockTypeIcon(type),
    }));
  };

  const getBlockTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      text: "📝",
      image: "🖼️",
      audio: "🎵",
      video: "🎬",
      shape: "⬜",
    };
    return icons[type] || "📦";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-3 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-semibold text-gray-800">Pages</h2>
          </div>
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
            {pages.length}
          </span>
        </div>
      </div>

      {/* Page List - Compact */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5" ref={dragRef}>
        {pages.map((page, index) => {
          const isSelected = selectedIndex === index;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;
          const isCover = index === 0;

          return (
            <div
              key={page.id}
              draggable={!isCover}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelect(index)}
              className={`group relative rounded-lg overflow-hidden transition-all duration-150 cursor-pointer ${
                isDragging
                  ? "opacity-40 scale-95"
                  : isDragOver
                    ? "ring-2 ring-purple-400"
                    : isSelected
                      ? "ring-2 ring-purple-500 bg-purple-50"
                      : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 p-2">
                {/* Page Indicator */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-xs font-semibold ${
                    isSelected
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600"
                  }`}
                >
                  {isCover ? "📖" : index}
                </div>

                {/* Page Label */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 truncate">
                    {isCover ? "Cover" : `Page ${index}`}
                  </div>
                  {page.blocks.length > 0 && (
                    <div className="text-[10px] text-gray-400">
                      {page.blocks.length} block
                      {page.blocks.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!isCover && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onDuplicate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(page.id);
                        }}
                        className="p-1 hover:bg-white rounded transition-colors"
                        title="Duplicate page"
                      >
                        <Copy className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              "Are you sure you want to delete this page?",
                            )
                          ) {
                            onDelete(page.id);
                          }
                        }}
                        className="p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete page"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    )}
                    <div className="cursor-move p-1">
                      <GripVertical className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Page Button */}
      <div className="p-2 border-t border-purple-100">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add New Page
        </button>
      </div>
    </div>
  );
}
