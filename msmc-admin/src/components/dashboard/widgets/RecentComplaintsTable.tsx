import { listComplaints } from "@/lib/complaints";
import { FilterableComplaintsTable } from "./FilterableComplaintsTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export async function RecentComplaintsTable() {
  const complaints = await listComplaints();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Complaints</CardTitle>

        <CardDescription>
          Latest complaints submitted by citizens.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FilterableComplaintsTable complaints={complaints} />
      </CardContent>
    </Card>
  );
}
