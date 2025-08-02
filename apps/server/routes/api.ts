import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from '@server/utils/apiHelpers';
import { db } from '@shared/db';
// import { call } from '@shared/db'; // Table not exists in database
import { logger } from '@shared/utils/logger';
import { eq } from 'drizzle-orm';
import express from 'express';
import {
  getHourlyActivity,
  getOverview,
  getServiceDistribution,
} from '../analytics';

const router = express.Router();

// ============================================
// CALL DURATION & END HANDLING
// ============================================

// Update call duration endpoint
router.post('/call-end', express.json(), async (req, res) => {
  try {
    const { callId, duration } = req.body;

    if (!callId || duration === undefined) {
      return commonErrors.missingFields(res, ['callId', 'duration']);
    }

    if (typeof duration !== 'number' || duration < 0) {
      return commonErrors.validation(res, 'Duration must be a positive number');
    }

    // Update call duration and end time using existing schema fields
    await db
      .update(call)
      .set({
        duration: Math.floor(duration),
        end_time: new Date(),
      })
      .where(eq(call.call_id_vapi, callId));

    logger.debug(
      `✅ [API] Updated call duration for ${callId}: ${duration} seconds`,
      'Component'
    );

    return apiResponse.success(
      res,
      {
        callId,
        duration: Math.floor(duration),
        endTime: new Date().toISOString(),
      },
      'Call duration updated successfully'
    );
  } catch (error) {
    logger.error('❌ [API] Error updating call duration:', 'Component', error);
    return apiResponse.error(
      res,
      500,
      ErrorCodes.CALL_NOT_FOUND,
      'Failed to update call duration',
      error
    );
  }
});

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

// Analytics overview endpoint
router.get('/analytics/overview', async (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'mi-nhon-hotel';
    logger.debug(
      `📊 [API] Getting analytics overview for tenant: ${tenantId}`,
      'Component'
    );

    const overview = await getOverview();

    return apiResponse.success(
      res,
      overview,
      'Analytics overview retrieved successfully',
      { tenantId }
    );
  } catch (error) {
    logger.error(
      '❌ [API] Error fetching analytics overview:',
      'Component',
      error
    );
    return commonErrors.database(
      res,
      'Failed to fetch analytics overview',
      error
    );
  }
});

// Service distribution analytics
router.get('/analytics/service-distribution', async (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'mi-nhon-hotel';
    logger.debug(
      `📊 [API] Getting service distribution for tenant: ${tenantId}`,
      'Component'
    );

    const distribution = await getServiceDistribution();

    return apiResponse.success(
      res,
      distribution,
      'Service distribution retrieved successfully',
      { tenantId }
    );
  } catch (error) {
    logger.error(
      '❌ [API] Error fetching service distribution:',
      'Component',
      error
    );
    return commonErrors.database(
      res,
      'Failed to fetch service distribution',
      error
    );
  }
});

// Hourly activity analytics
router.get('/analytics/hourly-activity', async (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'mi-nhon-hotel';
    logger.debug(
      `📊 [API] Getting hourly activity for tenant: ${tenantId}`,
      'Component'
    );

    const activity = await getHourlyActivity();

    return apiResponse.success(
      res,
      activity,
      'Hourly activity retrieved successfully',
      { tenantId }
    );
  } catch (error) {
    logger.error(
      '❌ [API] Error fetching hourly activity:',
      'Component',
      error
    );
    return commonErrors.database(res, 'Failed to fetch hourly activity', error);
  }
});

export default router;
