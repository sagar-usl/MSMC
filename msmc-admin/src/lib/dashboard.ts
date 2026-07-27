import "server-only";
import { prisma } from "@/lib/prisma";

export type DashboardTitle =
  | "Total Complaints"
  | "Hearings Today"
  | "Documents"
  | "Active Users";

export interface DashboardStatistic {
  title: DashboardTitle;
  value: number;
  change: string;
  trend: "up" | "down";
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfTomorrow() {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

export async function getDashboardStatistics(): Promise<DashboardStatistic[]> {
  const [totalComplaints, hearingsToday, attachmentDocs, verdictDocs, activeUsers] = await Promise.all([
    prisma.complaint.count(),
    prisma.hearing.count({
      where: { scheduledDate: { gte: startOfToday(), lt: startOfTomorrow() } },
    }),
    prisma.complaintAttachment.count(),
    prisma.complaint.count({ where: { verdictFilePath: { not: null } } }),
    prisma.user.count({ where: { role: "CITIZEN" } }),
  ]);

  return [
    { title: "Total Complaints", value: totalComplaints, change: "All time", trend: "up" },
    { title: "Hearings Today", value: hearingsToday, change: "Scheduled", trend: hearingsToday > 0 ? "up" : "down" },
    { title: "Documents", value: attachmentDocs + verdictDocs, change: "Uploaded", trend: "up" },
    { title: "Active Users", value: activeUsers, change: "Registered", trend: "up" },
  ];
}
