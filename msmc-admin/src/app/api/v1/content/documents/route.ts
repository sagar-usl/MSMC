import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsJson, corsOptions } from "@/lib/api-cors";

export function OPTIONS() { return corsOptions(); }

export async function GET() {
  try {
    const items = await prisma.document.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        titleEn: true,
        titleMr: true,
        metaEn: true,
        metaMr: true,
        category: true,
        filePath: true,
      },
    });
    return corsJson({ items });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
