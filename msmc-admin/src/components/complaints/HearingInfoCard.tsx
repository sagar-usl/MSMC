import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoField } from "@/components/common/InfoField";
import type { HearingInfo } from "@/types/complaint-details";

interface HearingInfoCardProps {
  title: string;
  hearing: HearingInfo;
}

export function HearingInfoCard({ title, hearing }: HearingInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoField label="Date">{hearing.date}</InfoField>
          <InfoField label="Time">{hearing.time}</InfoField>
          <InfoField label="Location">{hearing.location}</InfoField>
          <InfoField label="Officer">{hearing.officer}</InfoField>
        </div>
      </CardContent>
    </Card>
  );
}
