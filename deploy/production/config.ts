// =============================================================================
// Hotel Management SaaS Platform - Production Configuration Management
// Comprehensive production configuration with security and optimization
// =============================================================================

import { config as dotenvConfig } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenvConfig();

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Environment Configuration Interface                                     │
// └─────────────────────────────────────────────────────────────────────────┘

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  pool: {
    min: number;
    max: number;
    idle: number;
    acquire: number;
  };
  replica?: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  maxRetries: number;
  retryDelayOnFailover: number;
  enableReadyCheck: boolean;
  cluster?: {
    enableAutoPipelining: boolean;
    redisOptions: {
      password?: string;
    };
    nodes: Array<{
      host: string;
      port: number;
    }>;
  };
  sentinel?: {
    name: string;
    sentinels: Array<{
      host: string;
      port: number;
    }>;
  };
}

export interface SSLConfig {
  enabled: boolean;
  cert?: string;
  key?: string;
  ca?: string;
  passphrase?: string;
  dhparam?: string;
  protocols: string[];
  ciphers: string[];
  honorCipherOrder: boolean;
  secureOptions: number;
}

export interface LoadBalancerConfig {
  enabled: boolean;
  algorithm: 'round_robin' | 'least_conn' | 'ip_hash' | 'random';
  healthCheck: {
    enabled: boolean;
    path: string;
    interval: number;
    timeout: number;
    retries: number;
    expectedStatus: number[];
  };
  sticky: boolean;
  upstream: Array<{
    server: string;
    weight: number;
    maxFails: number;
    failTimeout: number;
  }>;
}

export interface CDNConfig {
  enabled: boolean;
  provider: 'cloudflare' | 'aws' | 'azure' | 'local';
  baseUrl: string;
  apiKey?: string;
  zoneId?: string;
  purgeCache: boolean;
  compression: {
    enabled: boolean;
    level: number;
    types: string[];
  };
  caching: {
    browser: number;
    edge: number;
    bypassQuery: string[];
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  prometheus: {
    enabled: boolean;
    port: number;
    path: string;
    interval: number;
  };
  grafana: {
    enabled: boolean;
    port: number;
    adminUser: string;
    adminPassword: string;
    domain: string;
  };
  alerting: {
    enabled: boolean;
    webhook?: string;
    slack?: {
      webhook: string;
      channel: string;
    };
    email?: {
      smtp: string;
      from: string;
      to: string[];
    };
  };
  apm: {
    enabled: boolean;
    serviceName: string;
    environment: string;
    serverUrl?: string;
    secretToken?: string;
  };
}

export interface SecurityConfig {
  cors: {
    origin: string | string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
  helmet: {
    contentSecurityPolicy: {
      directives: Record<string, string[]>;
    };
    hsts: {
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
  };
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
    skipSuccessfulRequests: boolean;
  };
  session: {
    secret: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie: {
      secure: boolean;
      httpOnly: boolean;
      maxAge: number;
      sameSite: 'strict' | 'lax' | 'none';
    };
  };
}

export interface ProductionConfig {
  environment: string;
  debug: boolean;
  port: number;
  host: string;
  baseUrl: string;
  api: {
    prefix: string;
    version: string;
    timeout: number;
  };
  database: DatabaseConfig;
  redis: RedisConfig;
  ssl: SSLConfig;
  loadBalancer: LoadBalancerConfig;
  cdn: CDNConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  secrets: {
    jwtSecret: string;
    encryptionKey: string;
    apiKeys: Record<string, string>;
  };
  features: {
    multiTenant: boolean;
    voiceAssistant: boolean;
    realTimeUpdates: boolean;
    analytics: boolean;
    backupSystem: boolean;
  };
  performance: {
    compression: boolean;
    caching: {
      enabled: boolean;
      ttl: number;
      maxSize: number;
    };
    clustering: {
      enabled: boolean;
      workers: number;
    };
  };
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Secret Management                                                       │
// └─────────────────────────────────────────────────────────────────────────┘

class SecretManager {
  private secrets: Map<string, string> = new Map();

  constructor() {
    this.loadSecrets();
  }

