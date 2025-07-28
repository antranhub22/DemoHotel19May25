import { sendCallSummary, sendServiceConfirmation } from '@server/gmail';
import { sendMobileCallSummary, sendMobileEmail } from '@server/mobileMail';
import {
  apiResponse,
  commonErrors,
  ErrorCodes,
} from '@server/utils/apiHelpers';
import { parsePagination } from '@server/utils/pagination';
import { logger } from '@shared/utils/logger';
import { Request, Response, Router } from 'express';

const router = Router();

// ============================================
// EMAIL SERVICES ROUTES - RESTful Design
// ============================================

// POST /api/emails/service - Send service confirmation email
router.post('/service', async (req: Request, res: Response) => {
  try {
    const {
      to = 'staff@hotel.com',
      orderNumber,
      customerRequest,
      customerInfo,
      details,
      deliveryTime,
      specialInstructions,
    } = req.body;

    if (!orderNumber || !customerRequest) {
      return commonErrors.missingFields(res, [
        'orderNumber',
        'customerRequest',
      ]);
    }

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return commonErrors.validation(res, 'Valid email address is required');
    }

    logger.debug(
      `📧 [EMAILS] Sending service email for order: ${orderNumber}`,
      'Emails'
    );

    const result = await sendServiceConfirmation(to, {
      serviceType: customerRequest,
      roomNumber: customerInfo,
      timestamp: new Date(),
      details: JSON.stringify(details),
      orderReference: orderNumber,
    });

    if (result.success) {
      logger.debug(
        `✅ [EMAILS] Service email sent successfully for order: ${orderNumber}`,
        'Emails'
      );

      return apiResponse.success(
        res,
        {
          messageId: result.messageId,
          orderNumber,
          recipient: to,
          emailType: 'service-confirmation',
          sentAt: new Date().toISOString(),
        },
        'Service confirmation email sent successfully'
      );
    } else {
      logger.error(
        `❌ [EMAILS] Failed to send service email for order: ${orderNumber}`,
        'Emails',
        result.error
      );

      return apiResponse.error(
        res,
        500,
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        result.error || 'Failed to send service email',
        { orderNumber, recipient: to }
      );
    }
  } catch (error) {
    logger.error('❌ [EMAILS] Failed to send service email:', 'Emails', error);
    return commonErrors.internal(res, 'Failed to send service email', error);
  }
});

// POST /api/emails/call-summary - Send call summary email
router.post('/call-summary', async (req: Request, res: Response) => {
  try {
    const {
      to = 'staff@hotel.com',
      callId,
      summary,
      duration,
      timestamp,
      guestRequests,
      roomNumber,
      language,
    } = req.body;

    if (!callId || !summary) {
      return commonErrors.missingFields(res, ['callId', 'summary']);
    }

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return commonErrors.validation(res, 'Valid email address is required');
    }

    logger.debug(
      `📧 [EMAILS] Sending call summary email for call: ${callId}`,
      'Emails'
    );

    const result = await sendCallSummary(to, {
      callId,
      summary,
      duration,
      timestamp: new Date(timestamp),
      roomNumber,
      serviceRequests: guestRequests || [],
    });

    if (result.success) {
      logger.debug(
        `✅ [EMAILS] Call summary email sent successfully for call: ${callId}`,
        'Emails'
      );

      return apiResponse.success(
        res,
        {
          messageId: result.messageId,
          callId,
          recipient: to,
          emailType: 'call-summary',
          duration,
          roomNumber,
          sentAt: new Date().toISOString(),
        },
        'Call summary email sent successfully'
      );
    } else {
      logger.error(
        `❌ [EMAILS] Failed to send call summary email for call: ${callId}`,
        'Emails',
        result.error
      );

      return apiResponse.error(
        res,
        500,
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        result.error || 'Failed to send call summary email',
        { callId, recipient: to }
      );
    }
  } catch (error) {
    logger.error(
      '❌ [EMAILS] Failed to send call summary email:',
      'Emails',
      error
    );
    return commonErrors.internal(
      res,
      'Failed to send call summary email',
      error
    );
  }
});

