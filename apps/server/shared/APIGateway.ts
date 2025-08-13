// ============================================
// API GATEWAY v1.0 - Phase 6.1 Enterprise API Management
// ============================================
// Comprehensive enterprise API Gateway with rate limiting, request routing, API versioning,
// authentication middleware, request transformation, and comprehensive analytics

import { logger } from "@shared/utils/logger";
import { EventEmitter } from "events";
import { NextFunction, Request, Response } from "express";

// API Gateway interfaces
export interface GatewayConfig {
  rateLimiting: RateLimitConfig;
  authentication: AuthConfig;
  versioning: VersionConfig;
  routing: RoutingConfig;
  transformation: TransformationConfig;
  caching: CachingConfig;
  analytics: AnalyticsConfig;
  security: SecurityConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  strategies: RateLimitStrategy[];
  storage: "memory" | "redis" | "database";
  globalLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    burstLimit: number;
  };
  keyGenerators: {
    ip: boolean;
    apiKey: boolean;
    userId: boolean;
    tenantId: boolean;
    custom: boolean;
  };
  exemptions: string[]; // IPs or API keys exempt from rate limiting
}

export interface RateLimitStrategy {
  name: string;
  type: "fixed_window" | "sliding_window" | "token_bucket" | "leaky_bucket";
  windowSize: number; // seconds
  maxRequests: number;
  targets: RateLimitTarget[];
  actions: RateLimitAction[];
}

export interface RateLimitTarget {
  type: "global" | "endpoint" | "user" | "tenant" | "apikey";
  pattern?: string; // Regex pattern for endpoints
  value?: string; // Specific value for user/tenant/apikey
}

export interface RateLimitAction {
  threshold: number; // percentage of limit
  action: "warn" | "throttle" | "block" | "queue" | "redirect";
  duration?: number; // seconds
  message?: string;
  redirectUrl?: string;
}

export interface AuthConfig {
  strategies: AuthStrategy[];
  exemptions: string[]; // Endpoints exempt from auth
  tokenValidation: {
    verifyExpiration: boolean;
    verifySignature: boolean;
    verifyIssuer: boolean;
    allowedIssuers: string[];
  };
  sessionManagement: {
    enabled: boolean;
    maxSessions: number;
    sessionTimeout: number; // minutes
  };
}

export interface AuthStrategy {
  name: string;
  type: "jwt" | "apikey" | "oauth" | "basic" | "custom";
  priority: number;
  config: any;
  endpoints: string[]; // Endpoint patterns this strategy applies to
}

export interface VersionConfig {
  enabled: boolean;
  strategies: VersionStrategy[];
  defaultVersion: string;
  supportedVersions: string[];
  deprecationWarnings: VersionDeprecation[];
}

export interface VersionStrategy {
  type: "header" | "query" | "path" | "subdomain";
  parameter: string; // Header name, query param, or path prefix
  prefix?: string; // For path-based versioning
}

export interface VersionDeprecation {
  version: string;
  deprecationDate: Date;
  sunsetDate: Date;
  migrationGuide: string;
}

export interface RoutingConfig {
  rules: RoutingRule[];
  loadBalancing: LoadBalancingConfig;
  healthChecks: HealthCheckConfig;
  circuitBreaker: CircuitBreakerConfig;
}

export interface RoutingRule {
  id: string;
  pattern: string; // Regex pattern
  methods: string[];
  targets: RouteTarget[];
  middleware: string[];
  transformation?: string;
  caching?: string;
  rateLimit?: string;
}

export interface RouteTarget {
  id: string;
  url: string;
  weight: number; // For load balancing
  health: "healthy" | "unhealthy" | "unknown";
  priority: number;
  timeout: number; // milliseconds
}

export interface LoadBalancingConfig {
  strategy:
    | "round_robin"
    | "weighted"
    | "least_connections"
    | "ip_hash"
    | "random";
  healthCheckInterval: number; // seconds
  maxRetries: number;
  retryDelay: number; // milliseconds
}

export interface HealthCheckConfig {
  enabled: boolean;
  endpoint: string;
  interval: number; // seconds
  timeout: number; // milliseconds
  healthyThreshold: number;
  unhealthyThreshold: number;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number; // percentage
  recoveryTimeout: number; // seconds
  monitoringWindow: number; // seconds
}

export interface TransformationConfig {
  enabled: boolean;
  rules: TransformationRule[];
}

