import { notFound, redirect } from "next/navigation";
import { getBookDetail, listMyBooks } from "@/actions/books";
import { listPages } from "@/actions/pages";
import { listBookAssets } from "@/actions/assets";
import { getUser } from "@/lib/supabase/server";
import { isAuthor } from "@/actions/auth";
import { BookEditor } from "@/components/editor/book-editor";

export const dynamic = "force-dynamic";

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id: bookId } = await params;

  const user = await getUser();

  if (!user) {
    redirect(`/login?redirectTo=/author/books/${bookId}/edit`);
  }

  // Check author permissions
  const hasAuthorRole = await isAuthor();
  if (!hasAuthorRole) {
    redirect("/author/apply");
  }

  const [bookDetail, pages, assets] = await Promise.all([
    getBookDetail(bookId),
    listPages(bookId),
    listBookAssets(bookId),
  ]);

  if (!bookDetail) {
    notFound();
  }

  const book = bookDetail.book;

  // Verify ownership - compare with author_user_id from the view
  const authorUserId = (book as any).author_user_id;
  if (authorUserId !== user.id) {
    redirect("/author");
  }

  return <BookEditor book={book} pages={pages} assets={assets} />;
}
