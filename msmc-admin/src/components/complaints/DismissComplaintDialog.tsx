"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { dismissComplaintAction } from "@/actions/complaints.actions";

interface DismissComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
}

export function DismissComplaintDialog({ open, onOpenChange, ticketId }: DismissComplaintDialogProps) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDismiss = () => {
    if (!reason.trim()) return;
    startTransition(async () => {
      await dismissComplaintAction(ticketId, reason.trim());
      setReason("");
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dismiss Complaint</DialogTitle>
          <DialogDescription>Provide a reason for dismissing {ticketId}. This is shown to the citizen.</DialogDescription>
        </DialogHeader>

        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Citizen withdrew the complaint"
          rows={4}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDismiss} disabled={!reason.trim() || isPending}>
            {isPending ? "Dismissing…" : "Confirm Dismissal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
