// ============================================
// ANALYTICS MODULE - Modular Architecture v1.0
// ============================================
// Organizes existing analytics functionality without API changes

// Re-export existing controllers and services
export {
  getDashboardAnalytics,
  getHourlyActivity,
  getOverview,
  getServiceDistribution,
} from '@server/analytics';
export { AnalyticsController } from '@server/controllers/analyticsController';

// Module metadata
export const AnalyticsModuleInfo = {
  name: 'analytics-module',
  version: '1.0.0',
  description: 'Business intelligence and analytics',
  dependencies: ['tenant-module'],
  endpoints: [
    'GET /api/analytics/overview',
    'GET /api/analytics/service-distribution',
    'GET /api/analytics/hourly-activity',
    'GET /api/analytics/dashboard',
  ],
  features: [
    'call-analytics',
    'service-distribution',
    'hourly-activity',
    'tenant-filtering',
    'dashboard-analytics',
  ],
};

// Module health check
export const checkAnalyticsModuleHealth = () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    module: AnalyticsModuleInfo.name,
    version: AnalyticsModuleInfo.version,
  };
};
