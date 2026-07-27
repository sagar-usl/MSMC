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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { documentCategoryLabels } from "@/lib/labels";
import type { Document, DocumentCategory } from "@/generated/prisma/client";
import type { DocumentInput } from "@/lib/documents";

interface DocumentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Document;
  onSubmit: (input: DocumentInput) => Promise<void>;
}

function toForm(doc?: Document): DocumentInput {
  return {
    titleEn: doc?.titleEn ?? "",
    titleMr: doc?.titleMr ?? "",
    metaEn: doc?.metaEn ?? "",
    metaMr: doc?.metaMr ?? "",
    category: doc?.category ?? "REPORTS",
    filePath: doc?.filePath ?? "",
  };
}

export function DocumentFormDialog({ open, onOpenChange, initial, onSubmit }: DocumentFormDialogProps) {
  const [form, setForm] = useState<DocumentInput>(() => toForm(initial));
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
          <DialogTitle>{initial ? "Edit Document" : "Add Document"}</DialogTitle>
          <DialogDescription>Shown in the citizen app&apos;s Documents library.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-title-en">Title (English)</Label>
              <Input
                id="doc-title-en"
                value={form.titleEn}
                onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-title-mr">Title (Marathi)</Label>
              <Input
                id="doc-title-mr"
                value={form.titleMr}
                onChange={(e) => setForm((f) => ({ ...f, titleMr: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-meta-en">Meta (English)</Label>
              <Input
                id="doc-meta-en"
                placeholder="PDF · 2.4 MB"
                value={form.metaEn}
                onChange={(e) => setForm((f) => ({ ...f, metaEn: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-meta-mr">Meta (Marathi)</Label>
              <Input
                id="doc-meta-mr"
                placeholder="PDF · 2.4 MB"
                value={form.metaMr}
                onChange={(e) => setForm((f) => ({ ...f, metaMr: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm((f) => ({ ...f, category: value as DocumentCategory }))}
              >
                <SelectTrigger id="doc-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentCategoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-file-path">File Name</Label>
              <Input
                id="doc-file-path"
                placeholder="annual-report-2024-25.pdf"
                value={form.filePath}
                onChange={(e) => setForm((f) => ({ ...f, filePath: e.target.value }))}
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
            {isPending ? "Saving…" : initial ? "Save Changes" : "Add Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
