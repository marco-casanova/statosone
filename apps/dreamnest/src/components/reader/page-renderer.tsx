"use client";

import { useMemo } from "react";
import Image from "next/image";
import { getAssetPublicUrl } from "@/lib/storage";
import type {
  PageMode,
  BlockType,
  BlockContent,
  BlockLayout,
  BlockStyle,
} from "@/types";

interface Page {
  id: string;
  mode: PageMode;
  background_color: string;
  background_asset_id?: string | null;
  background_asset_url?: string | null;
  background_asset?: { file_path?: string | null } | null;
  blocks: Block[];
}

interface Block {
  id: string;
  block_type: BlockType;
  content: BlockContent;
  layout: BlockLayout;
  style: BlockStyle;
  z_index: number;
}

interface PageRendererProps {
  page: Page;
  canvasWidth: number;
  canvasHeight: number;
}

export function PageRenderer({
  page,
  canvasWidth,
  canvasHeight,
}: PageRendererProps) {
  const aspectRatio = canvasWidth / canvasHeight;

  const backgroundImageUrl =
    page.background_asset_url ||
    (page.background_asset?.file_path
      ? getAssetPublicUrl(page.background_asset.file_path)
      : null);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-4"
      style={{ backgroundColor: page.background_color }}
    >
      {/* Canvas Container - maintains aspect ratio */}
      <div
        className="relative shadow-2xl rounded-lg overflow-hidden"
        style={{
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          maxWidth: "100%",
          maxHeight: "100%",
          width: aspectRatio > 1 ? "100%" : "auto",
          height: aspectRatio > 1 ? "auto" : "100%",
          backgroundColor: page.background_color,
        }}
      >
        {/* Background Image */}
        {backgroundImageUrl && (
          <div className="absolute inset-0">
            <Image
              src={backgroundImageUrl}
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Blocks */}
        {page.mode === "canvas" ? (
          <CanvasBlocks blocks={page.blocks} />
        ) : (
          <FlowBlocks blocks={page.blocks} />
        )}
      </div>
    </div>
  );
}

/**
 * Canvas mode: absolute positioning with normalized coordinates
 */
function CanvasBlocks({ blocks }: { blocks: Block[] }) {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.z_index - b.z_index),
    [blocks]
  );

  return (
    <>
      {sortedBlocks.map((block) => (
        <CanvasBlock key={block.id} block={block} />
      ))}
    </>
  );
}

function CanvasBlock({ block }: { block: Block }) {
  const layout = block.layout as {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${(layout.x || 0) * 100}%`,
    top: `${(layout.y || 0) * 100}%`,
    width: `${(layout.width || 0.5) * 100}%`,
    height: `${(layout.height || 0.3) * 100}%`,
    zIndex: block.z_index,
  };

  return (
    <div style={style}>
      <BlockContent block={block} />
    </div>
  );
}

/**
 * Flow mode: vertical stacking
 */
function FlowBlocks({ blocks }: { blocks: Block[] }) {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.z_index - b.z_index),
    [blocks]
  );

  return (
    <div className="p-8 flex flex-col gap-6 overflow-y-auto h-full">
      {sortedBlocks.map((block) => (
        <FlowBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

function FlowBlock({ block }: { block: Block }) {
  const layout = block.layout as { align?: string };
  const alignment = layout.align || "center";

  return (
    <div
      className={`w-full ${
        alignment === "left"
          ? "text-left"
          : alignment === "right"
          ? "text-right"
          : "text-center"
      }`}
    >
      <BlockContent block={block} />
    </div>
  );
}

/**
 * Block content renderer based on type
 */
function BlockContent({ block }: { block: Block }) {
  const content = block.content as unknown as Record<string, unknown>;
  const style = block.style as unknown as Record<string, unknown>;

  switch (block.block_type) {
    case "text":
      return <TextBlock content={content} style={style} />;
    case "image":
      return <ImageBlock content={content} style={style} />;
    case "audio":
      return <AudioBlock content={content} />;
    case "video":
      return <VideoBlock content={content} />;
    case "shape":
      return <ShapeBlock content={content} style={style} />;
    default:
      return null;
  }
}

function TextBlock({
  content,
  style,
}: {
  content: Record<string, unknown>;
  style: Record<string, unknown>;
}) {
  const textStyle: React.CSSProperties = {
    fontFamily: (style.fontFamily as string) || "inherit",
    fontSize: (style.fontSize as number) || 24,
    fontWeight: (style.fontWeight as number) || 400,
    color: (style.color as string) || "#000000",
    textAlign: (style.textAlign as "left" | "center" | "right") || "center",
    lineHeight: (style.lineHeight as number) || 1.5,
    textShadow: style.textShadow as string,
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <p style={textStyle} className="whitespace-pre-wrap">
        {content.text as string}
      </p>
    </div>
  );
}

function ImageBlock({
  content,
  style,
}: {
  content: Record<string, unknown>;
  style: Record<string, unknown>;
}) {
  const imageStyle: React.CSSProperties = {
    borderRadius: (style.borderRadius as number) || 0,
    opacity: (style.opacity as number) ?? 1,
    objectFit: (style.objectFit as "cover" | "contain") || "contain",
  };

  return (
    <div className="relative w-full h-full">
      <Image
        src={content.src as string}
        alt={(content.alt as string) || ""}
        fill
        style={imageStyle}
      />
    </div>
  );
}

function AudioBlock({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <audio
        src={content.src as string}
        controls
        className="max-w-full"
        autoPlay={(content.autoplay as boolean) || false}
      />
    </div>
  );
}

function VideoBlock({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="relative w-full h-full">
      <video
        src={content.src as string}
        controls={(content.controls as boolean) ?? true}
        autoPlay={(content.autoplay as boolean) || false}
        loop={(content.loop as boolean) || false}
        muted={(content.muted as boolean) || false}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

function ShapeBlock({
  content,
  style,
}: {
  content: Record<string, unknown>;
  style: Record<string, unknown>;
}) {
  const shapeType = content.shape as string;
  const fillColor = (style.fillColor as string) || "#000000";
  const strokeColor = style.strokeColor as string;
  const strokeWidth = (style.strokeWidth as number) || 0;

  const baseStyle: React.CSSProperties = {
    backgroundColor: fillColor,
    border: strokeWidth ? `${strokeWidth}px solid ${strokeColor}` : undefined,
  };

  if (shapeType === "circle") {
    return <div className="w-full h-full rounded-full" style={baseStyle} />;
  }

  if (shapeType === "star") {
    // SVG star
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon
          points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  // Default: rectangle
  return <div className="w-full h-full" style={baseStyle} />;
}
