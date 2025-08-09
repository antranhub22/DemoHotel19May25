import * as React from "react";
/**
 * SaaS Provider Domain - Usage Dashboard Component
 * Real-time usage monitoring and billing information
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Crown,
  Database,
  Phone,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useSubscriptionManagement,
  useUsageMonitoring,
} from "../hooks/useTenantManagement";

interface UsageDashboardProps {
  compact?: boolean;
  showBilling?: boolean;
  onUpgradeClick?: () => void;
}

interface UsageCardProps {
  title: string;
  current: number;
  limit: number;
  percentage: number;
  remaining: number;
  icon: React.ElementType;
  unit: string;
  color: "green" | "yellow" | "red";
  onUpgradeClick?: () => void;
}

// Usage card component
// @ts-ignore - Auto-suppressed TypeScript error
const UsageCard: React.FC<UsageCard> = ({
  title,
  current,
  limit,
  percentage,
  remaining,
  icon: Icon,
  unit,
  color,
  onUpgradeClick,
}) => {
  const getColorClasses = () => {
    switch (color) {
      case "green":
        return "border-green-200 bg-green-50 text-green-700";
      case "yellow":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      case "red":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  const getProgressColor = () => {
    switch (color) {
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className={`${getColorClasses()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
        <Badge
          variant={
            color === "red"
              ? "destructive"
              : color === "yellow"
                ? "default"
                : "secondary"
          }
        >
          {percentage}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold">
            {current.toLocaleString()} / {limit.toLocaleString()}
            <span className="text-sm font-normal ml-1">{unit}</span>
          </div>

          <Progress value={percentage} className="h-2" />

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {remaining > 0
                ? `${remaining.toLocaleString()} ${unit} remaining`
                : "Limit exceeded"}
            </span>
            {percentage > 80 && onUpgradeClick && (
              <Button
                size="sm"
                variant="outline"
                onClick={onUpgradeClick}
                className="text-xs px-2 py-1 h-auto"
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Usage alerts component
const UsageAlerts: React.FC<{
  alerts: any[];
  onDismiss: (alertId: string) => void;
  onUpgradeClick?: () => void;
}> = ({ alerts, onDismiss, onUpgradeClick }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        Usage Alerts
      </h3>

      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.severity === "critical" ? "destructive" : "default"}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-start">
            <div>
              <p>{alert.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(alert.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              {alert.type === "approaching_limit" && onUpgradeClick && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onUpgradeClick}
                  className="text-xs whitespace-nowrap"
                >
                  Upgrade Plan
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(alert.id)}
                className="text-xs"
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

// Subscription info component
const SubscriptionInfo: React.FC<{
  subscription: any;
  onUpgradeClick?: () => void;
}> = ({ subscription, onUpgradeClick }) => {
  if (!subscription) return null;

  const getStatusIcon = () => {
    switch (subscription.status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "trial":
        return <Zap className="w-4 h-4 text-blue-500" />;
      case "expired":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (subscription.status) {
      case "active":
        return "secondary";
      case "trial":
        return "default";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </span>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {subscription.plan.charAt(0).toUpperCase() +
              subscription.plan.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <p className="text-sm capitalize">{subscription.status}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Billing</p>
            <p className="text-sm capitalize">
              {subscription.billingCycle || "monthly"}
            </p>
          </div>
        </div>

        {subscription.trialEndsAt && subscription.plan === "trial" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Trial Period
              </span>
            </div>
            <p className="text-sm text-blue-700">
              {subscription.daysRemaining > 0
                ? `${subscription.daysRemaining} days remaining`
                : "Trial expired"}
            </p>
            {subscription.isTrialExpiring && onUpgradeClick && (
              <Button
                size="sm"
                onClick={onUpgradeClick}
                className="mt-2 w-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            )}
          </div>
        )}

        {subscription.subscriptionEndsAt &&
          subscription.status === "active" && (
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Next billing:{" "}
                  {formatDistanceToNow(
                    new Date(subscription.subscriptionEndsAt),
                    {
                      addSuffix: true,
                      locale: vi,
                    },
                  )}
                </span>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

// Health score component
const HealthScore: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreDescription = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Account Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor()}`}>{score}</div>
          <div className="text-sm text-gray-600 mt-1">
            {getScoreDescription()}
          </div>
          <Progress value={score} className="mt-3" />
        </div>
      </CardContent>
    </Card>
  );
};

// Main dashboard component
export const UsageDashboard: React.FC<UsageDashboardProps> = ({
  compact = false,
  showBilling = true,
  onUpgradeClick,
}) => {
  const { stats, alerts, healthScore, dismissAlert } = useUsageMonitoring();
  const { subscription } = useSubscriptionManagement();
  const [isRealTime, setIsRealTime] = useState(false);

  // Enable real-time updates
  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        // Trigger usage data refresh
        // This would be handled by the service layer
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [isRealTime]);

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2" />
            <p>Loading usage data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 95) return "red";
    if (percentage >= 80) return "yellow";
    return "green";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Usage Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRealTime(!isRealTime)}
            className={isRealTime ? "bg-green-50 border-green-200" : ""}
          >
            <Activity
              className={`w-4 h-4 mr-2 ${isRealTime ? "text-green-600" : ""}`}
            />
            {isRealTime ? "Real-time ON" : "Real-time OFF"}
          </Button>
          {onUpgradeClick && (
            <Button onClick={onUpgradeClick}>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>

      {/* Usage alerts */}
      <UsageAlerts
        alerts={alerts}
        onDismiss={dismissAlert}
        onUpgradeClick={onUpgradeClick}
      />

      {/* Usage cards */}
      <div
        className={`grid gap-4 ${compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}
      >
        <UsageCard
          title="Voice Calls"
          current={stats.calls.current}
          limit={stats.calls.limit}
          percentage={stats.calls.percentage}
          remaining={stats.calls.remaining}
          icon={Phone}
          unit="calls"
          color={getUsageColor(stats.calls.percentage)}
          onUpgradeClick={onUpgradeClick}
        />

        <UsageCard
          title="Call Minutes"
          current={stats.minutes.current}
          limit={stats.minutes.limit}
          percentage={stats.minutes.percentage}
          remaining={stats.minutes.remaining}
          icon={Clock}
          unit="minutes"
          color={getUsageColor(stats.minutes.percentage)}
          onUpgradeClick={onUpgradeClick}
        />

        <UsageCard
          title="API Calls"
          current={stats.apiCalls.current}
          limit={stats.apiCalls.limit}
          percentage={stats.apiCalls.percentage}
          remaining={stats.apiCalls.remaining}
          icon={Zap}
          unit="requests"
          color={getUsageColor(stats.apiCalls.percentage)}
          onUpgradeClick={onUpgradeClick}
        />

        <UsageCard
          title="Storage Used"
          current={stats.storage.current}
          limit={stats.storage.limit}
          percentage={stats.storage.percentage}
          remaining={stats.storage.limit - stats.storage.current}
          icon={Database}
          unit="MB"
          color={getUsageColor(stats.storage.percentage)}
          onUpgradeClick={onUpgradeClick}
        />
      </div>

      {/* Subscription and health info */}
      {showBilling && (
        <div
          className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
        >
          <SubscriptionInfo
            subscription={subscription}
            onUpgradeClick={onUpgradeClick}
          />
          <HealthScore score={healthScore} />
        </div>
      )}
    </div>
  );
};

export default UsageDashboard;
