"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Move,
  Maximize2,
  Trash2,
  Copy,
  Layers,
  Lock,
  Unlock,
} from "lucide-react";
import { getAssetPublicUrl } from "@/lib/storage";
import { getBorderFrame, type BorderFrameId } from "@/domain/border-frames";

interface Page {
  id: string;
  layout_mode: "canvas" | "flow";
  background_color: string;
  background_asset_id?: string | null;
  border_frame_id?: string | null;
  page_text?: string | null;
  blocks: Block[];
}

interface Block {
  id: string;
  type: string;
  content: unknown;
  layout: unknown;
  style: unknown;
  block_index: number;
}

interface Asset {
  id: string;
  file_path: string;
  type?: string;
}

interface ModernCanvasProps {
  page: Page;
  canvasWidth: number;
  canvasHeight: number;
  selectedBlockId: string | null;
  onBlockSelect: (blockId: string | null) => void;
  onBlockMove: (blockId: string, x: number, y: number) => void;
  onBlockMoveEnd?: (blockId: string, x: number, y: number) => void;
  onBlockResize: (blockId: string, width: number, height: number) => void;
  onBlockDelete?: (blockId: string) => void;
  onBlockDuplicate?: (blockId: string) => void;
  onDrop?: (data: { type: string; x: number; y: number }) => void;
  isDraggingElement?: boolean;
  assets?: Asset[];
}

