import type { User, Session } from "@supabase/supabase-js";

/**
 * User roles supported across all Stratos apps
 */
export type UserRole = "user" | "provider" | "company" | "admin";

/**
 * Extended user with role information
 */
export interface StratosUser extends User {
  role?: UserRole;
  profile?: UserProfile;
}

/**
 * Basic user profile structure
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Auth state for client components
 */
export interface AuthState {
  user: StratosUser | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Server-side auth context
 */
export interface ServerAuthContext {
  user: StratosUser | null;
  session: Session | null;
  role: UserRole | null;
}

/**
 * Auth configuration per app
 */
export interface AuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  redirects: {
    afterLogin: string;
    afterLogout: string;
    afterSignup: string;
    unauthorized: string;
  };
  roles?: {
    default: UserRole;
    allowed: UserRole[];
  };
}

/**
 * Route protection configuration
 */
export interface RouteGuardConfig {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}
