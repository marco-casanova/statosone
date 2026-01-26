"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Get all bookmarks for current user
 */
export async function getBookmarks() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select(
      `
      *,
      book:books(
        id,
        title,
        description,
        page_count,
        cover:assets!cover_asset_id(file_path)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }

  return data || [];
}

/**
 * Check if book is bookmarked
 */
export async function isBookmarked(bookId: string): Promise<boolean> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking bookmark:", error);
  }

  return !!data;
}

/**
 * Toggle bookmark for a book
 */
export async function toggleBookmark(
  bookId: string
): Promise<{ bookmarked: boolean }> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if already bookmarked
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .single();

  if (existing) {
    // Remove bookmark
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", existing.id);

    if (error) {
      console.error("Error removing bookmark:", error);
      throw new Error("Failed to remove bookmark");
    }

    revalidatePath("/app");
    revalidatePath("/app/bookmarks");
    return { bookmarked: false };
  } else {
    // Add bookmark
    const { error } = await supabase.from("bookmarks").insert({
      user_id: user.id,
      book_id: bookId,
    });

    if (error) {
      console.error("Error adding bookmark:", error);
      throw new Error("Failed to add bookmark");
    }

    revalidatePath("/app");
    revalidatePath("/app/bookmarks");
    return { bookmarked: true };
  }
}

/**
 * Add bookmark
 */
export async function addBookmark(bookId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    book_id: bookId,
  });

  if (error) {
    // Ignore duplicate error
    if (error.code !== "23505") {
      console.error("Error adding bookmark:", error);
      throw new Error("Failed to add bookmark");
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/bookmarks");
  return { success: true };
}

/**
 * Remove bookmark
 */
export async function removeBookmark(bookId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("book_id", bookId);

  if (error) {
    console.error("Error removing bookmark:", error);
    throw new Error("Failed to remove bookmark");
  }

  revalidatePath("/app");
  revalidatePath("/app/bookmarks");
  return { success: true };
}

/**
 * Get bookmark count for a book
 */
export async function getBookmarkCount(bookId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("book_id", bookId);

  if (error) {
    console.error("Error fetching bookmark count:", error);
    return 0;
  }

  return count || 0;
}
