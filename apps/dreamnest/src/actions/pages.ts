"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getAssetPublicUrl } from "@/lib/storage";
import type { UpsertPageInput, PageMode } from "@/types";

/**
 * Get the author record ID for a user
 */
async function getAuthorId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", userId)
    .single();
  return author?.id;
}

/**
 * List pages for a book (author/editor use)
 */
export async function listPages(bookId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("book_pages")
    .select(
      `
      *,
      blocks:page_blocks(*),
      background_asset:assets!background_asset_id(file_path)
    `,
    )
    .eq("book_id", bookId)
    .order("page_index", { ascending: true });

  if (error) {
    console.error("Error fetching pages:", error);
    throw new Error("Failed to fetch pages");
  }

  // Attach public URLs for backgrounds to simplify client rendering
  return (
    data?.map((page: any) => {
      const mappedBlocks =
        page.blocks?.map((block: any) => ({
          ...block,
          block_type: block.block_type ?? block.type,
          z_index:
            block.z_index ??
            block.block_index ??
            (typeof block.block_order === "number" ? block.block_order : 0),
        })) ?? [];

      return {
        ...page,
        mode: page.mode ?? page.layout_mode,
        blocks: mappedBlocks,
        background_asset_url: page.background_asset?.file_path
          ? getAssetPublicUrl(page.background_asset.file_path)
          : null,
      };
    }) || []
  );
}

/**
 * Get single page with blocks (reader use)
 */
export async function getPageWithBlocks(pageId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("book_pages")
    .select(
      `
      *,
      blocks:page_blocks(*)
    `,
    )
    .eq("id", pageId)
    .single();

  if (error) {
    console.error("Error fetching page:", error);
    throw new Error("Failed to fetch page");
  }

  // Sort blocks by block_index
  if (data?.blocks) {
    data.blocks.sort(
      (a: { block_index: number }, b: { block_index: number }) =>
        a.block_index - b.block_index,
    );
  }

  return data;
}

/**
 * Get page by index (for reader navigation)
 */
export async function getPageByIndex(bookId: string, pageIndex: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("book_pages")
    .select(
      `
      *,
      blocks:page_blocks(*)
    `,
    )
    .eq("book_id", bookId)
    .eq("page_index", pageIndex)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching page:", error);
    throw new Error("Failed to fetch page");
  }

  // Sort blocks by block_index
  if (data?.blocks) {
    data.blocks.sort(
      (a: { block_index: number }, b: { block_index: number }) =>
        a.block_index - b.block_index,
    );
  }

  return data;
}

/**
 * Create new page
 */
export async function createPage(input: UpsertPageInput) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the user's author ID
  const authorId = await getAuthorId(supabase, user.id);
  if (!authorId) {
    throw new Error("Author record not found");
  }

  // Verify user owns the book
  const { data: book } = await supabase
    .from("books")
    .select("author_id")
    .eq("id", input.book_id)
    .single();

  if (!book || book.author_id !== authorId) {
    throw new Error("Not authorized to edit this book");
  }

  // Get next page index if not provided
  let pageIndex = input.page_index;
  if (pageIndex === undefined) {
    const { data: lastPage } = await supabase
      .from("book_pages")
      .select("page_index")
      .eq("book_id", input.book_id)
      .order("page_index", { ascending: false })
      .limit(1)
      .single();

    pageIndex = (lastPage?.page_index ?? -1) + 1;
  }

  const { data, error } = await supabase
    .from("book_pages")
    .insert({
      book_id: input.book_id,
      page_index: pageIndex,
      layout_mode: input.layout_mode || input.mode || "canvas",
      background_color: input.background_color || "#FFFFFF",
      background_asset_id: input.background_asset_id,
      border_frame_id: input.border_frame_id,
      page_text: "Add text",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating page:", error);
    throw new Error("Failed to create page");
  }

  // Update book page count
  await supabase.rpc("increment_page_count", { book_id: input.book_id });

  revalidatePath(`/author/books/${input.book_id}/edit`);
  return data;
}

/**
 * Update page
 */
