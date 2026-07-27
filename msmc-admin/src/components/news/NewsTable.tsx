import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { newsTagLabels } from "@/lib/labels";
import { NewsItemRowActions } from "./NewsItemRowActions";
import type { NewsItem } from "@/generated/prisma/client";

interface NewsTableProps {
  items: NewsItem[];
}

export function NewsTable({ items }: NewsTableProps) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No news items yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Tag</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.publishedDate.toISOString().slice(0, 10)}</TableCell>
            <TableCell>{newsTagLabels[item.tag]}</TableCell>
            <TableCell>
              <div className="font-medium">{item.titleEn}</div>
              <div className="text-sm text-muted-foreground">{item.titleMr}</div>
            </TableCell>
            <TableCell>
              <NewsItemRowActions item={item} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
