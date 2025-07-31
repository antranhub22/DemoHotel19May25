// ✅ NEW: Phase 5 - Production configuration
export interface ProductionConfig {
  server: {
    port: number;
    host: string;
    trustProxy: boolean;
    compression: boolean;
    cors: {
      enabled: boolean;
      origin: string[];
      credentials: boolean;
    };
  };
  database: {
    connectionPool: {
      min: number;
      max: number;
      acquireTimeoutMillis: number;
      createTimeoutMillis: number;
      destroyTimeoutMillis: number;
      idleTimeoutMillis: number;
      reapIntervalMillis: number;
      createRetryIntervalMillis: number;
    };
    ssl: boolean;
    sslRejectUnauthorized: boolean;
  };
  security: {
    rateLimiting: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
    cors: {
      enabled: boolean;
      origin: string[];
      credentials: boolean;
    };
    helmet: {
      enabled: boolean;
      contentSecurityPolicy: boolean;
      hsts: boolean;
    };
    inputSanitization: {
      enabled: boolean;
      maxInputLength: number;
    };
  };
  logging: {
    level: string;
    format: string;
    transports: string[];
    enableConsole: boolean;
    enableFile: boolean;
    logDirectory: string;
  };
  monitoring: {
    enabled: boolean;
    metrics: {
      enabled: boolean;
      port: number;
    };
    healthCheck: {
      enabled: boolean;
      interval: number;
    };
    performance: {
      enabled: boolean;
      samplingRate: number;
    };
  };
  caching: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
    cleanupInterval: number;
  };
  loadBalancing: {
    enabled: boolean;
    stickySessions: boolean;
    healthCheckPath: string;
    instanceId: string;
    totalNodes: number;
  };
}

// ✅ NEW: Phase 5 - Default production configuration
export const DEFAULT_PRODUCTION_CONFIG: ProductionConfig = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    trustProxy: process.env.TRUST_PROXY === 'true',
    compression: true,
    cors: {
      enabled: true,
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
  },
  database: {
    connectionPool: {
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '30000'),
      createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT || '30000'),
      destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT || '5000'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000'),
      createRetryIntervalMillis: parseInt(
        process.env.DB_CREATE_RETRY_INTERVAL || '200'
      ),
    },
    ssl: process.env.DB_SSL === 'true',
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  },
  security: {
    rateLimiting: {
      enabled: true,
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    },
    cors: {
      enabled: true,
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
    helmet: {
      enabled: true,
      contentSecurityPolicy: true,
      hsts: true,
    },
    inputSanitization: {
      enabled: true,
      maxInputLength: parseInt(process.env.MAX_INPUT_LENGTH || '10000'),
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    transports: process.env.LOG_TRANSPORTS?.split(',') || ['console'],
    enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    logDirectory: process.env.LOG_DIRECTORY || './logs',
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      port: parseInt(process.env.METRICS_PORT || '9090'),
    },
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
    },
    performance: {
      enabled: process.env.PERFORMANCE_MONITORING_ENABLED === 'true',
      samplingRate: parseFloat(process.env.PERFORMANCE_SAMPLING_RATE || '0.1'),
    },
  },
  caching: {
    enabled: process.env.CACHING_ENABLED !== 'false',
    ttl: parseInt(process.env.CACHE_TTL || '300000'), // 5 minutes
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
    cleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL || '600000'), // 10 minutes
  },
  loadBalancing: {
    enabled: process.env.LOAD_BALANCING_ENABLED === 'true',
    stickySessions: process.env.STICKY_SESSIONS === 'true',
    healthCheckPath: process.env.HEALTH_CHECK_PATH || '/health',
    instanceId: process.env.INSTANCE_ID || `node-${Date.now()}`,
    totalNodes: parseInt(process.env.TOTAL_NODES || '1'),
  },
};

