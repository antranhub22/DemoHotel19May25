import { Router } from 'express';
import { sendServiceConfirmation, sendCallSummary } from '@server/gmail';
import { sendMobileEmail, sendMobileCallSummary } from '@server/mobileMail';
// import { z } from 'zod'; // Not used currently
import { logger } from '@shared/utils/logger';

const router = Router();

// Helper function for error handling
function handleApiError(res: Response, error: any, defaultMessage: string) {
  logger.error(defaultMessage, 'Component', error);
  (res as any).status(500).json({
    error: defaultMessage,
    details: process.env.NODE_ENV === 'development' ? (error as any)?.message || String(error) : undefined,
  });
}

// ============================================
// EMAIL SERVICES ENDPOINTS
// ============================================

// Send service confirmation email
router.post('/send-service-email', async (req: Request, res: Response) => {
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
      return (res as any).status(400).json({
        error: 'Missing required fields: orderNumber, customerRequest',
      });
    }

    logger.debug(`📧 [EMAIL] Sending service email for order: ${orderNumber}`, 'Component');

    const emailData = {
      to,
      orderNumber,
      customerRequest,
      customerInfo: customerInfo || 'N/A',
      details: details || [],
      deliveryTime: deliveryTime || 'Càng sớm càng tốt',
      specialInstructions: specialInstructions || 'Không có',
    };

    const result = await sendServiceConfirmation(to, {
      serviceType: customerRequest,
      roomNumber: customerInfo,
      timestamp: new Date(),
      details: JSON.stringify(details),
      orderReference: orderNumber,
    });

    if (result.success) {
      logger.debug(`✅ [EMAIL] Service email sent successfully for order: ${orderNumber}`, 'Component');
      (res as any).json({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: result.messageId 
      });
    } else {
      logger.error(`❌ [EMAIL] Failed to send service email for order: ${orderNumber}`, 'Component', result.error);
      (res as any).status(500).json({
        success: false,
        error: result.error || 'Failed to send email',
      });
    }
  } catch (error) {
    handleApiError(res, error, 'Failed to send service email');
  }
});

// Send call summary email
router.post('/send-call-summary-email', async (req: Request, res: Response) => {
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
      return (res as any).status(400).json({
        error: 'Missing required fields: callId, summary',
      });
    }

    logger.debug(`📧 [EMAIL] Sending call summary email for call: ${callId}`, 'Component');

    const emailData = {
      to,
      callId,
      summary,
      duration: duration || 'N/A',
      timestamp: timestamp || new Date().toISOString(),
      guestRequests: guestRequests || [],
      roomNumber: roomNumber || 'N/A',
      language: language || 'vi',
    };

    const result = await sendCallSummary(to, {
      callId,
      summary,
      duration,
      timestamp: new Date(timestamp),
      roomNumber,
      serviceRequests: guestRequests || [],
    });

    if (result.success) {
      logger.debug(`✅ [EMAIL] Call summary email sent successfully for call: ${callId}`, 'Component');
      (res as any).json({ 
        success: true, 
        message: 'Call summary email sent successfully',
        messageId: result.messageId 
      });
    } else {
      logger.error(`❌ [EMAIL] Failed to send call summary email for call: ${callId}`, 'Component', result.error);
      (res as any).status(500).json({
        success: false,
        error: result.error || 'Failed to send call summary email',
      });
    }
  } catch (error) {
    handleApiError(res, error, 'Failed to send call summary email');
  }
});

// Test email endpoint
router.post('/test-email', async (req: Request, res: Response) => {
  try {
    const { to = 'test@hotel.com', subject = 'Test Email' } = req.body;

    logger.debug(`🧪 [EMAIL] Sending test email to: ${to}`, 'Component');

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
      logger.debug(`✅ [EMAIL] Test email sent successfully to: ${to}`, 'Component');
      (res as any).json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId,
        testData: testEmailData
      });
    } else {
      logger.error(`❌ [EMAIL] Failed to send test email to: ${to}`, 'Component', result.error);
      (res as any).status(500).json({
        success: false,
        error: result.error || 'Failed to send test email',
      });
    }
  } catch (error) {
    handleApiError(res, error, 'Failed to send test email');
  }
});

