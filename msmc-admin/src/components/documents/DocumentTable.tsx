import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentTableRow } from "./DocumentTableRow";
import type { Document } from "@/generated/prisma/client";

interface DocumentTableProps {
  documents: Document[];
}

export function DocumentTable({ documents }: DocumentTableProps) {
  if (documents.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No documents yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>File</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {documents.map((document) => (
          <DocumentTableRow key={document.id} document={document} />
        ))}
      </TableBody>
    </Table>
  );
}
