"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComplaintDocument } from "@/types/complaint-details";
import { DocumentRow } from "./DocumentRow";
import { useState } from "react";
import { useDocumentActions } from "@/hooks/useDocumentActions";

interface UploadedDocumentsCardProps {
  documents: ComplaintDocument[];
}
import { DocumentPreviewDialog } from "../documents/DocumentPreviewDialog";

export function UploadedDocumentsCard({
  documents,
}: UploadedDocumentsCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<ComplaintDocument | null>(null);

  const handleView = (document: ComplaintDocument) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const { handleDownload } = useDocumentActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Documents</CardTitle>
      </CardHeader>

      <CardContent>
        {documents.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <DocumentRow
                key={document.id}
                document={document}
                onView={handleView}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </CardContent>

      <DocumentPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        document={selectedDocument}
      />
    </Card>
  );
}
