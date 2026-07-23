import { getComplaintDetails } from "@/services/complaint.service";
import { ComplaintInformationCard } from "@/components/complaints/ComplaintInformationCard";
import { ComplaintDescriptionCard } from "@/components/complaints/ComplaintDescriptionCard";
import { UploadedDocumentsCard } from "@/components/complaints/UploadedDocumentsCard";

interface ComplaintDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailsPage({
  params,
}: ComplaintDetailsProps) {
  const { id } = await params;

  const complaint = await getComplaintDetails(id);

  return (
    <div className="space-y-6 p-6">
      <ComplaintInformationCard complaint={complaint} />

      <ComplaintDescriptionCard description={complaint.description} />

      <UploadedDocumentsCard documents={complaint.documents} />
    </div>
  );
}