// POST /api/emails/test - Send test email
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { to = 'test@hotel.com' } = req.body;

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return commonErrors.validation(res, 'Valid email address is required');
    }

    logger.debug(`🧪 [EMAILS] Sending test email to: ${to}`, 'Emails');

    const testEmailData = {
      to,
      orderNumber: 'TEST-' + Math.random().toString(36).substr(2, 9),
      customerRequest: 'Test service request',
      customerInfo: 'Test Customer',
      details: [{ item: 'Test Item', quantity: 1 }],
      deliveryTime: 'Test Time',
      specialInstructions: 'This is a test email',
    };

    const result = await sendServiceConfirmation(to, {
      serviceType: testEmailData.customerRequest,
      roomNumber: testEmailData.customerInfo,
      timestamp: new Date(),
      details: JSON.stringify(testEmailData.details),
      orderReference: testEmailData.orderNumber,
    });

    if (result.success) {
      logger.debug(
        `✅ [EMAILS] Test email sent successfully to: ${to}`,
        'Emails'
      );

      return apiResponse.success(
        res,
        {
          messageId: result.messageId,
          testData: testEmailData,
          recipient: to,
          emailType: 'test',
          sentAt: new Date().toISOString(),
        },
        'Test email sent successfully'
      );
    } else {
      logger.error(
        `❌ [EMAILS] Failed to send test email to: ${to}`,
        'Emails',
        result.error
      );

      return apiResponse.error(
        res,
        500,
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        result.error || 'Failed to send test email',
        { recipient: to, testData: testEmailData }
      );
    }
  } catch (error) {
    logger.error('❌ [EMAILS] Failed to send test email:', 'Emails', error);
    return commonErrors.internal(res, 'Failed to send test email', error);
  }
});

// POST /api/emails/mobile-test - Send mobile test email
router.post('/mobile-test', async (req: Request, res: Response) => {
  try {
    const { to = 'mobile-test@hotel.com' } = req.body;

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return commonErrors.validation(res, 'Valid email address is required');
    }

    logger.debug(`📱 [EMAILS] Sending mobile test email to: ${to}`, 'Emails');

    const testData = {
      to,
      subject: 'Mobile Test Email',
      orderNumber: 'MOBILE-' + Math.random().toString(36).substr(2, 9),
      customerRequest: 'Mobile test service request',
      details:
        'This is a mobile test email from the hotel voice assistant system.',
    };

    const result = await sendMobileEmail(
      to,
      testData.subject,
      testData.details
    );

    if (result.success) {
      logger.debug(
        `✅ [EMAILS] Mobile test email sent successfully to: ${to}`,
        'Emails'
      );

      return apiResponse.success(
        res,
        {
          messageId: result.messageId,
          testData,
          recipient: to,
          emailType: 'mobile-test',
          sentAt: new Date().toISOString(),
        },
        'Mobile test email sent successfully'
      );
    } else {
      logger.error(
        `❌ [EMAILS] Failed to send mobile test email to: ${to}`,
        'Emails',
        result.error
      );

      return apiResponse.error(
        res,
        500,
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        result.error || 'Failed to send mobile test email',
        { recipient: to, testData }
      );
    }
  } catch (error) {
    logger.error(
      '❌ [EMAILS] Failed to send mobile test email:',
      'Emails',
      error
    );
    return commonErrors.internal(
      res,
      'Failed to send mobile test email',
      error
    );
  }
});

