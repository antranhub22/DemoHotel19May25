// ============================================================================
// REQUEST CONTROLLER BACKUP - ORIGINAL VERSION
// ============================================================================
// Backup created on: 2025-01-25 17:53:27
// File: apps/server/controllers/requestController.ts
// Version: 2.0.0 (Modular Enhanced)
//
// This backup preserves the original implementation for rollback purposes
// during the refactor process.

import { getDatabase, initializeDatabase } from "@shared/db";
import { request } from "@shared/db/schema";
import { logger } from "@shared/utils/logger";
// import { desc, eq } from 'drizzle-orm'; // REMOVED: Drizzle migration completed
import { Request, Response } from "express";

// ✅ FIX: Enhanced error handling for database operations with fallback
async function safeDatabaseOperation<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error("Database operation failed:", error);

    // Check for specific database errors
    if (
      error instanceof Error &&
      (error.message.includes("connection") ||
        error.message.includes("timeout") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("not properly initialized"))
    ) {
      // Try to reinitialize database connection
      try {
        logger.info(
          "🔄 Attempting to reinitialize database connection...",
          "RequestController",
        );
        await initializeDatabase();
        // Retry operation once
        return await operation();
      } catch (retryError) {
        logger.error(
          "❌ Database reinitialization failed:",
          "RequestController",
          retryError,
        );
        throw new Error("Database connection error. Please try again.");
      }
    }

    throw error;
  }
}

export class RequestController {
  static async createRequest(req: Request, res: Response): Promise<void> {
    try {
      logger.info(
        "📝 [RequestController] Creating new request - Modular v2.0",
        "RequestController",
      );

      const { serviceType, requestText, roomNumber, guestName, priority } =
        req.body;

      // ✅ FIX: Use safe database operation with proper async handling
      const newRequest = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        if (!db) {
          throw new Error("Database not properly initialized");
        }
        return await db
          .insert(request)
          .values({
            tenant_id: req.body.tenantId || "default-tenant",
            room_number: roomNumber,
            request_content: requestText,
            guest_name: guestName,
            priority: priority || "medium",
            status: "pending",
            created_at: new Date(),
            description: serviceType ? `Service: ${serviceType}` : undefined,
          })
          .returning();
      });

      const response = {
        success: true,
        data: newRequest[0],
        _metadata: {
          module: "request-module",
          version: "2.0.0",
          architecture: "modular-enhanced",
        },
      };

      logger.success(
        "✅ [RequestController] Request created successfully - Modular v2.0",
        "RequestController",
        response,
      );

      (res as any).status(201).json(response);
    } catch (error) {
      logger.error(
        "❌ [RequestController] Failed to create request - Modular v2.0",
        "RequestController",
        error,
      );

      // ✅ FIX: Better error responses
      if (
        error instanceof Error &&
        error.message.includes("Database connection error")
      ) {
        (res as any).status(503).json({
          success: false,
          error: "Database temporarily unavailable. Please try again.",
          code: "DATABASE_UNAVAILABLE",
        });
      } else {
        (res as any).status(500).json({
          success: false,
          error: "Failed to create request",
          details:
            error instanceof Error
              ? (error as any)?.message || String(error)
              : "Unknown error",
          _metadata: {
            module: "request-module",
            version: "2.0.0",
            architecture: "modular-enhanced",
          },
        });
      }
    }
  }

  // ✅ NOTE: Other methods (getAllRequests, getRequestById, updateRequestStatus)
  // remain exactly the same for backwards compatibility
  // They can be enhanced incrementally in future versions

  /**
   * Get all requests
   * GET /api/request
   */
  static async getAllRequests(_req: Request, res: Response): Promise<void> {
    try {
      logger.info(
        "📋 [RequestController] Getting all requests...",
        "RequestController",
      );

      // ✅ FIX: Use safe database operation with correct Drizzle syntax
      const requestsData = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        if (!db || !db.select) {
          throw new Error("Database not properly initialized");
        }
        return await db
          .select()
          .from(request)
          .orderBy(desc(request.created_at))
          .limit(100);
      });

      logger.success(
        "✅ [RequestController] Requests fetched successfully",
        "RequestController",
        { count: requestsData.length },
      );

      (res as any).json({ success: true, data: requestsData });
    } catch (error) {
      // ✅ ENHANCED: Better error detection and reporting
      logger.error(
        "❌ [RequestController] Failed to fetch requests",
        "RequestController",
        error,
      );

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      (res as any).status(500).json({
        success: false,
        error: "Failed to fetch requests",
        details: errorMessage,
        _metadata: {
          module: "request-module",
          version: "2.0.0",
          architecture: "modular-enhanced",
        },
      });
    }
  }

  /**
   * Get specific request by ID
   * GET /api/request/:id
   */
  static async getRequestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(
        `📋 [RequestController] Getting request by ID: ${id}`,
        "RequestController",
      );

      // ✅ FIX: Use safe database operation with correct Drizzle syntax
      const requestData = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        if (!db || !db.select) {
          throw new Error("Database not properly initialized");
        }
        return await db
          .select()
          .from(request)
          .where(eq(request.id, parseInt(id)))
          .limit(1);
      });

      if (!requestData || requestData.length === 0) {
        (res as any).status(404).json({
          success: false,
          error: "Request not found",
          code: "REQUEST_NOT_FOUND",
        });
        return;
      }

      (res as any).json({ success: true, data: requestData[0] });
    } catch (error) {
      logger.error(
        "❌ [RequestController] Failed to get request by ID",
        "RequestController",
        error,
      );

      (res as any).status(500).json({
        success: false,
        error: "Failed to get request",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Update request status
   * PATCH /api/request/:id/status
   */
  static async updateRequestStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      logger.info(
        `📝 [RequestController] Updating request status: ${id} -> ${status}`,
        "RequestController",
      );

      if (!status) {
        (res as any).status(400).json({
          success: false,
          error: "Status is required",
          code: "VALIDATION_ERROR",
        });
        return;
      }

      // ✅ FIX: Use safe database operation with correct Drizzle syntax
      const updatedRequest = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        if (!db || !db.update) {
          throw new Error("Database not properly initialized");
        }
        return await db
          .update(request)
          .set({
            status,
            updated_at: new Date(),
          })
          .where(eq(request.id, parseInt(id)))
          .returning();
      });

      if (!updatedRequest || updatedRequest.length === 0) {
        (res as any).status(404).json({
          success: false,
          error: "Request not found",
          code: "REQUEST_NOT_FOUND",
        });
        return;
      }

      (res as any).json({ success: true, data: updatedRequest[0] });
    } catch (error) {
      logger.error(
        "❌ [RequestController] Failed to update request status",
        "RequestController",
        error,
      );

      (res as any).status(500).json({
        success: false,
        error: "Failed to update request status",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
