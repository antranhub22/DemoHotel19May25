// removed unused Language type
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Globe,
  MessageSquare,
  Phone,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import React from "react";
import { Link } from "wouter";

// Mock data - will be replaced with actual API calls
const mockMetrics = {
  totalCalls: 1247,
  totalCallsGrowth: 12.5,
  averageCallDuration: 245, // seconds
  callDurationGrowth: -5.2,
  activeUsers: 89,
  activeUsersGrowth: 8.3,
  satisfactionScore: 4.7,
  satisfactionGrowth: 2.1,
  languageDistribution: [
    { language: "Tiếng Việt", count: 687, percentage: 55.1 },
    { language: "English", count: 423, percentage: 33.9 },
    { language: "Français", count: 137, percentage: 11.0 },
  ],
  recentActivity: [
    { time: "2 phút trước", action: "Cuộc gọi từ phòng 205", type: "call" },
    {
      time: "5 phút trước",
      action: "Đặt room service từ phòng 301",
      type: "service",
    },
    { time: "12 phút trước", action: "Hỏi thông tin về spa", type: "inquiry" },
    {
      time: "18 phút trước",
      action: "Phàn nàn về tiếng ồn",
      type: "complaint",
    },
  ],
};

const mockSubscription = {
  plan: "premium",
  usageLimit: 5000,
  currentUsage: 1247,
  resetDate: "2024-01-01",
};

// Metric card component
const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  suffix = "",
}: {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  suffix?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value}
        {suffix}
      </div>
      <div className="flex items-center pt-1">
        <div className="text-xs text-muted-foreground">{description}</div>
        {change !== undefined && (
          <div
            className={`ml-auto flex items-center text-xs ${
              change > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp
              className={`h-3 w-3 mr-1 ${change < 0 ? "rotate-180" : ""}`}
            />
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Activity item component
const ActivityItem = ({
  time,
  action,
  type,
}: {
  time: string;
  action: string;
  type: "call" | "service" | "inquiry" | "complaint";
}) => {
  const getIcon = () => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4 text-blue-500" />;
      case "service":
        return <Bot className="h-4 w-4 text-green-500" />;
      case "inquiry":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "complaint":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {action}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
      </div>
    </div>
  );
};

// Quick actions component
const QuickActions = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Thao tác nhanh
      </CardTitle>
      <CardDescription>Các tính năng thường dùng</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <Link href="/saas-dashboard/setup">
        <Button variant="outline" className="w-full justify-start">
          <Bot className="h-4 w-4 mr-2" />
          Cấu hình AI Assistant
        </Button>
      </Link>
      <Link href="/saas-dashboard/analytics">
        <Button variant="outline" className="w-full justify-start">
          <BarChart3 className="h-4 w-4 mr-2" />
          Xem báo cáo chi tiết
        </Button>
      </Link>
      <Link href="/saas-dashboard/settings">
        <Button variant="outline" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Cài đặt khách sạn
        </Button>
      </Link>
    </CardContent>
  </Card>
);

// Usage overview component
const UsageOverview = () => {
  const usagePercentage =
    (mockSubscription.currentUsage / mockSubscription.usageLimit) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Sử dụng tháng này
        </CardTitle>
        <CardDescription>Theo dõi giới hạn subscription</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Cuộc gọi</span>
            <span>
              {mockSubscription.currentUsage.toLocaleString()} /{" "}
              {mockSubscription.usageLimit.toLocaleString()}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Còn lại</span>
          <span className="font-medium">
            {(
              mockSubscription.usageLimit - mockSubscription.currentUsage
            ).toLocaleString()}{" "}
            cuộc gọi
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Reset vào {mockSubscription.resetDate}</span>
        </div>
      </CardContent>
    </Card>
  );
};

// System status component
const SystemStatus = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        Trạng thái hệ thống
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-sm">AI Assistant</span>
        </div>
        <Badge variant="outline" className="text-green-600">
          Hoạt động
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-sm">Voice API</span>
        </div>
        <Badge variant="outline" className="text-green-600">
          Hoạt động
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-sm">Analytics</span>
        </div>
        <Badge variant="outline" className="text-green-600">
          Hoạt động
        </Badge>
      </div>
    </CardContent>
  </Card>
);

// Main dashboard home component
export const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tổng quan
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Theo dõi hiệu suất AI Assistant và hoạt động khách sạn
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tổng cuộc gọi"
          value={mockMetrics.totalCalls.toLocaleString()}
          change={mockMetrics.totalCallsGrowth}
          icon={Phone}
          description="Tháng này"
        />
        <MetricCard
          title="Thời gian trung bình"
          value={Math.floor(mockMetrics.averageCallDuration / 60)}
          change={mockMetrics.callDurationGrowth}
          icon={Clock}
          description="Phút/cuộc gọi"
          suffix="m"
        />
        <MetricCard
          title="Người dùng hoạt động"
          value={mockMetrics.activeUsers}
          change={mockMetrics.activeUsersGrowth}
          icon={Users}
          description="Trong 7 ngày"
        />
        <MetricCard
          title="Điểm hài lòng"
          value={mockMetrics.satisfactionScore}
          change={mockMetrics.satisfactionGrowth}
          icon={TrendingUp}
          description="Trên 5 điểm"
          suffix="/5"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Language Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Phân bố ngôn ngữ
            </CardTitle>
            <CardDescription>
              Ngôn ngữ được sử dụng trong các cuộc gọi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMetrics.languageDistribution.map((lang) => (
                <div key={lang.language} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{lang.language}</span>
                    <span className="text-muted-foreground">
                      {lang.count} ({lang.percentage}%)
                    </span>
                  </div>
                  <Progress value={lang.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
          <UsageOverview />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hoạt động gần đây
            </CardTitle>
            <CardDescription>
              Các sự kiện mới nhất từ AI Assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {mockMetrics.recentActivity.map((activity, index) => (
                <ActivityItem
                  key={index}
                  time={activity.time}
                  action={activity.action}
                  type={
                    activity.type as
                      | "call"
                      | "service"
                      | "inquiry"
                      | "complaint"
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <SystemStatus />
      </div>
    </div>
  );
};

export default DashboardHome;
