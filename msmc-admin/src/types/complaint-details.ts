import type { ComplaintCategory, ComplaintStatus } from "./complaint";

export interface ComplaintDocument {
  id: string;
  fileName: string;
  fileUrl: string;
}

export interface HearingInfo {
  date: string;
  time: string;
  location: string;
  officer: string;
  isFinal: boolean;
}

export interface ComplaintDetails {
  id: string;
  complainantName: string;
  mobileNumber: string;
  category: ComplaintCategory;
  description: string;
  submittedAt: string;
  status: ComplaintStatus;
  assignedOfficer: string | null;
  documents: ComplaintDocument[];
  rejectionReason: string | null;
  dismissalReason: string | null;
  hearings: HearingInfo[];
  verdictFile: string | null;
}
