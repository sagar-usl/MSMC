import { NextRequest, NextResponse } from "next/server";
import { getCurrentOfficer } from "@/lib/auth";
import { registerOfficerToken } from "@/lib/push-notifications";

/**
 * POST /api/notifications/register-token (officer-only)
 * Body: { token, platform }
 * Links this browser's FCM token to the logged-in officer, so new-complaint
 * alerts can be pushed to the admin panel.
 */
export async function POST(request: NextRequest) {
  const officer = await getCurrentOfficer();
  if (!officer) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const token = body?.token;
  const platform = body?.platform;
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }
  if (!platform || typeof platform !== "string") {
    return NextResponse.json({ error: "platform is required" }, { status: 400 });
  }

  try {
    await registerOfficerToken(officer.id, token, platform);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