// Mobile test email endpoint
router.post('/mobile-test-email', async (req: Request, res: Response) => {
  try {
    const { to = 'mobile-test@hotel.com' } = req.body;

    logger.debug(`📱 [EMAIL] Sending mobile test email to: ${to}`, 'Component');

    const testData = {
      to,
      subject: 'Mobile Test Email',
      orderNumber: 'MOBILE-' + Math.random().toString(36).substr(2, 9),
      customerRequest: 'Mobile test service request',
      details: 'This is a mobile test email from the hotel voice assistant system.',
    };

    const result = await sendMobileEmail(to, testData.subject, testData.details);

    if (result.success) {
      logger.debug(`✅ [EMAIL] Mobile test email sent successfully to: ${to}`, 'Component');
      (res as any).json({ 
        success: true, 
        message: 'Mobile test email sent successfully',
        messageId: result.messageId,
        testData
      });
    } else {
      logger.error(`❌ [EMAIL] Failed to send mobile test email to: ${to}`, 'Component', result.error);
      (res as any).status(500).json({
        success: false,
        error: result.error || 'Failed to send mobile test email',
      });
    }
  } catch (error) {
    handleApiError(res, error, 'Failed to send mobile test email');
  }
});

// Mobile call summary email endpoint
router.post('/mobile-call-summary-email', async (req: Request, res: Response) => {
  try {
    const {
      to = 'staff@hotel.com',
      callId,
      summary,
      roomNumber,
      timestamp,
    } = req.body;

    if (!callId || !summary) {
      return (res as any).status(400).json({
        error: 'Missing required fields: callId, summary',
      });
    }

    logger.debug(`📱 [EMAIL] Sending mobile call summary email for call: ${callId}`, 'Component');

    const emailData = {
      to,
      callId,
      summary,
      roomNumber: roomNumber || 'N/A',
      timestamp: timestamp || new Date().toISOString(),
    };

    const result = await sendMobileCallSummary(to, {
      callId,
      summary,
      roomNumber,
      timestamp: new Date(timestamp),
      duration: '0:00',
      serviceRequests: [],
    });

    if (result.success) {
      logger.debug(`✅ [EMAIL] Mobile call summary email sent successfully for call: ${callId}`, 'Component');
      (res as any).json({ 
        success: true, 
        message: 'Mobile call summary email sent successfully',
        messageId: result.messageId 
      });
    } else {
      logger.error(`❌ [EMAIL] Failed to send mobile call summary email for call: ${callId}`, 'Component', result.error);
      (res as any).status(500).json({
        success: false,
        error: result.error || 'Failed to send mobile call summary email',
      });
    }
  } catch (error) {
    handleApiError(res, error, 'Failed to send mobile call summary email');
  }
});

// Get Mailjet status
router.get('/mailjet-status', async (req: Request, res: Response) => {
  try {
    logger.debug(`📧 [EMAIL] Checking Mailjet status`, 'Component');

    // Basic Mailjet configuration check
    const mailjetConfig = {
      apiKey: process.env.MAILJET_API_KEY ? '***configured***' : 'not configured',
      secretKey: process.env.MAILJET_SECRET_KEY ? '***configured***' : 'not configured',
      fromEmail: process.env.MAILJET_FROM_EMAIL || 'not configured',
      fromName: process.env.MAILJET_FROM_NAME || 'not configured',
    };

    const isConfigured = process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY;

    (res as any).json({
      success: true,
      status: isConfigured ? 'configured' : 'not configured',
      config: mailjetConfig,
      message: isConfigured ? 'Mailjet is properly configured' : 'Mailjet configuration missing',
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to check Mailjet status');
  }
});

// Get recent emails
router.get('/recent-emails', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    logger.debug(`📧 [EMAIL] Getting recent emails (limit: ${limit})`, 'Component');

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

    logger.debug(`✅ [EMAIL] Found ${recentEmails.length} recent emails`, 'Component');
    (res as any).json({
      success: true,
      emails: recentEmails.slice(0, limit),
      total: recentEmails.length,
    });
  } catch (error) {
    handleApiError(res, error, 'Failed to fetch recent emails');
  }
});

export default router; 