export function ModernCanvas({
  page,
  canvasWidth,
  canvasHeight,
  selectedBlockId,
  onBlockSelect,
  onBlockMove,
  onBlockMoveEnd,
  onBlockResize,
  onBlockDelete,
  onBlockDuplicate,
  onDrop,
  isDraggingElement,
  assets = [],
}: ModernCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    blockId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);
  const [resizing, setResizing] = useState<{
    blockId: string;
    handle: "se" | "e" | "s" | "sw" | "ne" | "nw" | "n" | "w";
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
    initialX: number;
    initialY: number;
  } | null>(null);
  const [showGuides, setShowGuides] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [dropPosition, setDropPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onBlockSelect(null);
    }
  };

  const handleBlockMouseDown = useCallback(
    (
      e: React.MouseEvent,
      blockId: string,
      layout: { x?: number; y?: number },
    ) => {
      e.stopPropagation();
      e.preventDefault();
      onBlockSelect(blockId);

      if (page.layout_mode === "canvas") {
        setDragging({
          blockId,
          startX: e.clientX,
          startY: e.clientY,
          initialX: layout.x || 0,
          initialY: layout.y || 0,
        });
        setShowGuides(true);
      }
    },
    [page.layout_mode, onBlockSelect],
  );

  const handleResizeMouseDown = useCallback(
    (
      e: React.MouseEvent,
      blockId: string,
      handle: "se" | "e" | "s" | "sw" | "ne" | "nw" | "n" | "w",
      layout: { x?: number; y?: number; width?: number; height?: number },
    ) => {
      e.stopPropagation();
      e.preventDefault();

      setResizing({
        blockId,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        initialWidth: layout.width || 0.3,
        initialHeight: layout.height || 0.2,
        initialX: layout.x || 0,
        initialY: layout.y || 0,
      });
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

      if (dragging) {
        const deltaX = (e.clientX - dragging.startX) / rect.width;
        const deltaY = (e.clientY - dragging.startY) / rect.height;

        let newX = dragging.initialX + deltaX;
        let newY = dragging.initialY + deltaY;

        // Snap to center guides
        const snapThreshold = 0.02;
        if (Math.abs(newX + 0.15 - 0.5) < snapThreshold) {
          newX = 0.35; // Snap to horizontal center
        }
        if (Math.abs(newY + 0.1 - 0.5) < snapThreshold) {
          newY = 0.4; // Snap to vertical center
        }

        newX = Math.max(0, Math.min(1, newX));
        newY = Math.max(0, Math.min(1, newY));

        onBlockMove(dragging.blockId, newX, newY);
      }

      if (resizing) {
        const deltaX = (e.clientX - resizing.startX) / rect.width;
        const deltaY = (e.clientY - resizing.startY) / rect.height;

        let newWidth = resizing.initialWidth;
        let newHeight = resizing.initialHeight;

        if (["se", "e", "ne"].includes(resizing.handle)) {
          newWidth = Math.max(
            0.05,
            Math.min(1, resizing.initialWidth + deltaX),
          );
        }
        if (["sw", "w", "nw"].includes(resizing.handle)) {
          newWidth = Math.max(
            0.05,
            Math.min(1, resizing.initialWidth - deltaX),
          );
        }
        if (["se", "s", "sw"].includes(resizing.handle)) {
          newHeight = Math.max(
            0.05,
            Math.min(1, resizing.initialHeight + deltaY),
          );
        }
        if (["ne", "n", "nw"].includes(resizing.handle)) {
          newHeight = Math.max(
            0.05,
            Math.min(1, resizing.initialHeight - deltaY),
          );
        }

        onBlockResize(resizing.blockId, newWidth, newHeight);
      }
    },
    [dragging, resizing, onBlockMove, onBlockResize],
  );

  const handleMouseUp = useCallback(() => {
    if (dragging && onBlockMoveEnd) {
      const block = page.blocks.find((b) => b.id === dragging.blockId);
      if (block) {
        const layout = block.layout as { x?: number; y?: number };
        onBlockMoveEnd(dragging.blockId, layout.x || 0, layout.y || 0);
      }
    }
    setDragging(null);
    setResizing(null);
    setShowGuides(false);
  }, [dragging, onBlockMoveEnd, page.blocks]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDropTarget(true);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDropPosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDropTarget(false);
    setDropPosition(null);
  }, []);

  const handleDropEvent = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDropTarget(false);
      setDropPosition(null);

      if (!canvasRef.current || !onDrop) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      try {
        const data = JSON.parse(e.dataTransfer.getData("application/json"));
        onDrop({ ...data, x, y });
      } catch {
        console.error("Invalid drop data");
      }
    },
    [onDrop],
  );

  const safeWidth = canvasWidth || 1920;
  const safeHeight = canvasHeight || 1080;
  const aspectRatio = safeWidth / safeHeight;
  const renderWidth = Math.min(safeWidth, 1200);
  const renderHeight = aspectRatio > 0 ? renderWidth / aspectRatio : 675;

  // Resolve background image URL from asset_id
  const backgroundImageUrl = page.background_asset_id
    ? (() => {
        const bgAsset = assets.find((a) => a.id === page.background_asset_id);
        return bgAsset ? getAssetPublicUrl(bgAsset.file_path) : null;
      })()
    : null;
  const backgroundIsVideo = (() => {
    if (!page.background_asset_id) return false;
    const bgAsset = assets.find((a) => a.id === page.background_asset_id);
    if (!bgAsset) return false;
    if (bgAsset.type) return bgAsset.type === "video";
    const path = bgAsset.file_path.toLowerCase();
    return (
      path.endsWith(".mp4") || path.endsWith(".mov") || path.endsWith(".webm")
    );
  })();
  const frameClass = getBorderFrame(
    (page.border_frame_id as BorderFrameId | null | undefined) ?? "none",
  ).cssClass;

  return (
    <div className="flex items-center justify-center h-full w-full p-4 overflow-hidden">
      <div
        className={`relative flex justify-center items-center h-full w-full ${frameClass}`}
        style={{
          maxHeight: "calc(100vh - 200px)",
          maxWidth: "calc(100vw - 700px)",
        }}
      >
        <div
          ref={canvasRef}
          className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
            isDropTarget || isDraggingElement
              ? "ring-4 ring-purple-400 ring-offset-4 ring-offset-gray-200 shadow-2xl scale-[1.01]"
              : "shadow-2xl hover:shadow-3xl"
          }`}
          style={{
            width: renderWidth,
            height: renderHeight || 675,
            maxHeight: "calc(100vh - 220px)",
            maxWidth: "100%",
            minHeight: 400,
            backgroundColor: page.background_color,
          }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropEvent}
        >
          {/* Background Media */}
          {backgroundImageUrl &&
            (backgroundIsVideo ? (
              <video
                src={backgroundImageUrl}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backgroundImageUrl}
                alt="Page background"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            ))}

          {/* Canvas Texture Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Grid Overlay - shows when dragging */}
          {(showGuides || isDropTarget) && (
            <div
              className="absolute inset-0 pointer-events-none z-40 transition-opacity duration-200"
              style={{
                backgroundImage: `
                linear-gradient(to right, rgba(147, 51, 234, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(147, 51, 234, 0.08) 1px, transparent 1px)
              `,
                backgroundSize: "5% 5%",
              }}
            />
          )}

          {/* Center guides when dragging */}
          {showGuides && (
            <>
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-purple-500/0 pointer-events-none z-40" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 pointer-events-none z-40" />
            </>
          )}

          {/* Drop Position Indicator */}
          {dropPosition && isDropTarget && (
            <div
              className="absolute w-24 h-16 border-2 border-dashed border-purple-500 rounded-xl bg-purple-500/10 pointer-events-none z-50 transition-all duration-75"
              style={{
                left: `${dropPosition.x * 100}%`,
                top: `${dropPosition.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-purple-600 text-2xl animate-bounce">
                  +
                </span>
              </div>
            </div>
          )}

          {/* Blocks */}
          {page.layout_mode === "canvas" ? (
            <CanvasBlocks
              blocks={page.blocks}
              selectedBlockId={selectedBlockId}
              onMouseDown={handleBlockMouseDown}
              onResizeMouseDown={handleResizeMouseDown}
              onDelete={onBlockDelete}
              onDuplicate={onBlockDuplicate}
              isDragging={!!dragging}
              isResizing={!!resizing}
              assets={assets}
            />
          ) : (
            <FlowBlocks
              blocks={page.blocks}
              selectedBlockId={selectedBlockId}
              onSelect={onBlockSelect}
              assets={assets}
            />
          )}

          {/* Page Text Panel - Shown when page_text exists (soft white panel) */}
          {page.page_text && page.page_text !== "Add text" && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end p-4 pointer-events-none">
              <div
                className="w-full max-w-[90%] rounded-2xl shadow-lg"
                style={{
                  backgroundColor: "rgba(255, 253, 248, 0.95)",
                  padding: "clamp(1rem, 4%, 2rem)",
                }}
              >
                <p
                  className="text-center leading-relaxed"
                  style={{
                    fontFamily:
                      "'Nunito', 'Poppins', 'Quicksand', system-ui, sans-serif",
                    fontSize: "clamp(1.25rem, 2.5vw, 2rem)",
                    fontWeight: 600,
                    color: "#2B2B2B",
                    lineHeight: 1.6,
                  }}
                >
                  {page.page_text}
                </p>
              </div>
            </div>
          )}

          {/* Empty state - no text */}
          {page.blocks.length === 0 && !page.page_text && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center p-8">
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Add text
                </p>
                <p className="text-sm text-gray-400 max-w-xs">
                  Drag elements or edit the Page Text field to add content.
                </p>
              </div>
            </div>
          )}

          {/* Page corner fold effect */}
          <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none overflow-hidden">
            <div
              className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-black/10 to-transparent"
              style={{
                clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasBlocks({
  blocks,
  selectedBlockId,
  onMouseDown,
  onResizeMouseDown,
  onDelete,
  onDuplicate,
  isDragging,
  isResizing,
  assets = [],
}: {
  blocks: Block[];
  selectedBlockId: string | null;
  assets?: Asset[];
  onMouseDown: (
    e: React.MouseEvent,
    blockId: string,
    layout: { x?: number; y?: number },
  ) => void;
  onResizeMouseDown: (
    e: React.MouseEvent,
    blockId: string,
    handle: "se" | "e" | "s" | "sw" | "ne" | "nw" | "n" | "w",
    layout: { x?: number; y?: number; width?: number; height?: number },
  ) => void;
  onDelete?: (blockId: string) => void;
  onDuplicate?: (blockId: string) => void;
  isDragging: boolean;
  isResizing: boolean;
}) {
  const sortedBlocks = [...blocks].sort(
    (a, b) => a.block_index - b.block_index,
  );

  return (
    <>
      {sortedBlocks.map((block) => {
        const layout = block.layout as {
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          z_index?: number;
        };
        const isSelected = block.id === selectedBlockId;

        return (
          <div
            key={block.id}
            className={`absolute group transition-all duration-150 ${
              isSelected ? "z-[100]" : "hover:z-50"
            }`}
            style={{
              left: `${(layout.x || 0) * 100}%`,
              top: `${(layout.y || 0) * 100}%`,
              width: `${(layout.width || 0.3) * 100}%`,
              height: `${(layout.height || 0.2) * 100}%`,
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={(e) => onMouseDown(e, block.id, layout)}
          >
            {/* Block Content */}
            <div
              className={`w-full h-full rounded-xl overflow-hidden transition-all duration-200 ${
                isSelected
                  ? "ring-2 ring-purple-500 shadow-xl shadow-purple-500/20"
                  : "ring-1 ring-black/5 hover:ring-2 hover:ring-purple-300 hover:shadow-lg"
              }`}
            >
              <BlockPreview block={block} assets={assets} />
            </div>

            {/* Selection Overlay */}
            {isSelected && (
              <>
                {/* Block Type Badge */}
                <div className="absolute -top-8 left-0 flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-full shadow-lg capitalize flex items-center gap-1.5">
                    {getBlockIcon(block.type)}
                    {block.type}
                  </span>
                </div>

                {/* Quick Actions */}
                <div className="absolute -top-8 right-0 flex items-center gap-1">
                  {onDuplicate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(block.id);
                      }}
                      className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(block.id);
                      }}
                      className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  )}
                </div>

                {/* Resize Handles */}
                <ResizeHandles
                  layout={layout}
                  onResizeMouseDown={(e, handle) =>
                    onResizeMouseDown(e, block.id, handle, layout)
                  }
                />
              </>
            )}

            {/* Hover indicator for non-selected blocks */}
            {!isSelected && (
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-300/50 transition-colors pointer-events-none" />
            )}
          </div>
        );
      })}
    </>
  );
}

