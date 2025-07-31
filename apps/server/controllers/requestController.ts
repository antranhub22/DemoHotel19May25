import { logger } from '@shared/utils/logger';
import { Request, Response } from 'express';

// ✅ NEW: Phase 1 imports for validation and response standardization
import { getValidatedData } from '@server/middleware/requestValidation';
import { RequestService } from '@server/services/RequestService';
import { isFeatureEnabled } from '@server/shared/FeatureFlags';
import { ResponseWrapper } from '@shared/utils/responseWrapper';
import {
  CreateRequestInput,
  CreateRequestSchema,
  formatValidationErrors,
  validateRequestData,
} from '@shared/validation/requestSchemas';

// ✅ FIX: Enhanced error handling for database operations with fallback

export class RequestController {
  static async createRequest(req: Request, res: Response): Promise<void> {
    try {
      logger.info(
        '📝 [RequestController] Creating new request - Phase 1 Enhanced',
        'RequestController'
      );

      // ✅ NEW: Phase 1 - Input validation with feature flag
      let validatedData: CreateRequestInput;

      if (isFeatureEnabled('request-validation-v2')) {
        // Use validated data from middleware if available
        const middlewareData = getValidatedData<CreateRequestInput>(req);

        if (middlewareData) {
          validatedData = middlewareData;
          logger.debug(
            '✅ [RequestController] Using validated data from middleware',
            'RequestController'
          );
        } else {
          // Fallback validation if middleware not used
          const validationResult = validateRequestData(
            CreateRequestSchema,
            req.body
          );

          if (!validationResult.success) {
            const formattedErrors = formatValidationErrors(
              (validationResult as any).errors
            );
            logger.warn(
              '❌ [RequestController] Validation failed',
              'RequestController',
              { errors: formattedErrors.details }
            );

            ResponseWrapper.sendValidationError(res, formattedErrors.details);
            return;
          }

          validatedData = validationResult.data;
          logger.debug(
            '✅ [RequestController] Fallback validation passed',
            'RequestController'
          );
        }
      } else {
        // Legacy mode - use original validation
        const { serviceType, requestText, roomNumber, guestName, priority } =
          req.body;

        if (!requestText || !roomNumber) {
          ResponseWrapper.sendError(
            res,
            'Missing required fields: requestText and roomNumber',
            400,
            'VALIDATION_ERROR'
          );
          return;
        }

        validatedData = {
          serviceType,
          requestText,
          roomNumber,
          guestName,
          priority: priority || 'medium',
          tenantId: req.body.tenantId,
        };

        logger.debug(
          '🔧 [RequestController] Using legacy validation mode',
          'RequestController'
        );
      }

      // ✅ NEW: Phase 2 - Use service layer for business logic
      const requestService = new RequestService();
      const serviceResult = await requestService.createRequest(validatedData);

      if (!serviceResult.success) {
        logger.error(
          '❌ [RequestController] Service layer failed to create request',
          'RequestController',
          { error: serviceResult.error, code: serviceResult.code }
        );

        if (isFeatureEnabled('request-response-standardization')) {
          ResponseWrapper.sendError(
            res,
            serviceResult.error || 'Failed to create request',
            500,
            serviceResult.code
          );
        } else {
          (res as any).status(500).json({
            success: false,
            error: serviceResult.error || 'Failed to create request',
            code: serviceResult.code,
          });
        }
        return;
      }

      const newRequest = [serviceResult.data!]; // Convert to array for compatibility

      // ✅ NEW: Phase 1 - Standardized response format
      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendResponse(res, newRequest[0], 201, {
          version: '2.1.0',
        });
      } else {
        // Legacy response format
        const response = {
          success: true,
          data: newRequest[0],
          _metadata: {
            module: 'request-module',
            version: '2.0.0',
            architecture: 'modular-enhanced',
          },
        };

        (res as any).status(201).json(response);
      }

      logger.success(
        '✅ [RequestController] Request created successfully - Phase 1 Enhanced',
        'RequestController',
        {
          requestId: newRequest[0].id,
          validationMode: isFeatureEnabled('request-validation-v2')
            ? 'enhanced'
            : 'legacy',
          responseMode: isFeatureEnabled('request-response-standardization')
            ? 'standardized'
            : 'legacy',
        }
      );
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to create request - Phase 1 Enhanced',
        'RequestController',
        error
      );

