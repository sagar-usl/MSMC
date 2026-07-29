import { NextResponse } from "next/server";
import { getCurrentOfficer } from "@/lib/auth";
import { listNotificationsForUser } from "@/lib/notifications";

/** GET /api/notifications (officer-only) — backs the admin panel's bell-icon dropdown. */
export async function GET() {
  const officer = await getCurrentOfficer();
  if (!officer) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const result = await listNotificationsForUser(officer.id);
  return NextResponse.json(result);
}
