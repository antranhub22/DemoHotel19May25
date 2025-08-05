/**
 * 🔍 STANDARDIZED QUERY BUILDER
 *
 * Advanced query builder with:
 * - Forced field selection (no SELECT *)
 * - Automatic tenant scoping
 * - Performance monitoring
 * - Type safety
 * - Complex filtering
 * - Optimized pagination
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

export interface QueryOptions<T> {
  select?: (keyof T)[];
  where?: any;
  orderBy?: Array<{ field: keyof T; direction: "asc" | "desc" }>;
  include?: any;
  limit?: number;
  offset?: number;
  tenantId?: string;
}

export interface PaginatedQueryOptions<T> extends QueryOptions<T> {
  page: number;
  limit: number;
}

export interface QueryResult<T> {
  data: T[];
  count: number;
  executionTime: number;
}

export interface PaginatedQueryResult<T> extends QueryResult<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AggregateQueryOptions {
  where?: any;
  groupBy?: string[];
  having?: any;
  tenantId?: string;
}

export interface AggregateResult {
  data: any[];
  executionTime: number;
}

/**
 * ✅ QUERY BUILDER CLASS
 *
 * Prevents SELECT * and provides optimized query patterns
 */
export class QueryBuilder<T extends Record<string, any>> {
  private prisma: PrismaClient;
  private tableName: string;
  private tenantField: string;
  private model: any;

  constructor(
    prisma: PrismaClient,
    tableName: string,
    tenantField: string = "tenant_id",
  ) {
    this.prisma = prisma;
    this.tableName = tableName;
    this.tenantField = tenantField;
    this.model = (prisma as any)[tableName];

    if (!this.model) {
      throw new Error(`Model ${tableName} not found in Prisma client`);
    }
  }

