import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBookDetail } from "@/actions/books";
import { getUser } from "@/lib/supabase/server";
import { isBookmarked, toggleBookmark } from "@/actions/bookmarks";
import { canAccessFullContent } from "@/actions/subscriptions";
import { BookmarkButton } from "@/components/library/bookmark-button";
import { getAssetPublicUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id: bookId } = await params;
  const user = await getUser();

  const bookDetail = await getBookDetail(bookId);

  if (!bookDetail) {
    notFound();
  }

  const book = bookDetail.book;
  const pages = bookDetail.pages || [];

  // Check if user has full access
  const hasFullAccess = user ? await canAccessFullContent(bookId) : false;
  const bookmarked = user ? await isBookmarked(bookId) : false;

  // Get author name from flattened view fields
  const authorName = (book as any).author_display_name || "Unknown Author";

  // Get cover URL from flattened view fields
  const coverUrl = (book as any).cover_file_path
    ? getAssetPublicUrl((book as any).cover_file_path)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/app/library"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Library
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Book Cover */}
          <div className="md:col-span-1">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-purple-100">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-8xl">
                  📖
                </div>
              )}
            </div>
          </div>

          {/* Book Info */}
          <div className="md:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-purple-900 mb-2">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-xl text-purple-600 mb-2">
                    {book.subtitle}
                  </p>
                )}
                <p className="text-gray-600">By {authorName}</p>
              </div>
              {user && (
                <BookmarkButton
                  bookId={bookId}
                  initialBookmarked={bookmarked}
                />
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full text-sm text-purple-700">
                <span>📚</span>
                {book.page_count} pages
              </div>
              <div className="flex items-center gap-2 bg-pink-100 px-3 py-1 rounded-full text-sm text-pink-700">
                <span>👶</span>
                Ages {book.age_min}-{book.age_max}
              </div>
              {book.estimated_read_time_minutes && (
                <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full text-sm text-amber-700">
                  <span>⏱️</span>
                  {book.estimated_read_time_minutes} min read
                </div>
              )}
            </div>

            {/* Description */}
            {book.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  About this book
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            {/* Access Status */}
            {!hasFullAccess && user && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 text-amber-700">
                  <span>🔒</span>
                  <span>Preview mode - Subscribe for full access</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={
                  user
                    ? `/app/books/${bookId}/read`
                    : `/login?redirectTo=/app/books/${bookId}/read`
                }
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                {hasFullAccess ? "Read Now" : "Preview Book"}
              </Link>

              {!user && (
                <Link
                  href="/login"
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-purple-300 text-purple-600 rounded-xl text-lg font-semibold hover:bg-purple-50 transition-all"
                >
                  Sign in to Read
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Page Preview */}
        {pages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-purple-900 mb-6">
              Preview Pages
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pages.slice(0, 6).map((page: any, index: number) => (
                <Link
                  key={page.id}
                  href={`/app/books/${bookId}/read?page=${index}`}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-purple-500 transition-all"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: page.background_color || "#ffffff",
                    }}
                  >
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                      Page {index + 1}
                    </div>
                  </div>
                  {!hasFullAccess && index >= 3 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
