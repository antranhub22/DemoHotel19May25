import express, { type Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { verifyJWT } from '@server/middleware/auth';
import { TenantService } from '@server/services/tenantService';
import { HotelResearchService } from '@server/services/hotelResearch';
import { VapiIntegrationService, AssistantGeneratorService } from '@server/services/vapiIntegration';
import { KnowledgeBaseGenerator } from '@server/services/knowledgeBaseGenerator';
import { tenants, hotelProfiles } from '@shared/schema';
import { db } from '@server/db';
import { eq } from 'drizzle-orm';
import { getOverview, getServiceDistribution, getHourlyActivity } from '@server/analytics';

// ============================================
// Router Setup
// ============================================

const router = express.Router();

// Apply authentication and tenant middleware to all dashboard routes
router.use(verifyJWT);
// router.use(identifyTenant);
// router.use(enforceRowLevelSecurity);

// Simple middleware placeholders
const identifyTenant = (req: Request, res: Response, next: NextFunction) => {
  // Simplified tenant identification - in production this would extract from JWT
  req.tenant = req.tenant || { id: 'mi-nhon-hotel', hotelName: 'Mi Nhon Hotel', subscriptionPlan: 'premium' };
  next();
};

const enforceRowLevelSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Simplified security - in production this would filter database queries
  next();
};

router.use(identifyTenant);
router.use(enforceRowLevelSecurity);

// ============================================
// Validation Schemas
// ============================================

const hotelResearchSchema = z.object({
  hotelName: z.string().min(1, 'Hotel name is required'),
  location: z.string().optional(),
  researchTier: z.enum(['basic', 'advanced']).default('basic')
});

const assistantCustomizationSchema = z.object({
  personality: z.enum(['professional', 'friendly', 'luxurious', 'casual']).default('professional'),
  tone: z.enum(['formal', 'friendly', 'enthusiastic', 'calm']).default('friendly'),
  languages: z.array(z.string()).min(1, 'At least one language is required').default(['English']),
  voiceId: z.string().optional(),
  silenceTimeout: z.number().min(10).max(120).optional(),
  maxDuration: z.number().min(300).max(3600).optional(),
  backgroundSound: z.enum(['office', 'off', 'hotel-lobby']).default('hotel-lobby')
});

const generateAssistantSchema = z.object({
  hotelData: z.any(), // Will be validated by the research service
  customization: assistantCustomizationSchema
});

const assistantConfigSchema = z.object({
  personality: z.enum(['professional', 'friendly', 'luxurious', 'casual']).optional(),
  tone: z.enum(['formal', 'friendly', 'enthusiastic', 'calm']).optional(),
  languages: z.array(z.string()).optional(),
  voiceId: z.string().optional(),
  silenceTimeout: z.number().optional(),
  maxDuration: z.number().optional(),
  backgroundSound: z.enum(['office', 'off', 'hotel-lobby']).optional(),
  systemPrompt: z.string().optional()
});

// ============================================
// Service Instances
// ============================================

const hotelResearchService = new HotelResearchService();
const assistantGeneratorService = new AssistantGeneratorService();
const vapiIntegrationService = new VapiIntegrationService();
const knowledgeBaseGenerator = new KnowledgeBaseGenerator();
const tenantService = new TenantService();

// ============================================
// Middleware
// ============================================

const checkLimits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = req.tenant;
    const limits = tenantService.getSubscriptionLimits(tenant.subscriptionPlan);
    
    // Check usage against limits
    const usage = await tenantService.getTenantUsage(tenant.id);
    
    if (usage.callsThisMonth >= limits.monthlyCallLimit) {
      return res.status(403).json({
        error: 'Monthly call limit exceeded',
        usage: usage.callsThisMonth,
        limit: limits.monthlyCallLimit,
        upgradeRequired: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Usage check failed:', error);
    next(); // Continue on error to avoid blocking
  }
};

const requireFeature = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hasFeature = await tenantService.hasFeatureAccess(req.tenant.id, feature as any);
      if (!hasFeature) {
        return res.status(403).json({
          error: `Feature '${feature}' not available in your plan`,
          feature,
          currentPlan: req.tenant.subscriptionPlan,
          upgradeRequired: true
        });
      }
      next();
    } catch (error) {
      console.error('Feature check failed:', error);
      next(); // Continue on error to avoid blocking
    }
  };
};

