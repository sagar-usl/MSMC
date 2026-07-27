import "server-only";
import { prisma } from "@/lib/prisma";

export interface EducationItemInput {
  titleEn: string;
  titleMr: string;
  descEn?: string;
  descMr?: string;
}

export function listEducationItems() {
  return prisma.educationItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}

export async function createEducationItem(input: EducationItemInput) {
  await prisma.educationItem.create({ data: input });
}

export async function updateEducationItem(id: string, input: EducationItemInput) {
  await prisma.educationItem.update({ where: { id }, data: input });
}

export async function deleteEducationItem(id: string) {
  await prisma.educationItem.delete({ where: { id } });
}
