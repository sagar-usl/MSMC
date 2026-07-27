import { NextRequest, NextResponse } from "next/server";
import { getComplaintByTicketId } from "@/lib/complaints";
import { corsJson, corsOptions } from "@/lib/api-cors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export function OPTIONS() { return corsOptions(); }

/**
 * GET /api/v1/complaints/:ticketId
 * Optionally pass ?mobile=XXXXXXXXXX so we can validate ownership.
 * The verdict download URL is included only when the complaint is DISPOSED_OF
 * and the mobile matches.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const ticketId = decodeURIComponent(id);
  const mobile = request.nextUrl.searchParams.get("mobile");

  try {
    const complaint = await getComplaintByTicketId(ticketId);
    if (!complaint) {
      return corsJson({ error: "Complaint not found" }, { status: 404 });
    }

    // Build a citizen-safe view (no internal DB ids, no officer-only fields).
    const baseUrl = request.nextUrl.origin;
    const verdictDownloadUrl =
      complaint.verdictFile && mobile && complaint.mobileNumber === mobile
        ? `${baseUrl}/api/v1/uploads/verdict/${encodeURIComponent(complaint.verdictFile)}?mobile=${mobile}&ticket=${encodeURIComponent(ticketId)}`
        : null;

    return corsJson({
      complaint: {
        id: complaint.id,
        status: complaint.status,
        category: complaint.category,
        description: complaint.description,
        submittedAt: complaint.submittedAt,
        assignedOfficer: complaint.assignedOfficer,
        rejectionReason: complaint.rejectionReason,
        hearings: complaint.hearings,
        documents: complaint.documents,
        verdictDownloadUrl,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
