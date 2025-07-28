import type { PaginationMeta } from './apiHelpers';

// ============================================
// PAGINATION INTERFACES
// ============================================

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ============================================
// ADVANCED FILTERING & SORTING INTERFACES
// ============================================

export interface SortQuery {
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterQuery {
  filter?: Record<string, any>;
  search?: string; // ✅ NEW: Global search
  dateFrom?: string; // ✅ NEW: Date range filtering
  dateTo?: string;
  tenantId?: string; // ✅ NEW: Tenant filtering
}

export interface SearchQuery {
  search?: string;
  searchFields?: string[]; // ✅ NEW: Specify which fields to search
}

export type QueryWithPagination = PaginationQuery &
  SortQuery &
  FilterQuery &
  SearchQuery;

// ✅ NEW: Advanced query parameters for Guest Journey APIs
export interface GuestJourneyQuery extends QueryWithPagination {
  callId?: string;
  roomNumber?: string;
  language?: string;
  status?: string;
  serviceType?: string;
}

// ============================================
// PAGINATION UTILITIES
// ============================================

/**
 * Parse pagination query parameters with enhanced validation
 * @param query Request query object
 * @param defaultLimit Default limit if not specified
 * @param maxLimit Maximum allowed limit
 * @returns Parsed pagination parameters
 */
export const parsePagination = (
  query: PaginationQuery,
  defaultLimit = 20,
  maxLimit = 100
): PaginationParams => {
  const page = Math.max(1, parseInt(query.page || '1'));
  const limit = Math.min(
    Math.max(1, parseInt(query.limit || defaultLimit.toString())),
    maxLimit
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Create pagination metadata with enhanced information
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items
 * @returns Enhanced pagination metadata object
 */
export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Create paginated response with metadata
 * @param data Array of data items
 * @param page Current page
 * @param limit Items per page
 * @param total Total count
 * @returns Paginated result object
 */
export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginationResult<T> => {
  return {
    data,
    pagination: createPaginationMeta(page, limit, total),
  };
};

// ============================================
// ADVANCED SORTING UTILITIES
// ============================================

/**
 * Parse sorting query parameters with enhanced validation
 * @param query Request query object
 * @param defaultSort Default sort field
 * @param allowedSortFields Array of allowed sort fields
 * @returns Parsed sort parameters
 */
export const parseSorting = (
  query: SortQuery,
  defaultSort = 'created_at',
  allowedSortFields: string[] = ['created_at', 'updated_at', 'id']
) => {
  const sort = allowedSortFields.includes(query.sort || '')
    ? query.sort
    : defaultSort;
  const order = query.order === 'asc' ? 'asc' : 'desc';

  return { sort, order };
};

// ✅ NEW: Guest Journey specific sort fields
export const GUEST_JOURNEY_SORT_FIELDS = [
  'created_at',
  'updated_at',
  'timestamp',
  'call_id',
  'room_number',
  'duration',
  'language',
  'status',
] as const;

// ============================================
// ADVANCED FILTERING UTILITIES
// ============================================

/**
 * Parse filter query parameters with enhanced validation
 * @param query Request query object
 * @param allowedFilters Array of allowed filter fields
 * @returns Parsed filter object
 */
export const parseFilters = (
  query: FilterQuery,
  allowedFilters: string[] = []
) => {
  const filters: Record<string, any> = {};

  if (query.filter && typeof query.filter === 'object') {
    Object.keys(query.filter).forEach(key => {
      if (allowedFilters.length === 0 || allowedFilters.includes(key)) {
        filters[key] = query.filter![key];
      }
    });
  }

  return filters;
};

/**
 * ✅ NEW: Parse date range filters
 * @param query Request query object
 * @returns Parsed date range
 */
export const parseDateRange = (query: FilterQuery) => {
  const dateRange: { from?: Date; to?: Date } = {};

  if (query.dateFrom) {
    const fromDate = new Date(query.dateFrom);
    if (!isNaN(fromDate.getTime())) {
      dateRange.from = fromDate;
    }
  }

  if (query.dateTo) {
    const toDate = new Date(query.dateTo);
    if (!isNaN(toDate.getTime())) {
      dateRange.to = toDate;
    }
  }

  return dateRange;
};

/**
 * ✅ NEW: Parse search parameters
 * @param query Request query object
 * @param defaultSearchFields Default fields to search in
 * @returns Parsed search parameters
 */
export const parseSearch = (
  query: SearchQuery,
  defaultSearchFields: string[] = ['content', 'name', 'description']
) => {
  const search = query.search?.trim() || '';
  const searchFields = query.searchFields || defaultSearchFields;

  return { search, searchFields };
};

/**
 * ✅ NEW: Parse complete query with all advanced features
 * @param query Request query object
 * @param options Configuration options
 * @returns Parsed query parameters
 */
export const parseCompleteQuery = (
  query: QueryWithPagination,
  options: {
    defaultLimit?: number;
    maxLimit?: number;
    defaultSort?: string;
    allowedSortFields?: string[];
    allowedFilters?: string[];
    defaultSearchFields?: string[];
  } = {}
) => {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    defaultSort = 'created_at',
    allowedSortFields = GUEST_JOURNEY_SORT_FIELDS.slice(),
    allowedFilters = [],
    defaultSearchFields = ['content', 'name', 'description'],
  } = options;

  const pagination = parsePagination(query, defaultLimit, maxLimit);
  const sorting = parseSorting(query, defaultSort, allowedSortFields);
  const filters = parseFilters(query, allowedFilters);
  const dateRange = parseDateRange(query);
  const search = parseSearch(query, defaultSearchFields);

  return {
    ...pagination,
    ...sorting,
    filters,
    dateRange,
    search: search.search,
    searchFields: search.searchFields,
    tenantId: query.tenantId,
  };
};

// ============================================
// DATABASE QUERY HELPERS
// ============================================

/**
 * Build WHERE clause from filters (for use with Drizzle ORM)
 * @param filters Filter object
 * @param tableColumns Table column definitions
 * @returns Array of where conditions
 */
export const buildWhereConditions = (
  filters: Record<string, any>,
  tableColumns: Record<string, any>
) => {
  const conditions: any[] = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (tableColumns[key] && value !== undefined && value !== null) {
      // Handle different filter types
      if (Array.isArray(value)) {
        // IN condition for arrays
        conditions.push(tableColumns[key].in(value));
      } else if (typeof value === 'string' && value.includes('%')) {
        // LIKE condition for strings with wildcards
        conditions.push(tableColumns[key].like(value));
      } else {
        // Exact match
        conditions.push(tableColumns[key].eq(value));
      }
    }
  });

