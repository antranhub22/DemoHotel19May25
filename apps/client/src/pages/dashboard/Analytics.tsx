import * as React from 'react';
import type { Room } from '@/types/common.types';
import {
  TrendingUp,
  Globe,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Phone,
  Clock,
  Activity,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalCalls: 1247,
    totalCallsGrowth: 12.5,
    averageCallDuration: 245,
    callDurationGrowth: -5.2,
    uniqueUsers: 89,
    uniqueUsersGrowth: 8.3,
    satisfactionScore: 4.7,
    satisfactionGrowth: 2.1,
  },
  callsByHour: [
    { hour: '00', calls: 12 },
    { hour: '01', calls: 8 },
    { hour: '02', calls: 5 },
    { hour: '03', calls: 3 },
    { hour: '04', calls: 2 },
    { hour: '05', calls: 4 },
    { hour: '06', calls: 15 },
    { hour: '07', calls: 28 },
    { hour: '08', calls: 45 },
    { hour: '09', calls: 67 },
    { hour: '10', calls: 89 },
    { hour: '11', calls: 78 },
    { hour: '12', calls: 95 },
    { hour: '13', calls: 87 },
    { hour: '14', calls: 92 },
    { hour: '15', calls: 85 },
    { hour: '16', calls: 78 },
    { hour: '17', calls: 65 },
    { hour: '18', calls: 82 },
    { hour: '19', calls: 75 },
    { hour: '20', calls: 58 },
    { hour: '21', calls: 45 },
    { hour: '22', calls: 32 },
    { hour: '23', calls: 22 },
  ],
  languageDistribution: [
    { language: 'Tiếng Việt', calls: 687, percentage: 55.1 },
    { language: 'English', calls: 423, percentage: 33.9 },
    { language: 'Français', calls: 137, percentage: 11.0 },
  ],
  intentDistribution: [
    { intent: 'Room Service', calls: 342, percentage: 27.4 },
    { intent: 'Hotel Information', calls: 298, percentage: 23.9 },
    { intent: 'Spa Booking', calls: 187, percentage: 15.0 },
    { intent: 'Restaurant Reservation', calls: 156, percentage: 12.5 },
    { intent: 'Housekeeping', calls: 98, percentage: 7.9 },
    { intent: 'Concierge', calls: 87, percentage: 7.0 },
    { intent: 'Complaints', calls: 45, percentage: 3.6 },
    { intent: 'Other', calls: 34, percentage: 2.7 },
  ],
  callsByDay: [
    { day: 'Thứ 2', calls: 145 },
    { day: 'Thứ 3', calls: 178 },
    { day: 'Thứ 4', calls: 189 },
    { day: 'Thứ 5', calls: 234 },
    { day: 'Thứ 6', calls: 267 },
    { day: 'Thứ 7', calls: 156 },
    { day: 'Chủ nhật', calls: 78 },
  ],
  satisfactionByIntent: [
    { intent: 'Room Service', rating: 4.8 },
    { intent: 'Hotel Information', rating: 4.9 },
    { intent: 'Spa Booking', rating: 4.6 },
    { intent: 'Restaurant Reservation', rating: 4.7 },
    { intent: 'Housekeeping', rating: 4.5 },
    { intent: 'Concierge', rating: 4.8 },
    { intent: 'Complaints', rating: 3.2 },
  ],
};

// Metric card component
const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  suffix = '',
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
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <TrendingUp
              className={`h-3 w-3 mr-1 ${change < 0 ? 'rotate-180' : ''}`}
            />
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Simple bar chart component
const SimpleBarChart = ({
  data,
  dataKey,
  nameKey,
  title,
}: {
  data: Array<{ [key: string]: any }>;
  dataKey: string;
  nameKey: string;
  title: string;
}) => {
  const maxValue = Math.max(...data.map(item => item[dataKey]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 text-right">
                {item[nameKey]}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${(item[dataKey] / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-16 text-sm font-medium text-right">
                {item[dataKey]}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Analytics filters
const AnalyticsFilters = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [language, setLanguage] = useState('all');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Bộ lọc
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Khoảng thời gian</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 ngày qua</SelectItem>
                <SelectItem value="30d">30 ngày qua</SelectItem>
                <SelectItem value="90d">90 ngày qua</SelectItem>
                <SelectItem value="1y">1 năm qua</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Ngôn ngữ</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Overview tab content
const OverviewTab = () => {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tổng cuộc gọi"
          value={mockAnalytics.overview.totalCalls.toLocaleString()}
          change={mockAnalytics.overview.totalCallsGrowth}
          icon={Phone}
          description="Tháng này"
        />
        <MetricCard
          title="Thời gian trung bình"
          value={Math.floor(mockAnalytics.overview.averageCallDuration / 60)}
          change={mockAnalytics.overview.callDurationGrowth}
          icon={Clock}
          description="Phút/cuộc gọi"
          suffix="m"
        />
        <MetricCard
          title="Người dùng duy nhất"
          value={mockAnalytics.overview.uniqueUsers}
          change={mockAnalytics.overview.uniqueUsersGrowth}
          icon={Users}
          description="Tháng này"
        />
        <MetricCard
          title="Điểm hài lòng"
          value={mockAnalytics.overview.satisfactionScore}
          change={mockAnalytics.overview.satisfactionGrowth}
          icon={TrendingUp}
          description="Trên 5 điểm"
          suffix="/5"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          data={mockAnalytics.callsByDay}
          dataKey="calls"
          nameKey="day"
          title="Cuộc gọi theo ngày trong tuần"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Phân bố ngôn ngữ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAnalytics.languageDistribution.map((lang, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="font-medium">{lang.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{lang.calls}</span>
                    <Badge variant="outline">{lang.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Call patterns tab content
const CallPatternsTab = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cuộc gọi theo giờ</CardTitle>
            <CardDescription>Phân bố cuộc gọi trong 24 giờ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockAnalytics.callsByHour.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-8 text-xs text-gray-600">{item.hour}h</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(item.calls / 95) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-xs font-medium text-right">
                    {item.calls}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ý định cuộc gọi</CardTitle>
            <CardDescription>Phân loại theo mục đích</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAnalytics.intentDistribution.map((intent, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{intent.intent}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {intent.calls}
                    </span>
                    <Badge variant="outline">{intent.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Satisfaction tab content
const SatisfactionTab = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Điểm hài lòng theo ý định</CardTitle>
            <CardDescription>
              Đánh giá khách hàng cho từng loại dịch vụ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.satisfactionByIntent.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.intent}</span>
                    <Badge
                      variant={
                        item.rating >= 4.5
                          ? 'default'
                          : item.rating >= 4.0
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {item.rating}/5
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.rating >= 4.5
                          ? 'bg-green-500'
                          : item.rating >= 4.0
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${(item.rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xu hướng điểm hài lòng</CardTitle>
            <CardDescription>Thay đổi theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">4.7/5</div>
                <div className="text-sm text-gray-600">
                  Điểm trung bình tháng này
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>5 sao</span>
                  <span>68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: '68%' }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span>4 sao</span>
                  <span>22%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: '22%' }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span>3 sao</span>
                  <span>7%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: '7%' }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span>2 sao</span>
                  <span>2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: '2%' }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span>1 sao</span>
                  <span>1%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: '1%' }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Analytics component
export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Phân tích & Báo cáo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Thống kê chi tiết về hiệu suất AI Assistant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Tùy chỉnh khoảng thời gian
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="patterns">Mẫu cuộc gọi</TabsTrigger>
          <TabsTrigger value="satisfaction">Hài lòng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <CallPatternsTab />
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-4">
          <SatisfactionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
