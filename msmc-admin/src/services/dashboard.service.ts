export type DashboardTitle =
  | "Total Complaints"
  | "Hearings Today"
  | "Documents"
  | "Active Users";

export interface DashboardStatistic {
  title: DashboardTitle;
  value: number;
  change: string;
  trend: "up" | "down";
}

export async function getDashboardStatistics(): Promise<DashboardStatistic[]> {
  return [
    {
      title: "Total Complaints",
      value: 1458,
      change: "+25 Today",
      trend: "up",
    },
    {
      title: "Hearings Today",
      value: 18,
      change: "Scheduled",
      trend: "down",
    },
    {
      title: "Documents",
      value: 362,
      change: "Available",
      trend: "up",
    },
    {
      title: "Active Users",
      value: 642,
      change: "Registered",
      trend: "up",
    },
  ];
}
