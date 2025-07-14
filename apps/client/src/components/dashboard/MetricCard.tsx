import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';

// Types
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: {
    value: number;
    period: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ComponentType<{ className?: string }>;
  status?: 'normal' | 'warning' | 'error' | 'success';
  loading?: boolean;
  className?: string;
  suffix?: string;
  prefix?: string;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  onClick?: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
}

// Format value based on type
const formatValue = (
  value: string | number,
  format?: string,
  prefix?: string,
  suffix?: string
): string => {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'duration':
      // Assuming value is in seconds
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    case 'number':
    default:
      return `${prefix || ''}${value.toLocaleString('vi-VN')}${suffix || ''}`;
  }
};

// Get trend icon and color
const getTrendInfo = (change?: MetricCardProps['change']) => {
  if (!change) return null;
  
  const { type, value } = change;
  
  switch (type) {
    case 'increase':
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bg: 'bg-green-50',
        sign: '+'
      };
    case 'decrease':
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bg: 'bg-red-50',
        sign: '-'
      };
    case 'neutral':
    default:
      return {
        icon: Minus,
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        sign: ''
      };
  }
};

// Get status indicator
const getStatusInfo = (status?: string) => {
  switch (status) {
    case 'success':
      return {
        icon: CheckCircle2,
        color: 'text-green-600',
        bg: 'bg-green-100'
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100'
      };
    case 'error':
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-100'
      };
    default:
      return {
        icon: Info,
        color: 'text-blue-600',
        bg: 'bg-blue-100'
      };
  }
};

// Loading skeleton
const MetricCardSkeleton = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const heights = {
    sm: 'h-20',
    md: 'h-24',
    lg: 'h-32'
  };

  return (
    <Card className={cn('animate-pulse', heights[size])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
};

// Main MetricCard component
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  change,
  icon: Icon,
  status,
  loading = false,
  className,
  suffix,
  prefix,
  format = 'number',
  size = 'md',
  variant = 'default',
  onClick,
  actionButton
}) => {
  if (loading) {
    return <MetricCardSkeleton size={size} />;
  }

  const trendInfo = getTrendInfo(change);
  const statusInfo = getStatusInfo(status);
  const formattedValue = formatValue(value, format, prefix, suffix);
  
  const cardSizes = {
    sm: 'h-20',
    md: 'h-24',
    lg: 'h-32'
  };

  const cardVariants = {
    default: 'border bg-card text-card-foreground shadow-sm',
    outline: 'border-2 bg-transparent',
    ghost: 'border-0 bg-transparent shadow-none'
  };

  const CardComponent = onClick ? 'button' : 'div';
  const cardProps = onClick ? {
    onClick,
    className: cn(
      'w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
    )
  } : {};

  return (
    <CardComponent {...cardProps}>
      <Card 
        className={cn(
          cardVariants[variant],
          cardSizes[size],
          onClick && 'transition-all hover:shadow-md',
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {status && (
              <div className={cn(
                'p-1 rounded-full',
                statusInfo.bg
              )}>
                <statusInfo.icon className={cn('h-3 w-3', statusInfo.color)} />
              </div>
            )}
            {Icon && (
              <Icon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {/* Main value */}
            <div className={cn(
              'font-bold',
              size === 'sm' ? 'text-lg' : 
              size === 'md' ? 'text-2xl' : 'text-3xl'
            )}>
              {formattedValue}
            </div>
            
            {/* Description and change */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                {description && (
                  <div className="text-xs text-muted-foreground">
                    {description}
                  </div>
                )}
                
                {change && trendInfo && (
                  <div className={cn(
                    'flex items-center text-xs',
                    trendInfo.color
                  )}>
                    <trendInfo.icon className="h-3 w-3 mr-1" />
                    <span>
                      {trendInfo.sign}{Math.abs(change.value)}% {change.period}
                    </span>
                  </div>
                )}
              </div>
              
              {actionButton && (
                <Button
                  variant={actionButton.variant || 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    actionButton.onClick();
                  }}
                  className="text-xs"
                >
                  {actionButton.label}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </CardComponent>
  );
};

// Specialized metric card variants
export const CallMetricCard: React.FC<Omit<MetricCardProps, 'format' | 'icon'>> = (props) => (
  <MetricCard
    {...props}
    format="number"
    icon={Clock}
  />
);

export const CurrencyMetricCard: React.FC<Omit<MetricCardProps, 'format' | 'icon'>> = (props) => (
  <MetricCard
    {...props}
    format="currency"
  />
);

export const PercentageMetricCard: React.FC<Omit<MetricCardProps, 'format' | 'suffix'>> = (props) => (
  <MetricCard
    {...props}
    format="percentage"
  />
);

export const DurationMetricCard: React.FC<Omit<MetricCardProps, 'format'>> = (props) => (
  <MetricCard
    {...props}
    format="duration"
  />
);

// Metric cards grid layout component
export const MetricCardsGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  children, 
  columns = 4, 
  gap = 'md', 
  className 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gaps = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={cn(
      'grid',
      gridCols[columns],
      gaps[gap],
      className
    )}>
      {children}
    </div>
  );
};

export default MetricCard; 