import Link from "next/link";
import Image from "next/image";

interface Book {
  id: string;
  title: string;
  cover_url?: string | null;
  page_count?: number;
}

interface Page {
  id: string;
  page_index: number;
}

interface SubscriptionGateProps {
  book: Book;
  previewPages: Page[];
  currentPage: number;
}

export function SubscriptionGate({
  book,
  previewPages,
  currentPage,
}: SubscriptionGateProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 to-purple-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-r from-purple-500 to-pink-500">
          {book.cover_url && (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-2">🔒</div>
              <h2 className="text-2xl font-bold">Preview Complete</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <h3 className="text-xl font-semibold text-purple-900 mb-2">
            {book.title}
          </h3>
          <p className="text-purple-600 mb-6">
            You&apos;ve read {previewPages.length} preview pages. Subscribe to
            continue reading all {book.page_count} pages!
          </p>

          {/* Features */}
          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-center gap-3 text-purple-700">
              <span className="text-xl">📚</span>
              Unlimited access to all stories
            </li>
            <li className="flex items-center gap-3 text-purple-700">
              <span className="text-xl">🎧</span>
              Audio narration on every book
            </li>
            <li className="flex items-center gap-3 text-purple-700">
              <span className="text-xl">👨‍👩‍👧‍👦</span>
              Track reading progress for each child
            </li>
            <li className="flex items-center gap-3 text-purple-700">
              <span className="text-xl">✨</span>
              New books added weekly
            </li>
          </ul>

          {/* Pricing */}
          <div className="bg-purple-50 rounded-xl p-6 mb-6">
            <div className="text-3xl font-bold text-purple-900 mb-1">
              $9.99
              <span className="text-lg font-normal text-purple-600">/mo</span>
            </div>
            <p className="text-purple-600 text-sm">or $79.99/year (save 33%)</p>
            <p className="text-purple-500 text-sm mt-2">
              ✨ Start with 7-day free trial
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Start Free Trial
            </Link>
            <Link
              href={`/app/books/${book.id}`}
              className="block w-full py-3 bg-purple-100 text-purple-700 font-medium rounded-xl hover:bg-purple-200 transition-colors"
            >
              Back to Book Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
