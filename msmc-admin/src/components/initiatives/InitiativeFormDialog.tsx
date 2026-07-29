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
import { X } from "lucide-react";
import type { InitiativeInput, InitiativeWithImages } from "@/lib/initiatives";

interface InitiativeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: InitiativeWithImages;
  onSubmit: (input: InitiativeInput) => Promise<void>;
}

function toForm(item?: InitiativeWithImages): InitiativeInput {
  return {
    titleEn: item?.titleEn ?? "",
    titleMr: item?.titleMr ?? "",
    districtEn: item?.districtEn ?? "",
    districtMr: item?.districtMr ?? "",
    descriptionEn: item?.descriptionEn ?? "",
    descriptionMr: item?.descriptionMr ?? "",
    images: item?.images.map((i) => i.imagePath) ?? [],
  };
}

const MAX_IMAGES = 8;

/**
 * Thin shell: only mounts the actual form (InitiativeFormBody) while open.
 * A fresh mount means `useState`'s lazy initializer runs again with the
 * current `initial`, so the form always starts correct — no effect-based
 * reset needed, and no stale data from a previous open can leak in (the
 * bug this replaced: Cancel never cleared the form, so reopening "Add
 * Initiative" showed whatever was left over from the last time).
 */
export function InitiativeFormDialog({ open, onOpenChange, initial, onSubmit }: InitiativeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open && (
          <InitiativeFormBody
            initial={initial}
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface InitiativeFormBodyProps {
  initial?: InitiativeWithImages;
  onSubmit: (input: InitiativeInput) => Promise<void>;
  onClose: () => void;
}

function InitiativeFormBody({ initial, onSubmit, onClose }: InitiativeFormBodyProps) {
  const [form, setForm] = useState<InitiativeInput>(() => toForm(initial));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const bothOrNeither = (en?: string, mr?: string) => !!en?.trim() === !!mr?.trim();
  const isComplete =
    form.titleEn.trim() &&
    form.titleMr.trim() &&
    form.districtEn.trim() &&
    form.districtMr.trim() &&
    bothOrNeither(form.descriptionEn, form.descriptionMr);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES - form.images.length);
    if (files.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch("/api/uploads/initiative-image", { method: "POST", body: fd });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error ?? "Upload failed");
        }
        const { url } = (await res.json()) as { url: string };
        uploaded.push(url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = () => {
    if (!isComplete) {
      setError("Title and district are required in both languages. Description must be filled in both languages or left blank in both.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await onSubmit(form);
      onClose();
      router.refresh();
    });
  };

  return (
    <>
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
          <Label>Initiative Images ({form.images.length}/{MAX_IMAGES})</Label>
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.images.map((imagePath, index) => (
                <div key={imagePath} className="group relative h-16 w-24 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePath}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full rounded-md border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {form.images.length < MAX_IMAGES && (
            <label
              htmlFor="init-image-upload"
              className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-100"
            >
              {isUploading ? "Uploading…" : "Upload Image(s)"}
              <input
                id="init-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isPending || isUploading}>
          {isPending ? "Saving…" : initial ? "Save Changes" : "Add Initiative"}
        </Button>
      </DialogFooter>
    </>
  );
}
