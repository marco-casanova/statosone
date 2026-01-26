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
    isCover: boolean
  ): string | null => {
    // For cover page, use book's cover image
    if (isCover) {
      if (book?.cover_image_url) {
        return book.cover_image_url;
      }
      if (book?.cover_asset_id) {
        const coverAsset = assets.find((a) => a.id === book.cover_asset_id);
        if (coverAsset) {
          return getAssetPublicUrl(coverAsset.file_path);
        }
      }
      return null;
    }

    // For regular pages, use background_asset_id
    if (page.background_asset_id) {
      const bgAsset = assets.find((a) => a.id === page.background_asset_id);
      if (bgAsset) {
        return getAssetPublicUrl(bgAsset.file_path);
      }
    }
    return null;
  };

  const getBlockIndicators = (blocks: { type: string }[]) => {
    const types = blocks.reduce((acc, block) => {
      acc[block.type] = (acc[block.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
      <div className="p-4 border-b border-purple-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-800">Pages</h2>
          </div>
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            {pages.length}
          </span>
        </div>
        <p className="text-xs text-gray-500">Drag to reorder • Click to edit</p>
      </div>

      {/* Page List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2" ref={dragRef}>
        {pages.map((page, index) => {
          const isSelected = selectedIndex === index;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;
          const isCover = index === 0;
          const blockIndicators = getBlockIndicators(page.blocks);
          const backgroundImage = getPageBackgroundImage(page, isCover);

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
              className={`group relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                isDragging
                  ? "opacity-40 scale-95"
                  : isDragOver
                  ? "ring-2 ring-purple-400 ring-offset-2 scale-[1.02]"
                  : isSelected
                  ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20"
                  : "hover:ring-2 hover:ring-purple-200 hover:shadow-md"
              }`}
            >
              {/* Thumbnail */}
              <div
                className="aspect-[4/3] relative"
                style={getPagePreviewStyle(page, isCover)}
              >
                {/* Background Image */}
                {backgroundImage && (
                  <Image
                    src={backgroundImage}
                    alt={isCover ? "Cover preview" : `Page ${index} preview`}
                    fill
                    className="object-cover"
                    sizes="180px"
                  />
                )}

                {/* Gradient Overlay for better readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Cover Badge */}
                {isCover && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-semibold rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Cover
                  </div>
                )}

                {/* Page Number */}
                {!isCover && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shadow-md">
                    {index}
                  </div>
                )}

                {/* Drag Handle */}
                {!isCover && (
                  <div className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-gray-500" />
                  </div>
                )}

                {/* Block Count / Indicators */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {blockIndicators.slice(0, 3).map((indicator, i) => (
                      <span
                        key={i}
                        className="text-xs bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md"
                        title={`${indicator.count} ${indicator.type}${
                          indicator.count > 1 ? "s" : ""
                        }`}
                      >
                        {indicator.icon}
                        {indicator.count > 1 && (
                          <span className="text-[10px] ml-0.5 text-gray-600">
                            {indicator.count}
                          </span>
                        )}
                      </span>
                    ))}
                    {blockIndicators.length === 0 && (
                      <span className="text-xs text-white/70">Empty</span>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                {!isCover && pages.length > 1 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onDuplicate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(page.id);
                        }}
                        className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
                        title="Duplicate page"
                      >
                        <Copy className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(page.id);
                      }}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-purple-500 rounded-xl pointer-events-none" />
                )}
              </div>
            </div>
          );
        })}

        {/* Drop zone at the end */}
        {draggedIndex !== null && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(pages.length);
            }}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, pages.length)}
            className={`h-16 border-2 border-dashed rounded-xl transition-colors ${
              dragOverIndex === pages.length
                ? "border-purple-400 bg-purple-50"
                : "border-gray-200"
            }`}
          />
        )}
      </div>

      {/* Add Page Button */}
      <div className="p-3 border-t border-purple-100 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Add New Page
        </button>
      </div>
    </div>
  );
}
