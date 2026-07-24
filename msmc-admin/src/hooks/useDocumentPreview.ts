import { ComplaintDocument } from "@/types/complaint-details";
import { useState } from "react";

export function useDocumentPreview() {
  const [selectedDocument, setSelectedDocument] =
    useState<ComplaintDocument | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleView = (document: ComplaintDocument) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  return {
    selectedDocument,
    isPreviewOpen,
    handleView,
    closePreview,
  };
}
