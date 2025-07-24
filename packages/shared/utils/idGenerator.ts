import { randomUUID } from 'crypto';

// ============================================
// CENTRALIZED ID GENERATION UTILITY
// ============================================
// Single source of truth for all ID generation in the system
// Uses UUID v4 with meaningful prefixes for better traceability

export type EntityType =
  | 'tenant'
  | 'request'
  | 'call'
  | 'transcript'
  | 'staff'
  | 'hotel-profile'
  | 'order'
  | 'message';

// ============================================
// ID GENERATION FUNCTIONS
// ============================================

/**
 * Generate a globally unique ID with prefix
 * Format: {prefix}_{uuid}
 * Example: tenant_123e4567-e89b-12d3-a456-426614174000
 */
export function generateId(entityType: EntityType): string {
  const uuid = randomUUID();

  switch (entityType) {
    case 'tenant':
      return `tenant_${uuid}`;
    case 'request':
      return `req_${uuid}`;
    case 'call':
      return `call_${uuid}`;
    case 'transcript':
      return `trans_${uuid}`;
    case 'staff':
      return `staff_${uuid}`;
    case 'hotel-profile':
      return `profile_${uuid}`;
    case 'order':
      return `ord_${uuid}`;
    case 'message':
      return `msg_${uuid}`;
    default:
      return `unk_${uuid}`;
  }
}

/**
 * Generate a shorter human-readable ID for display purposes
 * Format: {PREFIX}-{short-uuid}
 * Example: REQ-a456b426, CALL-e89b12d3
 */
export function generateShortId(entityType: EntityType): string {
  const uuid = randomUUID().replace(/-/g, '').substring(0, 8);

  switch (entityType) {
    case 'tenant':
      return `TNT-${uuid}`;
    case 'request':
      return `REQ-${uuid}`;
    case 'call':
      return `CALL-${uuid}`;
    case 'transcript':
      return `TRANS-${uuid}`;
    case 'staff':
      return `STF-${uuid}`;
    case 'hotel-profile':
      return `PROF-${uuid}`;
    case 'order':
      return `ORD-${uuid}`;
    case 'message':
      return `MSG-${uuid}`;
    default:
      return `UNK-${uuid}`;
  }
}

/**
 * Validate if an ID follows our standard format
 */
export function isValidId(id: string, entityType?: EntityType): boolean {
  if (!id || typeof id !== 'string') return false;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (entityType) {
    const expectedPrefix = generateId(entityType).split('_')[0];
    const [prefix, uuid] = id.split('_');
    return prefix === expectedPrefix && uuidRegex.test(uuid);
  }

  // Check if it matches any valid format
  const parts = id.split('_');
  if (parts.length === 2) {
    return uuidRegex.test(parts[1]);
  }

  return false;
}

/**
 * Extract entity type from ID
 */
export function getEntityTypeFromId(id: string): EntityType | null {
  if (!id || typeof id !== 'string') return null;

  const prefix = id.split('_')[0];

  switch (prefix) {
    case 'tenant':
      return 'tenant';
    case 'req':
      return 'request';
    case 'call':
      return 'call';
    case 'trans':
      return 'transcript';
    case 'staff':
      return 'staff';
    case 'profile':
      return 'hotel-profile';
    case 'ord':
      return 'order';
    case 'msg':
      return 'message';
    default:
      return null;
  }
}

// ============================================
// LEGACY ID MIGRATION HELPERS
// ============================================

/**
 * Check if an ID is using the old timestamp-based format
 */
export function isLegacyId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;

  // Check for old patterns: ORD-{timestamp}, tenant-{timestamp}, etc.
  const legacyPatterns = [
    /^ORD-\d+-\d+$/, // ORD-1705334425-456
    /^REQ-\d+-\d+$/, // REQ-1705334425-456
    /^CALL-\d+$/, // CALL-1705334425
    /^tenant-\d+$/, // tenant-1705334425
  ];

  return legacyPatterns.some(pattern => pattern.test(id));
}

/**
 * Migrate legacy ID to new UUID format
 */
export function migrateLegacyId(
  legacyId: string,
  entityType: EntityType
): string {
  if (!isLegacyId(legacyId)) {
    return legacyId; // Already in new format
  }

  return generateId(entityType);
}

// ============================================
// BULK ID GENERATION
// ============================================

/**
 * Generate multiple IDs of the same type
 */
export function generateBulkIds(
  entityType: EntityType,
  count: number
): string[] {
  return Array.from({ length: count }, () => generateId(entityType));
}

// ============================================
// ID UTILITIES
// ============================================

/**
 * Generate a correlation ID for tracking related operations
 */
export function generateCorrelationId(): string {
  return `corr_${randomUUID()}`;
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return `sess_${randomUUID()}`;
}

/**
 * Generate a request trace ID
 */
export function generateTraceId(): string {
  return `trace_${randomUUID()}`;
}
