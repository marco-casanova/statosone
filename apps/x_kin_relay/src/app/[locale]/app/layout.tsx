import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import type { Locale } from "../../../i18n/config";

interface AppLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}

/**
 * App Layout with server-side authentication guard
 * Redirects unauthenticated users to /login
 */
export default async function AppLayout({ children, params }: AppLayoutProps) {
  const { locale } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase not configured, allow access (demo mode)
  if (!supabaseUrl || !supabaseAnonKey) {
    return <>{children}</>;
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Ignore - called from server component
        }
      },
    },
  });

  // Use getUser() instead of getSession() for server-side validation
  // getUser() validates the JWT with Supabase Auth server
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // Not authenticated, redirect to login
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}
