"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "../client/useAuthState";
import type { UserRole } from "../types";

interface WithAuthGuardOptions {
  redirectTo?: string;
  allowedRoles?: UserRole[];
  loadingComponent?: ReactNode;
}

/**
 * Client-side auth guard component
 * Note: Prefer server-side guards (requireAuth) in layouts instead
 * Use this only when you need client-side reactivity
 * 
 * @example
 * function ProtectedPage() {
 *   return (
 *     <AuthGuard redirectTo="/login">
 *       <YourContent />
 *     </AuthGuard>
 *   );
 * }
 */
export function withAuthGuard(
  Component: React.ComponentType,
  options: WithAuthGuardOptions = {}
) {
  const {
    redirectTo = "/login",
    allowedRoles,
    loadingComponent = null,
  } = options;

  return function AuthGuardedComponent(props: Record<string, unknown>) {
    const router = useRouter();
    const { user, loading } = useAuthState();

    useEffect(() => {
      if (loading) return;

      if (!user) {
        router.replace(redirectTo);
        return;
      }

      if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
        router.replace(redirectTo);
      }
    }, [user, loading, router]);

    if (loading) {
      return <>{loadingComponent}</>;
    }

    if (!user) {
      return null;
    }

    if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Auth guard as a wrapper component
 */
interface AuthGuardProps extends WithAuthGuardOptions {
  children: ReactNode;
}

export function AuthGuard({
  children,
  redirectTo = "/login",
  allowedRoles,
  loadingComponent = null,
}: AuthGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuthState();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo, allowedRoles]);

  if (loading) {
    return <>{loadingComponent}</>;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
