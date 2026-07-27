"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EducationItemFormDialog } from "./EducationItemFormDialog";
import { createEducationItemAction } from "@/actions/education.actions";

export function AddEducationItemButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Add Item
      </Button>
      <EducationItemFormDialog open={open} onOpenChange={setOpen} onSubmit={createEducationItemAction} />
    </>
  );
}