      // ✅ NEW: Phase 1 - Enhanced error handling
      if (isFeatureEnabled('request-response-standardization')) {
        if (
          error instanceof Error &&
          error.message.includes('Database connection error')
        ) {
          ResponseWrapper.sendServiceUnavailable(
            res,
            'Database temporarily unavailable. Please try again.'
          );
        } else {
          ResponseWrapper.sendDatabaseError(res, 'Failed to create request');
        }
      } else {
        // Legacy error response format
        if (
          error instanceof Error &&
          error.message.includes('Database connection error')
        ) {
          (res as any).status(503).json({
            success: false,
            error: 'Database temporarily unavailable. Please try again.',
            code: 'DATABASE_UNAVAILABLE',
          });
        } else {
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
      logger.info(
        '📋 [RequestController] Getting all requests - Phase 2 Enhanced',
        'RequestController'
      );

      // ✅ NEW: Phase 2 - Use service layer for business logic
      const requestService = new RequestService();

      // Extract filters from query parameters
      const filters = req.query as any;
      const serviceResult = await requestService.getAllRequests(filters);

      if (!serviceResult.success) {
        logger.error(
          '❌ [RequestController] Service layer failed to get requests',
          'RequestController',
          { error: serviceResult.error, code: serviceResult.code }
        );

        if (isFeatureEnabled('request-response-standardization')) {
          ResponseWrapper.sendError(
            res,
            serviceResult.error || 'Failed to fetch requests',
            500,
            serviceResult.code
          );
        } else {
          (res as any).status(500).json({
            success: false,
            error: serviceResult.error || 'Failed to fetch requests',
            _metadata: {
              module: 'request-module',
              version: '2.0.0',
              architecture: 'modular-enhanced',
            },
          });
        }
        return;
      }

      logger.success(
        '✅ [RequestController] Requests fetched successfully - Phase 2 Enhanced',
        'RequestController',
        {
          count: serviceResult.data?.length || 0,
          pagination: serviceResult.pagination,
        }
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendResponse(res, serviceResult.data, 200, {
          version: '2.2.0',
        });
      } else {
        (res as any).json({
          success: true,
          data: serviceResult.data,
          pagination: serviceResult.pagination,
        });
      }
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to fetch requests - Phase 2 Enhanced',
        'RequestController',
        error
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendDatabaseError(res, 'Failed to fetch requests');
      } else {
        (res as any).status(500).json({
          success: false,
          error: 'Failed to fetch requests',
          details: error instanceof Error ? error.message : 'Unknown error',
          _metadata: {
            module: 'request-module',
            version: '2.0.0',
            architecture: 'modular-enhanced',
          },
        });
      }
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
        `📋 [RequestController] Getting request by ID: ${id} - Phase 2 Enhanced`,
        'RequestController'
      );

      // ✅ NEW: Phase 2 - Use service layer for business logic
      const requestService = new RequestService();
      const serviceResult = await requestService.getRequestById(parseInt(id));

      if (!serviceResult.success) {
        logger.error(
          '❌ [RequestController] Service layer failed to get request by ID',
          'RequestController',
          { error: serviceResult.error, code: serviceResult.code }
        );

        if (serviceResult.code === 'NOT_FOUND') {
          if (isFeatureEnabled('request-response-standardization')) {
            ResponseWrapper.sendNotFound(res, 'Request');
          } else {
            (res as any).status(404).json({
              success: false,
              error: 'Request not found',
              code: 'REQUEST_NOT_FOUND',
            });
          }
        } else {
          if (isFeatureEnabled('request-response-standardization')) {
            ResponseWrapper.sendError(
              res,
              serviceResult.error || 'Failed to get request',
              500,
              serviceResult.code
            );
          } else {
            (res as any).status(500).json({
              success: false,
              error: serviceResult.error || 'Failed to get request',
              code: serviceResult.code,
            });
          }
        }
        return;
      }

