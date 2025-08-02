/**
 * Query Optimizer Service - MEDIUM RISK with A/B Testing
 * Optimizes database queries with automatic fallback to ensure production safety
 */

import { errorTracking } from '@server/services/ErrorTracking';
import { db } from '@shared/db';
import { call_summaries, request as requestTable } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { and, count, eq, gte, sql } from 'drizzle-orm';

export interface QueryOptimizationConfig {
  enableOptimizedQueries: boolean;
  fallbackThreshold: number; // milliseconds
  maxRetries: number;
  testingMode: boolean;
}

export interface QueryResult<T> {
  data: T;
  source: 'optimized' | 'fallback';
  responseTime: number;
  success: boolean;
  error?: string;
}

class QueryOptimizer {
  private config: QueryOptimizationConfig;
  private stats = {
    optimizedSuccess: 0,
    optimizedFailure: 0,
    fallbackUsed: 0,
    totalQueries: 0,
  };

  constructor(config: Partial<QueryOptimizationConfig> = {}) {
    this.config = {
      enableOptimizedQueries: process.env.ENABLE_QUERY_OPTIMIZATION === 'true',
      fallbackThreshold: 2000, // 2 seconds
      maxRetries: 1,
      testingMode: process.env.NODE_ENV !== 'production',
      ...config,
    };

    logger.info('🔧 [QueryOptimizer] Initialized', 'QueryOptimizer', {
      enableOptimized: this.config.enableOptimizedQueries,
      fallbackThreshold: this.config.fallbackThreshold,
      testingMode: this.config.testingMode,
    });
  }

  /**
   * Execute query with A/B testing and automatic fallback
   */
  async executeWithFallback<T>(
    optimizedQuery: () => Promise<T>,
    fallbackQuery: () => Promise<T>,
    operationName: string
  ): Promise<QueryResult<T>> {
    const startTime = performance.now();
    this.stats.totalQueries++;

    try {
      // Always try optimized query first if enabled
      if (this.config.enableOptimizedQueries) {
        try {
          logger.debug(
            `⚡ [QueryOptimizer] Trying optimized query: ${operationName}`,
            'QueryOptimizer'
          );

          const result = await Promise.race([
            optimizedQuery(),
            this.createTimeoutPromise(this.config.fallbackThreshold),
          ]);

          const responseTime = performance.now() - startTime;
          this.stats.optimizedSuccess++;

          logger.debug(
            `✅ [QueryOptimizer] Optimized query success: ${operationName}`,
            'QueryOptimizer',
            {
              responseTime: Math.round(responseTime),
            }
          );

          return {
            data: result,
            source: 'optimized',
            responseTime: Math.round(responseTime),
            success: true,
          };
        } catch (optimizedError) {
          const errorMessage =
            optimizedError instanceof Error
              ? optimizedError.message
              : 'Unknown error';

          // Check if it's a timeout or actual error
          if (errorMessage.includes('timeout')) {
            logger.warn(
              `⏰ [QueryOptimizer] Optimized query timeout: ${operationName}`,
              'QueryOptimizer',
              {
                threshold: this.config.fallbackThreshold,
              }
            );
          } else {
            logger.warn(
              `⚠️ [QueryOptimizer] Optimized query failed: ${operationName}`,
              'QueryOptimizer',
              {
                error: errorMessage,
              }
            );
          }

          this.stats.optimizedFailure++;
          // Fall through to fallback
        }
      }

      // Use fallback query
      logger.debug(
        `🔄 [QueryOptimizer] Using fallback query: ${operationName}`,
        'QueryOptimizer'
      );

      const fallbackResult = await fallbackQuery();
      const responseTime = performance.now() - startTime;
      this.stats.fallbackUsed++;

      logger.debug(
        `✅ [QueryOptimizer] Fallback query success: ${operationName}`,
        'QueryOptimizer',
        {
          responseTime: Math.round(responseTime),
        }
      );

      return {
        data: fallbackResult,
        source: 'fallback',
        responseTime: Math.round(responseTime),
        success: true,
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        `❌ [QueryOptimizer] Both queries failed: ${operationName}`,
        'QueryOptimizer',
        {
          error: errorMessage,
          responseTime: Math.round(responseTime),
        }
      );

      // ✅ ENHANCEMENT: Report critical query failure
      errorTracking.reportDatabaseError(
        `query_optimization_${operationName}`,
        error instanceof Error ? error : new Error(errorMessage),
        {
          operationName,
          responseTime: Math.round(responseTime),
          optimizedEnabled: this.config.enableOptimizedQueries,
        }
      );

      throw error; // Re-throw the error for handling upstream
    }
  }

