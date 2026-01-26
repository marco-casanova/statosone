import { notFound, redirect } from "next/navigation";
import { getBookDetail } from "@/actions/books";
import { listPages } from "@/actions/pages";
import { getReadingSession } from "@/actions/reading-sessions";
import { canAccessFullContent } from "@/actions/subscriptions";
import { getUser } from "@/lib/supabase/server";
import { BookReader } from "@/components/reader/book-reader";
import { SubscriptionGate } from "@/components/reader/subscription-gate";

export const dynamic = "force-dynamic";

interface ReadPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; kid?: string }>;
}

export default async function ReadPage({
  params,
  searchParams,
}: ReadPageProps) {
  const { id: bookId } = await params;
  const { page: pageParam, kid: kidId } = await searchParams;

  const user = await getUser();

  if (!user) {
    redirect(`/login?redirectTo=/app/books/${bookId}/read`);
  }

  const [bookDetail, pages, session, hasAccess] = await Promise.all([
    getBookDetail(bookId),
    listPages(bookId),
    getReadingSession(bookId, kidId),
    canAccessFullContent(bookId),
  ]);

  if (!bookDetail) {
    notFound();
  }

  const book = bookDetail.book;

  // Determine starting page
  const startPage = pageParam
    ? parseInt(pageParam, 10)
    : session?.current_page_index ?? 0;

  // Preview limit for non-subscribers
  const previewLimit = 3;
  const canReadPage = (pageIndex: number) =>
    hasAccess || pageIndex < previewLimit;

  // Check if current page is accessible
  if (!canReadPage(startPage)) {
    return (
      <SubscriptionGate
        book={book}
        previewPages={pages.slice(0, previewLimit)}
        currentPage={startPage}
      />
    );
  }

  return (
    <BookReader
      book={book}
      pages={pages}
      initialPage={startPage}
      kidId={kidId}
      hasFullAccess={hasAccess}
      previewLimit={previewLimit}
      existingSession={session}
    />
  );
}
