import { NextResponse } from "next/server";
import { getCurrentOfficer } from "@/lib/auth";
import { uploadVerdict } from "@/lib/complaints";

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
  const fileName = body?.fileName;
  if (!fileName || typeof fileName !== "string") {
    return NextResponse.json({ error: "fileName is required" }, { status: 400 });
  }

  await uploadVerdict(decodeURIComponent(id), fileName, officer.id);
  return NextResponse.json({ ok: true });
}
