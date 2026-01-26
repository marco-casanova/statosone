"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  updateCurrentPage,
  markBookCompleted,
  updateReadingMode,
  incrementReadingTime,
} from "@/actions/reading-sessions";
import { PageRenderer } from "./page-renderer";
import { ReaderControls } from "./reader-controls";
import { PageNavigation } from "./page-navigation";
import { AutoReadOverlay } from "./auto-read-overlay";
import { SubscriptionGate } from "./subscription-gate";
import type {
  PageMode,
  ReadingMode,
  BlockType,
  BlockContent,
  BlockLayout,
  BlockStyle,
} from "@/types";

interface Page {
  id: string;
  page_index: number;
  mode: PageMode;
  background_color: string;
  background_asset_id?: string | null;
  audio_narration_id?: string | null;
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

interface Book {
  id: string;
  title: string;
  canvas_width?: number;
  canvas_height?: number;
  design_width?: number;
  design_height?: number;
}

interface BookReaderProps {
  book: Book;
  pages: Page[];
  initialPage: number;
  kidId?: string;
  hasFullAccess: boolean;
  previewLimit: number;
  existingSession?: {
    mode: ReadingMode;
    total_time_seconds: number;
  } | null;
}

export function BookReader({
  book,
  pages,
  initialPage,
  kidId,
  hasFullAccess,
  previewLimit,
  existingSession,
}: BookReaderProps) {
  const router = useRouter();
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPage);
  const [mode, setMode] = useState<ReadingMode>(
    existingSession?.mode || "manual"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeTrackerRef = useRef<number>(0);

  const currentPage = pages[currentPageIndex];
  const totalPages = pages.length;
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === totalPages - 1;

  // Check if page is accessible
  const canReadPage = useCallback(
    (pageIndex: number) => hasFullAccess || pageIndex < previewLimit,
    [hasFullAccess, previewLimit]
  );

  // Navigate to page
  const goToPage = useCallback(
    async (pageIndex: number) => {
      if (pageIndex < 0 || pageIndex >= totalPages) return;

      if (!canReadPage(pageIndex)) {
        setShowPaywall(true);
        return;
      }

      setCurrentPageIndex(pageIndex);
      await updateCurrentPage(book.id, pageIndex, kidId);
    },
    [book.id, kidId, totalPages, canReadPage]
  );

  // Navigation handlers
  const goNext = useCallback(() => {
    if (!isLastPage) {
      goToPage(currentPageIndex + 1);
    }
  }, [currentPageIndex, isLastPage, goToPage]);

  const goPrev = useCallback(() => {
    if (!isFirstPage) {
      goToPage(currentPageIndex - 1);
    }
  }, [currentPageIndex, isFirstPage, goToPage]);

  // Handle mode change
  const handleModeChange = async (newMode: ReadingMode) => {
    setMode(newMode);
    await updateReadingMode(book.id, newMode, kidId);

    if (newMode === "auto") {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  // Handle book completion
  const handleComplete = async () => {
    await markBookCompleted(book.id, kidId);
    router.push("/app?completed=true");
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            router.back();
          }
          break;
        case "f":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, isFullscreen, router]);

  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      timeTrackerRef.current += 30;
      if (timeTrackerRef.current >= 30) {
        incrementReadingTime(book.id, 30, kidId);
        timeTrackerRef.current = 0;
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [book.id, kidId]);

  // Auto-read timer
  useEffect(() => {
    if (mode !== "auto" || !isPlaying) return;

    // Get audio duration or default to 5 seconds
    const duration = 5000; // TODO: Get from audio narration

    const timeout = setTimeout(() => {
      if (!isLastPage) {
        goNext();
      } else {
        setIsPlaying(false);
        handleComplete();
      }
    }, duration);

    return () => clearTimeout(timeout);
  }, [mode, isPlaying, currentPageIndex, isLastPage, goNext]);

  if (showPaywall) {
    return (
      <SubscriptionGate
        book={book}
        previewPages={pages.slice(0, previewLimit)}
        currentPage={currentPageIndex}
      />
    );
  }

  // Handle close/back navigation
  const handleClose = useCallback(() => {
    // If we have history, go back
    if (window.history.length > 1) {
      router.back();
    } else {
      // Otherwise, navigate to the library or editor
      router.push("/app");
    }
  }, [router]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black flex flex-col"
      onClick={() => setShowControls(!showControls)}
    >
      {/* Always visible close button (top-left corner) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="fixed top-4 left-4 z-[60] p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors shadow-lg"
        aria-label="Close reader"
      >
        <svg
          className="w-6 h-6"
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
      </button>

      {/* Top Controls */}
      <ReaderControls
        visible={showControls}
        book={book}
        currentPage={currentPageIndex}
        totalPages={totalPages}
        mode={mode}
        isPlaying={isPlaying}
        isFullscreen={isFullscreen}
        onModeChange={handleModeChange}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onFullscreen={toggleFullscreen}
        onClose={handleClose}
      />

      {/* Page Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {currentPage && (
          <PageRenderer
            page={currentPage}
            canvasWidth={book.canvas_width ?? book.design_width ?? 1024}
            canvasHeight={book.canvas_height ?? book.design_height ?? 768}
          />
        )}
      </div>

      {/* Navigation */}
      <PageNavigation
        visible={showControls}
        currentPage={currentPageIndex}
        totalPages={totalPages}
        hasFullAccess={hasFullAccess}
        previewLimit={previewLimit}
        onPrev={goPrev}
        onNext={goNext}
        onGoToPage={goToPage}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
      />

      {/* Auto-read Overlay */}
      {mode === "auto" && isPlaying && (
        <AutoReadOverlay onPause={() => setIsPlaying(false)} />
      )}

      {/* Completion Modal */}
      {isLastPage && !isPlaying && (
        <CompletionPrompt
          onComplete={handleComplete}
          onRestart={() => goToPage(0)}
        />
      )}
    </div>
  );
}

function CompletionPrompt({
  onComplete,
  onRestart,
}: {
  onComplete: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-6 text-center animate-bounce-in">
      <div className="text-4xl mb-3">🎉</div>
      <h3 className="text-lg font-semibold text-purple-900 mb-4">
        You finished the story!
      </h3>
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200"
        >
          Read Again
        </button>
        <button
          onClick={onComplete}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
        >
          Done! 🌟
        </button>
      </div>
    </div>
  );
}
