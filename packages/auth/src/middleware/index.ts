import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Create Supabase middleware for session refresh
 * Use this in your app's middleware.ts
 *
 * @example
 * // middleware.ts
 * import { createAuthMiddleware } from "@stratos/auth";
 *
 * export const middleware = createAuthMiddleware({
 *   publicRoutes: ["/", "/login", "/signup"],
 *   loginRoute: "/login",
 * });
 */
export interface AuthMiddlewareOptions {
  /** Routes that don't require authentication */
  publicRoutes?: string[];
  /** Route to redirect unauthenticated users (default: /login) */
  loginRoute?: string;
  /** Route to redirect authenticated users from auth pages (default: /app) */
  afterLoginRoute?: string;
  /** Enable locale-based routing (e.g., /en/login) */
  localeRouting?: boolean;
}

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const {
    publicRoutes = ["/", "/login", "/signup"],
    loginRoute = "/login",
    afterLoginRoute = "/app",
    localeRouting = false,
  } = options;

  return async function middleware(request: NextRequest) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Supabase not configured, allow request through
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh session if it exists
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Extract locale if locale routing is enabled
    let currentPath = pathname;
    let locale = "";
    if (localeRouting) {
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        // Assume first segment is locale (e.g., /en, /de)
        locale = segments[0];
        currentPath = "/" + segments.slice(1).join("/") || "/";
      }
    }

    // Check if current path is public
    const isPublicRoute = publicRoutes.some((route) => {
      if (route === "/") return currentPath === "/";
      return currentPath.startsWith(route);
    });

    // Check if on auth pages
    const isAuthPage =
      currentPath === loginRoute ||
      currentPath === "/signup" ||
      currentPath.startsWith("/auth");

    // Redirect authenticated users away from auth pages
    if (user && isAuthPage) {
      const redirectPath = localeRouting
        ? `/${locale}${afterLoginRoute}`
        : afterLoginRoute;
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Redirect unauthenticated users from protected routes
    if (!user && !isPublicRoute && !isAuthPage) {
      const redirectPath = localeRouting
        ? `/${locale}${loginRoute}`
        : loginRoute;
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    return response;
  };
}

/**
 * Simplified middleware that only refreshes sessions
 * Use when you handle protection in layouts
 */
export function createSessionMiddleware() {
  return async function middleware(request: NextRequest) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Just refresh the session
    await supabase.auth.getUser();

    return response;
  };
}
