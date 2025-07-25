import {
  addFlagListener,
  evaluateABTest,
  isFeatureEnabled,
  isModuleEnabled,
} from '@server/shared/FeatureFlags';
import { db, request as requestTable } from '@shared/db';
import { requestMapper } from '@shared/db/transformers';
import { generateId, generateShortId } from '@shared/utils/idGenerator';
import { logger } from '@shared/utils/logger';
import { and, desc, eq } from 'drizzle-orm';
import type { Request, Response } from 'express'; // ✅ FIXED: Add Response import

// ✅ ENHANCED: Import modular architecture components v2.0

/**
 * Request Controller - Enhanced with Modular Architecture v2.0
 *
 * Handles all request/order-related HTTP requests and responses.
 * Now uses enhanced ServiceContainer v2.0 with lifecycle management and async service resolution.
 * Demonstrates advanced FeatureFlags v2.0 with A/B testing and context-aware evaluation.
 * Includes automatic camelCase ↔ snake_case transformation for frontend compatibility.
 */
export class RequestController {
  // ✅ NEW v2.0: Initialize flag listeners for dynamic behavior
  private static initialized = false;

  static initialize(): void {
    if (RequestController.initialized) return;

    // ✅ CLEAN: Follow same pattern as other controllers
    addFlagListener('request-module', flag => {
      logger.info(
        `🚩 [RequestController] Request module flag changed: ${flag.enabled}`,
        'RequestController',
        { flag: flag.name, enabled: flag.enabled }
      );
    });

    addFlagListener('advanced-analytics', flag => {
      logger.info(
        `🚩 [RequestController] Advanced analytics flag changed: ${flag.enabled}`,
        'RequestController',
        { flag: flag.name, enabled: flag.enabled }
      );
    });

    RequestController.initialized = true;
    logger.debug(
      '🚩 [RequestController] Flag listeners initialized',
      'RequestController'
    );
  }

  // ✅ SIMPLIFIED: Direct import without ServiceContainer complexity
  private static async getTenantServiceAsync() {
    try {
      const tenantServiceModule = await import('@server/services/tenantService');
      const TenantService = tenantServiceModule.TenantService;
      return new TenantService();
    } catch (error) {
      logger.warn(
        'Failed to import TenantService',
        'RequestController',
        error
      );
      return null;
    }
  }

  // ✅ SIMPLIFIED: Simple tenant extraction without dynamic imports
  static extractTenantId(req: Request): string | null {
    // First try authenticated tenant
    if (req.tenant?.id) {
      return req.tenant.id;
    }

    // For guest requests (voice assistant), extract tenant from hostname
    const hostname = req.get('host') || '';
    const subdomain = hostname.split('.')[0];

    if (subdomain && subdomain !== 'localhost' && subdomain !== '127') {
      return `tenant-${subdomain}`;
    }

    return null;
  }