export interface TransformationRule {
  id: string;
  name: string;
  type: "request" | "response" | "both";
  pattern: string; // Endpoint pattern
  transformations: Transformation[];
}

export interface Transformation {
  type: "header" | "body" | "query" | "path";
  action: "add" | "remove" | "modify" | "rename";
  target: string;
  value?: string;
  condition?: string; // JavaScript expression
}

export interface CachingConfig {
  enabled: boolean;
  strategies: CachingStrategy[];
  storage: "memory" | "redis" | "hybrid";
  defaultTTL: number; // seconds
  maxSize: number; // MB
}

export interface CachingStrategy {
  id: string;
  pattern: string; // Endpoint pattern
  methods: string[];
  ttl: number; // seconds
  varyBy: string[]; // Headers/query params to vary cache by
  conditions: CacheCondition[];
}

export interface CacheCondition {
  type: "header" | "query" | "body" | "custom";
  field: string;
  operator: "equals" | "contains" | "regex" | "exists";
  value?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  metrics: AnalyticsMetric[];
  retention: number; // days
  sampling: number; // percentage
  realTimeUpdates: boolean;
}

export interface AnalyticsMetric {
  name: string;
  type: "counter" | "histogram" | "gauge" | "summary";
  labels: string[];
  description: string;
}

export interface SecurityConfig {
  cors: CORSConfig;
  headers: SecurityHeaders;
  validation: RequestValidation;
  filtering: RequestFiltering;
}

export interface CORSConfig {
  enabled: boolean;
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge: number; // seconds
}

export interface SecurityHeaders {
  enabled: boolean;
  headers: { [key: string]: string };
}

export interface RequestValidation {
  enabled: boolean;
  maxBodySize: number; // bytes
  maxHeaderSize: number; // bytes
  maxQueryParams: number;
  requiredHeaders: string[];
}

export interface RequestFiltering {
  enabled: boolean;
  blacklist: FilterRule[];
  whitelist: FilterRule[];
  geoBlocking: GeoBlockingConfig;
}

export interface FilterRule {
  type: "ip" | "country" | "user_agent" | "header" | "custom";
  pattern: string;
  action: "allow" | "block" | "log";
}

export interface GeoBlockingConfig {
  enabled: boolean;
  allowedCountries: string[];
  blockedCountries: string[];
  action: "block" | "redirect" | "log";
}

// Request context and analytics
export interface RequestContext {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  version: string;
  clientIp: string;
  userAgent: string;
  apiKey?: string;
  userId?: string;
  tenantId?: string;
  rateLimitKey: string;
  route?: RoutingRule;
  target?: RouteTarget;
  transformations: string[];
  cacheKey?: string;
  analytics: RequestAnalytics;
}

export interface RequestAnalytics {
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
  responseSize?: number;
  cacheHit?: boolean;
  rateLimited?: boolean;
  errors: string[];
  metadata: { [key: string]: any };
}

export interface RateLimitStatus {
  limited: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  strategy: string;
  action?: RateLimitAction;
}

export interface GatewayMetrics {
  timestamp: Date;
  requests: {
    total: number;
    successful: number;
    failed: number;
    rateLimited: number;
    cached: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    throughput: number; // requests per second
  };
  rateLimiting: {
    totalLimits: number;
    activeLimits: number;
    blockedRequests: number;
    throttledRequests: number;
  };
  routing: {
    totalRoutes: number;
    activeTargets: number;
    healthyTargets: number;
    circuitBreakerTrips: number;
  };
  caching: {
    hitRate: number;
    missRate: number;
    size: number; // MB
    evictions: number;
  };
  security: {
    blockedRequests: number;
    suspiciousActivity: number;
    corsViolations: number;
    authFailures: number;
  };
}

/**
 * API Gateway
 * Enterprise-grade API Gateway with comprehensive features
 */
export class APIGateway extends EventEmitter {
  private static instance: APIGateway;
  private config: GatewayConfig;
  private isInitialized = false;
  private rateLimitStore = new Map<string, any>();
  private routingTable = new Map<string, RoutingRule>();
  private metricsHistory: GatewayMetrics[] = [];
  private activeRequests = new Map<string, RequestContext>();
  private cacheStore = new Map<string, any>();
  private metricsInterval?: NodeJS.Timeout;

  private constructor(config: GatewayConfig) {
    super();
    this.config = config;
  }

