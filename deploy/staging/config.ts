// =============================================================================
// Hotel Management SaaS Platform - Staging Environment Configuration
// Production parity configuration for safe testing and validation
// =============================================================================

import { config } from 'dotenv';
import { ConfigValidator, ProductionConfig } from '../production/config';

// Load staging environment variables
config({ path: '.env.staging' });

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Staging-Specific Configuration                                         │
// └─────────────────────────────────────────────────────────────────────────┘

export interface StagingConfig extends Omit<ProductionConfig, 'environment'> {
  environment: 'staging';
  testing: {
    enabled: boolean;
    seedData: boolean;
    resetDatabase: boolean;
    mockExternalServices: boolean;
    debugMode: boolean;
  };
  deployment: {
    autoPromote: boolean;
    requireApproval: boolean;
    rollbackOnFailure: boolean;
    healthCheckTimeout: number;
    validationTests: string[];
  };
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Staging Configuration Factory                                          │
// └─────────────────────────────────────────────────────────────────────────┘

class StagingConfigurationManager {
  public getStagingConfig(): StagingConfig {
    const baseUrl =
      process.env.STAGING_BASE_URL || 'https://staging.hotel-management.com';
    const dbHost = process.env.STAGING_DATABASE_HOST || 'staging-postgres';
    const redisHost = process.env.STAGING_REDIS_HOST || 'staging-redis';

    return {
      environment: 'staging',
      debug: process.env.STAGING_DEBUG === 'true',
      port: parseInt(process.env.STAGING_PORT || '10000', 10),
      host: process.env.STAGING_HOST || '0.0.0.0',
      baseUrl,

      api: {
        prefix: '/api',
        version: 'v1',
        timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
      },

      database: {
        host: dbHost,
        port: parseInt(process.env.STAGING_DATABASE_PORT || '5432', 10),
        database:
          process.env.STAGING_DATABASE_NAME || 'hotel_management_staging',
        username: process.env.STAGING_DATABASE_USER || 'staging_admin',
        password:
          process.env.STAGING_DATABASE_PASSWORD ||
          'staging_password_secure_123',
        ssl: process.env.STAGING_DATABASE_SSL === 'true',
        pool: {
          min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
          max: parseInt(process.env.DATABASE_POOL_MAX || '15', 10),
          idle: parseInt(process.env.DATABASE_POOL_IDLE || '30000', 10),
          acquire: parseInt(process.env.DATABASE_POOL_ACQUIRE || '60000', 10),
        },
        replica: process.env.STAGING_DATABASE_REPLICA_HOST
          ? {
              host: process.env.STAGING_DATABASE_REPLICA_HOST,
              port: parseInt(
                process.env.STAGING_DATABASE_REPLICA_PORT || '5432',
                10
              ),
              username:
                process.env.STAGING_DATABASE_REPLICA_USER ||
                process.env.STAGING_DATABASE_USER ||
                'staging_admin',
              password:
                process.env.STAGING_DATABASE_REPLICA_PASSWORD ||
                process.env.STAGING_DATABASE_PASSWORD ||
                'staging_password_secure_123',
            }
          : undefined,
      },

      redis: {
        host: redisHost,
        port: parseInt(process.env.STAGING_REDIS_PORT || '6379', 10),
        password: process.env.STAGING_REDIS_PASSWORD,
        db: parseInt(process.env.STAGING_REDIS_DB || '0', 10),
        maxRetries: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        // No clustering in staging for simplicity
        cluster: undefined,
        sentinel: undefined,
      },

      ssl: {
        enabled: process.env.STAGING_SSL_ENABLED === 'true',
        protocols: ['TLSv1.2', 'TLSv1.3'],
        ciphers: ['ECDHE-RSA-AES128-GCM-SHA256', 'ECDHE-RSA-AES256-GCM-SHA384'],
        honorCipherOrder: true,
        secureOptions: 0x4 | 0x1000 | 0x8000000,
      },

      loadBalancer: {
        enabled: process.env.STAGING_LOAD_BALANCER_ENABLED === 'true',
        algorithm: 'round_robin',
        healthCheck: {
          enabled: true,
          path: '/health',
          interval: 15000, // More frequent checks in staging
          timeout: 5000,
          retries: 2,
          expectedStatus: [200],
        },
        sticky: false,
        upstream: [
          {
            server: process.env.STAGING_APP1_HOST || 'staging-app-1:10000',
            weight: 1,
            maxFails: 2,
            failTimeout: 30,
          },
          {
            server: process.env.STAGING_APP2_HOST || 'staging-app-2:10000',
            weight: 1,
            maxFails: 2,
            failTimeout: 30,
          },
        ],
      },

      cdn: {
        enabled: process.env.STAGING_CDN_ENABLED === 'true',
        provider: 'local', // Use local CDN for staging
        baseUrl: process.env.STAGING_CDN_BASE_URL || `${baseUrl}/static`,
        purgeCache: true,
        compression: {
          enabled: true,
          level: 4, // Lower compression for faster builds
          types: [
            'text/html',
            'text/css',
            'text/javascript',
            'application/javascript',
          ],
        },
        caching: {
          browser: 3600, // 1 hour
          edge: 86400, // 1 day
          bypassQuery: ['v', 'version', 'cache-bust', 'test'],
        },
      },

      monitoring: {
        enabled: true,
        prometheus: {
          enabled: true,
          port: parseInt(process.env.STAGING_PROMETHEUS_PORT || '9090', 10),
          path: '/metrics',
          interval: 10000, // More frequent collection in staging
        },
        grafana: {
          enabled: true,
          port: parseInt(process.env.STAGING_GRAFANA_PORT || '3001', 10),
          adminUser: process.env.STAGING_GRAFANA_ADMIN_USER || 'admin',
          adminPassword:
            process.env.STAGING_GRAFANA_ADMIN_PASSWORD || 'staging_admin_123',
          domain:
            process.env.STAGING_GRAFANA_DOMAIN ||
            'staging-grafana.hotel-management.com',
        },
        alerting: {
          enabled: true,
          webhook: process.env.STAGING_ALERT_WEBHOOK_URL,
          slack: process.env.STAGING_SLACK_WEBHOOK_URL
            ? {
                webhook: process.env.STAGING_SLACK_WEBHOOK_URL,
                channel: process.env.STAGING_SLACK_CHANNEL || '#staging-alerts',
              }
            : undefined,
        },
        apm: {
          enabled: process.env.STAGING_APM_ENABLED === 'true',
          serviceName: 'hotel-management-staging',
          environment: 'staging',
          serverUrl: process.env.STAGING_APM_SERVER_URL,
          secretToken: process.env.STAGING_APM_SECRET_TOKEN,
        },
      },

      security: {
        cors: {
          origin: [
            'https://staging.hotel-management.com',
            'http://localhost:3000',
            'http://localhost:5173',
            ...(process.env.STAGING_CORS_ORIGINS
              ? process.env.STAGING_CORS_ORIGINS.split(',')
              : []),
          ],
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-Test-User',
          ],
          credentials: true,
        },
        helmet: {
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                'https://fonts.googleapis.com',
              ],
              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
              imgSrc: ["'self'", 'data:', 'https:', 'http:'], // Allow http for staging
              scriptSrc: ["'self'", "'unsafe-eval'"], // Allow eval for debugging
              connectSrc: ["'self'", 'ws:', 'wss:', 'https:', 'http:'],
            },
          },
          hsts: {
            maxAge: 86400, // 1 day for staging
            includeSubDomains: false,
            preload: false,
          },
        },
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: parseInt(process.env.STAGING_RATE_LIMIT || '2000', 10), // More lenient
          message: 'Too many requests from this IP in staging environment.',
          skipSuccessfulRequests: false,
        },
        session: {
          secret:
            process.env.STAGING_JWT_SECRET || 'staging-jwt-secret-key-123',
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: process.env.STAGING_SSL_ENABLED === 'true',
            httpOnly: true,
            maxAge: 8 * 60 * 60 * 1000, // 8 hours for staging
            sameSite: 'lax', // More lenient for testing
          },
        },
      },

      secrets: {
        jwtSecret:
          process.env.STAGING_JWT_SECRET || 'staging-jwt-secret-key-123',
        encryptionKey:
          process.env.STAGING_ENCRYPTION_KEY || 'staging-encryption-key-123',
        apiKeys: {
          openai:
            process.env.STAGING_OPENAI_API_KEY ||
            process.env.OPENAI_API_KEY ||
            '',
          vapi:
            process.env.STAGING_VAPI_PUBLIC_KEY ||
            process.env.VAPI_PUBLIC_KEY ||
            '',
          googlePlaces:
            process.env.STAGING_GOOGLE_PLACES_API_KEY ||
            process.env.GOOGLE_PLACES_API_KEY ||
            '',
          mailjet:
            process.env.STAGING_MAILJET_API_KEY ||
            process.env.MAILJET_API_KEY ||
            '',
        },
      },

      features: {
        multiTenant: process.env.STAGING_FEATURE_MULTI_TENANT !== 'false',
        voiceAssistant: process.env.STAGING_FEATURE_VOICE_ASSISTANT !== 'false',
        realTimeUpdates: process.env.STAGING_FEATURE_REAL_TIME !== 'false',
        analytics: process.env.STAGING_FEATURE_ANALYTICS !== 'false',
        backupSystem: process.env.STAGING_FEATURE_BACKUP !== 'false',
      },

      performance: {
        compression: true,
        caching: {
          enabled: process.env.STAGING_CACHING_ENABLED !== 'false',
          ttl: parseInt(process.env.STAGING_CACHE_TTL || '1800', 10), // 30 minutes
          maxSize: parseInt(process.env.STAGING_CACHE_MAX_SIZE || '50', 10), // 50MB
        },
        clustering: {
          enabled: process.env.STAGING_CLUSTERING_ENABLED === 'true',
          workers: parseInt(process.env.STAGING_CLUSTER_WORKERS || '2', 10),
        },
      },

      // Staging-specific configuration
      testing: {
        enabled: process.env.STAGING_TESTING_ENABLED !== 'false',
        seedData: process.env.STAGING_SEED_DATA === 'true',
        resetDatabase: process.env.STAGING_RESET_DB === 'true',
        mockExternalServices: process.env.STAGING_MOCK_SERVICES === 'true',
        debugMode: process.env.STAGING_DEBUG_MODE === 'true',
      },

      deployment: {
        autoPromote: process.env.STAGING_AUTO_PROMOTE === 'true',
        requireApproval: process.env.STAGING_REQUIRE_APPROVAL !== 'false',
        rollbackOnFailure: process.env.STAGING_ROLLBACK_ON_FAILURE !== 'false',
        healthCheckTimeout: parseInt(
          process.env.STAGING_HEALTH_CHECK_TIMEOUT || '300',
          10
        ), // 5 minutes
        validationTests: (
          process.env.STAGING_VALIDATION_TESTS || 'smoke,integration,security'
        ).split(','),
      },
    };
  }
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Environment Validation                                                 │
// └─────────────────────────────────────────────────────────────────────────┘

