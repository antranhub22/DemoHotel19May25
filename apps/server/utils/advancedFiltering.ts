import type { SQL } from 'drizzle-orm';
import {
  and,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  notInArray,
  or,
} from 'drizzle-orm';

// ============================================
// ADVANCED FILTER INTERFACES
// ============================================

export interface AdvancedFilterQuery {
  // Complex logical operations
  AND?: FilterCondition[];
  OR?: FilterCondition[];
  NOT?: FilterCondition[];

  // Direct field filters (backward compatibility)
  [key: string]: any;
}

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator =
  | 'eq' // equals
  | 'ne' // not equals
  | 'gt' // greater than
  | 'gte' // greater than or equal
  | 'lt' // less than
  | 'lte' // less than or equal
  | 'like' // SQL LIKE
  | 'ilike' // case-insensitive LIKE
  | 'contains' // contains text
  | 'startsWith' // starts with text
  | 'endsWith' // ends with text
  | 'in' // in array
  | 'notIn' // not in array
  | 'isNull' // is null
  | 'isNotNull' // is not null
  | 'between'; // between two values

// ============================================
// MULTI-COLUMN SORTING INTERFACES
// ============================================

export interface AdvancedSortQuery {
  sort?: string | string[]; // Multiple sort fields
  order?: string | string[]; // Multiple sort orders
  sortBy?: SortRule[]; // Complex sort rules
}

export interface SortRule {
  field: string;
  order: 'asc' | 'desc';
  nulls?: 'first' | 'last'; // Null handling
  priority?: number; // Sort priority
}

// ============================================
// SAVED FILTER PRESETS
// ============================================

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: AdvancedFilterQuery;
  sorting?: AdvancedSortQuery;
  isDefault?: boolean;
  userId?: string;
  tenantId?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PREDEFINED FILTER PRESETS
// ============================================

export const HOTEL_FILTER_PRESETS: Record<
  string,
  Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'>
> = {
  TODAY_CALLS: {
    name: "Today's Calls",
    description: 'All calls from today',
    filters: {
      AND: [
        {
          field: 'start_time',
          operator: 'gte',
          value: new Date().toISOString().split('T')[0],
        },
      ],
    },
    sorting: { sort: 'start_time', order: 'desc' },
    isDefault: true,
    tags: ['time', 'recent'],
  },
  LONG_CALLS: {
    name: 'Long Duration Calls',
    description: 'Calls longer than 5 minutes',
    filters: {
      AND: [{ field: 'duration', operator: 'gt', value: 300 }],
    },
    sorting: { sort: 'duration', order: 'desc' },
    tags: ['duration', 'analysis'],
  },
  VIETNAMESE_GUESTS: {
    name: 'Vietnamese Guests',
    description: 'Calls from Vietnamese speaking guests',
    filters: {
      AND: [{ field: 'language', operator: 'eq', value: 'vi' }],
    },
    sorting: { sort: 'start_time', order: 'desc' },
    tags: ['language', 'vietnamese'],
  },
  ROOM_SERVICE_REQUESTS: {
    name: 'Room Service Requests',
    description: 'All room service related calls',
    filters: {
      OR: [
        { field: 'service_type', operator: 'eq', value: 'room_service' },
        { field: 'service_type', operator: 'contains', value: 'food' },
        { field: 'service_type', operator: 'contains', value: 'beverage' },
      ],
    },
    sorting: { sort: 'start_time', order: 'desc' },
    tags: ['service', 'food', 'room'],
  },
  COMPLAINT_TRANSCRIPTS: {
    name: 'Complaint Transcripts',
    description: 'Transcripts containing complaints or issues',
    filters: {
      OR: [
        { field: 'content', operator: 'contains', value: 'complaint' },
        { field: 'content', operator: 'contains', value: 'problem' },
        { field: 'content', operator: 'contains', value: 'issue' },
        { field: 'content', operator: 'contains', value: 'not working' },
      ],
    },
    sorting: { sort: 'timestamp', order: 'desc' },
    tags: ['issues', 'complaints', 'quality'],
  },
  HIGH_VALUE_ROOMS: {
    name: 'Premium Rooms (100+)',
    description: 'Calls from premium room numbers',
    filters: {
      AND: [{ field: 'room_number', operator: 'gte', value: '100' }],
    },
    sorting: {
      sortBy: [
        { field: 'room_number', order: 'asc', priority: 1 },
        { field: 'start_time', order: 'desc', priority: 2 },
      ],
    },
    tags: ['premium', 'rooms', 'high-value'],
  },
};

