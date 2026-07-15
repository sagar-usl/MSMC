import { StatisticCard } from "@/components/dashboard/widgets/StatisticCard";
import { FileText, Clock3, FolderOpen, Users } from "lucide-react";
import { getDashboardStatistics } from "@/services/dashboard.service";
import { DashboardGrid } from "@/components/layouts/DashboardGrid";
import PageHeader from "@/components/common/PageHeader";

const statisticIcons = {
  "Total Complaints": FileText,
  "Hearings Today": Clock3,
  Documents: FolderOpen,
  "Active Users": Users,
};

export default async function DashboardPage() {
  const statistics = await getDashboardStatistics();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome to MSMC Administration Portal."
      />

      <DashboardGrid>
        {statistics.map((stat) => {
          const Icon = statisticIcons[stat.title];

          return (
            <StatisticCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={<Icon className="h-5 w-5 text-primary" />}
              change={stat.change}
              trend={stat.trend}
            />
          );
        })}
      </DashboardGrid>
    </div>
  );
}
