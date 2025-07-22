import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API handlers
export const handlers = [
  // Mock authentication endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-jwt-token',
        user: {
          id: 'mock-user-id',
          username: 'testuser',
          role: 'admin',
        },
      })
    );
  }),

  // Mock voice assistant endpoints
  rest.post('/api/call-start', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        callId: 'mock-call-id',
        assistantId: 'mock-assistant-id',
      })
    );
  }),

  rest.post('/api/call-end', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        callId: 'mock-call-id',
        duration: 120,
      })
    );
  }),

  // Mock notification endpoints
  rest.post('/api/notifications', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        notificationId: 'mock-notification-id',
      })
    );
  }),

  // Mock analytics endpoints
  rest.get('/api/analytics/overview', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        totalCalls: 150,
        avgDuration: 180,
        satisfaction: 4.2,
        topServices: ['housekeeping', 'room-service'],
      })
    );
  }),

  // Mock tenant/hotel endpoints
  rest.get('/api/tenants/:tenantId', (req, res, ctx) => {
    const { tenantId } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id: tenantId,
        hotelName: 'Mock Hotel',
        subscriptionPlan: 'pro',
        settings: {
          languages: ['en', 'vi', 'fr'],
          voiceCloning: true,
        },
      })
    );
  }),

  // Mock service requests
  rest.get('/api/requests', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'mock-request-1',
          service: 'housekeeping',
          status: 'pending',
          roomNumber: '101',
          timestamp: new Date().toISOString(),
        },
      ])
    );
  }),

  rest.post('/api/requests', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'mock-request-new',
        success: true,
      })
    );
  }),

  // Fallback handler for unhandled requests
  rest.all('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url}`);
    return res(
      ctx.status(404),
      ctx.json({ error: 'Not found' })
    );
  }),
];

// Create MSW server
export const server = setupServer(...handlers); 