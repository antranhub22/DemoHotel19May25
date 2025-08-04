import {
  buildPrismaWhere,
  getFilterPreset,
  HOTEL_FILTER_PRESETS,
  PrismaFilterCondition,
} from "./advancedFiltering";
import type { PaginationMeta } from "./apiHelpers";

// ============================================
// SIMPLIFIED ADVANCED FILTER INTERFACES
// ============================================

export interface SortRule {
  field: string;
  order: "asc" | "desc";
}

export interface AdvancedFilterQuery {
  AND?: PrismaFilterCondition[];
  OR?: PrismaFilterCondition[];
  conditions?: PrismaFilterCondition[];
}

export interface AdvancedSortQuery {
  sort?: string;
  order?: "asc" | "desc";
  sortBy?: string;
}

// ============================================
// SIMPLIFIED HELPER FUNCTIONS
// ============================================

export const applyFilterPreset = (
  presetName: string,
  additionalFilter?: AdvancedFilterQuery,
): AdvancedFilterQuery => {
  const preset = getFilterPreset(
    presetName as keyof typeof HOTEL_FILTER_PRESETS,
  );

  let result: AdvancedFilterQuery = {};

  if (preset.conditions) {
    result.conditions = preset.conditions;
  }

  if (additionalFilter) {
    if (additionalFilter.AND) {
      result.AND = [...(result.conditions || []), ...additionalFilter.AND];
    }
    if (additionalFilter.OR) {
      result.OR = additionalFilter.OR;
    }
    if (additionalFilter.conditions) {
      result.conditions = [
        ...(result.conditions || []),
        ...additionalFilter.conditions,
      ];
    }
  }

  return result;
};

export const parseAdvancedSorting = (
  sortQuery: AdvancedSortQuery,
  allowedFields: string[],
  defaultSort: SortRule,
): SortRule[] => {
  const rules: SortRule[] = [];

  if (sortQuery.sortBy) {
    // Multiple sort format: "field1:asc,field2:desc"
    const sorts = sortQuery.sortBy.split(",");
    sorts.forEach((sort) => {
      const [field, order] = sort.split(":");
      if (allowedFields.includes(field)) {
        rules.push({
          field: field.trim(),
          order: (order?.trim() as "asc" | "desc") || "desc",
        });
      }
    });
  } else if (sortQuery.sort && allowedFields.includes(sortQuery.sort)) {
    rules.push({
      field: sortQuery.sort,
      order: sortQuery.order || "desc",
    });
  }

  if (rules.length === 0) {
    rules.push(defaultSort);
  }

  return rules;
};

export const buildAdvancedWhereConditions = (
  filter: AdvancedFilterQuery,
  tableColumns: Record<string, any>,
): any => {
  return buildPrismaWhere({
    conditions: filter.conditions || [],
  });
};

export const buildOrderByClause = (
  sortRules: SortRule[],
  tableColumns: Record<string, any>,
): any => {
  if (sortRules.length === 0) {
    return { created_at: "desc" };
  }

  const orderBy: any = {};
  const rule = sortRules[0]; // For simplicity, use first rule
  orderBy[rule.field] = rule.order;

  return orderBy;
};

// ============================================
// PAGINATION INTERFACES (BACKWARD COMPATIBLE)
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
// ENHANCED QUERY INTERFACES
// ============================================

export interface SortQuery {
  sort?: string;
  order?: "asc" | "desc";
}

export interface FilterQuery {
  filter?: Record<string, any>;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  tenantId?: string;
}

export interface SearchQuery {
  search?: string;
  searchFields?: string[];
}

export type QueryWithPagination = PaginationQuery &
  SortQuery &
  FilterQuery &
  SearchQuery;

// ✅ NEW v2.0: Enhanced query with advanced filtering
export interface AdvancedQueryWithPagination
  extends PaginationQuery,
    AdvancedSortQuery {
  // Advanced filtering
  advancedFilter?: AdvancedFilterQuery;
  preset?: string; // Filter preset ID

  // Backward compatibility
  filter?: Record<string, any>;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  tenantId?: string;
  searchFields?: string[];
}

export interface GuestJourneyQuery extends QueryWithPagination {
  callId?: string;
  roomNumber?: string;
  language?: string;
  status?: string;
  serviceType?: string;
}

// ✅ NEW v2.0: Enhanced Guest Journey Query
export interface AdvancedGuestJourneyQuery extends AdvancedQueryWithPagination {
  callId?: string;
  roomNumber?: string;
  language?: string;
  status?: string;
  serviceType?: string;
}

