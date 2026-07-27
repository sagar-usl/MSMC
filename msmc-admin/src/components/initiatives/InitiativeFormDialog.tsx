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
import type { Initiative } from "@/generated/prisma/client";
import type { InitiativeInput } from "@/lib/initiatives";

interface InitiativeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Initiative;
  onSubmit: (input: InitiativeInput) => Promise<void>;
}

function toForm(item?: Initiative): InitiativeInput {
  return {
    titleEn: item?.titleEn ?? "",
    titleMr: item?.titleMr ?? "",
    districtEn: item?.districtEn ?? "",
    districtMr: item?.districtMr ?? "",
    descriptionEn: item?.descriptionEn ?? "",
    descriptionMr: item?.descriptionMr ?? "",
    imagePath: item?.imagePath ?? "",
  };
}

export function InitiativeFormDialog({ open, onOpenChange, initial, onSubmit }: InitiativeFormDialogProps) {
  const [form, setForm] = useState<InitiativeInput>(() => toForm(initial));
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

  const isComplete = form.titleEn.trim() && form.titleMr.trim() && form.districtEn.trim() && form.districtMr.trim();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/uploads/initiative-image", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(j.error ?? "Upload failed");
      }
      const { url } = await res.json() as { url: string };
      setForm((f) => ({ ...f, imagePath: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    if (!isComplete) {
      setError("Title and district are required in both languages.");
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
          <DialogTitle>{initial ? "Edit Initiative" : "Add Initiative"}</DialogTitle>
          <DialogDescription>Shown in the citizen app&apos;s Initiatives screen.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="init-title-en">Title (English)</Label>
              <Input
                id="init-title-en"
                value={form.titleEn}
                onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="init-title-mr">Title (Marathi)</Label>
              <Input
                id="init-title-mr"
                value={form.titleMr}
                onChange={(e) => setForm((f) => ({ ...f, titleMr: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="init-district-en">District (English)</Label>
              <Input
                id="init-district-en"
                value={form.districtEn}
                onChange={(e) => setForm((f) => ({ ...f, districtEn: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="init-district-mr">District (Marathi)</Label>
              <Input
                id="init-district-mr"
                value={form.districtMr}
                onChange={(e) => setForm((f) => ({ ...f, districtMr: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="init-desc-en">Description (English)</Label>
              <Input
                id="init-desc-en"
                value={form.descriptionEn}
                onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="init-desc-mr">Description (Marathi)</Label>
              <Input
                id="init-desc-mr"
                value={form.descriptionMr}
                onChange={(e) => setForm((f) => ({ ...f, descriptionMr: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Initiative Image</Label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="init-image-upload"
                className="cursor-pointer rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-100"
              >
                {isUploading ? "Uploading…" : "Upload Image"}
                <input
                  id="init-image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
              {form.imagePath && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imagePath}
                  alt="Preview"
                  className="h-12 w-20 rounded-md border object-cover"
                />
              )}
            </div>
            {form.imagePath && (
              <p className="truncate text-xs text-muted-foreground">{form.imagePath}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || isUploading}>
            {isPending ? "Saving…" : initial ? "Save Changes" : "Add Initiative"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
