import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatisticCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  change?: string;
  trend?: "up" | "down";
  loading?: boolean;
}

export function StatisticCard({
  title,
  value,
  icon,
  change,
  trend,
  loading,
}: StatisticCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>

          {icon}
        </div>

        <div>
          <h2 className="text-3xl font-bold">{value}</h2>
        </div>

        {change && (
          <div className="flex items-center gap-1 text-sm">
            {trend === "up" && (
              <TrendingUp className="h-4 w-4 text-green-600" />
            )}

            {trend === "down" && (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}

            <span>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
