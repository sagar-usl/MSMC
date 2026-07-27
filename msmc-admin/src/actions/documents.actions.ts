"use server";

import { revalidatePath } from "next/cache";
import { requireOfficer } from "@/lib/auth";
import * as documents from "@/lib/documents";
import type { DocumentInput } from "@/lib/documents";

export async function createDocumentAction(input: DocumentInput) {
  await requireOfficer();
  await documents.createDocument(input);
  revalidatePath("/documents");
}

export async function updateDocumentAction(id: string, input: DocumentInput) {
  await requireOfficer();
  await documents.updateDocument(id, input);
  revalidatePath("/documents");
}

export async function deleteDocumentAction(id: string) {
  await requireOfficer();
  await documents.deleteDocument(id);
  revalidatePath("/documents");
}
