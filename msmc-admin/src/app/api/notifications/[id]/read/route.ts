import { NextRequest, NextResponse } from "next/server";
import { getCurrentOfficer } from "@/lib/auth";
import { markNotificationRead } from "@/lib/notifications";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** POST /api/notifications/:id/read (officer-only) */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  const officer = await getCurrentOfficer();
  if (!officer) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  await markNotificationRead(id, officer.id);
  return NextResponse.json({ ok: true });
}
