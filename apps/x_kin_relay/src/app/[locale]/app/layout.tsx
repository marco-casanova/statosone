import { redirect } from "next/navigation";
import { createServerClient } from "@stratos/auth/server";
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
