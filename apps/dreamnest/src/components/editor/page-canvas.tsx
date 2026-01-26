"use client";

import { useRef, useState, useCallback } from "react";

interface Page {
  id: string;
  layout_mode: "canvas" | "flow";
  background_color: string;
  background_asset_id?: string | null;
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

interface PageCanvasProps {
  page: Page;
  canvasWidth: number;
  canvasHeight: number;
  selectedBlockId: string | null;
  onBlockSelect: (blockId: string | null) => void;
  onBlockMove: (blockId: string, x: number, y: number) => void;
  onBlockMoveEnd?: (blockId: string, x: number, y: number) => void;
  onBlockResize: (blockId: string, width: number, height: number) => void;
}

export function PageCanvas({
  page,
  canvasWidth,
  canvasHeight,
  selectedBlockId,
  onBlockSelect,
  onBlockMove,
  onBlockMoveEnd,
  onBlockResize,
}: PageCanvasProps) {
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
    handle: "se" | "e" | "s";
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);
  const [showGuides, setShowGuides] = useState(false);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onBlockSelect(null);
    }
  };

  const handleBlockMouseDown = useCallback(
    (
      e: React.MouseEvent,
      blockId: string,
      layout: { x?: number; y?: number }
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
    [page.layout_mode, onBlockSelect]
  );

  const handleResizeMouseDown = useCallback(
    (
      e: React.MouseEvent,
      blockId: string,
      handle: "se" | "e" | "s",
      layout: { width?: number; height?: number }
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
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

      if (dragging) {
        const deltaX = (e.clientX - dragging.startX) / rect.width;
        const deltaY = (e.clientY - dragging.startY) / rect.height;

        const newX = Math.max(0, Math.min(1, dragging.initialX + deltaX));
        const newY = Math.max(0, Math.min(1, dragging.initialY + deltaY));

        onBlockMove(dragging.blockId, newX, newY);
      }

      if (resizing) {
        const deltaX = (e.clientX - resizing.startX) / rect.width;
        const deltaY = (e.clientY - resizing.startY) / rect.height;

        let newWidth = resizing.initialWidth;
        let newHeight = resizing.initialHeight;

        if (resizing.handle === "se" || resizing.handle === "e") {
          newWidth = Math.max(
            0.05,
            Math.min(1, resizing.initialWidth + deltaX)
          );
        }
        if (resizing.handle === "se" || resizing.handle === "s") {
          newHeight = Math.max(
            0.05,
            Math.min(1, resizing.initialHeight + deltaY)
          );
        }

        onBlockResize(resizing.blockId, newWidth, newHeight);
      }
    },
    [dragging, resizing, onBlockMove, onBlockResize]
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

  // Calculate aspect ratio for responsive scaling
  const aspectRatio = canvasWidth / canvasHeight;

  return (
    <div className="flex items-center justify-center h-full">
      <div
        ref={canvasRef}
        className="shadow-2xl rounded-lg overflow-hidden relative transition-shadow"
        style={{
          width: "100%",
          maxWidth: canvasWidth,
          aspectRatio: aspectRatio.toString(),
          backgroundColor: page.background_color,
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Overlay (for alignment) - shows when dragging */}
        {showGuides && (
          <div
            className="absolute inset-0 pointer-events-none z-50"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(147, 51, 234, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "10% 10%",
            }}
          />
        )}

        {/* Center guides when dragging */}
        {showGuides && (
          <>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-purple-400/50 pointer-events-none z-50" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-purple-400/50 pointer-events-none z-50" />
          </>
        )}

        {/* Blocks */}
        {page.layout_mode === "canvas" ? (
          <CanvasBlocks
            blocks={page.blocks}
            selectedBlockId={selectedBlockId}
            onMouseDown={handleBlockMouseDown}
            onResizeMouseDown={handleResizeMouseDown}
            isDragging={!!dragging}
            isResizing={!!resizing}
          />
        ) : (
          <FlowBlocks
            blocks={page.blocks}
            selectedBlockId={selectedBlockId}
            onSelect={onBlockSelect}
          />
        )}

        {/* Empty state */}
        {page.blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
            <div className="text-center">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-lg font-medium">Empty page</p>
              <p className="text-sm">Add blocks from the toolbar above</p>
            </div>
          </div>
        )}

        {/* Drop zone indicator */}
        {page.blocks.length === 0 && (
          <div className="absolute inset-4 border-2 border-dashed border-purple-300 rounded-lg pointer-events-none" />
        )}
      </div>
    </div>
  );
}

