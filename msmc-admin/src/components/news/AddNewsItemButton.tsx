"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsItemFormDialog } from "./NewsItemFormDialog";
import { createNewsItemAction } from "@/actions/news.actions";

export function AddNewsItemButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Add News Item
      </Button>
      <NewsItemFormDialog open={open} onOpenChange={setOpen} onSubmit={createNewsItemAction} />
    </>
  );
}
