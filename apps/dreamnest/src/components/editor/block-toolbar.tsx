"use client";

import { useState } from "react";

interface BlockToolbarProps {
  onAddBlock: (blockType: string) => void;
  onOpenAssets: () => void;
}

const BLOCK_TYPES = [
  {
    type: "text",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h7"
        />
      </svg>
    ),
    label: "Text",
    description: "Add text content",
    color: "from-orange-400 to-amber-400",
  },
  {
    type: "image",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    label: "Image",
    description: "Add an image",
    color: "from-purple-400 to-pink-400",
  },
  {
    type: "audio",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
        />
      </svg>
    ),
    label: "Audio",
    description: "Add sound or music",
    color: "from-blue-400 to-cyan-400",
  },
  {
    type: "video",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
    label: "Video",
    description: "Add a video clip",
    color: "from-green-400 to-emerald-400",
  },
  {
    type: "shape",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
        />
      </svg>
    ),
    label: "Shape",
    description: "Add a shape",
    color: "from-gray-400 to-slate-400",
  },
];

export function BlockToolbar({ onAddBlock, onOpenAssets }: BlockToolbarProps) {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-4 shadow-sm">
      {/* Block Type Buttons */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-gray-500 mr-3">
          Add Element:
        </span>
        {BLOCK_TYPES.map((block) => (
          <div key={block.type} className="relative">
            <button
              onClick={() => onAddBlock(block.type)}
              onMouseEnter={() => setHoveredBlock(block.type)}
              onMouseLeave={() => setHoveredBlock(null)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200
                hover:shadow-md active:scale-95
                bg-gradient-to-r ${block.color} text-white
              `}
            >
              {block.icon}
              <span className="text-sm font-medium">{block.label}</span>
            </button>

            {/* Tooltip */}
            {hoveredBlock === block.type && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
                {block.description}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Asset Library Button */}
        <button
          onClick={onOpenAssets}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors border border-purple-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <span className="text-sm font-medium">Media Library</span>
        </button>

        {/* Keyboard shortcuts hint */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-gray-400 ml-2">
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
            ⌘
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
            T
          </kbd>
          <span className="ml-1">for Text</span>
        </div>
      </div>
    </div>
  );
}
