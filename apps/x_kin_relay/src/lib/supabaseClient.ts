import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Explicitly require URL & anon key from .env.local (public vars)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    // Use createBrowserClient from @supabase/ssr for proper cookie handling
    // This ensures session persistence across page reloads
    supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error("Failed to init Supabase client", e);
    }
  }
} else {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.warn(
      "Supabase disabled: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
}

// Factory function to create a new Supabase client
export function createClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be set");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
export const hasSupabase = !!supabase;
// Never expose service role key here (must remain server-only).
