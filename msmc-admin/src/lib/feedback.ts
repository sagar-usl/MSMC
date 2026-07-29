import "server-only";
import { prisma } from "@/lib/prisma";
import { notifyOfficers } from "@/lib/push-notifications";

export async function createFeedback(input: { rating: number; name?: string; message: string; mobile: string }) {
  if (input.rating < 1 || input.rating > 5) {
    throw new Error("rating must be between 1 and 5");
  }
  if (!input.message.trim() || input.message.trim().length < 5) {
    throw new Error("message must be at least 5 characters");
  }
  if (!/^[0-9]{10}$/.test(input.mobile)) {
    throw new Error("mobile must be a valid 10-digit number");
  }

  // Same upsert-by-phone pattern as createComplaint — links this feedback
  // to the same User row across submissions instead of leaving it
  // unattributed.
  const citizen = await prisma.user.upsert({
    where: { phone: input.mobile },
    update: {},
    create: { phone: input.mobile, name: input.name, role: "CITIZEN" },
  });

  await prisma.feedback.create({
    data: { userId: citizen.id, rating: input.rating, name: input.name, message: input.message.trim() },
  });

  const from = input.name?.trim() || "A citizen";
  await notifyOfficers("New feedback received", `${from} rated ${input.rating}/5: ${input.message.trim()}`);
}

export interface FeedbackItem {
  id: string;
  name: string | null;
  rating: number;
  message: string;
  createdAt: string;
}

export async function listFeedback(): Promise<FeedbackItem[]> {
  const rows = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    rating: row.rating,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  }));
}
