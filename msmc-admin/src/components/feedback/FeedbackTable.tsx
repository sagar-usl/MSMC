import type { FeedbackItem } from "@/lib/feedback";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StarRating } from "./StarRating";

interface FeedbackTableProps {
  feedback: FeedbackItem[];
}

export function FeedbackTable({ feedback }: FeedbackTableProps) {
  if (feedback.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No feedback submitted yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Submitted</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {feedback.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name ?? <span className="text-muted-foreground">Anonymous</span>}</TableCell>
            <TableCell>
              <StarRating rating={item.rating} />
            </TableCell>
            <TableCell className="max-w-md whitespace-normal">{item.message}</TableCell>
            <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
