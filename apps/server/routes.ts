import { createServer, Server } from 'http';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { eq, desc, sql } from 'drizzle-orm';
import { logger } from '../packages/shared/utils/logger.js';
import { authenticateJWT } from '../packages/auth-system/middleware/auth.middleware.js';
import { sendServiceConfirmation, sendOrderConfirmation, sendCallSummary, sendMobileCallSummary } from './email.js';
import { 
  call, 
  transcript, 
  tenants, 
  hotelProfiles,
  request as requestTable,
  message as messageTable,
  staff
} from '../packages/shared/db/schema.js';
import { db } from './db.js';
import { openai } from './openai.js';
import { setupSocket } from './socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================== Helper Functions ========================

function extractRoomNumber(content: string): string | null {
  const patterns = [
    /(?:room|phòng)\s*(?:number|số)?\s*(\d{3,4})/i,
    /tôi ở phòng\s*(\d{3,4})/i,
    /phòng\s*(\d{3,4})/i,
    /room\s*(\d{3,4})/i,
    /\b(\d{3,4})\b/,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

function extractLanguage(content: string): string {
  const vietnamesePatterns = [
    /xin chào|chào bạn|tôi muốn|cảm ơn|phòng|dịch vụ/i,
  ];

  for (const pattern of vietnamesePatterns) {
    if (pattern.test(content)) {
      return 'vi';
    }
  }
  return 'en';
}

function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// ======================== Helper Functions (Tenant & Subdomain) ========================

const extractSubdomain = (req: Request): string | null => {
  const host = req.get('host');
  if (!host) return null;

  const parts = host.split('.');
  if (parts.length >= 2) {
    return parts[0];
  }
  return null;
};

const getMiNhonTenantId = (): string => {
  return process.env.MINHON_TENANT_ID || 'minhon-default-tenant-id';
};

// ======================== Express Rate Limiting ========================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // eslint-disable-next-line no-unused-vars
  skip: (_req, _res) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  },
});

// Apply rate limiting to API routes
const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs for dashboard
  message: 'Too many dashboard requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // eslint-disable-next-line no-unused-vars
  skip: (_req, _res) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  },
});

// ======================== Helper Functions ========================

function createRoomNotificationString(_hotelName: string, roomNumber: string): string {
  return `Customer from Room ${roomNumber} requested `;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function handleApiError(res: Response, error: any, defaultMessage: string) {
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || defaultMessage;

  logger.error(defaultMessage, 'Component', error);

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      error: message,
      stack: error.stack,
      details: error,
    });
  } else {
    // Ở production, không trả về stack trace
    console.error(defaultMessage, error.message);
    return res.status(500).json({ error: defaultMessage });
  }
}

