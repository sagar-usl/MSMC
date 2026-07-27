import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ filename: string }>;
}

/**
 * GET /api/v1/uploads/verdict/:filename?mobile=XXXXXXXXXX&ticket=CMP/...
 *
 * Ownership check: the mobile number must match the complaint's mobile.
 * This prevents one citizen from guessing another's verdict filename.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { filename } = await params;
  const mobile = request.nextUrl.searchParams.get("mobile");
  const ticket = request.nextUrl.searchParams.get("ticket");

  if (!mobile || !ticket) {
    return NextResponse.json({ error: "mobile and ticket params are required" }, { status: 400 });
  }

  // Verify ownership: complaint must belong to this mobile number.
  const complaint = await prisma.complaint.findFirst({
    where: {
      ticketId: decodeURIComponent(ticket),
      mobile,
      verdictFilePath: { not: null },
    },
    select: { verdictFilePath: true },
  });

  if (!complaint) {
    return NextResponse.json({ error: "Not authorised or verdict not available" }, { status: 403 });
  }

  // Sanitise: only serve files from the uploads/verdicts directory.
  const safeFilename = path.basename(decodeURIComponent(filename));
  const filePath = path.join(process.cwd(), "uploads", "verdicts", safeFilename);

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
