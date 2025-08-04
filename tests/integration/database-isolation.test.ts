import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { db } from "@shared/db";
// ✅ MIGRATION: Using Prisma generated types instead of Drizzle
// import { tenants, staff, call, transcript, request } from '@shared/db/schema'; // REMOVED
// TODO: Migrate to Prisma
// import { and, eq } from "drizzle-orm";

// Test data for multiple tenants
const testTenants = [
  {
    id: "tenant-isolation-a",
    hotel_name: "Isolation Test Hotel A",
    subdomain: "isolation-a",
    subscription_plan: "premium",
    subscription_status: "active",
  },
  {
    id: "tenant-isolation-b",
    hotel_name: "Isolation Test Hotel B",
    subdomain: "isolation-b",
    subscription_plan: "basic",
    subscription_status: "active",
  },
];

const testStaffData = [
  {
    id: "staff-isolation-a",
    tenant_id: "tenant-isolation-a",
    username: "staff-a",
    password: "$2b$10$hashedpassword",
    role: "admin",
    is_active: true,
  },
  {
    id: "staff-isolation-b",
    tenant_id: "tenant-isolation-b",
    username: "staff-b",
    password: "$2b$10$hashedpassword",
    role: "manager",
    is_active: true,
  },
];

describe("Database Tenant Isolation Tests", () => {
  beforeAll(async () => {
    // Clean up existing test data
    for (const tenant of testTenants as any[]) {
      await db.delete(transcript).where(eq(transcript.tenant_id, tenant.id));
      await db.delete(call).where(eq(call.tenant_id, tenant.id));
      await db.delete(request).where(eq(request.tenant_id, tenant.id));
      await db.delete(staff).where(eq(staff.tenant_id, tenant.id));
      await db.delete(tenants).where(eq(tenants.id, tenant.id));
    }

    // Seed test data
    await db.insert(tenants).values(testTenants);
    await db.insert(staff).values(testStaffData);
  });

  afterAll(async () => {
    // Clean up test data
    for (const tenant of testTenants as any[]) {
      await db.delete(transcript).where(eq(transcript.tenant_id, tenant.id));
      await db.delete(call).where(eq(call.tenant_id, tenant.id));
      await db.delete(request).where(eq(request.tenant_id, tenant.id));
      await db.delete(staff).where(eq(staff.tenant_id, tenant.id));
      await db.delete(tenants).where(eq(tenants.id, tenant.id));
    }
  });

  describe("Call Data Isolation", () => {
    it("should isolate call records between tenants", async () => {
      // Create calls for both tenants
      const callsA = [
        {
          call_id_vapi: "isolation-call-a1",
          tenant_id: "tenant-isolation-a",
          room_number: "A101",
          language: "en",
          service_type: "room-service",
          start_time: new Date(),
        },
        {
          call_id_vapi: "isolation-call-a2",
          tenant_id: "tenant-isolation-a",
          room_number: "A102",
          language: "vi",
          service_type: "housekeeping",
          start_time: new Date(),
        },
      ];

      const callsB = [
        {
          call_id_vapi: "isolation-call-b1",
          tenant_id: "tenant-isolation-b",
          room_number: "B201",
          language: "en",
          service_type: "concierge",
          start_time: new Date(),
        },
      ];

      await db.insert(call).values(callsA);
      await db.insert(call).values(callsB);

      // Verify tenant A only sees their calls
      const tenantACalls = await db
        .select()
        .from(call)
        .where(eq(call.tenant_id, "tenant-isolation-a"));

      expect(tenantACalls).toHaveLength(2);
      expect(
        tenantACalls.every((c) => c.tenant_id === "tenant-isolation-a"),
      ).toBe(true);
      expect(tenantACalls.map((c) => c.call_id_vapi)).toEqual([
        "isolation-call-a1",
        "isolation-call-a2",
      ]);

      // Verify tenant B only sees their calls
      const tenantBCalls = await db
        .select()
        .from(call)
        .where(eq(call.tenant_id, "tenant-isolation-b"));

      expect(tenantBCalls).toHaveLength(1);
      expect(
        tenantBCalls.every((c) => c.tenant_id === "tenant-isolation-b"),
      ).toBe(true);
      expect(tenantBCalls[0].call_id_vapi).toBe("isolation-call-b1");
    });
  });

  describe("Transcript Data Isolation", () => {
    it("should isolate transcript records between tenants", async () => {
      // Create transcripts for both tenants
      const transcriptsA = [
        {
          call_id: "isolation-call-a1",
          tenant_id: "tenant-isolation-a",
          role: "user",
          content: "Hello from tenant A call 1",
          timestamp: new Date(),
        },
        {
          call_id: "isolation-call-a2",
          tenant_id: "tenant-isolation-a",
          role: "assistant",
          content: "Response from tenant A assistant",
          timestamp: new Date(),
        },
      ];

      const transcriptsB = [
        {
          call_id: "isolation-call-b1",
          tenant_id: "tenant-isolation-b",
          role: "user",
          content: "Hello from tenant B call 1",
          timestamp: new Date(),
        },
      ];

      await db.insert(transcript).values(transcriptsA);
      await db.insert(transcript).values(transcriptsB);

      // Verify tenant A only sees their transcripts
      const tenantATranscripts = await db
        .select()
        .from(transcript)
        .where(eq(transcript.tenant_id, "tenant-isolation-a"));

      expect(tenantATranscripts).toHaveLength(2);
      expect(
        tenantATranscripts.every((t) => t.tenant_id === "tenant-isolation-a"),
      ).toBe(true);

      // Verify tenant B only sees their transcripts
      const tenantBTranscripts = await db
        .select()
        .from(transcript)
        .where(eq(transcript.tenant_id, "tenant-isolation-b"));

      expect(tenantBTranscripts).toHaveLength(1);
      expect(
        tenantBTranscripts.every((t) => t.tenant_id === "tenant-isolation-b"),
      ).toBe(true);

      // Verify no cross-contamination
      expect(
        tenantATranscripts.some((t) => t.content.includes("tenant B")),
      ).toBe(false);
      expect(
        tenantBTranscripts.some((t) => t.content.includes("tenant A")),
      ).toBe(false);
    });
  });

  describe("Request/Order Data Isolation", () => {
    it("should isolate service requests between tenants", async () => {
      // Create requests for both tenants
      const requestsA = [
        {
          tenant_id: "tenant-isolation-a",
          call_id: "isolation-call-a1",
          room_number: "A101",
          request_content: "Room service request from tenant A",
          status: "pending",
          created_at: new Date(),
        },
        {
          tenant_id: "tenant-isolation-a",
          call_id: "isolation-call-a2",
          room_number: "A102",
          request_content: "Housekeeping request from tenant A",
          status: "in-progress",
          created_at: new Date(),
        },
      ];

      const requestsB = [
        {
          tenant_id: "tenant-isolation-b",
          call_id: "isolation-call-b1",
          room_number: "B201",
          request_content: "Concierge request from tenant B",
          status: "pending",
          created_at: new Date(),
        },
      ];

      await db.insert(request).values(requestsA);
      await db.insert(request).values(requestsB);

      // Verify tenant A only sees their requests
      const tenantARequests = await db
        .select()
        .from(request)
        .where(eq(request.tenant_id, "tenant-isolation-a"));

      expect(tenantARequests).toHaveLength(2);
      expect(
        tenantARequests.every((r) => r.tenant_id === "tenant-isolation-a"),
      ).toBe(true);

      // Verify tenant B only sees their requests
      const tenantBRequests = await db
        .select()
        .from(request)
        .where(eq(request.tenant_id, "tenant-isolation-b"));

      expect(tenantBRequests).toHaveLength(1);
      expect(
        tenantBRequests.every((r) => r.tenant_id === "tenant-isolation-b"),
      ).toBe(true);

      // Verify content isolation
      expect(
        tenantARequests.every((r) => r.request_content?.includes("tenant A")),
      ).toBe(true);
      expect(
        tenantBRequests.every((r) => r.request_content?.includes("tenant B")),
      ).toBe(true);
    });
  });

  describe("Staff Data Isolation", () => {
    it("should isolate staff records between tenants", async () => {
      // Verify tenant A only sees their staff
      const tenantAStaff = await db
        .select()
        .from(staff)
        .where(eq(staff.tenant_id, "tenant-isolation-a"));

      expect(tenantAStaff).toHaveLength(1);
      expect(tenantAStaff[0].username).toBe("staff-a");
      expect(tenantAStaff[0].tenant_id).toBe("tenant-isolation-a");

      // Verify tenant B only sees their staff
      const tenantBStaff = await db
        .select()
        .from(staff)
        .where(eq(staff.tenant_id, "tenant-isolation-b"));

      expect(tenantBStaff).toHaveLength(1);
      expect(tenantBStaff[0].username).toBe("staff-b");
      expect(tenantBStaff[0].tenant_id).toBe("tenant-isolation-b");
    });
  });

  describe("Cross-Tenant Data Access Prevention", () => {
    it("should prevent access to other tenant data via complex queries", async () => {
      // Attempt to access cross-tenant data using JOIN
      const crossTenantQuery = await db
        .select({
          callId: call.call_id_vapi,
          transcriptContent: transcript.content,
          tenantName: tenants.hotel_name,
        })
        .from(call)
        .leftJoin(transcript, eq(call.call_id_vapi, transcript.call_id))
        .leftJoin(tenants, eq(call.tenant_id, tenants.id))
        .where(
          and(
            eq(call.tenant_id, "tenant-isolation-a"),
            eq(tenants.id, "tenant-isolation-a"),
          ),
        );

      // Should only return tenant A data
      expect(
        crossTenantQuery.every(
          (row) => row.tenantName === "Isolation Test Hotel A",
        ),
      ).toBe(true);

      // Verify no tenant B data leaks through
      expect(
        crossTenantQuery.some(
          (row) => row.tenantName === "Isolation Test Hotel B",
        ),
      ).toBe(false);
    });

    it("should handle concurrent tenant operations safely", async () => {
      // Simulate concurrent operations from different tenants
      const concurrentOperations = [
        // Tenant A operations
        db.insert(call).values({
          call_id_vapi: "concurrent-a",
          tenant_id: "tenant-isolation-a",
          room_number: "A999",
          start_time: new Date(),
        }),
        db.insert(transcript).values({
          call_id: "concurrent-a",
          tenant_id: "tenant-isolation-a",
          role: "user",
          content: "Concurrent operation A",
          timestamp: new Date(),
        }),
        // Tenant B operations
        db.insert(call).values({
          call_id_vapi: "concurrent-b",
          tenant_id: "tenant-isolation-b",
          room_number: "B999",
          start_time: new Date(),
        }),
        db.insert(transcript).values({
          call_id: "concurrent-b",
          tenant_id: "tenant-isolation-b",
          role: "user",
          content: "Concurrent operation B",
          timestamp: new Date(),
        }),
      ];

      // Execute concurrent operations
      await Promise.all(concurrentOperations);

      // Verify data integrity maintained
      const tenantAData = await db
        .select()
        .from(transcript)
        .where(
          and(
            eq(transcript.tenant_id, "tenant-isolation-a"),
            eq(transcript.call_id, "concurrent-a"),
          ),
        );

      const tenantBData = await db
        .select()
        .from(transcript)
        .where(
          and(
            eq(transcript.tenant_id, "tenant-isolation-b"),
            eq(transcript.call_id, "concurrent-b"),
          ),
        );

      expect(tenantAData).toHaveLength(1);
      expect(tenantBData).toHaveLength(1);
      expect(tenantAData[0].content).toBe("Concurrent operation A");
      expect(tenantBData[0].content).toBe("Concurrent operation B");
    });
  });

  describe("Performance with Large Dataset", () => {
    it("should maintain isolation performance with large datasets", async () => {
      const startTime = Date.now();

      // Create large dataset for tenant A
      const largeBatchA = Array.from({ length: 100 }, (_, i) => ({
        call_id_vapi: `perf-test-a-${i}`,
        tenant_id: "tenant-isolation-a",
        room_number: `A${i}`,
        start_time: new Date(),
      }));

      // Create large dataset for tenant B
      const largeBatchB = Array.from({ length: 100 }, (_, i) => ({
        call_id_vapi: `perf-test-b-${i}`,
        tenant_id: "tenant-isolation-b",
        room_number: `B${i}`,
        start_time: new Date(),
      }));

      await db.insert(call).values(largeBatchA);
      await db.insert(call).values(largeBatchB);

      // Query tenant A data (should only return tenant A records)
      const tenantAResults = await db
        .select()
        .from(call)
        .where(eq(call.tenant_id, "tenant-isolation-a"));

      const endTime = Date.now();

      // Verify results
      expect(tenantAResults.length).toBeGreaterThan(100); // Including previous test data
      expect(
        tenantAResults.every((c) => c.tenant_id === "tenant-isolation-a"),
      ).toBe(true);

      // Performance check (should complete within 2 seconds)
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
