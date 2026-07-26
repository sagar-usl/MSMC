import { NextResponse } from "next/server";
import { getComplaintByTicketId } from "@/lib/complaints";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const complaint = await getComplaintByTicketId(decodeURIComponent(id));
  if (!complaint) {
    return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
  }
  return NextResponse.json({ complaint });
}
