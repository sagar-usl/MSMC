import type { ComplaintStatus } from "@/types/complaint";

const badgeVariants: Record<ComplaintStatus, string> = {
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ACCEPTED: "bg-teal-100 text-teal-800 border-teal-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  CASE_ONBOARD: "bg-blue-100 text-blue-800 border-blue-200",
  FINAL_HEARING_SCHEDULED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  DISPOSED_OF: "bg-green-100 text-green-800 border-green-200",
  DISMISSED: "bg-slate-200 text-slate-800 border-slate-300",
};

export const statusLabels: Record<ComplaintStatus, string> = {
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  CASE_ONBOARD: "Case Onboard",
  FINAL_HEARING_SCHEDULED: "Final Hearing Scheduled",
  DISPOSED_OF: "Disposed Of",
  DISMISSED: "Dismissed",
};

interface StatusBadgeProps {
  status: ComplaintStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${badgeVariants[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
