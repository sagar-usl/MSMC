import "server-only";
import { prisma } from "@/lib/prisma";
import type { ComplaintCategory, HearingKind, User } from "@/generated/prisma/client";
import type { Complaint } from "@/types/complaint";
import type { ComplaintDetails } from "@/types/complaint-details";
import { notifyCitizen, notifyOfficers } from "@/lib/push-notifications";

// Dash-separated (not slash-separated): this string is also used as a URL
// path segment (admin dashboard routes, /api/v1/complaints/:ticketId), and a
// literal "/" splits into extra path segments there, breaking navigation.
function generateTicketId(): string {
  const year = new Date().getFullYear();
  const n = Math.floor(100000 + Math.random() * 899999);
  return `CMP-${year}-${n}`;
}

/**
 * Citizen-facing entry point (used by the /api/complaints Route Handler —
 * not wired into the Flutter app yet, see the project plan). Finds or
 * creates the citizen by phone so the same person's complaints stay linked
 * to one User row across submissions.
 */
export async function createComplaint(input: {
  fullName: string;
  mobile: string;
  category: ComplaintCategory;
  description: string;
  attachments?: { fileName: string; filePath: string }[];
}): Promise<{ ticketId: string }> {
  const citizen = await prisma.user.upsert({
    where: { phone: input.mobile },
    update: {},
    create: { phone: input.mobile, name: input.fullName, role: "CITIZEN" },
  });

  const ticketId = generateTicketId();
  await prisma.complaint.create({
    data: {
      ticketId,
      citizenId: citizen.id,
      fullName: input.fullName,
      mobile: input.mobile,
      category: input.category,
      description: input.description,
      attachments: input.attachments?.length
        ? { create: input.attachments }
        : undefined,
    },
  });
  await prisma.complaintStatusHistory.create({
    data: { complaint: { connect: { ticketId } }, status: "UNDER_REVIEW" },
  });

  await notifyOfficers("New complaint filed", `${input.fullName} filed a new complaint (${ticketId})`, ticketId);

  return { ticketId };
}

export async function listComplaintsForCitizen(mobile: string): Promise<Complaint[]> {
  const rows = await prisma.complaint.findMany({
    where: { mobile },
    select: listSelect,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toListItem);
}

const listSelect = {
  id: true,
  ticketId: true,
  fullName: true,
  category: true,
  status: true,
  createdAt: true,
  assignedOfficerName: true,
  assignedOfficerId: true,
} as const;

function toListItem(row: {
  id: string;
  ticketId: string;
  fullName: string;
  category: string;
  status: string;
  createdAt: Date;
  assignedOfficerName: string | null;
  assignedOfficerId: string | null;
}): Complaint {
  return {
    id: row.ticketId,
    complainantName: row.fullName,
    category: row.category as Complaint["category"],
    submittedAt: row.createdAt.toISOString().slice(0, 10),
    status: row.status as Complaint["status"],
    assignedOfficer: row.assignedOfficerName,
    assignedOfficerId: row.assignedOfficerId,
  };
}

export async function listComplaints(): Promise<Complaint[]> {
  const rows = await prisma.complaint.findMany({
    select: listSelect,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toListItem);
}

const detailInclude = {
  hearings: { orderBy: { scheduledDate: "asc" as const } },
  attachments: { orderBy: { createdAt: "asc" as const } },
} as const;

function toDetails(
  row: NonNullable<Awaited<ReturnType<typeof findByTicketId>>>
): ComplaintDetails {
  return {
    id: row.ticketId,
    complainantName: row.fullName,
    mobileNumber: row.mobile,
    category: row.category as ComplaintDetails["category"],
    description: row.description,
    submittedAt: row.createdAt.toISOString().slice(0, 10),
    status: row.status as ComplaintDetails["status"],
    assignedOfficer: row.assignedOfficerName,
    assignedOfficerId: row.assignedOfficerId,
    documents: row.attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      fileUrl: `/api/v1/uploads/complaint-attachment/${encodeURIComponent(a.filePath)}?mobile=${encodeURIComponent(row.mobile)}&ticket=${encodeURIComponent(row.ticketId)}`,
    })),
    rejectionReason: row.rejectionReason,
    dismissalReason: row.dismissalReason,
    verdictFile: row.verdictFilePath,
    hearings: row.hearings.map((h) => ({
      date: h.scheduledDate.toISOString().slice(0, 10),
      time: h.scheduledTime,
      location: h.location,
      officer: h.officerName,
      isFinal: h.kind === "FINAL",
    })),
  };
}

function findByTicketId(ticketId: string) {
  return prisma.complaint.findUnique({
    where: { ticketId },
    include: detailInclude,
  });
}

export async function getComplaintByTicketId(ticketId: string): Promise<ComplaintDetails | null> {
  const row = await findByTicketId(ticketId);
  if (!row) return null;
  return toDetails(row);
}

