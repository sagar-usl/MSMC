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
  currentOfficer: string | null;
  onAssign: (officer: string) => void;
}

export function AssignOfficerDialog({
  open,
  onOpenChange,
  currentOfficer,
  onAssign,
}: AssignOfficerDialogProps) {
  const officers = useOfficers();
  const [selectedOfficer, setSelectedOfficer] = useState<string | null>(
    currentOfficer
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSelectedOfficer(currentOfficer);
    }
    onOpenChange(nextOpen);
  };

  const handleAssign = () => {
    if (!selectedOfficer) return;
    onAssign(selectedOfficer);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Officer</DialogTitle>
          <DialogDescription>
            Choose an officer to handle this complaint.
          </DialogDescription>
        </DialogHeader>

        <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an officer" />
          </SelectTrigger>
          <SelectContent>
            {officers.map((officer) => (
              <SelectItem key={officer} value={officer}>
                {officer}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedOfficer}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
