import type { ComplaintDocument } from "@/types/complaint-details";

export function useDocumentActions() {
  const handleDownload = (document: ComplaintDocument) => {
    const link = window.document.createElement("a");
    link.href = document.fileUrl;
    link.download = document.fileName;
    link.click();
  };

  return {
    handleDownload,
  };
}
