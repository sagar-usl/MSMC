import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsJson, corsOptions } from "@/lib/api-cors";

export function OPTIONS() { return corsOptions(); }

export async function GET() {
  try {
    const items = await prisma.newsItem.findMany({
      orderBy: [{ publishedDate: "desc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        tag: true,
        publishedDate: true,
        titleEn: true,
        titleMr: true,
        snippetEn: true,
        snippetMr: true,
      },
    });

    return corsJson({
      items: items.map((i) => ({
        ...i,
        publishedDate: i.publishedDate.toISOString().slice(0, 10),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
