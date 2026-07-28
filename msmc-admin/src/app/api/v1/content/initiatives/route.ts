import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsJson, corsOptions } from "@/lib/api-cors";

export function OPTIONS() { return corsOptions(); }

export async function GET() {
  try {
    const rows = await prisma.initiative.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        titleEn: true,
        titleMr: true,
        districtEn: true,
        districtMr: true,
        descriptionEn: true,
        descriptionMr: true,
        images: { orderBy: { sortOrder: "asc" }, select: { imagePath: true } },
      },
    });
    const items = rows.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map((i) => i.imagePath),
    }));
    return corsJson({ items });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
