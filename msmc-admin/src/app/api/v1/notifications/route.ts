import { NextRequest, NextResponse } from "next/server";
import { corsJson, corsOptions } from "@/lib/api-cors";
import { listNotificationsForCitizen } from "@/lib/notifications";

export function OPTIONS() { return corsOptions(); }

/**
 * GET /api/v1/notifications?mobile=9876543210
 * Backs the Flutter app's notification list screen.
 */
export async function GET(request: NextRequest) {
  const mobile = request.nextUrl.searchParams.get("mobile");
  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return corsJson({ error: "mobile query param must be a valid 10-digit number" }, { status: 400 });
  }

  try {
    const result = await listNotificationsForCitizen(mobile);
    return corsJson(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