// ============================================
// ADVANCED FILTER BUILDER
// ============================================

/**
 * Build complex WHERE conditions from advanced filter query
 * @param filters Advanced filter query object
 * @param tableColumns Table column definitions
 * @returns SQL WHERE condition
 */
export const buildAdvancedWhereConditions = (
  filters: AdvancedFilterQuery,
  tableColumns: Record<string, any>
): SQL<unknown> | undefined => {
  const conditions: SQL<unknown>[] = [];

  // Process AND conditions
  if (filters.AND && Array.isArray(filters.AND)) {
    const andConditions = filters.AND.map(condition =>
      buildSingleCondition(condition, tableColumns)
    ).filter(Boolean) as SQL<unknown>[];

    if (andConditions.length > 0) {
      conditions.push(and(...andConditions)!);
    }
  }

  // Process OR conditions
  if (filters.OR && Array.isArray(filters.OR)) {
    const orConditions = filters.OR.map(condition =>
      buildSingleCondition(condition, tableColumns)
    ).filter(Boolean) as SQL<unknown>[];

    if (orConditions.length > 0) {
      conditions.push(or(...orConditions)!);
    }
  }

  // Process NOT conditions
  if (filters.NOT && Array.isArray(filters.NOT)) {
    const notConditions = filters.NOT.map(condition =>
      buildSingleCondition(condition, tableColumns)
    ).filter(Boolean) as SQL<unknown>[];

    if (notConditions.length > 0) {
      // Apply NOT to each condition
      conditions.push(
        and(
          ...notConditions.map(
            cond =>
              // Note: Drizzle doesn't have direct NOT, so we use ne or other inverse operators
              cond
          )
        )!
      );
    }
  }

  // Process direct field filters (backward compatibility)
  Object.keys(filters).forEach(key => {
    if (!['AND', 'OR', 'NOT'].includes(key) && tableColumns[key]) {
      const value = filters[key];
      if (value !== undefined && value !== null) {
        // Default to equality for direct field filters
        const condition = buildSingleCondition(
          { field: key, operator: 'eq', value },
          tableColumns
        );
        if (condition) {
          conditions.push(condition);
        }
      }
    }
  });

  // Combine all conditions with AND
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return and(...conditions);
};

/**
 * Build a single filter condition
 * @param condition Filter condition
 * @param tableColumns Table column definitions
 * @returns SQL condition
 */
export const buildSingleCondition = (
  condition: FilterCondition,
  tableColumns: Record<string, any>
): SQL<unknown> | undefined => {
  const { field, operator, value } = condition;
  const column = tableColumns[field];

  if (!column) return undefined;

  switch (operator) {
    case 'eq':
      return eq(column, value);

    case 'ne':
      return ne(column, value);

    case 'gt':
      return gt(column, value);

    case 'gte':
      return gte(column, value);

    case 'lt':
      return lt(column, value);

    case 'lte':
      return lte(column, value);

    case 'like':
      return like(column, value);

    case 'ilike':
      return ilike(column, value);

    case 'contains':
      return ilike(column, `%${value}%`);

    case 'startsWith':
      return ilike(column, `${value}%`);

    case 'endsWith':
      return ilike(column, `%${value}`);

    case 'in':
      return Array.isArray(value) ? inArray(column, value) : eq(column, value);

    case 'notIn':
      return Array.isArray(value)
        ? notInArray(column, value)
        : ne(column, value);

    case 'isNull':
      return isNull(column);

    case 'isNotNull':
      return isNotNull(column);

    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        return and(gte(column, value[0]), lte(column, value[1]))!;
      }
      return undefined;

    default:
      return eq(column, value);
  }
};

// ============================================
// ADVANCED SORTING BUILDER
// ============================================

/**
 * Parse advanced sorting query
 * @param sortQuery Advanced sort query
 * @param allowedFields Allowed sort fields
 * @param defaultSort Default sort configuration
 * @returns Parsed sort rules
 */