export async function updatePage(
  pageId: string,
  updates: Partial<Omit<UpsertPageInput, "book_id">>,
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the user's author ID
  const authorId = await getAuthorId(supabase, user.id);
  if (!authorId) {
    throw new Error("Author record not found");
  }

  // Get page and verify ownership
  const { data: page } = await supabase
    .from("book_pages")
    .select("book_id, books!inner(author_id)")
    .eq("id", pageId)
    .single();

  const pageBooks = page?.books as unknown as { author_id: string } | undefined;
  if (!page || pageBooks?.author_id !== authorId) {
    throw new Error("Not authorized to edit this page");
  }

  // Only include fields that are defined
  const updateFields: Record<string, unknown> = {};
  if (updates.layout_mode !== undefined)
    updateFields.layout_mode = updates.layout_mode;
  if (updates.mode !== undefined) updateFields.layout_mode = updates.mode;
  if (updates.background_color !== undefined)
    updateFields.background_color = updates.background_color;
  if (updates.background_asset_id !== undefined)
    updateFields.background_asset_id = updates.background_asset_id;
  if (updates.page_text !== undefined)
    updateFields.page_text = updates.page_text;
  if (updates.border_frame_id !== undefined)
    updateFields.border_frame_id = updates.border_frame_id;

  const { data, error } = await supabase
    .from("book_pages")
    .update(updateFields)
    .eq("id", pageId)
    .select()
    .single();

  if (error) {
    console.error("Error updating page:", error);
    throw new Error("Failed to update page");
  }

  revalidatePath(`/author/books/${page.book_id}/edit`);
  return data;
}

/**
 * Apply the same border frame to all pages in a book
 */
export async function applyBorderFrameToAllPages(
  bookId: string,
  borderFrameId: string | null,
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const authorId = await getAuthorId(supabase, user.id);
  if (!authorId) {
    throw new Error("Author record not found");
  }

  const { data: book } = await supabase
    .from("books")
    .select("author_id")
    .eq("id", bookId)
    .single();

  if (!book || book.author_id !== authorId) {
    throw new Error("Not authorized to edit this book");
  }

  // Handle null value properly for Supabase
  const updateData =
    borderFrameId === null
      ? { border_frame_id: null }
      : { border_frame_id: borderFrameId };

  const { error } = await supabase
    .from("book_pages")
    .update(updateData)
    .eq("book_id", bookId);

  if (error) {
    console.error("Error applying border frame:", error);
    throw new Error("Failed to apply border frame to all pages");
  }

  revalidatePath(`/author/books/${bookId}/edit`);
  return { success: true };
}

/**
 * Delete page
 */
export async function deletePage(pageId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the user's author ID
  const authorId = await getAuthorId(supabase, user.id);
  if (!authorId) {
    throw new Error("Author record not found");
  }

  // Get page and verify ownership
  const { data: page } = await supabase
    .from("book_pages")
    .select("book_id, page_index, books!inner(author_id)")
    .eq("id", pageId)
    .single();

  const pageBooks = page?.books as unknown as { author_id: string } | undefined;
  if (!page || pageBooks?.author_id !== authorId) {
    throw new Error("Not authorized to delete this page");
  }

  // Delete the page
  const { error } = await supabase.from("book_pages").delete().eq("id", pageId);

  if (error) {
    console.error("Error deleting page:", error);
    throw new Error("Failed to delete page");
  }

  // Reindex subsequent pages
  await supabase.rpc("reindex_pages", {
    p_book_id: page.book_id,
    deleted_index: page.page_index,
  });

  // Update book page count
  await supabase.rpc("decrement_page_count", { book_id: page.book_id });

  revalidatePath(`/author/books/${page.book_id}/edit`);
  return { success: true };
}

/**
 * Reorder pages (drag and drop)
 */
export async function reorderPages(bookId: string, pageIds: string[]) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the user's author ID
  const authorId = await getAuthorId(supabase, user.id);
  if (!authorId) {
    throw new Error("Author record not found");
  }

  // Verify ownership
  const { data: book } = await supabase
    .from("books")
    .select("author_id")
    .eq("id", bookId)
    .single();

  if (!book || book.author_id !== authorId) {
    throw new Error("Not authorized to edit this book");
  }

  // Update each page's index
  const updates = pageIds.map((id, index) =>
    supabase
      .from("book_pages")
      .update({ page_index: index })
      .eq("id", id)
      .eq("book_id", bookId),
  );

  const results = await Promise.all(updates);
  const hasError = results.some((r) => r.error);

  if (hasError) {
    console.error("Error reordering pages");
    throw new Error("Failed to reorder pages");
  }

  revalidatePath(`/author/books/${bookId}/edit`);
  return { success: true };
}

