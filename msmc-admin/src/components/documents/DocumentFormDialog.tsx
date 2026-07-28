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
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm(toForm(initial));
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  // Bilingual fields are all-or-nothing: both languages or neither, never
  // English-only or Marathi-only.
  const bothOrNeither = (en?: string, mr?: string) => !!en?.trim() === !!mr?.trim();
  const isComplete =
    form.titleEn.trim() &&
    form.titleMr.trim() &&
    bothOrNeither(form.metaEn, form.metaMr);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads/content-document", { method: "POST", body: fd });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Upload failed");
      }
      const { filePath } = (await res.json()) as { filePath: string };
      setForm((f) => ({ ...f, filePath }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "File upload failed.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    if (!isComplete) {
      setError("Title is required in both languages. Meta must be filled in both languages or left blank in both.");
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
              <Label>PDF File</Label>
              <label
                htmlFor="doc-file-upload"
                className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-input px-3 py-1.5 text-sm text-muted-foreground transition hover:border-ring hover:text-foreground"
              >
                {isUploading ? "Uploading…" : form.filePath ? "Replace PDF" : "Upload PDF"}
                <input
                  id="doc-file-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
              {form.filePath && (
                <p className="truncate text-xs text-muted-foreground">{form.filePath}</p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || isUploading}>
            {isPending ? "Saving…" : initial ? "Save Changes" : "Add Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