function CanvasBlocks({
  blocks,
  selectedBlockId,
  onMouseDown,
  onResizeMouseDown,
  isDragging,
  isResizing,
}: {
  blocks: Block[];
  selectedBlockId: string | null;
  onMouseDown: (
    e: React.MouseEvent,
    blockId: string,
    layout: { x?: number; y?: number }
  ) => void;
  onResizeMouseDown: (
    e: React.MouseEvent,
    blockId: string,
    handle: "se" | "e" | "s",
    layout: { width?: number; height?: number }
  ) => void;
  isDragging: boolean;
  isResizing: boolean;
}) {
  const sortedBlocks = [...blocks].sort(
    (a, b) => a.block_index - b.block_index
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
            className={`absolute transition-shadow ${
              isSelected
                ? "ring-2 ring-purple-500 ring-offset-2 shadow-lg"
                : "hover:ring-2 hover:ring-purple-300"
            }`}
            style={{
              left: `${(layout.x || 0) * 100}%`,
              top: `${(layout.y || 0) * 100}%`,
              width: `${(layout.width || 0.3) * 100}%`,
              height: `${(layout.height || 0.2) * 100}%`,
              zIndex: isSelected ? 999 : layout.z_index ?? block.block_index,
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={(e) => onMouseDown(e, block.id, layout)}
          >
            <BlockPreview block={block} />

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute -inset-px border-2 border-purple-500 rounded pointer-events-none" />
            )}

            {/* Resize handles (when selected) */}
            {isSelected && (
              <>
                {/* Corner handle (SE) */}
                <div
                  className="absolute -right-2 -bottom-2 w-4 h-4 bg-purple-500 rounded-full cursor-se-resize hover:scale-110 transition-transform shadow-md border-2 border-white"
                  onMouseDown={(e) =>
                    onResizeMouseDown(e, block.id, "se", layout)
                  }
                />
                {/* Edge handle (E) */}
                <div
                  className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-8 bg-purple-500 rounded-full cursor-e-resize hover:scale-110 transition-transform shadow-md border-2 border-white"
                  onMouseDown={(e) =>
                    onResizeMouseDown(e, block.id, "e", layout)
                  }
                />
                {/* Edge handle (S) */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-8 h-3 bg-purple-500 rounded-full cursor-s-resize hover:scale-110 transition-transform shadow-md border-2 border-white"
                  onMouseDown={(e) =>
                    onResizeMouseDown(e, block.id, "s", layout)
                  }
                />
              </>
            )}

            {/* Block type indicator */}
            {isSelected && (
              <div className="absolute -top-6 left-0 px-2 py-0.5 bg-purple-500 text-white text-xs rounded font-medium capitalize">
                {block.type}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function FlowBlocks({
  blocks,
  selectedBlockId,
  onSelect,
}: {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelect: (blockId: string) => void;
}) {
  const sortedBlocks = [...blocks].sort(
    (a, b) => a.block_index - b.block_index
  );

  return (
    <div className="p-8 space-y-4">
      {sortedBlocks.map((block) => {
        const isSelected = block.id === selectedBlockId;

        return (
          <div
            key={block.id}
            className={`cursor-pointer rounded-lg transition-all ${
              isSelected
                ? "ring-2 ring-purple-500 shadow-lg"
                : "hover:ring-2 hover:ring-purple-200"
            }`}
            onClick={() => onSelect(block.id)}
          >
            <BlockPreview block={block} isFlowMode />
          </div>
        );
      })}
    </div>
  );
}

function BlockPreview({
  block,
  isFlowMode = false,
}: {
  block: Block;
  isFlowMode?: boolean;
}) {
  const content = block.content as Record<string, unknown>;
  const style = block.style as Record<string, unknown>;

  const baseClasses = "w-full h-full rounded overflow-hidden";

  switch (block.type) {
    case "text":
      return (
        <div
          className={`${baseClasses} flex items-center justify-center p-4 bg-white/90 backdrop-blur-sm`}
          style={{
            fontSize: `${(style.font_size as number) || 24}px`,
            fontWeight: (style.font_weight as string) || "normal",
            color: (style.color as string) || "#000",
            textAlign:
              (style.text_align as "left" | "center" | "right") || "center",
            fontFamily: (style.font_family as string) || "inherit",
          }}
        >
          <p className={isFlowMode ? "" : "line-clamp-4"}>
            {(content.text as string) || "Enter your text..."}
          </p>
        </div>
      );

    case "image":
      return (
        <div
          className={`${baseClasses} bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center`}
        >
          {content.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.src as string}
              alt={(content.alt as string) || ""}
              className="w-full h-full object-contain"
              style={{
                objectFit:
                  (style.object_fit as "contain" | "cover") || "contain",
                borderRadius: (style.border_radius as number) || 0,
              }}
            />
          ) : (
            <div className="text-center">
              <span className="text-5xl block mb-2">🖼️</span>
              <span className="text-sm text-purple-600 font-medium">
                Add Image
              </span>
            </div>
          )}
        </div>
      );

    case "audio":
      return (
        <div
          className={`${baseClasses} bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center gap-3`}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-blue-700 block">
              Audio Block
            </span>
            <span className="text-xs text-blue-500">Click to add audio</span>
          </div>
        </div>
      );

    case "video":
      return (
        <div
          className={`${baseClasses} bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center gap-3`}
        >
          {content.src ? (
            <video
              src={content.src as string}
              className="w-full h-full object-contain"
              controls={(style.show_controls as boolean) ?? true}
            />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-2xl">▶️</span>
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-green-700 block">
                  Video Block
                </span>
                <span className="text-xs text-green-500">
                  Click to add video
                </span>
              </div>
            </>
          )}
        </div>
      );

    case "shape":
      return (
        <div
          className={baseClasses}
          style={{
            backgroundColor:
              (style.fillColor as string) ||
              (style.backgroundColor as string) ||
              "#E5E7EB",
            borderRadius:
              (style.borderRadius as number) ||
              (style.border_radius as number) ||
              8,
          }}
        />
      );

    default:
      return (
        <div
          className={`${baseClasses} bg-gray-100 flex items-center justify-center`}
        >
          <span className="text-gray-400">Unknown Block</span>
        </div>
      );
  }
}
