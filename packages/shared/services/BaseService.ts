/**
 * 🏗️ BASE SERVICE LAYER
 *
 * Enterprise-grade service layer with:
 * - Business logic encapsulation
 * - Validation framework
 * - Authorization system
 * - Audit logging
 * - Event system
 * - Error handling
 */

import { BaseRepository } from "../repositories/BaseRepository";
import { logger } from "../utils/logger";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface User {
  id: string;
  tenantId: string;
  role: string;
  permissions: string[];
}

export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId: string | number;
  userId: string;
  tenantId: string;
  timestamp: Date;
  changes?: any;
  metadata?: any;
}

export interface ServiceContext {
  user: User;
  tenantId: string;
  requestId?: string;
  traceId?: string;
}

/**
 * ✅ BASE SERVICE CLASS
 *
 * Provides common business logic patterns:
 * - CRUD operations with business rules
 * - Validation and authorization
 * - Audit logging
 * - Event system
 */
export abstract class BaseService<
  T extends Record<string, any>,
  R extends BaseRepository<T>,
> {
  protected repository: R;
  protected entityName: string;

  constructor(repository: R, entityName: string) {
    this.repository = repository;
    this.entityName = entityName;
  }

  /**
   * 🎯 CREATE with full business logic
   */
  async create(data: any, context: ServiceContext): Promise<T> {
    const startTime = Date.now();

    try {
      logger.debug(`[${this.entityName}Service] Creating entity`, "Service", {
        entityName: this.entityName,
        userId: context.user.id,
        tenantId: context.tenantId,
      });

      // 1. Validate input data
      const validation = await this.validateForCreate(data, context);
      if (!validation.valid) {
        throw new ValidationFailedException(validation.errors);
      }

      // 2. Check authorization
      const authorized = await this.authorizeCreate(data, context);
      if (!authorized) {
        throw new UnauthorizedException(
          `User ${context.user.id} not authorized to create ${this.entityName}`,
        );
      }

      // 3. Apply business rules (pre-create)
      const processedData = await this.applyBusinessRulesBeforeCreate(
        data,
        context,
      );

      // 4. Execute create operation
      const result = await this.repository.create(
        processedData,
        context.tenantId,
      );

      // 5. Apply business rules (post-create)
      await this.applyBusinessRulesAfterCreate(result, context);

      // 6. Log audit trail
      await this.logAudit("create", result, context);

      // 7. Emit events
      await this.emitEvent("created", result, context);

      const duration = Date.now() - startTime;
      logger.success(`[${this.entityName}Service] Entity created`, "Service", {
        entityId: result.id,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      logger.error(`[${this.entityName}Service] Create failed`, "Service", {
        error,
        userId: context.user.id,
        tenantId: context.tenantId,
      });
      throw error;
    }
  }

  /**
   * 🎯 UPDATE with full business logic
   */
  async update(
    id: string | number,
    data: any,
    context: ServiceContext,
  ): Promise<T | null> {
    const startTime = Date.now();

    try {
      logger.debug(`[${this.entityName}Service] Updating entity`, "Service", {
        entityName: this.entityName,
        entityId: id,
        userId: context.user.id,
        tenantId: context.tenantId,
      });

      // 1. Get existing entity
      const existing = await this.repository.findById(id, context.tenantId);
      if (!existing) {
        throw new NotFoundException(
          `${this.entityName} with ID ${id} not found`,
        );
      }

      // 2. Validate input data
      const validation = await this.validateForUpdate(data, existing, context);
      if (!validation.valid) {
        throw new ValidationFailedException(validation.errors);
      }

      // 3. Check authorization
      const authorized = await this.authorizeUpdate(existing, data, context);
      if (!authorized) {
        throw new UnauthorizedException(
          `User ${context.user.id} not authorized to update ${this.entityName} ${id}`,
        );
      }

      // 4. Apply business rules (pre-update)
      const processedData = await this.applyBusinessRulesBeforeUpdate(
        data,
        existing,
        context,
      );

      // 5. Execute update operation
      const result = await this.repository.update(
        id,
        processedData,
        context.tenantId,
      );

      if (result) {
        // 6. Apply business rules (post-update)
        await this.applyBusinessRulesAfterUpdate(result, existing, context);

        // 7. Log audit trail
        await this.logAudit("update", result, context, {
          previousData: existing,
        });

        // 8. Emit events
        await this.emitEvent("updated", result, context, {
          previousData: existing,
        });
      }

      const duration = Date.now() - startTime;
      logger.success(`[${this.entityName}Service] Entity updated`, "Service", {
        entityId: id,
        found: !!result,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      logger.error(`[${this.entityName}Service] Update failed`, "Service", {
        entityId: id,
        error,
        userId: context.user.id,
        tenantId: context.tenantId,
      });
      throw error;
    }
  }

  /**
   * 🎯 GET BY ID with authorization
   */
  async findById(
    id: string | number,
    context: ServiceContext,
  ): Promise<T | null> {
    const startTime = Date.now();

    try {
      logger.debug(`[${this.entityName}Service] Finding by ID`, "Service", {
        entityName: this.entityName,
        entityId: id,
        userId: context.user.id,
        tenantId: context.tenantId,
      });

      // 1. Get entity
      const result = await this.repository.findById(id, context.tenantId);

      if (result) {
        // 2. Check authorization
        const authorized = await this.authorizeRead(result, context);
        if (!authorized) {
          throw new UnauthorizedException(
            `User ${context.user.id} not authorized to read ${this.entityName} ${id}`,
          );
        }

        // 3. Apply data filtering (remove sensitive fields)
        const filteredResult = await this.filterSensitiveData(result, context);

        const duration = Date.now() - startTime;
        logger.success(`[${this.entityName}Service] Entity found`, "Service", {
          entityId: id,
          duration: `${duration}ms`,
        });

        return filteredResult;
      }

      logger.debug(`[${this.entityName}Service] Entity not found`, "Service", {
        entityId: id,
      });

      return null;
    } catch (error) {
      logger.error(`[${this.entityName}Service] FindById failed`, "Service", {
        entityId: id,
        error,
        userId: context.user.id,
        tenantId: context.tenantId,
      });
      throw error;
    }
  }

  /**
   * 🎯 DELETE with authorization and cascading
   */
  async delete(id: string | number, context: ServiceContext): Promise<boolean> {
    const startTime = Date.now();

    try {
      logger.debug(`[${this.entityName}Service] Deleting entity`, "Service", {
        entityName: this.entityName,
        entityId: id,
        userId: context.user.id,
        tenantId: context.tenantId,
      });

      // 1. Get existing entity
      const existing = await this.repository.findById(id, context.tenantId);
      if (!existing) {
        throw new NotFoundException(
          `${this.entityName} with ID ${id} not found`,
        );
      }

      // 2. Check authorization
      const authorized = await this.authorizeDelete(existing, context);
      if (!authorized) {
        throw new UnauthorizedException(
          `User ${context.user.id} not authorized to delete ${this.entityName} ${id}`,
        );
      }

      // 3. Apply business rules (pre-delete)
      await this.applyBusinessRulesBeforeDelete(existing, context);

      // 4. Execute delete operation
      const result = await this.repository.delete(id, context.tenantId);

      if (result) {
        // 5. Apply business rules (post-delete)
        await this.applyBusinessRulesAfterDelete(existing, context);

        // 6. Log audit trail
        await this.logAudit("delete", existing, context);

        // 7. Emit events
        await this.emitEvent("deleted", existing, context);
      }

      const duration = Date.now() - startTime;
      logger.success(`[${this.entityName}Service] Entity deleted`, "Service", {
        entityId: id,
        success: result,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      logger.error(`[${this.entityName}Service] Delete failed`, "Service", {
        entityId: id,
        error,
        userId: context.user.id,
        tenantId: context.tenantId,
      });
      throw error;
    }
  }

  // ======================================
  // ABSTRACT METHODS (implement in subclasses)
  // ======================================

  protected abstract validateForCreate(
    data: any,
    context: ServiceContext,
  ): Promise<ValidationResult>;
  protected abstract validateForUpdate(
    data: any,
    existing: T,
    context: ServiceContext,
  ): Promise<ValidationResult>;

  protected abstract authorizeCreate(
    data: any,
    context: ServiceContext,
  ): Promise<boolean>;
  protected abstract authorizeRead(
    entity: T,
    context: ServiceContext,
  ): Promise<boolean>;
  protected abstract authorizeUpdate(
    existing: T,
    data: any,
    context: ServiceContext,
  ): Promise<boolean>;
  protected abstract authorizeDelete(
    entity: T,
    context: ServiceContext,
  ): Promise<boolean>;

  // ======================================
  // BUSINESS RULES (override in subclasses)
  // ======================================

  protected async applyBusinessRulesBeforeCreate(
    data: any,
    context: ServiceContext,
  ): Promise<any> {
    return data;
  }

  protected async applyBusinessRulesAfterCreate(
    entity: T,
    context: ServiceContext,
  ): Promise<void> {
    // Override in subclasses
  }

  protected async applyBusinessRulesBeforeUpdate(
    data: any,
    existing: T,
    context: ServiceContext,
  ): Promise<any> {
    return data;
  }

  protected async applyBusinessRulesAfterUpdate(
    entity: T,
    existing: T,
    context: ServiceContext,
  ): Promise<void> {
    // Override in subclasses
  }

  protected async applyBusinessRulesBeforeDelete(
    entity: T,
    context: ServiceContext,
  ): Promise<void> {
    // Override in subclasses
  }

  protected async applyBusinessRulesAfterDelete(
    entity: T,
    context: ServiceContext,
  ): Promise<void> {
    // Override in subclasses
  }

  // ======================================
  // UTILITY METHODS
  // ======================================

  protected async filterSensitiveData(
    entity: T,
    context: ServiceContext,
  ): Promise<T> {
    // Override in subclasses to remove sensitive fields
    return entity;
  }

  protected async logAudit(
    action: string,
    entity: T,
    context: ServiceContext,
    metadata?: any,
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        action,
        entityType: this.entityName,
        entityId: entity.id,
        userId: context.user.id,
        tenantId: context.tenantId,
        timestamp: new Date(),
        metadata,
      };

      logger.info(`[${this.entityName}Service] Audit log`, "Audit", auditEntry);
    } catch (error) {
      logger.error(
        `[${this.entityName}Service] Audit logging failed`,
        "Service",
        error,
      );
      // Don't throw - audit failure shouldn't break business operations
    }
  }

  protected async emitEvent(
    event: string,
    entity: T,
    context: ServiceContext,
    metadata?: any,
  ): Promise<void> {
    try {
      const eventData = {
        event: `${this.entityName}.${event}`,
        entity,
        user: context.user,
        tenantId: context.tenantId,
        timestamp: new Date(),
        metadata,
      };

      logger.info(
        `[${this.entityName}Service] Event emitted`,
        "Event",
        eventData,
      );

      // Here you would integrate with your event system (Redis, EventBridge, etc.)
    } catch (error) {
      logger.error(
        `[${this.entityName}Service] Event emission failed`,
        "Service",
        error,
      );
      // Don't throw - event failure shouldn't break business operations
    }
  }

  // ======================================
  // VALIDATION HELPERS
  // ======================================

  protected validateRequired(
    value: any,
    fieldName: string,
  ): ValidationError | null {
    if (value === null || value === undefined || value === "") {
      return {
        field: fieldName,
        message: `${fieldName} is required`,
        code: "REQUIRED",
      };
    }
    return null;
  }

  protected validateEmail(
    email: string,
    fieldName: string,
  ): ValidationError | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid email address`,
        code: "INVALID_EMAIL",
      };
    }
    return null;
  }

  protected validateLength(
    value: string,
    min: number,
    max: number,
    fieldName: string,
  ): ValidationError | null {
    if (value && (value.length < min || value.length > max)) {
      return {
        field: fieldName,
        message: `${fieldName} must be between ${min} and ${max} characters`,
        code: "INVALID_LENGTH",
      };
    }
    return null;
  }

  protected validateNumericRange(
    value: number,
    min: number,
    max: number,
    fieldName: string,
  ): ValidationError | null {
    if (value !== undefined && (value < min || value > max)) {
      return {
        field: fieldName,
        message: `${fieldName} must be between ${min} and ${max}`,
        code: "INVALID_RANGE",
      };
    }
    return null;
  }
}

// ======================================
// CUSTOM EXCEPTIONS
// ======================================

export class ValidationFailedException extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(`Validation failed: ${errors.map((e) => e.message).join(", ")}`);
    this.name = "ValidationFailedException";
    this.errors = errors;
  }
}

export class UnauthorizedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedException";
  }
}

export class NotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundException";
  }
}