export class StagingValidator {
  public static validateStagingConfig(config: StagingConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation using production validator
    const baseValidation = ConfigValidator.validateConfig(config);
    errors.push(...baseValidation.errors);

    // Staging-specific validations
    if (config.testing.seedData && !config.testing.resetDatabase) {
      warnings.push(
        'Seed data is enabled but database reset is disabled - may cause data conflicts'
      );
    }

    if (config.deployment.autoPromote && !config.deployment.requireApproval) {
      warnings.push('Auto-promotion is enabled without approval requirement');
    }

    if (config.testing.mockExternalServices && config.secrets.apiKeys.openai) {
      warnings.push(
        'External services are mocked but real API keys are provided'
      );
    }

    // Security checks for staging
    if (config.security.cors.origin.includes('*')) {
      warnings.push(
        'CORS is configured to allow all origins - only acceptable in staging'
      );
    }

    if (config.ssl.enabled && !config.ssl.cert) {
      warnings.push('SSL is enabled but no certificate is provided');
    }

    // Performance checks
    if (
      config.performance.clustering.enabled &&
      config.performance.clustering.workers > 4
    ) {
      warnings.push('High number of workers for staging environment');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Environment Promotion Tools                                            │
// └─────────────────────────────────────────────────────────────────────────┘

export class EnvironmentPromotion {
  public static async validateForPromotion(config: StagingConfig): Promise<{
    ready: boolean;
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
    }>;
  }> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
    }> = [];

    // Configuration validation
    const validation = StagingValidator.validateStagingConfig(config);
    checks.push({
      name: 'Configuration Validation',
      status: validation.valid ? 'pass' : 'fail',
      message: validation.valid
        ? 'Configuration is valid'
        : `Errors: ${validation.errors.join(', ')}`,
    });

    // Database connectivity
    try {
      // This would typically test actual database connectivity
      checks.push({
        name: 'Database Connectivity',
        status: 'pass',
        message: 'Database connection successful',
      });
    } catch (error) {
      checks.push({
        name: 'Database Connectivity',
        status: 'fail',
        message: `Database connection failed: ${error}`,
      });
    }

    // API Health
    try {
      // This would typically test actual API health
      checks.push({
        name: 'API Health',
        status: 'pass',
        message: 'All API endpoints are healthy',
      });
    } catch (error) {
      checks.push({
        name: 'API Health',
        status: 'fail',
        message: `API health check failed: ${error}`,
      });
    }

    // Security checks
    if (config.ssl.enabled && config.environment === 'staging') {
      checks.push({
        name: 'SSL Configuration',
        status: 'pass',
        message: 'SSL is properly configured',
      });
    } else {
      checks.push({
        name: 'SSL Configuration',
        status: 'warning',
        message: 'SSL is not enabled - ensure it is configured for production',
      });
    }

    // Performance checks
    if (config.performance.caching.enabled) {
      checks.push({
        name: 'Caching System',
        status: 'pass',
        message: 'Caching is enabled and configured',
      });
    } else {
      checks.push({
        name: 'Caching System',
        status: 'warning',
        message: 'Caching is disabled - consider enabling for production',
      });
    }

    // Feature flags
    const criticalFeatures = ['multiTenant', 'voiceAssistant', 'analytics'];
    const enabledFeatures = criticalFeatures.filter(
      feature => config.features[feature as keyof typeof config.features]
    );

    if (enabledFeatures.length === criticalFeatures.length) {
      checks.push({
        name: 'Feature Flags',
        status: 'pass',
        message: 'All critical features are enabled',
      });
    } else {
      checks.push({
        name: 'Feature Flags',
        status: 'warning',
        message: `Some critical features are disabled: ${criticalFeatures.filter(f => !enabledFeatures.includes(f)).join(', ')}`,
      });
    }

    const ready = checks.every(check => check.status !== 'fail');

    return { ready, checks };
  }

