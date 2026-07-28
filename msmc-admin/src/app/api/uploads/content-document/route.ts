import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCurrentOfficer } from "@/lib/auth";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "content-documents");
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/uploads/content-document (officer-only, multipart/form-data)
 *
 * Shared by the Documents and Education CMS modules — both just need an
 * officer to attach a PDF and get back a path to store on their own record.
 * Field: file (PDF)
 * Returns: { filePath }
 */
export async function POST(request: NextRequest) {
  const officer = await getCurrentOfficer();
  if (!officer) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file field is required" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 400 });
  }

  const filePath = `doc_${Date.now()}_${Math.floor(Math.random() * 1e6)}.pdf`;
  const dest = path.join(UPLOADS_DIR, filePath);

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ filePath }, { status: 201 });
}
