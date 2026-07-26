import type { ComplaintCategory } from "@/types/complaint";

export const categoryLabels: Record<ComplaintCategory, string> = {
  DOCUMENTS: "Documents",
  EDUCATION: "Education",
  SCHEME_DELAY: "Scheme Delay",
  CORRUPTION: "Corruption",
  OTHER: "Other",
};
