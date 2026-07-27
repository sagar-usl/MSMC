import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getComplaintByTicketId } from "@/lib/complaints";
import { ComplaintDetailsView } from "@/components/complaints/ComplaintDetailsView";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

interface ComplaintDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailsPage({
  params,
}: ComplaintDetailsProps) {
  const { id } = await params;

  const complaint = await getComplaintByTicketId(decodeURIComponent(id));

  if (!complaint) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={complaint.id}
        description={`Complaint filed by ${complaint.complainantName}`}
        action={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            <ArrowLeft />
            Back to Dashboard
          </Button>
        }
      />

      <ComplaintDetailsView complaint={complaint} />
    </div>
  );
}
