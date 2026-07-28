import "server-only";
import { prisma } from "@/lib/prisma";
import { messaging } from "@/lib/firebase-admin";

/** Upserts the citizen by phone (same pattern as createComplaint) and links this device token to them. */
export async function registerCitizenToken(mobile: string, token: string, platform: string) {
  const citizen = await prisma.user.upsert({
    where: { phone: mobile },
    update: {},
    create: { phone: mobile, role: "CITIZEN" },
  });
  await prisma.deviceToken.upsert({
    where: { token },
    update: { userId: citizen.id, platform },
    create: { token, platform, userId: citizen.id },
  });
}

/** Links this device token to an already-authenticated officer/admin. */
export async function registerOfficerToken(userId: string, token: string, platform: string) {
  await prisma.deviceToken.upsert({
    where: { token },
    update: { userId, platform },
    create: { token, platform, userId },
  });
}

/** Sends a push notification to every device registered for the citizen with this mobile number. */
export async function notifyCitizen(mobile: string, title: string, body: string) {
  const user = await prisma.user.findUnique({
    where: { phone: mobile },
    select: { deviceTokens: { select: { token: true } } },
  });
  if (!user) return;
  await sendToTokens(user.deviceTokens.map((t) => t.token), title, body);
}

/** Sends a push notification to every device registered for OFFICER accounts (the admin panel). */
export async function notifyOfficers(title: string, body: string) {
  const tokens = await prisma.deviceToken.findMany({
    where: { user: { role: "OFFICER" } },
    select: { token: true },
  });
  await sendToTokens(tokens.map((t) => t.token), title, body);
}

async function sendToTokens(tokens: string[], title: string, body: string) {
  if (tokens.length === 0) return;

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
  });

  const staleCodes = new Set([
    "messaging/registration-token-not-registered",
    "messaging/invalid-registration-token",
  ]);
  const staleTokens = response.responses
    .map((r, i) => (r.success || !staleCodes.has(r.error?.code ?? "") ? null : tokens[i]))
    .filter((t): t is string => t !== null);

  if (staleTokens.length > 0) {
    await prisma.deviceToken.deleteMany({ where: { token: { in: staleTokens } } });
  }
}
