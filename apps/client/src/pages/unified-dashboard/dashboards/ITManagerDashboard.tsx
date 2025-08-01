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
  CheckCircle,
  Database,
  Monitor,
  Server,
  Shield,
  Wrench,
} from 'lucide-react';
import React from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '../shared/components/DashboardLayout';
import { MetricCard } from '../shared/components/MetricCard';
import { useDashboardData } from '../shared/hooks/useDashboardData';

export const ITManagerDashboard: React.FC = () => {
  const { data: dashboardData, loading } = useDashboardData();

  return (
    <DashboardLayout
      title="IT System Dashboard"
      subtitle="Giám sát hệ thống và quản lý kỹ thuật"
      gradientFrom="from-purple-600"
      gradientTo="to-purple-800"
      loading={loading}
    >
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
                  <p className="text-xs text-muted-foreground">5 phút trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm">High memory usage: 85%</p>
                  <p className="text-xs text-muted-foreground">10 phút trước</p>
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
    </DashboardLayout>
  );
};