  private loadSecrets(): void {
    // Load from environment variables
    const envSecrets = [
      'JWT_SECRET_KEY',
      'ENCRYPTION_KEY',
      'DATABASE_PASSWORD',
      'REDIS_PASSWORD',
      'OPENAI_API_KEY',
      'VAPI_PUBLIC_KEY',
      'VAPI_ASSISTANT_ID',
      'SLACK_WEBHOOK_URL',
      'MAILJET_API_KEY',
      'GOOGLE_PLACES_API_KEY',
    ];

    envSecrets.forEach(secret => {
      const value = process.env[secret];
      if (value) {
        this.secrets.set(secret, value);
      }
    });

    // Load from secure files (if available)
    try {
      const secretsPath = join(process.cwd(), 'secrets', 'production.json');
      const secretsFile = readFileSync(secretsPath, 'utf8');
      const fileSecrets = JSON.parse(secretsFile);

      Object.entries(fileSecrets).forEach(([key, value]) => {
        this.secrets.set(key, value as string);
      });
    } catch (error) {
      // Secrets file not found or invalid, continue with env vars only
      console.warn('Secrets file not found, using environment variables only');
    }
  }

  public getSecret(key: string): string {
    const secret = this.secrets.get(key);
    if (!secret) {
      throw new Error(`Secret '${key}' not found`);
    }
    return secret;
  }

  public hasSecret(key: string): boolean {
    return this.secrets.has(key);
  }

  public getSecretOrDefault(key: string, defaultValue: string): string {
    return this.secrets.get(key) || defaultValue;
  }
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ SSL Certificate Management                                              │
// └─────────────────────────────────────────────────────────────────────────┘

class SSLManager {
  private static instance: SSLManager;
  private certificates: Map<
    string,
    { cert: string; key: string; ca?: string }
  > = new Map();

  private constructor() {
    this.loadCertificates();
  }

  public static getInstance(): SSLManager {
    if (!SSLManager.instance) {
      SSLManager.instance = new SSLManager();
    }
    return SSLManager.instance;
  }

  private loadCertificates(): void {
    try {
      // Load production certificates
      const certPath =
        process.env.SSL_CERT_PATH || '/etc/ssl/certs/hotel-management.crt';
      const keyPath =
        process.env.SSL_KEY_PATH || '/etc/ssl/private/hotel-management.key';
      const caPath = process.env.SSL_CA_PATH;

      const cert = readFileSync(certPath, 'utf8');
      const key = readFileSync(keyPath, 'utf8');
      const ca = caPath ? readFileSync(caPath, 'utf8') : undefined;

      this.certificates.set('production', { cert, key, ca });
    } catch (error) {
      console.warn('SSL certificates not found, SSL will be disabled');
    }
  }

  public getCertificate(
    domain: string = 'production'
  ): { cert: string; key: string; ca?: string } | null {
    return this.certificates.get(domain) || null;
  }

  public hasCertificate(domain: string = 'production'): boolean {
    return this.certificates.has(domain);
  }
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Configuration Factory                                                   │
// └─────────────────────────────────────────────────────────────────────────┘

class ConfigurationManager {
  private secretManager: SecretManager;
  private sslManager: SSLManager;

  constructor() {
    this.secretManager = new SecretManager();
    this.sslManager = SSLManager.getInstance();
  }

