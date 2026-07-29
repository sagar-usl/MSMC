"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ComplaintDetails } from "@/types/complaint-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RejectComplaintDialog } from "./RejectComplaintDialog";
import { DismissComplaintDialog } from "./DismissComplaintDialog";
import { AssignOfficerDialog } from "./AssignOfficerDialog";
import { HearingScheduleForm, type HearingFormData } from "./HearingScheduleForm";
import { HearingInfoCard } from "./HearingInfoCard";
import {
  acceptComplaintAction,
  scheduleInterimHearingAction,
  scheduleFinalHearingAction,
  uploadVerdictAction,
  assignOfficerAction,
} from "@/actions/complaints.actions";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";

interface ComplaintDecisionPanelProps {
  complaint: ComplaintDetails;
}

/**
 * The officer-facing decision workflow: accept/reject, schedule the first
 * and final hearings, and upload the verdict. Mirrors the citizen (Flutter)
 * app's ComplaintDetailScreen officer actions one-for-one so both surfaces
 * drive the same complaint lifecycle.
 *
 * Gated by assignment: the master admin can act on anything; a regular
 * officer only once this complaint is assigned to them specifically
 * (assertCanActOnComplaint enforces the same rule server-side — this is
 * just what keeps the UI honest about what will actually be allowed).
 */
export function ComplaintDecisionPanel({ complaint }: ComplaintDecisionPanelProps) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [isPending, startTransition] = useTransition();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isDismissOpen, setIsDismissOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [nextHearingChoice, setNextHearingChoice] = useState<"interim" | "final" | null>(null);

  const { id, status, rejectionReason, dismissalReason, hearings, verdictFile, assignedOfficer, assignedOfficerId } = complaint;
  const hasFinalHearing = hearings.some((h) => h.isFinal);

  const isMasterAdmin = currentUser.role === "MASTER_ADMIN";
  const canAct = isMasterAdmin || assignedOfficerId === currentUser.id;

  return (
    <div className="space-y-6">
      {isMasterAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {assignedOfficer ? (
                <>Assigned to <span className="font-medium text-foreground">{assignedOfficer}</span></>
              ) : (
                "Not yet assigned to an officer."
              )}
            </p>
            <Button variant="outline" onClick={() => setIsAssignOpen(true)}>
              {assignedOfficer ? "Reassign" : "Assign Officer"}
            </Button>
          </CardContent>
        </Card>
      )}

      {!canAct && (
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="py-4 text-sm text-muted-foreground">
            {assignedOfficer
              ? <>This complaint is assigned to <span className="font-medium text-foreground">{assignedOfficer}</span>. Only they or the master admin can act on it.</>
              : "This complaint hasn't been assigned yet. Only the master admin can act on it until it's assigned to an officer."}
          </CardContent>
        </Card>
      )}

      {canAct && status === "UNDER_REVIEW" && (
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

      {status === "DISMISSED" && dismissalReason && (
        <Card className="border-l-4 border-l-slate-500">
          <CardHeader>
            <CardTitle>Reason for Dismissal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-7 text-muted-foreground">{dismissalReason}</p>
          </CardContent>
        </Card>
      )}

      {canAct && status === "ACCEPTED" && hearings.length === 0 && (
        <HearingScheduleForm
          title="Schedule Hearing"
          submitLabel="Save & Schedule Hearing"
          defaultOfficer={assignedOfficer}
          onSubmit={(data: HearingFormData) => scheduleInterimHearingAction(id, data)}
        />
      )}

      {hearings.map((hearing, index) => (
        <HearingInfoCard
          key={`${hearing.date}-${hearing.time}-${hearing.location}`}
          title={hearing.isFinal ? "Final Hearing" : `Hearing ${index + 1}`}
          hearing={hearing}
        />
      ))}

      {canAct && status === "CASE_ONBOARD" && hearings.length > 0 && !hasFinalHearing && (
        nextHearingChoice === null ? (
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s Next?</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" onClick={() => setNextHearingChoice("interim")}>
                Schedule Next Hearing
              </Button>
              <Button onClick={() => setNextHearingChoice("final")}>
                Schedule Final Hearing
              </Button>
              <Button variant="destructive" onClick={() => setIsDismissOpen(true)}>
                Dismiss Complaint
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <Button variant="link" className="h-auto p-0" onClick={() => setNextHearingChoice(null)}>
              ← Choose differently
            </Button>
            {nextHearingChoice === "interim" ? (
              <HearingScheduleForm
                title="Schedule Next Hearing"
                submitLabel="Save & Schedule Next Hearing"
                defaultOfficer={assignedOfficer}
                onSubmit={async (data: HearingFormData) => {
                  await scheduleInterimHearingAction(id, data);
                  // Reset so the next render (with the new hearing already
                  // in `hearings`) shows the choice card again, not this
                  // same form re-appearing with its now-stale values.
                  setNextHearingChoice(null);
                }}
              />
            ) : (
              <HearingScheduleForm
                title="Schedule Final Hearing"
                submitLabel="Save & Schedule Final Hearing"
                defaultOfficer={assignedOfficer}
                onSubmit={async (data: HearingFormData) => {
                  await scheduleFinalHearingAction(id, data);
                  setNextHearingChoice(null);
                }}
              />
            )}
          </div>
        )
      )}

      {canAct && status === "FINAL_HEARING_SCHEDULED" && !verdictFile && (
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
      <DismissComplaintDialog open={isDismissOpen} onOpenChange={setIsDismissOpen} ticketId={id} />
      {isMasterAdmin && (
        <AssignOfficerDialog
          open={isAssignOpen}
          onOpenChange={setIsAssignOpen}
          currentOfficerId={assignedOfficerId}
          onAssign={(officerId) =>
            startTransition(async () => {
              await assignOfficerAction(id, officerId);
              router.refresh();
            })
          }
        />
      )}
    </div>
  );
}
