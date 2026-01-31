import { redirect } from "next/navigation";
import { createServerClient } from "@stratos/auth/server";

/**
 * App Layout with server-side authentication guard
 * Redirects unauthenticated users to /login
 */
export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Server-side auth check
  const supabase = await createServerClient();

  if (!supabase) {
    // Supabase not configured, redirect to landing
    redirect(`/${locale}`);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Not authenticated, redirect to login
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}
