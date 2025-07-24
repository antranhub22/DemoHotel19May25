import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  PieChart as PieChartIcon,
  TrendingUp as TrendIcon,
  Phone,
  Clock,
  Activity,
} from 'lucide-react';
import { logger } from '@shared/utils/logger';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Types
interface AnalyticsData {
  overview: {
    totalCalls: number;
    averageCallDuration: string;
    successRate: number;
    topLanguages: string[];
    callsThisMonth: number;
    growthRate: number;
  };
  serviceDistribution: Array<{
    service: string;
    calls: number;
    percentage: number;
  }>;
  hourlyActivity: Array<{
    hour: string;
    calls: number;
  }>;
  dailyTrends: Array<{
    date: string;
    calls: number;
    duration: number;
    satisfaction: number;
  }>;
  languageDistribution: Array<{
    language: string;
    calls: number;
    percentage: number;
  }>;
}

// Colors for charts
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF4560',
];

// Custom metric card component
const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-3 w-3" />;
      case 'negative':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <TrendIcon className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm mt-1',
                  getChangeColor()
                )}
              >
                {getChangeIcon()}
                <span>{change}</span>
              </div>
            )}
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Main Advanced Analytics component
export const AdvancedAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedService, setSelectedService] = useState('all');

  // Mock data - replace with actual API call
  const mockAnalytics: AnalyticsData = {
    overview: {
      totalCalls: 1247,
      averageCallDuration: '2:34',
      successRate: 94.2,
      topLanguages: ['Vietnamese', 'English', 'Korean'],
      callsThisMonth: 423,
      growthRate: 15.3,
    },
    serviceDistribution: [
      { service: 'Room Service', calls: 450, percentage: 36.1 },
      { service: 'Concierge', calls: 300, percentage: 24.1 },
      { service: 'Housekeeping', calls: 250, percentage: 20.1 },
      { service: 'Front Desk', calls: 150, percentage: 12.0 },
      { service: 'Spa & Wellness', calls: 97, percentage: 7.8 },
    ],
    hourlyActivity: [
      { hour: '06:00', calls: 5 },
      { hour: '07:00', calls: 12 },
      { hour: '08:00', calls: 25 },
      { hour: '09:00', calls: 35 },
      { hour: '10:00', calls: 45 },
      { hour: '11:00', calls: 40 },
      { hour: '12:00', calls: 55 },
      { hour: '13:00', calls: 48 },
      { hour: '14:00', calls: 52 },
      { hour: '15:00', calls: 38 },
      { hour: '16:00', calls: 42 },
      { hour: '17:00', calls: 35 },
      { hour: '18:00', calls: 45 },
      { hour: '19:00', calls: 52 },
      { hour: '20:00', calls: 38 },
      { hour: '21:00', calls: 25 },
      { hour: '22:00', calls: 15 },
      { hour: '23:00', calls: 8 },
    ],
    dailyTrends: [
      { date: '2024-01-01', calls: 45, duration: 154, satisfaction: 4.5 },
      { date: '2024-01-02', calls: 52, duration: 162, satisfaction: 4.6 },
      { date: '2024-01-03', calls: 38, duration: 148, satisfaction: 4.4 },
      { date: '2024-01-04', calls: 41, duration: 156, satisfaction: 4.7 },
      { date: '2024-01-05', calls: 48, duration: 159, satisfaction: 4.5 },
      { date: '2024-01-06', calls: 55, duration: 165, satisfaction: 4.8 },
      { date: '2024-01-07', calls: 42, duration: 151, satisfaction: 4.6 },
    ],
    languageDistribution: [
      { language: 'Vietnamese', calls: 687, percentage: 55.1 },
      { language: 'English', calls: 423, percentage: 33.9 },
      { language: 'Korean', calls: 87, percentage: 7.0 },
      { language: 'Chinese', calls: 50, percentage: 4.0 },
    ],
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Simulate API call
      setTimeout(() => {
        setAnalytics(mockAnalytics);
        setLoading(false);
      }, 1000);

      // Replace with actual API call:
      // const response = await fetch('/api/dashboard/analytics', {
      //   headers: { 'Authorization': `Bearer ${user?.token}` }
      // });
      // const data = await response.json();
      // setAnalytics(data.analytics);
    } catch (error) {
      logger.error('Failed to fetch analytics:', 'Component', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // no cleanup needed
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Đang tải analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không thể tải dữ liệu analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics nâng cao</h1>
          <p className="text-gray-600">
            Phân tích chi tiết hoạt động AI Assistant và khách hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngày</SelectItem>
              <SelectItem value="30d">30 ngày</SelectItem>
              <SelectItem value="90d">90 ngày</SelectItem>
              <SelectItem value="365d">1 năm</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tổng cuộc gọi"
          value={analytics.overview.totalCalls.toLocaleString()}
          change={`+${analytics.overview.growthRate}%`}
          changeType="positive"
          icon={Phone}
          description="30 ngày qua"
        />
        <MetricCard
          title="Thời gian TB"
          value={analytics.overview.averageCallDuration}
          change="+12 giây"
          changeType="positive"
          icon={Clock}
          description="So với tháng trước"
        />
        <MetricCard
          title="Tỷ lệ thành công"
          value={`${analytics.overview.successRate}%`}
          change="+2.1%"
          changeType="positive"
          icon={Activity}
          description="Cuộc gọi hoàn thành"
        />
        <MetricCard
          title="Tháng này"
          value={analytics.overview.callsThisMonth.toLocaleString()}
          change="+23 hôm nay"
          changeType="positive"
          icon={TrendingUp}
          description="Cuộc gọi trong tháng"
        />
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="services">Dịch vụ</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động</TabsTrigger>
          <TabsTrigger value="languages">Ngôn ngữ</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Xu hướng cuộc gọi theo ngày</CardTitle>
                <CardDescription>7 ngày gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mức độ hài lòng</CardTitle>
                <CardDescription>Điểm trung bình theo ngày</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[4.0, 5.0]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#00C49F"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố dịch vụ</CardTitle>
                <CardDescription>Theo số lượng cuộc gọi</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.serviceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) =>
                        `${name} (${percentage}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="calls"
                    >
                      {analytics.serviceDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top dịch vụ</CardTitle>
                <CardDescription>Xếp hạng theo lượng sử dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.serviceDistribution.map((service, index) => (
                    <div
                      key={service.service}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium">{service.service}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {service.calls} cuộc gọi
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động theo giờ</CardTitle>
              <CardDescription>Phân bố cuộc gọi trong 24h</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="calls" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Languages Tab */}
        <TabsContent value="languages" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố ngôn ngữ</CardTitle>
                <CardDescription>Tỷ lệ sử dụng các ngôn ngữ</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.languageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) =>
                        `${name} (${percentage}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="calls"
                    >
                      {analytics.languageDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê ngôn ngữ</CardTitle>
                <CardDescription>Chi tiết sử dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.languageDistribution.map((lang, index) => (
                    <div key={lang.language} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{lang.language}</span>
                        <span className="text-sm text-gray-500">
                          {lang.calls} cuộc gọi ({lang.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${lang.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ngôn ngữ phổ biến</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.overview.topLanguages.map((lang, index) => (
                <Badge key={lang} variant="secondary">
                  {lang}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giờ cao điểm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sáng:</span>
                <span className="font-medium">08:00 - 12:00</span>
              </div>
              <div className="flex justify-between">
                <span>Chiều:</span>
                <span className="font-medium">14:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Tối:</span>
                <span className="font-medium">19:00 - 21:00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xu hướng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Tăng trưởng 15.3%</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Thời gian gọi tăng</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Hài lòng cải thiện</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
