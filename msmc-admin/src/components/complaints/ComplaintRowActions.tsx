"use client";

import { Complaint } from "@/types/complaint";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface ComplaintRowActionsProps {
  complaint: Complaint;
}

export function ComplaintRowActions({ complaint }: ComplaintRowActionsProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/complaints/${complaint.id}`);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleView}>
      <Eye className="h-4 w-4" />
    </Button>
  );
}
