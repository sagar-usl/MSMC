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

// Only mounts the body while open, so a Cancel (which never cleared
// `reason` before) can't leave stale text behind for the next time this
// dialog opens — a fresh mount always starts blank.
export function DismissComplaintDialog({ open, onOpenChange, ticketId }: DismissComplaintDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <DismissComplaintBody ticketId={ticketId} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function DismissComplaintBody({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDismiss = () => {
    if (!reason.trim()) return;
    startTransition(async () => {
      await dismissComplaintAction(ticketId, reason.trim());
      onClose();
      router.refresh();
    });
  };

  return (
    <>
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
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleDismiss} disabled={!reason.trim() || isPending}>
          {isPending ? "Dismissing…" : "Confirm Dismissal"}
        </Button>
      </DialogFooter>
    </>
  );
}
