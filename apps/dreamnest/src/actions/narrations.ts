"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { NarrationInput } from "@/types";

/**
 * Get narration for a page
 */
export async function getNarration(pageId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("page_narrations")
    .select("*")
    .eq("page_id", pageId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching narration:", error);
    throw new Error("Failed to fetch narration");
  }

  return data;
}

/**
 * Create or update narration for a page
 */
export async function upsertNarration(input: NarrationInput) {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Check if narration exists
  const { data: existing } = await supabase
    .from("page_narrations")
    .select("id")
    .eq("page_id", input.page_id)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from("page_narrations")
      .update({
        mode: input.mode,
        audio_asset_id: input.audio_asset_id,
        tts_text: input.tts_text,
        tts_voice: input.tts_voice,
        duration_ms: input.duration_ms,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating narration:", error);
      throw new Error("Failed to update narration");
    }

    return data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from("page_narrations")
      .insert({
        page_id: input.page_id,
        mode: input.mode,
        audio_asset_id: input.audio_asset_id,
        tts_text: input.tts_text,
        tts_voice: input.tts_voice,
        duration_ms: input.duration_ms,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating narration:", error);
      throw new Error("Failed to create narration");
    }

    return data;
  }
}

/**
 * Delete narration for a page
 */
export async function deleteNarration(pageId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("page_narrations")
    .delete()
    .eq("page_id", pageId);

  if (error) {
    console.error("Error deleting narration:", error);
    throw new Error("Failed to delete narration");
  }

  return { success: true };
}
