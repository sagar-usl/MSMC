import "server-only";
import { prisma } from "@/lib/prisma";

export async function createFeedback(input: { rating: number; name?: string; message: string }) {
  if (input.rating < 1 || input.rating > 5) {
    throw new Error("rating must be between 1 and 5");
  }
  if (!input.message.trim() || input.message.trim().length < 5) {
    throw new Error("message must be at least 5 characters");
  }

  await prisma.feedback.create({
    data: { rating: input.rating, name: input.name, message: input.message.trim() },
  });
}
