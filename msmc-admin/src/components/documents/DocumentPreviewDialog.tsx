import Image from "next/image";
import { ComplaintDocument } from "@/types/complaint-details";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: ComplaintDocument | null;
}

/**
 * Inner component is keyed by document.fileUrl so that React remounts it
 * (and resets useState) whenever the selected document changes — avoiding
 * the need for a useEffect that calls setState synchronously.
 */
function PreviewContent({ document }: { document: ComplaintDocument }) {
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);

  const isPdf = document.fileUrl.toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(document.fileUrl);

  return (
    <div className="relative">
      {isPreviewLoading && !previewError && (
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
        <div className={`relative h-[600px] w-full ${isPreviewLoading ? "hidden" : "block"}`}>
          <Image
            src={document.fileUrl}
            alt={document.fileName}
            fill
            className="rounded-md object-contain"
            unoptimized
            onLoad={() => setIsPreviewLoading(false)}
            onError={() => {
              setIsPreviewLoading(false);
              setPreviewError(true);
            }}
          />
        </div>
      ) : (
        <div className="flex h-[600px] items-center justify-center rounded-md border">
          Preview is not available for this file type.
        </div>
      )}
    </div>
  );
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document,
}: DocumentPreviewDialogProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{document.fileName ?? "Document Preview"}</DialogTitle>
        </DialogHeader>

        {/* key resets PreviewContent state when the document changes */}
        <PreviewContent key={document.fileUrl} document={document} />
      </DialogContent>
    </Dialog>
  );
}
