"use server";

import { prisma } from "@/lib/prisma";
import { requireOfficer, hashPassword, verifyPassword } from "@/lib/auth";

export interface ChangePasswordState {
  error?: string;
  success?: boolean;
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const officer = await requireOfficer();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!officer.passwordHash || !(await verifyPassword(currentPassword, officer.passwordHash))) {
    return { error: "Current password is incorrect." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New password and confirmation do not match." };
  }

  await prisma.user.update({
    where: { id: officer.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return { success: true };
}