  return conditions;
};

/**
 * ✅ NEW: Build search conditions for text search
 * @param searchTerm Search term
 * @param searchFields Fields to search in
 * @param tableColumns Table column definitions
 * @returns Array of search conditions
 */
export const buildSearchConditions = (
  searchTerm: string,
  searchFields: string[],
  tableColumns: Record<string, any>
) => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const searchConditions: any[] = [];
  const searchPattern = `%${searchTerm.toLowerCase()}%`;

  searchFields.forEach(field => {
    if (tableColumns[field]) {
      // Use LIKE for text search (case-insensitive)
      searchConditions.push(tableColumns[field].like(searchPattern));
    }
  });

  return searchConditions;
};

/**
 * ✅ NEW: Build date range conditions
 * @param dateRange Date range object
 * @param dateColumn Date column to filter on
 * @returns Array of date conditions
 */
export const buildDateRangeConditions = (
  dateRange: { from?: Date; to?: Date },
  dateColumn: any
) => {
  const conditions: any[] = [];

  if (dateRange.from) {
    conditions.push(dateColumn.gte(dateRange.from));
  }

  if (dateRange.to) {
    conditions.push(dateColumn.lte(dateRange.to));
  }

  return conditions;
};

// ============================================
// PAGINATION CONSTANTS
// ============================================

export const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  DEFAULT_PAGE: 1,
} as const;

export const COMMON_SORT_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'name',
  'email',
  'status',
] as const;

// ✅ NEW: Guest Journey specific defaults
export const GUEST_JOURNEY_DEFAULTS = {
  CALLS: {
    sort: 'start_time',
    limit: 20,
    allowedFilters: ['room_number', 'language', 'service_type', 'tenant_id'],
    searchFields: ['room_number', 'service_type'],
  },
  TRANSCRIPTS: {
    sort: 'timestamp',
    limit: 50,
    allowedFilters: ['call_id', 'role', 'tenant_id'],
    searchFields: ['content'],
  },
  SUMMARIES: {
    sort: 'timestamp',
    limit: 20,
    allowedFilters: ['call_id', 'room_number', 'tenant_id'],
    searchFields: ['content'],
  },
  EMAILS: {
    sort: 'created_at',
    limit: 25,
    allowedFilters: ['type', 'status', 'recipient'],
    searchFields: ['subject', 'recipient'],
  },
} as const;