      logger.success(
        '✅ [RequestController] Request fetched successfully - Phase 2 Enhanced',
        'RequestController',
        { requestId: id }
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendResponse(res, serviceResult.data, 200, {
          version: '2.2.0',
        });
      } else {
        (res as any).json({ success: true, data: serviceResult.data });
      }
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to get request by ID - Phase 2 Enhanced',
        'RequestController',
        error
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendDatabaseError(res, 'Failed to get request');
      } else {
        (res as any).status(500).json({
          success: false,
          error: 'Failed to get request',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Update request status
   * PATCH /api/request/:id/status
   */
  static async updateRequestStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes, assignedTo } = req.body;

      logger.info(
        `📝 [RequestController] Updating request status: ${id} -> ${status} - Phase 2 Enhanced`,
        'RequestController'
      );

      if (!status) {
        if (isFeatureEnabled('request-response-standardization')) {
          ResponseWrapper.sendValidationError(res, [
            { field: 'status', message: 'Status is required' },
          ]);
        } else {
          (res as any).status(400).json({
            success: false,
            error: 'Status is required',
            code: 'VALIDATION_ERROR',
          });
        }
        return;
      }

      // ✅ NEW: Phase 2 - Use service layer for business logic
      const requestService = new RequestService();
      const serviceResult = await requestService.updateRequestStatus(
        parseInt(id),
        {
          status,
          notes,
          assignedTo,
        }
      );

      if (!serviceResult.success) {
        logger.error(
          '❌ [RequestController] Service layer failed to update request status',
          'RequestController',
          { error: serviceResult.error, code: serviceResult.code }
        );

        if (serviceResult.code === 'NOT_FOUND') {
          if (isFeatureEnabled('request-response-standardization')) {
            ResponseWrapper.sendNotFound(res, 'Request');
          } else {
            (res as any).status(404).json({
              success: false,
              error: 'Request not found',
              code: 'REQUEST_NOT_FOUND',
            });
          }
        } else if (serviceResult.code === 'INVALID_STATUS_TRANSITION') {
          if (isFeatureEnabled('request-response-standardization')) {
            ResponseWrapper.sendError(
              res,
              serviceResult.error || 'Invalid status transition',
              400,
              serviceResult.code
            );
          } else {
            (res as any).status(400).json({
              success: false,
              error: serviceResult.error || 'Invalid status transition',
              code: serviceResult.code,
            });
          }
        } else {
          if (isFeatureEnabled('request-response-standardization')) {
            ResponseWrapper.sendError(
              res,
              serviceResult.error || 'Failed to update request status',
              500,
              serviceResult.code
            );
          } else {
            (res as any).status(500).json({
              success: false,
              error: serviceResult.error || 'Failed to update request status',
              code: serviceResult.code,
            });
          }
        }
        return;
      }

      logger.success(
        '✅ [RequestController] Request status updated successfully - Phase 2 Enhanced',
        'RequestController',
        {
          requestId: id,
          newStatus: status,
        }
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendResponse(res, serviceResult.data, 200, {
          version: '2.2.0',
        });
      } else {
        (res as any).json({ success: true, data: serviceResult.data });
      }
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to update request status - Phase 2 Enhanced',
        'RequestController',
        error
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendDatabaseError(
          res,
          'Failed to update request status'
        );
      } else {
        (res as any).status(500).json({
          success: false,
          error: 'Failed to update request status',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Bulk update request statuses
   */
  static async bulkUpdateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { requestIds, status, notes, assignedTo } = req.body;

      logger.info(
        `📝 [RequestController] Bulk updating request statuses - Phase 3 Enhanced`,
        'RequestController',
        {
          requestIds: requestIds?.length || 0,
          status,
          notes: notes ? 'provided' : 'none',
          assignedTo: assignedTo ? 'provided' : 'none',
        }
      );

      if (
        !requestIds ||
        !Array.isArray(requestIds) ||
        requestIds.length === 0
      ) {
        if (isFeatureEnabled('request-response-standardization')) {
          ResponseWrapper.sendValidationError(res, [
            {
              field: 'requestIds',
              message: 'Request IDs array is required and must not be empty',
            },
          ]);
        } else {
          (res as any).status(400).json({
            success: false,
            error: 'Request IDs array is required and must not be empty',
            code: 'VALIDATION_ERROR',
          });
        }
        return;
      }

      if (!status) {
        if (isFeatureEnabled('request-response-standardization')) {
          ResponseWrapper.sendValidationError(res, [
            { field: 'status', message: 'Status is required' },
          ]);
        } else {
          (res as any).status(400).json({
            success: false,
            error: 'Status is required',
            code: 'VALIDATION_ERROR',
          });
        }
        return;
      }

      // ✅ NEW: Phase 3 - Use service layer for bulk operations
      const requestService = new RequestService();
      const serviceResult = await requestService.bulkUpdateStatus(
        requestIds,
        status,
        notes,
        assignedTo
      );

      if (!serviceResult.success) {
        logger.error(
          '❌ [RequestController] Service layer failed to bulk update requests',
          'RequestController',
          { error: serviceResult.error, code: serviceResult.code }
        );

        if (isFeatureEnabled('request-response-standardization')) {
          ResponseWrapper.sendError(
            res,
            serviceResult.error || 'Failed to bulk update requests',
            500,
            serviceResult.code
          );
        } else {
          (res as any).status(500).json({
            success: false,
            error: serviceResult.error || 'Failed to bulk update requests',
            code: serviceResult.code,
          });
        }
        return;
      }

      logger.success(
        '✅ [RequestController] Bulk update completed successfully - Phase 3 Enhanced',
        'RequestController',
        {
          total: serviceResult.data?.total || 0,
          successful: serviceResult.data?.updated || 0,
          failed: serviceResult.data?.failed || 0,
          status,
        }
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendResponse(res, serviceResult.data, 200, {
          version: '2.3.0',
        });
      } else {
        (res as any).json({
          success: true,
          data: serviceResult.data,
        });
      }
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to bulk update requests - Phase 3 Enhanced',
        'RequestController',
        error
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendDatabaseError(
          res,
          'Failed to bulk update requests'
        );
      } else {
        (res as any).status(500).json({
          success: false,
          error: 'Failed to bulk update requests',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Get request statistics
   */
  static async getRequestStatistics(res: Response): Promise<void> {
    try {
      logger.info(
        '📊 [RequestController] Getting request statistics - Phase 3 Enhanced',
        'RequestController'
      );

      // ✅ NEW: Phase 3 - Use service layer for statistics
      const requestService = new RequestService();
      const serviceResult = await requestService.getRequestStatistics();

      if (!serviceResult.success) {
        logger.error(
          '❌ [RequestController] Service layer failed to get statistics',
          'RequestController',
          { error: serviceResult.error }
        );

        if (isFeatureEnabled('request-response-standardization')) {
          ResponseWrapper.sendError(
            res,
            serviceResult.error || 'Failed to get statistics',
            500
          );
        } else {
          (res as any).status(500).json({
            success: false,
            error: serviceResult.error || 'Failed to get statistics',
          });
        }
        return;
      }

      logger.success(
        '✅ [RequestController] Statistics fetched successfully - Phase 3 Enhanced',
        'RequestController',
        {
          total: serviceResult.data?.total || 0,
          pending: serviceResult.data?.pending || 0,
          urgent: serviceResult.data?.urgent || 0,
        }
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendResponse(res, serviceResult.data, 200, {
          version: '2.3.0',
        });
      } else {
        (res as any).json({
          success: true,
          data: serviceResult.data,
        });
      }
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to get statistics - Phase 3 Enhanced',
        'RequestController',
        error
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendDatabaseError(res, 'Failed to get statistics');
      } else {
        (res as any).status(500).json({
          success: false,
          error: 'Failed to get statistics',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Get urgent requests
   */
  static async getUrgentRequests(res: Response): Promise<void> {
    try {
      logger.info(
        '🚨 [RequestController] Getting urgent requests - Phase 3 Enhanced',
        'RequestController'
      );

      // ✅ NEW: Phase 3 - Use service layer for urgent requests
      const requestService = new RequestService();
      const serviceResult = await requestService.getUrgentRequests();

      if (!serviceResult.success) {
        logger.error(
          '❌ [RequestController] Service layer failed to get urgent requests',
          'RequestController',
          { error: serviceResult.error, code: serviceResult.code }
        );

        if (isFeatureEnabled('request-response-standardization')) {
          ResponseWrapper.sendError(
            res,
            serviceResult.error || 'Failed to get urgent requests',
            500,
            serviceResult.code
          );
        } else {
          (res as any).status(500).json({
            success: false,
            error: serviceResult.error || 'Failed to get urgent requests',
            code: serviceResult.code,
          });
        }
        return;
      }

      logger.success(
        '✅ [RequestController] Urgent requests fetched successfully - Phase 3 Enhanced',
        'RequestController',
        { count: serviceResult.data?.length || 0 }
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendResponse(res, serviceResult.data, 200, {
          version: '2.3.0',
        });
      } else {
        (res as any).json({
          success: true,
          data: serviceResult.data,
        });
      }
    } catch (error) {
      logger.error(
        '❌ [RequestController] Failed to get urgent requests - Phase 3 Enhanced',
        'RequestController',
        error
      );

      if (isFeatureEnabled('request-response-standardization')) {
        ResponseWrapper.sendDatabaseError(res, 'Failed to get urgent requests');
      } else {
        (res as any).status(500).json({
          success: false,
          error: 'Failed to get urgent requests',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
}
