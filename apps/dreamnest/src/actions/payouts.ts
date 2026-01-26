"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================
// TYPES
// ============================================================

export interface ContentEventInput {
  book_id: string;
  kid_id?: string | null;
  minutes_read: number;
  pages_read: number;
  completed?: boolean;
  session_id?: string;
  device_type?: string;
}

export interface PurchaseInput {
  book_id: string;
  stripe_payment_intent_id: string;
  stripe_charge_id?: string;
  price_gross: number;
  platform_fee: number;
  processor_fee: number;
  currency?: string;
}

export interface PayoutInput {
  author_id: string;
  type: "ppv" | "subscription_pool" | "bonus" | "advance" | "advance_recoup";
  amount: number;
  currency?: string;
  period_id?: string;
  purchase_id?: string;
  engagement_units?: number;
  pool_share_percent?: number;
  books_contributed?: number;
}

// ============================================================
// CONTENT EVENTS (Engagement Tracking)
// ============================================================

/**
 * Record a content event (reading session)
 * Called when user reads a book
 */
export async function recordContentEvent(input: ContentEventInput) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("content_events")
    .insert({
      user_id: user.id,
      book_id: input.book_id,
      kid_id: input.kid_id || null,
      minutes_read: input.minutes_read,
      pages_read: input.pages_read,
      completed: input.completed || false,
      session_id: input.session_id,
      device_type: input.device_type,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error recording content event:", error);
    throw new Error("Failed to record content event");
  }

  return data;
}

/**
 * Update an existing content event (end session)
 */
export async function updateContentEvent(
  eventId: string,
  updates: Partial<ContentEventInput>
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("content_events")
    .update({
      ...updates,
      ended_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating content event:", error);
    throw new Error("Failed to update content event");
  }

  return data;
}

/**
 * Get user's reading stats
 */
export async function getUserReadingStats() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("content_events")
    .select("minutes_read, pages_read, completed")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching reading stats:", error);
    return null;
  }

  return {
    total_minutes: data.reduce((sum, e) => sum + (e.minutes_read || 0), 0),
    total_pages: data.reduce((sum, e) => sum + (e.pages_read || 0), 0),
    books_completed: data.filter((e) => e.completed).length,
    total_sessions: data.length,
  };
}

// ============================================================
// PURCHASES (PPV)
// ============================================================

/**
 * Check if user has purchased a book
 */
export async function hasUserPurchasedBook(bookId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return false;
  }

  const { data } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .eq("status", "completed")
    .single();

  return !!data;
}

/**
 * Get user's purchases
 */
