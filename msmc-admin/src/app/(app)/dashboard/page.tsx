import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatisticCard } from "@/components/dashboard/widgets/StatisticCard";
import { FileText, Clock3, FolderOpen, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="mt-2 text-slate-600">
          Welcome to MSMC Administration Portal.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatisticCard
          title="Total Complaints"
          value="1,458"
          icon={<FileText className="h-5 w-5 text-primary" />}
          change="+25 Today"
          trend="up"
        />

        <StatisticCard
          title="Hearings Today"
          value="18"
          icon={<Clock3 className="h-5 w-5 text-primary" />}
          change="Scheduled"
          trend="up"
        />

        <StatisticCard
          title="Documents"
          value="362"
          icon={<FolderOpen className="h-5 w-5 text-primary" />}
          change="Available"
          trend="down"
        />

        <StatisticCard
          title="Active Users"
          value="642"
          icon={<Users className="h-5 w-5 text-primary" />}
          change="Registered"
          trend="up"
        />
      </div>
    </div>
  );
}
