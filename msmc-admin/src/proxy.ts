import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (see AGENTS.md — this
// project's Next.js version has breaking changes from what's in training
// data). This only gates page navigation; Server Actions run as their own
// POST requests and are NOT guaranteed to pass through here if a matcher
// ever changes, so every mutating action in src/actions/ also re-checks
// getCurrentUser() itself — see complaints.actions.ts.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("msmc_session")?.value;
  const valid = token ? await verifyToken(token) : false;

  if (!valid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/complaints/:path*",
    "/users/:path*",
    "/documents/:path*",
    "/education/:path*",
    "/initiatives/:path*",
    "/news/:path*",
    "/settings/:path*",
    // /api/v1/* is intentionally excluded — public citizen-facing API.
    // /api/uploads/* is officer-only but uses its own getCurrentOfficer() check.
  ],
};
