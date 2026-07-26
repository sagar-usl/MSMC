import { listComplaints } from "@/lib/complaints";
import { ComplaintTable } from "@/components/complaints/ComplaintTable";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default async function ComplaintsPage() {
  const complaints = await listComplaints();

  return (
    <div>
      <PageHeader title="Complaints" description="All complaints submitted by citizens." />

      <Card>
        <CardContent>
          <ComplaintTable complaints={complaints} />
        </CardContent>
      </Card>
    </div>
  );
}
