import type { Complaint } from "@/types/complaint";

export async function getRecentComplaints(): Promise<Complaint[]> {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  return [
    {
      id: "CMP-1001",
      complainantName: "Amir Shaikh",
      category: "Document",
      submittedAt: "2026-07-10",
      status: "Pending",
    },
    {
      id: "CMP-1002",
      complainantName: "Fatima Khan",
      category: "Scheme Delay",
      submittedAt: "2026-07-10",
      status: "Pending",
    },
    {
      id: "CMP-1003",
      complainantName: "Joy Lobo",
      category: "Corruption",
      submittedAt: "2026-07-12",
      status: "Under Review",
    },
    {
      id: "CMP-1004",
      complainantName: "Sagar Jain",
      category: "Education",
      submittedAt: "2026-07-12",
      status: "Resolved",
    },
    {
      id: "CMP-1005",
      complainantName: "Anthony Gawade",
      category: "Document",
      submittedAt: "2026-07-14",
      status: "Rejected",
    },
  ];
}
