import { NextResponse, type NextRequest } from "next/server";

function getStorageKey(supabaseUrl?: string): string | null {
  if (!supabaseUrl) return null;
  try {
    const url = new URL(supabaseUrl);
    const projectRef = url.hostname.split(".")[0];
    if (!projectRef) return null;
    return `sb-${projectRef}-auth-token`;
  } catch {
    return null;
  }
}

function hasAuthCookie(
  request: NextRequest,
  storageKey: string | null,
): boolean {
  if (!storageKey) return false;
  return request.cookies
    .getAll()
    .some(
      ({ name }) => name === storageKey || name.startsWith(`${storageKey}.`),
    );
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip middleware if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const storageKey = getStorageKey(supabaseUrl);
  const isAuthed = hasAuthCookie(request, storageKey);

  // Protected routes - require authentication
  const protectedRoutes = ["/dashboard", "/admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Auth routes - redirect if already logged in
  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Admin routes - require admin role
  const isAdminRoute = pathname.startsWith("/admin");

  if (isProtectedRoute && !isAuthed) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Without a Supabase client in Edge, we can't verify admin role here.
  // Admin role checks should be enforced in server-side route handlers/layouts.
  if (isAdminRoute && !isAuthed) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/signup"],
};
