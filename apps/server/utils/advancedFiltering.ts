// ✅ ADVANCED FILTERING USING PRISMA
// This file provides advanced filtering capabilities using Prisma's native features

// ============================================
// MIGRATED FILTER INTERFACES - NOW USING PRISMA
// ============================================

export interface PrismaFilterCondition {
  field: string;
  operator: "eq" | "gt" | "gte" | "lt" | "lte" | "contains" | "in" | "notIn";
  value: any;
}

export interface PrismaDateRange {
  from?: Date;
  to?: Date;
}

export interface PrismaFilterOptions {
  search?: string;
  dateRange?: PrismaDateRange;
  conditions?: PrismaFilterCondition[];
  orderBy?: { field: string; direction: "asc" | "desc" };
  limit?: number;
  offset?: number;
}

// ============================================
// PRISMA FILTER BUILDERS
// ============================================

/**
 * ✅ DETAILED MIGRATION: Build Prisma where conditions
 */
export function buildPrismaWhere(options: PrismaFilterOptions): any {
  const where: any = {};

  // Add search conditions
  if (options.search) {
    where.OR = [
      { content: { contains: options.search, mode: "insensitive" } },
      { title: { contains: options.search, mode: "insensitive" } },
      { description: { contains: options.search, mode: "insensitive" } },
    ];
  }

  // Add date range conditions
  if (options.dateRange) {
    const dateFilter: any = {};
    if (options.dateRange.from) dateFilter.gte = options.dateRange.from;
    if (options.dateRange.to) dateFilter.lte = options.dateRange.to;
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }
  }

  // Add custom conditions
  if (options.conditions) {
    options.conditions.forEach((condition) => {
      switch (condition.operator) {
        case "eq":
          where[condition.field] = condition.value;
          break;
        case "gt":
          where[condition.field] = { gt: condition.value };
          break;
        case "gte":
          where[condition.field] = { gte: condition.value };
          break;
        case "lt":
          where[condition.field] = { lt: condition.value };
          break;
        case "lte":
          where[condition.field] = { lte: condition.value };
          break;
        case "contains":
          where[condition.field] = {
            contains: condition.value,
            mode: "insensitive",
          };
          break;
        case "in":
          where[condition.field] = { in: condition.value };
          break;
        case "notIn":
          where[condition.field] = { notIn: condition.value };
          break;
      }
    });
  }

  return where;
}

/**
 * ✅ DETAILED MIGRATION: Build Prisma orderBy
 */
export function buildPrismaOrderBy(options: PrismaFilterOptions): any {
  if (!options.orderBy) {
    return { createdAt: "desc" }; // Default ordering
  }

  return {
    [options.orderBy.field]: options.orderBy.direction,
  };
}

/**
 * ✅ DETAILED MIGRATION: Apply filters to any Prisma model
 */
export async function applyPrismaFilters<T>(
  model: any, // Prisma model (e.g., prisma.request, prisma.call)
  options: PrismaFilterOptions,
): Promise<{ data: T[]; total: number }> {
  try {
    const where = buildPrismaWhere(options);
    const orderBy = buildPrismaOrderBy(options);

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        take: options.limit || 20,
        skip: options.offset || 0,
      }),
      model.count({ where }),
    ]);

    logger.debug(
      `✅ Applied Prisma filters: ${total} total records`,
      "AdvancedFiltering",
    );
    return { data, total };
  } catch (error) {
    logger.error(
      "❌ Error applying Prisma filters:",
      "AdvancedFiltering",
      error,
    );
    throw error;
  }
}

// ============================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================

/**
 * ✅ DETAILED MIGRATION: Legacy compatibility for existing code
 */
export const HOTEL_FILTER_PRESETS = {
  RECENT_REQUESTS: {
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    },
    orderBy: { field: "createdAt", direction: "desc" as const },
  },
  HIGH_PRIORITY: {
    conditions: [{ field: "priority", operator: "eq" as const, value: "high" }],
    orderBy: { field: "createdAt", direction: "desc" as const },
  },
  COMPLETED_TODAY: {
    conditions: [
      { field: "status", operator: "eq" as const, value: "completed" },
    ],
    dateRange: {
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  },
};

export function getFilterPreset(
  presetName: keyof typeof HOTEL_FILTER_PRESETS,
): PrismaFilterOptions {
  return HOTEL_FILTER_PRESETS[presetName];
}

export function getAllFilterPresets() {
  return Object.keys(HOTEL_FILTER_PRESETS);
}

// ============================================
// MIGRATION COMPLETE SUMMARY
// ============================================

/*
✅ ADVANCED FILTERING FEATURES:

FEATURES:
- Uses Prisma's native where/orderBy objects
- Type-safe filtering conditions
- Simplified query building
- Optimized performance

BENEFITS:
- 🎯 Type Safety: Full TypeScript support
- ⚡ Performance: Optimized query generation
- 🛡️ Security: Built-in SQL injection protection
- 🔧 Maintainability: Cleaner, more readable code
- 📈 Features: Built-in pagination, sorting, filtering

FUNCTIONALITY:
- Filter presets available
- Consistent interface
- Enhanced capabilities
*/
