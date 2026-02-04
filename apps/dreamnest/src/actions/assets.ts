"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AssetType } from "@/types";
import { isPublicAsset } from "@/lib/storage";

// ============================================================
// SHARED BUCKET CONFIGURATION
// ============================================================
const APP_KEY = "dreamnest";
const BUCKET_NAME = "assets";
const ENV = process.env.NODE_ENV === "production" ? "prod" : "dev";

/**
 * Build storage path following shared bucket convention:
 * {app_key}/{env}/{visibility}/{resource_type}/{owner_type}/{owner_id}/{asset_id}.{ext}
 */
function buildStoragePath(params: {
  visibility: "public" | "private";
  resourceType: string; // e.g., 'covers', 'images', 'audio'
  ownerType: string; // e.g., 'books', 'users', 'authors'
  ownerId: string;
  filename: string;
}): string {
  const { visibility, resourceType, ownerType, ownerId, filename } = params;
  const assetId = crypto.randomUUID();
  const ext = filename.split(".").pop() || "bin";
  const safeFilename = `${assetId}.${ext}`;

  return `${APP_KEY}/${ENV}/${visibility}/${resourceType}/${ownerType}/${ownerId}/${safeFilename}`;
}

/**
 * Get visibility based on asset type
 */
function getVisibility(assetType: AssetType): "public" | "private" {
  switch (assetType) {
    case "cover":
      return "public"; // Covers are public for library browsing
    case "image":
    case "audio":
    case "video":
    default:
      return "private"; // Page assets are private (subscriber access)
  }
}

/**
 * Get resource type for storage path
 */
function getResourceType(assetType: AssetType): string {
  switch (assetType) {
    case "cover":
      return "covers";
    case "audio":
      return "audio";
    case "video":
      return "video";
    case "image":
    default:
      return "images";
  }
}

/**
 * Upload asset to storage and create database record
 * Uses shared bucket with path-based multi-tenancy
 */
export async function uploadAsset(
  file: File,
  bookId: string,
  assetType: AssetType
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get author record for current user
  let { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    // Auto-create author record if missing (keeps RLS happy)
    const { data: newAuthor, error: authorError } = await supabase
      .from("authors")
      .insert({ user_id: user.id, is_verified: false })
      .select("id")
      .single();
    if (authorError || !newAuthor) {
      throw new Error("Author profile not found");
    }
    author = newAuthor;
  }

  // Ensure user has membership for DreamNest app (some storage policies require it)
  await supabase
    .from("user_app_memberships")
    .upsert(
      { user_id: user.id, app_key: APP_KEY, role: "author" },
      { onConflict: "user_id,app_key" }
    );

  // Verify user owns the book
  const { data: book } = await supabase
    .from("books")
    .select("author_id")
    .eq("id", bookId)
    .single();

  if (!book || book.author_id !== author.id) {
    throw new Error("Not authorized to add assets to this book");
  }

  // Build storage path following shared bucket convention
  const filePath = buildStoragePath({
    visibility: getVisibility(assetType),
    resourceType: getResourceType(assetType),
    ownerType: "authors",
    ownerId: author.id,
    filename: file.name,
  });

  // Convert File to ArrayBuffer and upload to shared bucket
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Create asset record in database
  const { data: asset, error: dbError } = await supabase
    .from("assets")
    .insert({
      author_id: author.id,
      type: assetType,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (dbError) {
    console.error("Error creating asset record:", dbError);
    // Clean up uploaded file
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    throw new Error("Failed to create asset record");
  }

  revalidatePath(`/author/books/${bookId}/edit`);
  return asset;
}

/**
 * Upload asset and create database record
 * Note: Actual file upload happens client-side to Supabase Storage
 * This creates the asset record after successful upload
 */
export async function createAsset(input: {
  book_id: string; // Used to verify ownership and get author_id
  type: AssetType;
  file_path: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  duration_ms?: number;
  alt_text?: string;
}) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get user's author record
  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    throw new Error("Author profile not found");
  }

  // Verify user owns the book
  const { data: book } = await supabase
    .from("books")
    .select("author_id")
    .eq("id", input.book_id)
    .single();

  if (!book || book.author_id !== author.id) {
    throw new Error("Not authorized to add assets to this book");
  }

  const { data, error } = await supabase
    .from("assets")
    .insert({
      author_id: author.id,
      type: input.type,
      file_path: input.file_path,
      file_name: input.file_name,
      file_size: input.file_size,
      mime_type: input.mime_type,
      width: input.width,
      height: input.height,
      duration_ms: input.duration_ms,
      alt_text: input.alt_text,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating asset:", error);
    throw new Error("Failed to create asset record");
  }

  return data;
}

/**
 * List assets for a book (returns author's assets)
 * Assets belong to authors, so we get the book's author and list their assets
 */
export async function listBookAssets(bookId: string, assetType?: AssetType) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the book's author_id
  const { data: book } = await supabase
    .from("books")
    .select("author_id")
    .eq("id", bookId)
    .single();

  if (!book) {
    throw new Error("Book not found");
  }

  let query = supabase
    .from("assets")
    .select("*")
    .eq("author_id", book.author_id)
    .order("created_at", { ascending: false });

  if (assetType) {
    query = query.eq("type", assetType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching assets:", error);
    throw new Error("Failed to fetch assets");
  }

  return data || [];
}

/**
 * Update asset metadata
 */
export async function updateAsset(
  assetId: string,
  updates: { alt_text?: string; duration_ms?: number }
) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get user's author record
  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    throw new Error("Author profile not found");
  }

  // Verify ownership
  const { data: asset } = await supabase
    .from("assets")
    .select("id, author_id")
    .eq("id", assetId)
    .single();

  if (!asset || asset.author_id !== author.id) {
    throw new Error("Not authorized to update this asset");
  }

  const { data, error } = await supabase
    .from("assets")
    .update({
      alt_text: updates.alt_text,
      duration_ms: updates.duration_ms,
    })
    .eq("id", assetId)
    .select()
    .single();

  if (error) {
    console.error("Error updating asset:", error);
    throw new Error("Failed to update asset");
  }

  return data;
}

