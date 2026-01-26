"use client";

interface PageNavigationProps {
  visible: boolean;
  currentPage: number;
  totalPages: number;
  hasFullAccess: boolean;
  previewLimit: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function PageNavigation({
  visible,
  currentPage,
  totalPages,
  hasFullAccess,
  previewLimit,
  onPrev,
  onNext,
  onGoToPage,
  isFirstPage,
  isLastPage,
}: PageNavigationProps) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Navigation Content */}
      <div className="relative px-4 py-6">
        {/* Progress Bar */}
        <div className="max-w-xl mx-auto mb-4">
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const isAccessible = hasFullAccess || i < previewLimit;
              const isCurrent = i === currentPage;
              const isCompleted = i < currentPage;

              return (
                <button
                  key={i}
                  onClick={() => isAccessible && onGoToPage(i)}
                  disabled={!isAccessible}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    isCurrent
                      ? "bg-white scale-y-150"
                      : isCompleted
                      ? "bg-white/70"
                      : isAccessible
                      ? "bg-white/30 hover:bg-white/50"
                      : "bg-white/10 cursor-not-allowed"
                  }`}
                  title={`Page ${i + 1}${!isAccessible ? " (Locked)" : ""}`}
                />
              );
            })}
          </div>
        </div>

        {/* Arrow Navigation */}
        <div className="flex items-center justify-center gap-8">
          {/* Previous */}
          <button
            onClick={onPrev}
            disabled={isFirstPage}
            className={`p-4 rounded-full transition-all ${
              isFirstPage
                ? "bg-white/10 text-white/30 cursor-not-allowed"
                : "bg-white/20 text-white hover:bg-white/30 hover:scale-110"
            }`}
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>

          {/* Page Counter */}
          <div className="text-white text-center">
            <span className="text-3xl font-bold">{currentPage + 1}</span>
            <span className="text-white/50 mx-2">/</span>
            <span className="text-white/70">{totalPages}</span>
          </div>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={isLastPage}
            className={`p-4 rounded-full transition-all ${
              isLastPage
                ? "bg-white/10 text-white/30 cursor-not-allowed"
                : "bg-white/20 text-white hover:bg-white/30 hover:scale-110"
            }`}
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Locked Pages Warning */}
        {!hasFullAccess && currentPage >= previewLimit - 1 && (
          <div className="mt-4 text-center">
            <p className="text-yellow-300 text-sm">
              🔒 Subscribe to unlock all {totalPages} pages
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
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
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
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
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
