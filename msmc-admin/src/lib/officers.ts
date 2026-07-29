import "server-only";
import { prisma } from "@/lib/prisma";

export interface ActiveOfficer {
  id: string;
  name: string;
}

/** Active officer accounts — used to populate the Assign Officer / hearing-officer dropdowns. */
export async function listActiveOfficers(): Promise<ActiveOfficer[]> {
  const officers = await prisma.user.findMany({
    where: { role: "OFFICER", isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return officers
    .filter((o) => o.name || o.email)
    .map((o) => ({ id: o.id, name: o.name ?? o.email! }));
}
