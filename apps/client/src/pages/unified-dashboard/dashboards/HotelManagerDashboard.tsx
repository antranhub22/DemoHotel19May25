import { PermissionGuard } from '@/components/features/dashboard/unified-dashboard/guards/PermissionGuard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bot,
  CheckCircle,
  Phone,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import React from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '../shared/components/DashboardLayout';
import { MetricCard } from '../shared/components/MetricCard';
import { useDashboardData } from '../shared/hooks/useDashboardData';

export const HotelManagerDashboard: React.FC = () => {
  const { data: dashboardData, loading } = useDashboardData();

  return (
    <DashboardLayout
      title="Chào mừng đến với Hotel Manager Dashboard"
      subtitle="Tổng quan hoạt động khách sạn và AI Assistant"
      gradientFrom="from-blue-600"
      gradientTo="to-blue-800"
      loading={loading}
    >
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
    </DashboardLayout>
  );
};
