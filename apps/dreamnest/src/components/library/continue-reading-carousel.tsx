"use client";

import Link from "next/link";
import Image from "next/image";

interface ReadingSession {
  id: string;
  current_page_index: number;
  book: {
    id: string;
    title: string;
    page_count: number;
    cover?: { file_path: string } | null;
  };
  kid?: { id: string; name: string } | null;
}

interface ContinueReadingCarouselProps {
  sessions: ReadingSession[];
}

export function ContinueReadingCarousel({
  sessions,
}: ContinueReadingCarouselProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
      {sessions.map((session) => (
        <ContinueReadingCard key={session.id} session={session} />
      ))}
    </div>
  );
}

function ContinueReadingCard({ session }: { session: ReadingSession }) {
  const progress = Math.round(
    ((session.current_page_index + 1) / session.book.page_count) * 100
  );

  return (
    <Link
      href={`/app/books/${session.book.id}/read?page=${session.current_page_index}`}
      className="flex-shrink-0 w-72 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="flex">
        {/* Book Cover */}
        <div className="relative w-24 h-32 bg-purple-100 flex-shrink-0">
          {session.book.cover?.file_path ? (
            <Image
              src={session.book.cover.file_path}
              alt={session.book.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl">
              📖
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col">
          <h3 className="font-semibold text-purple-900 text-sm line-clamp-2 mb-1">
            {session.book.title}
          </h3>

          {session.kid && (
            <p className="text-xs text-purple-500 mb-2">
              with {session.kid.name}
            </p>
          )}

          {/* Progress Bar */}
          <div className="mt-auto">
            <div className="flex justify-between text-xs text-purple-500 mb-1">
              <span>
                Page {session.current_page_index + 1} of{" "}
                {session.book.page_count}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resume Button */}
      <div className="px-4 pb-4">
        <div className="bg-purple-600 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
          Continue Reading
        </div>
      </div>
    </Link>
  );
}
