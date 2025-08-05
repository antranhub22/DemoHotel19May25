/**
 * 🏗️ BASE REPOSITORY PATTERN
 *
 * Advanced repository pattern with:
 * - Type safety with Prisma
 * - Automatic tenant scoping
 * - Performance optimization
 * - Error handling
 * - Audit logging
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface QueryOptions {
  tenantId?: string;
  select?: string[];
  where?: any;
  orderBy?: any;
  include?: any;
}

/**
 * ✅ BASE REPOSITORY CLASS
 *
 * Provides common database operations with:
 * - Automatic tenant scoping
 * - Performance monitoring
 * - Error handling
 * - Type safety
 */
export abstract class BaseRepository<T extends Record<string, any>> {
  protected prisma: PrismaClient;
  protected tableName: string;
  protected tenantField: string;

  constructor(
    prisma: PrismaClient,
    tableName: string,
    tenantField: string = "tenant_id",
  ) {
    this.prisma = prisma;
    this.tableName = tableName;
    this.tenantField = tenantField;
  }

  /**
   * 🎯 FIND BY ID with automatic tenant scoping
   */
  async findById(id: string | number, tenantId?: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      logger.debug(
        `[${this.tableName}Repository] Finding by ID`,
        "Repository",
        {
          id,
          tenantId,
          table: this.tableName,
        },
      );

      const whereClause: any = { id };
      if (tenantId) {
        whereClause[this.tenantField] = tenantId;
      }

      const model = this.getModel();
      const result = await model.findUnique({
        where: whereClause,
      });

      const duration = Date.now() - startTime;
      logger.debug(
        `[${this.tableName}Repository] FindById completed`,
        "Repository",
        {
          found: !!result,
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error(
        `[${this.tableName}Repository] FindById error`,
        "Repository",
        {
          id,
          tenantId,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 FIND MANY with pagination and filtering
   */
  async findMany(
    options: QueryOptions & PaginationOptions,
  ): Promise<PaginatedResult<T>> {
    const startTime = Date.now();

    try {
      const {
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortDirection = "desc",
        tenantId,
        where = {},
        select,
        include,
      } = options;

      logger.debug(`[${this.tableName}Repository] Finding many`, "Repository", {
        page,
        limit,
        sortBy,
        sortDirection,
        tenantId,
        whereConditions: Object.keys(where).length,
      });

      // Build where clause with tenant scoping
      const whereClause = { ...where };
      if (tenantId) {
        whereClause[this.tenantField] = tenantId;
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build query options
      const queryOptions: any = {
        where: whereClause,
        orderBy: { [sortBy]: sortDirection },
        skip: offset,
        take: limit,
      };

      if (select && select.length > 0) {
        // Convert array to Prisma select object
        queryOptions.select = select.reduce((acc, field) => {
          acc[field] = true;
          return acc;
        }, {} as any);
      }

      if (include) {
        queryOptions.include = include;
      }

      const model = this.getModel();

      // Execute query and count in parallel
      const [data, total] = await Promise.all([
        model.findMany(queryOptions),
        model.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);
      const duration = Date.now() - startTime;

      logger.debug(
        `[${this.tableName}Repository] FindMany completed`,
        "Repository",
        {
          resultCount: data.length,
          total,
          totalPages,
          duration: `${duration}ms`,
        },
      );

      return {
        data,
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
      logger.error(
        `[${this.tableName}Repository] FindMany error`,
        "Repository",
        {
          options,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 CREATE with validation and audit
   */
  async create(
    data: Omit<T, "id" | "created_at" | "updated_at">,
    tenantId?: string,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      logger.debug(
        `[${this.tableName}Repository] Creating record`,
        "Repository",
        {
          tenantId,
          hasData: !!data,
        },
      );

      // Add tenant ID if provided
      const createData = { ...data };
      if (tenantId) {
        createData[this.tenantField] = tenantId;
      }

      // Add timestamps
      createData.created_at = new Date();
      createData.updated_at = new Date();

      const model = this.getModel();
      const result = await model.create({
        data: createData,
      });

      const duration = Date.now() - startTime;
      logger.success(
        `[${this.tableName}Repository] Record created`,
        "Repository",
        {
          id: result.id,
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error(`[${this.tableName}Repository] Create error`, "Repository", {
        tenantId,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 UPDATE with tenant scoping
   */
  async update(
    id: string | number,
    data: Partial<Omit<T, "id" | "created_at">>,
    tenantId?: string,
  ): Promise<T | null> {
    const startTime = Date.now();

    try {
      logger.debug(
        `[${this.tableName}Repository] Updating record`,
        "Repository",
        {
          id,
          tenantId,
          updateFields: Object.keys(data).length,
        },
      );

      // Build where clause with tenant scoping
      const whereClause: any = { id };
      if (tenantId) {
        whereClause[this.tenantField] = tenantId;
      }

      // Add updated timestamp
      const updateData = {
        ...data,
        updated_at: new Date(),
      };

      const model = this.getModel();
      const result = await model.update({
        where: whereClause,
        data: updateData,
      });

      const duration = Date.now() - startTime;
      logger.success(
        `[${this.tableName}Repository] Record updated`,
        "Repository",
        {
          id,
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error(`[${this.tableName}Repository] Update error`, "Repository", {
        id,
        tenantId,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 DELETE with tenant scoping
   */
  async delete(id: string | number, tenantId?: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      logger.debug(
        `[${this.tableName}Repository] Deleting record`,
        "Repository",
        {
          id,
          tenantId,
        },
      );

      // Build where clause with tenant scoping
      const whereClause: any = { id };
      if (tenantId) {
        whereClause[this.tenantField] = tenantId;
      }

      const model = this.getModel();
      await model.delete({
        where: whereClause,
      });

      const duration = Date.now() - startTime;
      logger.success(
        `[${this.tableName}Repository] Record deleted`,
        "Repository",
        {
          id,
          duration: `${duration}ms`,
        },
      );

      return true;
    } catch (error) {
      logger.error(`[${this.tableName}Repository] Delete error`, "Repository", {
        id,
        tenantId,
        error,
      });
      return false;
    }
  }

  /**
   * 🎯 COUNT with filtering
   */
  async count(where: any = {}, tenantId?: string): Promise<number> {
    const startTime = Date.now();

    try {
      const whereClause = { ...where };
      if (tenantId) {
        whereClause[this.tenantField] = tenantId;
      }

      const model = this.getModel();
      const result = await model.count({
        where: whereClause,
      });

      const duration = Date.now() - startTime;
      logger.debug(
        `[${this.tableName}Repository] Count completed`,
        "Repository",
        {
          count: result,
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error(`[${this.tableName}Repository] Count error`, "Repository", {
        where,
        tenantId,
        error,
      });
      throw error;
    }
  }

  /**
   * 🎯 BATCH OPERATIONS
   */
  async createMany(
    records: Omit<T, "id" | "created_at" | "updated_at">[],
    tenantId?: string,
  ): Promise<number> {
    const startTime = Date.now();

    try {
      logger.debug(
        `[${this.tableName}Repository] Creating many records`,
        "Repository",
        {
          count: records.length,
          tenantId,
        },
      );

      const createData = records.map((record) => {
        const data = { ...record };
        if (tenantId) {
          data[this.tenantField] = tenantId;
        }
        data.created_at = new Date();
        data.updated_at = new Date();
        return data;
      });

      const model = this.getModel();
      const result = await model.createMany({
        data: createData,
        skipDuplicates: true,
      });

      const duration = Date.now() - startTime;
      logger.success(
        `[${this.tableName}Repository] Batch create completed`,
        "Repository",
        {
          created: result.count,
          duration: `${duration}ms`,
        },
      );

      return result.count;
    } catch (error) {
      logger.error(
        `[${this.tableName}Repository] CreateMany error`,
        "Repository",
        {
          count: records.length,
          error,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 ABSTRACT METHOD: Get Prisma model
   * Each repository must implement this to return the correct Prisma model
   */
  protected abstract getModel(): any;

  /**
   * 🎯 TRANSACTION SUPPORT
   */
  async executeTransaction<R>(
    fn: (tx: PrismaClient) => Promise<R>,
  ): Promise<R> {
    const startTime = Date.now();

    try {
      logger.debug(
        `[${this.tableName}Repository] Starting transaction`,
        "Repository",
      );

      const result = await this.prisma.$transaction(fn);

      const duration = Date.now() - startTime;
      logger.success(
        `[${this.tableName}Repository] Transaction completed`,
        "Repository",
        {
          duration: `${duration}ms`,
        },
      );

      return result;
    } catch (error) {
      logger.error(
        `[${this.tableName}Repository] Transaction error`,
        "Repository",
        error,
      );
      throw error;
    }
  }
}
