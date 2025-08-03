// Main Dashboard
export { UnifiedDashboardHome } from './UnifiedDashboardHome';

// Dashboard Components
export { FrontDeskDashboard } from './dashboards/FrontDeskDashboard';
export { HotelManagerDashboard } from './dashboards/HotelManagerDashboard';
export { ITManagerDashboard } from './dashboards/ITManagerDashboard';

// Shared Components & Hooks
export { DashboardLayout } from './shared/components/DashboardLayout';
export { MetricCard } from './shared/components/MetricCard';
export { useDashboardData } from './shared/hooks/useDashboardData';
export type {
  DashboardData,
  DashboardLayoutProps,
  MetricCardProps,
} from './shared/types/dashboard';

// Feature Pages
export { AdvancedAnalytics } from './AdvancedAnalytics';
export { CustomerRequests } from './CustomerRequests';
export { GuestManagement } from './GuestManagement';
export { Integrations } from './Integrations';
export { SecuritySettings } from './SecuritySettings';
export { Settings } from './Settings';
export { StaffManagement } from './StaffManagement';
export { SystemLogs } from './SystemLogs';
export { SystemMonitoring } from './SystemMonitoring';
