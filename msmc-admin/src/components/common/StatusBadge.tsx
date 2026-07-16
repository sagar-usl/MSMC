import type { ComplaintStatus } from "@/types/complaint";

const badgeVariants = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Under Review": "bg-blue-100 text-blue-800 border-blue-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Resolved: "bg-green-100 text-green-800 border-green-200",
};

interface StatusBadgeProps {
  status: ComplaintStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${badgeVariants[status]}`}
    >
      {status}
    </span>
  );
}
