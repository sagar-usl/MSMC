export type ComplaintStatus =
  | "Pending"
  | "Under Review"
  | "Rejected"
  | "Resolved";
export type ComplaintCategory =
  | "Document"
  | "Education"
  | "Scheme Delay"
  | "Corruption"
  | "Other";
export interface Complaint {
  id: string;
  complainantName: string;
  category: ComplaintCategory;
  submittedAt: string;
  status: ComplaintStatus;
}
