"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InitiativeFormDialog } from "./InitiativeFormDialog";
import { createInitiativeAction } from "@/actions/initiatives.actions";

export function AddInitiativeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Add Initiative
      </Button>
      <InitiativeFormDialog open={open} onOpenChange={setOpen} onSubmit={createInitiativeAction} />
    </>
  );
}