  public getProductionConfig(): ProductionConfig {
    const isProduction = process.env.NODE_ENV === 'production';
    const sslEnabled = this.sslManager.hasCertificate();
    const sslCert = this.sslManager.getCertificate();

    return {
      environment: 'production',
      debug: false,
      port: parseInt(process.env.PORT || '10000', 10),
      host: process.env.HOST || '0.0.0.0',
      baseUrl: process.env.BASE_URL || 'https://hotel-management.com',

      api: {
        prefix: '/api',
        version: 'v1',
        timeout: 30000,
      },

      database: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        database: process.env.DATABASE_NAME || 'hotel_management_prod',
        username: process.env.DATABASE_USER || 'hotel_admin',
        password: this.secretManager.getSecret('DATABASE_PASSWORD'),
        ssl: isProduction,
        pool: {
          min: 2,
          max: 20,
          idle: 30000,
          acquire: 60000,
        },
        replica: process.env.DATABASE_REPLICA_HOST
          ? {
            host: process.env.DATABASE_REPLICA_HOST,
            port: parseInt(process.env.DATABASE_REPLICA_PORT || '5432', 10),
            username:
              process.env.DATABASE_REPLICA_USER ||
              process.env.DATABASE_USER ||
              'hotel_admin',
            password: this.secretManager.getSecretOrDefault(
              'DATABASE_REPLICA_PASSWORD',
              this.secretManager.getSecret('DATABASE_PASSWORD')
            ),
          }
          : undefined,
      },

      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: this.secretManager.getSecretOrDefault('REDIS_PASSWORD', ''),
        db: 0,
        maxRetries: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        cluster:
          process.env.REDIS_CLUSTER_ENABLED === 'true'
            ? {
              enableAutoPipelining: true,
              redisOptions: {
                password: this.secretManager.getSecretOrDefault(
                  'REDIS_PASSWORD',
                  ''
                ),
              },
              nodes: [
                {
                  host: process.env.REDIS_NODE1_HOST || 'redis-1',
                  port: 6379,
                },
                {
                  host: process.env.REDIS_NODE2_HOST || 'redis-2',
                  port: 6379,
                },
                {
                  host: process.env.REDIS_NODE3_HOST || 'redis-3',
                  port: 6379,
                },
              ],
            }
            : undefined,
        sentinel:
          process.env.REDIS_SENTINEL_ENABLED === 'true'
            ? {
              name: 'hotel-redis',
              sentinels: [
                {
                  host:
                    process.env.REDIS_SENTINEL1_HOST || 'redis-sentinel-1',
                  port: 26379,
                },
                {
                  host:
                    process.env.REDIS_SENTINEL2_HOST || 'redis-sentinel-2',
                  port: 26379,
                },
                {
                  host:
                    process.env.REDIS_SENTINEL3_HOST || 'redis-sentinel-3',
                  port: 26379,
                },
              ],
            }
            : undefined,
      },

      ssl: {
        enabled: sslEnabled,
        cert: sslCert?.cert,
        key: sslCert?.key,
        ca: sslCert?.ca,
        protocols: ['TLSv1.2', 'TLSv1.3'],
        ciphers: [
          'ECDHE-RSA-AES128-GCM-SHA256',
          'ECDHE-RSA-AES256-GCM-SHA384',
          'ECDHE-RSA-AES128-SHA256',
          'ECDHE-RSA-AES256-SHA384',
        ],
        honorCipherOrder: true,
        secureOptions: 0x4 | 0x1000 | 0x8000000, // SSL_OP_NO_SSLv2 | SSL_OP_NO_SSLv3 | SSL_OP_NO_TLSv1
      },

      loadBalancer: {
        enabled: process.env.LOAD_BALANCER_ENABLED === 'true',
        algorithm:
          (process.env.LOAD_BALANCER_ALGORITHM as any) || 'round_robin',
        healthCheck: {
          enabled: true,
          path: '/health',
          interval: 30000,
          timeout: 5000,
          retries: 3,
          expectedStatus: [200],
        },
        sticky: process.env.LOAD_BALANCER_STICKY === 'true',
        upstream: [
          {
            server: process.env.APP1_HOST || 'app-1:10000',
            weight: 1,
            maxFails: 3,
            failTimeout: 30,
          },
          {
            server: process.env.APP2_HOST || 'app-2:10000',
            weight: 1,
            maxFails: 3,
            failTimeout: 30,
          },
        ],
      },

      cdn: {
        enabled: process.env.CDN_ENABLED === 'true',
        provider: (process.env.CDN_PROVIDER as any) || 'cloudflare',
        baseUrl: process.env.CDN_BASE_URL || 'https://cdn.hotel-management.com',
        apiKey: this.secretManager.getSecretOrDefault('CDN_API_KEY', ''),
        zoneId: process.env.CDN_ZONE_ID,
        purgeCache: true,
        compression: {
          enabled: true,
          level: 6,
          types: [
            'text/html',
            'text/css',
            'text/javascript',
            'application/javascript',
            'application/json',
          ],
        },
        caching: {
          browser: 86400, // 1 day
          edge: 604800, // 1 week
          bypassQuery: ['v', 'version', 'cache-bust'],
        },
      },

