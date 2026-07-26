import type { Complaint } from "@/types/complaint";
import { categoryLabels } from "@/lib/labels";
import { StatusBadge } from "../common/StatusBadge";
import { TableCell, TableRow } from "../ui/table";
import { ComplaintRowActions } from "./ComplaintRowActions";

interface ComplaintTableRowProps {
  complaint: Complaint;
}

export function ComplaintTableRow({ complaint }: ComplaintTableRowProps) {
  return (
    <TableRow>
      <TableCell>{complaint.id}</TableCell>
      <TableCell>{complaint.complainantName}</TableCell>
      <TableCell>{categoryLabels[complaint.category]}</TableCell>
      <TableCell>{complaint.submittedAt}</TableCell>
      <TableCell>
        <StatusBadge status={complaint.status} />
      </TableCell>
      <TableCell>
        {complaint.assignedOfficer ? (
          complaint.assignedOfficer
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )}
      </TableCell>
      <TableCell>
        <ComplaintRowActions complaint={complaint} />
      </TableCell>
    </TableRow>
  );
}
