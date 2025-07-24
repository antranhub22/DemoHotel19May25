// ============================================
// FEATURE FLAGS MANAGEMENT API - v2.0
// ============================================
// REST API for managing enhanced feature flags with runtime updates,
// A/B testing, audit logging, and comprehensive monitoring

import {
  createABTest,
  FeatureFlags,
  updateFlag,
  type ABTestConfig,
} from '@server/shared/FeatureFlags';
import { logger } from '@shared/utils/logger';
import express, { Response, type Request } from 'express';
import { z } from 'zod';

const router = express.Router();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const flagUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  description: z.string().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  targetAudience: z.array(z.string()).optional(),
  expirationDate: z
    .string()
    .transform(str => new Date(str))
    .optional(),
  tags: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

const abTestSchema = z.object({
  name: z.string().min(1),
  flagName: z.string().min(1),
  variants: z.object({
    control: z.object({
      percentage: z.number().min(0).max(100),
      enabled: z.boolean(),
    }),
    treatment: z.object({
      percentage: z.number().min(0).max(100),
      enabled: z.boolean(),
    }),
  }),
  targetAudience: z.array(z.string()).optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z
    .string()
    .transform(str => new Date(str))
    .optional(),
  active: z.boolean().default(true),
});

// ============================================
// FLAG MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /api/feature-flags - Get all feature flags with filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { module, enabled, tags, hasABTest } = req.query;

    const filters: any = {};
    if (module) filters.module = module as string;
    if (enabled !== undefined) filters.enabled = enabled === 'true';
    if (tags) filters.tags = (tags as string).split(',');
    if (hasABTest !== undefined) filters.hasABTest = hasABTest === 'true';

    const flags = FeatureFlags.getAllFlags(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    const status = FeatureFlags.getStatus();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        flags,
        summary: status.summary,
        metrics: status.metrics,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to get flags',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve feature flags',
      details: error.message,
    });
  }
});

/**
 * GET /api/feature-flags/status - Get comprehensive flag status
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = FeatureFlags.getStatus();
    const diagnostics = FeatureFlags.getDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      status,
      diagnostics,
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to get status',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve flag status',
      details: error.message,
    });
  }
});

/**
 * GET /api/feature-flags/:flagName - Get specific flag details
 */
router.get('/:flagName', async (req: Request, res: Response) => {
  try {
    const { flagName } = req.params;
    const flags = FeatureFlags.getAllFlags();
    const flag = flags.find(f => f.name === flagName);

    if (!flag) {
      (res as any).status(404).json({
        success: false,
        error: `Flag '${flagName}' not found`,
      });
      return;
    }

    const auditLog = FeatureFlags.getFlagAuditLog(flagName, 50);

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        flag,
        auditLog,
        isEnabled: FeatureFlags.isEnabled(flagName),
      },
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to get flag',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve flag',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/feature-flags/:flagName - Update flag runtime (no restart required)
 */
router.patch('/:flagName', async (req: Request, res: Response) => {
  try {
    const { flagName } = req.params;
    const updatedBy = (req.headers['x-updated-by'] as string) || 'api-user';

    // Validate request body
    const validation = flagUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      (res as any).status(400).json({
        success: false,
        error: 'Invalid request body',
        details: validation.error.issues,
      });
      return;
    }

    const { reason, ...updates } = validation.data;

    // Update flag
    updateFlag(flagName, updates, updatedBy, reason);

    // Get updated flag
    const flags = FeatureFlags.getAllFlags();
    const updatedFlag = flags.find(f => f.name === flagName);

    logger.info(
      `🚩 [FeatureFlags API] Runtime flag update: ${flagName}`,
      'FeatureFlagsAPI',
      { updates, updatedBy, reason }
    );

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: `Flag '${flagName}' updated successfully`,
      data: {
        flag: updatedFlag,
        updates,
        updatedBy,
        reason,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to update flag',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to update flag',
      details: error.message,
    });
  }
});

/**
 * POST /api/feature-flags/:flagName/enable - Enable flag quickly
 */
router.post('/:flagName/enable', async (req: Request, res: Response) => {
  try {
    const { flagName } = req.params;
    const updatedBy = (req.headers['x-updated-by'] as string) || 'api-user';
    const { reason } = req.body;

    FeatureFlags.enable(flagName, updatedBy, reason);

    logger.info(
      `🚩 [FeatureFlags API] Flag enabled: ${flagName}`,
      'FeatureFlagsAPI',
      { updatedBy, reason }
    );

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: `Flag '${flagName}' enabled successfully`,
      data: {
        flagName,
        enabled: true,
        updatedBy,
        reason,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to enable flag',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to enable flag',
      details: error.message,
    });
  }
});

/**
 * POST /api/feature-flags/:flagName/disable - Disable flag quickly
 */