export const parseAdvancedSorting = (
  sortQuery: AdvancedSortQuery,
  allowedFields: string[] = [],
  defaultSort: SortRule = { field: 'created_at', order: 'desc' }
): SortRule[] => {
  const sortRules: SortRule[] = [];

  // Process explicit sortBy rules
  if (sortQuery.sortBy && Array.isArray(sortQuery.sortBy)) {
    sortQuery.sortBy.forEach(rule => {
      if (allowedFields.length === 0 || allowedFields.includes(rule.field)) {
        sortRules.push({
          field: rule.field,
          order: rule.order || 'asc',
          nulls: rule.nulls || 'last',
          priority: rule.priority || 1,
        });
      }
    });
  }

  // Process simple sort/order arrays
  if (sortQuery.sort && sortQuery.order) {
    const sortFields = Array.isArray(sortQuery.sort)
      ? sortQuery.sort
      : [sortQuery.sort];
    const sortOrders = Array.isArray(sortQuery.order)
      ? sortQuery.order
      : [sortQuery.order];

    sortFields.forEach((field, index) => {
      if (allowedFields.length === 0 || allowedFields.includes(field)) {
        const order = sortOrders[index] || sortOrders[0] || 'asc';
        sortRules.push({
          field,
          order: order as 'asc' | 'desc',
          nulls: 'last',
          priority: index + 1,
        });
      }
    });
  }

  // Apply default sort if no rules
  if (sortRules.length === 0) {
    sortRules.push(defaultSort);
  }

  // Sort by priority
  return sortRules.sort((a, b) => (a.priority || 1) - (b.priority || 1));
};

/**
 * Build ORDER BY clauses from sort rules
 * @param sortRules Array of sort rules
 * @param tableColumns Table column definitions
 * @returns Array of ORDER BY clauses
 */
export const buildOrderByClause = (
  sortRules: SortRule[],
  tableColumns: Record<string, any>
): SQL<unknown>[] => {
  const orderClauses: SQL<unknown>[] = [];

  sortRules.forEach(rule => {
    const column = tableColumns[rule.field];
    if (column) {
      if (rule.order === 'asc') {
        orderClauses.push(column.asc());
      } else {
        orderClauses.push(column.desc());
      }
    }
  });

  return orderClauses;
};

// ============================================
// FILTER PRESET UTILITIES
// ============================================

/**
 * Get filter preset by ID or name
 * @param identifier Preset ID or name
 * @returns Filter preset or undefined
 */
export const getFilterPreset = (
  identifier: string
): FilterPreset | undefined => {
  const preset = HOTEL_FILTER_PRESETS[identifier];
  if (preset) {
    return {
      id: identifier,
      ...preset,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  return undefined;
};

/**
 * Get all available filter presets
 * @param tags Optional tags to filter by
 * @returns Array of filter presets
 */
export const getAllFilterPresets = (tags?: string[]): FilterPreset[] => {
  return Object.keys(HOTEL_FILTER_PRESETS)
    .map(id => ({
      id,
      ...HOTEL_FILTER_PRESETS[id],
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    .filter(preset => {
      if (!tags || tags.length === 0) return true;
      return tags.some(tag => preset.tags?.includes(tag));
    });
};

/**
 * Apply filter preset to query
 * @param presetId Preset identifier
 * @param additionalFilters Additional filters to merge
 * @returns Combined filter query
 */
export const applyFilterPreset = (
  presetId: string,
  additionalFilters?: AdvancedFilterQuery
): AdvancedFilterQuery => {
  const preset = getFilterPreset(presetId);
  if (!preset) {
    return additionalFilters || {};
  }

  if (!additionalFilters) {
    return preset.filters;
  }

  // Merge preset filters with additional filters
  const merged: AdvancedFilterQuery = {
    AND: [...(preset.filters.AND || []), ...(additionalFilters.AND || [])],
  };

  // Add other filter types if they exist
  if (preset.filters.OR || additionalFilters.OR) {
    merged.OR = [...(preset.filters.OR || []), ...(additionalFilters.OR || [])];
  }

  if (preset.filters.NOT || additionalFilters.NOT) {
    merged.NOT = [
      ...(preset.filters.NOT || []),
      ...(additionalFilters.NOT || []),
    ];
  }

  return merged;
};

/**
 * Optimize filter query for better performance
 * @param filters Filter query to optimize
 * @returns Optimized filter query
 */
export const optimizeFilterQuery = (
  filters: AdvancedFilterQuery
): AdvancedFilterQuery => {
  const optimized: AdvancedFilterQuery = {};

  // Remove empty arrays
  if (filters.AND && filters.AND.length > 0) {
    optimized.AND = filters.AND;
  }
  if (filters.OR && filters.OR.length > 0) {
    optimized.OR = filters.OR;
  }
  if (filters.NOT && filters.NOT.length > 0) {
    optimized.NOT = filters.NOT;
  }

  // Copy direct field filters
  Object.keys(filters).forEach(key => {
    if (!['AND', 'OR', 'NOT'].includes(key)) {
      optimized[key] = filters[key];
    }
  });

  return optimized;
};
