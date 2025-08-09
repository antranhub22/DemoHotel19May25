// Main Dashboard
export { UnifiedDashboardHome } from './UnifiedDashboardHome.tsx';

// Dashboard Components
export { FrontDeskDashboard } from './dashboards/FrontDeskDashboard.tsx';
export { HotelManagerDashboard } from './dashboards/HotelManagerDashboard.tsx';
export { ITManagerDashboard } from './dashboards/ITManagerDashboard.tsx';

// Shared Components & Hooks
export { DashboardLayout } from './shared/components/DashboardLayout.tsx';
export { MetricCard } from './shared/components/MetricCard.tsx';
export { useDashboardData } from './shared/hooks/useDashboardData.ts';
export type {
  DashboardData,
  DashboardLayoutProps,
  MetricCardProps,
} from './shared/types/dashboard.ts';

// Feature Pages
export { AdvancedAnalytics } from './AdvancedAnalytics.tsx';
export { CustomerRequests } from './CustomerRequests.tsx';
export { GuestManagement } from './GuestManagement.tsx';
export { Integrations } from './Integrations.tsx';
export { SecuritySettings } from './SecuritySettings.tsx';
export { Settings } from './Settings.tsx';
export { StaffManagement } from './StaffManagement.tsx';
export { SystemLogs } from './SystemLogs.tsx';
export { SystemMonitoring } from './SystemMonitoring.tsx';
