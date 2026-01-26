import { redirect } from "next/navigation";
import { getServerSession } from "../server/session";
import type { UserRole } from "../types";

interface AuthGuardOptions {
  redirectTo?: string;
  allowedRoles?: UserRole[];
}

/**
 * Server-side auth guard for use in layouts
 * Call this at the top of your layout to protect routes
 * 
 * @example
 * // In app/[locale]/app/layout.tsx
 * export default async function AppLayout({ children }) {
 *   await requireAuth({ redirectTo: "/login" });
 *   return <>{children}</>;
 * }
 */
export async function requireAuth(
  options: AuthGuardOptions = {}
): Promise<void> {
  const { redirectTo = "/login", allowedRoles } = options;

  const { user, role } = await getServerSession();

  if (!user) {
    redirect(redirectTo);
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    redirect(redirectTo);
  }
}

/**
 * Require a specific role
 * Redirects to unauthorized page if role doesn't match
 * 
 * @example
 * // In app/[locale]/admin/layout.tsx
 * export default async function AdminLayout({ children }) {
 *   await requireRole("admin", { redirectTo: "/app" });
 *   return <>{children}</>;
 * }
 */
export async function requireRole(
  requiredRole: UserRole | UserRole[],
  options: { redirectTo?: string } = {}
): Promise<void> {
  const { redirectTo = "/app" } = options;

  const { user, role } = await getServerSession();

  if (!user) {
    redirect("/login");
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!role || !roles.includes(role)) {
    redirect(redirectTo);
  }
}
