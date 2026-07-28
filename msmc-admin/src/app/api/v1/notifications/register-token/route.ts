import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsJson, corsOptions } from "@/lib/api-cors";
import { registerCitizenToken } from "@/lib/push-notifications";

export function OPTIONS() { return corsOptions(); }

/**
 * POST /api/v1/notifications/register-token
 * Body: { mobile, token, platform }
 * Links this device's FCM token to the citizen identified by mobile, so
 * complaint status updates can be pushed to their device.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return corsJson({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { mobile, token, platform } = body;

  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return corsJson({ error: "mobile must be a valid 10-digit number" }, { status: 400 });
  }
  if (!token || typeof token !== "string") {
    return corsJson({ error: "token is required" }, { status: 400 });
  }
  if (!platform || typeof platform !== "string") {
    return corsJson({ error: "platform is required" }, { status: 400 });
  }

  try {
    await registerCitizenToken(mobile, token, platform);
    return corsJson({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
