import { commonErrors } from '@server/utils/apiHelpers';
import {
  API_VERSIONS,
  apiVersionMiddleware,
  createVersionedResponse,
  detectApiVersion,
  getVersionStats,
  isVersionDeprecated,
  trackVersionUsage,
  transformDataForVersion,
} from '@server/utils/apiVersioning';
import { logger } from '@shared/utils/logger';
import express from 'express';

const router = express.Router();

// Apply versioning middleware to all routes
router.use(apiVersionMiddleware);

// ============================================
// VERSION INFORMATION ENDPOINTS
// ============================================

/**
 * GET /api/versions - Get available API versions
 */
router.get('/versions', (req, res) => {
  try {
    const versions = Object.values(API_VERSIONS).map(version => ({
      version: version.version,
      status: version.status,
      releaseDate: version.releaseDate,
      deprecationDate: version.deprecationDate,
      sunsetDate: version.sunsetDate,
      breaking: version.breaking,
      description: version.description,
      features: version.features,
    }));

    return createVersionedResponse(
      res,
      {
        versions,
        current: detectApiVersion(req),
        recommended: 'v2.2',
      },
      'Available API versions retrieved',
      {
        totalVersions: versions.length,
        stableVersions: versions.filter(v => v.status === 'stable').length,
        deprecatedVersions: versions.filter(v => v.status === 'deprecated')
          .length,
      }
    );
  } catch (error) {
    logger.error(
      '❌ [VERSIONED-API] Error getting versions:',
      'VersionedApi',
      error
    );
    return commonErrors.internal(res, 'Failed to retrieve API versions', error);
  }
});

/**
 * GET /api/version/current - Get current request version info
 */
router.get('/version/current', (req, res) => {
  try {
    const requestedVersion = detectApiVersion(req);
    const versionInfo = API_VERSIONS[requestedVersion];
    const clientInfo = req.clientInfo;

    if (!versionInfo) {
      return commonErrors.notFound(res, 'API Version', requestedVersion);
    }

    // Track usage
    if (clientInfo) {
      trackVersionUsage(requestedVersion, clientInfo);
    }

    return createVersionedResponse(
      res,
      {
        version: versionInfo,
        client: clientInfo,
        compatibility: {
          deprecated: isVersionDeprecated(requestedVersion),
          breaking: versionInfo.breaking,
          migrationRequired: versionInfo.status === 'deprecated',
        },
      },
      'Current version information retrieved'
    );
  } catch (error) {
    logger.error(
      '❌ [VERSIONED-API] Error getting current version:',
      'VersionedApi',
      error
    );
    return commonErrors.internal(
      res,
      'Failed to retrieve current version info',
      error
    );
  }
});

/**
 * GET /api/version/stats - Get version usage statistics (admin only)
 */