      monitoring: {
        enabled: true,
        prometheus: {
          enabled: true,
          port: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
          path: '/metrics',
          interval: 15000,
        },
        grafana: {
          enabled: true,
          port: parseInt(process.env.GRAFANA_PORT || '3001', 10),
          adminUser: process.env.GRAFANA_ADMIN_USER || 'admin',
          adminPassword: this.secretManager.getSecretOrDefault(
            'GRAFANA_ADMIN_PASSWORD',
            'admin'
          ),
          domain: process.env.GRAFANA_DOMAIN || 'grafana.hotel-management.com',
        },
        alerting: {
          enabled: true,
          webhook: this.secretManager.getSecretOrDefault(
            'ALERT_WEBHOOK_URL',
            ''
          ),
          slack: this.secretManager.hasSecret('SLACK_WEBHOOK_URL')
            ? {
              webhook: this.secretManager.getSecret('SLACK_WEBHOOK_URL'),
              channel: process.env.SLACK_CHANNEL || '#alerts',
            }
            : undefined,
          email: process.env.SMTP_HOST
            ? {
              smtp: process.env.SMTP_HOST,
              from: process.env.SMTP_FROM || 'alerts@hotel-management.com',
              to: (process.env.ALERT_EMAILS || '').split(',').filter(Boolean),
            }
            : undefined,
        },
        apm: {
          enabled: process.env.APM_ENABLED === 'true',
          serviceName: 'hotel-management-api',
          environment: 'production',
          serverUrl: process.env.APM_SERVER_URL,
          secretToken: this.secretManager.getSecretOrDefault(
            'APM_SECRET_TOKEN',
            ''
          ),
        },
      },

      security: {
        cors: {
          origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',')
            : ['https://hotel-management.com'],
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
              imgSrc: ["'self'", 'data:', 'https:'],
              scriptSrc: ["'self'"],
              connectSrc: ["'self'", 'wss:', 'https:'],
            },
          },
          hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          },
        },
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 1000, // limit each IP to 1000 requests per windowMs
          message: 'Too many requests from this IP, please try again later.',
          skipSuccessfulRequests: false,
        },
        session: {
          secret: this.secretManager.getSecret('JWT_SECRET_KEY'),
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: isProduction && sslEnabled,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'strict',
          },
        },
      },

      secrets: {
        jwtSecret: this.secretManager.getSecret('JWT_SECRET_KEY'),
        encryptionKey: this.secretManager.getSecret('ENCRYPTION_KEY'),
        apiKeys: {
          openai: this.secretManager.getSecret('OPENAI_API_KEY'),
          vapi: this.secretManager.getSecret('VAPI_PUBLIC_KEY'),
          googlePlaces: this.secretManager.getSecretOrDefault(
            'GOOGLE_PLACES_API_KEY',
            ''
          ),
          mailjet: this.secretManager.getSecretOrDefault('MAILJET_API_KEY', ''),
        },
      },

      features: {
        multiTenant: process.env.FEATURE_MULTI_TENANT !== 'false',
        voiceAssistant: process.env.FEATURE_VOICE_ASSISTANT !== 'false',
        realTimeUpdates: process.env.FEATURE_REAL_TIME !== 'false',
        analytics: process.env.FEATURE_ANALYTICS !== 'false',
        backupSystem: process.env.FEATURE_BACKUP !== 'false',
      },

      performance: {
        compression: true,
        caching: {
          enabled: true,
          ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
          maxSize: parseInt(process.env.CACHE_MAX_SIZE || '100', 10), // MB
        },
        clustering: {
          enabled: process.env.CLUSTERING_ENABLED === 'true',
          workers:
            parseInt(process.env.CLUSTER_WORKERS || '0', 10) ||
            require('os').cpus().length,
        },
      },
    };
  }

  public getStagingConfig(): Partial<ProductionConfig> {
    const baseConfig = this.getProductionConfig();

    return {
      ...baseConfig,
      environment: 'staging',
      debug: true,
      baseUrl:
        process.env.STAGING_BASE_URL || 'https://staging.hotel-management.com',
      database: {
        ...baseConfig.database,
        database:
          process.env.STAGING_DATABASE_NAME || 'hotel_management_staging',
        pool: {
          min: 1,
          max: 10,
          idle: 30000,
          acquire: 60000,
        },
      },
      security: {
        ...baseConfig.security,
        cors: {
          ...baseConfig.security.cors,
          origin: [
            'https://staging.hotel-management.com',
            'http://localhost:3000',
          ],
        },
        rateLimit: {
          ...baseConfig.security.rateLimit,
          max: 2000, // More lenient for staging
        },
      },
      performance: {
        ...baseConfig.performance,
        clustering: {
          enabled: false,
          workers: 1,
        },
      },
    };
  }

  public getDevelopmentConfig(): Partial<ProductionConfig> {
    const baseConfig = this.getProductionConfig();

    return {
      ...baseConfig,
      environment: 'development',
      debug: true,
      port: 3000,
      baseUrl: 'http://localhost:3000',
      ssl: {
        ...baseConfig.ssl,
        enabled: false,
      },
      database: {
        ...baseConfig.database,
        database: 'hotel_management_dev',
        ssl: false,
        pool: {
          min: 1,
          max: 5,
          idle: 30000,
          acquire: 60000,
        },
      },
      redis: {
        ...baseConfig.redis,
        password: undefined,
        cluster: undefined,
        sentinel: undefined,
      },
      security: {
        ...baseConfig.security,
        cors: {
          ...baseConfig.security.cors,
          origin: ['http://localhost:3000', 'http://localhost:5173'],
        },
        rateLimit: {
          ...baseConfig.security.rateLimit,
          max: 10000, // Very lenient for development
        },
        session: {
          ...baseConfig.security.session,
          cookie: {
            ...baseConfig.security.session.cookie,
            secure: false,
          },
        },
      },
      performance: {
        ...baseConfig.performance,
        clustering: {
          enabled: false,
          workers: 1,
        },
        caching: {
          ...baseConfig.performance.caching,
          enabled: false, // Disable caching in development
        },
      },
    };
  }
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Configuration Validation                                               │
// └─────────────────────────────────────────────────────────────────────────┘

