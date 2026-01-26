"use client";

import Link from "next/link";
import type { ReadingMode } from "@/types";

interface Book {
  id: string;
  title: string;
}

interface ReaderControlsProps {
  visible: boolean;
  book: Book;
  currentPage: number;
  totalPages: number;
  mode: ReadingMode;
  isPlaying: boolean;
  isFullscreen: boolean;
  onModeChange: (mode: ReadingMode) => void;
  onPlayPause: () => void;
  onFullscreen: () => void;
  onClose: () => void;
}

export function ReaderControls({
  visible,
  book,
  currentPage,
  totalPages,
  mode,
  isPlaying,
  isFullscreen,
  onModeChange,
  onPlayPause,
  onFullscreen,
  onClose,
}: ReaderControlsProps) {
  return (
    <div
      className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      {/* Controls Content */}
      <div className="relative px-4 py-3 flex items-center justify-between">
        {/* Left: Close & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>

          <div className="text-white">
            <h1 className="font-semibold text-lg line-clamp-1">{book.title}</h1>
            <p className="text-white/70 text-sm">
              Page {currentPage + 1} of {totalPages}
            </p>
          </div>
        </div>

        {/* Center: Mode Toggle */}
        <div className="flex items-center gap-2 bg-white/20 rounded-full p-1">
          <button
            onClick={() => onModeChange("manual")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "manual"
                ? "bg-white text-purple-700"
                : "text-white hover:bg-white/10"
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => onModeChange("auto")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "auto"
                ? "bg-white text-purple-700"
                : "text-white hover:bg-white/10"
            }`}
          >
            Auto-Read
          </button>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {mode === "auto" && (
            <button
              onClick={onPlayPause}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>
          )}

          <button
            onClick={onFullscreen}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            {isFullscreen ? (
              <ExitFullscreenIcon className="w-6 h-6" />
            ) : (
              <FullscreenIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Icons
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function FullscreenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

function ExitFullscreenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 4v5H4m0 0l5-5M4 9l5-5m11 11h-5v5m0 0l5-5m-5 5l5-5M4 15v5h5m0-5l-5 5"
      />
    </svg>
  );
}
