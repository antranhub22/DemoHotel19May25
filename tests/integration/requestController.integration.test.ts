import { app } from "@server/app";
import { getDatabase } from "@shared/db";
// ✅ MIGRATION: Using Prisma generated types instead of Drizzle
// import { request as requestTable } from '@shared/db/schema'; // REMOVED
// TODO: Migrate to Prisma
// import { eq } from "drizzle-orm";
import request from "supertest";

describe("RequestController Integration Tests", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDatabase();
  });

  beforeEach(async () => {
    // Clean up test data
    if (db) {
      await db.delete(requestTable);
    }
  });

  afterAll(async () => {
    // Clean up after all tests
    if (db) {
      await db.delete(requestTable);
    }
  });

  describe("POST /api/request", () => {
    it("should create a new request successfully", async () => {
      const requestData = {
        serviceType: "room_service",
        requestText: "Test room service request",
        roomNumber: "101",
        guestName: "John Doe",
        priority: "medium",
        tenantId: "test-tenant",
      };

      const response = await request(app)
        .post("/api/request")
        .send(requestData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          room_number: "101",
          request_content: "Test room service request",
          guest_name: "John Doe",
          priority: "medium",
          status: "pending",
        }),
        _metadata: expect.objectContaining({
          module: "request-module",
          version: "2.0.0",
          architecture: "modular-enhanced",
        }),
      });

      // Verify data was actually saved to database
      const savedRequest = await db
        .select()
        .from(requestTable)
        .where(eq(requestTable.room_number, "101"))
        .limit(1);

      expect(savedRequest).toHaveLength(1);
      expect(savedRequest[0]).toMatchObject({
        room_number: "101",
        request_content: "Test room service request",
        guest_name: "John Doe",
        priority: "medium",
        status: "pending",
      });
    });

    it("should handle missing required fields", async () => {
      const requestData = {
        serviceType: "room_service",
        // Missing requestText and roomNumber
        guestName: "John Doe",
      };

      const response = await request(app)
        .post("/api/request")
        .send(requestData)
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: "Failed to create request",
      });
    });

    it("should handle database connection errors gracefully", async () => {
      // This test would require mocking database connection failure
      // For now, we'll test the error handling structure
      const requestData = {
        serviceType: "room_service",
        requestText: "Test request",
        roomNumber: "101",
        guestName: "John Doe",
      };

      // Mock database failure by temporarily breaking the connection
      const originalGetDatabase = getDatabase;
      jest.doMock("@shared/db", () => ({
        getDatabase: jest
          .fn()
          .mockRejectedValue(new Error("Database connection failed")),
      }));

      const response = await request(app)
        .post("/api/request")
        .send(requestData)
        .expect(503);

      expect(response.body).toMatchObject({
        success: false,
        error: "Database temporarily unavailable. Please try again.",
        code: "DATABASE_UNAVAILABLE",
      });

      // Restore original function
      jest.doMock("@shared/db", () => ({
        getDatabase: originalGetDatabase,
      }));
    });
  });

  describe("GET /api/request", () => {
    beforeEach(async () => {
      // Insert test data
      await db.insert(requestTable).values([
        {
          tenant_id: "test-tenant",
          room_number: "101",
          request_content: "Test request 1",
          guest_name: "John Doe",
          priority: "medium",
          status: "pending",
          created_at: new Date(),
        },
        {
          tenant_id: "test-tenant",
          room_number: "102",
          request_content: "Test request 2",
          guest_name: "Jane Smith",
          priority: "high",
          status: "completed",
          created_at: new Date(),
        },
      ]);
    });

    it("should fetch all requests successfully", async () => {
      const response = await request(app).get("/api/request").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            room_number: "101",
            request_content: "Test request 1",
            guest_name: "John Doe",
            status: "pending",
          }),
          expect.objectContaining({
            room_number: "102",
            request_content: "Test request 2",
            guest_name: "Jane Smith",
            status: "completed",
          }),
        ]),
      });

      expect(response.body.data).toHaveLength(2);
    });

    it("should handle empty results gracefully", async () => {
      // Clear all data
      await db.delete(requestTable);

      const response = await request(app).get("/api/request").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: [],
      });
    });
  });

  describe("GET /api/request/:id", () => {
    let testRequestId: number;

    beforeEach(async () => {
      // Insert test data
      const result = await db
        .insert(requestTable)
        .values({
          tenant_id: "test-tenant",
          room_number: "101",
          request_content: "Test request for ID lookup",
          guest_name: "John Doe",
          priority: "medium",
          status: "pending",
          created_at: new Date(),
        })
        .returning();

      testRequestId = result[0].id;
    });

    it("should fetch request by ID successfully", async () => {
      const response = await request(app)
        .get(`/api/request/${testRequestId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: testRequestId,
          room_number: "101",
          request_content: "Test request for ID lookup",
          guest_name: "John Doe",
          status: "pending",
        }),
      });
    });

    it("should return 404 for non-existent request", async () => {
      const response = await request(app).get("/api/request/99999").expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: "Request not found",
        code: "REQUEST_NOT_FOUND",
      });
    });

    it("should handle invalid ID format", async () => {
      const response = await request(app)
        .get("/api/request/invalid-id")
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: "Failed to get request",
      });
    });
  });

  describe("PATCH /api/request/:id/status", () => {
    let testRequestId: number;

    beforeEach(async () => {
      // Insert test data
      const result = await db
        .insert(requestTable)
        .values({
          tenant_id: "test-tenant",
          room_number: "101",
          request_content: "Test request for status update",
          guest_name: "John Doe",
          priority: "medium",
          status: "pending",
          created_at: new Date(),
        })
        .returning();

      testRequestId = result[0].id;
    });

    it("should update request status successfully", async () => {
      const response = await request(app)
        .patch(`/api/request/${testRequestId}/status`)
        .send({ status: "completed" })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: testRequestId,
          status: "completed",
        }),
      });

      // Verify database was updated
      const updatedRequest = await db
        .select()
        .from(requestTable)
        .where(eq(requestTable.id, testRequestId))
        .limit(1);

      expect(updatedRequest[0].status).toBe("completed");
    });

    it("should return 400 for missing status", async () => {
      const response = await request(app)
        .patch(`/api/request/${testRequestId}/status`)
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: "Status is required",
        code: "VALIDATION_ERROR",
      });
    });

    it("should return 404 for non-existent request", async () => {
      const response = await request(app)
        .patch("/api/request/99999/status")
        .send({ status: "completed" })
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: "Request not found",
        code: "REQUEST_NOT_FOUND",
      });
    });

    it("should handle invalid status values", async () => {
      const response = await request(app)
        .patch(`/api/request/${testRequestId}/status`)
        .send({ status: "invalid-status" })
        .expect(200); // Currently accepts any status, should be validated

      // This test reveals that status validation is missing
      // Should be added in the refactor
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed JSON gracefully", async () => {
      const response = await request(app)
        .post("/api/request")
        .set("Content-Type", "application/json")
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining("JSON"),
      });
    });

    it("should handle large payloads appropriately", async () => {
      const largePayload = {
        serviceType: "room_service",
        requestText: "A".repeat(10000), // Very large text
        roomNumber: "101",
        guestName: "John Doe",
      };

      const response = await request(app)
        .post("/api/request")
        .send(largePayload)
        .expect(500); // Should be handled gracefully

      expect(response.body).toMatchObject({
        success: false,
        error: "Failed to create request",
      });
    });
  });

  describe("Performance Tests", () => {
    it("should handle concurrent requests", async () => {
      const concurrentRequests = Array.from({ length: 10 }, (_, i) => ({
        serviceType: "room_service",
        requestText: `Concurrent request ${i}`,
        roomNumber: `10${i}`,
        guestName: `Guest ${i}`,
        priority: "medium",
      }));

      const promises = concurrentRequests.map((data) =>
        request(app).post("/api/request").send(data).expect(201),
      );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });

    it("should handle bulk status updates efficiently", async () => {
      // Create multiple requests
      const requests = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          db
            .insert(requestTable)
            .values({
              tenant_id: "test-tenant",
              room_number: `10${i}`,
              request_content: `Bulk test request ${i}`,
              guest_name: `Guest ${i}`,
              priority: "medium",
              status: "pending",
              created_at: new Date(),
            })
            .returning(),
        ),
      );

      const requestIds = requests.map((r) => r[0].id);

      // Update all requests concurrently
      const updatePromises = requestIds.map((id) =>
        request(app)
          .patch(`/api/request/${id}/status`)
          .send({ status: "completed" })
          .expect(200),
      );

      const updateResponses = await Promise.all(updatePromises);

      updateResponses.forEach((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe("completed");
      });
    });
  });
});
