import { logger } from '@shared/utils/logger';
import express from 'express';

// ============================================
// API VERSION INTERFACES
// ============================================

export interface ApiVersion {
  version: string;
  releaseDate: Date;
  status: 'stable' | 'beta' | 'deprecated' | 'sunset';
  deprecationDate?: Date;
  sunsetDate?: Date;
  breaking: boolean;
  description: string;
  features: string[];
  migrations?: {
    from: string;
    to: string;
    guide: string;
    automated: boolean;
  }[];
}

export interface VersionedResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta: {
    apiVersion: string;
    requestVersion: string;
    compatibility: 'full' | 'partial' | 'deprecated';
    deprecationWarning?: string;
    migrationPath?: string;
    timestamp: string;
    [key: string]: any;
  };
}

export interface ClientVersionInfo {
  userAgent: string;
  apiVersion: string;
  clientVersion?: string;
  platform?: string;
  features: string[];
}

// ============================================
// API VERSION REGISTRY
// ============================================

export const API_VERSIONS: Record<string, ApiVersion> = {
  'v1.0': {
    version: 'v1.0',
    releaseDate: new Date('2024-01-01'),
    status: 'deprecated',
    deprecationDate: new Date('2025-01-01'),
    sunsetDate: new Date('2025-06-01'),
    breaking: false,
    description: 'Initial API release with basic functionality',
    features: [
      'Basic CRUD operations',
      'Simple authentication',
      'Basic pagination',
      'JSON responses',
    ],
    migrations: [
      {
        from: 'v1.0',
        to: 'v1.1',
        guide: '/docs/migration/v1.0-to-v1.1',
        automated: true,
      },
    ],
  },
  'v1.1': {
    version: 'v1.1',
    releaseDate: new Date('2024-06-01'),
    status: 'deprecated',
    deprecationDate: new Date('2025-03-01'),
    sunsetDate: new Date('2025-09-01'),
    breaking: false,
    description: 'Enhanced API with improved pagination and error handling',
    features: [
      'Enhanced pagination',
      'Standardized error responses',
      'Basic filtering',
      'JWT authentication',
      'Request logging',
    ],
    migrations: [
      {
        from: 'v1.0',
        to: 'v1.1',
        guide: '/docs/migration/v1.0-to-v1.1',
        automated: true,
      },
      {
        from: 'v1.1',
        to: 'v2.0',
        guide: '/docs/migration/v1.1-to-v2.0',
        automated: false,
      },
    ],
  },
  'v2.0': {
    version: 'v2.0',
    releaseDate: new Date('2024-12-01'),
    status: 'stable',
    breaking: true,
    description: 'Major release with advanced filtering and RESTful design',
    features: [
      'RESTful API design',
      'Advanced pagination',
      'Complex filtering',
      'Multi-column sorting',
      'Unified error handling',
      'Rate limiting',
      'API documentation',
    ],
    migrations: [
      {
        from: 'v1.1',
        to: 'v2.0',
        guide: '/docs/migration/v1.1-to-v2.0',
        automated: false,
      },
      {
        from: 'v2.0',
        to: 'v2.1',
        guide: '/docs/migration/v2.0-to-v2.1',
        automated: true,
      },
    ],
  },
  'v2.1': {
    version: 'v2.1',
    releaseDate: new Date('2025-01-15'),
    status: 'stable',
    breaking: false,
    description:
      'Enhanced filtering with presets and performance optimizations',
    features: [
      'Filter presets',
      'Query builder',
      'Performance optimizations',
      'Advanced analytics',
      'Multi-tenant improvements',
      'Enhanced security',
      'Real-time features',
    ],
    migrations: [
      {
        from: 'v2.0',
        to: 'v2.1',
        guide: '/docs/migration/v2.0-to-v2.1',
        automated: true,
      },
    ],
  },
  'v2.2': {
    version: 'v2.2',
    releaseDate: new Date('2025-01-28'),
    status: 'stable',
    breaking: false,
    description: 'Advanced filtering & sorting with complex logic operators',
    features: [
      'Complex filter logic (AND/OR/NOT)',
      'Advanced search operators (14 total)',
      'Multi-column sorting with priority',
      'Hotel-specific filter presets',
      'Query optimization',
      'Intelligent caching',
      'Enhanced performance metrics',
    ],
  },
};

// ============================================
// VERSION DETECTION UTILITIES
// ============================================

/**
 * Extract API version from request
 * Supports multiple version detection methods:
 * - URL path: /api/v2/calls
 * - Header: API-Version: v2.0
 * - Query param: ?version=v2.0
 * - Accept header: Accept: application/vnd.hotel.v2+json
 */
