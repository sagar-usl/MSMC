import "server-only";
import { prisma } from "@/lib/prisma";
import type { DocumentCategory } from "@/generated/prisma/client";

export interface DocumentInput {
  titleEn: string;
  titleMr: string;
  metaEn?: string;
  metaMr?: string;
  category: DocumentCategory;
  filePath?: string;
}

export function listDocuments() {
  return prisma.document.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}

export async function createDocument(input: DocumentInput) {
  await prisma.document.create({ data: input });
}

export async function updateDocument(id: string, input: DocumentInput) {
  await prisma.document.update({ where: { id }, data: input });
}

export async function deleteDocument(id: string) {
  await prisma.document.delete({ where: { id } });
}
