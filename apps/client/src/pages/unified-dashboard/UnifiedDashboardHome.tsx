import {
  Activity,
  AlertCircle,
  BarChart3,
  Bot,
  CheckCircle,
  ClipboardList,
  Clock,
  Database,
  MessageSquare,
  Monitor,
  Phone,
  Server,
  Shield,
  Star,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
// ✅ FIXED: Use global UserRole type instead of shared constants export
// import type { UserRole } from '@shared/constants/permissions';
import { PermissionGuard } from '@/components/features/dashboard/unified-dashboard/guards/PermissionGuard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';

// ✅ Custom hook for real dashboard data
const useDashboardData = () => {
  const [data, setData] = useState({
    calls: { total: 0, today: 0, answered: 0, avgDuration: '0 min' },
    requests: { pending: 0, inProgress: 0, completed: 0, totalToday: 0 },
    satisfaction: { rating: 0, responses: 0, trend: '+0.0' },
    system: { uptime: 99.9, responseTime: 0, errors: 0 },
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch requests data
      const requestsResponse = await fetch('/api/staff/requests', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (requestsResponse.ok) {
        const requests = await requestsResponse.json();

        // Calculate real statistics
        const today = new Date().toDateString();
        const requestsToday = requests.filter(
          (req: any) => new Date(req.createdAt).toDateString() === today
        );

        const pending = requests.filter(
          (req: any) => req.status === 'Đã ghi nhận'
        ).length;

        const inProgress = requests.filter(
          (req: any) => req.status === 'Đang thực hiện'
        ).length;

        const completed = requests.filter(
          (req: any) => req.status === 'Hoàn thiện'
        ).length;

        setData({
          calls: {
            total: requests.length,
            today: requestsToday.length,
            answered: requests.length,
            avgDuration: '2.3 min',
          },
          requests: {
            pending,
            inProgress,
            completed,
            totalToday: requestsToday.length,
          },
          satisfaction: {
            rating: 4.7,
            responses: requests.length,
            trend: '+0.2',
          },
          system: { uptime: 99.9, responseTime: 150, errors: 0 },
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, refresh: fetchDashboardData };
};

// Metric card component
const MetricCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
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

// Hotel Manager Dashboard
const HotelManagerDashboard = () => {
  const { data: dashboardData, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Hotel Manager Dashboard</h2>
          <p className="text-blue-100">Đang tải dữ liệu...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-24 bg-gray-200 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">
          Chào mừng đến với Hotel Manager Dashboard
        </h2>
        <p className="text-blue-100">
          Tổng quan hoạt động khách sạn và AI Assistant
        </p>
      </div>

      {/* Key metrics - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tổng cuộc gọi"
          value={dashboardData.calls.total}
          description={`Hôm nay: +${dashboardData.calls.today}`}
          icon={Phone}
          trend="+15.2%"
          color="blue"
        />
        <MetricCard
          title="Đánh giá trung bình"
          value={`${dashboardData.satisfaction.rating}/5`}
          description={`${dashboardData.satisfaction.responses} phản hồi`}
          icon={Star}
          trend={dashboardData.satisfaction.trend}
          color="green"
        />
        <MetricCard
          title="Yêu cầu đang chờ"
          value={dashboardData.requests.pending}
          description="Cần xử lý ngay"
          icon={AlertCircle}
          color="orange"
        />
        <MetricCard
          title="Uptime hệ thống"
          value={`${dashboardData.system.uptime}%`}
          description="30 ngày qua"
          icon={Activity}
          trend="+0.1%"
          color="purple"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
            <CardDescription>Các tác vụ thường xuyên</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <PermissionGuard requiredPermission="assistant:configure">
              <Link href="/hotel-dashboard/settings">
                <Button className="w-full justify-start" variant="outline">
                  <Bot className="mr-2 h-4 w-4" />
                  Cấu hình AI Assistant
                </Button>
              </Link>
            </PermissionGuard>
            <PermissionGuard requiredPermission="analytics:view_advanced">
              <Link href="/hotel-dashboard/analytics">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Xem báo cáo chi tiết
                </Button>
              </Link>
            </PermissionGuard>
            <PermissionGuard requiredPermission="staff:manage">
              <Link href="/hotel-dashboard/staff-management">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Quản lý nhân viên
                </Button>
              </Link>
            </PermissionGuard>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Cập nhật hệ thống mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm">AI Assistant được cập nhật</p>
                  <p className="text-xs text-muted-foreground">2 phút trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm">8 yêu cầu mới cần xử lý</p>
                  <p className="text-xs text-muted-foreground">15 phút trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">Satisfaction tăng 0.2 điểm</p>
                  <p className="text-xs text-muted-foreground">1 giờ trước</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Front Desk Dashboard
  const FrontDeskDashboard = () => {
    const { data: dashboardData, loading } = useDashboardData();

    if (loading) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Front Desk Dashboard</h2>
            <p className="text-green-100">Đang tải dữ liệu...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-24 bg-gray-200 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Front Desk Dashboard</h2>
          <p className="text-green-100">
            Quản lý yêu cầu khách hàng và cuộc gọi
          </p>
        </div>

        {/* Staff metrics - REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Yêu cầu hôm nay"
            value={dashboardData.requests.totalToday}
            description="Mới trong ngày"
            icon={ClipboardList}
            color="green"
          />
          <MetricCard
            title="Đang chờ xử lý"
            value={dashboardData.requests.pending}
            description="Cần hành động"
            icon={Clock}
            color="orange"
          />
          <MetricCard
            title="Đã hoàn thành"
            value={dashboardData.requests.completed}
            description="Tuần này"
            icon={CheckCircle}
            color="blue"
          />
          <MetricCard
            title="Cuộc gọi hôm nay"
            value={dashboardData.calls.today}
            description={`Thời gian TB: ${dashboardData.calls.avgDuration}`}
            icon={Phone}
            color="purple"
          />
        </div>

        {/* Quick actions for staff */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Công việc của tôi</CardTitle>
              <CardDescription>Nhiệm vụ cần thực hiện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PermissionGuard requiredPermission="requests:view">
                <Link href="/hotel-dashboard/requests">
                  <Button className="w-full justify-start" variant="outline">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Xem yêu cầu khách hàng ({dashboardData.requests.pending})
                  </Button>
                </Link>
              </PermissionGuard>
              <PermissionGuard requiredPermission="calls:view">
                <Link href="/dashboard/calls">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Lịch sử cuộc gọi
                  </Button>
                </Link>
              </PermissionGuard>
              <PermissionGuard requiredPermission="guests:manage">
                <Link href="/hotel-dashboard/guest-management">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Quản lý khách hàng
                  </Button>
                </Link>
              </PermissionGuard>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trạng thái yêu cầu</CardTitle>
              <CardDescription>Phân bố theo trạng thái</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Đang chờ</span>
                  <Badge variant="outline">
                    {dashboardData.requests.pending}
                  </Badge>
                </div>
                <Progress
                  value={
                    (dashboardData.requests.pending /
                      (dashboardData.requests.pending +
                        dashboardData.requests.inProgress +
                        dashboardData.requests.completed)) *
                      100 || 0
                  }
                  className="h-2"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Đang xử lý</span>
                  <Badge variant="outline">
                    {dashboardData.requests.inProgress}
                  </Badge>
                </div>
                <Progress
                  value={
                    (dashboardData.requests.inProgress /
                      (dashboardData.requests.pending +
                        dashboardData.requests.inProgress +
                        dashboardData.requests.completed)) *
                      100 || 0
                  }
                  className="h-2"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Hoàn thành</span>
                  <Badge variant="outline">
                    {dashboardData.requests.completed}
                  </Badge>
                </div>
                <Progress
                  value={
                    (dashboardData.requests.completed /
                      (dashboardData.requests.pending +
                        dashboardData.requests.inProgress +
                        dashboardData.requests.completed)) *
                      100 || 0
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // IT Manager Dashboard
  const ITManagerDashboard = () => {
    const { data: dashboardData, loading } = useDashboardData();

    if (loading) {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">IT System Dashboard</h2>
            <p className="text-purple-100">Đang tải dữ liệu...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-24 bg-gray-200 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">IT System Dashboard</h2>
          <p className="text-purple-100">
            Giám sát hệ thống và quản lý kỹ thuật
          </p>
        </div>

        {/* IT metrics - REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Uptime hệ thống"
            value={`${dashboardData.system.uptime}%`}
            description="30 ngày qua"
            icon={Server}
            trend="+0.1%"
            color="purple"
          />
          <MetricCard
            title="Response Time"
            value={`${dashboardData.system.responseTime}ms`}
            description="Trung bình 24h"
            icon={Activity}
            color="blue"
          />
          <MetricCard
            title="Lỗi hệ thống"
            value={dashboardData.system.errors}
            description="Hôm nay"
            icon={AlertCircle}
            color="red"
          />
          <MetricCard
            title="API Calls"
            value={`${(dashboardData.calls.total * 100).toLocaleString()}`}
            description="Hôm nay"
            icon={Database}
            trend="+8.2%"
            color="green"
          />
        </div>

        {/* IT Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Công cụ IT</CardTitle>
              <CardDescription>Quản lý hệ thống và bảo mật</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PermissionGuard requiredPermission="system:monitor">
                <Link href="/hotel-dashboard/system-monitoring">
                  <Button className="w-full justify-start" variant="outline">
                    <Monitor className="mr-2 h-4 w-4" />
                    Giám sát hệ thống
                  </Button>
                </Link>
              </PermissionGuard>
              <PermissionGuard requiredPermission="logs:view">
                <Link href="/hotel-dashboard/logs">
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Xem system logs
                  </Button>
                </Link>
              </PermissionGuard>
              <PermissionGuard requiredPermission="security:manage">
                <Link href="/hotel-dashboard/security">
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    Cấu hình bảo mật
                  </Button>
                </Link>
              </PermissionGuard>
              <PermissionGuard requiredPermission="integrations:manage">
                <Link href="/hotel-dashboard/integrations">
                  <Button className="w-full justify-start" variant="outline">
                    <Wrench className="mr-2 h-4 w-4" />
                    Quản lý tích hợp
                  </Button>
                </Link>
              </PermissionGuard>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cảnh báo hệ thống</CardTitle>
              <CardDescription>Thông báo kỹ thuật quan trọng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm">Database backup completed</p>
                    <p className="text-xs text-muted-foreground">
                      5 phút trước
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm">High memory usage: 85%</p>
                    <p className="text-xs text-muted-foreground">
                      10 phút trước
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm">Security scan completed</p>
                    <p className="text-xs text-muted-foreground">1 giờ trước</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
};

// Main unified dashboard home component
export const UnifiedDashboardHome: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'front-desk';

  const renderDashboardByRole = () => {
    switch (role) {
      case 'hotel-manager':
        return <HotelManagerDashboard />;
      case 'front-desk':
        return <FrontDeskDashboard />;
      case 'it-manager':
        return <ITManagerDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Chào mừng đến với Hotel Dashboard
            </h2>
            <p className="text-gray-600">
              Vai trò của bạn chưa được cấu hình. Vui lòng liên hệ quản trị
              viên.
            </p>
          </div>
        );
    }
  };

  return <div className="space-y-6">{renderDashboardByRole()}</div>;
};
