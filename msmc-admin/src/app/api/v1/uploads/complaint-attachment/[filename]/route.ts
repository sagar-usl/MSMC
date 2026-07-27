import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ filename: string }>;
}

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

/**
 * GET /api/v1/uploads/complaint-attachment/:filename?mobile=XXXXXXXXXX&ticket=CMP-...
 *
 * Ownership check: the filename must belong to an attachment on a complaint
 * that matches this mobile + ticket — same posture as the verdict download
 * route, so one citizen can't guess another's attachment filename. Served
 * inline (no Content-Disposition) since these preview in an <iframe>/<img>,
 * unlike the verdict PDF which force-downloads.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { filename } = await params;
  const mobile = request.nextUrl.searchParams.get("mobile");
  const ticket = request.nextUrl.searchParams.get("ticket");
  const safeFilename = path.basename(decodeURIComponent(filename));

  if (!mobile || !ticket) {
    return NextResponse.json({ error: "mobile and ticket params are required" }, { status: 400 });
  }

  const attachment = await prisma.complaintAttachment.findFirst({
    where: {
      filePath: safeFilename,
      complaint: { ticketId: decodeURIComponent(ticket), mobile },
    },
    select: { filePath: true },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Not authorised or attachment not found" }, { status: 403 });
  }

  const filePath = path.join(process.cwd(), "uploads", "complaint-attachments", safeFilename);

  try {
    const buffer = await readFile(filePath);
    const ext = safeFilename.split(".").pop()?.toLowerCase() ?? "";
    const mime = MIME_BY_EXT[ext] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
