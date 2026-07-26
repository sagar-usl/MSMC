import { NextResponse } from "next/server";
import { getCurrentOfficer } from "@/lib/auth";
import { scheduleHearing } from "@/lib/complaints";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const officer = await getCurrentOfficer();
  if (!officer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const { kind, date, time, location, officerName } = body ?? {};

  if (kind !== "FIRST" && kind !== "FINAL") {
    return NextResponse.json({ error: "kind must be 'FIRST' or 'FINAL'" }, { status: 400 });
  }
  if (!date || !time || !location?.trim() || !officerName?.trim()) {
    return NextResponse.json({ error: "date, time, location and officerName are all required" }, { status: 400 });
  }

  await scheduleHearing(decodeURIComponent(id), kind, { date, time, location, officerName }, officer.id);
  return NextResponse.json({ ok: true });
}
