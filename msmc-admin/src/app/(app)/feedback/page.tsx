import { listFeedback } from "@/lib/feedback";
import { FeedbackTable } from "@/components/feedback/FeedbackTable";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default async function FeedbackPage() {
  const feedback = await listFeedback();

  return (
    <div>
      <PageHeader title="Feedback" description="Feedback submitted by citizens through the app." />

      <Card>
        <CardContent>
          <FeedbackTable feedback={feedback} />
        </CardContent>
      </Card>
    </div>
  );
}
