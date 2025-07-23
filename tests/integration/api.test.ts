import request from 'supertest';
import { db } from '@shared/db';
import {
  staff,
  tenants,
  calls,
  transcripts,
  requests,
  messages,
} from '@shared/db/schema';
import bcrypt from 'bcrypt';

// ============================================================================
// TEST SETUP
// ============================================================================

let authToken: string;
let testTenantId: string;
let testUserId: number;

const testData = {
  tenant: {
    id: 'test-tenant-id',
    hotelName: 'Test Hotel',
    subdomain: 'test-hotel',
    subscriptionPlan: 'premium' as const,
    subscriptionStatus: 'active' as const,
  },
  user: {
    username: 'testadmin',
    password: 'testpassword123',
    role: 'admin' as const,
  },
  call: {
    roomNumber: '101',
    language: 'en' as const,
    serviceType: 'room-service',
  },
  order: {
    roomNumber: '101',
    orderId: 'TEST-ORDER-001',
    requestContent: 'I need room service for breakfast',
  },
};

// ============================================================================
// TEST HELPERS
// ============================================================================

const setupTestData = async () => {
  // Create test tenant
  await db.insert(tenants).values(testData.tenant);

  // Create test user
  const hashedPassword = await bcrypt.hash(testData.user.password, 10);
  const [user] = await db
    .insert(staff)
    .values({
      username: testData.user.username,
      password: hashedPassword,
      role: testData.user.role,
      tenantId: testData.tenant.id,
    })
    .returning();

  testTenantId = testData.tenant.id;
  testUserId = user.id;
};

const cleanupTestData = async () => {
  await db.delete(messages).where(eq(messages.tenantId, testTenantId));
  await db.delete(requests).where(eq(requests.tenantId, testTenantId));
  await db.delete(transcripts).where(eq(transcripts.tenantId, testTenantId));
  await db.delete(calls).where(eq(calls.tenantId, testTenantId));
  await db.delete(staff).where(eq(staff.tenantId, testTenantId));
  await db.delete(tenants).where(eq(tenants.id, testTenantId));
};

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================

