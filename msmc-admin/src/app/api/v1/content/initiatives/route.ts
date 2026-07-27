import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsJson, corsOptions } from "@/lib/api-cors";

export function OPTIONS() { return corsOptions(); }

export async function GET() {
  try {
    const items = await prisma.initiative.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        titleEn: true,
        titleMr: true,
        districtEn: true,
        districtMr: true,
        descriptionEn: true,
        descriptionMr: true,
        imagePath: true,
      },
    });
    return corsJson({ items });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
