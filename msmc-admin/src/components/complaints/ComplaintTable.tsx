import type { Complaint } from "@/types/complaint";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ComplaintTableRow } from "./ComplaintTableRow";
import { Key } from "lucide-react";

interface ComplaintTableProps {
  complaints: Complaint[];
}

export function ComplaintTable({ complaints }: ComplaintTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Complaint ID</TableHead>
          <TableHead>Complainant</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {complaints.map((complaint) => (
          <ComplaintTableRow key={complaint.id} complaint={complaint} />
        ))}
      </TableBody>
    </Table>
  );
}
