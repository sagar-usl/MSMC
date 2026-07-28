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
        {document.filePath ? (
          <a
            href={`/api/v1/uploads/content-document/${encodeURIComponent(document.filePath)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            View PDF
          </a>
        ) : (
          <span className="text-muted-foreground">Not set</span>
        )}
      </TableCell>
      <TableCell>
        <DocumentRowActions document={document} />
      </TableCell>
    </TableRow>
  );
}