export class ConfigValidator {
  public static validateConfig(config: ProductionConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate required secrets
    if (!config.secrets.jwtSecret) {
      errors.push('JWT_SECRET_KEY is required');
    }

    if (!config.secrets.encryptionKey) {
      errors.push('ENCRYPTION_KEY is required');
    }

    // Validate database configuration
    if (
      !config.database.host ||
      !config.database.database ||
      !config.database.username
    ) {
      errors.push('Database configuration is incomplete');
    }

    // Validate SSL configuration in production
    if (
      config.environment === 'production' &&
      config.ssl.enabled &&
      (!config.ssl.cert || !config.ssl.key)
    ) {
      errors.push('SSL is enabled but certificates are missing');
    }

    // Validate API keys if features are enabled
    if (
      config.features.voiceAssistant &&
      (!config.secrets.apiKeys.openai || !config.secrets.apiKeys.vapi)
    ) {
      errors.push('Voice assistant is enabled but API keys are missing');
    }

    // Validate monitoring configuration
    if (
      config.monitoring.enabled &&
      !config.monitoring.prometheus.enabled &&
      !config.monitoring.grafana.enabled
    ) {
      errors.push(
        'Monitoring is enabled but no monitoring services are configured'
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ Export Configuration                                                   │
// └─────────────────────────────────────────────────────────────────────────┘

const configManager = new ConfigurationManager();

export const getConfig = (): ProductionConfig => {
  const environment = process.env.NODE_ENV || 'development';

  let config: ProductionConfig;

  switch (environment) {
    case 'production':
      config = configManager.getProductionConfig();
      break;
    case 'staging':
      config = configManager.getStagingConfig() as ProductionConfig;
      break;
    case 'development':
    default:
      config = configManager.getDevelopmentConfig() as ProductionConfig;
      break;
  }

  // Validate configuration
  const validation = ConfigValidator.validateConfig(config);
  if (!validation.valid) {
    console.error('Configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));

    if (environment === 'production') {
      throw new Error('Invalid production configuration');
    } else {
      console.warn('Configuration warnings in non-production environment');
    }
  }

  return config;
};

export const config = getConfig();
export default config;