// ✅ NEW: Phase 5 - Environment-specific configurations
export const getProductionConfig = (): ProductionConfig => {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return {
        ...DEFAULT_PRODUCTION_CONFIG,
        server: {
          ...DEFAULT_PRODUCTION_CONFIG.server,
          port: parseInt(process.env.PORT || '3000'),
          host: process.env.HOST || '0.0.0.0',
        },
        security: {
          ...DEFAULT_PRODUCTION_CONFIG.security,
          rateLimiting: {
            ...DEFAULT_PRODUCTION_CONFIG.security.rateLimiting,
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '50'),
          },
        },
        logging: {
          ...DEFAULT_PRODUCTION_CONFIG.logging,
          level: 'warn',
          enableConsole: false,
          enableFile: true,
        },
      };

    case 'staging':
      return {
        ...DEFAULT_PRODUCTION_CONFIG,
        security: {
          ...DEFAULT_PRODUCTION_CONFIG.security,
          rateLimiting: {
            ...DEFAULT_PRODUCTION_CONFIG.security.rateLimiting,
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'),
          },
        },
        logging: {
          ...DEFAULT_PRODUCTION_CONFIG.logging,
          level: 'info',
          enableConsole: true,
          enableFile: true,
        },
      };

    case 'development':
    default:
      return {
        ...DEFAULT_PRODUCTION_CONFIG,
        security: {
          ...DEFAULT_PRODUCTION_CONFIG.security,
          rateLimiting: {
            ...DEFAULT_PRODUCTION_CONFIG.security.rateLimiting,
            enabled: false,
          },
        },
        logging: {
          ...DEFAULT_PRODUCTION_CONFIG.logging,
          level: 'debug',
          enableConsole: true,
          enableFile: false,
        },
        monitoring: {
          ...DEFAULT_PRODUCTION_CONFIG.monitoring,
          enabled: false,
        },
      };
  }
};

// ✅ NEW: Phase 5 - Configuration validation
export const validateProductionConfig = (
  config: ProductionConfig
): string[] => {
  const errors: string[] = [];

  // Validate server configuration
  if (config.server.port < 1 || config.server.port > 65535) {
    errors.push('Invalid server port');
  }

  // Validate database configuration
  if (config.database.connectionPool.min < 1) {
    errors.push('Database pool min connections must be at least 1');
  }

  if (config.database.connectionPool.max < config.database.connectionPool.min) {
    errors.push(
      'Database pool max connections must be greater than min connections'
    );
  }

  // Validate security configuration
  if (config.security.rateLimiting.maxRequests < 1) {
    errors.push('Rate limit max requests must be at least 1');
  }

  if (config.security.inputSanitization.maxInputLength < 1) {
    errors.push('Max input length must be at least 1');
  }

  // Validate monitoring configuration
  if (
    config.monitoring.metrics.port < 1 ||
    config.monitoring.metrics.port > 65535
  ) {
    errors.push('Invalid metrics port');
  }

  // Validate caching configuration
  if (config.caching.ttl < 1000) {
    errors.push('Cache TTL must be at least 1000ms');
  }

  if (config.caching.maxSize < 1) {
    errors.push('Cache max size must be at least 1');
  }

  return errors;
};

// ✅ NEW: Phase 5 - Configuration utilities
export const productionUtils = {
  // ✅ NEW: Phase 5 - Get environment-specific config
  getConfig(): ProductionConfig {
    const config = getProductionConfig();
    const errors = validateProductionConfig(config);

    if (errors.length > 0) {
      throw new Error(`Invalid production configuration: ${errors.join(', ')}`);
    }

    return config;
  },

  // ✅ NEW: Phase 5 - Check if running in production
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },

  // ✅ NEW: Phase 5 - Check if load balancing is enabled
  isLoadBalancingEnabled(): boolean {
    const config = this.getConfig();
    return config.loadBalancing.enabled;
  },

  // ✅ NEW: Phase 5 - Get instance information
  getInstanceInfo(): {
    instanceId: string;
    totalNodes: number;
    isLeader: boolean;
  } {
    const config = this.getConfig();
    return {
      instanceId: config.loadBalancing.instanceId,
      totalNodes: config.loadBalancing.totalNodes,
      isLeader: process.env.IS_LEADER === 'true',
    };
  },

  // ✅ NEW: Phase 5 - Validate environment variables
  validateEnvironment(): string[] {
    const errors: string[] = [];
    const requiredVars = ['DATABASE_URL', 'NODE_ENV'];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    }

    return errors;
  },
};
