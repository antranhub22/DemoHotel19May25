import { desc, eq, count, and, gte } from 'drizzle-orm';
import { call } from '@shared/db';
import { logger } from '@shared/utils/logger';

const isPostgres =
  process.env.NODE_ENV === 'production' ||
  process.env.DATABASE_URL?.includes('postgres');

/**
 * Enhanced Analytics with Tenant Filtering & Performance Optimization
 *
 * All queries now include proper tenant filtering and leverage database indexes
 * for significantly improved performance.
 */

interface AnalyticsOptions {
  tenantId?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export async function getOverview(options: AnalyticsOptions = {}) {
  try {
    const { tenantId } = options;
    logger.debug('📊 [Analytics] Getting overview', 'Analytics', { tenantId });

    // Build base conditions
    const baseConditions = [];
    if (tenantId) {
      baseConditions.push(eq(call.tenant_id, tenantId));
    }

    // Add time range filtering if provided
    if (options.timeRange) {
      baseConditions.push(gte(call.created_at, options.timeRange.start));
      baseConditions.push(sql`${call.created_at} <= ${options.timeRange.end}`);
    }

    const whereClause =
      baseConditions.length > 0 ? and(...baseConditions) : undefined;

    // ✅ OPTIMIZED: Get total calls with tenant filtering + indexed query
    const totalCallsResult = await db
      .select({ count: count() })
      .from(call)
      .where(whereClause);
    const totalCalls = totalCallsResult[0]?.count || 0;

    // ✅ OPTIMIZED: Get average call duration with tenant filtering + NULL filter
    const avgDurationResult = await db
      .select({
        avg: sql`AVG(${call.duration})`.as('avg'),
      })
      .from(call)
      .where(
        whereClause
          ? and(whereClause, sql`${call.duration} IS NOT NULL`)
          : sql`${call.duration} IS NOT NULL`
      );
    const averageCallDuration = Math.round(
      Number(avgDurationResult[0]?.avg) || 0
    );

    // ✅ OPTIMIZED: Get language distribution with tenant filtering + indexed GROUP BY
    const languageResult = await db
      .select({
        language: call.language,
        count: count(),
      })
      .from(call)
      .where(whereClause)
      .groupBy(call.language);

    const languageDistribution = languageResult.map(
      (row: { language: string | null; count: number }) => ({
        language: row.language || 'unknown',
        count: row.count,
      })
    );

    // ✅ NEW: Get calls this month with optimized date filtering
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthConditions = whereClause
      ? [whereClause, gte(call.created_at, startOfMonth)]
      : [gte(call.created_at, startOfMonth)];

    const callsThisMonthResult = await db
      .select({ count: count() })
      .from(call)
      .where(and(...thisMonthConditions));
    const callsThisMonth = callsThisMonthResult[0]?.count || 0;

    // ✅ NEW: Calculate growth rate (compared to last month)
    const lastMonthStart = new Date(startOfMonth);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(startOfMonth);
    lastMonthEnd.setTime(lastMonthEnd.getTime() - 1);

    const lastMonthConditions = whereClause
      ? [
          whereClause,
          gte(call.created_at, lastMonthStart),
          sql`${call.created_at} <= ${lastMonthEnd}`,
        ]
      : [
          gte(call.created_at, lastMonthStart),
          sql`${call.created_at} <= ${lastMonthEnd}`,
        ];

    const lastMonthCallsResult = await db
      .select({ count: count() })
      .from(call)
      .where(and(...lastMonthConditions));
    const lastMonthCalls = lastMonthCallsResult[0]?.count || 0;

    const growthRate =
      lastMonthCalls > 0
        ? ((callsThisMonth - lastMonthCalls) / lastMonthCalls) * 100
        : 0;

    const result = {
      totalCalls,
      averageCallDuration,
      languageDistribution,
      callsThisMonth,
      growthRate: Math.round(growthRate * 100) / 100, // Round to 2 decimals
      tenantId: tenantId || 'all',
    };

    logger.success(
      '📊 [Analytics] Overview retrieved successfully',
      'Analytics',
      {
        tenantId,
        totalCalls,
        callsThisMonth,
        growthRate: result.growthRate,
      }
    );

    return result;
  } catch (error) {
    logger.error('❌ [Analytics] Error in getOverview', 'Analytics', error);
    return {
      totalCalls: 0,
      averageCallDuration: 0,
      languageDistribution: [],
      callsThisMonth: 0,
      growthRate: 0,
      tenantId: options.tenantId || 'all',
    };
  }
}

export async function getServiceDistribution(options: AnalyticsOptions = {}) {
  try {
    const { tenantId } = options;
    logger.debug('📊 [Analytics] Getting service distribution', 'Analytics', {
      tenantId,
    });

    // Build conditions
    const conditions = [sql`${call.service_type} IS NOT NULL`];
    if (tenantId) {
      conditions.push(eq(call.tenant_id, tenantId));
    }

    // Add time range filtering if provided
    if (options.timeRange) {
      conditions.push(gte(call.created_at, options.timeRange.start));
      conditions.push(sql`${call.created_at} <= ${options.timeRange.end}`);
    }

    // ✅ OPTIMIZED: Service distribution with tenant filtering + indexed GROUP BY
    const result = await db
      .select({
        serviceType: call.service_type,
        count: count(),
      })
      .from(call)
      .where(and(...conditions))
      .groupBy(call.service_type)
      .orderBy(desc(count())); // Order by count descending

    const formattedResult = result.map(
      (row: { serviceType: string | null; count: number }) => ({
        serviceType: row.serviceType || 'unknown',
        count: row.count,
      })
    );

    logger.success(
      '📊 [Analytics] Service distribution retrieved',
      'Analytics',
      {
        tenantId,
        servicesCount: formattedResult.length,
      }
    );

    return formattedResult;
  } catch (error) {
    logger.error(
      '❌ [Analytics] Error in getServiceDistribution',
      'Analytics',
      error
    );
    return [];
  }
}

export async function getHourlyActivity(options: AnalyticsOptions = {}) {
  try {
    const { tenantId } = options;
    logger.debug('📊 [Analytics] Getting hourly activity', 'Analytics', {
      tenantId,
    });

    // Build base conditions
    const baseConditions = [];
    if (tenantId) {
      baseConditions.push(eq(call.tenant_id, tenantId));
    }

    // Add time range filtering if provided
    if (options.timeRange) {
      baseConditions.push(gte(call.created_at, options.timeRange.start));
      baseConditions.push(sql`${call.created_at} <= ${options.timeRange.end}`);
    }

    const whereClause =
      baseConditions.length > 0 ? and(...baseConditions) : undefined;

    if (isPostgres) {
      // ✅ OPTIMIZED: PostgreSQL version with tenant filtering + indexed date functions
      const result = await db
        .select({
          hour: sql`EXTRACT(HOUR FROM ${call.created_at})`.as('hour'),
          count: count(),
        })
        .from(call)
        .where(whereClause)
        .groupBy(sql`EXTRACT(HOUR FROM ${call.created_at})`)
        .orderBy(sql`EXTRACT(HOUR FROM ${call.created_at})`);

      const formattedResult = result.map(
        (row: { hour: unknown; count: number }) => ({
          hour: Number(row.hour),
          count: row.count,
        })
      );

      logger.success(
        '📊 [Analytics] Hourly activity retrieved (PostgreSQL)',
        'Analytics',
        {
          tenantId,
          dataPoints: formattedResult.length,
        }
      );

      return formattedResult;
    } else {
      // ✅ OPTIMIZED: SQLite version with tenant filtering + indexed date functions
      const result = await db
        .select({
          hour: sql`CAST(strftime('%H', datetime(${call.created_at}, 'unixepoch')) AS INTEGER)`.as(
            'hour'
          ),
          count: count(),
        })
        .from(call)
        .where(whereClause)
        .groupBy(sql`strftime('%H', datetime(${call.created_at}, 'unixepoch'))`)
        .orderBy(
          sql`strftime('%H', datetime(${call.created_at}, 'unixepoch'))`
        );

      const formattedResult = result.map(
        (row: { hour: unknown; count: number }) => ({
          hour: Number(row.hour),
          count: row.count,
        })
      );

      logger.success(
        '📊 [Analytics] Hourly activity retrieved (SQLite)',
        'Analytics',
        {
          tenantId,
          dataPoints: formattedResult.length,
        }
      );

      return formattedResult;
    }
  } catch (error) {
    logger.error(
      '❌ [Analytics] Error in getHourlyActivity',
      'Analytics',
      error
    );
    return [];
  }
}

export async function getLanguageDistribution(options: AnalyticsOptions = {}) {
  try {
    const { tenantId } = options;
    logger.debug('📊 [Analytics] Getting language distribution', 'Analytics', {
      tenantId,
    });

    // Build conditions
    const conditions = [];
    if (tenantId) {
      conditions.push(eq(call.tenant_id, tenantId));
    }

    // Add time range filtering if provided
    if (options.timeRange) {
      conditions.push(gte(call.created_at, options.timeRange.start));
      conditions.push(sql`${call.created_at} <= ${options.timeRange.end}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // ✅ OPTIMIZED: Language distribution with tenant filtering + indexed GROUP BY
    const result = await db
      .select({
        language: call.language,
        count: count(),
      })
      .from(call)
      .where(whereClause)
      .groupBy(call.language)
      .orderBy(desc(count())); // Order by count descending

    const formattedResult = result.map(
      (row: { language: string | null; count: number }) => ({
        language: row.language || 'unknown',
        count: row.count,
      })
    );

    logger.success(
      '📊 [Analytics] Language distribution retrieved',
      'Analytics',
      {
        tenantId,
        languagesCount: formattedResult.length,
      }
    );

    return formattedResult;
  } catch (error) {
    logger.error(
      '❌ [Analytics] Error in getLanguageDistribution',
      'Analytics',
      error
    );
    return [];
  }
}

/**
 * ✅ NEW: Get comprehensive analytics dashboard data
 * Combines all analytics in a single optimized call
 */
export async function getDashboardAnalytics(options: AnalyticsOptions = {}) {
  try {
    const { tenantId } = options;
    logger.api(
      '📊 [Analytics] Getting comprehensive dashboard analytics',
      'Analytics',
      { tenantId }
    );

    const startTime = Date.now();

    // Execute all analytics queries in parallel for better performance
    const [
      overview,
      serviceDistribution,
      hourlyActivity,
      languageDistribution,
    ] = await Promise.all([
      getOverview(options),
      getServiceDistribution(options),
      getHourlyActivity(options),
      getLanguageDistribution(options),
    ]);

    const executionTime = Date.now() - startTime;

    const result = {
      overview,
      serviceDistribution,
      hourlyActivity,
      languageDistribution,
      metadata: {
        tenantId: tenantId || 'all',
        executionTime,
        timestamp: new Date().toISOString(),
      },
    };

    logger.success(
      '📊 [Analytics] Dashboard analytics retrieved successfully',
      'Analytics',
      {
        tenantId,
        executionTime,
        dataPoints: {
          overview: Object.keys(overview).length,
          serviceDistribution: serviceDistribution.length,
          hourlyActivity: hourlyActivity.length,
          languageDistribution: languageDistribution.length,
        },
      }
    );

    return result;
  } catch (error) {
    logger.error(
      '❌ [Analytics] Error in getDashboardAnalytics',
      'Analytics',
      error
    );
    throw error;
  }
}
