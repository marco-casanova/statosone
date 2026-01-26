import { createSessionMiddleware } from "@stratos/auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Use the shared session middleware
const sessionMiddleware = createSessionMiddleware();

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};

export async function middleware(request: NextRequest) {
  // Refresh Supabase session on every request
  return sessionMiddleware(request);
}