// ============================================
// BACKWARD COMPATIBLE PAGINATION UTILITIES
// ============================================

export const parsePagination = (
  query: PaginationQuery,
  defaultLimit = 20,
  maxLimit = 100,
): PaginationParams => {
  const page = Math.max(1, parseInt(query.page || "1"));
  const limit = Math.min(
    Math.max(1, parseInt(query.limit || defaultLimit.toString())),
    maxLimit,
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number,
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

export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginationResult<T> => {
  return {
    data,
    pagination: createPaginationMeta(page, limit, total),
  };
};

// ============================================
// ENHANCED SORTING UTILITIES (BACKWARD COMPATIBLE)
// ============================================

export const parseSorting = (
  query: SortQuery,
  defaultSort = "created_at",
  allowedSortFields: string[] = ["created_at", "updated_at", "id"],
) => {
  const sort = allowedSortFields.includes(query.sort || "")
    ? query.sort
    : defaultSort;
  const order = query.order === "asc" ? "asc" : "desc";

  return { sort, order };
};

export const GUEST_JOURNEY_SORT_FIELDS = [
  "created_at",
  "updated_at",
  "timestamp",
  "call_id",
  "room_number",
  "duration",
  "language",
  "status",
] as const;

// ============================================
// ENHANCED FILTERING UTILITIES (BACKWARD COMPATIBLE)
// ============================================

export const parseFilters = (
  query: FilterQuery,
  allowedFilters: string[] = [],
) => {
  const filters: Record<string, any> = {};

  if (query.filter && typeof query.filter === "object") {
    Object.keys(query.filter).forEach((key) => {
      if (allowedFilters.length === 0 || allowedFilters.includes(key)) {
        filters[key] = query.filter![key];
      }
    });
  }

  return filters;
};

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

export const parseSearch = (
  query: SearchQuery,
  defaultSearchFields: string[] = ["content", "name", "description"],
) => {
  const search = query.search?.trim() || "";
  const searchFields = query.searchFields || defaultSearchFields;

  return { search, searchFields };
};

// ============================================
// BACKWARD COMPATIBLE COMPLETE QUERY PARSER
// ============================================

export const parseCompleteQuery = (
  query: QueryWithPagination,
  options: {
    defaultLimit?: number;
    maxLimit?: number;
    defaultSort?: string;
    allowedSortFields?: string[];
    allowedFilters?: string[];
    defaultSearchFields?: string[];
  } = {},
) => {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    defaultSort = "created_at",
    allowedSortFields = GUEST_JOURNEY_SORT_FIELDS.slice(),
    allowedFilters = [],
    defaultSearchFields = ["content", "name", "description"],
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
// NEW v2.0: ADVANCED QUERY PARSER
// ============================================

/**
 * Parse advanced query with enhanced filtering and sorting capabilities
 * @param query Advanced query parameters
 * @param options Configuration options
 * @returns Parsed advanced query parameters
 */
export const parseAdvancedQuery = (
  query: AdvancedQueryWithPagination,
  options: {
    defaultLimit?: number;
    maxLimit?: number;
    defaultSort?: SortRule;
    allowedSortFields?: string[];
    allowedFilters?: string[];
    defaultSearchFields?: string[];
    tableColumns?: Record<string, any>;
  } = {},
) => {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    defaultSort = { field: "created_at", order: "desc" },
    allowedSortFields = GUEST_JOURNEY_SORT_FIELDS.slice(),
    allowedFilters = [],
    defaultSearchFields = ["content", "name", "description"],
    tableColumns = {},
  } = options;

  // Basic pagination
  const pagination = parsePagination(query, defaultLimit, maxLimit);

  // Enhanced sorting with multi-column support
  const sortQuery: AdvancedSortQuery = {
    sort: query.sort,
    order: query.order,
    sortBy: query.sortBy,
  };
  const sortRules = parseAdvancedSorting(
    sortQuery,
    allowedSortFields,
    defaultSort,
  );

  // Advanced filtering with presets
  let advancedFilter: AdvancedFilterQuery = {};

  // Apply filter preset if specified
  if (query.preset) {
    advancedFilter = applyFilterPreset(query.preset);
  }

  // Merge with advanced filter if provided
  if (query.advancedFilter) {
    if (query.preset) {
      // Combine preset with additional filters
      advancedFilter = applyFilterPreset(query.preset, query.advancedFilter);
    } else {
      advancedFilter = query.advancedFilter;
    }
  }

  // Backward compatibility: Convert simple filters to advanced format
  if (!query.advancedFilter && !query.preset) {
    const simpleFilters = parseFilters(query, allowedFilters);
    const dateRange = parseDateRange(query);
    const search = parseSearch(query, defaultSearchFields);

    // Convert to advanced filter format
    const conditions: any[] = [];

    // Add simple filters
    Object.keys(simpleFilters).forEach((key) => {
      if (simpleFilters[key] !== undefined) {
        conditions.push({
          field: key,
          operator: "eq",
          value: simpleFilters[key],
        });
      }
    });

    // Add tenant filter
    if (query.tenantId) {
      conditions.push({
        field: "tenant_id",
        operator: "eq",
        value: query.tenantId,
      });
    }

    // Add date range
    if (dateRange.from) {
      conditions.push({
        field: "created_at",
        operator: "gte",
        value: dateRange.from,
      });
    }
    if (dateRange.to) {
      conditions.push({
        field: "created_at",
        operator: "lte",
        value: dateRange.to,
      });
    }

    // Add search
    if (search.search) {
      const searchConditions = search.searchFields.map((field) => ({
        field,
        operator: "contains" as const,
        value: search.search,
      }));

      if (searchConditions.length > 0) {
        if (conditions.length > 0) {
          advancedFilter = {
            AND: conditions,
            OR: searchConditions,
          };
        } else {
          advancedFilter = {
            OR: searchConditions,
          };
        }
      } else {
        advancedFilter = {
          AND: conditions,
        };
      }
    } else {
      advancedFilter = {
        AND: conditions,
      };
    }
  }

  // Build SQL conditions if table columns provided
  const whereCondition = tableColumns
    ? buildAdvancedWhereConditions(advancedFilter, tableColumns)
    : undefined;
  const orderByClause = tableColumns
    ? buildOrderByClause(sortRules, tableColumns)
    : undefined;

  return {
    ...pagination,
    sortRules,
    advancedFilter,
    whereCondition,
    orderByClause,
    preset: query.preset || null,
    hasAdvancedFeatures: !!(
      query.advancedFilter ||
      query.preset ||
      query.sortBy
    ),
  };
};

// ============================================
// DATABASE QUERY HELPERS (BACKWARD COMPATIBLE)
// ============================================

export const buildWhereConditions = (
  filters: Record<string, any>,
  tableColumns: Record<string, any>,
) => {
  const conditions: any[] = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (tableColumns[key] && value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        conditions.push(tableColumns[key].in(value));
      } else if (typeof value === "string" && value.includes("%")) {
        conditions.push(tableColumns[key].like(value));
      } else {
        conditions.push(tableColumns[key].eq(value));
      }
    }
  });

  return conditions;
};