  /**
   * Optimized requests summary query for PostgreSQL production
   */
  async getOptimizedRequestsSummary(tenantId: string): Promise<any> {
    return this.executeWithFallback(
      // OPTIMIZED QUERY: Uses new indexes for PostgreSQL production
      async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Single optimized query combining all counts
        // Uses idx_request_dashboard_overview composite index
        const result = await db
          .select({
            status: requestTable.status,
            count: count(),
            isToday:
              sql<boolean>`CASE WHEN ${requestTable.created_at} >= ${today} THEN true ELSE false END`.as(
                'isToday'
              ),
          })
          .from(requestTable)
          .where(
            and(
              eq(requestTable.tenant_id, tenantId),
              sql`${requestTable.status} IS NOT NULL`
            )
          )
          .groupBy(
            requestTable.status,
            sql`CASE WHEN ${requestTable.created_at} >= ${today} THEN true ELSE false END`
          );

        // Process results efficiently
        let pending = 0,
          inProgress = 0,
          completed = 0,
          totalToday = 0,
          totalAll = 0;

        result.forEach(row => {
          const count = row.count;
          totalAll += count;

          if (row.isToday) {
            totalToday += count;
          }

          switch (row.status) {
            case 'Đã ghi nhận':
              pending += count;
              break;
            case 'Đang thực hiện':
              inProgress += count;
              break;
            case 'Hoàn thiện':
              completed += count;
              break;
          }
        });

        return {
          pending,
          inProgress,
          completed,
          totalToday,
          totalAll,
          lastUpdated: new Date().toISOString(),
          optimized: true,
        };
      },

      // FALLBACK QUERY: Original multiple queries approach
      async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [statusCounts, todayCount, totalCount] = await Promise.all([
          db
            .select({
              status: requestTable.status,
              count: count(),
            })
            .from(requestTable)
            .where(
              and(
                eq(requestTable.tenant_id, tenantId),
                sql`${requestTable.status} IN ('Đã ghi nhận', 'Đang thực hiện', 'Hoàn thiện')`
              )
            )
            .groupBy(requestTable.status),

          db
            .select({ count: count() })
            .from(requestTable)
            .where(
              and(
                eq(requestTable.tenant_id, tenantId),
                gte(requestTable.created_at, today)
              )
            ),

          db
            .select({ count: count() })
            .from(requestTable)
            .where(eq(requestTable.tenant_id, tenantId)),
        ]);

        const statusMap = new Map(
          statusCounts.map(item => [item.status, item.count])
        );

        return {
          pending: statusMap.get('Đã ghi nhận') || 0,
          inProgress: statusMap.get('Đang thực hiện') || 0,
          completed: statusMap.get('Hoàn thiện') || 0,
          totalToday: todayCount[0]?.count || 0,
          totalAll: totalCount[0]?.count || 0,
          lastUpdated: new Date().toISOString(),
          optimized: false,
        };
      },

