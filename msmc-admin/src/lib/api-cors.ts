import { NextResponse } from "next/server";

/**
 * Wraps a JSON response with CORS headers so the Flutter app (and any other
 * non-browser client) can call these public /api/v1/* endpoints.
 *
 * Only the /api/v1/ endpoints are public. Officer-facing pages still use
 * same-origin session cookies and bypass this entirely.
 */
export function corsJson(data: unknown, init?: ResponseInit): NextResponse {
  const res = NextResponse.json(data, init);
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

/** Handles preflight OPTIONS requests — required by browsers / Dio on some platforms. */
export function corsOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
