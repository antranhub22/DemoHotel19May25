// ✅ DETAILED MIGRATION: Removed Drizzle imports - using Prisma
import { PrismaClient } from "@prisma/client";
import { logger } from "@shared/utils/logger";
import { insertServiceSchema } from "@shared/validation/prismaSchemas";
import { validateRequest } from "@shared/validation/validateRequest";
import express from "express";

// ✅ DETAILED MIGRATION: Use Prisma for hotel module services
const prisma = new PrismaClient();

const router = express.Router();

// ============================================
// GET /api/hotel/services - List services
// ============================================
router.get("/", async (req: any, res: any) => {
  try {
    logger.debug(
      `🏨 [Services] Listing services for tenant: ${req.tenant.id}`,
      "HotelModule",
    );

    const tenantServices = await prisma.services.findMany({
      where: {
        tenant_id: req.tenant.id,
        is_active: true,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    logger.debug(
      `✅ [Services] Found ${tenantServices.length} services`,
      "HotelModule",
    );

    (res as any).json({
      success: true,
      data: tenantServices,
      count: tenantServices.length,
    });
  } catch (error) {
    logger.error("❌ [Services] Error listing services:", "HotelModule", error);
    (res as any).status(500).json({
      success: false,
      error: "Failed to list services",
    });
  }
});

// ============================================
// GET /api/hotel/services/:id - Get service details
// ============================================
router.get("/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    logger.debug(
      `🏨 [Services] Getting service ${id} for tenant: ${req.tenant.id}`,
      "HotelModule",
    );

    // ✅ DETAILED MIGRATION: Use Prisma for service lookup
    const service = await prisma.services.findFirst({
      where: {
        id: parseInt(id),
        tenant_id: req.tenant.id,
      },
    });

    // ✅ DETAILED MIGRATION: Fix Prisma logic (findFirst returns object or null)
    if (!service) {
      return (res as any).status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    logger.debug("✅ [Services] Service found", "HotelModule");

    (res as any).json({
      success: true,
      data: service[0],
    });
  } catch (error) {
    logger.error("❌ [Services] Error getting service:", "HotelModule", error);
    (res as any).status(500).json({
      success: false,
      error: "Failed to get service",
    });
  }
});

// ============================================
// POST /api/hotel/services - Create new service
// ============================================
router.post(
  "/",
  validateRequest(insertServiceSchema),
  async (req: any, res: any) => {
    try {
      const serviceData = {
        ...req.body,
        tenant_id: req.tenant.id,
      };

      logger.debug(
        `🏨 [Services] Creating service for tenant: ${req.tenant.id}`,
        "HotelModule",
      );

      // ✅ DETAILED MIGRATION: Create service using Prisma
      const newService = await prisma.services.create({
        data: serviceData,
      });

      logger.debug(
        `✅ [Services] Service created with ID: ${newService.id}`,
        "HotelModule",
      );

      (res as any).status(201).json({
        success: true,
        data: newService,
      });
    } catch (error) {
      logger.error(
        "❌ [Services] Error creating service:",
        "HotelModule",
        error,
      );
      (res as any).status(500).json({
        success: false,
        error: "Failed to create service",
      });
    }
  },
);

// ============================================
// PATCH /api/hotel/services/:id - Update service
// ============================================
router.patch("/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    logger.debug(
      `🏨 [Services] Updating service ${id} for tenant: ${req.tenant.id}`,
      "HotelModule",
    );

    const updatedService = await prisma.services.updateMany({
      where: {
        id: parseInt(id),
        tenant_id: req.tenant.id,
      },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    });

    if (updatedService.count === 0) {
      return (res as any).status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    const service = await prisma.services.findFirst({
      where: {
        id: parseInt(id),
        tenant_id: req.tenant.id,
      },
    });

    logger.debug("✅ [Services] Service updated", "HotelModule");

    (res as any).json({
      success: true,
      data: service,
    });
  } catch (error) {
    logger.error("❌ [Services] Error updating service:", "HotelModule", error);
    (res as any).status(500).json({
      success: false,
      error: "Failed to update service",
    });
  }
});

// ============================================
// DELETE /api/hotel/services/:id - Delete service
// ============================================
router.delete("/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    logger.debug(
      `🏨 [Services] Deleting service ${id} for tenant: ${req.tenant.id}`,
      "HotelModule",
    );

    const deletedService = await prisma.services.updateMany({
      where: {
        id: parseInt(id),
        tenant_id: req.tenant.id,
      },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });

    if (deletedService.count === 0) {
      return (res as any).status(404).json({
        success: false,
        error: "Service not found",
      });
    }

    const service = await prisma.services.findFirst({
      where: {
        id: parseInt(id),
        tenant_id: req.tenant.id,
      },
    });

    logger.debug("✅ [Services] Service deleted", "HotelModule");

    (res as any).json({
      success: true,
      data: service,
    });
  } catch (error) {
    logger.error("❌ [Services] Error deleting service:", "HotelModule", error);
    (res as any).status(500).json({
      success: false,
      error: "Failed to delete service",
    });
  }
});

// ============================================
// GET /api/hotel/services/categories - Get service categories
// ============================================
router.get("/categories", async (req: any, res: any) => {
  try {
    logger.debug(
      `🏨 [Services] Getting categories for tenant: ${req.tenant.id}`,
      "HotelModule",
    );

    const categories = await prisma.services.findMany({
      where: {
        tenant_id: req.tenant.id,
        is_active: true,
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    logger.debug(
      `✅ [Services] Found ${categories.length} categories`,
      "HotelModule",
    );

    (res as any).json({
      success: true,
      data: categories.map((c) => c.category),
    });
  } catch (error) {
    logger.error(
      "❌ [Services] Error getting categories:",
      "HotelModule",
      error,
    );
    (res as any).status(500).json({
      success: false,
      error: "Failed to get categories",
    });
  }
});

export default router;
