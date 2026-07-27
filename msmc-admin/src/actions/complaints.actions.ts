"use server";

import { revalidatePath } from "next/cache";
import { requireOfficer } from "@/lib/auth";
import * as complaints from "@/lib/complaints";

export async function acceptComplaintAction(ticketId: string) {
  const officer = await requireOfficer();
  await complaints.acceptComplaint(ticketId, officer.id);
  revalidatePath(`/complaints/${ticketId}`);
  revalidatePath("/dashboard");
}

export async function rejectComplaintAction(ticketId: string, reason: string) {
  const officer = await requireOfficer();
  if (!reason.trim()) throw new Error("A rejection reason is required.");
  await complaints.rejectComplaint(ticketId, reason.trim(), officer.id);
  revalidatePath(`/complaints/${ticketId}`);
  revalidatePath("/dashboard");
}

export async function assignOfficerAction(ticketId: string, officerName: string) {
  await requireOfficer();
  await complaints.assignOfficerName(ticketId, officerName);
  revalidatePath(`/complaints/${ticketId}`);
  revalidatePath("/dashboard");
}

// Used for every non-final hearing — the first one and any "next hearing"
// scheduled after it. It's the same operation each time; only the choice of
// "next" vs "final" (made in the UI) determines which action gets called.
export async function scheduleInterimHearingAction(
  ticketId: string,
  data: { date: string; time: string; location: string; officerName: string }
) {
  const officer = await requireOfficer();
  await complaints.scheduleHearing(ticketId, "INTERIM", data, officer.id);
  revalidatePath(`/complaints/${ticketId}`);
}

export async function scheduleFinalHearingAction(
  ticketId: string,
  data: { date: string; time: string; location: string; officerName: string }
) {
  const officer = await requireOfficer();
  await complaints.scheduleHearing(ticketId, "FINAL", data, officer.id);
  revalidatePath(`/complaints/${ticketId}`);
}

export async function uploadVerdictAction(ticketId: string, fileName: string) {
  const officer = await requireOfficer();
  await complaints.uploadVerdict(ticketId, fileName, officer.id);
  revalidatePath(`/complaints/${ticketId}`);
}
