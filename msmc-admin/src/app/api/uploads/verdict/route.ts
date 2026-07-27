import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCurrentOfficer } from "@/lib/auth";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "verdicts");
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/uploads/verdict  (officer-only, multipart/form-data)
 * Field: file (PDF)
 * Returns: { fileName } — stored as Complaint.verdictFilePath, served back to
 * the citizen via /api/v1/uploads/verdict/[filename] (ownership-checked there).
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

  const fileName = `verdict_${Date.now()}.pdf`;
  const dest = path.join(UPLOADS_DIR, fileName);

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ fileName }, { status: 201 });
}
