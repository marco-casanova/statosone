"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toggleBookmark } from "@/actions/bookmarks";
import type { BookListItem } from "@/types";

interface BookCardProps {
  book: BookListItem;
  isBookmarked: boolean;
  isLocked?: boolean;
}

export function BookCard({ book, isBookmarked, isLocked }: BookCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsToggling(true);
    try {
      const result = await toggleBookmark(book.id);
      setBookmarked(result.bookmarked);
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Link
      href={`/app/books/${book.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] bg-purple-100">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            📖
          </div>
        )}

        {/* Lock Overlay for Non-Subscribers */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-3">
              <span className="text-2xl">🔒</span>
            </div>
          </div>
        )}

        {/* Bookmark Button */}
        <button
          onClick={handleToggleBookmark}
          disabled={isToggling}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
            bookmarked
              ? "bg-pink-500 text-white"
              : "bg-white/80 text-gray-600 hover:bg-white"
          } ${isToggling ? "opacity-50" : ""}`}
        >
          <HeartIcon filled={bookmarked} />
        </button>

        {/* Age Badge */}
        {book.age_min !== undefined && book.age_max !== undefined && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
            {formatAgeGroup({ min: book.age_min, max: book.age_max })}
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-purple-900 text-sm line-clamp-2 mb-1 group-hover:text-purple-600">
          {book.title}
        </h3>
        <p className="text-xs text-purple-500 mt-auto">
          {book.page_count} pages
        </p>
      </div>
    </Link>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  return (
    <svg
      className="w-5 h-5"
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
  );
}

function formatAgeGroup(age: { min: number; max: number }): string {
  if (age.min === age.max) {
    return `${age.min}+`;
  }
  return `${age.min}-${age.max}`;
}
