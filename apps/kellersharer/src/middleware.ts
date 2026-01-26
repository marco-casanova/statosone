import { createSessionMiddleware } from "@stratos/auth/middleware";

// Use the shared session middleware
const sessionMiddleware = createSessionMiddleware();

export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};

export const middleware = sessionMiddleware;
