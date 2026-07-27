import type { ComplaintCategory } from "@/types/complaint";
import type { DocumentCategory, NewsTag } from "@/generated/prisma/client";

export const categoryLabels: Record<ComplaintCategory, string> = {
  DOCUMENTS: "Documents",
  EDUCATION: "Education",
  SCHEME_DELAY: "Scheme Delay",
  CORRUPTION: "Corruption",
  OTHER: "Other",
};

export const documentCategoryLabels: Record<DocumentCategory, string> = {
  REPORTS: "Reports",
  ACTS: "Acts & Rules",
  POLICIES: "Policies",
};

export const newsTagLabels: Record<NewsTag, string> = {
  SCHEME_UPDATE: "Scheme Update",
  NOTICE: "Notice",
  EVENT: "Event",
};
