"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { createOfficerAction } from "@/actions/users.actions";

const emptyForm = { name: "", email: "", password: "" };

export function AddOfficerDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm(emptyForm);
      setError(null);
    }
    setOpen(nextOpen);
  };

  const isComplete = form.name.trim() && form.email.trim() && form.password.length >= 8;

  const handleSubmit = () => {
    if (!isComplete) {
      setError("Name, email, and a password of at least 8 characters are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createOfficerAction(form);
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create officer.");
      }
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Add Officer
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Officer</DialogTitle>
            <DialogDescription>Creates a new officer account with dashboard access.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="officer-name">Name</Label>
              <Input id="officer-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="officer-email">Email</Label>
              <Input
                id="officer-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="officer-password">Password</Label>
              <Input
                id="officer-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Creating…" : "Add Officer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
