import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InitiativeRowActions } from "./InitiativeRowActions";
import type { InitiativeWithImages } from "@/lib/initiatives";

interface InitiativeTableProps {
  initiatives: InitiativeWithImages[];
}

export function InitiativeTable({ initiatives }: InitiativeTableProps) {
  if (initiatives.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No initiatives yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>District</TableHead>
          <TableHead>Images</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {initiatives.map((initiative) => (
          <TableRow key={initiative.id}>
            <TableCell>
              <div className="font-medium">{initiative.titleEn}</div>
              <div className="text-sm text-muted-foreground">{initiative.titleMr}</div>
            </TableCell>
            <TableCell>{initiative.districtEn}</TableCell>
            <TableCell>
              {initiative.images.length > 0 ? (
                `${initiative.images.length} image${initiative.images.length > 1 ? "s" : ""}`
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </TableCell>
            <TableCell>
              <InitiativeRowActions initiative={initiative} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
