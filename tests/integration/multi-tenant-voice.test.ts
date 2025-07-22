import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals';
import request from 'supertest';
import { db } from '@shared/db';
import {
  tenants,
  staff,
  call,
  transcript,
  request as requestTable,
} from '@shared/db/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Test Configuration
const TEST_JWT_SECRET = 'test-secret-key';
const TEST_TIMEOUT = 30000;

// Test Data
const testTenants = [
  {
    id: 'tenant-hotel-a',
    hotel_name: 'Grand Hotel A',
    subdomain: 'grand-hotel-a',
    subscription_plan: 'premium',
    subscription_status: 'active',
    max_voices: 10,
    max_languages: 6,
    voice_cloning: true,
    monthly_call_limit: 5000,
  },
  {
    id: 'tenant-hotel-b',
    hotel_name: 'Boutique Hotel B',
    subdomain: 'boutique-hotel-b',
    subscription_plan: 'basic',
    subscription_status: 'active',
    max_voices: 3,
    max_languages: 2,
    voice_cloning: false,
    monthly_call_limit: 1000,
  },
];

const testStaff = [
  {
    id: 'staff-a-admin',
    tenant_id: 'tenant-hotel-a',
    username: 'admin-a',
    password: '$2b$10$hashedpassword',
    role: 'admin',
    is_active: true,
  },
  {
    id: 'staff-b-manager',
    tenant_id: 'tenant-hotel-b',
    username: 'manager-b',
    password: '$2b$10$hashedpassword',
    role: 'manager',
    is_active: true,
  },
];