export async function getUserPurchases() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      *,
      book:books(id, title, cover_asset_id)
    `
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("purchased_at", { ascending: false });

  if (error) {
    console.error("Error fetching purchases:", error);
    return [];
  }

  return data;
}

/**
 * Create a purchase record (called after Stripe payment success)
 */
export async function createPurchase(input: PurchaseInput) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get author royalty splits for the book
  const { data: authorBooks } = await supabase
    .from("author_books")
    .select("author_id, royalty_split_percent")
    .eq("book_id", input.book_id);

  const net_amount =
    input.price_gross - input.platform_fee - input.processor_fee;

  const { data: purchase, error } = await supabase
    .from("purchases")
    .insert({
      user_id: user.id,
      book_id: input.book_id,
      stripe_payment_intent_id: input.stripe_payment_intent_id,
      stripe_charge_id: input.stripe_charge_id,
      price_gross: input.price_gross,
      platform_fee: input.platform_fee,
      processor_fee: input.processor_fee,
      net_amount,
      currency: input.currency || "EUR",
      royalty_split_snapshot: authorBooks,
      status: "completed",
      purchased_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating purchase:", error);
    throw new Error("Failed to create purchase");
  }

  // Create PPV payouts for each author
  if (authorBooks && authorBooks.length > 0) {
    for (const ab of authorBooks) {
      const authorPayout = (net_amount * ab.royalty_split_percent) / 100;

      await supabase.from("payouts").insert({
        author_id: ab.author_id,
        type: "ppv",
        amount: authorPayout,
        currency: input.currency || "EUR",
        purchase_id: purchase.id,
        status: "pending",
      });

      // Update author's pending balance
      await supabase.rpc("increment_author_balance", {
        p_author_id: ab.author_id,
        p_amount: authorPayout,
      });
    }
  }

  revalidatePath("/app/library");
  return purchase;
}

// ============================================================
// PAYOUTS
// ============================================================

/**
 * Get author's payouts
 */
export async function getAuthorPayouts(status?: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return [];
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
    .from("payouts")
    .select(
      `
      *,
      period:revenue_periods(period_month),
      purchase:purchases(book:books(title))
    `
    )
    .eq("author_id", author.id)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching payouts:", error);
    return [];
  }

  return data;
}

/**
 * Get author's earnings summary
 */
export async function getAuthorEarnings() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return null;
  }

  const { data: author } = await supabase
    .from("authors")
    .select("pending_balance, total_earned")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    return null;
  }

  // Get breakdown by type
  const { data: payouts } = await supabase
    .from("payouts")
    .select("type, amount, status")
    .eq(
      "author_id",
      (
        await supabase
          .from("authors")
          .select("id")
          .eq("user_id", user.id)
          .single()
      ).data?.id
    );

  const breakdown = {
    ppv_total: 0,
    pool_total: 0,
    bonus_total: 0,
    pending: 0,
    paid: 0,
  };

  if (payouts) {
    for (const p of payouts) {
      if (p.type === "ppv") breakdown.ppv_total += Number(p.amount);
      if (p.type === "subscription_pool")
        breakdown.pool_total += Number(p.amount);
      if (p.type === "bonus") breakdown.bonus_total += Number(p.amount);
      if (p.status === "pending" || p.status === "approved")
        breakdown.pending += Number(p.amount);
      if (p.status === "paid") breakdown.paid += Number(p.amount);
    }
  }

  return {
    pending_balance: Number(author.pending_balance),
    total_earned: Number(author.total_earned),
    ...breakdown,
  };
}

// ============================================================
// AUTHOR PAYOUT SETTINGS
// ============================================================

/**
 * Update author payout settings
 */
export async function updateAuthorPayoutSettings(settings: {
  payout_account_type?: string;
  payout_email?: string;
  minimum_payout_amount?: number;
  tax_country?: string;
  tax_info_provided?: boolean;
}) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("authors")
    .update(settings)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating payout settings:", error);
    throw new Error("Failed to update payout settings");
  }

  revalidatePath("/author/settings");
  return { success: true };
}

/**
 * Get author payout settings
 */
export async function getAuthorPayoutSettings() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("authors")
    .select(
      `
      id,
      payout_model,
      payout_account_type,
      payout_email,
      minimum_payout_amount,
      pending_balance,
      total_earned,
      tax_info_provided,
      tax_country
    `
    )
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching payout settings:", error);
    return null;
  }

  return data;
}

// ============================================================
// BOOK SALES STATS (for authors)
// ============================================================

/**
 * Get book sales and engagement stats for an author
 */
export async function getAuthorBookStats(bookId?: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return null;
  }

  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    return null;
  }

  // Get books
  let booksQuery = supabase
    .from("books")
    .select("id, title")
    .eq("author_id", author.id);

  if (bookId) {
    booksQuery = booksQuery.eq("id", bookId);
  }

  const { data: books } = await booksQuery;

  if (!books || books.length === 0) {
    return [];
  }

  const stats = [];

  for (const book of books) {
    // Get purchases
    const { count: purchaseCount } = await supabase
      .from("purchases")
      .select("*", { count: "exact", head: true })
      .eq("book_id", book.id)
      .eq("status", "completed");

    // Get engagement
    const { data: engagement } = await supabase
      .from("content_events")
      .select("minutes_read, completed")
      .eq("book_id", book.id);

    const totalMinutes =
      engagement?.reduce((sum, e) => sum + (e.minutes_read || 0), 0) || 0;
    const completions = engagement?.filter((e) => e.completed).length || 0;

    // Get earnings for this book
    const { data: payouts } = await supabase
      .from("payouts")
      .select("amount, type")
      .eq("author_id", author.id)
      .in(
        "purchase_id",
        (
          await supabase.from("purchases").select("id").eq("book_id", book.id)
        ).data?.map((p) => p.id) || []
      );

    const earnings =
      payouts?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    stats.push({
      book_id: book.id,
      title: book.title,
      purchases: purchaseCount || 0,
      total_minutes: totalMinutes,
      completions,
      earnings,
    });
  }

  return stats;
}

// ============================================================
// CO-AUTHOR MANAGEMENT
// ============================================================

/**
 * Add a co-author to a book
 */
export async function addCoAuthor(
  bookId: string,
  authorId: string,
  role: string,
  royaltySplitPercent: number
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify user owns the book
  const { data: book } = await supabase
    .from("books")
    .select("author_id")
    .eq("id", bookId)
    .single();

  const { data: userAuthor } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!book || !userAuthor || book.author_id !== userAuthor.id) {
    throw new Error("Not authorized to edit this book");
  }

  // Check total royalty doesn't exceed 100%
  const { data: existing } = await supabase
    .from("author_books")
    .select("royalty_split_percent")
    .eq("book_id", bookId);

  const currentTotal =
    existing?.reduce((sum, ab) => sum + Number(ab.royalty_split_percent), 0) ||
    0;

  if (currentTotal + royaltySplitPercent > 100) {
    throw new Error("Total royalty split cannot exceed 100%");
  }

  const { error } = await supabase.from("author_books").insert({
    author_id: authorId,
    book_id: bookId,
    role,
    royalty_split_percent: royaltySplitPercent,
    is_primary: false,
  });

  if (error) {
    console.error("Error adding co-author:", error);
    throw new Error("Failed to add co-author");
  }

  revalidatePath(`/author/books/${bookId}`);
  return { success: true };
}

/**
 * Update co-author royalty split
 */
export async function updateCoAuthorSplit(
  bookId: string,
  authorId: string,
  royaltySplitPercent: number
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify user owns the book
  const { data: book } = await supabase
    .from("books")
    .select("author_id")
    .eq("id", bookId)
    .single();

  const { data: userAuthor } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!book || !userAuthor || book.author_id !== userAuthor.id) {
    throw new Error("Not authorized to edit this book");
  }

  const { error } = await supabase
    .from("author_books")
    .update({ royalty_split_percent: royaltySplitPercent })
    .eq("book_id", bookId)
    .eq("author_id", authorId);

  if (error) {
    console.error("Error updating co-author split:", error);
    throw new Error("Failed to update co-author split");
  }

  revalidatePath(`/author/books/${bookId}`);
  return { success: true };
}

/**
 * Remove co-author from book
 */
export async function removeCoAuthor(bookId: string, authorId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify user owns the book
  const { data: book } = await supabase
    .from("books")
    .select("author_id")
    .eq("id", bookId)
    .single();

  const { data: userAuthor } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!book || !userAuthor || book.author_id !== userAuthor.id) {
    throw new Error("Not authorized to edit this book");
  }

  // Cannot remove primary author
  const { data: authorBook } = await supabase
    .from("author_books")
    .select("is_primary")
    .eq("book_id", bookId)
    .eq("author_id", authorId)
    .single();

  if (authorBook?.is_primary) {
    throw new Error("Cannot remove primary author");
  }

  const { error } = await supabase
    .from("author_books")
    .delete()
    .eq("book_id", bookId)
    .eq("author_id", authorId);

  if (error) {
    console.error("Error removing co-author:", error);
    throw new Error("Failed to remove co-author");
  }

  revalidatePath(`/author/books/${bookId}`);
  return { success: true };
}

/**
 * Get co-authors for a book
 */
export async function getBookCoAuthors(bookId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("author_books")
    .select(
      `
      *,
      author:authors(
        id,
        bio,
        user:profiles(display_name, avatar_url)
      )
    `
    )
    .eq("book_id", bookId)
    .order("is_primary", { ascending: false });

  if (error) {
    console.error("Error fetching co-authors:", error);
    return [];
  }

  return data;
}