function ResizeHandles({
  layout,
  onResizeMouseDown,
}: {
  layout: { x?: number; y?: number; width?: number; height?: number };
  onResizeMouseDown: (
    e: React.MouseEvent,
    handle: "se" | "e" | "s" | "sw" | "ne" | "nw" | "n" | "w",
  ) => void;
}) {
  const handles = [
    { pos: "nw", cursor: "nw-resize", className: "-top-1.5 -left-1.5" },
    {
      pos: "n",
      cursor: "n-resize",
      className: "-top-1.5 left-1/2 -translate-x-1/2",
    },
    { pos: "ne", cursor: "ne-resize", className: "-top-1.5 -right-1.5" },
    {
      pos: "e",
      cursor: "e-resize",
      className: "top-1/2 -translate-y-1/2 -right-1.5",
    },
    { pos: "se", cursor: "se-resize", className: "-bottom-1.5 -right-1.5" },
    {
      pos: "s",
      cursor: "s-resize",
      className: "-bottom-1.5 left-1/2 -translate-x-1/2",
    },
    { pos: "sw", cursor: "sw-resize", className: "-bottom-1.5 -left-1.5" },
    {
      pos: "w",
      cursor: "w-resize",
      className: "top-1/2 -translate-y-1/2 -left-1.5",
    },
  ];

  return (
    <>
      {handles.map((handle) => (
        <div
          key={handle.pos}
          className={`absolute w-3 h-3 bg-white border-2 border-purple-500 rounded-full shadow-md hover:scale-125 transition-transform ${handle.className}`}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) =>
            onResizeMouseDown(
              e,
              handle.pos as "se" | "e" | "s" | "sw" | "ne" | "nw" | "n" | "w",
            )
          }
        />
      ))}
    </>
  );
}

