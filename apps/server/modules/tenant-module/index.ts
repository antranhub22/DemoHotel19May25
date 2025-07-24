// ============================================
// TENANT MODULE - Modular Architecture v1.0
// ============================================
// Organizes existing tenant functionality without API changes

// Re-export existing services and middleware
export { TenantMiddleware } from '@server/middleware/tenant';
export { TenantService } from '@server/services/tenantService';

// Module metadata
export const TenantModuleInfo = {
  name: 'tenant-module',
  version: '1.0.0',
  description: 'Multi-tenant management and isolation',
  dependencies: ['auth-module'],
  features: [
    'tenant-identification',
    'subscription-management',
    'data-isolation',
    'feature-flags',
    'usage-tracking',
  ],
};

// Module health check
export const checkTenantModuleHealth = () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    module: TenantModuleInfo.name,
    version: TenantModuleInfo.version,
  };
};
