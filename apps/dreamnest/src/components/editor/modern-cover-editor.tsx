"use client";

import { useState, useCallback } from "react";
import {
  Palette,
  Image,
  Type,
  Sparkles,
  Upload,
  Check,
  X,
  Wand2,
  Sun,
  Moon,
  Cloud,
  Heart,
  Star,
} from "lucide-react";

interface ModernCoverEditorProps {
  book: {
    id: string;
    title: string;
    subtitle: string | null;
    design_width?: number;
    design_height?: number;
    canvas_width?: number;
    canvas_height?: number;
  };
  coverPage: {
    id: string;
    background_color: string;
    background_asset_id?: string | null;
  };
  onUpdateBook: (updates: { title?: string; subtitle?: string | null }) => void;
  onUpdatePage: (updates: {
    background_color?: string;
    background_asset_id?: string | null;
  }) => void;
  onOpenAssetLibrary: () => void;
  coverImageUrl?: string;
}

const COVER_PRESETS = [
  {
    id: "sunset",
    name: "Sunset Dreams",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFA07A 100%)",
    emoji: "🌅",
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    emoji: "🌊",
  },
  {
    id: "forest",
    name: "Enchanted Forest",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    emoji: "🌲",
  },
  {
    id: "night",
    name: "Starry Night",
    gradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    emoji: "🌙",
  },
  {
    id: "candy",
    name: "Cotton Candy",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    emoji: "🍭",
  },
  {
    id: "aurora",
    name: "Aurora",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    emoji: "✨",
  },
  {
    id: "golden",
    name: "Golden Hour",
    gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    emoji: "🌟",
  },
  {
    id: "lavender",
    name: "Lavender Fields",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    emoji: "💜",
  },
  {
    id: "mint",
    name: "Mint Fresh",
    gradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    emoji: "🌿",
  },
  {
    id: "rose",
    name: "Rose Garden",
    gradient: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
    emoji: "🌹",
  },
];

const DECORATIVE_ELEMENTS = [
  { emoji: "⭐", name: "Stars" },
  { emoji: "✨", name: "Sparkles" },
  { emoji: "🌙", name: "Moon" },
  { emoji: "☀️", name: "Sun" },
  { emoji: "🌈", name: "Rainbow" },
  { emoji: "💫", name: "Magic" },
  { emoji: "🦋", name: "Butterfly" },
  { emoji: "🌸", name: "Flower" },
];

export function ModernCoverEditor({
  book,
  coverPage,
  onUpdateBook,
  onUpdatePage,
  onOpenAssetLibrary,
  coverImageUrl,
}: ModernCoverEditorProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [subtitle, setSubtitle] = useState(book.subtitle || "");
  const [activeTab, setActiveTab] = useState<"style" | "background" | "text">(
    "style",
  );
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleSaveTitle = () => {
    onUpdateBook({ title, subtitle: subtitle || null });
    setIsEditingTitle(false);
  };

  const handlePresetSelect = (preset: (typeof COVER_PRESETS)[0]) => {
    setSelectedPreset(preset.id);
    onUpdatePage({ background_color: preset.gradient });
  };

  const getCurrentBackground = () => {
    if (coverImageUrl) {
      return `url(${coverImageUrl}) center/cover`;
    }
    return coverPage.background_color || COVER_PRESETS[0].gradient;
  };

  // Use same sizing calculation as ModernCanvas for consistency
  const safeWidth = book.canvas_width ?? book.design_width ?? 1920;
  const safeHeight = book.canvas_height ?? book.design_height ?? 1080;
  const aspectRatio = safeWidth / safeHeight;
  const renderWidth = Math.min(safeWidth, 1200);
  const renderHeight = aspectRatio > 0 ? renderWidth / aspectRatio : 675;

  return (
    <div className="flex items-center justify-center h-full w-full p-4 overflow-hidden">
      <div
        className="relative flex justify-center items-center h-full w-full"
        style={{
          maxHeight: "calc(100vh - 200px)",
          maxWidth: "calc(100vw - 700px)",
        }}
      >
        {/* Book Cover */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-3xl"
          style={{
            background: getCurrentBackground(),
            width: renderWidth,
            height: renderHeight,
            maxHeight: "calc(100vh - 220px)",
            maxWidth: "100%",
            minHeight: 400,
          }}
        >
          {/* Texture Overlay */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* DreamNest Badge */}
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
            <span className="text-lg">🌙</span>
            <span className="text-sm font-semibold text-white">DreamNest</span>
          </div>

          {/* Decorative Corner */}
          <div className="absolute top-6 right-6 text-4xl opacity-60 animate-pulse">
            ✨
          </div>

          {/* Title Area */}
          <div className="absolute inset-x-0 bottom-0 p-8">
            {isEditingTitle ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-4xl font-bold text-center bg-white/10 backdrop-blur-md text-white placeholder-white/50 rounded-xl px-4 py-3 border border-white/30 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/20"
                  placeholder="Book Title"
                  autoFocus
                />
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-xl text-center bg-white/10 backdrop-blur-md text-white placeholder-white/50 rounded-xl px-4 py-2 border border-white/30 focus:outline-none focus:border-white/60"
                  placeholder="Subtitle (optional)"
                />
                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={handleSaveTitle}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setTitle(book.title);
                      setSubtitle(book.subtitle || "");
                      setIsEditingTitle(false);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="cursor-pointer group text-center"
                onClick={() => setIsEditingTitle(true)}
              >
                <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2 group-hover:scale-[1.02] transition-transform">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-2xl text-white/90 drop-shadow-md mb-3">
                    {book.subtitle}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-sm text-white/60 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                  <Type className="w-3 h-3" />
                  Click to edit title
                </span>
              </div>
            )}
          </div>

          {/* Book Spine Effect */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/30 to-transparent" />

          {/* Page Edge Effect */}
          <div className="absolute right-0 top-2 bottom-2 w-1 bg-gradient-to-l from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}
