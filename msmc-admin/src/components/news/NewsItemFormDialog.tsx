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
import { newsTagLabels } from "@/lib/labels";
import type { NewsItem, NewsTag } from "@/generated/prisma/client";
import type { NewsItemInput } from "@/lib/news";

interface NewsItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: NewsItem;
  onSubmit: (input: NewsItemInput) => Promise<void>;
}

interface NewsItemForm {
  tag: NewsTag;
  publishedDate: string;
  titleEn: string;
  titleMr: string;
  snippetEn: string;
  snippetMr: string;
}

function toForm(item?: NewsItem): NewsItemForm {
  return {
    tag: item?.tag ?? "NOTICE",
    publishedDate: item ? item.publishedDate.toISOString().slice(0, 10) : "",
    titleEn: item?.titleEn ?? "",
    titleMr: item?.titleMr ?? "",
    snippetEn: item?.snippetEn ?? "",
    snippetMr: item?.snippetMr ?? "",
  };
}

export function NewsItemFormDialog({ open, onOpenChange, initial, onSubmit }: NewsItemFormDialogProps) {
  const [form, setForm] = useState<NewsItemForm>(() => toForm(initial));
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

  const isComplete = form.titleEn.trim() && form.titleMr.trim() && form.publishedDate;

  const handleSubmit = () => {
    if (!isComplete) {
      setError("Title (both languages) and published date are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await onSubmit({ ...form, publishedDate: new Date(form.publishedDate) });
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit News Item" : "Add News Item"}</DialogTitle>
          <DialogDescription>Shown in the citizen app&apos;s News screen.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="news-tag">Tag</Label>
              <Select value={form.tag} onValueChange={(value) => setForm((f) => ({ ...f, tag: value as NewsTag }))}>
                <SelectTrigger id="news-tag" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(newsTagLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="news-date">Published Date</Label>
              <Input
                id="news-date"
                type="date"
                value={form.publishedDate}
                onChange={(e) => setForm((f) => ({ ...f, publishedDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="news-title-en">Title (English)</Label>
              <Input
                id="news-title-en"
                value={form.titleEn}
                onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="news-title-mr">Title (Marathi)</Label>
              <Input
                id="news-title-mr"
                value={form.titleMr}
                onChange={(e) => setForm((f) => ({ ...f, titleMr: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="news-snippet-en">Snippet (English)</Label>
              <Input
                id="news-snippet-en"
                value={form.snippetEn}
                onChange={(e) => setForm((f) => ({ ...f, snippetEn: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="news-snippet-mr">Snippet (Marathi)</Label>
              <Input
                id="news-snippet-mr"
                value={form.snippetMr}
                onChange={(e) => setForm((f) => ({ ...f, snippetMr: e.target.value }))}
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
            {isPending ? "Saving…" : initial ? "Save Changes" : "Add News Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
