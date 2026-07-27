"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ComplaintDetails } from "@/types/complaint-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RejectComplaintDialog } from "./RejectComplaintDialog";
import { HearingScheduleForm, type HearingFormData } from "./HearingScheduleForm";
import { HearingInfoCard } from "./HearingInfoCard";
import {
  acceptComplaintAction,
  scheduleFirstHearingAction,
  scheduleFinalHearingAction,
  uploadVerdictAction,
} from "@/actions/complaints.actions";

interface ComplaintDecisionPanelProps {
  complaint: ComplaintDetails;
}

/**
 * The officer-facing decision workflow: accept/reject, schedule the first
 * and final hearings, and upload the verdict. Mirrors the citizen (Flutter)
 * app's ComplaintDetailScreen officer actions one-for-one so both surfaces
 * drive the same complaint lifecycle.
 */
export function ComplaintDecisionPanel({ complaint }: ComplaintDecisionPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { id, status, rejectionReason, hearing, hearing2, verdictFile } = complaint;

  return (
    <div className="space-y-6">
      {status === "UNDER_REVIEW" && (
        <Card>
          <CardHeader>
            <CardTitle>Officer Decision</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await acceptComplaintAction(id);
                  router.refresh();
                })
              }
            >
              Accept Complaint
            </Button>
            <Button variant="destructive" onClick={() => setIsRejectOpen(true)}>
              Reject Complaint
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "REJECTED" && rejectionReason && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle>Reason for Rejection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-7 text-muted-foreground">{rejectionReason}</p>
          </CardContent>
        </Card>
      )}

      {status === "ACCEPTED" && !hearing && (
        <HearingScheduleForm
          title="Schedule Hearing"
          submitLabel="Save & Schedule Hearing"
          onSubmit={(data: HearingFormData) => scheduleFirstHearingAction(id, data)}
        />
      )}

      {hearing && <HearingInfoCard title="Scheduled Hearing" hearing={hearing} />}

      {status === "CASE_ONBOARD" && !hearing2 && (
        <HearingScheduleForm
          title="Schedule Final Hearing"
          submitLabel="Save & Schedule Final Hearing"
          onSubmit={(data: HearingFormData) => scheduleFinalHearingAction(id, data)}
        />
      )}

      {hearing2 && <HearingInfoCard title="Final Hearing" hearing={hearing2} />}

      {status === "FINAL_HEARING_SCHEDULED" && !verdictFile && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Verdict</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 hover:bg-slate-100">
              <span className="text-sm font-medium text-blue-700">
                {isUploading ? "Uploading…" : "Upload Verdict Document"}
              </span>
              <span className="text-xs text-muted-foreground">PDF only</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={isUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploading(true);
                  setUploadError(null);
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch("/api/uploads/verdict", { method: "POST", body: formData });
                    if (!res.ok) {
                      const body = (await res.json().catch(() => ({}))) as { error?: string };
                      throw new Error(body.error ?? "Upload failed");
                    }
                    const { fileName } = (await res.json()) as { fileName: string };
                    startTransition(async () => {
                      await uploadVerdictAction(id, fileName);
                      router.refresh();
                    });
                  } catch (err) {
                    setUploadError(err instanceof Error ? err.message : "Upload failed");
                  } finally {
                    setIsUploading(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
          </CardContent>
        </Card>
      )}

      {verdictFile && (
        <Card>
          <CardHeader>
            <CardTitle>Final Verdict Document</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{verdictFile}</p>
          </CardContent>
        </Card>
      )}

      <RejectComplaintDialog open={isRejectOpen} onOpenChange={setIsRejectOpen} ticketId={id} />
    </div>
  );
}
