"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useOfficers } from "@/components/providers/OfficersProvider";

interface AssignOfficerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentOfficerId: string | null;
  onAssign: (officerId: string) => void;
}

// Only mounts the body while open, so a Cancel (which never reset the
// selection before) can't leave a stale, uncommitted pick behind for the
// next time this dialog opens — a fresh mount always starts from the
// complaint's actual current assignment.
export function AssignOfficerDialog({
  open,
  onOpenChange,
  currentOfficerId,
  onAssign,
}: AssignOfficerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <AssignOfficerBody
            currentOfficerId={currentOfficerId}
            onAssign={onAssign}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface AssignOfficerBodyProps {
  currentOfficerId: string | null;
  onAssign: (officerId: string) => void;
  onClose: () => void;
}

function AssignOfficerBody({ currentOfficerId, onAssign, onClose }: AssignOfficerBodyProps) {
  const officers = useOfficers();
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(currentOfficerId);

  const handleAssign = () => {
    if (!selectedOfficerId) return;
    onAssign(selectedOfficerId);
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Assign Officer</DialogTitle>
        <DialogDescription>
          Choose an officer to handle this complaint. Once assigned, only that
          officer (or the master admin) can act on it.
        </DialogDescription>
      </DialogHeader>

      <Select value={selectedOfficerId} onValueChange={setSelectedOfficerId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an officer" />
        </SelectTrigger>
        <SelectContent>
          {officers.map((officer) => (
            <SelectItem key={officer.id} value={officer.id}>
              {officer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {officers.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No active officers yet — add one from the Users page first.
        </p>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAssign} disabled={!selectedOfficerId}>
          Assign
        </Button>
      </DialogFooter>
    </>
  );
}
