import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabasePublishableKey) {
  try {
    // Use createBrowserClient from @supabase/ssr for proper cookie handling
    // This ensures session persistence across page reloads
    supabase = createBrowserClient(supabaseUrl, supabasePublishableKey);
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
      "Supabase disabled: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }
}

// Factory function to create a new Supabase client
export function createClient(): SupabaseClient {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase URL and publishable key must be set");
  }
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}

export { supabase };
export const hasSupabase = !!supabase;
// Never expose a secret server key here.
