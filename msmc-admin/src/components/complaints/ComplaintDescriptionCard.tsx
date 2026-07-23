import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintDetails } from "@/types/complaint-details";

interface ComplaintDescriptionCardProps {
  description: string;
}

export function ComplaintDescriptionCard({
  description,
}: ComplaintDescriptionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complaint Description</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="leading-7 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