/**
 * Duplicate page
 */
export async function duplicatePage(pageId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the user's author ID
  const authorId = await getAuthorId(supabase, user.id);
  if (!authorId) {
    throw new Error("Author record not found");
  }

  // Get original page with blocks
  const { data: original } = await supabase
    .from("book_pages")
    .select(
      `
      *,
      blocks:page_blocks(*),
      books!inner(author_id)
    `,
    )
    .eq("id", pageId)
    .single();

  const originalBooks = original?.books as unknown as
    | { author_id: string }
    | undefined;
  if (!original || originalBooks?.author_id !== authorId) {
    throw new Error("Not authorized to duplicate this page");
  }

  // Shift subsequent pages to make room for the duplicate.
  // We update in descending order to avoid (book_id, page_index) conflicts.
  const { data: subsequentPages, error: fetchShiftError } = await supabase
    .from("book_pages")
    .select("id, page_index")
    .eq("book_id", original.book_id)
    .gt("page_index", original.page_index)
    .order("page_index", { ascending: false });

  if (fetchShiftError) {
    console.error("Error fetching pages to shift:", fetchShiftError);
    throw new Error("Failed to duplicate page");
  }

  for (const page of subsequentPages || []) {
    const { error: updateShiftError } = await supabase
      .from("book_pages")
      .update({ page_index: page.page_index + 1 })
      .eq("id", page.id);

    if (updateShiftError) {
      console.error("Error shifting page before duplicate:", updateShiftError);
      throw new Error("Failed to duplicate page");
    }
  }

  // Create new page after current one
  const { data: newPage, error: pageError } = await supabase
    .from("book_pages")
    .insert({
      book_id: original.book_id,
      page_index: original.page_index + 1,
      layout_mode: original.layout_mode,
      background_color: original.background_color,
      background_asset_id: original.background_asset_id,
      border_frame_id: original.border_frame_id,
      page_text: original.page_text,
    })
    .select()
    .single();

  if (pageError || !newPage) {
    console.error("Error duplicating page:", pageError);
    throw new Error("Failed to duplicate page");
  }

  // Duplicate blocks
  if (original.blocks && original.blocks.length > 0) {
    const blockInserts = original.blocks.map(
      (block: {
        type: string;
        content: unknown;
        layout: unknown;
        style: unknown;
        block_index: number;
      }) => ({
        page_id: newPage.id,
        type: block.type,
        content: block.content,
        layout: block.layout,
        style: block.style,
        block_index: block.block_index,
      }),
    );

    const { data: newBlocks, error: blocksError } = await supabase
      .from("page_blocks")
      .insert(blockInserts)
      .select();

    if (blocksError) {
      console.error("Error duplicating blocks:", blocksError);
    }

    // Attach blocks to newPage for return
    (newPage as any).blocks = newBlocks || [];
  } else {
    (newPage as any).blocks = [];
  }

  // Update page count
  await supabase.rpc("increment_page_count", { book_id: original.book_id });

  revalidatePath(`/author/books/${original.book_id}/edit`);
  return { page: newPage, blocks: (newPage as any).blocks };
}

/**
 * Update page mode
 */
export async function updatePageMode(pageId: string, mode: PageMode) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the user's author ID
  const authorId = await getAuthorId(supabase, user.id);
  if (!authorId) {
    throw new Error("Author record not found");
  }

  // Get page and verify ownership
  const { data: page } = await supabase
    .from("book_pages")
    .select("book_id, books!inner(author_id)")
    .eq("id", pageId)
    .single();

  const modePageBooks = page?.books as unknown as
    | { author_id: string }
    | undefined;
  if (!page || modePageBooks?.author_id !== authorId) {
    throw new Error("Not authorized to edit this page");
  }

  const { data, error } = await supabase
    .from("book_pages")
    .update({ layout_mode: mode })
    .eq("id", pageId)
    .select()
    .single();

  if (error) {
    console.error("Error updating page mode:", error);
    throw new Error("Failed to update page mode");
  }

  revalidatePath(`/author/books/${page.book_id}/edit`);
  return data;
}
