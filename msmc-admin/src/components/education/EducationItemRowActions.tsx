"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EducationItemFormDialog } from "./EducationItemFormDialog";
import { updateEducationItemAction, deleteEducationItemAction } from "@/actions/education.actions";
import type { EducationItem } from "@/generated/prisma/client";

interface EducationItemRowActionsProps {
  item: EducationItem;
}

export function EducationItemRowActions({ item }: EducationItemRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteEducationItemAction(item.id);
      router.refresh();
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <MoreHorizontal />
          <span className="sr-only">Open actions</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" disabled={isPending} onClick={handleDelete}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EducationItemFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initial={item}
        onSubmit={(input) => updateEducationItemAction(item.id, input)}
      />
    </>
  );
}