router.get('/version/stats', (req, res) => {
  try {
    const stats = getVersionStats();
    const totalRequests = stats.reduce((sum, stat) => sum + stat.requests, 0);

    const analytics = {
      summary: {
        totalRequests,
        activeVersions: stats.length,
        mostUsedVersion: stats.sort((a, b) => b.requests - a.requests)[0]
          ?.version,
        deprecatedUsage: stats
          .filter(stat => isVersionDeprecated(stat.version))
          .reduce((sum, stat) => sum + stat.requests, 0),
      },
      versions: stats.map(stat => ({
        ...stat,
        percentage:
          totalRequests > 0
            ? ((stat.requests / totalRequests) * 100).toFixed(2)
            : '0.00',
      })),
      platforms: stats.reduce(
        (acc, stat) => {
          Object.entries(stat.platforms).forEach(([platform, count]) => {
            acc[platform] = (acc[platform] || 0) + count;
          });
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return createVersionedResponse(
      res,
      analytics,
      'Version usage statistics retrieved',
      {
        generatedAt: new Date().toISOString(),
        dataRetention: '30 days',
      }
    );
  } catch (error) {
    logger.error(
      '❌ [VERSIONED-API] Error getting version stats:',
      'VersionedApi',
      error
    );
    return commonErrors.internal(
      res,
      'Failed to retrieve version statistics',
      error
    );
  }
});

// ============================================
// MIGRATION UTILITIES ENDPOINTS
// ============================================

/**
 * GET /api/migration/:fromVersion/:toVersion - Get migration guide
 */
router.get('/migration/:fromVersion/:toVersion', (req, res) => {
  try {
    const { fromVersion, toVersion } = req.params;

    const fromInfo = API_VERSIONS[fromVersion];
    const toInfo = API_VERSIONS[toVersion];

    if (!fromInfo || !toInfo) {
      return commonErrors.notFound(
        res,
        'API Version',
        `${fromVersion} or ${toVersion}`
      );
    }

    // Find migration path
    const migration = toInfo.migrations?.find(m => m.from === fromVersion);

    if (!migration) {
      return commonErrors.notFound(
        res,
        'Migration Path',
        `${fromVersion} to ${toVersion}`
      );
    }

    const migrationGuide = {
      from: {
        version: fromVersion,
        features: fromInfo.features,
        status: fromInfo.status,
      },
      to: {
        version: toVersion,
        features: toInfo.features,
        status: toInfo.status,
      },
      migration: {
        guide: migration.guide,
        automated: migration.automated,
        breaking: toInfo.breaking,
        estimatedEffort: toInfo.breaking ? 'high' : 'medium',
      },
      changes: {
        added: toInfo.features.filter(f => !fromInfo.features.includes(f)),
        modified: [], // Would be populated with actual change analysis
        removed: fromInfo.features.filter(f => !toInfo.features.includes(f)),
      },
    };

    return createVersionedResponse(
      res,
      migrationGuide,
      `Migration guide from ${fromVersion} to ${toVersion}`,
      {
        migrationComplexity: toInfo.breaking ? 'high' : 'low',
        documentationUrl: migration.guide,
      }
    );
  } catch (error) {
    logger.error(
      '❌ [VERSIONED-API] Error getting migration guide:',
      'VersionedApi',
      error
    );
    return commonErrors.internal(
      res,
      'Failed to retrieve migration guide',
      error
    );
  }
});

/**
 * POST /api/migration/validate - Validate migration compatibility
 */
router.post('/migration/validate', (req, res) => {
  try {
    const { fromVersion, toVersion, clientCode } = req.body;

    if (!fromVersion || !toVersion) {
      return commonErrors.missingFields(res, ['fromVersion', 'toVersion']);
    }

    const fromInfo = API_VERSIONS[fromVersion];
    const toInfo = API_VERSIONS[toVersion];

    if (!fromInfo || !toInfo) {
      return commonErrors.validation(res, 'Invalid API versions provided');
    }

    // Simulate validation logic
    const validation = {
      compatible: true,
      warnings: [] as string[],
      errors: [] as string[],
      recommendations: [] as string[],
    };

    // Check for breaking changes
    if (toInfo.breaking) {
      validation.warnings.push('Target version contains breaking changes');
      validation.recommendations.push(
        'Review breaking changes documentation carefully'
      );
    }

    // Check deprecation status
    if (fromInfo.status === 'deprecated') {
      validation.warnings.push('Source version is deprecated');
      validation.recommendations.push('Plan migration as soon as possible');
    }

    if (toInfo.status === 'beta') {
      validation.warnings.push('Target version is in beta');
      validation.recommendations.push('Consider waiting for stable release');
    }

    // Basic client code validation (simplified)
    if (clientCode) {
      if (clientCode.includes('/api/v1/') && toVersion.startsWith('v2')) {
        validation.errors.push('API endpoints need to be updated for v2.x');
        validation.recommendations.push(
          'Update all API endpoint URLs to use v2 format'
        );
      }
    }

    validation.compatible = validation.errors.length === 0;

    return createVersionedResponse(
      res,
      validation,
      `Migration validation from ${fromVersion} to ${toVersion}`,
      {
        validatedAt: new Date().toISOString(),
        migrationSupported: !!toInfo.migrations?.some(
          m => m.from === fromVersion
        ),
      }
    );
  } catch (error) {
    logger.error(
      '❌ [VERSIONED-API] Error validating migration:',
      'VersionedApi',
      error
    );
    return commonErrors.internal(res, 'Failed to validate migration', error);
  }
});

// ============================================
// VERSION-AWARE DATA TRANSFORMATION
// ============================================

/**
 * POST /api/transform/:fromVersion/:toVersion - Transform data between versions
 */
router.post('/transform/:fromVersion/:toVersion', (req, res) => {
  try {
    const { fromVersion, toVersion } = req.params;
    const { data } = req.body;

    if (!data) {
      return commonErrors.missingFields(res, ['data']);
    }

    const transformedData = transformDataForVersion(
      data,
      fromVersion,
      toVersion
    );

    return createVersionedResponse(
      res,
      {
        original: data,
        transformed: transformedData,
        transformation: {
          from: fromVersion,
          to: toVersion,
          applied: true,
        },
      },
      `Data transformed from ${fromVersion} to ${toVersion}`,
      {
        transformedAt: new Date().toISOString(),
        dataSize: JSON.stringify(data).length,
      }
    );
  } catch (error) {
    logger.error(
      '❌ [VERSIONED-API] Error transforming data:',
      'VersionedApi',
      error
    );
    return commonErrors.internal(res, 'Failed to transform data', error);
  }
});

// ============================================
// VERSION COMPATIBILITY TESTING
// ============================================

/**
 * GET /api/compatibility/:version - Test version compatibility
 */
router.get('/compatibility/:version', (req, res) => {
  try {
    const { version } = req.params;
    const requestedVersion = detectApiVersion(req);

    const versionInfo = API_VERSIONS[version];
    if (!versionInfo) {
      return commonErrors.notFound(res, 'API Version', version);
    }

    const compatibility = {
      requestedVersion,
      targetVersion: version,
      compatible: true,
      level: 'full' as 'full' | 'partial' | 'none',
      issues: [] as string[],
      features: {
        supported: versionInfo.features,
        deprecated: [] as string[],
        removed: [] as string[],
      },
    };

    // Check compatibility
    if (versionInfo.status === 'sunset') {
      compatibility.compatible = false;
      compatibility.level = 'none';
      compatibility.issues.push('Version is sunset and no longer supported');
    } else if (versionInfo.status === 'deprecated') {
      compatibility.level = 'partial';
      compatibility.issues.push(
        'Version is deprecated and will be sunset soon'
      );
    }

    // Feature compatibility check
    const currentVersionInfo = API_VERSIONS[requestedVersion];
    if (currentVersionInfo) {
      const removedFeatures = currentVersionInfo.features.filter(
        f => !versionInfo.features.includes(f)
      );
      if (removedFeatures.length > 0) {
        compatibility.features.removed = removedFeatures;
        compatibility.issues.push(
          `Some features are not available in ${version}`
        );
      }
    }

    return createVersionedResponse(
      res,
      compatibility,
      `Compatibility check for version ${version}`,
      {
        checkedAt: new Date().toISOString(),
        recommendedAction: compatibility.compatible ? 'none' : 'upgrade',
      }
    );
  } catch (error) {
    logger.error(
      '❌ [VERSIONED-API] Error checking compatibility:',
      'VersionedApi',
      error
    );
    return commonErrors.internal(
      res,
      'Failed to check version compatibility',
      error
    );
  }
});

// ============================================
// HEALTH CHECK WITH VERSION INFO
// ============================================

/**
 * GET /api/health/versioned - Version-aware health check
 */
router.get('/health/versioned', (req, res) => {
  try {
    const requestedVersion = detectApiVersion(req);
    const versionInfo = API_VERSIONS[requestedVersion];

    const health = {
      status: 'healthy',
      version: {
        requested: requestedVersion,
        supported: !!versionInfo,
        deprecated: isVersionDeprecated(requestedVersion),
        sunset: versionInfo?.status === 'sunset',
      },
      features: versionInfo?.features || [],
      timestamp: new Date().toISOString(),
    };

    // Override status for sunset versions
    if (versionInfo?.status === 'sunset') {
      health.status = 'unhealthy';
    }

    return createVersionedResponse(
      res,
      health,
      'Version-aware health check completed',
      {
        uptime: process.uptime(),
        nodeVersion: process.version,
      }
    );
  } catch (error) {
    logger.error(
      '❌ [VERSIONED-API] Error in versioned health check:',
      'VersionedApi',
      error
    );
    return commonErrors.internal(
      res,
      'Failed to perform versioned health check',
      error
    );
  }
});

export default router;
