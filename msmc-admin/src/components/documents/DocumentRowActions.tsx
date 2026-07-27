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
import { DocumentFormDialog } from "./DocumentFormDialog";
import { updateDocumentAction, deleteDocumentAction } from "@/actions/documents.actions";
import type { Document } from "@/generated/prisma/client";

interface DocumentRowActionsProps {
  document: Document;
}

export function DocumentRowActions({ document }: DocumentRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteDocumentAction(document.id);
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

      <DocumentFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initial={document}
        onSubmit={(input) => updateDocumentAction(document.id, input)}
      />
    </>
  );
}