export const buildSearchConditions = (
  searchTerm: string,
  searchFields: string[],
  tableColumns: Record<string, any>,
) => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const searchConditions: any[] = [];
  const searchPattern = `%${searchTerm.toLowerCase()}%`;

  searchFields.forEach((field) => {
    if (tableColumns[field]) {
      searchConditions.push(tableColumns[field].like(searchPattern));
    }
  });

  return searchConditions;
};

export const buildDateRangeConditions = (
  dateRange: { from?: Date; to?: Date },
  dateColumn: any,
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
// PAGINATION CONSTANTS & DEFAULTS
// ============================================

export const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  DEFAULT_PAGE: 1,
} as const;

export const COMMON_SORT_FIELDS = [
  "id",
  "created_at",
  "updated_at",
  "name",
  "email",
  "status",
] as const;

export const GUEST_JOURNEY_DEFAULTS = {
  CALLS: {
    sort: "start_time",
    limit: 20,
    allowedFilters: ["room_number", "language", "service_type", "tenant_id"],
    searchFields: ["room_number", "service_type"],
  },
  TRANSCRIPTS: {
    sort: "timestamp",
    limit: 50,
    allowedFilters: ["call_id", "role", "tenant_id"],
    searchFields: ["content"],
  },
  SUMMARIES: {
    sort: "timestamp",
    limit: 20,
    allowedFilters: ["call_id", "room_number", "tenant_id"],
    searchFields: ["content"],
  },
  EMAILS: {
    sort: "created_at",
    limit: 25,
    allowedFilters: ["type", "status", "recipient"],
    searchFields: ["subject", "recipient"],
  },
} as const;