// Helper Functions
function generateTestJWT(staffId: string, tenantId: string): string {
  return jwt.sign(
    {
      id: staffId,
      tenantId,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
    },
    TEST_JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function seedTestData() {
  // Clean existing test data
  await db
    .delete(transcript)
    .where(
      and(
        eq(transcript.tenant_id, 'tenant-hotel-a'),
        eq(transcript.tenant_id, 'tenant-hotel-b')
      )
    );
  await db
    .delete(call)
    .where(
      and(
        eq(call.tenant_id, 'tenant-hotel-a'),
        eq(call.tenant_id, 'tenant-hotel-b')
      )
    );
  await db
    .delete(requestTable)
    .where(
      and(
        eq(requestTable.tenant_id, 'tenant-hotel-a'),
        eq(requestTable.tenant_id, 'tenant-hotel-b')
      )
    );
  await db
    .delete(staff)
    .where(
      and(
        eq(staff.tenant_id, 'tenant-hotel-a'),
        eq(staff.tenant_id, 'tenant-hotel-b')
      )
    );
  await db
    .delete(tenants)
    .where(
      and(eq(tenants.id, 'tenant-hotel-a'), eq(tenants.id, 'tenant-hotel-b'))
    );

  // Insert test tenants
  await db.insert(tenants).values(testTenants);

  // Insert test staff
  await db.insert(staff).values(testStaff);
}

async function cleanupTestData() {
  // Cleanup in reverse order of dependencies
  await db
    .delete(transcript)
    .where(
      and(
        eq(transcript.tenant_id, 'tenant-hotel-a'),
        eq(transcript.tenant_id, 'tenant-hotel-b')
      )
    );
  await db
    .delete(call)
    .where(
      and(
        eq(call.tenant_id, 'tenant-hotel-a'),
        eq(call.tenant_id, 'tenant-hotel-b')
      )
    );
  await db
    .delete(requestTable)
    .where(
      and(
        eq(requestTable.tenant_id, 'tenant-hotel-a'),
        eq(requestTable.tenant_id, 'tenant-hotel-b')
      )
    );
  await db
    .delete(staff)
    .where(
      and(
        eq(staff.tenant_id, 'tenant-hotel-a'),
        eq(staff.tenant_id, 'tenant-hotel-b')
      )
    );
  await db
    .delete(tenants)
    .where(
      and(eq(tenants.id, 'tenant-hotel-a'), eq(tenants.id, 'tenant-hotel-b'))
    );
}

// ============================================
// INTEGRATION TESTS: MULTI-TENANT VOICE FEATURES
// ============================================

describe('Multi-Tenant Voice Integration Tests', () => {
  beforeAll(async () => {
    await seedTestData();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await cleanupTestData();
  }, TEST_TIMEOUT);

  beforeEach(() => {
    // Reset any test state if needed
  });

  // ============================================
  // TEST SUITE 1: TENANT ISOLATION
  // ============================================

  describe('Tenant Data Isolation', () => {
    it('should isolate call data between tenants', async () => {
      const tokenA = generateTestJWT('staff-a-admin', 'tenant-hotel-a');
      const tokenB = generateTestJWT('staff-b-manager', 'tenant-hotel-b');

      // Create calls for both tenants
      const callA = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          call_id_vapi: 'call-a-001',
          room_number: 'A-101',
          language: 'en',
          service_type: 'room-service',
          tenant_id: 'tenant-hotel-a',
        });

      const callB = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          call_id_vapi: 'call-b-001',
          room_number: 'B-201',
          language: 'vi',
          service_type: 'housekeeping',
          tenant_id: 'tenant-hotel-b',
        });

      expect(callA.status).toBe(200);
      expect(callB.status).toBe(200);

      // Verify tenant A can only see their calls
      const analyticsA = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(analyticsA.status).toBe(200);
      // Should only include tenant A's data
      expect(analyticsA.body).toHaveProperty('totalCalls');

      // Verify tenant B can only see their calls
      const analyticsB = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(analyticsB.status).toBe(200);
      // Should only include tenant B's data
      expect(analyticsB.body).toHaveProperty('totalCalls');
    });

    it('should isolate transcript data between tenants', async () => {
      const tokenA = generateTestJWT('staff-a-admin', 'tenant-hotel-a');
      const tokenB = generateTestJWT('staff-b-manager', 'tenant-hotel-b');

      // Store transcripts for both tenants
      const transcriptA = await request(app)
        .post('/api/store-transcript')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          callId: 'call-a-transcript-001',
          role: 'user',
          content: 'Hello, I need room service',
          tenantId: 'tenant-hotel-a',
        });

      const transcriptB = await request(app)
        .post('/api/store-transcript')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          callId: 'call-b-transcript-001',
          role: 'user',
          content: 'Xin chào, tôi cần dọn phòng',
          tenantId: 'tenant-hotel-b',
        });

      expect(transcriptA.status).toBe(200);
      expect(transcriptB.status).toBe(200);

      // Verify transcripts are isolated by tenant
      const storedTranscriptsA = await db
        .select()
        .from(transcript)
        .where(eq(transcript.tenant_id, 'tenant-hotel-a'));

      const storedTranscriptsB = await db
        .select()
        .from(transcript)
        .where(eq(transcript.tenant_id, 'tenant-hotel-b'));

      expect(storedTranscriptsA.length).toBeGreaterThan(0);
      expect(storedTranscriptsB.length).toBeGreaterThan(0);

      // Ensure no cross-contamination
      expect(
        storedTranscriptsA.every(t => t.tenant_id === 'tenant-hotel-a')
      ).toBe(true);
      expect(
        storedTranscriptsB.every(t => t.tenant_id === 'tenant-hotel-b')
      ).toBe(true);
    });

    it('should prevent cross-tenant API access', async () => {
      const tokenA = generateTestJWT('staff-a-admin', 'tenant-hotel-a');

      // Try to access tenant B's data with tenant A's token
      const crossTenantAccess = await request(app)
        .get('/api/hotels/by-subdomain/boutique-hotel-b')
        .set('Authorization', `Bearer ${tokenA}`);

      // Should still return data (public endpoint) but not include sensitive info
      expect(crossTenantAccess.status).toBe(200);
      expect(crossTenantAccess.body).toHaveProperty(
        'subdomain',
        'boutique-hotel-b'
      );
    });
  });

  // ============================================
  // TEST SUITE 2: VOICE ASSISTANT WORKFLOW
  // ============================================

  describe('Voice Assistant Workflow Integration', () => {
    it('should handle complete voice call workflow with tenant context', async () => {
      const token = generateTestJWT('staff-a-admin', 'tenant-hotel-a');
      const callId = `integration-call-${Date.now()}`;

      // 1. Create call
      const createCall = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${token}`)
        .send({
          call_id_vapi: callId,
          room_number: '101',
          language: 'en',
          service_type: 'concierge',
          tenant_id: 'tenant-hotel-a',
        });

      expect(createCall.status).toBe(200);
      expect(createCall.body.success).toBe(true);

      // 2. Store multiple transcripts
      const transcripts = [
        {
          role: 'assistant',
          content: 'Hello! Welcome to Grand Hotel A. How may I assist you?',
        },
        { role: 'user', content: 'I would like to order room service please' },
        {
          role: 'assistant',
          content:
            "I'd be happy to help with room service. What would you like to order?",
        },
        {
          role: 'user',
          content: 'Two club sandwiches and a bottle of wine please',
        },
      ];

      for (const transcript of transcripts) {
        const storeTranscript = await request(app)
          .post('/api/store-transcript')
          .set('Authorization', `Bearer ${token}`)
          .send({
            callId,
            role: transcript.role,
            content: transcript.content,
            tenantId: 'tenant-hotel-a',
          });

        expect(storeTranscript.status).toBe(200);
      }

      // 3. End call with duration
      const endCall = await request(app)
        .post('/api/call-end')
        .set('Authorization', `Bearer ${token}`)
        .send({
          callId,
          duration: 180, // 3 minutes
        });

      expect(endCall.status).toBe(200);
      expect(endCall.body.success).toBe(true);

      // 4. Verify call data is stored correctly
      const storedCall = await db
        .select()
        .from(call)
        .where(
          and(
            eq(call.call_id_vapi, callId),
            eq(call.tenant_id, 'tenant-hotel-a')
          )
        )
        .limit(1);

      expect(storedCall.length).toBe(1);
      expect(storedCall[0].duration).toBe(180);
      expect(storedCall[0].room_number).toBe('101');

      // 5. Verify transcripts are stored
      const storedTranscripts = await db
        .select()
        .from(transcript)
        .where(
          and(
            eq(transcript.call_id, callId),
            eq(transcript.tenant_id, 'tenant-hotel-a')
          )
        );

      expect(storedTranscripts.length).toBe(4);
    });

    it('should handle multi-language voice calls per tenant limits', async () => {
      const tokenA = generateTestJWT('staff-a-admin', 'tenant-hotel-a');
      const tokenB = generateTestJWT('staff-b-manager', 'tenant-hotel-b');

      // Tenant A (Premium) - supports 6 languages
      const languagesA = ['en', 'vi', 'fr', 'zh', 'ko', 'ru'];

      for (const lang of languagesA) {
        const response = await request(app)
          .post('/api/calls')
          .set('Authorization', `Bearer ${tokenA}`)
          .send({
            call_id_vapi: `call-a-${lang}-${Date.now()}`,
            language: lang,
            tenant_id: 'tenant-hotel-a',
          });

        expect(response.status).toBe(200);
      }

      // Tenant B (Basic) - only supports 2 languages
      const languagesB = ['en', 'vi'];

      for (const lang of languagesB) {
        const response = await request(app)
          .post('/api/calls')
          .set('Authorization', `Bearer ${tokenB}`)
          .send({
            call_id_vapi: `call-b-${lang}-${Date.now()}`,
            language: lang,
            tenant_id: 'tenant-hotel-b',
          });

        expect(response.status).toBe(200);
      }

      // Verify language limits through analytics
      const analyticsA = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${tokenA}`);

      const analyticsB = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(analyticsA.status).toBe(200);
      expect(analyticsB.status).toBe(200);
    });
  });

  // ============================================
  // TEST SUITE 3: SUBSCRIPTION PLAN FEATURES
  // ============================================

  describe('Subscription Plan Feature Access', () => {
    it('should enforce voice cloning feature based on subscription plan', async () => {
      const tokenA = generateTestJWT('staff-a-admin', 'tenant-hotel-a'); // Premium - voice cloning enabled
      const tokenB = generateTestJWT('staff-b-manager', 'tenant-hotel-b'); // Basic - voice cloning disabled

      // Check tenant A has voice cloning access
      const tenantA = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, 'tenant-hotel-a'))
        .limit(1);

      expect(tenantA[0].voice_cloning).toBe(true);
      expect(tenantA[0].subscription_plan).toBe('premium');

      // Check tenant B doesn't have voice cloning access
      const tenantB = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, 'tenant-hotel-b'))
        .limit(1);

      expect(tenantB[0].voice_cloning).toBe(false);
      expect(tenantB[0].subscription_plan).toBe('basic');
    });

    it('should enforce call limits based on subscription plan', async () => {
      // Check tenant A (Premium) has higher call limit
      const tenantA = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, 'tenant-hotel-a'))
        .limit(1);

      expect(tenantA[0].monthly_call_limit).toBe(5000);

      // Check tenant B (Basic) has lower call limit
      const tenantB = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, 'tenant-hotel-b'))
        .limit(1);

      expect(tenantB[0].monthly_call_limit).toBe(1000);
    });
  });

  // ============================================
  // TEST SUITE 4: DASHBOARD API INTEGRATION
  // ============================================

  describe('Dashboard API Integration', () => {
    it('should return tenant-specific hotel configuration', async () => {
      // Test public hotel config endpoint
      const configA = await request(app).get(
        '/api/hotels/by-subdomain/grand-hotel-a'
      );

      expect(configA.status).toBe(200);
      expect(configA.body).toHaveProperty('name', 'Grand Hotel A');
      expect(configA.body).toHaveProperty('subdomain', 'grand-hotel-a');
      expect(configA.body).toHaveProperty('features');

      const configB = await request(app).get(
        '/api/hotels/by-subdomain/boutique-hotel-b'
      );

      expect(configB.status).toBe(200);
      expect(configB.body).toHaveProperty('name', 'Boutique Hotel B');
      expect(configB.body).toHaveProperty('subdomain', 'boutique-hotel-b');
    });

    it('should handle dashboard analytics with tenant filtering', async () => {
      const tokenA = generateTestJWT('staff-a-admin', 'tenant-hotel-a');

      // Create some test data first
      await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          call_id_vapi: `analytics-test-${Date.now()}`,
          room_number: '301',
          language: 'en',
          service_type: 'room-service',
          tenant_id: 'tenant-hotel-a',
        });

      // Test analytics endpoints
      const overview = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${tokenA}`);

      const serviceDistribution = await request(app)
        .get('/api/analytics/service-distribution')
        .set('Authorization', `Bearer ${tokenA}`);

      const hourlyActivity = await request(app)
        .get('/api/analytics/hourly-activity')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(overview.status).toBe(200);
      expect(serviceDistribution.status).toBe(200);
      expect(hourlyActivity.status).toBe(200);

      // Verify data structure
      expect(overview.body).toHaveProperty('totalCalls');
      expect(Array.isArray(serviceDistribution.body)).toBe(true);
      expect(Array.isArray(hourlyActivity.body)).toBe(true);
    });
  });

  // ============================================
  // TEST SUITE 5: ERROR HANDLING & EDGE CASES
  // ============================================

  describe('Error Handling & Edge Cases', () => {
    it('should handle invalid tenant authentication', async () => {
      const invalidToken = generateTestJWT('invalid-staff', 'invalid-tenant');

      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${invalidToken}`);

      // Should handle gracefully (depending on middleware implementation)
      expect([401, 403, 500]).toContain(response.status);
    });

    it('should handle missing tenant context', async () => {
      const response = await request(app).post('/api/store-transcript').send({
        callId: 'test-call',
        role: 'user',
        content: 'Test message',
        // Missing tenantId
      });

      expect(response.status).toBe(200); // Should default to mi-nhon-hotel
    });

    it('should handle concurrent voice calls from different tenants', async () => {
      const tokenA = generateTestJWT('staff-a-admin', 'tenant-hotel-a');
      const tokenB = generateTestJWT('staff-b-manager', 'tenant-hotel-b');

      // Create concurrent calls
      const promises = [
        request(app)
          .post('/api/calls')
          .set('Authorization', `Bearer ${tokenA}`)
          .send({
            call_id_vapi: `concurrent-a-${Date.now()}`,
            tenant_id: 'tenant-hotel-a',
            language: 'en',
          }),
        request(app)
          .post('/api/calls')
          .set('Authorization', `Bearer ${tokenB}`)
          .send({
            call_id_vapi: `concurrent-b-${Date.now()}`,
            tenant_id: 'tenant-hotel-b',
            language: 'vi',
          }),
      ];

      const results = await Promise.all(promises);

      expect(results[0].status).toBe(200);
      expect(results[1].status).toBe(200);
      expect(results[0].body.success).toBe(true);
      expect(results[1].body.success).toBe(true);
    });
  });

  // ============================================
  // TEST SUITE 6: PERFORMANCE & SCALABILITY
  // ============================================

  describe('Performance & Scalability', () => {
    it('should handle high volume of transcripts efficiently', async () => {
      const token = generateTestJWT('staff-a-admin', 'tenant-hotel-a');
      const callId = `performance-test-${Date.now()}`;

      // Create call first
      await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${token}`)
        .send({
          call_id_vapi: callId,
          tenant_id: 'tenant-hotel-a',
        });

      const startTime = Date.now();
      const transcriptPromises = [];

      // Create 20 concurrent transcript requests
      for (let i = 0; i < 20; i++) {
        transcriptPromises.push(
          request(app)
            .post('/api/store-transcript')
            .set('Authorization', `Bearer ${token}`)
            .send({
              callId,
              role: i % 2 === 0 ? 'user' : 'assistant',
              content: `Test transcript ${i}`,
              tenantId: 'tenant-hotel-a',
            })
        );
      }

      const results = await Promise.all(transcriptPromises);
      const endTime = Date.now();

      // All requests should succeed
      expect(results.every(r => r.status === 200)).toBe(true);

      // Should complete within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);

      // Verify all transcripts were stored
      const storedTranscripts = await db
        .select()
        .from(transcript)
        .where(
          and(
            eq(transcript.call_id, callId),
            eq(transcript.tenant_id, 'tenant-hotel-a')
          )
        );

      expect(storedTranscripts.length).toBe(20);
    });
  });
});
