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
    "style"
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

  // Calculate aspect ratio from book dimensions
  const bookWidth = book.canvas_width ?? book.design_width ?? 600;
  const bookHeight = book.canvas_height ?? book.design_height ?? 800;
  const aspectRatio = bookWidth / bookHeight;

  // Calculate cover size maintaining aspect ratio within max constraints
  const maxWidth = 420;
  const maxHeight = 560;
  const coverWidth =
    aspectRatio > maxWidth / maxHeight
      ? maxWidth
      : Math.min(maxWidth, maxHeight * aspectRatio);
  const coverHeight = coverWidth / aspectRatio;

  return (
    <div className="h-full flex bg-gradient-to-br from-gray-100 via-purple-50/30 to-pink-50/30">
      {/* Cover Preview - Main Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative">
          {/* Book Shadow */}
          <div
            className="absolute inset-0 translate-x-4 translate-y-4 rounded-2xl bg-black/20 blur-2xl"
            style={{ transform: "translate(20px, 20px)" }}
          />

          {/* Book Cover */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
            style={{
              background: getCurrentBackground(),
              width: `${coverWidth}px`,
              height: `${coverHeight}px`,
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
              <span className="text-sm font-semibold text-white">
                DreamNest
              </span>
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

          {/* Floating decorations */}
          <div className="absolute -top-4 -right-4 text-3xl animate-bounce delay-100">
            🌟
          </div>
          <div className="absolute -bottom-4 -left-4 text-2xl animate-bounce delay-300">
            💫
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="w-96 bg-white/80 backdrop-blur-xl border-l border-purple-100 flex flex-col">
        {/* Panel Header */}
        <div className="p-5 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Cover Designer</h2>
              <p className="text-xs text-gray-500">
                Create a magical first impression
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-purple-100">
          {[
            {
              id: "style",
              label: "Style",
              icon: <Palette className="w-4 h-4" />,
            },
            {
              id: "background",
              label: "Image",
              icon: <Image className="w-4 h-4" />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "style" | "background")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? "text-purple-700"
                  : "text-gray-500 hover:text-purple-600"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "style" && (
            <div className="space-y-6">
              {/* Gradient Presets */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Magic Gradients
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {COVER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`group relative rounded-xl overflow-hidden transition-all hover:scale-[1.03] hover:shadow-lg ${
                        selectedPreset === preset.id
                          ? "ring-2 ring-purple-500 ring-offset-2"
                          : ""
                      }`}
                      style={{
                        background: preset.gradient,
                        aspectRatio: `${bookWidth} / ${bookHeight}`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
                        <span className="text-lg">{preset.emoji}</span>
                        <span className="text-[10px] font-medium text-white truncate">
                          {preset.name}
                        </span>
                      </div>
                      {selectedPreset === preset.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-purple-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Solid Colors */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Solid Colors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "#FF6B6B",
                    "#4ECDC4",
                    "#45B7D1",
                    "#96CEB4",
                    "#FFEAA7",
                    "#DDA0DD",
                    "#98D8C8",
                    "#F7DC6F",
                    "#BB8FCE",
                    "#85C1E9",
                    "#F8B500",
                    "#1ABC9C",
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedPreset(null);
                        onUpdatePage({ background_color: color });
                      }}
                      className="w-10 h-10 rounded-xl shadow-md hover:scale-110 transition-transform border-2 border-white"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "background" && (
            <div className="space-y-6">
              {/* Upload Image */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-500" />
                  Cover Image
                </h3>
                <button
                  onClick={onOpenAssetLibrary}
                  className="w-full aspect-video bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
                >
                  {coverImageUrl ? (
                    <div className="relative w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImageUrl}
                        alt="Cover"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">
                          Change Image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Image className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">
                          Upload Cover Image
                        </p>
                        <p className="text-xs text-gray-500">
                          Recommended: 600 x 800 pixels
                        </p>
                      </div>
                    </>
                  )}
                </button>

                {coverImageUrl && (
                  <button
                    onClick={() => onUpdatePage({ background_asset_id: null })}
                    className="w-full mt-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {/* Tips */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Pro Tips
                </h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Use bright, colorful images that appeal to children</li>
                  <li>• Keep important elements in the center</li>
                  <li>• Ensure text remains readable over the image</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
