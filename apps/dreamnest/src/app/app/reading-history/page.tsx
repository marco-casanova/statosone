"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getContinueReading,
  getCompletedBooks,
} from "@/actions/reading-sessions";

interface BookCover {
  file_path: string | null;
}

interface BookInfo {
  id: string;
  title: string;
  page_count?: number;
  cover: BookCover | null;
}

interface KidInfo {
  id: string;
  name: string;
}

interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  kid_id: string | null;
  current_page_index: number;
  mode: string;
  is_completed: boolean;
  completed_at: string | null;
  total_time_seconds: number;
  last_read_at: string;
  book: BookInfo | null;
  kid: KidInfo | null;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

export default function ReadingHistoryPage() {
  const [activeTab, setActiveTab] = useState<"in-progress" | "completed">(
    "in-progress"
  );
  const [inProgressBooks, setInProgressBooks] = useState<ReadingSession[]>([]);
  const [completedBooks, setCompletedBooks] = useState<ReadingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [inProgress, completed] = await Promise.all([
          getContinueReading(20),
          getCompletedBooks(20),
        ]);
        setInProgressBooks(inProgress as ReadingSession[]);
        setCompletedBooks(completed as ReadingSession[]);
      } catch (error) {
        console.error("Failed to load reading history:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentBooks =
    activeTab === "in-progress" ? inProgressBooks : completedBooks;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reading History</h1>
          <p className="text-gray-600 mt-2">
            Track your reading progress and see what you&apos;ve completed
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("in-progress")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "in-progress"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📚 In Progress ({inProgressBooks.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "completed"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            ✅ Completed ({completedBooks.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : currentBooks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">
              {activeTab === "in-progress" ? "📖" : "🎉"}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === "in-progress"
                ? "No books in progress"
                : "No completed books yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === "in-progress"
                ? "Start reading a book from the library to track your progress here."
                : "Finish reading a book to see it in your completed list."}
            </p>
            <Link
              href="/app/library"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Library
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentBooks.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link
                  href={`/app/books/${session.book_id}/read`}
                  className="flex items-center gap-4 p-4"
                >
                  {/* Book Cover */}
                  <div className="relative w-20 h-28 flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden">
                    {session.book?.cover?.file_path ? (
                      <Image
                        src={session.book.cover.file_path}
                        alt={session.book?.title || "Book cover"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        📕
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {session.book?.title || "Unknown Book"}
                    </h3>

                    {session.kid && (
                      <p className="text-sm text-purple-600">
                        👤 Reading with {session.kid.name}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      {activeTab === "in-progress" ? (
                        <>
                          <span>
                            📄 Page {session.current_page_index + 1}
                            {session.book?.page_count
                              ? ` of ${session.book.page_count}`
                              : ""}
                          </span>
                          {session.book?.page_count &&
                            session.book.page_count > 0 && (
                              <span className="text-purple-600 font-medium">
                                {Math.round(
                                  ((session.current_page_index + 1) /
                                    session.book.page_count) *
                                    100
                                )}
                                % complete
                              </span>
                            )}
                        </>
                      ) : (
                        <span>
                          🎉 Completed{" "}
                          {session.completed_at
                            ? formatDate(session.completed_at)
                            : ""}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>⏱️ {formatTime(session.total_time_seconds)}</span>
                      <span>
                        📅 Last read {formatDate(session.last_read_at)}
                      </span>
                    </div>

                    {/* Progress Bar for in-progress books */}
                    {activeTab === "in-progress" &&
                      session.book?.page_count &&
                      session.book.page_count > 0 && (
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                ((session.current_page_index + 1) /
                                  session.book.page_count) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                  </div>

                  {/* Action Arrow */}
                  <div className="flex-shrink-0 text-gray-400">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {!loading &&
          (inProgressBooks.length > 0 || completedBooks.length > 0) && (
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                📊 Reading Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {completedBooks.length}
                  </div>
                  <div className="text-sm text-gray-600">Books Finished</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {inProgressBooks.length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatTime(
                      [...inProgressBooks, ...completedBooks].reduce(
                        (acc, s) => acc + s.total_time_seconds,
                        0
                      )
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Time</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {inProgressBooks.length + completedBooks.length}
                  </div>
                  <div className="text-sm text-gray-600">Books Started</div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
