import type {
  ComplaintStatus as PrismaComplaintStatus,
  ComplaintCategory as PrismaComplaintCategory,
} from "@/generated/prisma/client";

// Re-exported from the Prisma schema so the DB, API, and UI share one
// vocabulary — see prisma/schema.prisma for the source of truth. Matches
// the citizen (Flutter) app's complaint lifecycle: under review ->
// accepted/rejected -> case onboard -> final hearing scheduled -> disposed of.
export type ComplaintStatus = PrismaComplaintStatus;
export type ComplaintCategory = PrismaComplaintCategory;

export interface Complaint {
  id: string;
  complainantName: string;
  category: ComplaintCategory;
  submittedAt: string;
  status: ComplaintStatus;
  assignedOfficer: string | null;
}
