"use server";

import { revalidatePath } from "next/cache";
import { requireOfficer } from "@/lib/auth";
import * as users from "@/lib/users";

export async function createOfficerAction(input: { name: string; email: string; password: string }) {
  await requireOfficer();
  await users.createOfficer(input);
  revalidatePath("/users");
}

export async function setUserActiveAction(id: string, isActive: boolean) {
  await requireOfficer();
  await users.setUserActive(id, isActive);
  revalidatePath("/users");
}
