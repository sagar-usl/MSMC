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

/**
 * Sends a push notification to every device registered for the citizen with
 * this mobile number, and persists it so it still shows up in the citizen
 * app's notification list even if the push itself never lands (no token
 * registered, device offline, etc). `ticketId`, when given, lets both the
 * push payload and the in-app list link back to that complaint.
 */
export async function notifyCitizen(mobile: string, title: string, body: string, ticketId?: string) {
  const user = await prisma.user.findUnique({
    where: { phone: mobile },
    select: { id: true, deviceTokens: { select: { token: true } } },
  });
  if (!user) return;
  await prisma.notification.create({ data: { userId: user.id, title, body, ticketId } });
  await sendToTokens(user.deviceTokens.map((t) => t.token), title, body, ticketId ? { ticketId } : undefined);
}

/**
 * Sends a push notification to every OFFICER and MASTER_ADMIN account (the
 * master admin needs these too — new complaints have no assigned officer
 * yet, so only the master admin can act on them until they assign one) and
 * persists it for each recipient, so it still shows up in the admin panel's
 * notification list even if the push itself never lands. `ticketId`, when
 * given, lets both the push payload and the in-app list link back to that
 * complaint.
 */
export async function notifyOfficers(title: string, body: string, ticketId?: string) {
  const officers = await prisma.user.findMany({
    where: { role: { in: ["OFFICER", "MASTER_ADMIN"] } },
    select: { id: true, deviceTokens: { select: { token: true } } },
  });
  if (officers.length === 0) return;

  await prisma.notification.createMany({
    data: officers.map((o) => ({ userId: o.id, title, body, ticketId })),
  });

  const tokens = officers.flatMap((o) => o.deviceTokens.map((t) => t.token));
  await sendToTokens(tokens, title, body, ticketId ? { ticketId } : undefined);
}

async function sendToTokens(tokens: string[], title: string, body: string, data?: Record<string, string>) {
  if (tokens.length === 0) return;

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data,
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
