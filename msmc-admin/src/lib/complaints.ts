import "server-only";
import { prisma } from "@/lib/prisma";
import type { ComplaintCategory, HearingKind } from "@/generated/prisma/client";
import type { Complaint } from "@/types/complaint";
import type { ComplaintDetails } from "@/types/complaint-details";

function generateTicketId(): string {
  const year = new Date().getFullYear();
  const n = Math.floor(100000 + Math.random() * 899999);
  return `CMP/${year}/${n}`;
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
  attachmentPath?: string;
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
      attachmentPath: input.attachmentPath,
    },
  });
  await prisma.complaintStatusHistory.create({
    data: { complaint: { connect: { ticketId } }, status: "UNDER_REVIEW" },
  });

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
} as const;

function toListItem(row: {
  id: string;
  ticketId: string;
  fullName: string;
  category: string;
  status: string;
  createdAt: Date;
  assignedOfficerName: string | null;
}): Complaint {
  return {
    id: row.ticketId,
    complainantName: row.fullName,
    category: row.category as Complaint["category"],
    submittedAt: row.createdAt.toISOString().slice(0, 10),
    status: row.status as Complaint["status"],
    assignedOfficer: row.assignedOfficerName,
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
  hearings: { orderBy: { createdAt: "asc" as const } },
} as const;

function toDetails(
  row: NonNullable<Awaited<ReturnType<typeof findByTicketId>>>
): ComplaintDetails {
  const hearing = row.hearings.find((h) => h.kind === "FIRST") ?? null;
  const hearing2 = row.hearings.find((h) => h.kind === "FINAL") ?? null;

  return {
    id: row.ticketId,
    complainantName: row.fullName,
    mobileNumber: row.mobile,
    category: row.category as ComplaintDetails["category"],
    description: row.description,
    submittedAt: row.createdAt.toISOString().slice(0, 10),
    status: row.status as ComplaintDetails["status"],
    assignedOfficer: row.assignedOfficerName,
    documents: row.attachmentPath
      ? [{ id: `${row.id}-attachment`, fileName: row.attachmentPath, fileUrl: row.attachmentPath }]
      : [],
    rejectionReason: row.rejectionReason,
    verdictFile: row.verdictFilePath,
    hearing: hearing
      ? {
          date: hearing.scheduledDate.toISOString().slice(0, 10),
          time: hearing.scheduledTime,
          location: hearing.location,
          officer: hearing.officerName,
        }
      : null,
    hearing2: hearing2
      ? {
          date: hearing2.scheduledDate.toISOString().slice(0, 10),
          time: hearing2.scheduledTime,
          location: hearing2.location,
          officer: hearing2.officerName,
        }
      : null,
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

async function getIdByTicket(ticketId: string): Promise<string> {
  const row = await prisma.complaint.findUniqueOrThrow({ where: { ticketId }, select: { id: true } });
  return row.id;
}

export async function acceptComplaint(ticketId: string, officerId: string) {
  const id = await getIdByTicket(ticketId);
  await prisma.complaint.update({ where: { id }, data: { status: "ACCEPTED" } });
  await recordStatus(id, "ACCEPTED", { changedById: officerId });
}

export async function rejectComplaint(ticketId: string, reason: string, officerId: string) {
  const id = await getIdByTicket(ticketId);
  await prisma.complaint.update({ where: { id }, data: { status: "REJECTED", rejectionReason: reason } });
  await recordStatus(id, "REJECTED", { note: reason, changedById: officerId });
}

export async function assignOfficerName(ticketId: string, officerName: string) {
  const id = await getIdByTicket(ticketId);
  await prisma.complaint.update({ where: { id }, data: { assignedOfficerName: officerName } });
}

export async function scheduleHearing(
  ticketId: string,
  kind: HearingKind,
  data: { date: string; time: string; location: string; officerName: string },
  officerId: string
) {
  const id = await getIdByTicket(ticketId);
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

  const nextStatus = kind === "FIRST" ? "CASE_ONBOARD" : "FINAL_HEARING_SCHEDULED";
  await prisma.complaint.update({ where: { id }, data: { status: nextStatus } });
  await recordStatus(id, nextStatus, { changedById: officerId });
}

export async function uploadVerdict(ticketId: string, fileName: string, officerId: string) {
  const id = await getIdByTicket(ticketId);
  await prisma.complaint.update({ where: { id }, data: { status: "DISPOSED_OF", verdictFilePath: fileName } });
  await recordStatus(id, "DISPOSED_OF", { changedById: officerId });
}
