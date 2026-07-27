import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { corsJson, corsOptions } from "@/lib/api-cors";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "complaint-attachments");
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function OPTIONS() {
  return corsOptions();
}

/**
 * POST /api/v1/uploads/complaint-attachment (public, multipart/form-data)
 *
 * Public because complaint submission itself is unauthenticated (citizens
 * don't log in) — one file per call, the app calls this once per picked
 * file, then references the returned filePath when creating the complaint.
 * Field: file (File)
 * Returns: { fileName, filePath }
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return corsJson({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return corsJson({ error: "file field is required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return corsJson({ error: "Only JPEG, PNG, WebP, and PDF files are accepted" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return corsJson({ error: "File exceeds 10 MB limit" }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[file.type];
  const filePath = `attachment_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${ext}`;
  const dest = path.join(UPLOADS_DIR, filePath);

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));

  return corsJson({ fileName: file.name, filePath }, { status: 201 });
}
