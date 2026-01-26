import { Suspense } from "react";
import { listBooks } from "@/actions/books";
import { getContinueReading } from "@/actions/reading-sessions";
import { getBookmarks } from "@/actions/bookmarks";
import { hasActiveSubscription } from "@/actions/subscriptions";
import { BookCard } from "@/components/library/book-card";
import { ContinueReadingCarousel } from "@/components/library/continue-reading-carousel";
import { CategoryTabs } from "@/components/library/category-tabs";
import { SearchBar } from "@/components/library/search-bar";
import { SubscriptionBanner } from "@/components/library/subscription-banner";

export const dynamic = "force-dynamic";

interface LibraryPageProps {
  searchParams: Promise<{
    category?: string;
    age?: string;
    search?: string;
  }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;

  const [booksData, continueReading, bookmarks, isSubscribed] =
    await Promise.all([
      listBooks({
        category: params.category,
        ageGroup: params.age,
        search: params.search,
      }),
      getContinueReading(5),
      getBookmarks(),
      hasActiveSubscription(),
    ]);

  const books = booksData.books;
  const bookmarkedIds = new Set(bookmarks.map((b) => b.book_id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Subscription Banner for Free Users */}
      {!isSubscribed && <SubscriptionBanner />}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            DreamNest Library
          </h1>
          <p className="text-purple-600">
            Discover magical stories to share with your little ones
          </p>
        </header>

        {/* Search */}
        <div className="mb-8">
          <SearchBar defaultValue={params.search} />
        </div>

        {/* Continue Reading Section */}
        {continueReading.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">
              Continue Reading
            </h2>
            <ContinueReadingCarousel sessions={continueReading} />
          </section>
        )}

        {/* Category Tabs */}
        <section className="mb-8">
          <CategoryTabs
            activeCategory={params.category}
            activeAge={params.age}
          />
        </section>

        {/* Book Grid */}
        <Suspense fallback={<BookGridSkeleton />}>
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-purple-800">
                {params.category || "All Books"}
              </h2>
              <span className="text-purple-500">{books.length} books</span>
            </div>

            {books.length === 0 ? (
              <EmptyState search={params.search} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isBookmarked={bookmarkedIds.has(book.id)}
                    isLocked={!isSubscribed}
                  />
                ))}
              </div>
            )}
          </section>
        </Suspense>
      </div>
    </div>
  );
}

function BookGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="bg-purple-100 rounded-xl animate-pulse aspect-[3/4]"
        />
      ))}
    </div>
  );
}

function EmptyState({ search }: { search?: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📚</div>
      {search ? (
        <>
          <h3 className="text-xl font-semibold text-purple-800 mb-2">
            No books found
          </h3>
          <p className="text-purple-500">
            We couldn&apos;t find any books matching &ldquo;{search}&rdquo;
          </p>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-purple-800 mb-2">
            No books available
          </h3>
          <p className="text-purple-500">
            Check back soon for new magical stories!
          </p>
        </>
      )}
    </div>
  );
}
