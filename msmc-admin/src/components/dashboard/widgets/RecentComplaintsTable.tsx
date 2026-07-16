import { getRecentComplaints } from "@/services/complaint.service";
import { ComplaintTable } from "@/components/complaints/ComplaintTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export async function RecentComplaintsTable() {
  const complaints = await getRecentComplaints();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Complaints</CardTitle>

        <CardDescription>
          Latest complaints submitted by citizens.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ComplaintTable complaints={complaints} />
      </CardContent>
    </Card>
  );
}
