"use client";

import { useState } from "react";
import { toggleBookmark } from "@/actions/bookmarks";

interface BookmarkButtonProps {
  bookId: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({
  bookId,
  initialBookmarked,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const result = await toggleBookmark(bookId);
      setBookmarked(result.bookmarked);
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`p-3 rounded-full transition-all ${
        bookmarked
          ? "bg-pink-500 text-white hover:bg-pink-600"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
      title={bookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {bookmarked ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
}