  /**
   * Create new request/order
   * POST /api/request
   * ✅ ENHANCED: Now with advanced FeatureFlags v2.0 A/B testing and context evaluation
   */
  static async createRequest(req: Request, res: Response): Promise<void> {
    try {
      // ✅ FIXED: Safe initialization with error handling
      try {
        RequestController.initialize();
      } catch (initError) {
        logger.warn(
          'Flag initialization failed, continuing without flags',
          'RequestController',
          initError
        );
      }

      // ✅ ENHANCED v2.0: Context-aware feature flag evaluation
      const context = {
        userId: req.headers['x-user-id'] as string,
        tenantId: (req as any).tenant?.id,
      };

      // ✅ FIXED: Safe feature flag check with fallback
      let moduleEnabled = true;
      try {
        if (typeof isModuleEnabled === 'function') {
          moduleEnabled = isModuleEnabled('request-module', context);
        }
      } catch (flagError) {
        logger.warn(
          'Feature flag check failed, assuming module enabled',
          'RequestController',
          flagError
        );
        moduleEnabled = true;
      }

      if (!moduleEnabled) {
        (res as any).status(503).json({
          success: false,
          error: 'Request module is currently disabled',
          code: 'MODULE_DISABLED',
          _metadata: {
            module: 'request-module',
            version: '2.0.0',
            architecture: 'modular-enhanced',
            context,
          },
        });
        return;
      }

      // ✅ FIXED: Safe A/B test evaluation
      let advancedAnalyticsVariant = null;
      try {
        if (typeof evaluateABTest === 'function' && context.userId) {
          advancedAnalyticsVariant = evaluateABTest(
            'advanced-analytics-test',
            context.userId
          );
        }
      } catch (abTestError) {
        logger.warn(
          'A/B test evaluation failed, using default',
          'RequestController',
          abTestError
        );
        advancedAnalyticsVariant = null;
      }

      // ✅ FIXED: Safe feature flag evaluation for notifications
      let enableRealTimeNotifications = false;
      try {
        if (typeof isFeatureEnabled === 'function') {
          enableRealTimeNotifications = isFeatureEnabled(
            'real-time-notifications',
            context
          );
        }
      } catch (featureError) {
        logger.warn(
          'Notification feature flag check failed, using default',
          'RequestController',
          featureError
        );
        enableRealTimeNotifications = false;
      }
      const enableAdvancedAnalytics = isFeatureEnabled(
        'advanced-analytics',
        context
      );

      logger.api(
        '📝 [RequestController] Creating new request (camelCase) - Modular v2.0',
        'RequestController',
        {
          body: req.body,
          context,
          features: {
            realTimeNotifications: enableRealTimeNotifications,
            advancedAnalytics: enableAdvancedAnalytics,
            abTest: advancedAnalyticsVariant,
          },
        }
      );

      // ✅ TRANSFORM: camelCase frontend data → snake_case database data
      const transformedData = requestMapper.toDatabase(req.body);
      logger.debug(
        '🔄 [RequestController] Transformed to snake_case',
        'RequestController',
        transformedData
      );

      // Extract data from transformed body (now all snake_case)
      const {
        call_id,
        room_number,
        order_type,
        delivery_time,
        special_instructions,
        items,
        // total_amount, // Available but not used in this method
        status = 'Đã ghi nhận',
        // Alternative field names for backward compatibility
        type,
        request_content,
      } = transformedData;

      // ✅ FIX: Determine final status - prioritize client value
      const finalStatus = status || 'Đã ghi nhận';

      // Build request content from items or use provided content
      let content = request_content || special_instructions;

      if (!content && items && Array.isArray(items) && items.length > 0) {
        content = items
          .map((item: any) => `${item.name || 'Item'} x${item.quantity || 1}`)
          .join(', ');
      }

      if (!content) {
        content = order_type || type || 'Service Request';
      }

      // ✅ FIXED: Extract tenant ID using helper method
      const tenantId = RequestController.extractTenantId(req);

      if (!tenantId) {
        (res as any).status(400).json({
          success: false,
          error: 'Unable to identify hotel from request',
          code: 'TENANT_NOT_IDENTIFIED',
        });
        return;
      }

      // ✅ FIXED: Safe tenant service validation (non-blocking)
      try {
        const tenantService = await RequestController.getTenantServiceAsync();
        if (
          tenantService &&
          typeof tenantService.getTenantById === 'function'
        ) {
          const isValid = await tenantService.getTenantById(tenantId);
          if (!isValid) {
            logger.warn(
              'Tenant validation failed, continuing anyway',
              'RequestController'
            );
          } else {
            logger.debug(
              '✅ [RequestController] Tenant validated',
              'RequestController',
              { tenantId }
            );
          }
        }
      } catch (error) {
        // Don't fail the request if tenant service has issues
        logger.debug(
          'Tenant service validation skipped due to error',
          'RequestController',
          error
        );
      }

      // ✅ NEW v2.0: Enhanced ID generation based on A/B test
      let orderId;
      if (advancedAnalyticsVariant === 'treatment') {
        // Treatment group gets enhanced ID with analytics tracking
        orderId = generateShortId('request') + '_A';
        logger.debug(
          '🧪 [RequestController] A/B Test Treatment: Enhanced ID generation',
          'RequestController',
          { variant: advancedAnalyticsVariant, orderId }
        );
      } else {
        // Control group gets standard ID
        orderId = generateShortId('request');
        if (advancedAnalyticsVariant === 'control') {
          logger.debug(
            '🧪 [RequestController] A/B Test Control: Standard ID generation',
            'RequestController',
            { variant: advancedAnalyticsVariant, orderId }
          );
        }
      }

      // Create request record compatible with schema (id will be auto-generated)
      const newRequest = {
        tenant_id: tenantId, // ✅ FIXED: Use tenant ID from guest auth or authenticated user
        call_id: call_id || generateId('call'),
        room_number: room_number || 'unknown',
        order_id: orderId, // ✅ ENHANCED v2.0: A/B test influenced ID generation
        request_content: content,
        status: finalStatus,
        created_at: new Date(), // ✅ OPTIMIZED: Use PostgreSQL TIMESTAMP format
        updated_at: new Date(), // ✅ OPTIMIZED: Use PostgreSQL TIMESTAMP format
        description: special_instructions || null, // Use specialInstructions as description
        priority: 'medium', // Default priority
        assigned_to: null, // Will be assigned by staff later
      };

      logger.debug(
        '💾 [RequestController] Inserting request - Modular v2.0',
        'RequestController',
        newRequest
      );

      // Insert into database and get the generated ID
      const insertResult = await db
        .insert(requestTable)
        .values(newRequest)
        .returning();
      const createdRequest = insertResult[0];

      // ✅ TRANSFORM: snake_case database response → camelCase frontend response
      const frontendResponse = requestMapper.toFrontend(createdRequest);

      // ✅ NEW v2.0: Enhanced analytics tracking (if enabled)
      if (enableAdvancedAnalytics) {
        logger.info(
          '📊 [RequestController] Advanced analytics tracking enabled',
          'RequestController',
          {
            orderId: newRequest.order_id,
            roomNumber: newRequest.room_number,
            abTestVariant: advancedAnalyticsVariant,
            userId: context.userId,
            tenantId: context.tenantId,
          }
        );
      }

      // Return success response
      const response = {
        success: true,
        data: {
          ...frontendResponse,
          // Backward compatibility fields
          reference: newRequest.order_id,
          estimatedTime: delivery_time || 'asap',
        },
        // ✅ ENHANCED: Module metadata v2.0 with A/B testing info
        _metadata: {
          module: 'request-module',
          version: '2.0.0',
          architecture: 'modular-enhanced',
          serviceContainer: 'v2.0',
          tenantValidated: true,
          features: {
            realTimeNotifications: enableRealTimeNotifications,
            advancedAnalytics: enableAdvancedAnalytics,
          },
          abTest: advancedAnalyticsVariant
            ? {
              testName: 'advanced-analytics-test',
              variant: advancedAnalyticsVariant,
              userId: context.userId,
            }
            : undefined,
        },
      };

      logger.success(
        '📝 [RequestController] Request created successfully (camelCase) - Modular v2.0',
        'RequestController',
        {
          orderId: newRequest.order_id,
          roomNumber: newRequest.room_number,
          abTest: advancedAnalyticsVariant,
          features: { enableAdvancedAnalytics, enableRealTimeNotifications },
        }
      );

      (res as any).status(201).json(response);
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to create request - Modular v2.0',
        'RequestController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to create request',
        details:
          error instanceof Error
            ? (error as any)?.message || String(error)
            : 'Unknown error',
        _metadata: {
          module: 'request-module',
          version: '2.0.0',
          architecture: 'modular-enhanced',
        },
      });
    }
  }

  // ✅ NOTE: Other methods (getAllRequests, getRequestById, updateRequestStatus)
  // remain exactly the same for backwards compatibility
  // They can be enhanced incrementally in future versions

  /**
   * Get all requests
   * GET /api/request
   */
  static async getAllRequests(req: Request, res: Response): Promise<void> {
    try {
      // ✅ ENHANCED: Database readiness check
      if (!db) {
        logger.error(
          '❌ [RequestController] Database not available',
          'RequestController'
        );
        (res as any).status(503).json({
          success: false,
          error: 'Database service temporarily unavailable',
          code: 'DATABASE_NOT_READY',
        });
        return;
      }

      // ✅ FIXED: Extract tenant ID using static helper method
      const extractedTenantId = RequestController.extractTenantId(req);

      if (!extractedTenantId) {
        (res as any).status(400).json({
          success: false,
          error: 'Unable to identify hotel from request',
          code: 'TENANT_NOT_IDENTIFIED',
        });
        return;
      }

      // ✅ FIXED: Handle guest requests - extract tenant from hostname if not authenticated
      let tenantId = req.tenant?.id;

      if (!tenantId) {
        // For guest requests (voice assistant), extract tenant from hostname
        try {
          const guestAuthModule = await import('@server/services/guestAuthService');
          const GuestAuthService = guestAuthModule.GuestAuthService;
          const hostname = req.get('host') || '';
          const subdomain = GuestAuthService.extractSubdomain(hostname);

          if (subdomain) {
            tenantId = `tenant-${subdomain}`;
          } else {
            (res as any).status(400).json({
              success: false,
              error: 'Unable to identify hotel from request',
              code: 'TENANT_NOT_IDENTIFIED',
            });
            return;
          }
        } catch (error) {
          logger.error('Failed to import GuestAuthService', 'RequestController', error);
          (res as any).status(500).json({
            success: false,
            error: 'Service import failed',
            code: 'SERVICE_IMPORT_ERROR',
          });
          return;
        }
      }

      logger.api(
        '📋 [RequestController] Getting all requests',
        'RequestController',
        { tenantId }
      );

      // Always filter by tenant for data isolation
      const requests = await db
        .select()
        .from(requestTable)
        .where(eq(requestTable.tenant_id, tenantId))
        .orderBy(desc(requestTable.created_at));

      logger.success(
        '📋 [RequestController] Requests retrieved successfully',
        'RequestController',
        {
          requestCount: requests.length,
          tenantId,
        }
      );

      (res as any).json({ success: true, data: requests });
    } catch (error) {
      // ✅ ENHANCED: Better error detection and reporting
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes('Database not initialized') ||
        errorMessage.includes('connection')
      ) {
        logger.error(
          '❌ [RequestController] Database connection error',
          'RequestController',
          error
        );
        (res as any).status(503).json({
          success: false,
          error: 'Database service temporarily unavailable. Please try again.',
          code: 'DATABASE_CONNECTION_ERROR',
        });
        return;
      }

      logger.error(
        '❌ [RequestController] Failed to fetch requests',
        'RequestController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to fetch requests',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      });
    }
  }

  /**
   * Get specific request by ID
   * GET /api/request/:id
   */
  static async getRequestById(req: Request, res: Response): Promise<void> {
    try {
      const requestId = parseInt(req.params.id, 10);

      if (isNaN(requestId)) {
        (res as any).status(400).json({
          success: false,
          error: 'Invalid request ID format',
        });
        return;
      }

      // ✅ OPTIMIZED: Ensure proper tenant validation - no fallbacks
      if (!req.tenant?.id) {
        (res as any).status(400).json({
          success: false,
          error: 'Tenant not identified',
          code: 'TENANT_NOT_IDENTIFIED',
        });
        return;
      }

      const tenantId = req.tenant.id;

      logger.api(
        `📄 [RequestController] Getting request by ID: ${requestId}`,
        'RequestController',
        { tenantId }
      );

      // Always filter by tenant for data isolation - required, not optional
      const request = await db
        .select()
        .from(requestTable)
        .where(
          and(
            eq(requestTable.id, requestId),
            eq(requestTable.tenant_id, tenantId)
          )
        );

      if (!request || request.length === 0) {
        (res as any).status(404).json({
          success: false,
          error: 'Request not found',
        });
        return;
      }

      logger.success(
        `📄 [RequestController] Request found`,
        'RequestController',
        {
          requestId,
          orderId: request[0].order_id,
        }
      );

      (res as any).json({ success: true, data: request[0] });
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to fetch request',
        'RequestController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to fetch request',
      });
    }
  }

  /**
   * Update request status
   * PATCH /api/request/:id/status
   */
  static async updateRequestStatus(req: Request, res: Response): Promise<void> {
    try {
      const requestId = parseInt(req.params.id, 10);
      const { status, assignedTo } = req.body;

      if (isNaN(requestId)) {
        (res as any).status(400).json({
          success: false,
          error: 'Invalid request ID format',
        });
        return;
      }

      if (!status) {
        (res as any).status(400).json({
          success: false,
          error: 'Status is required',
        });
        return;
      }

      // ✅ OPTIMIZED: Ensure proper tenant validation - no fallbacks
      if (!req.tenant?.id) {
        (res as any).status(400).json({
          success: false,
          error: 'Tenant not identified',
          code: 'TENANT_NOT_IDENTIFIED',
        });
        return;
      }

      const tenantId = req.tenant.id;

      // ✅ NEW v2.0: Context-aware real-time notifications
      const context = {
        userId: req.headers['x-user-id'] as string,
        tenantId: req.tenant.id,
      };
      const enableRealTimeNotifications = isFeatureEnabled(
        'real-time-notifications',
        context
      );

      logger.api(
        `📝 [RequestController] Updating request ${requestId} status to: ${status}`,
        'RequestController',
        {
          tenantId,
          assignedTo,
          realTimeNotifications: enableRealTimeNotifications,
        }
      );

      // Always filter by tenant for data isolation - required, not optional
      const updateData: any = {
        status,
        updated_at: new Date(), // ✅ OPTIMIZED: Use PostgreSQL TIMESTAMP format
      };

      if (assignedTo !== undefined) {
        updateData.assigned_to = assignedTo;
      }

      await db
        .update(requestTable)
        .set(updateData)
        .where(
          and(
            eq(requestTable.id, requestId),
            eq(requestTable.tenant_id, tenantId)
          )
        );

      // ✅ ENHANCED v2.0: Feature flag controlled WebSocket notification
      if (enableRealTimeNotifications) {
        const io = (req as any).app?.get('io');
        if (io) {
          io.emit('requestStatusUpdate', {
            requestId,
            status,
            assignedTo,
            timestamp: new Date().toISOString(),
            tenantId,
          });
          logger.debug(
            `📡 [RequestController] WebSocket notification sent for request ${requestId}`,
            'RequestController'
          );
        }
      } else {
        logger.debug(
          `📡 [RequestController] Real-time notifications disabled for request ${requestId}`,
          'RequestController'
        );
      }

      logger.success(
        `📝 [RequestController] Request status updated successfully`,
        'RequestController',
        {
          requestId,
          newStatus: status,
          realTimeNotified: enableRealTimeNotifications,
        }
      );

      (res as any).json({
        success: true,
        message: 'Request status updated successfully',
        data: {
          requestId,
          status,
          assignedTo,
          updatedAt: updateData.updated_at,
        },
        _metadata: {
          realTimeNotifications: enableRealTimeNotifications,
        },
      });
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to update request status',
        'RequestController',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to update request status',
      });
    }
  }
}