describe('Authentication API', () => {
  beforeAll(async () => {
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /auth/login', () => {
    it('should authenticate valid credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        username: testData.user.username,
        password: testData.user.password,
        tenantId: testTenantId,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe(testData.user.username);
      expect(response.body.data.user.role).toBe(testData.user.role);
      expect(response.body.data.tenant.id).toBe(testTenantId);

      authToken = response.body.data.token;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        username: testData.user.username,
        password: 'wrongpassword',
        tenantId: testTenantId,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject missing username', async () => {
      const response = await request(app).post('/auth/login').send({
        password: testData.user.password,
        tenantId: testTenantId,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing password', async () => {
      const response = await request(app).post('/auth/login').send({
        username: testData.user.username,
        tenantId: testTenantId,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh valid token', async () => {
      const response = await request(app).post('/auth/refresh').send({
        token: authToken,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.expiresIn).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const response = await request(app).post('/auth/refresh').send({
        token: 'invalid-token',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});

// ============================================================================
// CALL MANAGEMENT TESTS
// ============================================================================

describe('Call Management API', () => {
  let testCallId: string;

  describe('POST /calls/start', () => {
    it('should start a new call', async () => {
      const response = await request(app)
        .post('/calls/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testData.call,
          tenantId: testTenantId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.callId).toBeDefined();
      expect(response.body.data.vapiCallId).toBeDefined();
      expect(response.body.data.roomNumber).toBe(testData.call.roomNumber);
      expect(response.body.data.language).toBe(testData.call.language);
      expect(response.body.data.startTime).toBeDefined();

      testCallId = response.body.data.callId;
    });

    it('should reject call without authentication', async () => {
      const response = await request(app)
        .post('/calls/start')
        .send({
          ...testData.call,
          tenantId: testTenantId,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid room number', async () => {
      const response = await request(app)
        .post('/calls/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomNumber: '',
          language: testData.call.language,
          tenantId: testTenantId,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid language', async () => {
      const response = await request(app)
        .post('/calls/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomNumber: testData.call.roomNumber,
          language: 'invalid',
          tenantId: testTenantId,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /calls/end', () => {
    it('should end an active call', async () => {
      const response = await request(app)
        .post('/calls/end')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          callId: testCallId,
          duration: 300,
          tenantId: testTenantId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.callId).toBe(testCallId);
      expect(response.body.data.endTime).toBeDefined();
      expect(response.body.data.duration).toBe(300);
    });

    it('should reject invalid call ID', async () => {
      const response = await request(app)
        .post('/calls/end')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          callId: 'invalid-call-id',
          duration: 300,
          tenantId: testTenantId,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /calls/:id', () => {
    it('should get call details', async () => {
      const response = await request(app)
        .get(`/calls/${testCallId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testCallId);
      expect(response.body.data.roomNumber).toBe(testData.call.roomNumber);
      expect(response.body.data.language).toBe(testData.call.language);
    });

    it('should return 404 for non-existent call', async () => {
      const response = await request(app)
        .get('/calls/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /calls', () => {
    it('should get paginated list of calls', async () => {
      const response = await request(app)
        .get('/calls')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should filter calls by room number', async () => {
      const response = await request(app)
        .get('/calls')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          roomNumber: testData.call.roomNumber,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((call: any) => {
        expect(call.roomNumber).toBe(testData.call.roomNumber);
      });
    });

    it('should filter calls by language', async () => {
      const response = await request(app)
        .get('/calls')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          language: testData.call.language,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((call: any) => {
        expect(call.language).toBe(testData.call.language);
      });
    });
  });
});

// ============================================================================
// TRANSCRIPT TESTS
// ============================================================================

describe('Transcript API', () => {
  let testCallId: string;

  beforeAll(async () => {
    // Create a test call
    const [call] = await db
      .insert(calls)
      .values({
        callIdVapi: 'test-vapi-call-id',
        roomNumber: '102',
        language: 'en',
        startTime: new Date(),
        tenantId: testTenantId,
      })
      .returning();
    testCallId = call.id;
  });

  describe('POST /transcripts', () => {
    it('should save transcript entry', async () => {
      const response = await request(app)
        .post('/transcripts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          callId: testCallId,
          role: 'user',
          content: 'Hello, I need room service',
          tenantId: testTenantId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.callId).toBe(testCallId);
      expect(response.body.data.role).toBe('user');
      expect(response.body.data.content).toBe('Hello, I need room service');
    });

    it('should reject invalid role', async () => {
      const response = await request(app)
        .post('/transcripts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          callId: testCallId,
          role: 'invalid',
          content: 'Test content',
          tenantId: testTenantId,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /transcripts/:callId', () => {
    it('should get transcripts for a call', async () => {
      const response = await request(app)
        .get(`/transcripts/${testCallId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });
});

// ============================================================================
// ORDER MANAGEMENT TESTS
// ============================================================================

describe('Order Management API', () => {
  let testOrderId: string;

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testData.order,
          tenantId: testTenantId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.roomNumber).toBe(testData.order.roomNumber);
      expect(response.body.data.orderId).toBe(testData.order.orderId);
      expect(response.body.data.requestContent).toBe(
        testData.order.requestContent
      );
      expect(response.body.data.status).toBe('pending');

      testOrderId = response.body.data.orderId;
    });

    it('should reject duplicate order ID', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testData.order,
          tenantId: testTenantId,
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /orders/:orderId/status', () => {
    it('should update order status', async () => {
      const response = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'in-progress',
          tenantId: testTenantId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in-progress');
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'invalid-status',
          tenantId: testTenantId,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /orders', () => {
    it('should get paginated list of orders', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          status: 'pending',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((order: any) => {
        expect(order.status).toBe('pending');
      });
    });
  });
});

// ============================================================================
// MESSAGE TESTS
// ============================================================================

describe('Message API', () => {
  let testRequestId: number;

  beforeAll(async () => {
    // Create a test request
    const [request] = await db
      .insert(requests)
      .values({
        roomNumber: '103',
        orderId: 'TEST-ORDER-002',
        requestContent: 'Test request',
        status: 'pending',
        tenantId: testTenantId,
      })
      .returning();
    testRequestId = request.id;
  });

  describe('POST /messages', () => {
    it('should create a new message', async () => {
      const response = await request(app)
        .post('/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          requestId: testRequestId,
          sender: 'staff',
          content: 'Your order is being prepared',
          tenantId: testTenantId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.requestId).toBe(testRequestId);
      expect(response.body.data.sender).toBe('staff');
      expect(response.body.data.content).toBe('Your order is being prepared');
    });
  });

  describe('GET /messages/:requestId', () => {
    it('should get messages for a request', async () => {
      const response = await request(app)
        .get(`/messages/${testRequestId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });
});

// ============================================================================
// HOTEL MANAGEMENT TESTS
// ============================================================================

describe('Hotel Management API', () => {
  describe('POST /hotel/research', () => {
    it('should research hotel information', async () => {
      const response = await request(app)
        .post('/hotel/research')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelName: 'Test Hotel',
          location: 'Test City',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBeDefined();
      expect(response.body.data.address).toBeDefined();
    });
  });

  describe('POST /hotel/generate-assistant', () => {
    it('should generate assistant configuration', async () => {
      const response = await request(app)
        .post('/hotel/generate-assistant')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hotelData: {
            name: 'Test Hotel',
            address: '123 Test Street',
            phone: '+1234567890',
            email: 'test@hotel.com',
            description: 'A test hotel',
            amenities: ['wifi', 'pool'],
            services: [
              {
                name: 'Room Service',
                description: '24/7 room service',
                category: 'food',
                price: 25,
                availability: '24/7',
              },
            ],
            policies: {
              checkIn: '3:00 PM',
              checkOut: '11:00 AM',
              cancellation: '24 hours',
              pets: false,
              smoking: false,
            },
          },
          customization: {
            capabilities: {
              languages: ['en'],
              services: ['room-service'],
              features: ['voice-commands'],
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.assistantId).toBeDefined();
      expect(response.body.data.config).toBeDefined();
    });
  });
});

// ============================================================================
// ANALYTICS TESTS
// ============================================================================

describe('Analytics API', () => {
  describe('GET /analytics/:tenantId', () => {
    it('should get analytics overview', async () => {
      const response = await request(app)
        .get(`/analytics/${testTenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-12-31T23:59:59.999Z',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.languageDistribution).toBeDefined();
      expect(response.body.data.serviceTypeDistribution).toBeDefined();
      expect(response.body.data.hourlyActivity).toBeDefined();
    });
  });

  describe('GET /analytics/:tenantId/service-distribution', () => {
    it('should get service type distribution', async () => {
      const response = await request(app)
        .get(`/analytics/${testTenantId}/service-distribution`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /analytics/:tenantId/hourly-activity', () => {
    it('should get hourly activity data', async () => {
      const response = await request(app)
        .get(`/analytics/${testTenantId}/hourly-activity`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });
});

// ============================================================================
// HEALTH CHECK TESTS
// ============================================================================

describe('Health Check API', () => {
  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.timestamp).toBeDefined();
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health status', async () => {
      const response = await request(app).get('/health/detailed');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.database).toBeDefined();
      expect(response.body.data.vapi).toBeDefined();
      expect(response.body.data.openai).toBeDefined();
      expect(response.body.data.email).toBeDefined();
    });
  });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe('Error Handling', () => {
  describe('Invalid routes', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Invalid authentication', () => {
    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/calls')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/calls')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Validation errors', () => {
    it('should return 400 for invalid request data', async () => {
      const response = await request(app)
        .post('/calls/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomNumber: '',
          language: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details).toBeDefined();
    });
  });
});
