import "server-only";
import { prisma } from "@/lib/prisma";
import type { NewsTag } from "@/generated/prisma/client";

export interface NewsItemInput {
  tag: NewsTag;
  publishedDate: Date;
  titleEn: string;
  titleMr: string;
  snippetEn?: string;
  snippetMr?: string;
}

export function listNewsItems() {
  return prisma.newsItem.findMany({ orderBy: [{ publishedDate: "desc" }, { sortOrder: "asc" }] });
}

export async function createNewsItem(input: NewsItemInput) {
  await prisma.newsItem.create({ data: input });
}

export async function updateNewsItem(id: string, input: NewsItemInput) {
  await prisma.newsItem.update({ where: { id }, data: input });
}

export async function deleteNewsItem(id: string) {
  await prisma.newsItem.delete({ where: { id } });
}
