import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCurrentOfficer } from "@/lib/auth";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "initiatives");
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * POST /api/uploads/initiative-image  (officer-only, multipart/form-data)
 * Field: image (File)
 * Returns: { url: "/api/v1/uploads/initiative-image/<filename>" }
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

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "image field is required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are accepted" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `init_${Date.now()}.${ext}`;
  const dest = path.join(UPLOADS_DIR, filename);

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/api/v1/uploads/initiative-image/${filename}` }, { status: 201 });
}
