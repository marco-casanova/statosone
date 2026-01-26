"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  CreateBlockInput,
  UpdateBlockInput,
  BlockLayout,
  BlockContent,
  BlockStyle,
} from "@/types";

/**
 * Get the author record ID for a user
 */
async function getAuthorId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", userId)
    .single();
  return author?.id;
}

/**
 * Create a new block on a page
 */
export async function createBlock(input: CreateBlockInput) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify user has an author record
  const authorId = await getAuthorId(supabase, user.id);
  if (!authorId) {
    throw new Error("Author record not found. Please contact support.");
  }

  // Verify the page belongs to a book owned by this author
  const { data: page } = await supabase
    .from("book_pages")
    .select("book_id, books!inner(author_id, status)")
    .eq("id", input.page_id)
    .single();

  const pageBooks = page?.books as unknown as
    | { author_id: string; status: string }
    | undefined;
  if (!page || pageBooks?.author_id !== authorId) {
    throw new Error("Not authorized to add blocks to this page");
  }

  if (!["draft", "in_review"].includes(pageBooks?.status || "")) {
    throw new Error("Cannot modify blocks on a published book");
  }

  const { data, error } = await supabase
    .from("page_blocks")
    .insert({
      page_id: input.page_id,
      type: input.type,
      block_index: input.block_index,
      content: input.content || {},
      layout: input.layout || {},
      style: input.style || {},
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating block:", error);
    throw new Error(`Failed to create block: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing block
 */
export async function updateBlock(blockId: string, input: UpdateBlockInput) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const updateData: Record<string, unknown> = {};

  if (input.content !== undefined) {
    updateData.content = input.content;
  }
  if (input.layout !== undefined) {
    updateData.layout = input.layout;
  }
  if (input.style !== undefined) {
    updateData.style = input.style;
  }
  if (input.block_index !== undefined) {
    updateData.block_index = input.block_index;
  }

  const { data, error } = await supabase
    .from("page_blocks")
    .update(updateData)
    .eq("id", blockId)
    .select()
    .single();

  if (error) {
    console.error("Error updating block:", error);
    throw new Error("Failed to update block");
  }

  return data;
}

/**
 * Update block position (optimized for drag operations)
 */
export async function updateBlockPosition(
  blockId: string,
  layout: Partial<BlockLayout>
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get current block to merge layout
  const { data: current } = await supabase
    .from("page_blocks")
    .select("layout")
    .eq("id", blockId)
    .single();

  const newLayout = {
    ...((current?.layout as BlockLayout) || {}),
    ...layout,
  };

  const { data, error } = await supabase
    .from("page_blocks")
    .update({ layout: newLayout })
    .eq("id", blockId)
    .select()
    .single();

  if (error) {
    console.error("Error updating block position:", error);
    throw new Error("Failed to update block position");
  }

  return data;
}

/**
 * Delete a block
 */
export async function deleteBlock(blockId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("page_blocks")
    .delete()
    .eq("id", blockId);

  if (error) {
    console.error("Error deleting block:", error);
    throw new Error("Failed to delete block");
  }

  return { success: true };
}

/**
 * Reorder blocks within a page
 */
export async function reorderBlocks(pageId: string, blockIds: string[]) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Update each block's index
  const updates = blockIds.map((id, index) => ({
    id,
    block_index: index,
  }));

  // Use transaction-like update
  for (const update of updates) {
    const { error } = await supabase
      .from("page_blocks")
      .update({ block_index: update.block_index })
      .eq("id", update.id)
      .eq("page_id", pageId);

    if (error) {
      console.error("Error reordering blocks:", error);
      throw new Error("Failed to reorder blocks");
    }
  }

  return { success: true };
}

/**
 * Duplicate a block
 */
export async function duplicateBlock(blockId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the original block
  const { data: original, error: fetchError } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("id", blockId)
    .single();

  if (fetchError || !original) {
    throw new Error("Block not found");
  }

  // Get max block_index for the page
  const { data: blocks } = await supabase
    .from("page_blocks")
    .select("block_index")
    .eq("page_id", original.page_id)
    .order("block_index", { ascending: false })
    .limit(1);

  const newIndex = (blocks?.[0]?.block_index ?? -1) + 1;

  // Offset the position slightly for canvas mode
  const layout = original.layout as BlockLayout;
  const newLayout = {
    ...layout,
    x: Math.min((layout.x || 0) + 0.02, 0.9),
    y: Math.min((layout.y || 0) + 0.02, 0.9),
  };

  // Create duplicate
  const { data, error } = await supabase
    .from("page_blocks")
    .insert({
      page_id: original.page_id,
      type: original.type,
      block_index: newIndex,
      content: original.content,
      layout: newLayout,
      style: original.style,
    })
    .select()
    .single();

  if (error) {
    console.error("Error duplicating block:", error);
    throw new Error("Failed to duplicate block");
  }

  return data;
}

/**
 * Batch update multiple blocks (for autosave)
 */
export async function batchUpdateBlocks(
  updates: Array<{
    id: string;
    content?: BlockContent;
    layout?: BlockLayout;
    style?: BlockStyle;
  }>
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const results = [];

  for (const update of updates) {
    const updateData: Record<string, unknown> = {};

    if (update.content) updateData.content = update.content;
    if (update.layout) updateData.layout = update.layout;
    if (update.style) updateData.style = update.style;

    const { data, error } = await supabase
      .from("page_blocks")
      .update(updateData)
      .eq("id", update.id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating block ${update.id}:`, error);
      results.push({ id: update.id, success: false, error: error.message });
    } else {
      results.push({ id: update.id, success: true, data });
    }
  }

  return results;
}
