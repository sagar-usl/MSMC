"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Complaint, ComplaintCategory, ComplaintStatus } from "@/types/complaint";
import { categoryLabels } from "@/lib/labels";
import { statusLabels } from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComplaintTable } from "@/components/complaints/ComplaintTable";

interface FilterableComplaintsTableProps {
  complaints: Complaint[];
}

const ALL = "ALL";

export function FilterableComplaintsTable({ complaints }: FilterableComplaintsTableProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ComplaintCategory | typeof ALL>(ALL);
  const [status, setStatus] = useState<ComplaintStatus | typeof ALL>(ALL);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((c) => {
      if (category !== ALL && c.category !== category) return false;
      if (status !== ALL && c.status !== status) return false;
      if (query && !c.id.toLowerCase().includes(query) && !c.complainantName.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [complaints, search, category, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-1 sm:max-w-xs">
          <span className="text-xs font-medium text-slate-500">Search</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search by ID or complainant..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Category</span>
          <Select value={category} onValueChange={(v) => setCategory(v as ComplaintCategory | typeof ALL)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Categories</SelectItem>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Status</span>
          <Select value={status} onValueChange={(v) => setStatus(v as ComplaintStatus | typeof ALL)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Statuses</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No complaints match your filters.</p>
      ) : (
        <ComplaintTable complaints={filtered} />
      )}
    </div>
  );
}
