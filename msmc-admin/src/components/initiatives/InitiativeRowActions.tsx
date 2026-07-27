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
import { InitiativeFormDialog } from "./InitiativeFormDialog";
import { updateInitiativeAction, deleteInitiativeAction } from "@/actions/initiatives.actions";
import type { Initiative } from "@/generated/prisma/client";

interface InitiativeRowActionsProps {
  initiative: Initiative;
}

export function InitiativeRowActions({ initiative }: InitiativeRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteInitiativeAction(initiative.id);
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

      <InitiativeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initial={initiative}
        onSubmit={(input) => updateInitiativeAction(initiative.id, input)}
      />
    </>
  );
}