export const detectApiVersion = (req: express.Request): string => {
  // Method 1: URL path version (highest priority)
  const pathVersion = req.path.match(/\/api\/(v[\d.]+)\//)?.[1];
  if (pathVersion && API_VERSIONS[pathVersion]) {
    return pathVersion;
  }

  // Method 2: API-Version header
  const headerVersion = req.headers['api-version'] as string;
  if (headerVersion && API_VERSIONS[headerVersion]) {
    return headerVersion;
  }

  // Method 3: Query parameter
  const queryVersion = req.query.version as string;
  if (queryVersion && API_VERSIONS[queryVersion]) {
    return queryVersion;
  }

  // Method 4: Accept header with vendor versioning
  const acceptHeader = req.headers.accept as string;
  if (acceptHeader) {
    const vendorVersionMatch = acceptHeader.match(
      /application\/vnd\.hotel\.(v[\d.]+)\+json/
    );
    const vendorVersion = vendorVersionMatch?.[1];
    if (vendorVersion && API_VERSIONS[vendorVersion]) {
      return vendorVersion;
    }
  }

  // Default to latest stable version
  return getLatestStableVersion();
};

/**
 * Get latest stable API version
 */
export const getLatestStableVersion = (): string => {
  const stableVersions = Object.values(API_VERSIONS)
    .filter(v => v.status === 'stable')
    .sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());

  return stableVersions[0]?.version || 'v2.2';
};

/**
 * Check if version is deprecated
 */
export const isVersionDeprecated = (version: string): boolean => {
  const versionInfo = API_VERSIONS[version];
  if (!versionInfo) return true;

  return versionInfo.status === 'deprecated' || versionInfo.status === 'sunset';
};

/**
 * Get deprecation warning for version
 */
export const getDeprecationWarning = (version: string): string | null => {
  const versionInfo = API_VERSIONS[version];
  if (!versionInfo) return null;

  if (versionInfo.status === 'deprecated') {
    const sunsetDate = versionInfo.sunsetDate?.toISOString().split('T')[0];
    return `API version ${version} is deprecated. Please migrate to ${getLatestStableVersion()}. Support ends on ${sunsetDate}.`;
  }

  if (versionInfo.status === 'sunset') {
    return `API version ${version} is sunset and no longer supported. Please upgrade to ${getLatestStableVersion()}.`;
  }

  return null;
};

// ============================================
// VERSION COMPATIBILITY UTILITIES
// ============================================

/**
 * Check compatibility between requested and actual version
 */
export const checkVersionCompatibility = (
  requestedVersion: string,
  actualVersion: string
): 'full' | 'partial' | 'deprecated' => {
  if (requestedVersion === actualVersion) {
    return isVersionDeprecated(requestedVersion) ? 'deprecated' : 'full';
  }

  const requested = API_VERSIONS[requestedVersion];
  const actual = API_VERSIONS[actualVersion];

  if (!requested || !actual) return 'deprecated';

  // Check if there's a migration path
  const hasMigrationPath = actual.migrations?.some(
    m => m.from === requestedVersion
  );
  if (hasMigrationPath) {
    return isVersionDeprecated(requestedVersion) ? 'deprecated' : 'partial';
  }

  return 'deprecated';
};

/**
 * Transform response based on API version
 */
export const transformResponseForVersion = <T>(
  data: T,
  requestedVersion: string,
  actualVersion: string,
  message?: string
): VersionedResponse<T> => {
  const compatibility = checkVersionCompatibility(
    requestedVersion,
    actualVersion
  );
  const deprecationWarning = getDeprecationWarning(requestedVersion);

  const response: VersionedResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      apiVersion: actualVersion,
      requestVersion: requestedVersion,
      compatibility,
      timestamp: new Date().toISOString(),
    },
  };

  if (deprecationWarning) {
    response.meta.deprecationWarning = deprecationWarning;
  }

  // Add migration path if needed
  if (compatibility === 'partial' || compatibility === 'deprecated') {
    const migrationPath = findMigrationPath(requestedVersion, actualVersion);
    if (migrationPath) {
      response.meta.migrationPath = migrationPath;
    }
  }

  return response;
};

/**
 * Find migration path between versions
 */
export const findMigrationPath = (
  fromVersion: string,
  toVersion: string
): string | null => {
  const toVersionInfo = API_VERSIONS[toVersion];
  if (!toVersionInfo) return null;

  const migration = toVersionInfo.migrations?.find(m => m.from === fromVersion);
  return migration?.guide || null;
};

// ============================================
// CLIENT VERSION DETECTION
// ============================================

/**
 * Parse client information from User-Agent and headers
 */
