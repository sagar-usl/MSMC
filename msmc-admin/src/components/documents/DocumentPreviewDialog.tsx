import { ComplaintDocument } from "@/types/complaint-details";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: ComplaintDocument | null;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document,
}: DocumentPreviewDialogProps) {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (!document) return;

    setPreviewError(false);
    setIsPreviewLoading(true);
  }, [document]);

  if (!document) {
    return null;
  }

  const isPdf = document.fileUrl.toLowerCase().endsWith(".pdf");

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(document.fileUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{document?.fileName ?? "Document Preview"}</DialogTitle>
        </DialogHeader>

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
              src={document.fileUrl}
              title={document.fileName}
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
              src={document.fileUrl}
              alt={document.fileName}
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
      </DialogContent>
    </Dialog>
  );
}
