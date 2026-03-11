import { redirect } from "next/navigation";
import { createServerClient } from "@stratos/auth/server";

/**
 * Admin Layout with server-side authentication guard
 * Family/guardian users are allowed to access admin analytics.
 */
export default async function AdminLayout({
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
    redirect(`/${locale}`);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Check for role and allow analytics access for household admins.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  const allowedRoles = new Set(["admin", "family", "guardian"]);
  const role = profile?.role?.toLowerCase();

  if (role && !allowedRoles.has(role)) {
    // Non-admin care roles should stay in the main app.
    redirect(`/${locale}/app`);
  }

  return <>{children}</>;
}
