import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EducationItemRowActions } from "./EducationItemRowActions";
import type { EducationItem } from "@/generated/prisma/client";

interface EducationTableProps {
  items: EducationItem[];
}

export function EducationTable({ items }: EducationTableProps) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No education items yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="font-medium">{item.titleEn}</div>
              <div className="text-sm text-muted-foreground">{item.titleMr}</div>
            </TableCell>
            <TableCell>{item.descEn}</TableCell>
            <TableCell>
              <EducationItemRowActions item={item} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