      'requestsSummary'
    );
  }

  /**
   * Optimized calls summary query
   */
  async getOptimizedCallsSummary(tenantId?: string): Promise<any> {
    return this.executeWithFallback(
      // OPTIMIZED QUERY: Better aggregation for PostgreSQL
      async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Single query with complex aggregation
        const result = await db
          .select({
            totalCalls: count(),
            todayCalls:
              sql<number>`COUNT(*) FILTER (WHERE ${call_summaries.timestamp} >= ${today})`.as(
                'todayCalls'
              ),
            avgDuration:
              sql<number>`AVG(CASE WHEN ${call_summaries.duration} ~ '^[0-9]+$' THEN CAST(${call_summaries.duration} AS INTEGER) ELSE NULL END)`.as(
                'avgDuration'
              ),
            durationCount:
              sql<number>`COUNT(*) FILTER (WHERE ${call_summaries.duration} ~ '^[0-9]+$' AND ${call_summaries.duration} IS NOT NULL)`.as(
                'durationCount'
              ),
          })
          .from(call_summaries);

        const data = result[0] || {
          totalCalls: 0,
          todayCalls: 0,
          avgDuration: 0,
          durationCount: 0,
        };
        const avgDurationMinutes = data.avgDuration
          ? Math.round((data.avgDuration / 60) * 10) / 10
          : 0;

        return {
          total: data.totalCalls,
          today: data.todayCalls,
          answered: data.totalCalls,
          avgDuration:
            avgDurationMinutes > 0 ? `${avgDurationMinutes} min` : '0 min',
          avgDurationSeconds: data.avgDuration || 0,
          lastUpdated: new Date().toISOString(),
          optimized: true,
        };
      },

      // FALLBACK QUERY: Original multiple queries
      async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [allCalls, todayCalls, durationStats] = await Promise.all([
          db.select({ count: count() }).from(call_summaries),
          db
            .select({ count: count() })
            .from(call_summaries)
            .where(gte(call_summaries.timestamp, today)),
          db
            .select({
              avg: sql`AVG(CAST(${call_summaries.duration} AS INTEGER))`.as(
                'avg'
              ),
              count: count(),
            })
            .from(call_summaries)
            .where(
              and(
                sql`${call_summaries.duration} IS NOT NULL`,
                sql`${call_summaries.duration} != ''`,
                sql`${call_summaries.duration} ~ '^[0-9]+$'`
              )
            ),
        ]);

        const avgDurationSeconds = Number(durationStats[0]?.avg) || 0;
        const avgDurationMinutes =
          Math.round((avgDurationSeconds / 60) * 10) / 10;

        return {
          total: allCalls[0]?.count || 0,
          today: todayCalls[0]?.count || 0,
          answered: allCalls[0]?.count || 0,
          avgDuration:
            avgDurationMinutes > 0 ? `${avgDurationMinutes} min` : '0 min',
          avgDurationSeconds,
          lastUpdated: new Date().toISOString(),
          optimized: false,
        };
      },

      'callsSummary'
    );
  }

  /**
   * Get optimization statistics
   */
  getStats() {
    const totalAttempts =
      this.stats.optimizedSuccess + this.stats.optimizedFailure;
    const optimizedSuccessRate =
      totalAttempts > 0
        ? (this.stats.optimizedSuccess / totalAttempts) * 100
        : 0;
    const fallbackRate =
      this.stats.totalQueries > 0
        ? (this.stats.fallbackUsed / this.stats.totalQueries) * 100
        : 0;

    return {
      ...this.stats,
      optimizedSuccessRate: Math.round(optimizedSuccessRate * 100) / 100,
      fallbackRate: Math.round(fallbackRate * 100) / 100,
      config: this.config,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create timeout promise for fallback mechanism
   */
  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Query timeout after ${timeoutMs}ms`)),
        timeoutMs
      );
    });
  }

  /**
   * Reset statistics (for testing)
   */
  resetStats(): void {
    this.stats = {
      optimizedSuccess: 0,
      optimizedFailure: 0,
      fallbackUsed: 0,
      totalQueries: 0,
    };
  }
}

// Singleton instance
export const queryOptimizer = new QueryOptimizer();

// Export for debugging in development
if (process.env.NODE_ENV === 'development') {
  (global as any).queryOptimizer = queryOptimizer;
}

export default queryOptimizer;
