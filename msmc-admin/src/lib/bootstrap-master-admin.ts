import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

// Fixed, documented on purpose — this is the one account guaranteed to work
// on any fresh install so there's always a way in. It can be changed
// afterwards from Settings like any other officer password; this is only
// the bootstrap default.
const MASTER_ADMIN_EMAIL = "masteradmin@msmc.gov.in";
const MASTER_ADMIN_PASSWORD = "MasterAdmin@123";

const globalForBootstrap = globalThis as unknown as { masterAdminBootstrapped?: boolean };

/**
 * Ensures the single fixed master-admin account exists. Runs once per
 * process (module-level guard, same pattern as the prisma singleton) —
 * the upsert itself is also idempotent, so this stays safe even if it ends
 * up running more than once (e.g. multiple instances on first boot).
 */
export async function ensureMasterAdmin() {
  if (globalForBootstrap.masterAdminBootstrapped) return;
  globalForBootstrap.masterAdminBootstrapped = true;

  await prisma.user.upsert({
    where: { email: MASTER_ADMIN_EMAIL },
    update: {},
    create: {
      email: MASTER_ADMIN_EMAIL,
      passwordHash: await hashPassword(MASTER_ADMIN_PASSWORD),
      name: "Master Admin",
      role: "MASTER_ADMIN",
    },
  });
}
