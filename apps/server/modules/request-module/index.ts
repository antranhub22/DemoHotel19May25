// ============================================
// REQUEST MODULE - Modular Architecture v1.0
// ============================================
// Organizes existing request functionality without API changes
// Prepares for future microservice migration

// Re-export existing controllers and services
export { RequestController } from '@server/controllers/requestController';

// Module metadata for registry
export const RequestModuleInfo = {
  name: 'request-module',
  version: '1.0.0',
  description: 'Request/Order management module',
  dependencies: ['tenant-module', 'auth-module'],
  endpoints: [
    'POST /api/request',
    'GET /api/request',
    'GET /api/request/:id',
    'PATCH /api/request/:id/status',
  ],
  features: [
    'request-creation',
    'request-management',
    'camelCase-transformation',
    'tenant-isolation',
  ],
};

// Module health check
export const checkRequestModuleHealth = () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    module: RequestModuleInfo.name,
    version: RequestModuleInfo.version,
  };
};
