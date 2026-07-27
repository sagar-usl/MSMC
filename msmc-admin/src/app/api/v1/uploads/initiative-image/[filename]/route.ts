import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

interface RouteParams {
  params: Promise<{ filename: string }>;
}

/** Public route — serves initiative images to the Flutter app. */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { filename } = await params;
  const safeFilename = path.basename(decodeURIComponent(filename));
  const filePath = path.join(process.cwd(), "uploads", "initiatives", safeFilename);

  try {
    const buffer = await readFile(filePath);
    const ext = safeFilename.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
