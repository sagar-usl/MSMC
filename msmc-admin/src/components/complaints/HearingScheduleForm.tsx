"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { OFFICERS } from "@/constants/officers";

export interface HearingFormData {
  date: string;
  time: string;
  location: string;
  officerName: string;
}

interface HearingScheduleFormProps {
  title: string;
  submitLabel: string;
  defaultOfficer?: string | null;
  onSubmit: (data: HearingFormData) => Promise<void>;
}

export function HearingScheduleForm({ title, submitLabel, defaultOfficer, onSubmit }: HearingScheduleFormProps) {
  const [data, setData] = useState<HearingFormData>({
    date: "",
    time: "",
    location: "",
    officerName: defaultOfficer ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isComplete = data.date && data.time && data.location.trim() && data.officerName.trim();

  const handleSubmit = () => {
    if (!isComplete) {
      setError("Please fill in all hearing details.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await onSubmit(data);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="hearing-date">Hearing Date</Label>
            <Input
              id="hearing-date"
              type="date"
              value={data.date}
              onChange={(e) => setData((d) => ({ ...d, date: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hearing-time">Hearing Time</Label>
            <Input
              id="hearing-time"
              type="time"
              value={data.time}
              onChange={(e) => setData((d) => ({ ...d, time: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hearing-location">Hearing Location</Label>
          <Input
            id="hearing-location"
            placeholder="e.g. Commission Office, Mumbai"
            value={data.location}
            onChange={(e) => setData((d) => ({ ...d, location: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hearing-officer">Officer Name</Label>
          <Select
            value={data.officerName}
            onValueChange={(value) => setData((d) => ({ ...d, officerName: value ?? "" }))}
          >
            <SelectTrigger id="hearing-officer" className="w-full">
              <SelectValue placeholder="Select an officer" />
            </SelectTrigger>
            <SelectContent>
              {OFFICERS.map((officer) => (
                <SelectItem key={officer} value={officer}>
                  {officer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={handleSubmit} disabled={isPending} className="w-full justify-center py-3">
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
