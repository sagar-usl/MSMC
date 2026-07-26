import "dotenv/config";
import { PrismaClient, ComplaintCategory, ComplaintStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Idempotent dev seed: one officer login + the 6 complaints that used to
 * live in msmc-admin's mock `complaint.service.ts`, spread one per status
 * so the full pipeline (under review -> accepted/rejected -> case onboard
 * -> final hearing -> disposed of) has real data to click through.
 */
async function main() {
  const officer = await prisma.user.upsert({
    where: { email: "admin@msmc.gov.in" },
    update: {},
    create: {
      email: "admin@msmc.gov.in",
      passwordHash: await bcrypt.hash("Admin@123", 10),
      name: "MSMC Admin",
      role: "OFFICER",
    },
  });

  const citizens = await Promise.all(
    [
      { phone: "9900000011", name: "Amir Shaikh" },
      { phone: "9876500002", name: "Fatima Khan" },
      { phone: "9876500003", name: "Joy Lobo" },
      { phone: "9876500004", name: "Sagar Jain" },
      { phone: "9876500005", name: "Anthony Gawade" },
    ].map((c) =>
      prisma.user.upsert({
        where: { phone: c.phone },
        update: {},
        create: { phone: c.phone, name: c.name, role: "CITIZEN" },
      })
    )
  );
  const [amir, fatima, joy, sagar, anthony] = citizens;

  async function seedComplaint(params: {
    ticketId: string;
    citizenId: string;
    fullName: string;
    mobile: string;
    category: ComplaintCategory;
    description: string;
    status: ComplaintStatus;
    rejectionReason?: string;
    verdictFilePath?: string;
    assignedOfficerId?: string;
    hearing?: { date: string; time: string; location: string; officerName: string };
    hearing2?: { date: string; time: string; location: string; officerName: string };
  }) {
    const existing = await prisma.complaint.findUnique({ where: { ticketId: params.ticketId } });
    if (existing) return existing;

    const complaint = await prisma.complaint.create({
      data: {
        ticketId: params.ticketId,
        citizenId: params.citizenId,
        fullName: params.fullName,
        mobile: params.mobile,
        category: params.category,
        description: params.description,
        status: params.status,
        rejectionReason: params.rejectionReason,
        verdictFilePath: params.verdictFilePath,
        assignedOfficerId: params.assignedOfficerId,
      },
    });

    // Build a plausible status_history trail leading up to the final status,
    // matching what the citizen app's timeline (and this dashboard's future
    // detail view) reads.
    const trail: ComplaintStatus[] = ["UNDER_REVIEW"];
    if (params.status !== "UNDER_REVIEW" && params.status !== "REJECTED") trail.push("ACCEPTED");
    if (params.status === "REJECTED") trail.push("REJECTED");
    if (["CASE_ONBOARD", "FINAL_HEARING_SCHEDULED", "DISPOSED_OF"].includes(params.status)) trail.push("CASE_ONBOARD");
    if (["FINAL_HEARING_SCHEDULED", "DISPOSED_OF"].includes(params.status)) trail.push("FINAL_HEARING_SCHEDULED");
    if (params.status === "DISPOSED_OF") trail.push("DISPOSED_OF");

    for (const status of trail) {
      await prisma.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          status,
          note: status === "REJECTED" ? params.rejectionReason : null,
          changedById: status === "UNDER_REVIEW" ? null : params.assignedOfficerId,
        },
      });
    }

    if (params.hearing) {
      await prisma.hearing.create({
        data: {
          complaintId: complaint.id,
          kind: "FIRST",
          scheduledDate: new Date(params.hearing.date),
          scheduledTime: params.hearing.time,
          location: params.hearing.location,
          officerName: params.hearing.officerName,
        },
      });
    }
    if (params.hearing2) {
      await prisma.hearing.create({
        data: {
          complaintId: complaint.id,
          kind: "FINAL",
          scheduledDate: new Date(params.hearing2.date),
          scheduledTime: params.hearing2.time,
          location: params.hearing2.location,
          officerName: params.hearing2.officerName,
        },
      });
    }

    return complaint;
  }

  await seedComplaint({
    ticketId: "CMP-1001",
    citizenId: amir.id,
    fullName: "Amir Shaikh",
    mobile: "9876500001",
    category: "DOCUMENTS",
    description: "Requested caste/domicile document has not been issued even after 30 days of application.",
    status: "UNDER_REVIEW",
  });

  await seedComplaint({
    ticketId: "CMP-1002",
    citizenId: fatima.id,
    fullName: "Fatima Khan",
    mobile: "9876500002",
    category: "SCHEME_DELAY",
    description: "Approved scheme benefit amount has not been disbursed for over two months.",
    status: "ACCEPTED",
    assignedOfficerId: officer.id,
  });

  await seedComplaint({
    ticketId: "CMP-1003",
    citizenId: joy.id,
    fullName: "Joy Lobo",
    mobile: "9876500003",
    category: "CORRUPTION",
    description: "Bribe demanded by an intermediary for processing a routine certificate request.",
    status: "CASE_ONBOARD",
    assignedOfficerId: officer.id,
    hearing: { date: "2026-08-05", time: "11:00", location: "District Collector Office, Mumbai", officerName: "MSMC Admin" },
  });

  await seedComplaint({
    ticketId: "CMP-1004",
    citizenId: sagar.id,
    fullName: "Sagar Jain",
    mobile: "9876500004",
    category: "EDUCATION",
    description: "Scholarship amount has not been credited despite approval.",
    status: "FINAL_HEARING_SCHEDULED",
    assignedOfficerId: officer.id,
    hearing: { date: "2026-07-20", time: "10:30", location: "Divisional Commission Office, Pune", officerName: "MSMC Admin" },
    hearing2: { date: "2026-08-10", time: "15:00", location: "State Minority Commission Office, Mumbai", officerName: "MSMC Admin" },
  });

  await seedComplaint({
    ticketId: "CMP-1005",
    citizenId: anthony.id,
    fullName: "Anthony Gawade",
    mobile: "9876500005",
    category: "DOCUMENTS",
    description: "Submitted documents did not match the required format during verification and were returned without explanation.",
    status: "REJECTED",
    rejectionReason: "Duplicate complaint — an identical grievance is already under process with the concerned district office.",
    assignedOfficerId: officer.id,
  });

  await seedComplaint({
    ticketId: "CMP-1006",
    citizenId: amir.id,
    fullName: "Amir Shaikh",
    mobile: "9900000011",
    category: "SCHEME_DELAY",
    description: "Aadhaar-linked scholarship document was rejected without a valid reason during verification. Submitted via the citizen mobile app.",
    status: "DISPOSED_OF",
    assignedOfficerId: officer.id,
    verdictFilePath: "final_verdict_CMP1006.pdf",
    hearing: { date: "2026-06-08", time: "10:00", location: "District Collector Office, Pune", officerName: "MSMC Admin" },
    hearing2: { date: "2026-06-28", time: "11:00", location: "State Minority Commission Office, Mumbai", officerName: "MSMC Admin" },
  });

  console.log("Seed complete.");
  console.log("Officer login: admin@msmc.gov.in / Admin@123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