export const parseClientVersion = (req: express.Request): ClientVersionInfo => {
  const userAgent = req.headers['user-agent'] || '';
  const apiVersion = detectApiVersion(req);

  // Parse common client patterns
  let clientVersion: string | undefined;
  let platform: string | undefined;

  // Hotel Mobile App pattern
  const mobileMatch = userAgent.match(/HotelApp\/([\d.]+)\s+\(([^)]+)\)/);
  if (mobileMatch) {
    clientVersion = mobileMatch[1];
    platform = mobileMatch[2];
  }

  // Web Dashboard pattern
  const webMatch = userAgent.match(/HotelDashboard\/([\d.]+)/);
  if (webMatch) {
    clientVersion = webMatch[1];
    platform = 'web';
  }

  // Voice Assistant pattern
  const voiceMatch = userAgent.match(/VoiceAssistant\/([\d.]+)/);
  if (voiceMatch) {
    clientVersion = voiceMatch[1];
    platform = 'voice';
  }

  // Determine features based on API version
  const versionInfo = API_VERSIONS[apiVersion];
  const features = versionInfo?.features || [];

  return {
    userAgent,
    apiVersion,
    clientVersion,
    platform,
    features,
  };
};

// ============================================
// VERSION MIDDLEWARE
// ============================================

/**
 * Express middleware for API versioning
 */
export const apiVersionMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const requestedVersion = detectApiVersion(req);
  const latestVersion = getLatestStableVersion();
  const clientInfo = parseClientVersion(req);

  // Add version info to request
  req.apiVersion = requestedVersion;
  req.clientInfo = clientInfo;

  // Log version usage for analytics
  logger.debug(
    `📡 [API-VERSION] ${req.method} ${req.path} - Version: ${requestedVersion}, Client: ${clientInfo.platform || 'unknown'}`,
    'ApiVersioning'
  );

  // Add version headers to response
  res.setHeader('API-Version', latestVersion);
  res.setHeader('API-Version-Requested', requestedVersion);
  res.setHeader(
    'API-Deprecation-Warning',
    getDeprecationWarning(requestedVersion) || ''
  );

  // Check for sunset versions
  const versionInfo = API_VERSIONS[requestedVersion];
  if (versionInfo?.status === 'sunset') {
    return res.status(410).json({
      success: false,
      error: 'API_VERSION_SUNSET',
      message: `API version ${requestedVersion} is no longer supported`,
      meta: {
        requestedVersion,
        latestVersion,
        migrationGuide: findMigrationPath(requestedVersion, latestVersion),
      },
    });
  }

  next();
};

/**
 * Create versioned API response
 */
export const createVersionedResponse = <T>(
  res: express.Response,
  data: T,
  message?: string,
  meta: Record<string, any> = {}
): express.Response => {
  const requestedVersion = res.req.apiVersion || getLatestStableVersion();
  const actualVersion = getLatestStableVersion();

  const response = transformResponseForVersion(
    data,
    requestedVersion,
    actualVersion,
    message
  );

  // Merge additional meta
  response.meta = { ...response.meta, ...meta };

  return res.json(response);
};

// ============================================
// MIGRATION UTILITIES
// ============================================

/**
 * Transform data based on API version migrations
 */
export const transformDataForVersion = (
  data: any,
  fromVersion: string,
  toVersion: string
): any => {
  // This would contain actual transformation logic
  // For now, we'll implement basic transformations

  if (fromVersion === 'v1.0' && toVersion === 'v1.1') {
    // v1.0 to v1.1: Add pagination meta to responses
    if (Array.isArray(data)) {
      return {
        data,
        pagination: {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  if (fromVersion === 'v1.1' && toVersion === 'v2.0') {
    // v1.1 to v2.0: Restructure error responses
    if (data.error) {
      return {
        success: false,
        error: {
          code: data.error,
          message: data.message || 'Unknown error',
          details: data.details || null,
        },
      };
    }
  }

  return data;
};

// ============================================
// VERSION ANALYTICS
// ============================================

export interface VersionUsageStats {
  version: string;
  requests: number;
  uniqueClients: number;
  platforms: Record<string, number>;
  lastUsed: Date;
}

let versionStats: Map<string, VersionUsageStats> = new Map();

/**
 * Track version usage
 */
export const trackVersionUsage = (
  version: string,
  clientInfo: ClientVersionInfo
): void => {
  const stats = versionStats.get(version) || {
    version,
    requests: 0,
    uniqueClients: 0,
    platforms: {},
    lastUsed: new Date(),
  };

  stats.requests++;
  stats.lastUsed = new Date();

  if (clientInfo.platform) {
    stats.platforms[clientInfo.platform] =
      (stats.platforms[clientInfo.platform] || 0) + 1;
  }

  versionStats.set(version, stats);
};

/**
 * Get version usage statistics
 */
export const getVersionStats = (): VersionUsageStats[] => {
  return Array.from(versionStats.values());
};

// ============================================
// TYPE EXTENSIONS
// ============================================

declare global {
  namespace Express {
    interface Request {
      apiVersion?: string;
      clientInfo?: ClientVersionInfo;
    }
  }
}

export default {
  detectApiVersion,
  getLatestStableVersion,
  isVersionDeprecated,
  getDeprecationWarning,
  checkVersionCompatibility,
  transformResponseForVersion,
  parseClientVersion,
  apiVersionMiddleware,
  createVersionedResponse,
  transformDataForVersion,
  trackVersionUsage,
  getVersionStats,
  API_VERSIONS,
};