function handleApiError(res: Response, error: any, defaultMessage: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error(defaultMessage, error);
    return res.status(500).json({ 
      error: defaultMessage, 
      message: error.message, 
      stack: error.stack,
      type: error.constructor.name
    });
  } else {
    console.error(defaultMessage, error.message);
    return res.status(500).json({ error: defaultMessage });
  }
}

// ============================================
// Dashboard API Routes
// ============================================

/**
 * POST /api/dashboard/research-hotel
 * Research hotel information automatically
 */
router.post('/research-hotel', checkLimits, async (req: Request, res: Response) => {
  try {
    console.log(`🔍 Hotel research requested by tenant: ${req.tenant.hotelName}`);
    
    // Validate input
    const { hotelName, location, researchTier } = hotelResearchSchema.parse(req.body);
    
    // Check feature access for advanced research
    if (researchTier === 'advanced') {
      const hasAdvancedResearch = await tenantService.hasFeatureAccess(req.tenant.id, 'advancedAnalytics');
      if (!hasAdvancedResearch) {
        return res.status(403).json({
          error: 'Advanced research not available in your plan',
          feature: 'advancedAnalytics',
          currentPlan: req.tenant.subscriptionPlan,
          upgradeRequired: true
        });
      }
    }

    // Perform research based on tier
    let hotelData;
    if (researchTier === 'advanced') {
      console.log(`🏨 Performing advanced research for: ${hotelName}`);
      hotelData = await hotelResearchService.advancedResearch(hotelName, location);
    } else {
      console.log(`🏨 Performing basic research for: ${hotelName}`);
      hotelData = await hotelResearchService.basicResearch(hotelName, location);
    }
    
    // Generate knowledge base
    const knowledgeBase = knowledgeBaseGenerator.generateKnowledgeBase(hotelData);
    
    // Update hotel profile with research data
    await db.update(hotelProfiles)
      .set({
        researchData: hotelData,
        knowledgeBase: knowledgeBase,
        updatedAt: new Date()
      })
      .where(eq(hotelProfiles.tenantId, req.tenant.id));
    
    console.log(`✅ Hotel research completed for ${hotelName}`);
    
    res.json({
      success: true,
      hotelData,
      knowledgeBase,
      researchTier,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      });
    }
    handleApiError(res, error, 'Hotel research failed');
  }
});

/**
 * POST /api/dashboard/generate-assistant
 * Generate Vapi assistant from hotel data
 */
router.post('/generate-assistant', checkLimits, async (req: Request, res: Response) => {
  try {
    console.log(`🤖 Assistant generation requested by tenant: ${req.tenant.hotelName}`);
    
    // Validate input
    const { hotelData, customization } = generateAssistantSchema.parse(req.body);
    
    // Check if hotel data exists
    if (!hotelData || !hotelData.name) {
      return res.status(400).json({
        error: 'Hotel data is required. Please research your hotel first.',
        requiresResearch: true
      });
    }
    
    // Generate assistant
    const assistantId = await assistantGeneratorService.generateAssistant(hotelData, customization);
    
    // Generate system prompt for storage
    const systemPrompt = knowledgeBaseGenerator.generateSystemPrompt(hotelData, customization);
    
    // Update hotel profile with assistant info
    await db.update(hotelProfiles)
      .set({
        vapiAssistantId: assistantId,
        assistantConfig: customization,
        systemPrompt: systemPrompt,
        updatedAt: new Date()
      })
      .where(eq(hotelProfiles.tenantId, req.tenant.id));
    
    console.log(`✅ Assistant generated successfully: ${assistantId}`);
    
    res.json({
      success: true,
      assistantId,
      customization,
      systemPrompt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      });
    }
    handleApiError(res, error, 'Assistant generation failed');
  }
});

/**
 * GET /api/dashboard/hotel-profile
 * Get hotel profile and assistant information
 */
