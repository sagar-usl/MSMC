import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

interface RouteParams {
  params: Promise<{ filename: string }>;
}

/**
 * Public route — serves Documents/Education attached PDFs. Unlike the
 * verdict/complaint-attachment routes, these are public reference material
 * (reports, GRs, scholarship circulars), not private citizen data, so no
 * ownership check.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { filename } = await params;
  const safeFilename = path.basename(decodeURIComponent(filename));
  const filePath = path.join(process.cwd(), "uploads", "content-documents", safeFilename);

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
