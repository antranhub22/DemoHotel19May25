/**
 * 🚀 QUERY OPTIMIZER
 *
 * Advanced query optimization and monitoring system with:
 * - Slow query detection
 * - Automatic query rewriting
 * - Performance analytics
 * - Index recommendations
 * - Query plan analysis
 */

import { PrismaClient } from "../../../generated/prisma";
import { logger } from "../utils/logger";

export interface QueryPerformanceMetrics {
  queryId: string;
  query: string;
  executionTime: number;
  resultCount: number;
  timestamp: Date;
  isSlowQuery: boolean;
  optimizationSuggestions: string[];
}

export interface SlowQueryAlert {
  queryId: string;
  executionTime: number;
  threshold: number;
  frequency: number;
  tableName: string;
  suggestedIndexes: string[];
}

export interface QueryOptimizationReport {
  totalQueries: number;
  slowQueries: number;
  averageExecutionTime: number;
  slowQueryThreshold: number;
  topSlowQueries: QueryPerformanceMetrics[];
  indexRecommendations: string[];
  optimizationOpportunities: string[];
}

export class QueryOptimizer {
  private prisma: PrismaClient;
  private slowQueryThreshold: number = 1000; // 1 second
  private queryMetrics: Map<string, QueryPerformanceMetrics[]> = new Map();
  private queryExecutionStats: Map<
    string,
    { count: number; totalTime: number }
  > = new Map();

  constructor(prisma: PrismaClient, slowQueryThreshold: number = 1000) {
    this.prisma = prisma;
    this.slowQueryThreshold = slowQueryThreshold;
  }

  /**
   * 🎯 TRACK QUERY PERFORMANCE
   */
  trackQuery(
    queryId: string,
    query: string,
    executionTime: number,
    resultCount: number = 0,
  ): void {
    const metrics: QueryPerformanceMetrics = {
      queryId,
      query: this.sanitizeQuery(query),
      executionTime,
      resultCount,
      timestamp: new Date(),
      isSlowQuery: executionTime > this.slowQueryThreshold,
      optimizationSuggestions: this.generateOptimizationSuggestions(
        query,
        executionTime,
        resultCount,
      ),
    };

    // Store metrics
    if (!this.queryMetrics.has(queryId)) {
      this.queryMetrics.set(queryId, []);
    }
    this.queryMetrics.get(queryId)!.push(metrics);

    // Update execution stats
    const stats = this.queryExecutionStats.get(queryId) || {
      count: 0,
      totalTime: 0,
    };
    stats.count++;
    stats.totalTime += executionTime;
    this.queryExecutionStats.set(queryId, stats);

    // Log slow queries
    if (metrics.isSlowQuery) {
      this.logSlowQuery(metrics);
    }

    // Cleanup old metrics (keep only last 1000 per query)
    const queryMetricsList = this.queryMetrics.get(queryId)!;
    if (queryMetricsList.length > 1000) {
      queryMetricsList.splice(0, queryMetricsList.length - 1000);
    }
  }

  /**
   * 🎯 DETECT SLOW QUERIES
   */
  getSlowQueries(timeWindowMinutes: number = 60): SlowQueryAlert[] {
    const timeThreshold = new Date();
    timeThreshold.setMinutes(timeThreshold.getMinutes() - timeWindowMinutes);

    const slowQueries: SlowQueryAlert[] = [];

    for (const [queryId, metricsList] of this.queryMetrics.entries()) {
      const recentMetrics = metricsList.filter(
        (m) => m.timestamp >= timeThreshold && m.isSlowQuery,
      );

      if (recentMetrics.length > 0) {
        const avgExecutionTime =
          recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) /
          recentMetrics.length;

        const alert: SlowQueryAlert = {
          queryId,
          executionTime: avgExecutionTime,
          threshold: this.slowQueryThreshold,
          frequency: recentMetrics.length,
          tableName: this.extractTableName(recentMetrics[0].query),
          suggestedIndexes: this.suggestIndexes(recentMetrics[0].query),
        };

        slowQueries.push(alert);
      }
    }

