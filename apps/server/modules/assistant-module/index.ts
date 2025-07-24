// ============================================
// ASSISTANT MODULE - Modular Architecture v1.0
// ============================================
// Organizes existing AI assistant functionality without API changes

// Re-export existing services
export { HotelResearchService } from '@server/services/hotelResearch';
export { KnowledgeBaseGenerator } from '@server/services/knowledgeBaseGenerator';
export {
  AssistantGeneratorService,
  VapiIntegrationService,
} from '@server/services/vapiIntegration';

// Module metadata
export const AssistantModuleInfo = {
  name: 'assistant-module',
  version: '1.0.0',
  description: 'AI voice assistant generation and management',
  dependencies: ['tenant-module'],
  endpoints: [
    'POST /api/dashboard/research-hotel',
    'POST /api/dashboard/generate-assistant',
    'PUT /api/dashboard/assistant-config',
    'GET /api/dashboard/hotel-profile',
  ],
  features: [
    'hotel-research',
    'knowledge-base-generation',
    'vapi-integration',
    'assistant-generation',
    'multi-language-support',
  ],
};

// Module health check
export const checkAssistantModuleHealth = () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    module: AssistantModuleInfo.name,
    version: AssistantModuleInfo.version,
  };
};