  /**
   * 🎯 FIND MANY with performance optimization
   */
  async findMany(options: QueryOptions<T>): Promise<QueryResult<T>> {
    const startTime = Date.now();

    try {
      logger.debug(
        `[QueryBuilder:${this.tableName}] Executing findMany`,
        "Query",
        {
          tableName: this.tableName,
          hasSelect: !!options.select,
          hasWhere: !!options.where,
          hasOrderBy: !!options.orderBy,
          tenantId: options.tenantId,
        },
      );

      // Force field selection - prevent SELECT *
      if (!options.select && !options.include) {
        logger.warn(
          `[QueryBuilder:${this.tableName}] No select fields specified, using default safe fields`,
          "Query",
        );
        options.select = this.getDefaultSelectFields();
      }

      // Build query
      const query = this.buildQuery(options);

      // Execute query
      const data = await this.model.findMany(query);

      const executionTime = Date.now() - startTime;

      logger.success(
        `[QueryBuilder:${this.tableName}] FindMany completed`,
        "Query",
        {
          resultCount: data.length,
          executionTime: `${executionTime}ms`,
          fieldsSelected: options.select?.length || "include used",
        },
      );

      return {
        data,
        count: data.length,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(
        `[QueryBuilder:${this.tableName}] FindMany failed`,
        "Query",
        {
          options,
          executionTime: `${executionTime}ms`,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 PAGINATED FIND with optimization
   */
  async findManyPaginated(
    options: PaginatedQueryOptions<T>,
  ): Promise<PaginatedQueryResult<T>> {
    const startTime = Date.now();

    try {
      const { page, limit, ...queryOptions } = options;

      logger.debug(
        `[QueryBuilder:${this.tableName}] Executing paginated query`,
        "Query",
        {
          tableName: this.tableName,
          page,
          limit,
          tenantId: options.tenantId,
        },
      );

      // Calculate offset
      const offset = (page - 1) * limit;

      // Force field selection
      if (!queryOptions.select && !queryOptions.include) {
        queryOptions.select = this.getDefaultSelectFields();
      }

      // Build queries
      const baseQuery = this.buildQuery(queryOptions);
      const countQuery = this.buildCountQuery(queryOptions);

      // Add pagination
      const paginatedQuery = {
        ...baseQuery,
        skip: offset,
        take: limit,
      };

      // Execute queries in parallel
      const [data, total] = await Promise.all([
        this.model.findMany(paginatedQuery),
        this.model.count(countQuery),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const executionTime = Date.now() - startTime;

      logger.success(
        `[QueryBuilder:${this.tableName}] Paginated query completed`,
        "Query",
        {
          resultCount: data.length,
          total,
          page,
          totalPages,
          executionTime: `${executionTime}ms`,
        },
      );

      return {
        data,
        count: data.length,
        executionTime,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(
        `[QueryBuilder:${this.tableName}] Paginated query failed`,
        "Query",
        {
          options,
          executionTime: `${executionTime}ms`,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 FIND UNIQUE with safety
   */
  async findUnique(
    where: any,
    select?: (keyof T)[],
    tenantId?: string,
    include?: any,
  ): Promise<T | null> {
    const startTime = Date.now();

    try {
      logger.debug(
        `[QueryBuilder:${this.tableName}] Executing findUnique`,
        "Query",
        {
          tableName: this.tableName,
          hasSelect: !!select,
          tenantId,
        },
      );

      // Add tenant scoping
      const whereClause = this.addTenantScope(where, tenantId);

      // Force field selection
      if (!select && !include) {
        select = this.getDefaultSelectFields();
      }

      const query: any = { where: whereClause };

      if (select && select.length > 0) {
        query.select = this.buildSelectObject(select);
      }

      if (include) {
        query.include = include;
      }

      const result = await this.model.findUnique(query);

      const executionTime = Date.now() - startTime;

      logger.success(
        `[QueryBuilder:${this.tableName}] FindUnique completed`,
        "Query",
        {
          found: !!result,
          executionTime: `${executionTime}ms`,
        },
      );

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(
        `[QueryBuilder:${this.tableName}] FindUnique failed`,
        "Query",
        {
          where,
          executionTime: `${executionTime}ms`,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 COUNT with performance optimization
   */
  async count(where: any = {}, tenantId?: string): Promise<number> {
    const startTime = Date.now();

    try {
      logger.debug(
        `[QueryBuilder:${this.tableName}] Executing count`,
        "Query",
        {
          tableName: this.tableName,
          hasWhere: Object.keys(where).length > 0,
          tenantId,
        },
      );

      const whereClause = this.addTenantScope(where, tenantId);

      const result = await this.model.count({
        where: whereClause,
      });

      const executionTime = Date.now() - startTime;

      logger.success(
        `[QueryBuilder:${this.tableName}] Count completed`,
        "Query",
        {
          count: result,
          executionTime: `${executionTime}ms`,
        },
      );

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`[QueryBuilder:${this.tableName}] Count failed`, "Query", {
        where,
        executionTime: `${executionTime}ms`,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 AGGREGATE queries with optimization
   */
  async aggregate(options: AggregateQueryOptions): Promise<AggregateResult> {
    const startTime = Date.now();

    try {
      logger.debug(
        `[QueryBuilder:${this.tableName}] Executing aggregate`,
        "Query",
        {
          tableName: this.tableName,
          groupBy: options.groupBy,
          tenantId: options.tenantId,
        },
      );

      const whereClause = this.addTenantScope(
        options.where || {},
        options.tenantId,
      );

      let result;

      if (options.groupBy && options.groupBy.length > 0) {
        // Group by query
        result = await this.model.groupBy({
          by: options.groupBy,
          where: whereClause,
          _count: { _all: true },
          ...(options.having && { having: options.having }),
        });
      } else {
        // Simple aggregate
        result = await this.model.aggregate({
          where: whereClause,
          _count: { _all: true },
          _max: { created_at: true },
          _min: { created_at: true },
        });
      }

      const executionTime = Date.now() - startTime;

      logger.success(
        `[QueryBuilder:${this.tableName}] Aggregate completed`,
        "Query",
        {
          resultCount: Array.isArray(result) ? result.length : 1,
          executionTime: `${executionTime}ms`,
        },
      );

      return {
        data: Array.isArray(result) ? result : [result],
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(
        `[QueryBuilder:${this.tableName}] Aggregate failed`,
        "Query",
        {
          options,
          executionTime: `${executionTime}ms`,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 RAW QUERY with monitoring
   */
  async raw<R = any>(query: string, params: any[] = []): Promise<R[]> {
    const startTime = Date.now();

    try {
      logger.debug(
        `[QueryBuilder:${this.tableName}] Executing raw query`,
        "Query",
        {
          tableName: this.tableName,
          query: query.substring(0, 100) + "...",
          paramCount: params.length,
        },
      );

      const result = await this.prisma.$queryRawUnsafe<R[]>(query, ...params);

      const executionTime = Date.now() - startTime;

      logger.success(
        `[QueryBuilder:${this.tableName}] Raw query completed`,
        "Query",
        {
          resultCount: result.length,
          executionTime: `${executionTime}ms`,
        },
      );

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(
        `[QueryBuilder:${this.tableName}] Raw query failed`,
        "Query",
        {
          query: query.substring(0, 100) + "...",
          executionTime: `${executionTime}ms`,
          error,
        },
      );
      throw error;
    }
  }

  // ======================================
  // HELPER METHODS
  // ======================================

  private buildQuery(options: QueryOptions<T>): any {
    const query: any = {};

    // Where clause with tenant scoping
    if (options.where || options.tenantId) {
      query.where = this.addTenantScope(options.where || {}, options.tenantId);
    }

    // Select fields
    if (options.select && options.select.length > 0) {
      query.select = this.buildSelectObject(options.select);
    }

    // Include relations
    if (options.include) {
      query.include = options.include;
    }

    // Order by
    if (options.orderBy && options.orderBy.length > 0) {
      query.orderBy = options.orderBy.map((order) => ({
        [order.field]: order.direction,
      }));
    }

    return query;
  }

  private buildCountQuery(options: QueryOptions<T>): any {
    const query: any = {};

    if (options.where || options.tenantId) {
      query.where = this.addTenantScope(options.where || {}, options.tenantId);
    }

    return query;
  }

  private buildSelectObject(fields: (keyof T)[]): any {
    return fields.reduce((acc, field) => {
      acc[field as string] = true;
      return acc;
    }, {} as any);
  }

  private addTenantScope(where: any, tenantId?: string): any {
    if (!tenantId) return where;

    return {
      ...where,
      [this.tenantField]: tenantId,
    };
  }

  private getDefaultSelectFields(): (keyof T)[] {
    // Define safe default fields for each table
    const defaultFields: Record<string, string[]> = {
      request: [
        "id",
        "room_number",
        "guest_name",
        "request_content",
        "status",
        "created_at",
        "updated_at",
      ],
      call: [
        "id",
        "call_id_vapi",
        "room_number",
        "language",
        "service_type",
        "start_time",
        "end_time",
        "duration",
        "created_at",
      ],
      transcript: ["id", "call_id", "content", "role", "timestamp"],
      staff: [
        "id",
        "username",
        "first_name",
        "last_name",
        "email",
        "role",
        "is_active",
        "created_at",
      ],
      tenants: [
        "id",
        "hotel_name",
        "subdomain",
        "subscription_plan",
        "is_active",
        "created_at",
      ],
      call_summaries: [
        "id",
        "call_id",
        "content",
        "timestamp",
        "room_number",
        "duration",
      ],
      services: [
        "id",
        "name",
        "description",
        "price",
        "currency",
        "category",
        "is_active",
      ],
      hotel_profiles: [
        "id",
        "tenant_id",
        "vapi_assistant_id",
        "created_at",
        "updated_at",
      ],
    };

    const fields = defaultFields[this.tableName] || [
      "id",
      "created_at",
      "updated_at",
    ];
    return fields as (keyof T)[];
  }

  // ======================================
  // FLUENT QUERY BUILDER INTERFACE
  // ======================================

  where(conditions: any): FluentQueryBuilder<T> {
    return new FluentQueryBuilder(this, { where: conditions });
  }

  select(fields: (keyof T)[]): FluentQueryBuilder<T> {
    return new FluentQueryBuilder(this, { select: fields });
  }

  orderBy(
    field: keyof T,
    direction: "asc" | "desc" = "asc",
  ): FluentQueryBuilder<T> {
    return new FluentQueryBuilder(this, { orderBy: [{ field, direction }] });
  }

  tenantScope(tenantId: string): FluentQueryBuilder<T> {
    return new FluentQueryBuilder(this, { tenantId });
  }

  limit(count: number): FluentQueryBuilder<T> {
    return new FluentQueryBuilder(this, { limit: count });
  }
}

/**
 * ✅ FLUENT QUERY BUILDER
 *
 * Provides chainable query interface
 */
export class FluentQueryBuilder<T extends Record<string, any>> {
  private queryBuilder: QueryBuilder<T>;
  private options: QueryOptions<T>;

  constructor(
    queryBuilder: QueryBuilder<T>,
    initialOptions: QueryOptions<T> = {},
  ) {
    this.queryBuilder = queryBuilder;
    this.options = { ...initialOptions };
  }

  where(conditions: any): FluentQueryBuilder<T> {
    return new FluentQueryBuilder(this.queryBuilder, {
      ...this.options,
      where: { ...this.options.where, ...conditions },
    });
  }

  select(fields: (keyof T)[]): FluentQueryBuilder<T> {
    return new FluentQueryBuilder(this.queryBuilder, {
      ...this.options,
      select: fields,
    });
  }

  orderBy(
    field: keyof T,
    direction: "asc" | "desc" = "asc",
  ): FluentQueryBuilder<T> {
    const newOrderBy = [...(this.options.orderBy || []), { field, direction }];
    return new FluentQueryBuilder(this.queryBuilder, {
      ...this.options,
      orderBy: newOrderBy,
    });
  }

  include(relations: any): FluentQueryBuilder<T> {
    return new FluentQueryBuilder(this.queryBuilder, {
      ...this.options,
      include: relations,
    });
  }

  tenantScope(tenantId: string): FluentQueryBuilder<T> {
    return new FluentQueryBuilder(this.queryBuilder, {
      ...this.options,
      tenantId,
    });
  }

  limit(count: number): FluentQueryBuilder<T> {
    return new FluentQueryBuilder(this.queryBuilder, {
      ...this.options,
      limit: count,
    });
  }

  offset(count: number): FluentQueryBuilder<T> {
    return new FluentQueryBuilder(this.queryBuilder, {
      ...this.options,
      offset: count,
    });
  }

  // Execute methods
  async execute(): Promise<QueryResult<T>> {
    return await this.queryBuilder.findMany(this.options);
  }

  async executePaginated(
    page: number,
    pageSize: number,
  ): Promise<PaginatedQueryResult<T>> {
    return await this.queryBuilder.findManyPaginated({
      ...this.options,
      page,
      limit: pageSize,
    });
  }

  async executeOne(): Promise<T | null> {
    const result = await this.queryBuilder.findMany({
      ...this.options,
      limit: 1,
    });
    return result.data[0] || null;
  }

  async executeCount(): Promise<number> {
    return await this.queryBuilder.count(
      this.options.where || {},
      this.options.tenantId,
    );
  }
}
