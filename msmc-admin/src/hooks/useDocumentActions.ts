import type { ComplaintDocument } from "@/types/complaint-details";

export function useDocumentActions() {
  const handleDownload = (document: ComplaintDocument) => {
    alert(`Downloading: ${document.fileName}`);
  };

  return {
    handleDownload,
  };
}
