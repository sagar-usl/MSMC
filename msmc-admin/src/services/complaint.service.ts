import type { Complaint } from "@/types/complaint";
import type { ComplaintDetails } from "@/types/complaint-details";

export async function getRecentComplaints(): Promise<Complaint[]> {
  await new Promise((resolve) => setTimeout(resolve, 0));

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

export async function getComplaintDetails(
  id: string
): Promise<ComplaintDetails> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id,
    complainantName: "Amir Khan",
    mobileNumber: "9876543210",
    category: "Education",
    description: "Scholarship amount has not been credited despite approval.",
    submittedAt: "2026-07-12",
    status: "Under Review",
    documents: [
      {
        id: "DOC-001",
        fileName: "Aadhaar Card.pdf",
        fileUrl: "/sample-files/aadhar.png",
      },
      {
        id: "DOC-002",
        fileName: "Income Certificate.pdf",
        fileUrl: "/sample-files/income.png",
      },
      {
        id: "DOC-003",
        fileName: "Scholarship Application.pdf",
        fileUrl: "/sample-files/scholarship.png",
      },
    ],
  };
}
