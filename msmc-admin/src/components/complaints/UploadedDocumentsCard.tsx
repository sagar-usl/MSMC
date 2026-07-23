"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComplaintDocument } from "@/types/complaint-details";
import { DocumentRow } from "./DocumentRow";
import { useState } from "react";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

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

  const isPdf = selectedDocument?.fileUrl?.toLowerCase().endsWith(".pdf");

  const isImage = selectedDocument?.fileUrl?.match(
    /\.(jpg|jpeg|png|gif|webp)$/i
  );

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
      {/* <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <p className="font-medium">{selectedDocument.fileName}</p>

              <div className="relative">
                {isPreviewLoading && (
                  <div className="flex h-[600px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}

                {previewError ? (
                  <div className="flex h-[600px] items-center justify-center rounded-md border text-destructive">
                    Failed to load preview.
                  </div>
                ) : isPdf ? (
                  <iframe
                    src={selectedDocument.fileUrl}
                    title={selectedDocument.fileName}
                    className={`h-[600px] w-full rounded-md border ${
                      isPreviewLoading ? "hidden" : "block"
                    }`}
                    onLoad={() => setIsPreviewLoading(false)}
                    onError={() => {
                      setIsPreviewLoading(false);
                      setPreviewError(true);
                    }}
                  />
                ) : isImage ? (
                  <img
                    src={selectedDocument.fileUrl}
                    alt={selectedDocument.fileName}
                    className={`max-h-[600px] w-full rounded-md object-contain ${
                      isPreviewLoading ? "hidden" : "block"
                    }`}
                    onLoad={() => setIsPreviewLoading(false)}
                    onError={() => {
                      setIsPreviewLoading(false);
                      setPreviewError(true);
                    }}
                  />
                ) : (
                  <div className="flex h-[600px] items-center justify-center rounded-md border">
                    Preview is not available for this file type.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog> */}

      <DocumentPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        document={selectedDocument}
      />
    </Card>
  );
}
