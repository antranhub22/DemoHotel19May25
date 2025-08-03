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
import {
  CheckCircle,
  ClipboardList,
  Clock,
  MessageSquare,
  Phone,
  Users,
} from 'lucide-react';
import React from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '../shared/components/DashboardLayout';
import { MetricCard } from '../shared/components/MetricCard';
import { useDashboardData } from '../shared/hooks/useDashboardData';

export const FrontDeskDashboard: React.FC = () => {
  const { data: dashboardData, loading } = useDashboardData();

  return (
    <DashboardLayout
      title="Front Desk Dashboard"
      subtitle="Quản lý yêu cầu khách hàng và cuộc gọi"
      gradientFrom="from-green-600"
      gradientTo="to-green-800"
      loading={loading}
    >
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
    </DashboardLayout>
  );
};
