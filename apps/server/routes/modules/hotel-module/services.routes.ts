import { db } from '@shared/db';
import { insertServiceSchema, services } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { validateRequest } from '@shared/validation/validateRequest';
import { and, eq } from 'drizzle-orm';
import express from 'express';

const router = express.Router();

// ============================================
// GET /api/hotel/services - List services
// ============================================
router.get('/', async (req: any, res: any) => {
  try {
    logger.debug(
      `🏨 [Services] Listing services for tenant: ${req.tenant.id}`,
      'HotelModule'
    );

    const tenantServices = await db
      .select()
      .from(services)
      .where(
        and(eq(services.tenant_id, req.tenant.id), eq(services.is_active, true))
      )
      .orderBy(services.category, services.name);

    logger.debug(
      `✅ [Services] Found ${tenantServices.length} services`,
      'HotelModule'
    );

    (res as any).json({
      success: true,
      data: tenantServices,
      count: tenantServices.length,
    });
  } catch (error) {
    logger.error('❌ [Services] Error listing services:', 'HotelModule', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to list services',
    });
  }
});

// ============================================
// GET /api/hotel/services/:id - Get service details
// ============================================
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    logger.debug(
      `🏨 [Services] Getting service ${id} for tenant: ${req.tenant.id}`,
      'HotelModule'
    );

    const service = await db
      .select()
      .from(services)
      .where(
        and(
          eq(services.id, parseInt(id)),
          eq(services.tenant_id, req.tenant.id)
        )
      )
      .limit(1);

    if (!service.length) {
      return (res as any).status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    logger.debug('✅ [Services] Service found', 'HotelModule');

    (res as any).json({
      success: true,
      data: service[0],
    });
  } catch (error) {
    logger.error('❌ [Services] Error getting service:', 'HotelModule', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get service',
    });
  }
});

// ============================================
// POST /api/hotel/services - Create new service
// ============================================
router.post(
  '/',
  validateRequest(insertServiceSchema),
  async (req: any, res: any) => {
    try {
      const serviceData = {
        ...req.body,
        tenant_id: req.tenant.id,
      };

      logger.debug(
        `🏨 [Services] Creating service for tenant: ${req.tenant.id}`,
        'HotelModule'
      );

      const [newService] = await db
        .insert(services)
        .values(serviceData)
        .returning();

      logger.debug(
        `✅ [Services] Service created with ID: ${newService.id}`,
        'HotelModule'
      );

      (res as any).status(201).json({
        success: true,
        data: newService,
      });
    } catch (error) {
      logger.error(
        '❌ [Services] Error creating service:',
        'HotelModule',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to create service',
      });
    }
  }
);

// ============================================
// PATCH /api/hotel/services/:id - Update service
// ============================================
router.patch('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    logger.debug(
      `🏨 [Services] Updating service ${id} for tenant: ${req.tenant.id}`,
      'HotelModule'
    );

    const [updatedService] = await db
      .update(services)
      .set({
        ...updateData,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(services.id, parseInt(id)),
          eq(services.tenant_id, req.tenant.id)
        )
      )
      .returning();

    if (!updatedService) {
      return (res as any).status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    logger.debug('✅ [Services] Service updated', 'HotelModule');

    (res as any).json({
      success: true,
      data: updatedService,
    });
  } catch (error) {
    logger.error('❌ [Services] Error updating service:', 'HotelModule', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to update service',
    });
  }
});

// ============================================
// DELETE /api/hotel/services/:id - Delete service
// ============================================
router.delete('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    logger.debug(
      `🏨 [Services] Deleting service ${id} for tenant: ${req.tenant.id}`,
      'HotelModule'
    );

    const [deletedService] = await db
      .update(services)
      .set({
        is_active: false,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(services.id, parseInt(id)),
          eq(services.tenant_id, req.tenant.id)
        )
      )
      .returning();

    if (!deletedService) {
      return (res as any).status(404).json({
        success: false,
        error: 'Service not found',
      });
    }

    logger.debug('✅ [Services] Service deleted', 'HotelModule');

    (res as any).json({
      success: true,
      data: deletedService,
    });
  } catch (error) {
    logger.error('❌ [Services] Error deleting service:', 'HotelModule', error);
    (res as any).status(500).json({
      success: false,
      error: 'Failed to delete service',
    });
  }
});

// ============================================
// GET /api/hotel/services/categories - Get service categories
// ============================================
router.get('/categories', async (req: any, res: any) => {
  try {
    logger.debug(
      `🏨 [Services] Getting categories for tenant: ${req.tenant.id}`,
      'HotelModule'
    );

    const categories = await db
      .selectDistinct({ category: services.category })
      .from(services)
      .where(
        and(eq(services.tenant_id, req.tenant.id), eq(services.is_active, true))
      );

    logger.debug(
      `✅ [Services] Found ${categories.length} categories`,
      'HotelModule'
    );

    (res as any).json({
      success: true,
      data: categories.map(c => c.category),
    });
  } catch (error) {
    logger.error(
      '❌ [Services] Error getting categories:',
      'HotelModule',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get categories',
    });
  }
});

export default router;
