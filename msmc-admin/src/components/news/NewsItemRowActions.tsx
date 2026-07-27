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
import { NewsItemFormDialog } from "./NewsItemFormDialog";
import { updateNewsItemAction, deleteNewsItemAction } from "@/actions/news.actions";
import type { NewsItem } from "@/generated/prisma/client";

interface NewsItemRowActionsProps {
  item: NewsItem;
}

export function NewsItemRowActions({ item }: NewsItemRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteNewsItemAction(item.id);
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

      <NewsItemFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initial={item}
        onSubmit={(input) => updateNewsItemAction(item.id, input)}
      />
    </>
  );
}