/**
 * Delete asset (from DB and storage)
 */
export async function deleteAsset(assetId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get user's author record
  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    throw new Error("Author profile not found");
  }

  // Get asset info including file path
  const { data: asset } = await supabase
    .from("assets")
    .select("id, file_path, author_id")
    .eq("id", assetId)
    .single();

  if (!asset || asset.author_id !== author.id) {
    throw new Error("Not authorized to delete this asset");
  }

  // Delete from storage (using shared bucket)
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([asset.file_path]);

  if (storageError) {
    console.error("Error deleting file from storage:", storageError);
    // Continue to delete DB record anyway
  }

  // Delete from database
  const { error } = await supabase.from("assets").delete().eq("id", assetId);

  if (error) {
    console.error("Error deleting asset:", error);
    throw new Error("Failed to delete asset");
  }

  revalidatePath(`/author`);
  return { success: true };
}

/**
 * Get signed URL for asset by ID (for private buckets)
 */
export async function getAssetSignedUrlById(assetId: string, expiresIn = 3600) {
  const supabase = await createClient();

  const { data: asset } = await supabase
    .from("assets")
    .select("file_path")
    .eq("id", assetId)
    .single();

  if (!asset) {
    throw new Error("Asset not found");
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(asset.file_path, expiresIn);

  if (error) {
    console.error("Error creating signed URL:", error);
    throw new Error("Failed to create signed URL");
  }

  return data.signedUrl;
}

/**
 * Set book cover
 */
export async function setBookCover(bookId: string, assetId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const { data: book } = await supabase
    .from("books")
    .select("author_id")
    .eq("id", bookId)
    .single();

  if (!book || book.author_id !== user.id) {
    throw new Error("Not authorized to update this book");
  }

  const { error } = await supabase
    .from("books")
    .update({ cover_asset_id: assetId })
    .eq("id", bookId);

  if (error) {
    console.error("Error setting book cover:", error);
    throw new Error("Failed to set book cover");
  }

  revalidatePath(`/author/books/${bookId}/edit`);
  revalidatePath("/app");
  return { success: true };
}

/**
 * Upload helper: Generate storage path
 */
export async function generateAssetPath(
  bookId: string,
  assetType: AssetType,
  filename: string
): Promise<string> {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get author for this user
  const supabase = await createClient();
  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    throw new Error("Author profile not found");
  }

  return buildStoragePath({
    visibility: getVisibility(assetType),
    resourceType: getResourceType(assetType),
    ownerType: "authors",
    ownerId: author.id,
    filename,
  });
}

/**
 * Get storage bucket name (always 'assets' for shared bucket)
 */
export async function getBucketForAssetType(
  _assetType: AssetType
): Promise<string> {
  return BUCKET_NAME;
}

/**
 * Get public URL for asset
 * Works for both public and private assets in shared bucket
 */
export async function getAssetPublicUrl(filePath: string) {
  const supabase = await createClient();
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Get signed URL for private assets
 * Use this for private assets that require authentication
 */
export async function getAssetSignedUrl(
  filePath: string,
  expiresIn: number = 3600
) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error("Error creating signed URL:", error);
    throw new Error("Failed to create signed URL");
  }

  return data.signedUrl;
}

/**
 * Get the correct URL for an asset based on visibility
 */
export async function getAssetUrl(filePath: string): Promise<string> {
  if (isPublicAsset(filePath)) {
    return getAssetPublicUrl(filePath);
  }
  return getAssetSignedUrl(filePath);
}
