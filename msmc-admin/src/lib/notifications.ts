import "server-only";
import { prisma } from "@/lib/prisma";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  ticketId: string | null;
  read: boolean;
  createdAt: string;
}

const LIST_LIMIT = 20;

function toItem(row: {
  id: string;
  title: string;
  body: string;
  ticketId: string | null;
  readAt: Date | null;
  createdAt: Date;
}): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    ticketId: row.ticketId,
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listNotificationsForUser(userId: string) {
  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return { notifications: rows.map(toItem), unreadCount };
}

export async function listNotificationsForCitizen(mobile: string) {
  const user = await prisma.user.findUnique({ where: { phone: mobile }, select: { id: true } });
  if (!user) return { notifications: [] as NotificationItem[], unreadCount: 0 };
  return listNotificationsForUser(user.id);
}

/** Scoped to `userId` so one user can never mark another's notification read. */
export async function markNotificationRead(id: string, userId: string) {
  await prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });
}

export async function markNotificationReadForCitizen(id: string, mobile: string) {
  const user = await prisma.user.findUnique({ where: { phone: mobile }, select: { id: true } });
  if (!user) return;
  await markNotificationRead(id, user.id);
}
