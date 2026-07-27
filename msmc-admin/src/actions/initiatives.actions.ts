"use server";

import { revalidatePath } from "next/cache";
import { requireOfficer } from "@/lib/auth";
import * as initiatives from "@/lib/initiatives";
import type { InitiativeInput } from "@/lib/initiatives";

export async function createInitiativeAction(input: InitiativeInput) {
  await requireOfficer();
  await initiatives.createInitiative(input);
  revalidatePath("/initiatives");
}

export async function updateInitiativeAction(id: string, input: InitiativeInput) {
  await requireOfficer();
  await initiatives.updateInitiative(id, input);
  revalidatePath("/initiatives");
}

export async function deleteInitiativeAction(id: string) {
  await requireOfficer();
  await initiatives.deleteInitiative(id);
  revalidatePath("/initiatives");
}
