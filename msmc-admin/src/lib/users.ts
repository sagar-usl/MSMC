import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export function listUsers() {
  return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createOfficer(input: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: "OFFICER",
    },
  });
}

export async function setUserActive(id: string, isActive: boolean) {
  await prisma.user.update({ where: { id }, data: { isActive } });
}
