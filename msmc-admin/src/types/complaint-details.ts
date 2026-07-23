import type { ComplaintCategory, ComplaintStatus } from "./complaint";

export interface ComplaintDocument {
  id: string;
  fileName: string;
  fileUrl: string;
}

export interface ComplaintDetails {
  id: string;
  complainantName: string;
  mobileNumber: string;
  category: ComplaintCategory;
  description: string;
  submittedAt: string;
  status: ComplaintStatus;
  documents: ComplaintDocument[];
}
