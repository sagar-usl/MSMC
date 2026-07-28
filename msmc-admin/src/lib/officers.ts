import "server-only";
import { prisma } from "@/lib/prisma";

/** Names of active officer accounts — used to populate Assign Officer / hearing-officer dropdowns. */
export async function listActiveOfficerNames(): Promise<string[]> {
  const officers = await prisma.user.findMany({
    where: { role: "OFFICER", isActive: true },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return officers.map((o) => o.name).filter((name): name is string => !!name);
}
