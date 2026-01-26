"use client";

interface AutoReadOverlayProps {
  onPause: () => void;
}

export function AutoReadOverlay({ onPause }: AutoReadOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Touch area to pause */}
      <button
        onClick={onPause}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-auto px-6 py-3 bg-white/20 backdrop-blur rounded-full text-white text-sm hover:bg-white/30 transition-colors"
      >
        Tap to pause
      </button>

      {/* Auto-read indicator */}
      <div className="absolute top-20 right-4 flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-full text-white text-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        Auto-reading
      </div>
    </div>
  );
}
