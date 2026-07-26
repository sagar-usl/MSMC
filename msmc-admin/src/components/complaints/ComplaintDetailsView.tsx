import type { ComplaintDetails } from "@/types/complaint-details";
import { ComplaintInformationCard } from "./ComplaintInformationCard";
import { ComplaintDescriptionCard } from "./ComplaintDescriptionCard";
import { UploadedDocumentsCard } from "./UploadedDocumentsCard";
import { ComplaintDecisionPanel } from "./ComplaintDecisionPanel";

interface ComplaintDetailsViewProps {
  complaint: ComplaintDetails;
}

export function ComplaintDetailsView({ complaint }: ComplaintDetailsViewProps) {
  return (
    <div className="space-y-6">
      <ComplaintInformationCard complaint={complaint} />

      <ComplaintDescriptionCard description={complaint.description} />

      <UploadedDocumentsCard documents={complaint.documents} />

      <ComplaintDecisionPanel complaint={complaint} />
    </div>
  );
}
