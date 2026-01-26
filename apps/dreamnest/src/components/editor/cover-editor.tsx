"use client";

import { useState, useCallback } from "react";

interface CoverEditorProps {
  book: {
    id: string;
    title: string;
    subtitle: string | null;
  };
  coverPage: {
    id: string;
    background_color: string;
    background_asset_id?: string | null;
    blocks: Array<{
      id: string;
      type: string;
      content: unknown;
      layout: unknown;
      style: unknown;
    }>;
  };
  onUpdateBook: (updates: { title?: string; subtitle?: string | null }) => void;
  onUpdatePage: (updates: {
    background_color?: string;
    background_asset_id?: string | null;
  }) => void;
  onOpenAssetLibrary: () => void;
  coverImageUrl?: string;
}

export function CoverEditor({
  book,
  coverPage,
  onUpdateBook,
  onUpdatePage,
  onOpenAssetLibrary,
  coverImageUrl,
}: CoverEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [subtitle, setSubtitle] = useState(book.subtitle || "");

  const handleSaveTitle = () => {
    onUpdateBook({ title, subtitle: subtitle || null });
    setIsEditing(false);
  };

  // Preset cover colors
  const coverColors = [
    { name: "Sunset", colors: ["#FF6B6B", "#FFA07A"] },
    { name: "Ocean", colors: ["#4ECDC4", "#556270"] },
    { name: "Forest", colors: ["#2ECC71", "#27AE60"] },
    { name: "Night", colors: ["#2C3E50", "#4A5568"] },
    { name: "Candy", colors: ["#FF69B4", "#FFB6C1"] },
    { name: "Dream", colors: ["#9B59B6", "#8E44AD"] },
    { name: "Sunny", colors: ["#F1C40F", "#F39C12"] },
    { name: "Sky", colors: ["#3498DB", "#2980B9"] },
  ];

  return (
    <div className="h-full flex">
      {/* Cover Preview */}
      <div className="flex-1 p-8 flex items-center justify-center bg-gray-100">
        <div
          className="relative w-[400px] aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: coverImageUrl
              ? `url(${coverImageUrl}) center/cover`
              : coverPage.background_color ||
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Cover Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
            {isEditing ? (
              <div className="w-full space-y-4 mb-8">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-3xl font-bold text-center bg-white/20 backdrop-blur-sm text-white placeholder-white/50 rounded-lg px-4 py-2 border border-white/30 focus:outline-none focus:border-white/50"
                  placeholder="Book Title"
                />
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-lg text-center bg-white/20 backdrop-blur-sm text-white placeholder-white/50 rounded-lg px-4 py-2 border border-white/30 focus:outline-none focus:border-white/50"
                  placeholder="Subtitle (optional)"
                />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleSaveTitle}
                    className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setTitle(book.title);
                      setSubtitle(book.subtitle || "");
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="mb-8 cursor-pointer group"
                onClick={() => setIsEditing(true)}
              >
                <h1 className="text-4xl font-bold text-white drop-shadow-lg group-hover:text-white/80 transition-colors">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-xl text-white/90 mt-2 drop-shadow-md">
                    {book.subtitle}
                  </p>
                )}
                <span className="block mt-2 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to edit title
                </span>
              </div>
            )}
          </div>

          {/* DreamNest Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-sm">🌙</span>
            <span className="text-xs text-white font-medium">DreamNest</span>
          </div>
        </div>
      </div>

      {/* Cover Settings Panel */}
      <div className="w-80 bg-white border-l overflow-y-auto">
        <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="font-semibold text-gray-800">Cover Design</h2>
          <p className="text-xs text-gray-500 mt-1">
            Customize your book&apos;s cover appearance
          </p>
        </div>

        <div className="p-4 space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            {coverImageUrl ? (
              <div className="relative">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={onOpenAssetLibrary}
                    className="flex-1 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={() => onUpdatePage({ background_asset_id: null })}
                    className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAssetLibrary}
                className="w-full aspect-[3/4] border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <span className="text-4xl mb-2">🖼️</span>
                <span className="text-sm text-purple-600 font-medium">
                  Upload Cover Image
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Recommended: 1200x1600px
                </span>
              </button>
            )}
          </div>

          {/* Background Color (shown if no image) */}
          {!coverImageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Choose a Gradient
              </label>
              <div className="grid grid-cols-4 gap-2">
                {coverColors.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      onUpdatePage({
                        background_color: `linear-gradient(135deg, ${preset.colors[0]} 0%, ${preset.colors[1]} 100%)`,
                      })
                    }
                    className="aspect-square rounded-lg transition-transform hover:scale-105 shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${preset.colors[0]} 0%, ${preset.colors[1]} 100%)`,
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-xs text-gray-500 mb-1">
                  Custom Color
                </label>
                <input
                  type="color"
                  value={
                    coverPage.background_color?.startsWith("#")
                      ? coverPage.background_color
                      : "#667eea"
                  }
                  onChange={(e) =>
                    onUpdatePage({ background_color: e.target.value })
                  }
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Title & Subtitle */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => onUpdateBook({ title, subtitle: subtitle || null })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Enter book title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              onBlur={() => onUpdateBook({ title, subtitle: subtitle || null })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Optional subtitle"
            />
          </div>

          {/* Tips */}
          <div className="bg-amber-50 rounded-xl p-4">
            <h4 className="font-medium text-amber-700 flex items-center gap-2">
              <span>💡</span> Cover Tips
            </h4>
            <ul className="mt-2 text-xs text-amber-600 space-y-1">
              <li>• Use bright, eye-catching colors</li>
              <li>• Keep the title large and readable</li>
              <li>• Images should be high quality (1200x1600px)</li>
              <li>• Consider how it looks as a thumbnail</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