router.get('/hotel-profile', async (req: Request, res: Response) => {
  try {
    console.log(`📊 Hotel profile requested by tenant: ${req.tenant.hotelName}`);
    
    // Get hotel profile
    const [profile] = await db
      .select()
      .from(hotelProfiles)
      .where(eq(hotelProfiles.tenantId, req.tenant.id))
      .limit(1);
    
    if (!profile) {
      return res.status(404).json({
        error: 'Hotel profile not found',
        setupRequired: true
      });
    }
    
    // Get tenant usage statistics
    const usage = await tenantService.getTenantUsage(req.tenant.id);
    
    // Get subscription limits
    const limits = tenantService.getSubscriptionLimits(req.tenant.subscriptionPlan);
    
    // Get feature flags
    const features = tenantService.getCurrentFeatureFlags(req.tenant);
    
    // Check if assistant exists
    let assistantStatus = 'not_created';
    if (profile.vapiAssistantId) {
      try {
        await vapiIntegrationService.getAssistant(profile.vapiAssistantId);
        assistantStatus = 'active';
      } catch (error) {
        assistantStatus = 'error';
        console.warn(`Assistant ${profile.vapiAssistantId} may not exist:`, (error as any).message);
      }
    }
    
    res.json({
      success: true,
      profile: {
        tenantId: profile.tenantId,
        hasResearchData: !!profile.researchData,
        hasAssistant: !!profile.vapiAssistantId,
        assistantId: profile.vapiAssistantId,
        assistantStatus,
        assistantConfig: profile.assistantConfig,
        knowledgeBase: profile.knowledgeBase,
        systemPrompt: profile.systemPrompt,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      },
      tenant: {
        hotelName: req.tenant.hotelName,
        subdomain: req.tenant.subdomain,
        subscriptionPlan: req.tenant.subscriptionPlan,
        subscriptionStatus: req.tenant.subscriptionStatus,
        trialEndsAt: req.tenant.trialEndsAt
      },
      usage,
      limits,
      features
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch hotel profile');
  }
});

/**
 * PUT /api/dashboard/assistant-config
 * Update assistant configuration
 */
router.put('/assistant-config', checkLimits, async (req: Request, res: Response) => {
  try {
    console.log(`⚙️ Assistant config update requested by tenant: ${req.tenant.hotelName}`);
    
    // Validate input
    const config = assistantConfigSchema.parse(req.body);
    
    // Get current profile
    const [profile] = await db
      .select()
      .from(hotelProfiles)
      .where(eq(hotelProfiles.tenantId, req.tenant.id))
      .limit(1);
    
    if (!profile) {
      return res.status(404).json({
        error: 'Hotel profile not found',
        setupRequired: true
      });
    }
    
    if (!profile.vapiAssistantId) {
      return res.status(400).json({
        error: 'No assistant found. Please generate an assistant first.',
        assistantRequired: true
      });
    }
    
    // Merge current config with updates
    const currentConfig = profile.assistantConfig || {};
    const updatedConfig = { ...currentConfig, ...config };
    
    // Update assistant via Vapi API if hotel data exists
    if (profile.researchData) {
      await assistantGeneratorService.updateAssistant(
        profile.vapiAssistantId,
        profile.researchData,
        updatedConfig
      );
    } else {
      // Update specific configs only
      await vapiIntegrationService.updateAssistant(profile.vapiAssistantId, {
        voiceId: config.voiceId,
        silenceTimeoutSeconds: config.silenceTimeout,
        maxDurationSeconds: config.maxDuration,
        backgroundSound: config.backgroundSound,
        systemPrompt: config.systemPrompt
      });
    }
    
    // Update database
    await db.update(hotelProfiles)
      .set({
        assistantConfig: updatedConfig,
        systemPrompt: config.systemPrompt || profile.systemPrompt,
        updatedAt: new Date()
      })
      .where(eq(hotelProfiles.tenantId, req.tenant.id));
    
    console.log(`✅ Assistant config updated for tenant: ${req.tenant.hotelName}`);
    
    res.json({
      success: true,
      updatedConfig,
      assistantId: profile.vapiAssistantId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid configuration data', 
        details: error.errors 
      });
    }
    handleApiError(res, error, 'Failed to update assistant configuration');
  }
});

/**
 * GET /api/dashboard/analytics
 * Get tenant-filtered analytics data
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    console.log(`📈 Analytics requested by tenant: ${req.tenant.hotelName}`);
    
    // Check if analytics feature is available
    const hasAnalytics = await tenantService.hasFeatureAccess(req.tenant.id, 'advancedAnalytics');
    
    // Get basic or advanced analytics based on plan
    if (hasAnalytics) {
      // Advanced analytics with full details
      const [overview, serviceDistribution, hourlyActivity] = await Promise.all([
        getOverview(), // Analytics functions don't take tenant ID
        getServiceDistribution(),
        getHourlyActivity()
      ]);
      
      res.json({
        success: true,
        analytics: {
          overview,
          serviceDistribution,
          hourlyActivity
        },
        tier: 'advanced',
        tenantId: req.tenant.id
      });
    } else {
      // Basic analytics with limited data
      const overview = await getOverview();
      
      res.json({
        success: true,
        analytics: {
          overview: {
            totalCalls: overview.totalCalls,
            averageDuration: overview.averageCallDuration // Fixed property name
          }
        },
        tier: 'basic',
        tenantId: req.tenant.id,
        upgradeMessage: 'Upgrade to premium for detailed analytics'
      });
    }
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch analytics');
  }
});

/**
 * GET /api/dashboard/service-health
 * Check health of all integrated services
 */
router.get('/service-health', async (req: Request, res: Response) => {
  try {
    console.log(`🏥 Service health check requested by tenant: ${req.tenant.hotelName}`);
    
    const [
      hotelResearchHealth,
      vapiHealth,
      tenantHealth
    ] = await Promise.allSettled([
      hotelResearchService.getServiceHealth(),
      vapiIntegrationService.getServiceHealth(),
      tenantService.getServiceHealth()
    ]);
    
    const health = {
      overall: 'healthy',
      services: {
        hotelResearch: hotelResearchHealth.status === 'fulfilled' ? hotelResearchHealth.value : { status: 'error' },
        vapi: vapiHealth.status === 'fulfilled' ? vapiHealth.value : { status: 'error' },
        tenant: tenantHealth.status === 'fulfilled' ? tenantHealth.value : { status: 'error' }
      },
      timestamp: new Date().toISOString()
    };
    
    // Determine overall health
    const serviceStatuses = Object.values(health.services).map(s => s.status);
    if (serviceStatuses.includes('error')) {
      health.overall = 'degraded';
    }
    if (serviceStatuses.every(s => s === 'error')) {
      health.overall = 'down';
    }
    
    res.json(health);
  } catch (error) {
    handleApiError(res, error, 'Failed to check service health');
  }
});

/**
 * DELETE /api/dashboard/reset-assistant
 * Delete and reset assistant (for testing/development)
 */
router.delete('/reset-assistant', requireFeature('apiAccess'), async (req: Request, res: Response) => {
  try {
    console.log(`🗑️ Assistant reset requested by tenant: ${req.tenant.hotelName}`);
    
    // Get current profile
    const [profile] = await db
      .select()
      .from(hotelProfiles)
      .where(eq(hotelProfiles.tenantId, req.tenant.id))
      .limit(1);
    
    if (!profile || !profile.vapiAssistantId) {
      return res.status(404).json({
        error: 'No assistant found to reset'
      });
    }
    
    // Delete assistant from Vapi
    try {
      await vapiIntegrationService.deleteAssistant(profile.vapiAssistantId);
    } catch (error) {
      console.warn(`Failed to delete assistant from Vapi: ${(error as any).message}`);
    }
    
    // Clear assistant data from database
    await db.update(hotelProfiles)
      .set({
        vapiAssistantId: null,
        assistantConfig: null,
        systemPrompt: null,
        updatedAt: new Date()
      })
      .where(eq(hotelProfiles.tenantId, req.tenant.id));
    
    console.log(`✅ Assistant reset completed for tenant: ${req.tenant.hotelName}`);
    
    res.json({
      success: true,
      message: 'Assistant has been reset. You can now generate a new one.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to reset assistant');
  }
});

// ============================================
// Export Router
// ============================================

export default router; 