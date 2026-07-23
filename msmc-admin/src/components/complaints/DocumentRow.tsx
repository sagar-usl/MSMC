"use client";

import { Button } from "@/components/ui/button";
import { Download, Eye, FileText } from "lucide-react";
import type { ComplaintDocument } from "@/types/complaint-details";

interface DocumentRowProps {
  document: ComplaintDocument;
  onView: (document: ComplaintDocument) => void;
  onDownload: (document: ComplaintDocument) => void;
}

export function DocumentRow({
  document,
  onView,
  onDownload,
}: DocumentRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-muted-foreground" />

        <span className="font-medium">{document.fileName}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onView(document)}>
          <Eye className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDownload(document)}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
