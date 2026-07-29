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
import { rejectComplaintAction } from "@/actions/complaints.actions";

interface RejectComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
}

// Only mounts the body while open, so a Cancel (which never cleared
// `reason` before) can't leave stale text behind for the next time this
// dialog opens — a fresh mount always starts blank.
export function RejectComplaintDialog({ open, onOpenChange, ticketId }: RejectComplaintDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <RejectComplaintBody ticketId={ticketId} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function RejectComplaintBody({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleReject = () => {
    if (!reason.trim()) return;
    startTransition(async () => {
      await rejectComplaintAction(ticketId, reason.trim());
      onClose();
      router.refresh();
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Reject Complaint</DialogTitle>
        <DialogDescription>Provide a reason for rejecting {ticketId}. This is shown to the citizen.</DialogDescription>
      </DialogHeader>

      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Duplicate complaint already under process"
        rows={4}
      />

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleReject} disabled={!reason.trim() || isPending}>
          {isPending ? "Rejecting…" : "Confirm Rejection"}
        </Button>
      </DialogFooter>
    </>
  );
}
