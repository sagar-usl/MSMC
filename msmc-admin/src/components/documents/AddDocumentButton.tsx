"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentFormDialog } from "./DocumentFormDialog";
import { createDocumentAction } from "@/actions/documents.actions";

export function AddDocumentButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Add Document
      </Button>
      <DocumentFormDialog open={open} onOpenChange={setOpen} onSubmit={createDocumentAction} />
    </>
  );
}
