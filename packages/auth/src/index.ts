// @stratos/auth - Shared authentication for Stratos apps
// Supabase-based authentication with server-side session loading
//
// IMPORTANT: Do NOT re-export server-side code here!
// Server code uses "next/headers" which only works in Server Components.
// Import server functions directly from "@stratos/auth/server" instead.

// Types
export * from "./types";

// Client exports (safe for both client and server)
export {
  createBrowserClient,
  AuthProvider,
  useAuth,
  useAuthState,
} from "./client";

// Guards (client-side compatible)
export { withAuthGuard, requireAuth, requireRole } from "./guards";

// NOTE: Server exports must be imported separately:
// import { createServerClient, getServerSession, getServerUser } from "@stratos/auth/server";
//
// NOTE: Middleware exports must be imported separately:
// import { createAuthMiddleware, createSessionMiddleware } from "@stratos/auth/middleware";
