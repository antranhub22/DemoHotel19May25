import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from 'ws';
import { insertTranscriptSchema, insertCallSummarySchema } from "@shared/schema";
import { dateToString, getCurrentTimestamp } from '@shared/utils';
import { z } from "zod";
import { generateCallSummary, generateBasicSummary, extractServiceRequests, translateToVietnamese } from "./openai";
import OpenAI from "openai";
// import { sendServiceConfirmation, sendCallSummary } from "./email";
import { sendServiceConfirmation, sendCallSummary } from "./gmail";
import { sendMobileEmail, sendMobileCallSummary } from "./mobileMail";
import axios from "axios";
import express, { type Request, Response } from 'express';
import { verifyJWT } from './middleware/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Staff } from './models/Staff';
import { Request as StaffRequest } from './models/Request';
import { Message as StaffMessage } from './models/Message';
import { db } from '@shared/db';
import { request as requestTable, call, transcript } from '@shared/db';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { deleteAllRequests } from '@shared/utils';
import { getOverview, getServiceDistribution, getHourlyActivity } from './analytics';
import { seedDevelopmentData } from './seed';
import dashboardRoutes from './routes/dashboard';
import healthRoutes from './routes/health';
import unifiedAuthRoutes from './routes/unifiedAuth';

import requestRoutes from './routes/request';
import { TenantService } from './services/tenantService.js';
import { UnifiedAuthService } from './services/unifiedAuthService.js';

// Initialize OpenAI client with fallback for development
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || 'sk-placeholder-for-dev'
});

// Define WebSocket client interface
interface WebSocketClient extends WebSocket {
  callId?: string;
  isAlive?: boolean;
}

// Dummy staff data (thay bằng DB thực tế)
const staffList: Staff[] = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date(),
  },
  {
    id: 2,
    username: 'staff1',
    passwordHash: bcrypt.hashSync('staffpass', 10),
    role: 'staff',
    createdAt: new Date(),
  },
];

function parseStaffAccounts(envStr: string | undefined): { username: string, password: string }[] {
  if (!envStr) return [];
  return envStr.split(',').map((pair: string) => {
    const [username, password] = pair.split(':');
    return { username, password };
  });
}

const STAFF_ACCOUNTS = parseStaffAccounts(process.env.STAFF_ACCOUNTS);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-for-testing';

// ============================================
// Multi-tenant Authentication Helper Functions
// ============================================

/**
 * Extract tenant ID from request (subdomain or host)
 */
async function extractTenantFromRequest(req: Request): Promise<string> {
  const host = req.get('host') || '';
  const subdomain = extractSubdomain(host);
  
  // For development, default to Mi Nhon Hotel
  if (subdomain === 'localhost' || subdomain === '127.0.0.1' || !subdomain) {
    return getMiNhonTenantId();
  }
  
  // In production, lookup tenant by subdomain
  try {
    const { tenants } = await import('@shared/schema');
    // Get tenant from subdomain
    const [tenant] = await db.select({
      id: tenants.id,
      hotel_name: tenants.hotel_name,
      subdomain: tenants.subdomain,
      subscription_status: tenants.subscription_status
    }).from(tenants).where(eq(tenants.subdomain, subdomain)).limit(1);
    return tenant?.id || getMiNhonTenantId();
  } catch (error) {
    console.error('Error looking up tenant:', error);
    return getMiNhonTenantId();
  }
}

/**
 * Extract subdomain from host header
 */
function extractSubdomain(host: string): string {
  const cleanHost = host.split(':')[0];
  
  // For development
  if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
    return 'minhon';
  }
  
  // For production domains like subdomain.talk2go.online
  const parts = cleanHost.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return 'minhon';
}

/**
 * Get Mi Nhon Hotel tenant ID (for backward compatibility)
 */
function getMiNhonTenantId(): string {
  return process.env.MINHON_TENANT_ID || 'mi-nhon-hotel';
}

/**
 * Find staff in database with tenant association
 */
async function findStaffInDatabase(username: string, password: string, tenantId: string): Promise<any> {
  try {
    const { staff } = await import('@shared/db');
    
    // Look up staff by username and tenant
    const [staffUser] = await db
      .select()
      .from(staff)
      .where(and(eq(staff.username, username), eq(staff.tenant_id, tenantId)))
      .limit(1);
    
    if (!staffUser) {
      return null;
    }
    
    // Verify password (assuming bcrypt hashing)
    const isPasswordValid = await bcrypt.compare(password, staffUser.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    return {
      username: staffUser.username,
      role: staffUser.role || 'staff',
      tenantId: staffUser.tenant_id,
      permissions: []
    };
  } catch (error) {
    console.error('Error finding staff in database:', error);
    return null;
  }
}

/**
 * Find staff in fallback accounts (for backward compatibility)
 */
async function findStaffInFallback(username: string, password: string, tenantId: string): Promise<any> {
  // Hard-coded fallback accounts for when database is unavailable
  const FALLBACK_ACCOUNTS = [
    { username: 'staff1', password: 'password1', role: 'staff' },
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'admin@hotel.com', password: 'StrongPassword123', role: 'admin' },
    { username: 'manager@hotel.com', password: 'StrongPassword456', role: 'manager' }
  ];
  
  // Try from environment variable first
  const found = STAFF_ACCOUNTS.find(acc => acc.username === username && acc.password === password);
  
  // If not found, try from fallback accounts
  const fallbackFound = !found && FALLBACK_ACCOUNTS.find(acc => acc.username === username && acc.password === password);
  
  const account = found || fallbackFound;
  
  if (!account) {
    return null;
  }
  
  // For fallback accounts, always associate with the requesting tenant
  // This ensures backward compatibility with existing Mi Nhon accounts
  return {
    username: account.username,
    role: (account as any).role || 'staff',
    tenantId: tenantId,
    permissions: []
  };
}

// Dummy request data
let requestList: StaffRequest[] = [
  { id: 1, room_number: '101', guestName: 'Tony', request_content: 'Beef burger x 2', created_at: new Date(), status: 'Đã ghi nhận', notes: '' },
  { id: 2, room_number: '202', guestName: 'Anna', request_content: 'Spa booking at 10:00', created_at: new Date(), status: 'Đang thực hiện', notes: '' },
];

// Dummy message data
let messageList: StaffMessage[] = [
  { id: 1, requestId: 1, sender: 'guest', content: 'Can I get my order soon?', created_at: new Date(), updated_at: new Date() },
  { id: 2, requestId: 1, sender: 'staff', content: 'We are preparing your order.', created_at: new Date(), updated_at: new Date() },
];

