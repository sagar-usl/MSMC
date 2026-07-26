import { NextResponse } from "next/server";
import { getCurrentOfficer } from "@/lib/auth";
import { acceptComplaint, rejectComplaint } from "@/lib/complaints";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Officer-only. Reuses the same cookie session as the web dashboard for now;
// a mobile bearer-token scheme is a later concern once an officer mobile
// flow (if any) is designed.
export async function PATCH(request: Request, { params }: RouteParams) {
  const officer = await getCurrentOfficer();
  if (!officer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const decision = body?.decision;

  if (decision === "accept") {
    await acceptComplaint(decodeURIComponent(id), officer.id);
    return NextResponse.json({ ok: true });
  }
  if (decision === "reject") {
    const reason = String(body?.reason ?? "").trim();
    if (!reason) return NextResponse.json({ error: "reason is required" }, { status: 400 });
    await rejectComplaint(decodeURIComponent(id), reason, officer.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "decision must be 'accept' or 'reject'" }, { status: 400 });
}
