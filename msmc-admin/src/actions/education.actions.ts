"use server";

import { revalidatePath } from "next/cache";
import { requireOfficer } from "@/lib/auth";
import * as education from "@/lib/education";
import type { EducationItemInput } from "@/lib/education";

export async function createEducationItemAction(input: EducationItemInput) {
  await requireOfficer();
  await education.createEducationItem(input);
  revalidatePath("/education");
}

export async function updateEducationItemAction(id: string, input: EducationItemInput) {
  await requireOfficer();
  await education.updateEducationItem(id, input);
  revalidatePath("/education");
}

export async function deleteEducationItemAction(id: string) {
  await requireOfficer();
  await education.deleteEducationItem(id);
  revalidatePath("/education");
}