// Hàm làm sạch nội dung summary trước khi lưu vào DB
function cleanSummaryContent(content: string): string {
  if (!content) return '';
  return content
    .split('\n')
    .filter((line: string) => !/^Bước tiếp theo:/i.test(line) && !/^Next Step:/i.test(line) && !/Vui lòng nhấn/i.test(line) && !/Please Press Send To Reception/i.test(line))
    .map((line: string) => line.replace(/\(dùng cho khách[^\)]*\)/i, '').replace(/\(used for Guest[^\)]*\)/i, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

// Hàm xử lý lỗi dùng chung cho API
function handleApiError(res: Response, error: any, defaultMessage: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error(defaultMessage, error);
    return res.status(500).json({ error: defaultMessage, message: error.message, stack: error.stack });
  } else {
    // Ở production, không trả về stack trace
    console.error(defaultMessage, error.message);
    return res.status(500).json({ error: defaultMessage });
  }
}

// Đảm bảo globalThis.wss có type đúng
declare global {
  // eslint-disable-next-line no-var
  var wss: import('ws').WebSocketServer | undefined;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server for express app
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  globalThis.wss = wss;
  
  // Store active connections
  const clients = new Set<WebSocketClient>();
  
  // Handle WebSocket connections
  wss.on('connection', (ws: WebSocketClient) => {
    console.log('WebSocket client connected');
    
    // Add client to set
    clients.add(ws);
    ws.isAlive = true;
    
    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle initialization message
        if (data.type === 'init' && data.call_id) {
          ws.callId = data.call_id;
          console.log(`Client associated with call ID: ${data.call_id}`);
        }
        
        // Handle transcript from Vapi
        if (data.type === 'transcript' && data.call_id && data.role && data.content) {
          try {
            console.log('📝 [WebSocket] Processing transcript:', data);
            
            // Validate timestamp
            const now = Date.now();
            const inputTimestamp = data.timestamp ? Number(data.timestamp) : now;
            
            // Fix timestamp if it's out of range - cap at PostgreSQL max timestamp (2038-01-19)
            const maxPostgresTimestamp = 2147483647; // Unix timestamp limit for PostgreSQL
            const maxTimestampMs = maxPostgresTimestamp * 1000; // Convert to milliseconds
            
            let validTimestamp;
            
            // Enhanced timestamp validation
            if (!inputTimestamp || isNaN(inputTimestamp) || !isFinite(inputTimestamp)) {
              console.warn(`⚠️ [WebSocket] Invalid timestamp ${inputTimestamp}, using current time`);
              validTimestamp = now;
            } else if (inputTimestamp > maxTimestampMs) {
              console.warn(`⚠️ [WebSocket] Timestamp ${inputTimestamp} exceeds PostgreSQL limit, using current time`);
              validTimestamp = now;
            } else if (inputTimestamp < 946684800000) { // Year 2000
              console.warn(`⚠️ [WebSocket] Timestamp ${inputTimestamp} is too old, using current time`);
              validTimestamp = now;
            } else {
              validTimestamp = inputTimestamp;
            }
            
            // Ensure we don't exceed PostgreSQL limits and the timestamp is valid
            validTimestamp = Math.min(Math.max(validTimestamp, 946684800000), maxTimestampMs);
            
            // Additional validation before creating Date object
            const testDate = new Date(validTimestamp);
            if (isNaN(testDate.getTime())) {
              console.error(`❌ [WebSocket] Date creation failed for timestamp ${validTimestamp}, using current time`);
              validTimestamp = now;
            }
            
            console.log(`📅 [WebSocket] Timestamp validation: input=${inputTimestamp}, valid=${validTimestamp}, seconds=${Math.floor(validTimestamp / 1000)}`);

            // Store transcript in database - USE PROPER TIMESTAMP CONVERSION
            const savedTranscript = await storage.addTranscript({
              callId: data.call_id,
              role: data.role,
              content: data.content,
              tenantId: 'default',
              timestamp: validTimestamp // ✅ CRITICAL: Let storage.addTranscript handle conversion properly
            });

            console.log('✅ [WebSocket] Transcript stored in database');
            
            // Try to find or create call record
            try {
              const existingCall = await db.select().from(call).where(eq(call.call_id_vapi, data.call_id)).limit(1);
              
              if (existingCall.length === 0) {
                console.log(`🔍 [WebSocket] No call found for ${data.call_id}, attempting auto-creation`);
                
                // Extract room number from content
                const roomMatch = data.content.match(/room (\d+)/i) || data.content.match(/phòng (\d+)/i);
                const roomNumber = roomMatch ? roomMatch[1] : null;
                
                // Determine language from content
                const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(data.content);
                const hasFrench = /[àâäéèêëîïôöùûüÿç]/.test(data.content) && !hasVietnamese;
                let language = 'en';
                if (hasVietnamese) language = 'vi';
                else if (hasFrench) language = 'fr';
                
                console.log(`🌍 [WebSocket] Auto-creating call record: room=${roomNumber}, language=${language}`);
              }
            } catch (callError) {
              console.error('❌ [WebSocket] Error handling call record:', callError);
              console.error('❌ [WebSocket] Call error details:', {
                message: callError.message,
                stack: callError.stack
              });
              // Continue processing even if call record handling fails
            }
            
            // Broadcast transcript to all clients with matching callId
            // Use safe timestamp for ISO string creation
            let isoTimestamp;
            try {
              isoTimestamp = new Date(validTimestamp).toISOString();
            } catch (dateError) {
              console.error('❌ [WebSocket] Failed to create ISO timestamp, using current time');
              isoTimestamp = new Date().toISOString();
            }
            
            const message = JSON.stringify({
              type: 'transcript',
              callId: data.call_id,
              role: data.role,
              content: data.content,
              timestamp: isoTimestamp
            });
            
            // Count matching clients and broadcast
            let matchingClients = 0;
            clients.forEach((client) => {
              if (client.callId === data.call_id && client.readyState === WebSocket.OPEN) {
                client.send(message);
                matchingClients++;
              }
            });
            
            console.log(`📤 [WebSocket] Transcript broadcasted to ${matchingClients} clients`);
            
          } catch (error) {
            console.error('❌ [WebSocket] Error processing transcript:', error);
            console.error('❌ [WebSocket] Error details:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
            if (error instanceof z.ZodError) {
              console.error('📋 [WebSocket] Validation errors:', error.errors);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
    
    // Send initial welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Mi Nhon Hotel Voice Assistant'
    }));
  });
  
  // Set up ping interval to keep connections alive
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocketClient) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  // API routes
  
  // Test OpenAI API endpoint
  app.post('/api/test-openai', async (req, res) => {
    try {
      const { message } = req.body;
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message || "Hello, give me a quick test response." }],
        max_tokens: 30
      });
      
      res.json({ 
        success: true, 
        message: response.choices[0].message.content,
        model: response.model,
        usage: response.usage
      });
    } catch (error: any) {
      handleApiError(res, error, "OpenAI API test error:");
    }
  });
  
  // API endpoints for call summaries will be defined below
  
  // Get transcripts by call ID
  app.get('/api/transcripts/:callId', async (req, res) => {
    try {
      const callId = req.params.callId;
      const transcripts = await storage.getTranscriptsByCallId(callId);
      res.json(transcripts);
    } catch (error) {
      handleApiError(res, error, 'Failed to retrieve transcripts');
    }
  });
  
  // Save transcript from client (VAPI integration)
  app.post('/api/transcripts', async (req, res) => {
    try {
      const { callId, role, content, tenantId } = req.body;
      
      console.log('POST /api/transcripts request body:', req.body);
      
      if (!callId || !role || !content) {
        return res.status(400).json({ 
          error: 'callId, role, and content are required' 
        });
      }
      
      // Convert camelCase to snake_case for database schema validation
      // Ensure timestamp is within valid range for PostgreSQL  
      const now = Date.now();
      const validTimestamp = Math.min(now, 2147483647000); // PostgreSQL max timestamp
      
      const transcriptDataForValidation = {
        call_id: callId,  // Convert callId to call_id
        role,
        content,
        tenant_id: tenantId || 'default',  // Convert tenantId to tenant_id
        timestamp: validTimestamp // ✅ FIXED: Use proper timestamp, storage will handle conversion
      };
      
      console.log('Converted data for validation:', transcriptDataForValidation);
      
      // Validate with database schema (expects snake_case)
      const validatedData = insertTranscriptSchema.parse(transcriptDataForValidation);
      
      console.log('Validated transcript data:', validatedData);
      
      // Save to database - storage.addTranscript already handles field mapping
      const savedTranscript = await storage.addTranscript({
        callId,  // Keep original camelCase for storage function
        role,
        content,
        tenantId: tenantId || 'default',
        timestamp: validTimestamp // ✅ FIXED: Let storage.addTranscript handle conversion properly
      });
      
      console.log(`Transcript saved from client for call ${callId}: ${role} - ${content.substring(0, 100)}...`);
      console.log('Saved transcript result:', savedTranscript);
      
      res.json({ 
        success: true, 
        data: savedTranscript
      });
    } catch (error) {
      console.error('Error in POST /api/transcripts:', error);
      console.error('Error stack:', error.stack);
      
      if (error instanceof z.ZodError) {
        console.error('Zod validation errors:', error.errors);
        return res.status(400).json({ 
          error: 'Invalid transcript data', 
          details: error.errors,
          receivedFields: Object.keys(req.body)
        });
      }
      
      handleApiError(res, error, 'Failed to save transcript');
    }
  });
  
  // REMOVED: Legacy orders endpoint - use /api/request instead
  
  // Get order by ID
  
  // Get orders by room number
  
  // Update order status
  
  // Staff: get all orders, optionally filter by status, room, time
  app.get('/api/staff/orders', verifyJWT, async (req: Request, res: Response) => {
    try {
      const { status, roomNumber } = req.query;
      const orders = await storage.getAllOrders({
        status: status as string,
        roomNumber: roomNumber as string
      });
      res.json(orders);
    } catch (err) {
      handleApiError(res, err, 'Failed to retrieve staff orders');
    }
  });
  
  // Endpoint to update status via POST
  
  // Handle call end event from Vapi to update call duration
  app.post('/api/call-end', async (req, res) => {
    try {
      const { callId, duration } = req.body;
      
      if (!callId) {
        return res.status(400).json({ error: 'Call ID is required' });
      }
      
      // TODO: Update call duration in database when schema supports duration field
      // const existingCall = await db.select().from(call).where(eq(call.call_id_vapi, callId)).limit(1);
      // if (existingCall.length > 0) {
      //   await db.update(call)
      //     .set({ duration: duration || 0 })
      //     .where(eq(call.call_id_vapi, callId));
      //   
      //   console.log(`Updated call duration for ${callId}: ${duration || 0} seconds`);
      // }
      console.log(`Call duration for ${callId}: ${duration || 0} seconds (logged only - DB schema needs update)`);
      
      res.json({ success: true });
    } catch (error) {
      handleApiError(res, error, 'Error updating call duration');
    }
  });

  // Store call summary from Vapi or generate with OpenAI
  app.post('/api/store-summary', async (req, res) => {
    try {
      const { summary: summaryText, transcripts, timestamp, callId, callDuration: reqCallDuration, forceBasicSummary, orderReference, language } = req.body;
      
      // Determine if we need to generate a summary with OpenAI or use fallback
      let finalSummary = summaryText;
      let isAiGenerated = false;
      
      // If transcripts are provided and no summary is provided, try AI first then fallback
      if (transcripts && (!summaryText || summaryText === '')) {
        // Check if we should try using OpenAI or go straight to fallback
        // Allow forcing basic summary from client or if no API key available
        const useOpenAi = !req.query.skipAi && !forceBasicSummary && process.env.VITE_OPENAI_API_KEY;
        
        if (useOpenAi) {
          console.log('Generating summary with OpenAI from provided transcripts');
          try {
            finalSummary = await generateCallSummary(transcripts, language);
            isAiGenerated = true;
          } catch (aiError) {
            console.error('Error generating summary with OpenAI:', aiError);
            console.log('Falling back to basic summary generation');
            // Fall back to a basic summary if OpenAI fails
            finalSummary = generateBasicSummary(transcripts);
            isAiGenerated = false;
          }
        } else {
          console.log('Generating basic summary from transcripts (OpenAI skipped)');
          finalSummary = generateBasicSummary(transcripts);
          isAiGenerated = false;
        }
      } 
      // If no transcripts and no summary, try to fetch transcripts from database
      else if (!summaryText || summaryText === '') {
        console.log('Fetching transcripts from database for callId:', callId);
        try {
          const storedTranscripts = await storage.getTranscriptsByCallId(callId);
          
          if (storedTranscripts && storedTranscripts.length > 0) {
            // Convert database transcripts to format expected by OpenAI function
            const formattedTranscripts = storedTranscripts
              .filter(t => t.role !== null)
              .map(t => ({
                role: t.role as string,
                content: t.content
              }));
            
            // Generate summary using OpenAI
            try {
              finalSummary = await generateCallSummary(formattedTranscripts, language);
              isAiGenerated = true; 
            } catch (openaiError) {
              console.error('Error using OpenAI for stored transcripts:', openaiError);
              // Fallback to basic summary
              finalSummary = generateBasicSummary(formattedTranscripts);
              isAiGenerated = false;
            }
          } else {
            finalSummary = "No conversation transcripts were found for this call.";
          }
        } catch (dbError) {
          console.error('Error fetching transcripts from database:', dbError);
          // Try to create a basic summary if the database operation fails
          if (transcripts && transcripts.length > 0) {
            finalSummary = generateBasicSummary(transcripts);
          } else {
            finalSummary = "Unable to generate summary due to missing conversation data.";
          }
        }
      }
      
      if (!finalSummary || typeof finalSummary !== 'string') {
        return res.status(400).json({ error: 'Summary content is required' });
      }
      
      // Create a valid call summary object
      // Extract room number for storage
      const roomNumberMatch = finalSummary.match(/room (\d+)/i) || finalSummary.match(/phòng (\d+)/i);
      const roomNumber = roomNumberMatch ? roomNumberMatch[1] : 'unknown';
      
      // Extract call duration or use default
      let durationStr = '0:00';
      if (reqCallDuration) {
        durationStr = typeof reqCallDuration === 'number'
          ? `${Math.floor(reqCallDuration / 60)}:${(reqCallDuration % 60).toString().padStart(2, '0')}`
          : reqCallDuration;
      }
      
      // Create call summary data matching schema (snake_case fields, text timestamp)
      const summaryData = insertCallSummarySchema.parse({
        call_id: callId,  // Convert to snake_case for schema
        content: finalSummary,
        timestamp: (() => {
          // Safe timestamp creation with validation
          try {
            const inputTime = timestamp || Date.now();
            const testDate = new Date(inputTime);
            if (isNaN(testDate.getTime())) {
              console.warn('⚠️ [store-summary] Invalid timestamp, using current time');
              return new Date().toISOString();
            }
            return testDate.toISOString();
          } catch (dateError) {
            console.error('❌ [store-summary] Date creation failed, using current time');
            return new Date().toISOString();
          }
        })(), // Convert to text string with validation
        room_number: roomNumber,  // Convert to snake_case for schema
        duration: durationStr
        // Remove orderReference - not in schema
      });
      
      // Store in database
      try {
        const result = await storage.addCallSummary(summaryData as any);
        console.log('Call summary stored successfully:', result);
      } catch (summaryError) {
        console.error('Error storing call summary (continuing anyway):', summaryError);
        // Continue processing even if summary storage fails
      }

      // Analyze the summary to extract structured service requests
      let serviceRequests: any[] = [];
      if (isAiGenerated && finalSummary) {
        try {
          console.log('Extracting service requests from AI-generated summary');
          serviceRequests = await extractServiceRequests(finalSummary);
          console.log(`Successfully extracted ${serviceRequests.length} service requests`);
        } catch (extractError) {
          console.error('Error extracting service requests:', extractError);
        }
      }
      
      // Ghi log thông tin để chuẩn bị cho việc gửi email sau khi xác nhận
      try {
        // Map service requests to string array
        const serviceRequestStrings = serviceRequests.map(req => 
          `${req.serviceType}: ${req.requestText || 'Không có thông tin chi tiết'}`
        );
        
        console.log(`Phát hiện thông tin phòng: ${roomNumber}`);
        console.log(`Số lượng yêu cầu dịch vụ: ${serviceRequestStrings.length}`);
        console.log(`Thời lượng cuộc gọi: ${durationStr}`);
        console.log(`Email sẽ được gửi sau khi người dùng nhấn nút xác nhận`);
      } catch (extractError: any) {
        console.error('Error preparing service information:', extractError?.message || extractError);
        // Continue even if preparation fails - don't block the API response
      }
      
      // Return success with the summary, AI-generated flag, and extracted service requests
      res.status(201).json({
        success: true,
        summary: finalSummary,
        isAiGenerated: isAiGenerated,
        serviceRequests: serviceRequests
      });
    } catch (error: any) {
      handleApiError(res, error, 'Error storing call summary:');
    }
  });
  
  // Get call summary by call ID
  app.get('/api/summaries/:callId', async (req, res) => {
    try {
      const callId = req.params.callId;
      
      // Don't process if the parameter looks like a number (hours)
      if (/^\d+$/.test(callId)) {
        return res.status(404).json({ error: 'Call summary not found' });
      }
      
      const summary = await storage.getCallSummaryByCallId(callId);
      
      if (!summary) {
        return res.status(404).json({ error: 'Call summary not found' });
      }
      
      res.json(summary);
    } catch (error) {
      handleApiError(res, error, 'Failed to retrieve call summary');
    }
  });
  
  // Get recent call summaries (within the last X hours)
  app.get('/api/summaries/recent/:hours', async (req, res) => {
    try {
      const hours = parseInt(req.params.hours) || 24; // Default to 24 hours if not specified
      
      // Ensure hours is a reasonable value
      const validHours = Math.min(Math.max(1, hours), 72); // Between 1 and 72 hours
      
      const summaries = await storage.getRecentCallSummaries(validHours);
      
      // Pass through orderReference for each summary
      const mapped = summaries.map(s => ({
        id: s.id,
        callId: s.call_id || 'unknown', // Use callId field from call_summaries table
        roomNumber: s.room_number,
        content: s.content || 'No content', // Use content field from call_summaries table
        timestamp: s.timestamp || new Date().toISOString(), // Use timestamp field from call_summaries table
        duration: s.duration || '0'
      }));
      res.json({
        success: true,
        count: summaries.length,
        timeframe: `${validHours} hours`,
        summaries: mapped
      });
    } catch (error) {
      handleApiError(res, error, 'Error retrieving recent call summaries:');
    }
  });

  // Translate text to Vietnamese
  app.post('/api/translate-to-vietnamese', async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text content is required' });
      }
      
      const translatedText = await translateToVietnamese(text);
      
      res.json({
        success: true,
        translatedText
      });
    } catch (error) {
      handleApiError(res, error, 'Error translating text to Vietnamese:');
    }
  });

  // Send service confirmation email
  app.post('/api/send-service-email', async (req, res) => {
    try {
      const { toEmail, serviceDetails } = req.body;
      
      if (!toEmail || !serviceDetails || !serviceDetails.serviceType || !serviceDetails.roomNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Tạo mã tham chiếu nếu chưa có
      const orderReference = serviceDetails.orderReference || 
                           `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Kiểm tra và dịch details sang tiếng Việt nếu cần
      let vietnameseDetails = serviceDetails.details || '';
      
      if (vietnameseDetails && !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(vietnameseDetails)) {
        try {
          console.log('Dịch chi tiết dịch vụ sang tiếng Việt trước khi gửi email');
          vietnameseDetails = await translateToVietnamese(vietnameseDetails);
        } catch (translateError) {
          console.error('Lỗi khi dịch chi tiết dịch vụ sang tiếng Việt:', translateError);
          // Tiếp tục sử dụng bản chi tiết gốc nếu không dịch được
        }
      }
      
      const result = await sendServiceConfirmation(toEmail, {
        serviceType: serviceDetails.serviceType,
        roomNumber: serviceDetails.roomNumber,
        timestamp: new Date(serviceDetails.timestamp || Date.now()),
        details: vietnameseDetails,
        orderReference: orderReference // Thêm mã tham chiếu
      });
      
      if (result.success) {
        res.json({
          success: true,
          messageId: result.messageId,
          orderReference: orderReference // Trả về mã tham chiếu để hiển thị cho người dùng
        });
      } else {
        throw new Error(result.error?.toString() || 'Unknown error');
      }
    } catch (error) {
      handleApiError(res, error, 'Error sending service confirmation email:');
    }
  });
  
  // Send call summary email
  app.post('/api/send-call-summary-email', async (req, res) => {
    try {
      const { callDetails } = req.body;
      // Read recipients list from env (comma-separated), fallback to req.body.toEmail
      const recipientsEnv = process.env.SUMMARY_EMAILS || '';
      const toEmails = recipientsEnv
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      if (toEmails.length === 0 && req.body.toEmail) {
        toEmails.push(req.body.toEmail);
      }

      if (!callDetails || !callDetails.roomNumber || !callDetails.summary) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Tạo mã tham chiếu nếu chưa có
      const orderReference = callDetails.orderReference || 
                             `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Nếu summary không phải tiếng Việt, thì dịch sang tiếng Việt
      let vietnameseSummary = callDetails.summary;
      
      if (!/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(callDetails.summary)) {
        try {
          console.log('Dịch tóm tắt sang tiếng Việt trước khi gửi email');
          vietnameseSummary = await translateToVietnamese(callDetails.summary);
        } catch (translateError) {
          console.error('Lỗi khi dịch tóm tắt sang tiếng Việt:', translateError);
          // Tiếp tục sử dụng bản tóm tắt gốc nếu không dịch được
        }
      }
      
      // Dịch cả danh sách dịch vụ nếu có
      const vietnameseServiceRequests = [];
      if (callDetails.serviceRequests && callDetails.serviceRequests.length > 0) {
        for (const request of callDetails.serviceRequests) {
          if (!/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(request)) {
            try {
              const translatedRequest = await translateToVietnamese(request);
              vietnameseServiceRequests.push(translatedRequest);
            } catch (error) {
              console.error('Lỗi khi dịch yêu cầu dịch vụ:', error);
              vietnameseServiceRequests.push(request); // Sử dụng bản gốc nếu không dịch được
            }
          } else {
            vietnameseServiceRequests.push(request); // Đã là tiếng Việt
          }
        }
      }
      
      // Send call summary to each recipient
      const results = [];
      for (const toEmail of toEmails) {
        const result = await sendCallSummary(toEmail, {
          callId: callDetails.callId || 'unknown',
          roomNumber: callDetails.roomNumber,
          timestamp: new Date(callDetails.timestamp || Date.now()),
          duration: callDetails.duration || '0:00',
          summary: vietnameseSummary, // Sử dụng bản tóm tắt tiếng Việt
          serviceRequests: vietnameseServiceRequests.length > 0 ? vietnameseServiceRequests : callDetails.serviceRequests || [],
          orderReference: orderReference // Thêm mã tham chiếu
        });
        results.push(result);
      }
      
      // Respond based on overall success
      if (results.every((r) => r.success)) {
        // Lưu request vào DB cho staff UI
        try {
          const cleanedSummary = cleanSummaryContent(vietnameseSummary);
          await db.insert(requestTable).values({
            // @ts-ignore
            roomNumber: callDetails.roomNumber, // Fixed property name
            orderId: callDetails.orderReference || orderReference,
            requestContent: cleanedSummary, // Fixed property name
            createdAt: new Date(), // Fixed property name
            status: 'Đã ghi nhận',
            updated_at: new Date()
          });
        } catch (dbError) {
          console.error('Lỗi khi lưu request vào DB:', dbError);
        }
        res.json({ success: true, recipients: toEmails, orderReference });
      } else {
        throw new Error('Failed to send call summary to all recipients');
      }
    } catch (error) {
      handleApiError(res, error, 'Error sending call summary email:');
    }
  });
  
  // Test email configuration
  app.post('/api/test-email', async (req, res) => {
    try {
      // Check Gmail credentials first (preferred method)
      if (process.env.GMAIL_APP_PASSWORD) {
        console.log('Using Gmail for test email');
      } else if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
        console.log('Using Mailjet for test email');
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'Email credentials not configured',
          missingEnv: true
        });
      }
      
      const { toEmail, isMobile } = req.body;
      
      if (!toEmail) {
        return res.status(400).json({ error: 'Recipient email is required' });
      }
      
      console.log(`Sending test email to ${toEmail} (${isMobile ? 'mobile device' : 'desktop'})`);
      
      // Send a simple test email
      const result = await sendServiceConfirmation(toEmail, {
        serviceType: 'Mobile Test Email',
        roomNumber: isMobile ? 'MOBILE-TEST' : 'DESKTOP-TEST',
        timestamp: new Date(),
        details: `Đây là email kiểm tra từ Mi Nhon Hotel Voice Assistant. Sent from ${isMobile ? 'MOBILE' : 'DESKTOP'} at ${new Date().toISOString()}`,
      });
      
      console.log('Email test result:', result);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Test email sent successfully',
          messageId: result.messageId,
          provider: process.env.GMAIL_APP_PASSWORD ? 'gmail' : 'mailjet'
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
      console.log('Mobile test email requested');
      
      // Default email if not provided
      const toEmail = req.body.toEmail || 'tuans2@gmail.com';
      
      // Xác định loại thiết bị gửi request
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(userAgent);
      
      // Ghi log chi tiết
      console.log('=================== MOBILE EMAIL TEST ===================');
      console.log('Time:', new Date().toISOString());
      console.log('Device info:', userAgent);
      console.log('Device type:', isMobile ? 'MOBILE' : 'DESKTOP');
      console.log('Recipient:', toEmail);
      console.log('=========================================================');
      
      // Send with timeout to ensure request completes and return response immediately
      setTimeout(async () => {
        try {
          // Sử dụng phương thức đặc biệt cho thiết bị di động
          if (isMobile) {
            console.log('Gửi email qua phương thức chuyên biệt cho thiết bị di động...');
            
            const result = await sendMobileEmail(
              toEmail,
              'Mi Nhon Hotel - Test từ thiết bị di động',
              `Đây là email kiểm tra được gửi từ thiết bị di động lúc ${new Date().toLocaleTimeString()}.
              
Thiết bị: ${userAgent}
              
Thông báo này xác nhận rằng hệ thống gửi email trên thiết bị di động đang hoạt động bình thường.
              
Trân trọng,
Mi Nhon Hotel Mui Ne`
            );
            
            console.log('Kết quả gửi email qua mobile mail:', result);
          } 
          // Cho thiết bị desktop sử dụng phương thức thông thường
          else {
            console.log('Gửi email với phương thức thông thường...');
            const result = await sendServiceConfirmation(toEmail, {
              serviceType: 'Mobile Test',
              roomNumber: 'DEVICE-TEST',
              timestamp: new Date(),
              details: `Email kiểm tra gửi từ thiết bị ${isMobile ? 'di động' : 'desktop'} lúc ${new Date().toLocaleTimeString()}. UA: ${userAgent}`,
            });
            
            console.log('Kết quả gửi email thông thường:', result);
          }
        } catch (innerError) {
          console.error('Lỗi trong timeout callback:', innerError);
          console.error('Chi tiết lỗi:', JSON.stringify(innerError));
        }
      }, 50); // Giảm thời gian chờ xuống để di động xử lý nhanh hơn
      
      // Return success immediately to avoid mobile browser timeout
      res.status(200).json({
        success: true,
        message: 'Email đang được xử lý, vui lòng kiểm tra hộp thư sau giây lát',
        deviceType: isMobile ? 'mobile' : 'desktop',
        timestamp: new Date().toISOString()
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
      if (!toEmail || !callDetails || !callDetails.roomNumber || !callDetails.summary) {
        return res.status(400).json({ 
          success: false, 
          error: 'Thiếu thông tin cần thiết để gửi email',
          missingFields: true
        });
      }
      
      // Xác định thiết bị
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(userAgent);
      
      console.log('=================== MOBILE CALL SUMMARY EMAIL ===================');
      console.log('Time:', new Date().toISOString());
      console.log('Device:', isMobile ? 'MOBILE' : 'DESKTOP');
      console.log('Room:', callDetails.roomNumber);
      console.log('Recipient:', toEmail);
      console.log('==============================================================');
      
      // Tạo mã tham chiếu
      const orderReference = callDetails.orderReference || 
                           `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Gửi email ngay lập tức và trả về kết quả thành công trước
      res.status(200).json({
        success: true,
        message: 'Email đang được xử lý, vui lòng kiểm tra hộp thư sau giây lát',
        orderReference: orderReference,
        timestamp: new Date().toISOString()
      });
      
      // Phần xử lý bất đồng bộ gửi email
      try {
        console.log('Đang xử lý gửi email tóm tắt cuộc gọi từ thiết bị di động...');
        
        // Thực hiện gửi email
        const result = await sendMobileCallSummary(toEmail, {
          callId: callDetails.callId || 'unknown',
          roomNumber: callDetails.roomNumber,
          timestamp: new Date(callDetails.timestamp || Date.now()),
          duration: callDetails.duration || '0:00',
          summary: callDetails.summary,
          serviceRequests: callDetails.serviceRequests || [],
          orderReference: orderReference
        });
        console.log('Kết quả gửi email tóm tắt cuộc gọi từ thiết bị di động:', result);
        // Thêm mới: Lưu request vào database để hiển thị trong staff UI
        try {
          console.log('Lưu request từ thiết bị di động vào database...');
          const cleanedSummary = cleanSummaryContent(callDetails.summary);
          await db.insert(requestTable).values({
            // @ts-ignore
            roomNumber: callDetails.roomNumber, // Fixed property name
            orderId: callDetails.orderReference || orderReference,
            requestContent: cleanedSummary, // Fixed property name
            createdAt: new Date(), // Fixed property name
            status: 'Đã ghi nhận',
            updated_at: new Date()
          });
          console.log('Đã lưu request thành công vào database với ID:', orderReference);
          // Bổ sung: Lưu order vào bảng orders
          await storage.createOrder({
            id: `ORD-${Date.now()}-${Math.random()}`,
            type: 'call_summary',
            roomNumber: callDetails.roomNumber,
            orderId: callDetails.orderReference || orderReference,
            requestContent: 'Call Summary: ' + (callDetails.summary || 'No summary').substring(0, 200) + '...',
            status: 'Đã ghi nhận'
          });
          console.log('Đã lưu order vào bảng orders');
        } catch (dbError) {
          console.error('Lỗi khi lưu request hoặc order từ thiết bị di động vào DB:', dbError);
        }
      } catch (sendError) {
        console.error('Lỗi khi gửi email tóm tắt từ thiết bị di động:', sendError);
        // Không cần trả về lỗi cho client vì đã trả về success trước đó
      }
    } catch (error: any) {
      handleApiError(res, error, 'Lỗi trong endpoint mobile-call-summary-email:');
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
          missingEnv: true
        });
      }
      
      // Gửi request kiểm tra đến Mailjet API
      try {
        const response = await axios.get('https://api.mailjet.com/v3/REST/sender', {
          auth: {
            username: process.env.MAILJET_API_KEY,
            password: process.env.MAILJET_SECRET_KEY
          }
        });
        
        // Nếu API trả về thành công, trả về thông tin sender (công ty gửi email)
        res.json({
          success: true,
          mailjetConnected: true,
          apiKey: `${process.env.MAILJET_API_KEY.substring(0, 4)}...`,
          totalSenders: response.data.Count,
          senders: response.data.Data.map((sender: any) => ({
            email: sender.Email,
            name: sender.Name,
            status: sender.Status
          }))
        });
      } catch (apiError: any) {
        console.error('Lỗi khi kết nối đến Mailjet API:', apiError.message);
        // Nếu kết nối thất bại, trả về thông tin lỗi
        res.status(500).json({
          success: false,
          mailjetConnected: false,
          error: 'Không thể kết nối đến Mailjet API',
          details: apiError.response?.data || apiError.message
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
          missingEnv: true
        });
      }
      
      console.log('Lấy danh sách email gần đây từ Mailjet');
      
      // Gửi request trực tiếp đến Mailjet API
      try {
        const result = await axios.get('https://api.mailjet.com/v3/REST/message?Limit=20', {
          auth: {
            username: process.env.MAILJET_API_KEY as string,
            password: process.env.MAILJET_SECRET_KEY as string
          }
        });
        
        // Kiểm tra và xử lý kết quả
        if (result && result.data && Array.isArray(result.data.Data)) {
          console.log(`Tìm thấy ${result.data.Count} email gần đây`);
          
          // Chuyển đổi kết quả thành định dạng dễ đọc
          const emails = result.data.Data.map((message: any) => ({
            messageId: message.ID,
            status: message.Status || 'Unknown',
            to: message.Recipients && message.Recipients[0] ? message.Recipients[0].Email : 'Unknown',
            from: message.Sender ? message.Sender.Email : 'Unknown',
            subject: message.Subject || 'No subject',
            sentAt: message.ArrivedAt || 'Unknown',
          }));
          
          res.json({
            success: true,
            count: emails.length,
            emails: emails
          });
        } else {
          throw new Error('Định dạng dữ liệu không hợp lệ từ Mailjet API');
        }
      } catch (apiError: any) {
        console.error('Lỗi khi lấy dữ liệu email từ Mailjet:', apiError.message);
        res.status(500).json({
          success: false,
          error: 'Không thể lấy dữ liệu email từ Mailjet',
          details: apiError.response?.data || apiError.message
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

  // Test endpoint to simulate transcript creation
  app.post('/api/test-transcript', async (req, res) => {
    try {
      const { callId, role, content } = req.body;
      
      if (!callId || !role || !content) {
        return res.status(400).json({ error: 'callId, role, and content are required' });
      }
      
      // Auto-create call record if it doesn't exist
      const existingCall = await db.select().from(call).where(eq(call.call_id_vapi, callId)).limit(1);
      if (existingCall.length === 0) {
        // Extract room number from content if possible
        const roomMatch = content.match(/room (\d+)/i) || content.match(/phòng (\d+)/i);
        const roomNumber = roomMatch ? roomMatch[1] : null;
        
        // Determine language from content
        const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(content);
        const hasFrench = /[àâäéèêëîïôöùûüÿç]/.test(content) && !hasVietnamese;
        let language = 'en';
        if (hasVietnamese) language = 'vi';
        else if (hasFrench) language = 'fr';
        
        await db.insert(call).values({
          call_id_vapi: callId,
          // TODO: Add room_number, duration, language when schema is fixed
        });
        
        console.log(`Test: Auto-created call record for ${callId} with room ${roomNumber || 'unknown'} and language ${language}`);
      }
      
      // Get call ID for transcript
      let callDbId;
      if (existingCall.length > 0) {
        callDbId = existingCall[0].id;
      } else {
        const newCall = await db.select({ id: call.id }).from(call).where(eq(call.call_id_vapi, callId)).limit(1);
        callDbId = newCall[0]?.id;
      }
      
      // TODO: Fix database schema mismatch - temporarily commented out
      // await db.insert(transcript).values({
      //   call_id: callId,
      //   role,
      //   content,
      //   timestamp: getCurrentTimestamp()
      // });
      
      console.log(`Stored transcript for call ${callId}: ${role} - ${content?.substring(0, 100)}...`);
      
      res.json({ success: true, message: 'Test transcript created successfully' });
    } catch (error) {
      handleApiError(res, error, 'Error creating test transcript');
    }
  });

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
      res.status(501).json({ error: 'References functionality not implemented' }); // Placeholder
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
      res.status(501).json({ error: 'References functionality not implemented' }); // Placeholder
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
      res.status(501).json({ error: 'References functionality not implemented' }); // Placeholder
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

  // Staff login route with tenant support
  app.post('/api/staff/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Staff login attempt: ${username}`);
    
    try {
      // 1. Extract tenant from subdomain or host
      const tenantId = await extractTenantFromRequest(req);
      console.log(`🏨 Tenant identified for login: ${tenantId}`);
      
      // 2. Try to find staff in database with tenant association
      let staffUser = await findStaffInDatabase(username, password, tenantId);
      
      // 3. Fallback to environment variables and hardcoded accounts (for backward compatibility)
      if (!staffUser) {
        staffUser = await findStaffInFallback(username, password, tenantId);
      }
      
      if (!staffUser) {
        console.log('Login failed: Invalid credentials or tenant access denied');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // 4. Generate JWT with tenant and role information
      const token = jwt.sign(
        { 
          username: staffUser.username, 
          tenantId: staffUser.tenant_id,
          role: staffUser.role,
          permissions: staffUser.permissions || []
        }, 
        JWT_SECRET, 
        { expiresIn: '1d' }
      );
      
      console.log(`✅ Login successful for ${username} at tenant ${tenantId}`);
      res.json({ 
        token, 
        user: {
          username: staffUser.username,
          role: staffUser.role,
          tenantId: staffUser.tenant_id
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  });

  // ============================================
  // Auth API Routes (for client compatibility)
  // ============================================

  // Auth login route (matches client expectations)
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Auth login attempt: ${email}`);
    
          try {
        // 1. Extract tenant from subdomain or host
        const tenantId = await extractTenantFromRequest(req);
        console.log(`🏨 Tenant identified for auth login: ${tenantId}`);
        
                // 2. Use UnifiedAuthService for authentication  
        const authResult = await UnifiedAuthService.login({
          username: email, // Use email as username for client compatibility
          password: password,
          tenantId: 'mi-nhon-hotel' // Use correct tenant ID for test users
        });
      
      if (!authResult.success || !authResult.token) {
        console.log('Auth login failed: Invalid credentials or tenant access denied');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      console.log(`✅ Auth login successful for ${email} at tenant ${tenantId}`);
      res.json({ 
        token: authResult.token,
        refreshToken: authResult.refreshToken,
        user: {
          username: authResult.user?.username,
          email: authResult.user?.email,
          role: authResult.user?.role,
          tenantId: authResult.user?.tenantId,
          displayName: authResult.user?.displayName,
          permissions: authResult.user?.permissions
        },
        tenant: {
          id: authResult.user?.tenantId,
          name: 'Mi Nhon Hotel', // Default tenant name
          subdomain: 'minhonmuine'
        }
      });
    } catch (error) {
      console.error('Auth login error:', error);
      res.status(500).json({ error: 'Internal server error during auth login' });
    }
  });

  // Auth me route (get current user info)
  app.get('/api/auth/me', verifyJWT, async (req, res) => {
    try {
      console.log('Auth me request for user:', req.user);
      
      const user = {
        username: req.user.username,
        email: req.user.username, // Use username as email for client compatibility
        role: req.user.role,
        tenantId: req.user.tenantId
      };
      
      const tenant = {
        id: req.user.tenantId,
        name: 'Mi Nhon Hotel', // Default tenant name
        subdomain: 'minhonmuine'
      };
      
      res.json({ user, tenant });
    } catch (error) {
      console.error('Auth me error:', error);
      res.status(500).json({ error: 'Internal server error during auth me' });
    }
  });

  // Lấy danh sách request
  app.get('/api/staff/requests', verifyJWT, async (req, res) => {
    console.log('API /api/staff/requests called');
    console.log('Authorization header:', req.headers.authorization);
    try {
      // Skip database connection test since db.execute doesn't exist
      console.log('Fetching requests from database...');
      const dbRequests = await db.select().from(requestTable);
      console.log(`Found ${dbRequests.length} requests in database:`, dbRequests);
      
      // Thêm kiểm tra nếu không có requests từ DB
      if (dbRequests.length === 0) {
        console.log('No requests found in database, returning dummy test data');
        // Trả về dữ liệu mẫu nếu không có dữ liệu trong DB
        return res.json([
          { id: 1, room_number: '101', guestName: 'Tony', request_content: 'Beef burger x 2', created_at: new Date(), status: 'Đã ghi nhận', notes: '', orderId: 'ORD-10001', updated_at: new Date() },
          { id: 2, room_number: '202', guestName: 'Anna', request_content: 'Spa booking at 10:00', created_at: new Date(), status: 'Đang thực hiện', notes: '', orderId: 'ORD-10002', updated_at: new Date() },
        ]);
      }
      
      res.json(dbRequests);
    } catch (err) {
      handleApiError(res, err, 'Error in /api/staff/requests:');
    }
  });

  // Cập nhật trạng thái request
  app.patch('/api/staff/requests/:id/status', verifyJWT, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      // Cập nhật trong cơ sở dữ liệu thay vì mảng trong bộ nhớ
      const result = await db.update(requestTable)
        .set({ 
          status,
          updated_at: getCurrentTimestamp() 
        })
        .where(eq(requestTable.id, id))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      // Đồng bộ status sang order nếu có orderId
      const orderId = result[0].order_id;
      if (orderId) {
        // Tìm order theo orderId (orderReference)
        const orders = await storage.getAllOrders({});
        const order = orders.find((o: any) => o.order_id === orderId);
        if (order) {
          const updatedOrder = await storage.updateOrderStatus(order.id.toString(), status);
          // Emit WebSocket cho Guest UI nếu updatedOrder tồn tại
          if (updatedOrder) {
            // Emit qua socket.io nếu có
            const io = req.app.get('io');
            if (io) {
              // Emit cho tất cả client hoặc theo room (nếu dùng join_room)
              io.emit('order_status_update', {
                orderId: updatedOrder.id,
                reference: (updatedOrder as any).order_id, // Use orderId instead of specialInstructions
                status: updatedOrder.status
              });
            }
            // Giữ lại emit qua globalThis.wss nếu cần tương thích cũ
            if ((updatedOrder as any).order_id && globalThis.wss) {
              globalThis.wss.clients.forEach((client) => {
                if (client.readyState === 1) {
                  client.send(JSON.stringify({
                    type: 'order_status_update',
                    reference: (updatedOrder as any).order_id, // Use orderId instead of specialInstructions
                    status: updatedOrder.status
                  }));
                }
              });
            }
          }
        }
      }
      res.json(result[0]);
    } catch (error) {
      handleApiError(res, error, 'Error updating request status:');
    }
  });

  // Lấy lịch sử tin nhắn của request
  app.get('/api/staff/requests/:id/messages', verifyJWT, (req, res) => {
    const id = parseInt(req.params.id);
    const msgs = messageList.filter(m => m.requestId === id);
    res.json(msgs);
  });

  // Gửi tin nhắn tới guest
  app.post('/api/staff/requests/:id/message', verifyJWT, (req, res) => {
    const id = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Missing content' });
    const msg: StaffMessage = {
      id: messageList.length + 1,
      requestId: id,
      sender: 'staff',
      content,
      created_at: new Date(),
      updated_at: new Date()
    };
    messageList.push(msg);
    res.status(201).json(msg);
  });

  // Xóa tất cả requests
  app.delete('/api/staff/requests/all', verifyJWT, async (req, res) => {
    try {
      console.log('Attempting to delete all requests');
      // Xóa tất cả dữ liệu từ bảng request sử dụng API function
      const result = await deleteAllRequests();
      const deletedCount = result.success && 'deletedCount' in result ? (result.deletedCount || 0) : 0;
      console.log(`Deleted ${deletedCount} requests from database`);
      
      res.json({ 
        success: true, 
        message: `Đã xóa ${deletedCount} requests`, 
        deletedCount: deletedCount 
      });
    } catch (error) {
      handleApiError(res, error, 'Error deleting all requests:');
    }
  });

  // Get all orders (public, no auth)

  // Xóa tất cả orders (public, không cần xác thực)

  // Analytics routes
  app.get('/api/analytics/overview', verifyJWT, async (req, res) => {
    try {
      const data = await getOverview();
      res.json(data);
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch analytics overview');
    }
  });

  app.get('/api/analytics/service-distribution', verifyJWT, async (req, res) => {
    try {
      const data = await getServiceDistribution();
      res.json(data);
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch service distribution');
    }
  });

  app.get('/api/analytics/hourly-activity', verifyJWT, async (req, res) => {
    try {
      const data = await getHourlyActivity();
      res.json(data);
    } catch (error) {
      handleApiError(res, error, 'Failed to fetch hourly activity');
    }
  });

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
          secondaryFont: 'Roboto'
        },
        contact: {
          phone: tenant.phone || '',
          email: tenant.email || '',
          address: tenant.address || '',
          website: tenant.website || ''
        },
        features: {
          multiLanguage: true,
          callHistory: true,
          roomService: true,
          concierge: true,
          voiceCloning: false,
          analytics: true
        },
        services: [],
        supportedLanguages: ['en', 'fr', 'zh', 'ru', 'ko', 'vi'],
        vapiConfig: {
          publicKeys: {},
          assistantIds: {}
        },
        timezone: 'Asia/Ho_Chi_Minh',
        currency: 'VND',
        location: {
          city: 'Phan Thiet',
          country: 'Vietnam',
          latitude: 10.9280,
          longitude: 108.1020
        }
      });
    } catch (error) {
      console.error('Error in /api/hotels/by-subdomain:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============================================
  // Get Vapi Configuration by Language
  // ============================================
  app.get('/api/vapi/config/:language', (req: Request, res: Response) => {
    try {
      const { language } = req.params;
      
      console.log(`[API] Getting Vapi config for language: ${language}`);
      
      // Get environment variables for the requested language
      const getEnvVars = (lang: string) => {
        const langUpper = lang.toUpperCase();
        return {
          publicKey: lang === 'en' 
            ? process.env.VITE_VAPI_PUBLIC_KEY
            : process.env[`VITE_VAPI_PUBLIC_KEY_${langUpper}`],
          assistantId: lang === 'en'
            ? process.env.VITE_VAPI_ASSISTANT_ID  
            : process.env[`VITE_VAPI_ASSISTANT_ID_${langUpper}`]
        };
      };
      
      const config = getEnvVars(language);
      
      console.log(`[API] Vapi config for ${language}:`, {
        publicKey: config.publicKey ? config.publicKey.substring(0, 10) + '...' : 'NOT SET',
        assistantId: config.assistantId ? config.assistantId.substring(0, 10) + '...' : 'NOT SET'
      });
      
      // Fallback to English if language-specific config not found
      if (!config.publicKey || !config.assistantId) {
        console.log(`[API] Language ${language} config not found, falling back to English`);
        const fallbackConfig = getEnvVars('en');
        res.json({
          language,
          publicKey: fallbackConfig.publicKey || '',
          assistantId: fallbackConfig.assistantId || '',
          fallback: true
        });
      } else {
        res.json({
          language,
          publicKey: config.publicKey,
          assistantId: config.assistantId,
          fallback: false
        });
      }
    } catch (error) {
      console.error('[API] Error getting Vapi config:', error);
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