function FlowBlocks({
  blocks,
  selectedBlockId,
  onSelect,
  assets = [],
}: {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelect: (blockId: string | null) => void;
  assets?: Asset[];
}) {
  const sortedBlocks = [...blocks].sort(
    (a, b) => a.block_index - b.block_index,
  );

  return (
    <div className="p-6 space-y-4">
      {sortedBlocks.map((block) => (
        <div
          key={block.id}
          onClick={() => onSelect(block.id)}
          className={`rounded-xl overflow-hidden cursor-pointer transition-all ${
            selectedBlockId === block.id
              ? "ring-2 ring-purple-500 shadow-lg"
              : "hover:ring-2 hover:ring-purple-300 hover:shadow-md"
          }`}
        >
          <BlockPreview block={block} assets={assets} />
        </div>
      ))}
    </div>
  );
}

function BlockPreview({
  block,
  assets = [],
}: {
  block: Block;
  assets?: Asset[];
}) {
  const content = block.content as Record<string, unknown>;
  const style = block.style as Record<string, unknown>;

  // Helper to resolve asset URL from either src or asset_id
  const resolveImageSrc = (): string | null => {
    // If src is already set and is a full URL, use it
    if (content?.src) {
      const src = content.src as string;
      if (src.startsWith("http")) return src;
      // If it's a relative path, convert to full URL
      return getAssetPublicUrl(src);
    }
    // If we have an asset_id, look it up in assets array
    if (content?.asset_id && assets.length > 0) {
      const asset = assets.find((a) => a.id === content.asset_id);
      if (asset) {
        return getAssetPublicUrl(asset.file_path);
      }
    }
    return null;
  };

  switch (block.type) {
    case "text": {
      // Compute background color with opacity
      let bgColor = (style?.background_color as string) || "transparent";
      let opacity =
        typeof style?.background_opacity === "number"
          ? style.background_opacity
          : 1;
      // If color is hex and opacity < 1, convert to rgba
      if (bgColor.startsWith("#") && opacity < 1) {
        const hex = bgColor.replace("#", "");
        const bigint = parseInt(hex, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        bgColor = `rgba(${r},${g},${b},${opacity})`;
      } else if (bgColor.startsWith("rgb") && opacity < 1) {
        // If already rgb/rgba, just replace alpha
        bgColor = bgColor.replace(/rgba?\(([^)]+)\)/, (match, colorVals) => {
          const parts = colorVals.split(",").map((x: string) => x.trim());
          if (parts.length === 3) return `rgba(${parts.join(",")},${opacity})`;
          if (parts.length === 4)
            return `rgba(${parts[0]},${parts[1]},${parts[2]},${opacity})`;
          return match;
        });
      }
      return (
        <div
          className="w-full h-full p-4 flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: bgColor,
            color: (style?.color as string) || "#000",
            fontSize: `${(style?.font_size as number) || 24}px`,
            fontFamily: (style?.font_family as string) || "Inter",
            fontWeight: (style?.font_weight as string) || "normal",
            textAlign:
              (style?.text_align as "left" | "center" | "right") || "center",
          }}
        >
          <p className="line-clamp-6">
            {(content?.text as string) || "Enter text..."}
          </p>
        </div>
      );
    }
    case "image":
      const imageSrc = resolveImageSrc();
      // Debug logging
      console.log("Image block content:", { content, assets, imageSrc });

      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={(content?.alt as string) || "Image"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-400">
              <span className="text-4xl block mb-2">🖼️</span>
              <span className="text-sm">Click to add image</span>
            </div>
          )}
        </div>
      );
    case "audio":
      return (
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center p-4">
          <div className="text-center">
            <span className="text-4xl block mb-2">🎵</span>
            <span className="text-sm text-gray-500">Audio Block</span>
          </div>
        </div>
      );
    case "video":
      return (
        <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center p-1">
          {resolveImageSrc() ? (
            <video
              src={resolveImageSrc()!}
              className="w-full h-full object-cover rounded-lg"
              muted
              loop
              playsInline
            />
          ) : (
            <div className="text-center text-gray-500">
              <span className="text-4xl block mb-2">🎬</span>
              <span className="text-sm">Video Block</span>
            </div>
          )}
        </div>
      );
    case "shape":
    case "shape-rect":
      return (
        <div
          className="w-full h-full rounded-lg"
          style={{
            backgroundColor: (style?.fill as string) || "#e5e7eb",
            border: `${(style?.strokeWidth as number) || 0}px solid ${
              (style?.stroke as string) || "#000"
            }`,
          }}
        />
      );
    case "shape-circle":
      return (
        <div
          className="w-full h-full rounded-full"
          style={{
            backgroundColor: (style?.fill as string) || "#e5e7eb",
            border: `${(style?.strokeWidth as number) || 0}px solid ${
              (style?.stroke as string) || "#000"
            }`,
          }}
        />
      );
    case "shape-star":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-6xl">⭐</span>
        </div>
      );
    case "sticker":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-6xl">{(content?.emoji as string) || "✨"}</span>
        </div>
      );
    default:
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">Unknown block type</span>
        </div>
      );
  }
}

function getBlockIcon(type: string): string {
  const icons: Record<string, string> = {
    text: "📝",
    image: "🖼️",
    audio: "🎵",
    video: "🎬",
    shape: "⬜",
    "shape-rect": "⬜",
    "shape-circle": "⭕",
    "shape-star": "⭐",
    sticker: "✨",
  };
  return icons[type] || "📦";
}
