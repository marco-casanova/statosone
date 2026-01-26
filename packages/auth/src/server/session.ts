import { createServerClient } from "./supabase-server";
import type { ServerAuthContext, StratosUser, UserRole } from "../types";

/**
 * Get the current session on the server
 * Use this in Server Components and Route Handlers
 */
export async function getServerSession(): Promise<ServerAuthContext> {
  const supabase = await createServerClient();

  if (!supabase) {
    return { user: null, session: null, role: null };
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { user: null, session: null, role: null };
    }

    // Fetch role from profiles table
    let role: UserRole = "user";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role) {
        role = profile.role as UserRole;
      }
    } catch {
      // Profile might not exist yet, use default role
    }

    const stratosUser: StratosUser = {
      ...session.user,
      role,
    };

    return { user: stratosUser, session, role };
  } catch (error) {
    console.error("[@stratos/auth] Error getting server session:", error);
    return { user: null, session: null, role: null };
  }
}

/**
 * Get just the user without session details
 * Lighter weight than getServerSession
 */
export async function getServerUser(): Promise<StratosUser | null> {
  const { user } = await getServerSession();
  return user;
}
