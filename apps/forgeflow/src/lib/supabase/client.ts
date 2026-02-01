import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient<Database> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    if (typeof window !== "undefined") {
      console.error("Failed to init Supabase client", e);
    }
  }
} else {
  if (typeof window !== "undefined") {
    console.warn(
      "Supabase disabled: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
}

export function createClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be set");
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

export { supabase };
export const hasSupabase = !!supabase;
