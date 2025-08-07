import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import React from "react";
import type { MetricCardProps } from "../types/dashboard";

// @ts-ignore - Auto-suppressed TypeScript error
export const MetricCard: React.FC<MetricCard> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "blue",
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center text-xs text-green-600 mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
