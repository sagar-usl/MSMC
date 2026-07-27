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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { EducationItem } from "@/generated/prisma/client";
import type { EducationItemInput } from "@/lib/education";

interface EducationItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: EducationItem;
  onSubmit: (input: EducationItemInput) => Promise<void>;
}

function toForm(item?: EducationItem): EducationItemInput {
  return {
    titleEn: item?.titleEn ?? "",
    titleMr: item?.titleMr ?? "",
    descEn: item?.descEn ?? "",
    descMr: item?.descMr ?? "",
  };
}

export function EducationItemFormDialog({ open, onOpenChange, initial, onSubmit }: EducationItemFormDialogProps) {
  const [form, setForm] = useState<EducationItemInput>(() => toForm(initial));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm(toForm(initial));
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  const isComplete = form.titleEn.trim() && form.titleMr.trim();

  const handleSubmit = () => {
    if (!isComplete) {
      setError("Both English and Marathi titles are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await onSubmit(form);
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Education Item" : "Add Education Item"}</DialogTitle>
          <DialogDescription>Shown in the citizen app&apos;s Education screen.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edu-title-en">Title (English)</Label>
              <Input
                id="edu-title-en"
                value={form.titleEn}
                onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edu-title-mr">Title (Marathi)</Label>
              <Input
                id="edu-title-mr"
                value={form.titleMr}
                onChange={(e) => setForm((f) => ({ ...f, titleMr: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edu-desc-en">Description (English)</Label>
              <Input
                id="edu-desc-en"
                value={form.descEn}
                onChange={(e) => setForm((f) => ({ ...f, descEn: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edu-desc-mr">Description (Marathi)</Label>
              <Input
                id="edu-desc-mr"
                value={form.descMr}
                onChange={(e) => setForm((f) => ({ ...f, descMr: e.target.value }))}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : initial ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