    return slowQueries.sort((a, b) => b.executionTime - a.executionTime);
  }

  /**
   * 🎯 GENERATE OPTIMIZATION REPORT
   */
  generateOptimizationReport(
    timeWindowHours: number = 24,
  ): QueryOptimizationReport {
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - timeWindowHours);

    let totalQueries = 0;
    let slowQueries = 0;
    let totalExecutionTime = 0;
    const allMetrics: QueryPerformanceMetrics[] = [];

    // Aggregate metrics
    for (const metricsList of this.queryMetrics.values()) {
      const recentMetrics = metricsList.filter(
        (m) => m.timestamp >= timeThreshold,
      );

      for (const metric of recentMetrics) {
        totalQueries++;
        totalExecutionTime += metric.executionTime;
        allMetrics.push(metric);

        if (metric.isSlowQuery) {
          slowQueries++;
        }
      }
    }

    // Get top slow queries
    const topSlowQueries = allMetrics
      .filter((m) => m.isSlowQuery)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    // Generate index recommendations
    const indexRecommendations = this.generateIndexRecommendations(allMetrics);

    // Generate optimization opportunities
    const optimizationOpportunities =
      this.generateOptimizationOpportunities(allMetrics);

    return {
      totalQueries,
      slowQueries,
      averageExecutionTime:
        totalQueries > 0 ? totalExecutionTime / totalQueries : 0,
      slowQueryThreshold: this.slowQueryThreshold,
      topSlowQueries,
      indexRecommendations,
      optimizationOpportunities,
    };
  }

  /**
   * 🎯 OPTIMIZE QUERY AUTOMATICALLY
   */
  async optimizeQuery(query: string): Promise<string> {
    try {
      logger.debug(
        "[QueryOptimizer] Analyzing query for optimization",
        "Optimizer",
        {
          queryLength: query.length,
        },
      );

      let optimizedQuery = query;

      // Apply optimization rules
      optimizedQuery = this.optimizeSelectFields(optimizedQuery);
      optimizedQuery = this.optimizeWhereClause(optimizedQuery);
      optimizedQuery = this.optimizeJoins(optimizedQuery);
      optimizedQuery = this.optimizeOrderBy(optimizedQuery);
      optimizedQuery = this.optimizeLimits(optimizedQuery);

      if (optimizedQuery !== query) {
        logger.info("[QueryOptimizer] Query optimized", "Optimizer", {
          originalLength: query.length,
          optimizedLength: optimizedQuery.length,
          optimizations: this.getAppliedOptimizations(query, optimizedQuery),
        });
      }

      return optimizedQuery;
    } catch (error) {
      logger.error("[QueryOptimizer] Query optimization failed", "Optimizer", {
        query: query.substring(0, 100) + "...",
        error,
      });
      return query; // Return original query if optimization fails
    }
  }

  /**
   * 🎯 ANALYZE QUERY EXECUTION PLAN
   */
  async analyzeQueryPlan(query: string): Promise<any> {
    try {
      logger.debug(
        "[QueryOptimizer] Analyzing query execution plan",
        "Optimizer",
      );

      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
      const result = await this.prisma.$queryRawUnsafe(explainQuery);

      const analysis = this.analyzeExecutionPlan(result);

      logger.success("[QueryOptimizer] Query plan analyzed", "Optimizer", {
        totalCost: analysis.totalCost,
        actualTime: analysis.actualTime,
        recommendations: analysis.recommendations.length,
      });

      return analysis;
    } catch (error) {
      logger.error("[QueryOptimizer] Query plan analysis failed", "Optimizer", {
        query: query.substring(0, 100) + "...",
        error,
      });
      throw error;
    }
  }

  // ======================================
  // PRIVATE OPTIMIZATION METHODS
  // ======================================

  private generateOptimizationSuggestions(
    query: string,
    executionTime: number,
    resultCount: number,
  ): string[] {
    const suggestions: string[] = [];

    // High execution time
    if (executionTime > this.slowQueryThreshold) {
      suggestions.push(
        "Query execution time is high - consider adding indexes",
      );
    }

    // Large result set without pagination
    if (resultCount > 1000 && !query.toLowerCase().includes("limit")) {
      suggestions.push(
        "Large result set without pagination - add LIMIT clause",
      );
    }

    // SELECT * usage
    if (query.toLowerCase().includes("select *")) {
      suggestions.push("Avoid SELECT * - specify required fields only");
    }

    // Missing WHERE clause
    if (!query.toLowerCase().includes("where") && resultCount > 100) {
      suggestions.push("Consider adding WHERE clause to filter results");
    }

    // Unoptimized ORDER BY
    if (query.toLowerCase().includes("order by") && executionTime > 500) {
      suggestions.push("ORDER BY is expensive - ensure proper indexes exist");
    }

    return suggestions;
  }

  private extractTableName(query: string): string {
    const match = query.match(/from\s+(\w+)/i);
    return match ? match[1] : "unknown";
  }

  private suggestIndexes(query: string): string[] {
    const suggestions: string[] = [];
    const tableName = this.extractTableName(query);

    // WHERE clause analysis
    const whereMatch = query.match(
      /where\s+(.+?)(?:\s+order\s+by|\s+group\s+by|\s+limit|$)/i,
    );
    if (whereMatch) {
      const whereClause = whereMatch[1];

      // Extract column names from WHERE clause
      const columnMatches = whereClause.match(/(\w+)\s*[=<>]/g);
      if (columnMatches) {
        const columns = columnMatches.map((match) =>
          match.replace(/\s*[=<>].*/, "").trim(),
        );
        suggestions.push(
          `CREATE INDEX idx_${tableName}_${columns.join("_")} ON ${tableName} (${columns.join(", ")});`,
        );
      }
    }

    // ORDER BY analysis
    const orderByMatch = query.match(/order\s+by\s+(\w+)/i);
    if (orderByMatch) {
      const orderColumn = orderByMatch[1];
      suggestions.push(
        `CREATE INDEX idx_${tableName}_${orderColumn} ON ${tableName} (${orderColumn});`,
      );
    }

    return suggestions;
  }

  private optimizeSelectFields(query: string): string {
    // Replace SELECT * with specific fields for known tables
    const tableFieldMap: Record<string, string[]> = {
      request: [
        "id",
        "room_number",
        "guest_name",
        "request_content",
        "status",
        "created_at",
      ],
      call: [
        "id",
        "call_id_vapi",
        "room_number",
        "language",
        "duration",
        "created_at",
      ],
      transcript: ["id", "call_id", "content", "role", "timestamp"],
      staff: ["id", "username", "first_name", "last_name", "role", "is_active"],
    };

    for (const [table, fields] of Object.entries(tableFieldMap)) {
      const selectAllPattern = new RegExp(
        `select\\s+\\*\\s+from\\s+${table}`,
        "gi",
      );
      if (selectAllPattern.test(query)) {
        query = query.replace(
          selectAllPattern,
          `SELECT ${fields.join(", ")} FROM ${table}`,
        );
      }
    }

    return query;
  }

  private optimizeWhereClause(query: string): string {
    // Add tenant_id filter if missing for multi-tenant tables
    const multiTenantTables = [
      "request",
      "call",
      "transcript",
      "staff",
      "services",
    ];

    for (const table of multiTenantTables) {
      const pattern = new RegExp(
        `from\\s+${table}(?:\\s+(?:where|order|group|limit))|$`,
        "gi",
      );
      if (pattern.test(query) && !query.includes("tenant_id")) {
        // This is a complex optimization that would need context about the current tenant
        // In practice, this would be handled by the QueryBuilder
      }
    }

    return query;
  }

  private optimizeJoins(query: string): string {
    // Optimize JOIN order and conditions
    // This is a complex optimization that would analyze JOIN patterns
    return query;
  }

  private optimizeOrderBy(query: string): string {
    // Ensure ORDER BY columns have indexes
    // Add index hints if supported by the database
    return query;
  }

  private optimizeLimits(query: string): string {
    // Add reasonable LIMIT if missing and result set is likely large
    if (
      !query.toLowerCase().includes("limit") &&
      !query.toLowerCase().includes("count(")
    ) {
      // Add a default limit for safety
      query += " LIMIT 1000";
    }

    return query;
  }

  private getAppliedOptimizations(
    originalQuery: string,
    optimizedQuery: string,
  ): string[] {
    const optimizations: string[] = [];

    if (
      originalQuery.includes("SELECT *") &&
      !optimizedQuery.includes("SELECT *")
    ) {
      optimizations.push("Replaced SELECT * with specific fields");
    }

    if (!originalQuery.includes("LIMIT") && optimizedQuery.includes("LIMIT")) {
      optimizations.push("Added LIMIT clause for safety");
    }

    return optimizations;
  }

  private analyzeExecutionPlan(planResult: any): any {
    // Analyze PostgreSQL execution plan
    const plan = planResult[0]?.["QUERY PLAN"]?.[0];

    if (!plan) {
      return { totalCost: 0, actualTime: 0, recommendations: [] };
    }

    const analysis = {
      totalCost: plan["Total Cost"] || 0,
      actualTime: plan["Actual Total Time"] || 0,
      recommendations: [] as string[],
    };

    // Analyze for common performance issues
    if (plan["Node Type"] === "Seq Scan") {
      analysis.recommendations.push(
        "Sequential scan detected - consider adding index",
      );
    }

    if (plan["Actual Total Time"] > 1000) {
      analysis.recommendations.push(
        "High execution time - review query optimization",
      );
    }

    return analysis;
  }

  private sanitizeQuery(query: string): string {
    // Remove sensitive data from query logging
    return query
      .replace(/password\s*=\s*'[^']+'/gi, "password='***'")
      .replace(/token\s*=\s*'[^']+'/gi, "token='***'")
      .substring(0, 500); // Limit length for logging
  }

  private logSlowQuery(metrics: QueryPerformanceMetrics): void {
    logger.warn("[QueryOptimizer] Slow query detected", "Performance", {
      queryId: metrics.queryId,
      executionTime: `${metrics.executionTime}ms`,
      threshold: `${this.slowQueryThreshold}ms`,
      resultCount: metrics.resultCount,
      query: metrics.query.substring(0, 200) + "...",
      suggestions: metrics.optimizationSuggestions,
    });
  }

  private generateIndexRecommendations(
    metrics: QueryPerformanceMetrics[],
  ): string[] {
    const recommendations = new Set<string>();

    for (const metric of metrics) {
      if (metric.isSlowQuery) {
        const indexes = this.suggestIndexes(metric.query);
        indexes.forEach((index) => recommendations.add(index));
      }
    }

    return Array.from(recommendations);
  }

  private generateOptimizationOpportunities(
    metrics: QueryPerformanceMetrics[],
  ): string[] {
    const opportunities = new Set<string>();

    const selectStarCount = metrics.filter((m) =>
      m.query.includes("SELECT *"),
    ).length;
    if (selectStarCount > 0) {
      opportunities.add(
        `Found ${selectStarCount} queries using SELECT * - specify required fields only`,
      );
    }

    const unpaginatedCount = metrics.filter(
      (m) => m.resultCount > 100 && !m.query.toLowerCase().includes("limit"),
    ).length;
    if (unpaginatedCount > 0) {
      opportunities.add(
        `Found ${unpaginatedCount} queries returning large result sets without pagination`,
      );
    }

    const slowQueryCount = metrics.filter((m) => m.isSlowQuery).length;
    if (slowQueryCount > metrics.length * 0.1) {
      opportunities.add(
        `High percentage of slow queries (${((slowQueryCount / metrics.length) * 100).toFixed(1)}%) - review indexing strategy`,
      );
    }

    return Array.from(opportunities);
  }

  // ======================================
  // PUBLIC UTILITY METHODS
  // ======================================

  getQueryStats(queryId: string): { count: number; avgTime: number } | null {
    const stats = this.queryExecutionStats.get(queryId);
    if (!stats) return null;

    return {
      count: stats.count,
      avgTime: stats.totalTime / stats.count,
    };
  }

  clearMetrics(): void {
    this.queryMetrics.clear();
    this.queryExecutionStats.clear();
    logger.info("[QueryOptimizer] Query metrics cleared", "Optimizer");
  }

  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
    logger.info("[QueryOptimizer] Slow query threshold updated", "Optimizer", {
      newThreshold: `${threshold}ms`,
    });
  }
}
