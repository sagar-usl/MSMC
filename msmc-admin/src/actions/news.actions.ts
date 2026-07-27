"use server";

import { revalidatePath } from "next/cache";
import { requireOfficer } from "@/lib/auth";
import * as news from "@/lib/news";
import type { NewsItemInput } from "@/lib/news";

export async function createNewsItemAction(input: NewsItemInput) {
  await requireOfficer();
  await news.createNewsItem(input);
  revalidatePath("/news");
}

export async function updateNewsItemAction(id: string, input: NewsItemInput) {
  await requireOfficer();
  await news.updateNewsItem(id, input);
  revalidatePath("/news");
}

export async function deleteNewsItemAction(id: string) {
  await requireOfficer();
  await news.deleteNewsItem(id);
  revalidatePath("/news");
}