router.post('/:flagName/disable', async (req: Request, res: Response) => {
  try {
    const { flagName } = req.params;
    const updatedBy = (req.headers['x-updated-by'] as string) || 'api-user';
    const { reason } = req.body;

    FeatureFlags.disable(flagName, updatedBy, reason);

    logger.info(
      `🚩 [FeatureFlags API] Flag disabled: ${flagName}`,
      'FeatureFlagsAPI',
      { updatedBy, reason }
    );

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: `Flag '${flagName}' disabled successfully`,
      data: {
        flagName,
        enabled: false,
        updatedBy,
        reason,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to disable flag',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to disable flag',
      details: error.message,
    });
  }
});

// ============================================
// A/B TESTING ENDPOINTS
// ============================================

/**
 * GET /api/feature-flags/ab-tests - Get all A/B tests
 */
router.get('/ab-tests/list', async (_req: Request, res: Response) => {
  try {
    const status = FeatureFlags.getStatus();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        abTests: status.abTests,
        summary: {
          total: Object.keys(status.abTests).length,
          active: Object.values(status.abTests).filter(
            (test: any) => test.active
          ).length,
        },
      },
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to get A/B tests',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve A/B tests',
      details: error.message,
    });
  }
});

/**
 * POST /api/feature-flags/ab-tests - Create new A/B test
 */
router.post('/ab-tests', async (req: Request, res: Response) => {
  try {
    const createdBy = (req.headers['x-created-by'] as string) || 'api-user';

    // Validate request body
    const validation = abTestSchema.safeParse(req.body);
    if (!validation.success) {
      (res as any).status(400).json({
        success: false,
        error: 'Invalid A/B test configuration',
        details: validation.error.issues,
      });
      return;
    }

    const config = validation.data as ABTestConfig;

    // Validate percentages sum to 100
    if (
      config.variants.control.percentage +
        config.variants.treatment.percentage !==
      100
    ) {
      (res as any).status(400).json({
        success: false,
        error: 'Variant percentages must sum to 100',
      });
      return;
    }

    createABTest(config, createdBy);

    logger.info(
      `🧪 [FeatureFlags API] A/B test created: ${config.name}`,
      'FeatureFlagsAPI',
      { config, createdBy }
    );

    (res as any).status(201).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      message: `A/B test '${config.name}' created successfully`,
      data: {
        test: config,
        createdBy,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to create A/B test',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to create A/B test',
      details: error.message,
    });
  }
});

/**
 * GET /api/feature-flags/ab-tests/:userId - Get A/B test assignments for user
 */
router.get('/ab-tests/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const assignments = FeatureFlags.getABTestAssignments(userId);

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        userId,
        assignments,
        totalTests: Object.keys(assignments).length,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to get A/B test assignments',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get A/B test assignments',
      details: error.message,
    });
  }
});

// ============================================
// AUDIT & MONITORING ENDPOINTS
// ============================================

/**
 * GET /api/feature-flags/audit - Get audit log
 */
router.get('/audit/log', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const auditLog = FeatureFlags.getAuditLog(limit);

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        auditLog,
        total: auditLog.length,
        limit,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to get audit log',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve audit log',
      details: error.message,
    });
  }
});

/**
 * GET /api/feature-flags/audit/:flagName - Get audit log for specific flag
 */
router.get('/audit/:flagName', async (req: Request, res: Response) => {
  try {
    const { flagName } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const auditLog = FeatureFlags.getFlagAuditLog(flagName, limit);

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        flagName,
        auditLog,
        total: auditLog.length,
        limit,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to get flag audit log',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve flag audit log',
      details: error.message,
    });
  }
});

/**
 * GET /api/feature-flags/diagnostics - Get system diagnostics
 */
router.get('/diagnostics', async (_req: Request, res: Response) => {
  try {
    const diagnostics = FeatureFlags.getDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      diagnostics,
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to get diagnostics',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to retrieve diagnostics',
      details: error.message,
    });
  }
});

// ============================================
// EVALUATION ENDPOINTS
// ============================================

/**
 * POST /api/feature-flags/evaluate - Evaluate flags for user/context
 */
router.post('/evaluate', async (req: Request, res: Response) => {
  try {
    const { userId, tenantId, flags } = req.body;
    const context = { userId, tenantId };

    if (!flags || !Array.isArray(flags)) {
      (res as any).status(400).json({
        success: false,
        error: 'Must provide flags array to evaluate',
      });
      return;
    }

    const evaluations = {};
    for (const flagName of flags) {
      evaluations[flagName] = {
        enabled: FeatureFlags.isEnabled(flagName, context),
        abTest: userId ? FeatureFlags.evaluateABTest(flagName, userId) : null,
      };
    }

    (res as any).status(200).json({
      success: true,
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        context,
        evaluations,
        flagCount: flags.length,
      },
    });
  } catch (error) {
    logger.error(
      '❌ [FeatureFlags API] Failed to evaluate flags',
      'FeatureFlagsAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to evaluate flags',
      details: error.message,
    });
  }
});

export default router;
