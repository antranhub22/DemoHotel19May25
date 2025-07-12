import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Users,
  Phone,
  Clock,
  Globe,
  Target,
  PieChart,
  LineChart,
  Filter
} from 'lucide-react';

// Types
interface ChartDataPoint {
  label: string;
  value: number;
  change?: number;
  color?: string;
  metadata?: Record<string, any>;
}

interface UsageChartProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  type: 'bar' | 'line' | 'pie' | 'progress' | 'metric';
  loading?: boolean;
  error?: string | null;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  animated?: boolean;
  interactive?: boolean;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  threshold?: {
    value: number;
    label: string;
    color: 'red' | 'yellow' | 'green';
  };
}

// Color palette
const CHART_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
];

// Format value based on type
const formatValue = (value: number, format?: string): string => {
  switch (format) {
    case 'percentage':
      return `${value}%`;
    case 'currency':
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    case 'duration':
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    case 'number':
    default:
      return value.toLocaleString('vi-VN');
  }
};

// Get trend info
const getTrendInfo = (change?: number) => {
  if (change === undefined) return null;
  
  return {
    icon: change > 0 ? TrendingUp : change < 0 ? TrendingDown : null,
    color: change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600',
    sign: change > 0 ? '+' : ''
  };
};

// Loading skeleton
const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className={`w-full`} style={{ height }} />
      </div>
    </CardContent>
  </Card>
);

// Simple bar chart
const SimpleBarChart = ({ 
  data, 
  height = 300, 
  format = 'number',
  showGrid = true,
  animated = true 
}: {
  data: ChartDataPoint[];
  height?: number;
  format?: string;
  showGrid?: boolean;
  animated?: boolean;
}) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const hasColors = data.some(item => item.color);

  return (
    <div className="space-y-4" style={{ height }}>
      {/* Y-axis labels */}
      {showGrid && (
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>0</span>
          <span>{formatValue(maxValue, format)}</span>
        </div>
      )}
      
      {/* Chart bars */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                <span>{formatValue(item.value, format)}</span>
                {item.change !== undefined && (
                  <span className={cn(
                    'text-xs flex items-center gap-1',
                    getTrendInfo(item.change)?.color
                  )}>
                    {getTrendInfo(item.change)?.icon && 
                      React.createElement(getTrendInfo(item.change)!.icon, { className: 'h-3 w-3' })
                    }
                    {getTrendInfo(item.change)?.sign}{Math.abs(item.change)}%
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  animated && "ease-out"
                )}
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length]
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress chart for single metrics
const ProgressChart = ({ 
  data, 
  format = 'number',
  threshold 
}: {
  data: ChartDataPoint[];
  format?: string;
  threshold?: UsageChartProps['threshold'];
}) => {
  const primaryItem = data[0];
  if (!primaryItem) return null;

  const percentage = threshold 
    ? (primaryItem.value / threshold.value) * 100
    : primaryItem.value;

  const getProgressColor = () => {
    if (!threshold) return 'bg-primary';
    
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-3xl font-bold">
          {formatValue(primaryItem.value, format)}
        </div>
        {threshold && (
          <div className="text-sm text-muted-foreground">
            / {formatValue(threshold.value, format)} {threshold.label}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Tiến độ</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <Progress 
          value={Math.min(percentage, 100)} 
          className="h-3"
        />
        {threshold && percentage > 100 && (
          <div className="text-xs text-red-600 text-center">
            Vượt quá giới hạn {Math.round(percentage - 100)}%
          </div>
        )}
      </div>

      {primaryItem.change !== undefined && (
        <div className="text-center">
          <div className={cn(
            'text-sm flex items-center justify-center gap-1',
            getTrendInfo(primaryItem.change)?.color
          )}>
            {getTrendInfo(primaryItem.change)?.icon && 
              React.createElement(getTrendInfo(primaryItem.change)!.icon, { className: 'h-4 w-4' })
            }
            <span>
              {getTrendInfo(primaryItem.change)?.sign}{Math.abs(primaryItem.change)}% so với tháng trước
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Pie chart representation using progress bars
const SimplePieChart = ({ 
  data, 
  format = 'number' 
}: {
  data: ChartDataPoint[];
  format?: string;
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="text-xs text-muted-foreground truncate">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      
      {/* Chart segments */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span>{formatValue(item.value, format)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length]
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Metric display for key numbers
const MetricDisplay = ({ 
  data, 
  format = 'number' 
}: {
  data: ChartDataPoint[];
  format?: string;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item, index) => (
        <div key={index} className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold mb-1">
            {formatValue(item.value, format)}
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {item.label}
          </div>
          {item.change !== undefined && (
            <div className={cn(
              'text-xs flex items-center justify-center gap-1',
              getTrendInfo(item.change)?.color
            )}>
              {getTrendInfo(item.change)?.icon && 
                React.createElement(getTrendInfo(item.change)!.icon, { className: 'h-3 w-3' })
              }
              {getTrendInfo(item.change)?.sign}{Math.abs(item.change)}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Time range options
const TIME_RANGE_OPTIONS = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '90d', label: '90 ngày' },
  { value: '1y', label: '1 năm' }
];

// Main Usage Chart component
export const UsageChart: React.FC<UsageChartProps> = ({
  title,
  description,
  data,
  type,
  loading = false,
  error = null,
  timeRange = '30d',
  onTimeRangeChange,
  onRefresh,
  onExport,
  className,
  height = 300,
  showLegend = true,
  showGrid = true,
  animated = true,
  interactive = true,
  format = 'number',
  threshold
}) => {
  if (loading) {
    return <ChartSkeleton height={height} />;
  }

  if (error) {
    return (
      <Card className={cn('border-red-200 bg-red-50', className)}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Lỗi tải dữ liệu</p>
            </div>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <SimpleBarChart 
            data={data} 
            height={height}
            format={format}
            showGrid={showGrid}
            animated={animated}
          />
        );
      case 'pie':
        return <SimplePieChart data={data} format={format} />;
      case 'progress':
        return <ProgressChart data={data} format={format} threshold={threshold} />;
      case 'metric':
        return <MetricDisplay data={data} format={format} />;
      case 'line':
      default:
        return (
          <SimpleBarChart 
            data={data} 
            height={height}
            format={format}
            showGrid={showGrid}
            animated={animated}
          />
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {type === 'bar' && <BarChart3 className="h-5 w-5" />}
              {type === 'pie' && <PieChart className="h-5 w-5" />}
              {type === 'line' && <LineChart className="h-5 w-5" />}
              {type === 'progress' && <Target className="h-5 w-5" />}
              {type === 'metric' && <TrendingUp className="h-5 w-5" />}
              {title}
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onTimeRangeChange && (
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Không có dữ liệu để hiển thị</p>
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
};

// Specialized chart components
export const CallVolumeChart: React.FC<Omit<UsageChartProps, 'type' | 'format'>> = (props) => (
  <UsageChart {...props} type="bar" format="number" />
);

export const LanguageDistributionChart: React.FC<Omit<UsageChartProps, 'type' | 'format'>> = (props) => (
  <UsageChart {...props} type="pie" format="percentage" />
);

export const UsageProgressChart: React.FC<Omit<UsageChartProps, 'type'>> = (props) => (
  <UsageChart {...props} type="progress" />
);

export const MetricsOverview: React.FC<Omit<UsageChartProps, 'type'>> = (props) => (
  <UsageChart {...props} type="metric" />
);

export default UsageChart; 