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

  // --- Content modules: same rows the Flutter app's screens show as static
  // data today (documents_content.dart etc.) — mirrored here so the admin
  // CMS screens have something real to list/edit against.
  await prisma.document.createMany({
    data: [
      { titleEn: "Annual Report 2024-25", titleMr: "वार्षिक अहवाल २०२४-२५", metaEn: "PDF · 2.4 MB", metaMr: "PDF · 2.4 MB", category: "REPORTS", sortOrder: 0 },
      { titleEn: "Government Resolution - GR/2026/14", titleMr: "शासन निर्णय - GR/2026/14", metaEn: "PDF · 1.8 MB", metaMr: "PDF · 1.8 MB", category: "ACTS", sortOrder: 1 },
      { titleEn: "Minority Commission Act, 2004", titleMr: "अल्पसंख्याक आयोग कायदा, २००४", metaEn: "PDF · 3.1 MB", metaMr: "PDF · 3.1 MB", category: "ACTS", sortOrder: 2 },
      { titleEn: "Scholarship Disbursement Policy", titleMr: "शिष्यवृत्ती वितरण धोरण", metaEn: "PDF · 2.0 MB", metaMr: "PDF · 2.0 MB", category: "POLICIES", sortOrder: 3 },
      { titleEn: "RTI Handbook", titleMr: "माहिती अधिकार पुस्तिका", metaEn: "PDF · 1.2 MB", metaMr: "PDF · 1.2 MB", category: "POLICIES", sortOrder: 4 },
    ],
    skipDuplicates: true,
  });

  await prisma.educationItem.createMany({
    data: [
      { titleEn: "Pre-Matric Scholarship", titleMr: "मॅट्रिकपूर्व शिष्यवृत्ती", descEn: "For students in classes 1-10", descMr: "इयत्ता १ ते १० च्या विद्यार्थ्यांसाठी", sortOrder: 0 },
      { titleEn: "Post-Matric Scholarship", titleMr: "मॅट्रिकोत्तर शिष्यवृत्ती", descEn: "For undergraduate & postgraduate students", descMr: "पदवी व पदव्युत्तर विद्यार्थ्यांसाठी", sortOrder: 1 },
      { titleEn: "Merit-cum-Means Scholarship", titleMr: "गुणवत्ता-सह-गरजाधारित शिष्यवृत्ती", descEn: "For professional & technical courses", descMr: "व्यावसायिक व तांत्रिक अभ्यासक्रमांसाठी", sortOrder: 2 },
      { titleEn: "NSP Scholarship", titleMr: "NSP शिष्यवृत्ती", descEn: "Apply via National Scholarship Portal", descMr: "राष्ट्रीय शिष्यवृत्ती पोर्टलवर अर्ज करा", sortOrder: 3 },
    ],
    skipDuplicates: true,
  });

  await prisma.initiative.createMany({
    data: [
      { titleEn: "Skill Development Program", titleMr: "कौशल्य विकास कार्यक्रम", districtEn: "Sambhaji Nagar", districtMr: "संभाजी नगर", descriptionEn: "Vocational training and job placement support for minority youth.", descriptionMr: "अल्पसंख्याक युवकांसाठी व्यावसायिक प्रशिक्षण व रोजगार सहाय्य.", sortOrder: 0 },
      { titleEn: "Women Empowerment Cell", titleMr: "महिला सक्षमीकरण कक्ष", districtEn: "Nashik", districtMr: "नाशिक", descriptionEn: "Micro-credit, self-help groups and entrepreneurship support for women.", descriptionMr: "महिलांसाठी सूक्ष्म-कर्ज, बचत गट व उद्योजकता सहाय्य.", sortOrder: 1 },
      { titleEn: "Youth Development Mission", titleMr: "युवा विकास मिशन", districtEn: "Beed", districtMr: "बीड", descriptionEn: "Career counselling, competitive exam coaching and mentorship.", descriptionMr: "करिअर मार्गदर्शन, स्पर्धा परीक्षा प्रशिक्षण व मार्गदर्शन.", sortOrder: 2 },
      { titleEn: "Community Outreach Drives", titleMr: "सामुदायिक जनजागृती मोहीम", districtEn: "Bhandara", districtMr: "भंडारा", descriptionEn: "District-level camps to raise awareness of schemes and entitlements.", descriptionMr: "योजना व हक्कांबाबत जनजागृतीसाठी जिल्हास्तरीय शिबिरे.", sortOrder: 3 },
    ],
    skipDuplicates: true,
  });

  await prisma.newsItem.createMany({
    data: [
      { tag: "SCHEME_UPDATE", publishedDate: new Date("2026-07-02"), titleEn: "Post-Matric Scholarship 2026-27 applications now open", titleMr: "मॅट्रिकोत्तर शिष्यवृत्ती २०२६-२७ साठी अर्ज सुरू", snippetEn: "Students can apply on the National Scholarship Portal until 30 Sept 2026.", snippetMr: "विद्यार्थी ३० सप्टेंबर २०२६ पर्यंत राष्ट्रीय शिष्यवृत्ती पोर्टलवर अर्ज करू शकतात.", sortOrder: 0 },
      { tag: "NOTICE", publishedDate: new Date("2026-06-28"), titleEn: "Revised income eligibility limits for welfare schemes", titleMr: "कल्याण योजनांसाठी सुधारित उत्पन्न पात्रता मर्यादा", snippetEn: "Updated income criteria effective from the current financial year.", snippetMr: "चालू आर्थिक वर्षापासून सुधारित उत्पन्न निकष लागू.", sortOrder: 1 },
      { tag: "EVENT", publishedDate: new Date("2026-06-20"), titleEn: "District awareness camps scheduled across Maharashtra", titleMr: "महाराष्ट्रभर जिल्हास्तरीय जनजागृती शिबिरे नियोजित", snippetEn: "Camps to help citizens understand and apply for available schemes.", snippetMr: "नागरिकांना योजना समजून घेण्यास व अर्ज करण्यास मदत करणारी शिबिरे.", sortOrder: 2 },
      { tag: "NOTICE", publishedDate: new Date("2026-06-10"), titleEn: "Helpline hours extended for grievance support", titleMr: "तक्रार सहाय्यासाठी हेल्पलाइन वेळ वाढवली", snippetEn: "The commission helpline is now available 8 AM - 8 PM, all days.", snippetMr: "आयोगाची हेल्पलाइन आता सकाळी ८ ते रात्री ८ पर्यंत उपलब्ध.", sortOrder: 3 },
    ],
    skipDuplicates: true,
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
