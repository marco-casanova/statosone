import { redirect } from "next/navigation";
import { createServerClient } from "@stratos/auth/server";
import type { Locale } from "../../../i18n/config";

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

  // Server-side auth check
  const supabase = await createServerClient();

  if (!supabase) {
    redirect(`/${locale}`);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Check for admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    // Not an admin, redirect to app
    redirect(`/${locale}/app`);
  }

  return <>{children}</>;
}
