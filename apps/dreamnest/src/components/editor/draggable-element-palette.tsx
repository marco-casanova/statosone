"use client";

import { useState } from "react";
import {
  Type,
  Image,
  Music,
  Video,
  Square,
  Star,
  Circle,
  Sparkles,
  Sticker,
  Wand2,
} from "lucide-react";

interface DraggableElementPaletteProps {
  onDragStart: (elementType: string, data: DragData) => void;
  onDragEnd: () => void;
}

interface DragData {
  type: string;
  category: string;
  icon: string;
}

const ELEMENT_CATEGORIES = [
  {
    id: "content",
    label: "Content",
    icon: <Sparkles className="w-4 h-4" />,
    elements: [
      {
        type: "text",
        label: "Text Box",
        icon: <Type className="w-5 h-5" />,
        emoji: "📝",
        description: "Add story text",
        gradient: "from-orange-400 via-amber-400 to-yellow-400",
        bgLight: "bg-amber-50",
      },
      {
        type: "image",
        label: "Image",
        icon: <Image className="w-5 h-5" />,
        emoji: "🖼️",
        description: "Add an illustration",
        gradient: "from-purple-400 via-pink-400 to-rose-400",
        bgLight: "bg-purple-50",
      },
      {
        type: "audio",
        label: "Sound",
        icon: <Music className="w-5 h-5" />,
        emoji: "🎵",
        description: "Add sound effects",
        gradient: "from-blue-400 via-cyan-400 to-teal-400",
        bgLight: "bg-blue-50",
      },
      {
        type: "video",
        label: "Video",
        icon: <Video className="w-5 h-5" />,
        emoji: "🎬",
        description: "Add animation",
        gradient: "from-green-400 via-emerald-400 to-teal-400",
        bgLight: "bg-green-50",
      },
    ],
  },
  {
    id: "shapes",
    label: "Shapes",
    icon: <Square className="w-4 h-4" />,
    elements: [
      {
        type: "shape-rect",
        label: "Rectangle",
        icon: <Square className="w-5 h-5" />,
        emoji: "⬜",
        description: "Add a rectangle",
        gradient: "from-slate-400 via-gray-400 to-zinc-400",
        bgLight: "bg-slate-50",
      },
      {
        type: "shape-circle",
        label: "Circle",
        icon: <Circle className="w-5 h-5" />,
        emoji: "⭕",
        description: "Add a circle",
        gradient: "from-pink-400 via-rose-400 to-red-400",
        bgLight: "bg-pink-50",
      },
      {
        type: "shape-star",
        label: "Star",
        icon: <Star className="w-5 h-5" />,
        emoji: "⭐",
        description: "Add a star",
        gradient: "from-yellow-400 via-amber-400 to-orange-400",
        bgLight: "bg-yellow-50",
      },
    ],
  },
  {
    id: "stickers",
    label: "Stickers",
    icon: <Sticker className="w-4 h-4" />,
    elements: [
      { type: "sticker", emoji: "🌟", label: "Star" },
      { type: "sticker", emoji: "🌙", label: "Moon" },
      { type: "sticker", emoji: "☀️", label: "Sun" },
      { type: "sticker", emoji: "🌈", label: "Rainbow" },
      { type: "sticker", emoji: "🦋", label: "Butterfly" },
      { type: "sticker", emoji: "🌸", label: "Flower" },
      { type: "sticker", emoji: "🐻", label: "Bear" },
      { type: "sticker", emoji: "🦊", label: "Fox" },
      { type: "sticker", emoji: "🐰", label: "Bunny" },
      { type: "sticker", emoji: "🐱", label: "Cat" },
      { type: "sticker", emoji: "🏰", label: "Castle" },
      { type: "sticker", emoji: "✨", label: "Sparkles" },
    ],
  },
];

export function DraggableElementPalette({
  onDragStart,
  onDragEnd,
}: DraggableElementPaletteProps) {
  const [activeCategory, setActiveCategory] = useState("content");
  const [draggingElement, setDraggingElement] = useState<string | null>(null);

  const handleDragStart = (
    e: React.DragEvent,
    element: { type: string; emoji?: string; label: string }
  ) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: element.type,
        category: activeCategory,
        emoji: element.emoji,
        label: element.label,
      })
    );

    setDraggingElement(element.type + element.emoji);
    onDragStart(element.type, {
      type: element.type,
      category: activeCategory,
      icon: element.emoji || "",
    });

    // Create custom drag image
    const dragImage = document.createElement("div");
    dragImage.className =
      "fixed bg-white rounded-xl shadow-2xl p-4 flex items-center gap-3 pointer-events-none z-[9999]";
    dragImage.innerHTML = `
      <span class="text-3xl">${element.emoji || "📦"}</span>
      <span class="font-medium text-gray-700">${element.label}</span>
    `;
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 60, 30);

    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setDraggingElement(null);
    onDragEnd();
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-100/50 overflow-hidden">
      {/* Category Tabs */}
      <div className="flex border-b border-purple-100/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
        {ELEMENT_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
              activeCategory === category.id
                ? "text-purple-700"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            {category.icon}
            <span className="hidden sm:inline">{category.label}</span>
            {activeCategory === category.id && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Elements Grid */}
      <div className="p-4">
        {activeCategory === "stickers" ? (
          <div className="grid grid-cols-6 gap-2">
            {ELEMENT_CATEGORIES.find((c) => c.id === "stickers")?.elements.map(
              (element, idx) => (
                <button
                  key={idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, element)}
                  onDragEnd={handleDragEnd}
                  className={`aspect-square flex items-center justify-center text-2xl rounded-xl transition-all hover:scale-110 hover:shadow-lg cursor-grab active:cursor-grabbing ${
                    draggingElement === element.type + element.emoji
                      ? "opacity-50 scale-95"
                      : "hover:bg-purple-50"
                  }`}
                  title={element.label}
                >
                  {element.emoji}
                </button>
              )
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {ELEMENT_CATEGORIES.find(
              (c) => c.id === activeCategory
            )?.elements.map((element) => (
              <div
                key={element.type}
                draggable
                onDragStart={(e) => handleDragStart(e, element)}
                onDragEnd={handleDragEnd}
                className={`group relative overflow-hidden rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 ${
                  draggingElement === element.type + element.emoji
                    ? "opacity-50 scale-95"
                    : "hover:scale-[1.02] hover:shadow-lg"
                } ${"bgLight" in element ? element.bgLight : "bg-gray-50"}`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity ${
                    "gradient" in element ? element.gradient : ""
                  }`}
                />

                <div className="p-4 flex flex-col items-center text-center relative">
                  {/* Icon Container */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                      "gradient" in element
                        ? element.gradient
                        : "from-gray-400 to-gray-500"
                    } flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow mb-2`}
                  >
                    <span className="text-2xl">{element.emoji}</span>
                  </div>

                  <span className="font-medium text-gray-700 text-sm">
                    {element.label}
                  </span>
                  {"description" in element && (
                    <span className="text-xs text-gray-400 mt-0.5">
                      {element.description}
                    </span>
                  )}

                  {/* Drag hint */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Wand2 className="w-3 h-3 text-purple-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drag hint */}
      <div className="px-4 pb-3 text-center">
        <p className="text-xs text-gray-400">
          ✨ Drag elements onto the canvas
        </p>
      </div>
    </div>
  );
}