async function recordStatus(complaintId: string, status: string, opts: { note?: string; changedById?: string }) {
  await prisma.complaintStatusHistory.create({
    data: {
      complaintId,
      // Cast: Prisma's generated enum type isn't imported here to keep this
      // helper generic; callers always pass a valid ComplaintStatus value.
      status: status as never,
      note: opts.note,
      changedById: opts.changedById,
    },
  });
}

async function getRefByTicket(ticketId: string): Promise<{ id: string; mobile: string }> {
  return prisma.complaint.findUniqueOrThrow({ where: { ticketId }, select: { id: true, mobile: true } });
}

export async function acceptComplaint(ticketId: string, officerId: string) {
  const { id, mobile } = await getRefByTicket(ticketId);
  await prisma.complaint.update({ where: { id }, data: { status: "ACCEPTED" } });
  await recordStatus(id, "ACCEPTED", { changedById: officerId });
  await notifyCitizen(mobile, "Complaint accepted", `Your complaint ${ticketId} has been accepted.`, ticketId);
}

export async function rejectComplaint(ticketId: string, reason: string, officerId: string) {
  const { id, mobile } = await getRefByTicket(ticketId);
  await prisma.complaint.update({ where: { id }, data: { status: "REJECTED", rejectionReason: reason } });
  await recordStatus(id, "REJECTED", { note: reason, changedById: officerId });
  await notifyCitizen(mobile, "Complaint rejected", `Your complaint ${ticketId} was rejected: ${reason}`, ticketId);
}

/**
 * Binds the complaint to a real officer account (master-admin-only — see
 * assignOfficerAction). `assignedOfficerName` is kept alongside as a cached
 * display label so table/detail views don't need an extra join.
 */
export async function assignOfficer(ticketId: string, officerId: string) {
  const officer = await prisma.user.findUniqueOrThrow({
    where: { id: officerId },
    select: { name: true, email: true },
  });
  const { id } = await getRefByTicket(ticketId);
  await prisma.complaint.update({
    where: { id },
    data: { assignedOfficerId: officerId, assignedOfficerName: officer.name ?? officer.email ?? "Unknown" },
  });
}

/**
 * Every mutating complaint action (accept/reject/dismiss/schedule
 * hearing/upload verdict) funnels through this: the master admin can act on
 * anything; a regular officer only on a complaint assigned to them.
 * Complaints with no assigned officer yet can only be acted on by the
 * master admin — assignment is what hands off control to a specific
 * officer, so there is always exactly one point of authority at any time.
 */
export async function assertCanActOnComplaint(ticketId: string, user: User): Promise<void> {
  if (user.role === "MASTER_ADMIN") return;
  const complaint = await prisma.complaint.findUniqueOrThrow({
    where: { ticketId },
    select: { assignedOfficerId: true },
  });
  if (complaint.assignedOfficerId !== user.id) {
    throw new Error("Only the assigned officer or the master admin can act on this complaint.");
  }
}

export async function scheduleHearing(
  ticketId: string,
  kind: HearingKind,
  data: { date: string; time: string; location: string; officerName: string },
  officerId: string
) {
  const { id, mobile } = await getRefByTicket(ticketId);
  await prisma.hearing.create({
    data: {
      complaintId: id,
      kind,
      scheduledDate: new Date(data.date),
      scheduledTime: data.time,
      location: data.location,
      officerName: data.officerName,
    },
  });

  const nextStatus = kind === "INTERIM" ? "CASE_ONBOARD" : "FINAL_HEARING_SCHEDULED";
  await prisma.complaint.update({ where: { id }, data: { status: nextStatus } });
  await recordStatus(id, nextStatus, { changedById: officerId });
  await notifyCitizen(
    mobile,
    "Hearing scheduled",
    `A hearing for complaint ${ticketId} is scheduled on ${data.date} at ${data.time}, ${data.location}.`,
    ticketId
  );
}

/**
 * Officer can dismiss a complaint mid-hearings (between the first and final
 * hearing) instead of continuing to a final hearing/verdict. A reason is
 * required and is shared with the citizen via push notification.
 */
export async function dismissComplaint(ticketId: string, reason: string, officerId: string) {
  const { id, mobile } = await getRefByTicket(ticketId);
  await prisma.complaint.update({ where: { id }, data: { status: "DISMISSED", dismissalReason: reason } });
  await recordStatus(id, "DISMISSED", { note: reason, changedById: officerId });
  await notifyCitizen(mobile, "Complaint dismissed", `Your complaint ${ticketId} was dismissed: ${reason}`, ticketId);
}

export async function uploadVerdict(ticketId: string, fileName: string, officerId: string) {
  const { id, mobile } = await getRefByTicket(ticketId);
  await prisma.complaint.update({ where: { id }, data: { status: "DISPOSED_OF", verdictFilePath: fileName } });
  await recordStatus(id, "DISPOSED_OF", { changedById: officerId });
  await notifyCitizen(mobile, "Case disposed", `Your complaint ${ticketId} has been disposed of. The verdict is now available.`, ticketId);
}
