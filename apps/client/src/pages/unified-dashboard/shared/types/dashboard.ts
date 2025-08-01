export interface DashboardData {
  calls: {
    total: number;
    today: number;
    answered: number;
    avgDuration: string;
  };
  requests: {
    pending: number;
    inProgress: number;
    completed: number;
    totalToday: number;
  };
  satisfaction: {
    rating: number;
    responses: number;
    trend: string;
  };
  system: {
    uptime: number;
    responseTime: number;
    errors: number;
  };
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}

export interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  loading?: boolean;
  children: React.ReactNode;
}
