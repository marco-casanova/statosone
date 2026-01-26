"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CreateKidInput, UpdateKidInput } from "@/types";

/**
 * List kids for current user
 */
export async function listKids() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("kids")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching kids:", error);
    return [];
  }

  return data || [];
}

/**
 * Get single kid
 */
export async function getKid(kidId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("kids")
    .select("*")
    .eq("id", kidId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching kid:", error);
    throw new Error("Failed to fetch kid profile");
  }

  return data;
}

/**
 * Create kid profile
 */
export async function createKid(input: CreateKidInput) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("kids")
    .insert({
      user_id: user.id,
      name: input.name,
      birthdate: input.birth_date,
      avatar_url: input.avatar_url,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating kid:", error);
    throw new Error("Failed to create kid profile");
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return data;
}

/**
 * Update kid profile
 */
export async function updateKid(kidId: string, updates: UpdateKidInput) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("kids")
    .update({
      name: updates.name,
      birthdate: updates.birth_date,
      avatar_url: updates.avatar_url,
    })
    .eq("id", kidId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating kid:", error);
    throw new Error("Failed to update kid profile");
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return data;
}

/**
 * Delete kid profile
 */
export async function deleteKid(kidId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("kids")
    .delete()
    .eq("id", kidId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting kid:", error);
    throw new Error("Failed to delete kid profile");
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { success: true };
}

/**
 * Get reading stats for a kid
 */
export async function getKidReadingStats(kidId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const { data: kid } = await supabase
    .from("kids")
    .select("id")
    .eq("id", kidId)
    .eq("user_id", user.id)
    .single();

  if (!kid) {
    throw new Error("Kid profile not found");
  }

  // Get reading sessions stats
  const { data: sessions, error } = await supabase
    .from("reading_sessions")
    .select(
      `
      id,
      is_completed,
      total_time_seconds,
      completed_at,
      book:books(id, title)
    `
    )
    .eq("kid_id", kidId);

  if (error) {
    console.error("Error fetching kid stats:", error);
    throw new Error("Failed to fetch reading stats");
  }

  const totalBooks = sessions?.length || 0;
  const completedBooks = sessions?.filter((s) => s.is_completed).length || 0;
  const totalReadingTime =
    sessions?.reduce((sum, s) => sum + (s.total_time_seconds || 0), 0) || 0;

  return {
    totalBooks,
    completedBooks,
    totalReadingTime,
    recentSessions: sessions?.slice(0, 5) || [],
  };
}

/**
 * Get kid's recently read books
 */
export async function getKidRecentBooks(kidId: string, limit = 5) {
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
      )
    `
    )
    .eq("kid_id", kidId)
    .eq("user_id", user.id)
    .order("last_read_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent books:", error);
    return [];
  }

  return data || [];
}

/**
 * Get available avatars for kid profiles
 */
export function getAvailableAvatars() {
  // Predefined avatar options
  return [
    { id: "bear", url: "/avatars/bear.svg", name: "Bear" },
    { id: "bunny", url: "/avatars/bunny.svg", name: "Bunny" },
    { id: "cat", url: "/avatars/cat.svg", name: "Cat" },
    { id: "dog", url: "/avatars/dog.svg", name: "Dog" },
    { id: "elephant", url: "/avatars/elephant.svg", name: "Elephant" },
    { id: "fox", url: "/avatars/fox.svg", name: "Fox" },
    { id: "lion", url: "/avatars/lion.svg", name: "Lion" },
    { id: "owl", url: "/avatars/owl.svg", name: "Owl" },
    { id: "panda", url: "/avatars/panda.svg", name: "Panda" },
    { id: "unicorn", url: "/avatars/unicorn.svg", name: "Unicorn" },
  ];
}
