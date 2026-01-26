import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/**
 * Create a Supabase client for browser usage
 * Uses singleton pattern to avoid multiple instances
 */
export function createBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[@stratos/auth] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return null;
  }

  try {
    browserClient = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
    return browserClient;
  } catch (error) {
    console.error("[@stratos/auth] Failed to create browser client:", error);
    return null;
  }
}

/**
 * Check if Supabase is available
 */
export function hasSupabase(): boolean {
  return createBrowserClient() !== null;
}
