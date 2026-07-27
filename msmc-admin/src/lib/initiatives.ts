import "server-only";
import { prisma } from "@/lib/prisma";

export interface InitiativeInput {
  titleEn: string;
  titleMr: string;
  districtEn: string;
  districtMr: string;
  descriptionEn?: string;
  descriptionMr?: string;
  imagePath?: string;
}

export function listInitiatives() {
  return prisma.initiative.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}

export async function createInitiative(input: InitiativeInput) {
  await prisma.initiative.create({ data: input });
}

export async function updateInitiative(id: string, input: InitiativeInput) {
  await prisma.initiative.update({ where: { id }, data: input });
}

export async function deleteInitiative(id: string) {
  await prisma.initiative.delete({ where: { id } });
}
