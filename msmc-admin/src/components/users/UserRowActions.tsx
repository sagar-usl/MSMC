"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setUserActiveAction } from "@/actions/users.actions";
import type { User } from "@/generated/prisma/client";

interface UserRowActionsProps {
  user: User;
}

export function UserRowActions({ user }: UserRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (user.role !== "OFFICER") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const handleToggle = () => {
    startTransition(async () => {
      await setUserActiveAction(user.id, !user.isActive);
      router.refresh();
    });
  };

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={handleToggle}>
      {user.isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
