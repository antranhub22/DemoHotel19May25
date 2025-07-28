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
// PAGINATION UTILITIES
// ============================================

/**
 * Parse pagination query parameters
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
 * Create pagination metadata
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items
 * @returns Pagination metadata object
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
 * Create paginated response
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
// QUERY FILTER UTILITIES
// ============================================

export interface SortQuery {
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterQuery {
  filter?: Record<string, any>;
}

export type QueryWithPagination = PaginationQuery & SortQuery & FilterQuery;

/**
 * Parse sorting query parameters
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

/**
 * Parse filter query parameters
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
 * Parse complete query with pagination, sorting, and filtering
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
  } = {}
) => {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    defaultSort = 'created_at',
    allowedSortFields = ['created_at', 'updated_at', 'id'],
    allowedFilters = [],
  } = options;

  const pagination = parsePagination(query, defaultLimit, maxLimit);
  const sorting = parseSorting(query, defaultSort, allowedSortFields);
  const filters = parseFilters(query, allowedFilters);

  return {
    ...pagination,
    ...sorting,
    filters,
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
