/**
 * Storage utilities for DreamNest
 *
 * Uses shared 'assets' bucket with path-based multi-tenancy:
 * {app_key}/{env}/{visibility}/{resource_type}/{owner_type}/{owner_id}/{asset_id}.{ext}
 */

const BUCKET_NAME = "assets";

/**
 * Get the public URL for an asset
 * Works for both old-style paths and new shared bucket paths
 */
export function getAssetPublicUrl(filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is not set");
    return "";
  }

  // Already a full URL
  if (filePath.startsWith("http")) {
    return filePath;
  }

  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
}

/**
 * Check if an asset path indicates a public asset
 */
export function isPublicAsset(filePath: string): boolean {
  // New path structure: check for /public/ segment
  if (filePath.includes("/public/")) {
    return true;
  }
  // Old path structure: covers were public
  if (filePath.includes("cover")) {
    return true;
  }
  return false;
}

/**
 * Get the appropriate URL for an asset based on visibility
 * For public assets: returns direct public URL
 * For private assets: returns a path that should be used with signed URLs
 */
export function getAssetUrl(filePath: string): string {
  // For now, return public URL
  // Private assets will need signed URLs generated server-side
  return getAssetPublicUrl(filePath);
}
