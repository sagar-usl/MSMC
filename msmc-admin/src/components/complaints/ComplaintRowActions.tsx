"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, MoreHorizontal, UserPlus, XCircle } from "lucide-react";
import { Complaint } from "@/types/complaint";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssignOfficerDialog } from "./AssignOfficerDialog";
import { RejectComplaintDialog } from "./RejectComplaintDialog";
import { acceptComplaintAction, assignOfficerAction } from "@/actions/complaints.actions";

interface ComplaintRowActionsProps {
  complaint: Complaint;
}

export function ComplaintRowActions({ complaint }: ComplaintRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const canDecide = complaint.status === "UNDER_REVIEW";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <MoreHorizontal />
          <span className="sr-only">Open actions</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/complaints/${encodeURIComponent(complaint.id)}`)}>
            <Eye />
            View Details
          </DropdownMenuItem>

          {canDecide && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await acceptComplaintAction(complaint.id);
                    router.refresh();
                  })
                }
              >
                <CheckCircle2 />
                Accept Complaint
              </DropdownMenuItem>

              <DropdownMenuItem variant="destructive" onClick={() => setIsRejectDialogOpen(true)}>
                <XCircle />
                Reject Complaint
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setIsAssignDialogOpen(true)}>
            <UserPlus />
            Assign Officer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AssignOfficerDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        currentOfficer={complaint.assignedOfficer}
        onAssign={(officer) =>
          startTransition(async () => {
            await assignOfficerAction(complaint.id, officer);
            router.refresh();
          })
        }
      />

      <RejectComplaintDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen} ticketId={complaint.id} />
    </>
  );
}
