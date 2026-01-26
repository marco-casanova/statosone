"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ReadingMode, UpsertReadingSessionInput } from "@/types";

/**
 * Get or create reading session for a book
 */
export async function getReadingSession(bookId: string, kidId?: string | null) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("reading_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .is("kid_id", kidId || null)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("Error fetching reading session:", error);
    throw new Error("Failed to fetch reading session");
  }

  return data;
}

/**
 * Update reading session (or create if doesn't exist)
 */
export async function updateReadingSession(input: UpsertReadingSessionInput) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("reading_sessions")
    .upsert(
      {
        user_id: user.id,
        book_id: input.book_id,
        kid_id: input.kid_id || null,
        current_page_index: input.current_page_index ?? 0,
        mode: input.mode ?? "manual",
        is_completed: input.is_completed ?? false,
        completed_at: input.is_completed ? new Date().toISOString() : null,
        total_time_seconds: input.total_time_seconds ?? 0,
        last_read_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,book_id,kid_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error updating reading session:", error);
    throw new Error("Failed to update reading session");
  }

  return data;
}

/**
 * Update current page (lightweight update for navigation)
 */
export async function updateCurrentPage(
  bookId: string,
  pageIndex: number,
  kidId?: string | null
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("reading_sessions").upsert(
    {
      user_id: user.id,
      book_id: bookId,
      kid_id: kidId || null,
      current_page_index: pageIndex,
      last_read_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,book_id,kid_id",
    }
  );

  if (error) {
    console.error("Error updating current page:", error);
    throw new Error("Failed to update current page");
  }

  return { success: true };
}

/**
 * Mark book as completed
 */
export async function markBookCompleted(bookId: string, kidId?: string | null) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("reading_sessions").upsert(
    {
      user_id: user.id,
      book_id: bookId,
      kid_id: kidId || null,
      is_completed: true,
      completed_at: new Date().toISOString(),
      last_read_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,book_id,kid_id",
    }
  );

  if (error) {
    console.error("Error marking book completed:", error);
    throw new Error("Failed to mark book as completed");
  }

  revalidatePath("/app");
  return { success: true };
}

/**
 * Update reading mode
 */
export async function updateReadingMode(
  bookId: string,
  mode: ReadingMode,
  kidId?: string | null
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("reading_sessions").upsert(
    {
      user_id: user.id,
      book_id: bookId,
      kid_id: kidId || null,
      mode,
      last_read_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,book_id,kid_id",
    }
  );

  if (error) {
    console.error("Error updating reading mode:", error);
    throw new Error("Failed to update reading mode");
  }

  return { success: true };
}

/**
 * Increment reading time (called periodically)
 */
export async function incrementReadingTime(
  bookId: string,
  seconds: number,
  kidId?: string | null
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get current session to increment time
  const { data: session } = await supabase
    .from("reading_sessions")
    .select("total_time_seconds")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .is("kid_id", kidId || null)
    .single();

  const newTime = (session?.total_time_seconds || 0) + seconds;

  const { error } = await supabase.from("reading_sessions").upsert(
    {
      user_id: user.id,
      book_id: bookId,
      kid_id: kidId || null,
      total_time_seconds: newTime,
      last_read_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,book_id,kid_id",
    }
  );

  if (error) {
    console.error("Error incrementing reading time:", error);
    throw new Error("Failed to increment reading time");
  }

  return { success: true, totalTime: newTime };
}

/**
 * Get continue reading list (recent unfinished books)
 */
export async function getContinueReading(limit = 5) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("reading_sessions")
    .select(
      `
      *,
      book:books(
        id,
        title,
        page_count,
        cover:assets!cover_asset_id(file_path)
      ),
      kid:kids(id, name)
    `
    )
    .eq("user_id", user.id)
    .eq("is_completed", false)
    .order("last_read_at", { ascending: false })
    .limit(limit);

  if (error) {
    // Log detailed error for debugging - common causes:
    // - Table doesn't exist (migrations not run)
    // - Foreign key relationship not recognized
    console.error(
      "Error fetching continue reading:",
      error.message || error.code || JSON.stringify(error)
    );
    return [];
  }

  return data || [];
}

/**
 * Get completed books
 */
export async function getCompletedBooks(limit = 10) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("reading_sessions")
    .select(
      `
      *,
      book:books(
        id,
        title,
        cover:assets!cover_asset_id(file_path)
      ),
      kid:kids(id, name)
    `
    )
    .eq("user_id", user.id)
    .eq("is_completed", true)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching completed books:", error);
    return [];
  }

  return data || [];
}