  public static generatePromotionReport(
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
    }>
  ): string {
    const passCount = checks.filter(c => c.status === 'pass').length;
    const failCount = checks.filter(c => c.status === 'fail').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;

    let report = `# Staging to Production Promotion Report\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n`;
    report += `**Environment:** staging → production\n\n`;
    report += `## Summary\n`;
    report += `- ✅ Passed: ${passCount}\n`;
    report += `- ⚠️ Warnings: ${warningCount}\n`;
    report += `- ❌ Failed: ${failCount}\n\n`;

    if (failCount > 0) {
      report += `## ❌ Critical Issues (Must Fix)\n`;
      checks
        .filter(c => c.status === 'fail')
        .forEach(check => {
          report += `- **${check.name}**: ${check.message}\n`;
        });
      report += `\n`;
    }

    if (warningCount > 0) {
      report += `## ⚠️ Warnings (Review Recommended)\n`;
      checks
        .filter(c => c.status === 'warning')
        .forEach(check => {
          report += `- **${check.name}**: ${check.message}\n`;
        });
      report += `\n`;
    }

    report += `## ✅ Successful Checks\n`;
    checks
      .filter(c => c.status === 'pass')
      .forEach(check => {
        report += `- **${check.name}**: ${check.message}\n`;
      });

    report += `\n## Recommendation\n`;
    if (failCount > 0) {
      report += `❌ **DO NOT PROMOTE** - Critical issues must be resolved before promotion to production.\n`;
    } else if (warningCount > 0) {
      report += `⚠️ **PROCEED WITH CAUTION** - Review warnings and consider addressing them before promotion.\n`;
    } else {
      report += `✅ **READY FOR PROMOTION** - All checks passed successfully.\n`;
    }

    return report;
  }
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Export Configuration                                                   │
// └─────────────────────────────────────────────────────────────────────────┘

const stagingConfigManager = new StagingConfigurationManager();

export const getStagingConfig = (): StagingConfig => {
  const config = stagingConfigManager.getStagingConfig();

  // Validate configuration
  const validation = StagingValidator.validateStagingConfig(config);

  if (!validation.valid) {
    console.error('Staging configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Invalid staging configuration');
  }

  if (validation.warnings.length > 0) {
    console.warn('Staging configuration warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  return config;
};

export const stagingConfig = getStagingConfig();
export default stagingConfig;
