"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Book,
  BookFilters,
  BookWithRelations,
  CreateBookInput,
  UpdateBookInput,
} from "@/types";

const BOOKS_PER_PAGE = 12;

/**
 * List books with filters (public library)
 * Uses books_with_author view to avoid PostgREST nested join issues
 */
export async function listBooks(filters: BookFilters = {}) {
  const supabase = await createClient();

  const page = filters.page || 1;
  const limit = filters.limit || BOOKS_PER_PAGE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Use the view for clean author data (avoids profiles_2 join issues)
  let query = supabase
    .from("books_with_author")
    .select(
      `
      *,
      categories:book_categories(
        category:categories(*)
      )
    `,
      { count: "exact" }
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  // Age filter
  if (filters.age_min !== undefined) {
    query = query.gte("age_max", filters.age_min);
  }
  if (filters.age_max !== undefined) {
    query = query.lte("age_min", filters.age_max);
  }

  // Featured filter
  if (filters.is_featured) {
    query = query.eq("is_featured", true);
  }

  // Search filter
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    // Log the error but don't throw - return empty list instead
    console.error(
      "Error listing books:",
      error.message || error.code || JSON.stringify(error)
    );
    return {
      books: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // Filter by categories if specified (post-query due to m2m)
  let filteredData = data || [];
  if (filters.category_ids?.length) {
    filteredData = filteredData.filter((book: any) =>
      book.categories.some((bc: any) =>
        filters.category_ids!.includes(bc.category.id)
      )
    );
  }

  return {
    books: filteredData,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
}

/**
 * Get book detail with pages and blocks
 */
export async function getBookDetail(bookId: string) {
  const supabase = await createClient();
  const user = await getUser();

  // Check subscription status for content gating
  let hasSubscription = false;
  let isAuthorOrAdmin = false;

  if (user) {
    // Check subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single();

    hasSubscription =
      subscription?.status === "active" || subscription?.status === "trialing";

    // Check if user is author of this book
    const { data: author } = await supabase
      .from("authors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (author) {
      const { data: book } = await supabase
        .from("books")
        .select("author_id")
        .eq("id", bookId)
        .single();

      isAuthorOrAdmin = book?.author_id === author.id;
    }

    // Check if admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      isAuthorOrAdmin = true;
    }
  }

  const canAccessAll = hasSubscription || isAuthorOrAdmin;

  // Get book details using view to avoid PostgREST nested join issues
  const { data: book, error: bookError } = await supabase
    .from("books_with_author")
    .select(
      `
      *,
      categories:book_categories(
        category:categories(*)
      )
    `
    )
    .eq("id", bookId)
    .single();

  if (bookError || !book) {
    return null;
  }

  // Get pages with blocks
  let pagesQuery = supabase
    .from("book_pages")
    .select(
      `
      *,
      blocks:page_blocks(*),
      narration:page_narrations(*)
    `
    )
    .eq("book_id", bookId)
    .order("page_index");

  // Limit pages for non-subscribers
  if (!canAccessAll) {
    pagesQuery = pagesQuery.lt("page_index", 3);
  }

  const { data: pages } = await pagesQuery;

  // Get reading session if logged in
  let readingSession = null;
  let bookmarks: number[] = [];

  if (user) {
    const { data: session } = await supabase
      .from("reading_sessions")
      .select("current_page_index, mode, is_completed")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .single();

    readingSession = session;

    const { data: bookmarkData } = await supabase
      .from("bookmarks")
      .select("page_index")
      .eq("user_id", user.id)
      .eq("book_id", bookId);

    bookmarks = bookmarkData?.map((b) => b.page_index) || [];
  }

  return {
    book,
    pages: pages || [],
    isPreviewOnly: !canAccessAll,
    totalPages: book.page_count,
    readingSession,
    bookmarks,
  };
}

/**
 * Author: List my books
 */
export async function listMyBooks(status?: Book["status"]) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get author ID
  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    return [];
  }

  let query = supabase
    .from("books")
    .select(
      `
      *,
      cover:assets!cover_asset_id(file_path)
    `
    )
    .eq("author_id", author.id)
    .order("updated_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Failed to load books");
  }

  return data || [];
}

/**
 * Author: Create a new book
 */
export async function createBook(input: CreateBookInput) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get or create author record
  let { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    // Create author record and update profile role
    const { data: newAuthor, error: authorError } = await supabase
      .from("authors")
      .insert({ user_id: user.id })
      .select()
      .single();

    if (authorError) {
      throw new Error("Failed to create author profile");
    }

    await supabase
      .from("profiles")
      .update({ role: "author" })
      .eq("id", user.id);

    author = newAuthor;
  }

  if (!author) {
    throw new Error("Failed to get or create author profile");
  }

  // Create book
  const { data: book, error: bookError } = await supabase
    .from("books")
    .insert({
      author_id: author.id,
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      age_min: input.age_min || 2,
      age_max: input.age_max || 8,
      design_width: input.design_width || 1024,
      design_height: input.design_height || 768,
      language: input.language || "en",
      status: "draft",
    })
    .select()
    .single();

  if (bookError) {
    throw new Error("Failed to create book");
  }

  // Add categories if provided
  if (input.category_ids?.length) {
    await supabase.from("book_categories").insert(
      input.category_ids.map((categoryId) => ({
        book_id: book.id,
        category_id: categoryId,
      }))
    );
  }

  // Create first page
  const { data: page, error: pageError } = await supabase
    .from("book_pages")
    .insert({
      book_id: book.id,
      page_index: 0,
      layout_mode: "canvas",
      border_frame_id: null,
      page_text: "Add text",
    })
    .select()
    .single();

  if (pageError) {
    throw new Error("Failed to create first page");
  }

  revalidatePath("/author/books");

  return { book, firstPage: page };
}

/**
 * Author: Update book
 */
export async function updateBook(bookId: string, input: UpdateBookInput) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("books")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookId)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update book");
  }

  revalidatePath(`/author/books/${bookId}`);
  revalidatePath("/author/books");

  return data;
}

/**
 * Author: Submit book for review
 */
export async function submitBookForReview(bookId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Validate book has minimum requirements
  const { data: book } = await supabase
    .from("books")
    .select("*, pages:book_pages(count)")
    .eq("id", bookId)
    .single();

  if (!book) {
    throw new Error("Book not found");
  }

  if (book.page_count < 5) {
    throw new Error("Book must have at least 5 pages");
  }

  if (!book.title || !book.description) {
    throw new Error("Book must have title and description");
  }

  const { error } = await supabase
    .from("books")
    .update({
      status: "in_review",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", bookId);

  if (error) {
    throw new Error("Failed to submit book");
  }

  revalidatePath(`/author/books/${bookId}`);
  revalidatePath("/author/books");

  return { success: true };
}

/**
 * Admin: Publish book
 */
export async function publishBook(bookId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("books")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", bookId);

  if (error) {
    throw new Error("Failed to publish book");
  }

  revalidatePath(`/admin/books/${bookId}`);
  revalidatePath("/admin/books");
  revalidatePath("/library");

  return { success: true };
}

/**
 * Admin: Reject book
 */
export async function rejectBook(bookId: string, reason: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("books")
    .update({
      status: "draft",
      rejection_reason: reason,
    })
    .eq("id", bookId);

  if (error) {
    throw new Error("Failed to reject book");
  }

  revalidatePath(`/admin/books/${bookId}`);
  revalidatePath("/admin/books");

  return { success: true };
}