// POST /api/emails/mobile-call-summary - Send mobile call summary email
router.post('/mobile-call-summary', async (req: Request, res: Response) => {
  try {
    const {
      to = 'staff@hotel.com',
      callId,
      summary,
      roomNumber,
      timestamp,
    } = req.body;

    if (!callId || !summary) {
      return commonErrors.missingFields(res, ['callId', 'summary']);
    }

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return commonErrors.validation(res, 'Valid email address is required');
    }

    logger.debug(
      `📱 [EMAILS] Sending mobile call summary email for call: ${callId}`,
      'Emails'
    );

    const result = await sendMobileCallSummary(to, {
      callId,
      summary,
      roomNumber,
      timestamp: new Date(timestamp),
      duration: '0:00',
      serviceRequests: [],
    });

    if (result.success) {
      logger.debug(
        `✅ [EMAILS] Mobile call summary email sent successfully for call: ${callId}`,
        'Emails'
      );

      return apiResponse.success(
        res,
        {
          messageId: result.messageId,
          callId,
          recipient: to,
          emailType: 'mobile-call-summary',
          roomNumber,
          sentAt: new Date().toISOString(),
        },
        'Mobile call summary email sent successfully'
      );
    } else {
      logger.error(
        `❌ [EMAILS] Failed to send mobile call summary email for call: ${callId}`,
        'Emails',
        result.error
      );

      return apiResponse.error(
        res,
        500,
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        result.error || 'Failed to send mobile call summary email',
        { callId, recipient: to }
      );
    }
  } catch (error) {
    logger.error(
      '❌ [EMAILS] Failed to send mobile call summary email:',
      'Emails',
      error
    );
    return commonErrors.internal(
      res,
      'Failed to send mobile call summary email',
      error
    );
  }
});

// GET /api/emails/status - Get email service status
router.get('/status', async (req: Request, res: Response) => {
  try {
    logger.debug(`📧 [EMAILS] Checking email service status`, 'Emails');

    // Basic Mailjet configuration check
    const mailjetConfig = {
      apiKey: process.env.MAILJET_API_KEY
        ? '***configured***'
        : 'not configured',
      secretKey: process.env.MAILJET_SECRET_KEY
        ? '***configured***'
        : 'not configured',
      fromEmail: process.env.MAILJET_FROM_EMAIL || 'not configured',
      fromName: process.env.MAILJET_FROM_NAME || 'not configured',
    };

    const isConfigured =
      process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY;

    return apiResponse.success(
      res,
      {
        status: isConfigured ? 'configured' : 'not configured',
        config: mailjetConfig,
        isOperational: isConfigured,
        checkedAt: new Date().toISOString(),
      },
      isConfigured
        ? 'Email service is properly configured'
        : 'Email service configuration missing'
    );
  } catch (error) {
    logger.error(
      '❌ [EMAILS] Failed to check email service status:',
      'Emails',
      error
    );
    return commonErrors.internal(
      res,
      'Failed to check email service status',
      error
    );
  }
});

// GET /api/emails/ - Get recent emails with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page, limit } = parsePagination(req.query, 10, 50);

    logger.debug(
      `📧 [EMAILS] Getting recent emails (page: ${page}, limit: ${limit})`,
      'Emails'
    );

    // Note: This is a placeholder implementation
    // In a real system, you would query your email sending logs/database
    const recentEmails = [
      {
        id: 1,
        to: 'staff@hotel.com',
        subject: 'Service Request Confirmation',
        type: 'service',
        status: 'sent',
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        to: 'manager@hotel.com',
        subject: 'Call Summary',
        type: 'call-summary',
        status: 'sent',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    const startIndex = (page - 1) * limit;
    const paginatedEmails = recentEmails.slice(startIndex, startIndex + limit);

    logger.debug(
      `✅ [EMAILS] Found ${recentEmails.length} recent emails`,
      'Emails'
    );

    return apiResponse.success(
      res,
      paginatedEmails,
      `Retrieved ${paginatedEmails.length} recent emails`,
      {
        pagination: {
          page,
          limit,
          total: recentEmails.length,
          totalPages: Math.ceil(recentEmails.length / limit),
          hasNext: startIndex + limit < recentEmails.length,
          hasPrev: page > 1,
        },
      }
    );
  } catch (error) {
    logger.error('❌ [EMAILS] Failed to fetch recent emails:', 'Emails', error);
    return commonErrors.database(res, 'Failed to fetch recent emails', error);
  }
});

export default router;