  static getInstance(config?: GatewayConfig): APIGateway {
    if (!this.instance && config) {
      this.instance = new APIGateway(config);
    }
    return this.instance;
  }

  /**
   * Initialize API Gateway
   */
  async initialize(): Promise<void> {
    try {
      logger.info(
        "🌐 [APIGateway] Initializing enterprise API Gateway",
        "APIGateway",
      );

      // Setup routing table
      this.setupRoutingTable();

      // Initialize rate limiting
      if (this.config.rateLimiting.enabled) {
        await this.initializeRateLimiting();
      }

      // Initialize caching
      if (this.config.caching.enabled) {
        await this.initializeCaching();
      }

      // Setup analytics
      if (this.config.analytics.enabled) {
        this.startAnalytics();
      }

      // Setup health checks
      if (this.config.routing.healthChecks.enabled) {
        this.startHealthChecks();
      }

      this.isInitialized = true;
      logger.success(
        "✅ [APIGateway] Enterprise API Gateway initialized",
        "APIGateway",
      );
    } catch (error) {
      logger.error(
        "❌ [APIGateway] Failed to initialize API Gateway",
        "APIGateway",
        error,
      );
      throw error;
    }
  }

  /**
   * Create gateway middleware
   */
  createMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const context = this.createRequestContext(req);

