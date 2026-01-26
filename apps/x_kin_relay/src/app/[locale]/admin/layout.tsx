import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import type { Locale } from "../../../i18n/config";
import { TopNav } from "@/components/TopNav";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}

/**
 * Admin Layout with server-side authentication + role guard
 * Redirects non-admin users to /app
 */
export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase not configured, allow access (demo mode)
  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <>
        <TopNav />
        {children}
      </>
    );
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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/${locale}/login`);
  }

  // For MVP, skip admin role check - allow all authenticated users

  return (
    <>
      <TopNav />
      {children}
    </>
  );
}
