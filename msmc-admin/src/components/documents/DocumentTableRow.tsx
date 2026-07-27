import { TableCell, TableRow } from "@/components/ui/table";
import { documentCategoryLabels } from "@/lib/labels";
import { DocumentRowActions } from "./DocumentRowActions";
import type { Document } from "@/generated/prisma/client";

interface DocumentTableRowProps {
  document: Document;
}

export function DocumentTableRow({ document }: DocumentTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{document.titleEn}</div>
        <div className="text-sm text-muted-foreground">{document.titleMr}</div>
      </TableCell>
      <TableCell>{documentCategoryLabels[document.category]}</TableCell>
      <TableCell>
        {document.filePath ?? <span className="text-muted-foreground">Not set</span>}
      </TableCell>
      <TableCell>
        <DocumentRowActions document={document} />
      </TableCell>
    </TableRow>
  );
}
