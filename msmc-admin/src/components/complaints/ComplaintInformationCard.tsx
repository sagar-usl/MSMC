import type { ComplaintDetails } from "@/types/complaint-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoField } from "@/components/common/InfoField";

interface ComplaintInformationCardProps {
  complaint: ComplaintDetails;
}

export function ComplaintInformationCard({
  complaint,
}: ComplaintInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complaint Information</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoField label="Complaint ID">{complaint.id}</InfoField>

          <InfoField label="Complainant">{complaint.complainantName}</InfoField>

          <InfoField label="Mobile Number">{complaint.mobileNumber}</InfoField>

          <InfoField label="Category">{complaint.category}</InfoField>

          <InfoField label="Status">
            <StatusBadge status={complaint.status} />
          </InfoField>

          <InfoField label="Submitted On">{complaint.submittedAt}</InfoField>
        </div>
      </CardContent>
    </Card>
  );
}