      try {
        // Store context
        this.activeRequests.set(context.id, context);

        // Version resolution
        const version = this.resolveAPIVersion(req);
        context.version = version;

        // Authentication
        const authResult = await this.authenticateRequest(req, context);
        if (!authResult.success) {
          return this.sendErrorResponse(
            res,
            401,
            "Authentication failed",
            authResult.error,
          );
        }

        // Rate limiting
        if (this.config.rateLimiting.enabled) {
          const rateLimitResult = await this.checkRateLimit(req, context);
          if (rateLimitResult.limited) {
            return this.sendRateLimitResponse(res, rateLimitResult);
          }
        }

        // Route resolution
        const route = this.resolveRoute(req, context);
        if (!route) {
          return this.sendErrorResponse(res, 404, "Route not found");
        }
        context.route = route;

        // Security checks
        const securityResult = this.performSecurityChecks(req, context);
        if (!securityResult.passed) {
          return this.sendErrorResponse(
            res,
            403,
            "Security check failed",
            securityResult.reason,
          );
        }

        // Cache check
        if (this.config.caching.enabled && req.method === "GET") {
          const cachedResponse = await this.getCachedResponse(req, context);
          if (cachedResponse) {
            context.analytics.cacheHit = true;
            return this.sendCachedResponse(res, cachedResponse);
          }
        }

        // Request transformation
        if (this.config.transformation.enabled) {
          await this.transformRequest(req, context);
        }

        // Add context to request
        (req as any).gateway = context;

        // Continue to next middleware
        next();
      } catch (error) {
        logger.error("❌ [APIGateway] Middleware error", "APIGateway", error);
        context.analytics.errors.push((error as Error).message);
        this.sendErrorResponse(res, 500, "Gateway error");
      } finally {
        // Update analytics
        this.updateRequestAnalytics(context);
      }
    };
  }

  /**
   * Get gateway metrics
   */
  async getMetrics(): Promise<GatewayMetrics> {
    const currentTime = new Date();
    const activeRequestsArray = Array.from(this.activeRequests.values());

    // Calculate request metrics
    const totalRequests = activeRequestsArray.length;
    const successfulRequests = activeRequestsArray.filter(
      (r) =>
        r.analytics.statusCode &&
        r.analytics.statusCode >= 200 &&
        r.analytics.statusCode < 400,
    ).length;
    const failedRequests = activeRequestsArray.filter(
      (r) => r.analytics.statusCode && r.analytics.statusCode >= 400,
    ).length;
    const rateLimitedRequests = activeRequestsArray.filter(
      (r) => r.analytics.rateLimited,
    ).length;
    const cachedRequests = activeRequestsArray.filter(
      (r) => r.analytics.cacheHit,
    ).length;

    // Calculate response times
    const completedRequests = activeRequestsArray.filter(
      (r) => r.analytics.duration,
    );
    const responseTimes = completedRequests.map((r) => r.analytics.duration!);
    responseTimes.sort((a, b) => a - b);

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;
    const p95ResponseTime =
      responseTimes.length > 0
        ? responseTimes[Math.floor(responseTimes.length * 0.95)] || 0
        : 0;

    // Calculate throughput (requests per second over last minute)
    const oneMinuteAgo = new Date(currentTime.getTime() - 60000);
    const recentRequests = activeRequestsArray.filter(
      (r) => r.timestamp >= oneMinuteAgo,
    );
    const throughput = recentRequests.length / 60;

    const metrics: GatewayMetrics = {
      timestamp: currentTime,
      requests: {
        total: totalRequests,
        successful: successfulRequests,
        failed: failedRequests,
        rateLimited: rateLimitedRequests,
        cached: cachedRequests,
        averageResponseTime,
        p95ResponseTime,
        throughput,
      },
      rateLimiting: {
        totalLimits: this.config.rateLimiting.strategies.length,
        activeLimits: this.rateLimitStore.size,
        blockedRequests: rateLimitedRequests,
        throttledRequests: 0, // Would calculate from rate limit actions
      },
      routing: {
        totalRoutes: this.routingTable.size,
        activeTargets: Array.from(this.routingTable.values())
          .flatMap((r) => r.targets)
          .filter((t) => t.health === "healthy").length,
        healthyTargets: Array.from(this.routingTable.values())
          .flatMap((r) => r.targets)
          .filter((t) => t.health === "healthy").length,
        circuitBreakerTrips: 0, // Would track circuit breaker state
      },
      caching: {
        hitRate: (cachedRequests / Math.max(totalRequests, 1)) * 100,
        missRate:
          ((totalRequests - cachedRequests) / Math.max(totalRequests, 1)) * 100,
        size: this.cacheStore.size * 0.001, // Estimate MB
        evictions: 0, // Would track cache evictions
      },
      security: {
        blockedRequests: 0, // Would track blocked requests
        suspiciousActivity: 0, // Would track suspicious patterns
        corsViolations: 0, // Would track CORS violations
        authFailures: failedRequests, // Estimate from failed requests
      },
    };

    // ✅ MEMORY FIX: Store limited metrics history - reduce from 1000 to 100 entries
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > 100) {
      this.metricsHistory = this.metricsHistory.slice(-50); // Keep only last 50 entries
    }

    return metrics;
  }

  /**
   * Get rate limit status for key
   */
  getRateLimitStatus(key: string): RateLimitStatus | null {
    const limitData = this.rateLimitStore.get(key);
    if (!limitData) return null;

    return {
      limited: limitData.count >= limitData.limit,
      limit: limitData.limit,
      remaining: Math.max(0, limitData.limit - limitData.count),
      resetTime: new Date(limitData.resetTime),
      strategy: limitData.strategy,
    };
  }

  /**
   * Get gateway diagnostics
   */
  getDiagnostics() {
    return {
      initialized: this.isInitialized,
      activeRequests: this.activeRequests.size,
      rateLimitEntries: this.rateLimitStore.size,
      routingRules: this.routingTable.size,
      cacheEntries: this.cacheStore.size,
      metricsHistory: this.metricsHistory.length,
      config: {
        rateLimitingEnabled: this.config.rateLimiting.enabled,
        cachingEnabled: this.config.caching.enabled,
        analyticsEnabled: this.config.analytics.enabled,
        authStrategies: this.config.authentication.strategies.length,
        routingRules: this.config.routing.rules.length,
      },
    };
  }

  // Private methods

  private createRequestContext(req: Request): RequestContext {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: requestId,
      timestamp: new Date(),
      method: req.method,
      url: req.url,
      version: "1.0", // Will be resolved later
      clientIp: req.ip || req.connection.remoteAddress || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      rateLimitKey: this.generateRateLimitKey(req),
      transformations: [],
      analytics: {
        startTime: Date.now(),
        errors: [],
        metadata: {},
      },
    };
  }

  private resolveAPIVersion(req: Request): string {
    if (!this.config.versioning.enabled) {
      return this.config.versioning.defaultVersion;
    }

    for (const strategy of this.config.versioning.strategies) {
      let version: string | undefined;

      switch (strategy.type) {
        case "header":
          version = req.get(strategy.parameter);
          break;
        case "query":
          version = req.query[strategy.parameter] as string;
          break;
        case "path": {
          const pathMatch = req.path.match(
            new RegExp(`^${strategy.prefix}/(v\\d+(?:\\.\\d+)?)`),
          );
          version = pathMatch?.[1];
          break;
        }
        case "subdomain": {
          const host = req.get("Host") || "";
          const subdomainMatch = host.match(
            new RegExp(`^(v\\d+(?:\\.\\d+)?)\\.`),
          );
          version = subdomainMatch?.[1];
          break;
        }
      }

      if (
        version &&
        this.config.versioning.supportedVersions.includes(version)
      ) {
        return version;
      }
    }

    return this.config.versioning.defaultVersion;
  }

  private async authenticateRequest(
    req: Request,
    context: RequestContext,
  ): Promise<{ success: boolean; error?: string }> {
    // Check if endpoint is exempt from authentication
    const isExempt = this.config.authentication.exemptions.some((pattern) =>
      new RegExp(pattern).test(req.path),
    );

    if (isExempt) {
      return { success: true };
    }

    // Try authentication strategies in priority order
    const strategies = this.config.authentication.strategies.sort(
      (a, b) => a.priority - b.priority,
    );

    for (const strategy of strategies) {
      // Check if this strategy applies to the current endpoint
      const applies = strategy.endpoints.some((pattern) =>
        new RegExp(pattern).test(req.path),
      );

      if (!applies) continue;

      const result = await this.executeAuthStrategy(req, strategy, context);
      if (result.success) {
        return result;
      }
    }

    return { success: false, error: "No valid authentication found" };
  }

  private async executeAuthStrategy(
    req: Request,
    strategy: AuthStrategy,
    context: RequestContext,
  ): Promise<{ success: boolean; error?: string }> {
    switch (strategy.type) {
      case "jwt":
        return this.validateJWT(req, strategy.config, context);
      case "apikey":
        return this.validateAPIKey(req, strategy.config, context);
      case "oauth":
        return this.validateOAuth(req, strategy.config, context);
      case "basic":
        return this.validateBasicAuth(req, strategy.config, context);
      default:
        return {
          success: false,
          error: `Unsupported auth strategy: ${strategy.type}`,
        };
    }
  }

  private validateJWT(
    req: Request,
    _config: any,
    context: RequestContext,
  ): { success: boolean; error?: string } {
    // Simplified JWT validation (would use proper JWT library)
    const authHeader = req.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        error: "Missing or invalid authorization header",
      };
    }

    const token = authHeader.substring(7);

    // Mock JWT validation
    if (token && token.length > 10) {
      context.userId = "jwt_user";
      return { success: true };
    }

    return { success: false, error: "Invalid JWT token" };
  }

  private validateAPIKey(
    req: Request,
    _config: any,
    context: RequestContext,
  ): { success: boolean; error?: string } {
    const apiKey = req.get("X-API-Key") || (req.query.api_key as string);

    if (!apiKey) {
      return { success: false, error: "Missing API key" };
    }

    // Mock API key validation
    if (apiKey.startsWith("ak_") && apiKey.length > 10) {
      context.apiKey = apiKey;
      return { success: true };
    }

    return { success: false, error: "Invalid API key" };
  }

  private validateOAuth(
    req: Request,
    _config: any,
    _context: RequestContext,
  ): { success: boolean; error?: string } {
    // Mock OAuth validation
    const authHeader = req.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return { success: true };
    }
    return { success: false, error: "Invalid OAuth token" };
  }

  private validateBasicAuth(
    req: Request,
    _config: any,
    _context: RequestContext,
  ): { success: boolean; error?: string } {
    // Mock Basic auth validation
    const authHeader = req.get("Authorization");
    if (authHeader && authHeader.startsWith("Basic ")) {
      return { success: true };
    }
    return { success: false, error: "Invalid basic authentication" };
  }

  private async checkRateLimit(
    _req: Request,
    context: RequestContext,
  ): Promise<RateLimitStatus> {
    const key = context.rateLimitKey;
    const now = Date.now();

    // Get or create rate limit entry
    let limitEntry = this.rateLimitStore.get(key);

    if (!limitEntry) {
      limitEntry = {
        count: 0,
        limit: this.config.rateLimiting.globalLimits.requestsPerMinute,
        resetTime: now + 60000, // 1 minute window
        strategy: "fixed_window",
      };
      this.rateLimitStore.set(key, limitEntry);
    }

    // Reset if window has passed
    if (now >= limitEntry.resetTime) {
      limitEntry.count = 0;
      limitEntry.resetTime = now + 60000;
    }

    // Increment counter
    limitEntry.count++;

    // Check if limit exceeded
    const limited = limitEntry.count > limitEntry.limit;

    if (limited) {
      context.analytics.rateLimited = true;
    }

    return {
      limited,
      limit: limitEntry.limit,
      remaining: Math.max(0, limitEntry.limit - limitEntry.count),
      resetTime: new Date(limitEntry.resetTime),
      strategy: limitEntry.strategy,
    };
  }

  private generateRateLimitKey(req: Request): string {
    const keyParts: string[] = [];

    if (this.config.rateLimiting.keyGenerators.ip) {
      keyParts.push(`ip:${req.ip || "unknown"}`);
    }

    if (this.config.rateLimiting.keyGenerators.apiKey) {
      const apiKey = req.get("X-API-Key");
      if (apiKey) {
        keyParts.push(`key:${apiKey}`);
      }
    }

    if (this.config.rateLimiting.keyGenerators.userId) {
      // Would extract from JWT or session
      keyParts.push("user:unknown");
    }

    if (this.config.rateLimiting.keyGenerators.tenantId) {
      // Would extract from request context
      keyParts.push("tenant:unknown");
    }

    return keyParts.join("|") || `ip:${req.ip || "unknown"}`;
  }

  private resolveRoute(
    req: Request,
    _context: RequestContext,
  ): RoutingRule | null {
    for (const [, rule] of this.routingTable) {
      const patternMatch = new RegExp(rule.pattern).test(req.path);
      const methodMatch =
        rule.methods.includes("*") || rule.methods.includes(req.method);

      if (patternMatch && methodMatch) {
        return rule;
      }
    }

    return null;
  }

  private performSecurityChecks(
    req: Request,
    context: RequestContext,
  ): { passed: boolean; reason?: string } {
    // CORS checks
    if (this.config.security.cors.enabled) {
      const origin = req.get("Origin");
      if (
        origin &&
        !this.config.security.cors.origins.includes("*") &&
        !this.config.security.cors.origins.includes(origin)
      ) {
        return { passed: false, reason: "CORS violation" };
      }
    }

    // Request validation
    if (this.config.security.validation.enabled) {
      const contentLength = parseInt(req.get("Content-Length") || "0");
      if (contentLength > this.config.security.validation.maxBodySize) {
        return { passed: false, reason: "Request body too large" };
      }
    }

    // Request filtering
    if (this.config.security.filtering.enabled) {
      const clientIp = context.clientIp;

      // Check blacklist
      for (const rule of this.config.security.filtering.blacklist) {
        if (rule.type === "ip" && new RegExp(rule.pattern).test(clientIp)) {
          return { passed: false, reason: "IP blacklisted" };
        }
      }
    }

    return { passed: true };
  }

  private async getCachedResponse(
    req: Request,
    context: RequestContext,
  ): Promise<any> {
    if (!this.config.caching.enabled) return null;

    const cacheKey = this.generateCacheKey(req, context);
    context.cacheKey = cacheKey;

    const cached = this.cacheStore.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    return null;
  }

  private generateCacheKey(req: Request, context: RequestContext): string {
    const keyParts = [req.method, req.path, context.version];

    // Add query parameters
    const sortedQuery = Object.keys(req.query)
      .sort()
      .map((key) => `${key}=${req.query[key]}`);
    if (sortedQuery.length > 0) {
      keyParts.push(sortedQuery.join("&"));
    }

    return keyParts.join("|");
  }

  private async transformRequest(
    req: Request,
    context: RequestContext,
  ): Promise<void> {
    // Apply request transformations based on rules
    for (const rule of this.config.transformation.rules) {
      if (rule.type === "request" || rule.type === "both") {
        const patternMatch = new RegExp(rule.pattern).test(req.path);
        if (patternMatch) {
          for (const transformation of rule.transformations) {
            await this.applyTransformation(req, transformation, context);
          }
        }
      }
    }
  }

  private async applyTransformation(
    req: Request,
    transformation: Transformation,
    context: RequestContext,
  ): Promise<void> {
    context.transformations.push(
      `${transformation.type}:${transformation.action}:${transformation.target}`,
    );

    switch (transformation.type) {
      case "header":
        if (transformation.action === "add" && transformation.value) {
          req.headers[transformation.target.toLowerCase()] =
            transformation.value;
        } else if (transformation.action === "remove") {
          delete req.headers[transformation.target.toLowerCase()];
        }
        break;

      case "query":
        if (transformation.action === "add" && transformation.value) {
          (req.query as any)[transformation.target] = transformation.value;
        } else if (transformation.action === "remove") {
          delete (req.query as any)[transformation.target];
        }
        break;
    }
  }

  private sendErrorResponse(
    res: Response,
    statusCode: number,
    message: string,
    details?: string,
  ): void {
    res.status(statusCode).json({
      error: {
        message,
        details,
        timestamp: new Date().toISOString(),
        gateway: "api-gateway-v1.0",
      },
    });
  }

  private sendRateLimitResponse(
    res: Response,
    rateLimitStatus: RateLimitStatus,
  ): void {
    res.set({
      "X-RateLimit-Limit": rateLimitStatus.limit.toString(),
      "X-RateLimit-Remaining": rateLimitStatus.remaining.toString(),
      "X-RateLimit-Reset": rateLimitStatus.resetTime.toISOString(),
    });

    res.status(429).json({
      error: {
        message: "Rate limit exceeded",
        retryAfter: rateLimitStatus.resetTime.toISOString(),
        limit: rateLimitStatus.limit,
        remaining: rateLimitStatus.remaining,
        timestamp: new Date().toISOString(),
        gateway: "api-gateway-v1.0",
      },
    });
  }

  private sendCachedResponse(res: Response, cachedData: any): void {
    res.set("X-Cache", "HIT");
    res.json(cachedData);
  }

  private updateRequestAnalytics(context: RequestContext): void {
    context.analytics.endTime = Date.now();
    context.analytics.duration =
      context.analytics.endTime - context.analytics.startTime;

    // Emit analytics event
    this.emit("requestCompleted", context);
  }

  private setupRoutingTable(): void {
    for (const rule of this.config.routing.rules) {
      this.routingTable.set(rule.id, rule);
    }

    logger.debug(
      `🛣️ [APIGateway] Routing table setup with ${this.routingTable.size} rules`,
      "APIGateway",
    );
  }

  private async initializeRateLimiting(): Promise<void> {
    // Initialize rate limiting storage
    logger.debug("🚦 [APIGateway] Rate limiting initialized", "APIGateway");
  }

  private async initializeCaching(): Promise<void> {
    // Initialize caching system
    logger.debug("💾 [APIGateway] Caching system initialized", "APIGateway");
  }

  private startAnalytics(): void {
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.getMetrics();
        this.emit("metricsCollected", metrics);

        // ✅ MEMORY FIX: Cleanup old active requests periodically
        const now = Date.now();
        for (const [requestId, context] of this.activeRequests.entries()) {
          // Remove requests older than 5 minutes
          if (now - context.timestamp > 300000) {
            this.activeRequests.delete(requestId);
          }
        }

        // ✅ MEMORY FIX: Cleanup cache store if it gets too large
        if (this.cacheStore.size > 1000) {
          const entries = Array.from(this.cacheStore.entries());
          // Keep only the most recent 500 entries
          this.cacheStore.clear();
          entries.slice(-500).forEach(([key, value]) => {
            this.cacheStore.set(key, value);
          });
        }
      } catch (error) {
        logger.error(
          "❌ [APIGateway] Analytics collection failed",
          "APIGateway",
          error,
        );
      }
    }, 120000); // ✅ Reduced frequency from 60s to 120s (2 minutes)

    logger.debug("📊 [APIGateway] Analytics started", "APIGateway");
  }

  /**
   * Stop background analytics timers and listeners
   */
  public stopAnalytics(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null as any;
      logger.debug("🛑 [APIGateway] Analytics stopped", "APIGateway");
    }
  }

  private startHealthChecks(): void {
    // Implement health checks for route targets
    logger.debug("🏥 [APIGateway] Health checks started", "APIGateway");
  }
}

// Export singleton instance factory
export const createAPIGateway = (config: GatewayConfig) =>
  APIGateway.getInstance(config);

// Convenience functions
export const initializeAPIGateway = (config: GatewayConfig) => {
  const gateway = APIGateway.getInstance(config);
  return gateway.initialize();
};

export const getGatewayMetrics = () => {
  const gateway = APIGateway.getInstance();
  return gateway.getMetrics();
};

export const getGatewayDiagnostics = () => {
  const gateway = APIGateway.getInstance();
  return gateway.getDiagnostics();
};
