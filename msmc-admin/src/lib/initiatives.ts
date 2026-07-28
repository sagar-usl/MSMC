import "server-only";
import { prisma } from "@/lib/prisma";
import type { Initiative, InitiativeImage } from "@/generated/prisma/client";

export type InitiativeWithImages = Initiative & { images: InitiativeImage[] };

export interface InitiativeInput {
  titleEn: string;
  titleMr: string;
  districtEn: string;
  districtMr: string;
  descriptionEn?: string;
  descriptionMr?: string;
  images: string[];
}

export function listInitiatives() {
  return prisma.initiative.findMany({
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

function splitInput(input: InitiativeInput) {
  const { images, ...rest } = input;
  return { rest, images };
}

export async function createInitiative(input: InitiativeInput) {
  const { rest, images } = splitInput(input);
  await prisma.initiative.create({
    data: {
      ...rest,
      images: { create: images.map((imagePath, sortOrder) => ({ imagePath, sortOrder })) },
    },
  });
}

export async function updateInitiative(id: string, input: InitiativeInput) {
  const { rest, images } = splitInput(input);
  // Simplest correct approach at this scale: replace the whole image set
  // rather than diffing which images were added/removed/reordered.
  await prisma.$transaction([
    prisma.initiativeImage.deleteMany({ where: { initiativeId: id } }),
    prisma.initiative.update({
      where: { id },
      data: {
        ...rest,
        images: { create: images.map((imagePath, sortOrder) => ({ imagePath, sortOrder })) },
      },
    }),
  ]);
}

export async function deleteInitiative(id: string) {
  await prisma.initiative.delete({ where: { id } });
}