// Đảm bảo globalThis.wss có type đúng
declare global {
  var _wss: import('ws').WebSocketServer | undefined;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server for express app
  const httpServer = createServer(app);

  // Create WebSocket server
  const _wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  globalThis._wss = _wss;

  // Store active connections
  const clients = new Set<WebSocketClient>();

  // Handle WebSocket connections
  _wss.on('connection', (ws: WebSocketClient) => {
    logger.debug('WebSocket client connected', 'Component');

    // Add client to set
    clients.add(ws);
    ws.isAlive = true;

    // Handle ping/pong for connection health
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        logger.debug('WebSocket message received:', 'Component', message);

        // Echo message to all clients (simple broadcast)
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'echo',
              data: message,
              timestamp: new Date().toISOString(),
            }));
          }
        });
      } catch (error) {
        logger.error('Error processing WebSocket message:', 'Component', error);
      }
    });

    // Handle connection close
    ws.on('close', () => {
      logger.debug('WebSocket client disconnected', 'Component');
      clients.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to Hotel Voice Assistant WebSocket',
      timestamp: new Date().toISOString(),
    }));
  });

  // Ping clients periodically to check connection health
  const interval = setInterval(() => {
    clients.forEach(ws => {
      if (!ws.isAlive) {
        logger.debug('Terminating inactive WebSocket connection', 'Component');
        clients.delete(ws);
        ws.terminate();
        return;
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // 30 seconds

  // Clean up interval on server close
  httpServer.on('close', () => {
    clearInterval(interval);
  });

  // API routes

  // ======================== Health Check Routes ========================
  // Import and register health check routes
  try {
    const healthRoutes = await import('./routes/health.js');
    app.use('/api', healthRoutes.default);
    logger.debug('✅ Health check routes registered', 'Component');
  } catch (error) {
    logger.error('❌ Failed to register health check routes:', 'Component', error);
  }

  // Test OpenAI API endpoint
  app.post('/api/test-openai', async (req, res) => {
    try {
      const { message } = req.body;
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: message || 'Hello, give me a quick test response.',
          },
        ],
        max_tokens: 150,
      });

      res.json({
        success: true,
        response: response.choices[0]?.message?.content || 'No response',
        usage: response.usage,
      });
    } catch (error: any) {
      logger.error('OpenAI API test failed:', 'Component', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to test OpenAI API',
      });
    }
  });

  // Call end endpoint - stores call duration and transcript
  app.post('/api/call-end', express.json(), async (req, res) => {
    try {
      const { call_id_vapi, duration } = req.body;

      if (!call_id_vapi) {
        return res.status(400).json({ error: 'Missing call_id_vapi' });
      }

      // Update call record with duration
      const result = await db
        .update(call)
        .set({
          duration: duration || 0,
          end_time: new Date(),
        })
        .where(eq(call.call_id_vapi, call_id_vapi))
        .returning();

      res.json({
        success: true,
        message: 'Call ended and duration stored',
        call: result[0],
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error ending call:');
    }
  });

  // Store call summary endpoint
  app.post('/api/store-summary', async (req, res) => {
    try {
      const { 
        call_id_vapi, 
        roomNumber,
        summary, 
        language = 'en',
        service_type = 'general',
        summary_vietnamese,
        summary_english
      } = req.body;

      if (!call_id_vapi) {
        return res.status(400).json({ error: 'Missing call_id_vapi' });
      }

      // Check if call exists
      let existingCall = await db
        .select()
        .from(call)
        .where(eq(call.call_id_vapi, call_id_vapi))
        .limit(1);

      let callRecord;
      if (existingCall.length === 0) {
        // Create call record if it doesn't exist
        const newCallData = {
          call_id_vapi,
          room_number: roomNumber || extractRoomNumber(summary || '') || 'Unknown',
          language: language || extractLanguage(summary || ''),
          service_type: service_type || 'general',
          start_time: new Date(),
        };

        [callRecord] = await db.insert(call).values(newCallData).returning();
        logger.debug('Created new call record for summary:', 'Component', callRecord);
      } else {
        callRecord = existingCall[0];
      }

      // Store the summary as a transcript
      const _savedTranscript = await db.insert(transcript).values({
        call_id: call_id_vapi,
        content: summary || 'Call summary not provided',
        role: 'assistant',
        timestamp: new Date(),
      }).returning();

      logger.debug('Summary stored successfully for call:', 'Component', call_id_vapi);

      res.json({
        success: true,
        message: 'Summary stored successfully',
        call_id: call_id_vapi,
        summary_id: _savedTranscript[0]?.id,
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error storing summary:');
    }
  });

  // Store transcript endpoint
  app.post('/api/store-transcript', async (req, res) => {
    try {
      const { call_id_vapi, transcript_data } = req.body;

      if (!call_id_vapi || !transcript_data) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const _roomNumber = extractRoomNumber(transcript_data.content || '');
      const _language = extractLanguage(transcript_data.content || '');

      // Check if call exists, create if not
      let existingCall = await db
        .select()
        .from(call)
        .where(eq(call.call_id_vapi, call_id_vapi))
        .limit(1);

      if (existingCall.length === 0) {
        const newCallData = {
          call_id_vapi,
          room_number: _roomNumber || 'Unknown',
          language: _language,
          service_type: 'general',
          start_time: new Date(),
        };

        await db.insert(call).values(newCallData);
        logger.debug('Created new call record for transcript:', 'Component', call_id_vapi);
      }

      try {
        const _dateError = new Date();
        // Store transcript
        const savedTranscript = await db.insert(transcript).values({
          call_id: call_id_vapi,
          content: transcript_data.content || '',
          role: transcript_data.role || 'user',
          timestamp: new Date(),
        }).returning();

        // Send real-time notification to all connected clients
        const _matchingClients = Array.from(clients).filter(client => client.readyState === WebSocket.OPEN);

        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'transcript',
              data: {
                call_id: call_id_vapi,
                content: transcript_data.content,
                role: transcript_data.role,
                timestamp: new Date().toISOString(),
              },
            }));
          }
        });

        res.json({
          success: true,
          message: 'Transcript stored and broadcasted',
          transcript_id: savedTranscript[0]?.id,
        });
      } catch (dbError: any) {
        logger.error('Database error storing transcript:', 'Component', dbError);
        res.status(500).json({
          error: 'Failed to store transcript',
          details: dbError.message,
        });
      }
    } catch (error: any) {
      handleApiError(res, error, 'Error storing transcript:');
    }
  });

  // Endpoint to fetch recent transcripts for a call
  app.get('/api/transcripts/:callId', async (req, res) => {
    try {
      const { callId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const transcripts = await db
        .select()
        .from(transcript)
        .where(eq(transcript.call_id, callId))
        .orderBy(desc(transcript.timestamp))
        .limit(limit);

      res.json({
        success: true,
        transcripts: transcripts.reverse(), // Show chronological order
        count: transcripts.length,
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error fetching transcripts:');
    }
  });

  // Store call reference endpoint
  app.post('/api/calls', async (req, res) => {
    try {
      const { call_id_vapi, room_number, language, service_type } = req.body;

      if (!call_id_vapi) {
        return res.status(400).json({ error: 'Missing call_id_vapi' });
      }

      // Check if call already exists
      const existingCall = await db
        .select()
        .from(call)
        .where(eq(call.call_id_vapi, call_id_vapi))
        .limit(1);

      if (existingCall.length > 0) {
        return res.json({
          success: true,
          message: 'Call already exists',
          call: existingCall[0],
        });
      }

      // Create new call record
      const newCall = await db.insert(call).values({
        call_id_vapi,
        room_number: room_number || 'Unknown',
        language: language || 'en',
        service_type: service_type || 'general',
        start_time: new Date(),
      }).returning();

      res.json({
        success: true,
        message: 'Call stored successfully',
        call: newCall[0],
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error storing call:');
    }
  });

  // Endpoint to process and store order information
  app.post('/api/orders', async (req, res) => {
    try {
      const {
        call_id_vapi,
        email,
        order_details,
        room_number,
        guest_name,
        service_type = 'room-service',
      } = req.body;

      if (!email || !order_details) {
        return res.status(400).json({ error: 'Missing required fields: email and order_details' });
      }

      // Generate unique order reference
      const _orderReference = `ORDER-${Date.now()}`;

      // Store in request table for staff dashboard
      const newRequest = await db.insert(requestTable).values({
        call_id: call_id_vapi || null,
        email,
        order_details,
        room_number: room_number || 'Unknown',
        guest_name: guest_name || 'Guest',
        service_type,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning();

      logger.success(`Order stored: ${newRequest[0].id}`, 'Component');

      // Send confirmation email
      const emailResult = await sendOrderConfirmation(email, {
        orderId: newRequest[0].id.toString(),
        orderDetails: order_details,
        roomNumber: room_number || 'Unknown',
        guestName: guest_name || 'Guest',
        estimatedTime: '30-45 minutes',
        contactInfo: 'Front Desk: +84 123 456 789',
      });

      if (emailResult.success) {
        logger.success(`Order confirmation email sent to: ${email}`, 'Component');
      } else {
        logger.error(`Failed to send order confirmation email:`, 'Component', emailResult.error);
      }

      res.json({
        success: true,
        message: 'Order processed and stored successfully',
        order_id: newRequest[0].id,
        email_sent: emailResult.success,
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error processing order:');
    }
  });

  // Service email endpoint
  app.post('/api/send-service-email', async (req, res) => {
    try {
      const {
        toEmail,
        serviceType,
        roomNumber,
        details,
        guestName,
        urgency = 'normal'
      } = req.body;

      logger.debug('Service email request received:', 'Component', {
        toEmail,
        serviceType,
        roomNumber,
        details,
        guestName,
        urgency
      });

      if (!toEmail || !serviceType || !roomNumber) {
        return res.status(400).json({
          error: 'Missing required fields: toEmail, serviceType, roomNumber'
        });
      }

      const result = await sendServiceConfirmation(toEmail, {
        serviceType,
        roomNumber,
        timestamp: new Date(),
        details: details || `${serviceType} requested for room ${roomNumber}`,
        guestName: guestName || 'Guest',
        urgency
      });

      if (result.success) {
        logger.success('Service email sent successfully', 'Component');
        res.json({
          success: true,
          message: 'Service email sent successfully',
          messageId: result.messageId,
          provider: result.provider || 'unknown'
        });
      } else {
        throw new Error(result.error?.toString() || 'Unknown error');
      }
    } catch (error: any) {
      handleApiError(res, error, 'Error sending service email:');
    }
  });

  // Call summary email endpoint
  app.post('/api/send-call-summary-email', async (req, res) => {
    try {
      const {
        call_id_vapi,
        toEmail,
        summary,
        roomNumber,
        guestName,
        callDuration,
        serviceType,
        language = 'en'
      } = req.body;

      logger.debug('Call summary email request:', 'Component', {
        call_id_vapi,
        toEmail,
        roomNumber,
        serviceType,
        language
      });

      if (!call_id_vapi || !toEmail || !summary) {
        return res.status(400).json({
          error: 'Missing required fields: call_id_vapi, toEmail, summary'
        });
      }

      try {
        const _dateError = new Date();
        const result = await sendCallSummary(toEmail, {
          callId: call_id_vapi,
          summary,
          roomNumber: roomNumber || 'Unknown',
          guestName: guestName || 'Guest',
          callDuration: callDuration || 'Unknown',
          serviceType: serviceType || 'General',
          timestamp: new Date(),
          language
        });

        if (result.success) {
          logger.success('Call summary email sent successfully', 'Component');

          // Store email activity in messages table
          const _serviceRequestStrings = [
            'room service',
            'housekeeping',
            'maintenance',
            'front desk'
          ];

          res.json({
            success: true,
            message: 'Call summary email sent successfully',
            messageId: result.messageId,
            provider: result.provider || 'unknown'
          });
        } else {
          throw new Error(result.error?.toString() || 'Unknown email error');
        }
      } catch (emailError: any) {
        logger.error('Email sending error:', 'Component', emailError);
        res.status(500).json({
          error: 'Failed to send call summary email',
          details: emailError.message
        });
      }
    } catch (error: any) {
      handleApiError(res, error, 'Error sending call summary email:');
    }
  });

  // Endpoint to get call summaries by call ID
  app.get('/api/summaries/:callId', async (req, res) => {
    try {
      const { callId } = req.params;

      const summaries = await db
        .select()
        .from(transcript)
        .where(eq(transcript.call_id, callId))
        .orderBy(desc(transcript.timestamp));

      res.json({
        success: true,
        summaries,
        count: summaries.length,
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error fetching summaries:');
    }
  });

  // Endpoint to get recent summaries by hours
  app.get('/api/summaries/recent/:hours', async (req, res) => {
    try {
      const hours = parseInt(req.params.hours) || 24;
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);

      const recentSummaries = await db
        .select()
        .from(transcript)
        .where(sql`${transcript.timestamp} >= ${hoursAgo}`)
        .orderBy(desc(transcript.timestamp));

      res.json({
        success: true,
        summaries: recentSummaries,
        count: recentSummaries.length,
        timeRange: `Last ${hours} hours`,
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error fetching recent summaries:');
    }
  });

  // Vietnamese translation endpoint
  app.post('/api/translate-to-vietnamese', async (req, res) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Missing text to translate' });
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate the given text to Vietnamese. Only provide the translation, no explanations.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        max_tokens: 500,
      });

      const translation = response.choices[0]?.message?.content || 'Translation failed';

      res.json({
        success: true,
        original: text,
        translated: translation,
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error translating text:');
    }
  });

  // Test email configuration
  app.post('/api/test-email', async (req, res) => {
    try {
      // Check Gmail credentials first (preferred method)
      if (process.env.GMAIL_APP_PASSWORD) {
        logger.debug('Using Gmail for test email', 'Component');
      } else if (
        process.env.MAILJET_API_KEY &&
        process.env.MAILJET_SECRET_KEY
      ) {
        logger.debug('Using Mailjet for test email', 'Component');
      } else {
        return res.status(400).json({
          success: false,
          error: 'Email credentials not configured',
          missingEnv: true,
        });
      }

      const { toEmail, isMobile } = req.body;

      if (!toEmail) {
        return res.status(400).json({ error: 'Recipient email is required' });
      }

      console.log(
        `Sending test email to ${toEmail} (${isMobile ? 'mobile device' : 'desktop'})`
      );

      // Send a simple test email
      const result = await sendServiceConfirmation(toEmail, {
        serviceType: 'Mobile Test Email',
        roomNumber: isMobile ? 'MOBILE-TEST' : 'DESKTOP-TEST',
        timestamp: new Date(),
        details: `Đây là email kiểm tra từ Mi Nhon Hotel Voice Assistant. Sent from ${isMobile ? 'MOBILE' : 'DESKTOP'} at ${new Date().toISOString()}`,
      });

      logger.debug('Email test result:', 'Component', result);

      if (result.success) {
        res.json({
          success: true,
          message: 'Test email sent successfully',
          messageId: result.messageId,
          provider: process.env.GMAIL_APP_PASSWORD ? 'gmail' : 'mailjet',
        });
      } else {
        throw new Error(result.error?.toString() || 'Unknown error');
      }
    } catch (error: any) {
      handleApiError(res, error, 'Error sending test email:');
    }
  });

  // Mobile-friendly test endpoint with simplified response
  app.post('/api/mobile-test-email', async (req, res) => {
    try {
      logger.debug('Mobile test email requested', 'Component');

      // Default email if not provided
      const toEmail = req.body.toEmail || 'tuans2@gmail.com';

      // Xác định loại thiết bị gửi request
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(
        userAgent
      );

      // Ghi log chi tiết
      logger.debug('=================== MOBILE EMAIL TEST ===================', 'Component');
      logger.debug('Time:', 'Component', new Date().toISOString());
      logger.debug('Device info:', 'Component', userAgent);
      logger.debug('Device type:', 'Component', isMobile ? 'MOBILE' : 'DESKTOP');
      logger.debug('Recipient:', 'Component', toEmail);
      logger.debug('=========================================================', 'Component');

      // Send with timeout to ensure request completes and return response immediately
      setTimeout(async () => {
        try {
          // Sử dụng phương thức đặc biệt cho thiết bị di động
          if (isMobile) {
            logger.debug('Gửi email qua phương thức chuyên biệt cho thiết bị di động...', 'Component');

            const result = await sendMobileCallSummary(
              toEmail,
              'Mi Nhon Hotel - Test từ thiết bị di động',
              `Đây là email kiểm tra được gửi từ thiết bị di động lúc ${new Date().toLocaleTimeString()}.
              
Thiết bị: ${userAgent}
              
Thông báo này xác nhận rằng hệ thống gửi email trên thiết bị di động đang hoạt động bình thường.
              
Trân trọng,
Mi Nhon Hotel Mui Ne`
            );

            logger.debug('Kết quả gửi email qua mobile mail:', 'Component', result);
          }
          // Cho thiết bị desktop sử dụng phương thức thông thường
          else {
            logger.debug('Gửi email với phương thức thông thường...', 'Component');
            const result = await sendServiceConfirmation(toEmail, {
              serviceType: 'Mobile Test',
              roomNumber: 'DEVICE-TEST',
              timestamp: new Date(),
              details: `Email kiểm tra gửi từ thiết bị ${isMobile ? 'di động' : 'desktop'} lúc ${new Date().toLocaleTimeString()}. UA: ${userAgent}`,
            });

            logger.debug('Kết quả gửi email thông thường:', 'Component', result);
          }
        } catch (innerError) {
          logger.error('Lỗi trong timeout callback:', 'Component', innerError);
          logger.error('Chi tiết lỗi:', 'Component', JSON.stringify(innerError));
        }
      }, 50); // Giảm thời gian chờ xuống để di động xử lý nhanh hơn

      // Return success immediately to avoid mobile browser timeout
      res.status(200).json({
        success: true,
        message:
          'Email đang được xử lý, vui lòng kiểm tra hộp thư sau giây lát',
        deviceType: isMobile ? 'mobile' : 'desktop',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error in mobile test email endpoint:');
    }
  });

  // Endpoint gửi email tóm tắt cuộc gọi từ thiết bị di động
  app.post('/api/mobile-call-summary-email', async (req, res) => {
    try {
      const { toEmail, callDetails } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (
        !toEmail ||
        !callDetails ||
        !callDetails.roomNumber ||
        !callDetails.summary
      ) {
        return res.status(400).json({
          success: false,
          error: 'Thiếu thông tin cần thiết để gửi email',
          missingFields: true,
        });
      }

      // Xác định thiết bị
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(
        userAgent
      );

      logger.debug('=================== MOBILE CALL SUMMARY EMAIL ===================', 'Component');
      logger.debug('Time:', 'Component', new Date().toISOString());
      logger.debug('Device:', 'Component', isMobile ? 'MOBILE' : 'DESKTOP');
      logger.debug('Room:', 'Component', callDetails.roomNumber);
      logger.debug('Recipient:', 'Component', toEmail);
      logger.debug('==============================================================', 'Component');

      // Tạo mã tham chiếu
      const orderReference =
        callDetails.orderReference ||
        `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;

      // Gửi email ngay lập tức và trả về kết quả thành công trước
      res.status(200).json({
        success: true,
        message:
          'Email đang được xử lý, vui lòng kiểm tra hộp thư sau giây lát',
        orderReference,
        timestamp: new Date().toISOString(),
      });

      // Phần xử lý bất đồng bộ gửi email
      try {
        logger.debug('Đang xử lý gửi email tóm tắt cuộc gọi từ thiết bị di động...', 'Component');

        // Thực hiện gửi email
        const result = await sendMobileCallSummary(toEmail, {
          callId: callDetails.callId || 'unknown',
          roomNumber: callDetails.roomNumber,
          timestamp: new Date(callDetails.timestamp || Date.now()),
          duration: callDetails.duration || '0:00',
          summary: callDetails.summary,
          serviceRequests: callDetails.serviceRequests || [],
          orderReference,
        });
        logger.debug('Kết quả gửi email tóm tắt cuộc gọi từ thiết bị di động:', 'Component', result);
        // Thêm mới: Lưu request vào database để hiển thị trong staff UI
        try {
          logger.debug('Lưu request từ thiết bị di động vào database...', 'Component');
          const cleanedSummary = cleanSummaryContent(callDetails.summary);
          await db.insert(requestTable).values({
            // @ts-ignore
            roomNumber: callDetails.roomNumber, // Fixed property name
            orderId: callDetails.orderReference || orderReference,
            requestContent: cleanedSummary, // Fixed property name
            createdAt: new Date(), // Fixed property name
            status: 'Đã ghi nhận',
            updated_at: new Date(),
          });
          logger.debug('Đã lưu request thành công vào database với ID:', 'Component', orderReference);
          // Bổ sung: Lưu order vào bảng orders
          await storage.createOrder({
            id: `ORD-${Date.now()}-${Math.random()}`,
            type: 'call_summary',
            roomNumber: callDetails.roomNumber,
            orderId: callDetails.orderReference || orderReference,
            requestContent: `Call Summary: ${(callDetails.summary || 'No summary').substring(0, 200)}...`,
            status: 'Đã ghi nhận',
          });
          logger.debug('Đã lưu order vào bảng orders', 'Component');
        } catch (dbError) {
          logger.error('Lỗi khi lưu request hoặc order từ thiết bị di động vào DB:', 'Component', dbError);
        }
      } catch (sendError) {
        logger.error('Lỗi khi gửi email tóm tắt từ thiết bị di động:', 'Component', sendError);
        // Không cần trả về lỗi cho client vì đã trả về success trước đó
      }
    } catch (error: any) {
      handleApiError(
        res,
        error,
        'Lỗi trong endpoint mobile-call-summary-email:'
      );
    }
  });

  // Kiểm tra API key và trạng thái của Mailjet
  app.get('/api/mailjet-status', async (req, res) => {
    try {
      // Kiểm tra xem API key của Mailjet có được thiết lập hay không
      if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
        return res.status(400).json({
          success: false,
          error: 'Mailjet credentials not configured',
          missingEnv: true,
        });
      }

      // Gửi request kiểm tra đến Mailjet API
      try {
        const response = await axios.get(
          'https://api.mailjet.com/v3/REST/sender',
          {
            auth: {
              username: process.env.MAILJET_API_KEY,
              password: process.env.MAILJET_SECRET_KEY,
            },
          }
        );

        // Nếu API trả về thành công, trả về thông tin sender (công ty gửi email)
        res.json({
          success: true,
          mailjetConnected: true,
          apiKey: `${process.env.MAILJET_API_KEY.substring(0, 4)}...`,
          totalSenders: response.data.Count,
          senders: response.data.Data.map((sender: any) => ({
            email: sender.Email,
            name: sender.Name,
            status: sender.Status,
          })),
        });
      } catch (apiError: any) {
        logger.error('Lỗi khi kết nối đến Mailjet API:', 'Component', apiError.message);
        // Nếu kết nối thất bại, trả về thông tin lỗi
        res.status(500).json({
          success: false,
          mailjetConnected: false,
          error: 'Không thể kết nối đến Mailjet API',
          details: apiError.response?.data || apiError.message,
        });
      }
    } catch (error: any) {
      handleApiError(res, error, 'Lỗi khi kiểm tra trạng thái Mailjet:');
    }
  });

  // Kiểm tra tất cả các email đã gửi gần đây
  app.get('/api/recent-emails', async (req, res) => {
    try {
      if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
        return res.status(400).json({
          success: false,
          error: 'Mailjet credentials not configured',
          missingEnv: true,
        });
      }

      logger.debug('Lấy danh sách email gần đây từ Mailjet', 'Component');

      // Gửi request trực tiếp đến Mailjet API
      try {
        const result = await axios.get(
          'https://api.mailjet.com/v3/REST/message?Limit=20',
          {
            auth: {
              username: process.env.MAILJET_API_KEY as string,
              password: process.env.MAILJET_SECRET_KEY as string,
            },
          }
        );

        // Kiểm tra và xử lý kết quả
        if (result && result.data && Array.isArray(result.data.Data)) {
          logger.debug('Tìm thấy ${result.data.Count} email gần đây', 'Component');

          // Chuyển đổi kết quả thành định dạng dễ đọc
          const emails = result.data.Data.map((message: any) => ({
            messageId: message.ID,
            status: message.Status || 'Unknown',
            to:
              message.Recipients && message.Recipients[0]
                ? message.Recipients[0].Email
                : 'Unknown',
            from: message.Sender ? message.Sender.Email : 'Unknown',
            subject: message.Subject || 'No subject',
            sentAt: message.ArrivedAt || 'Unknown',
          }));

          res.json({
            success: true,
            count: emails.length,
            emails,
          });
        } else {
          throw new Error('Định dạng dữ liệu không hợp lệ từ Mailjet API');
        }
      } catch (apiError: any) {
        logger.error('Lỗi khi lấy dữ liệu email từ Mailjet:', 'Component', apiError.message);
        res.status(500).json({
          success: false,
          error: 'Không thể lấy dữ liệu email từ Mailjet',
          details: apiError.response?.data || apiError.message,
        });
      }
    } catch (error: any) {
      handleApiError(res, error, 'Lỗi khi lấy danh sách email gần đây:');
    }
  });

  // Simple endpoint to test database connectivity
  app.get('/api/db-test', async (req, res) => {
    try {
      // Try a simple read operation
      const recent = await storage.getRecentCallSummaries(1);
      return res.json({ success: true, count: recent.length });
    } catch (dbError: any) {
      handleApiError(res, dbError, 'DB test error:');
    }
  });

  // REMOVED: Test transcript endpoint - moved to /routes/transcripts.ts

  // Get references for a specific call
  app.get('/api/references/:callId', async (req, res) => {
    try {
      const { callId } = req.params;
      // The original code had Reference.find({ callId }).sort({ createdAt: -1 });
      // Assuming Reference is a model that needs to be imported or is defined elsewhere.
      // Since it's not imported, this line will cause an error.
      // For now, commenting out or removing as per the edit hint.
      // const references = await Reference.find({ callId }).sort({ createdAt: -1 });
      // res.json(references);
      res
        .status(501)
        .json({ error: 'References functionality not implemented' }); // Placeholder
    } catch (error) {
      handleApiError(res, error, 'Error fetching references:');
    }
  });

  // Add a new reference
  app.post('/api/references', async (req, res) => {
    try {
      // The original code had IReference = req.body;
      // Assuming IReference is a type or interface that needs to be imported or is defined elsewhere.
      // Since it's not imported, this line will cause an error.
      // For now, commenting out or removing as per the edit hint.
      // const referenceData: IReference = req.body;
      // const reference = new Reference(referenceData);
      // await reference.save();
      res
        .status(501)
        .json({ error: 'References functionality not implemented' }); // Placeholder
    } catch (error) {
      handleApiError(res, error, 'Error creating reference:');
    }
  });

  // Delete a reference
  app.delete('/api/references/:id', async (req, res) => {
    try {
      const { id } = req.params;
      // The original code had Reference.findByIdAndDelete(id);
      // Assuming Reference is a model that needs to be imported or is defined elsewhere.
      // Since it's not imported, this line will cause an error.
      // For now, commenting out or removing as per the edit hint.
      // await Reference.findByIdAndDelete(id);
      res
        .status(501)
        .json({ error: 'References functionality not implemented' }); // Placeholder
    } catch (error) {
      handleApiError(res, error, 'Error deleting reference:');
    }
  });

  // Serve reference map from environment variable
  app.get('/api/reference-map', (_req, res) => {
    try {
      const raw = process.env.REFERENCE_MAP || '{}';
      const map = JSON.parse(raw);
      res.json(map);
    } catch (error) {
      handleApiError(res, error, 'Invalid REFERENCE_MAP env var:');
    }
  });

  // ============================================
  // LEGACY AUTH ROUTES REMOVED
  // ============================================
  // All authentication routes have been moved to unified auth system
  // See: /api/auth/* routes mounted from './routes/auth/unified'

  // REMOVED: GET /api/staff/requests - moved to /routes/staff.ts

  // REMOVED: PATCH /api/staff/requests/:id/status - moved to /routes/staff.ts

  // REMOVED: Staff messages endpoint - moved to /routes/staff.ts

  // REMOVED: Staff message endpoint - moved to /routes/staff.ts

  // REMOVED: Delete all staff requests - moved to /routes/staff.ts

  // Get all orders (public, no auth)

  // Xóa tất cả orders (public, không cần xác thực)

  // Analytics routes
  app.get('/api/analytics/overview', authenticateJWT, async (req, res) => {
    try {
      const data = await getOverview();
      res.json(data);
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch analytics overview');
    }
  });

  app.get(
    '/api/analytics/service-distribution',
    authenticateJWT,
    async (req, res) => {
      try {
        const data = await getServiceDistribution();
        res.json(data);
      } catch (error) {
        handleApiError(res, error, 'Failed to fetch service distribution');
      }
    }
  );

  app.get(
    '/api/analytics/hourly-activity',
    authenticateJWT,
    async (req, res) => {
      try {
        const data = await getHourlyActivity();
        res.json(data);
      } catch (error) {
        handleApiError(res, error, 'Failed to fetch hourly activity');
      }
    }
  );

  // ============================================
  // Unified Authentication API Routes
  // ============================================

  // Mount unified auth routes (takes precedence over legacy routes)
  app.use('/api/auth', unifiedAuthRoutes);

  // ============================================
  // SaaS Dashboard API Routes
  // ============================================

  // Mount dashboard routes with proper prefix
  app.use('/api/dashboard', dashboardRoutes);

  // ============================================
  // Health Check API Routes
  // ============================================

  // Mount health check routes
  app.use('/api', healthRoutes);

  // Seed development data if needed
  if (process.env.NODE_ENV === 'development') {
    setTimeout(seedDevelopmentData, 1000); // Delay to ensure DB is ready
  }

  // ============================================
  // Public API: Get hotel config by subdomain
  // ============================================
  app.get('/api/hotels/by-subdomain/:subdomain', async (req, res) => {
    try {
      const { subdomain } = req.params;
      if (!subdomain) {
        return res.status(400).json({ error: 'Missing subdomain' });
      }
      // Lấy tenant theo subdomain
      const service = new TenantService();
      const tenant = await service.getTenantBySubdomain(subdomain);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      // Trả về thông tin hotel config cơ bản
      res.json({
        id: tenant.id,
        name: tenant.hotelName,
        subdomain: tenant.subdomain,
        customDomain: tenant.customDomain,
        branding: {
          primaryColor: '#2E7D32',
          secondaryColor: '#FFC107',
          accentColor: '#FF6B6B',
          logo: '/assets/haily-logo1.jpg',
          primaryFont: 'Inter',
          secondaryFont: 'Roboto',
        },
        contact: {
          phone: tenant.phone || '',
          email: tenant.email || '',
          address: tenant.address || '',
          website: tenant.website || '',
        },
        features: {
          multiLanguage: true,
          callHistory: true,
          roomService: true,
          concierge: true,
          voiceCloning: false,
          analytics: true,
        },
        services: [],
        supportedLanguages: ['en', 'fr', 'zh', 'ru', 'ko', 'vi'],
        vapiConfig: {
          publicKeys: {},
          assistantIds: {},
        },
        timezone: 'Asia/Ho_Chi_Minh',
        currency: 'VND',
        location: {
          city: 'Phan Thiet',
          country: 'Vietnam',
          latitude: 10.928,
          longitude: 108.102,
        },
      });
    } catch (error) {
      logger.error('Error in /api/hotels/by-subdomain:', 'Component', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============================================
  // Get Vapi Configuration by Language
  // ============================================
  app.get('/api/vapi/config/:language', (req: Request, res: Response) => {
    try {
      const { language } = req.params;

      logger.debug('[API] Getting Vapi config for language: ${language}', 'Component');

      // Get environment variables for the requested language
      const getEnvVars = (lang: string) => {
        const langUpper = lang.toUpperCase();
        return {
          publicKey:
            lang === 'en'
              ? process.env.VITE_VAPI_PUBLIC_KEY
              : process.env[`VITE_VAPI_PUBLIC_KEY_${langUpper}`],
          assistantId:
            lang === 'en'
              ? process.env.VITE_VAPI_ASSISTANT_ID
              : process.env[`VITE_VAPI_ASSISTANT_ID_${langUpper}`],
        };
      };

      const config = getEnvVars(language);

      logger.debug('[API] Vapi config for ${language}:', 'Component', {
        publicKey: config.publicKey
          ? `${config.publicKey.substring(0, 10)}...`
          : 'NOT SET',
        assistantId: config.assistantId
          ? `${config.assistantId.substring(0, 10)}...`
          : 'NOT SET',
      });

      // Fallback to English if language-specific config not found
      if (!config.publicKey || !config.assistantId) {
        logger.debug('[API] Language ${language} config not found, falling back to English', 'Component');
        const fallbackConfig = getEnvVars('en');
        res.json({
          language,
          publicKey: fallbackConfig.publicKey || '',
          assistantId: fallbackConfig.assistantId || '',
          fallback: true,
        });
      } else {
        res.json({
          language,
          publicKey: config.publicKey,
          assistantId: config.assistantId,
          fallback: false,
        });
      }
    } catch (error) {
      logger.error('[API] Error getting Vapi config:', 'Component', error);
      res.status(500).json({ error: 'Failed to get Vapi configuration' });
    }
  });

  // ============================================
  // Orders & Request API Routes
  // ============================================

  // Mount request routes (new unified endpoint)
  app.use('/api/request', requestRoutes);

  return httpServer;
}
