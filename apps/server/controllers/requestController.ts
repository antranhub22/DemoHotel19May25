import { PrismaClient } from "@prisma/client";
import { logger } from "@shared/utils/logger";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// ✅ MIGRATED: RequestController using Prisma
export class RequestController {
  static async createRequest(req: Request, res: Response): Promise<void> {
    try {
      logger.info(
        "📝 [RequestController] Creating new request",
        "RequestController",
      );

      const {
        serviceType,
        requestText,
        roomNumber,
        guestName,
        priority,
        description,
      } = req.body;

      const newRequest = await prisma.request.create({
        data: {
          tenant_id: req.body.tenantId || "mi-nhon-hotel",
          room: roomNumber || "Unknown", // ✅ FIX: Changed from room_number to room
          content: requestText || description || "Guest request", // ✅ FIX: Required field
          guest_name: guestName || "Anonymous Guest",
          priority: priority || "medium",
          status: "pending",
          order_id: `REQ-${Date.now()}`, // ✅ FIX: Added required order_id field
          description: serviceType ? `Service: ${serviceType}` : description,
        },
      });

      const response = {
        success: true,
        data: newRequest,
        _metadata: {
          module: "request-module",
          version: "2.0.0",
          architecture: "prisma-enhanced",
        },
      };

      logger.info(
        "✅ [RequestController] Request created successfully",
        "RequestController",
      );
      res.status(201).json(response);
    } catch (error) {
      logger.error(
        "❌ [RequestController] Failed to create request",
        "RequestController",
        error,
      );
      res.status(500).json({
        success: false,
        error: "Failed to create request",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getAllRequests(req: Request, res: Response): Promise<void> {
    try {
      logger.info(
        "📋 [RequestController] Getting all requests",
        "RequestController",
      );

      const tenantId = (req.query.tenantId as string) || "default-tenant";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const [requests, total] = await Promise.all([
        prisma.request.findMany({
          where: { tenant_id: tenantId },
          orderBy: { created_at: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.request.count({ where: { tenant_id: tenantId } }),
      ]);

      const response = {
        success: true,
        data: requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      res.json(response);
    } catch (error) {
      logger.error(
        "❌ [RequestController] Failed to get requests",
        "RequestController",
        error,
      );
      res.status(500).json({
        success: false,
        error: "Failed to get requests",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getRequestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = (req.query.tenantId as string) || "default-tenant";

      const request = await prisma.request.findFirst({
        where: {
          id: parseInt(id),
          tenant_id: tenantId,
        },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          error: "Request not found",
        });
      }

      res.json({
        success: true,
        data: request,
      });
    } catch (error) {
      logger.error(
        "❌ [RequestController] Failed to get request",
        "RequestController",
        error,
      );
      res.status(500).json({
        success: false,
        error: "Failed to get request",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async updateRequestStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const tenantId = (req.query.tenantId as string) || "default-tenant";

      const updatedRequest = await prisma.request.updateMany({
        where: {
          id: parseInt(id),
          tenant_id: tenantId,
        },
        data: { status },
      });

      if (updatedRequest.count === 0) {
        return res.status(404).json({
          success: false,
          error: "Request not found",
        });
      }

      res.json({
        success: true,
        message: "Request status updated successfully",
      });
    } catch (error) {
      logger.error(
        "❌ [RequestController] Failed to update request",
        "RequestController",
        error,
      );
      res.status(500).json({
        success: false,
        error: "Failed to update request",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
