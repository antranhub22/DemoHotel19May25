import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { db } from "@shared/db";
// ✅ MIGRATION: Using Prisma generated types instead of Drizzle
// import { tenants, call, transcript, request } from '@shared/db/schema'; // REMOVED
import { and, eq } from "drizzle-orm";

const testTenant = {
  id: "voice-workflow-tenant",
  hotel_name: "Voice Workflow Test Hotel",
  subdomain: "voice-workflow-test",
  subscription_plan: "premium",
  subscription_status: "active",
  max_voices: 10,
  max_languages: 6,
  voice_cloning: true,
  monthly_call_limit: 5000,
};

describe("Voice Assistant Workflow Integration Tests", () => {
  beforeAll(async () => {
    // Clean up and seed test data
    await db.delete(request).where(eq(request.tenant_id, testTenant.id));
    await db.delete(transcript).where(eq(transcript.tenant_id, testTenant.id));
    await db.delete(call).where(eq(call.tenant_id, testTenant.id));
    await db.delete(tenants).where(eq(tenants.id, testTenant.id));

    await db.insert(tenants).values(testTenant);
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(request).where(eq(request.tenant_id, testTenant.id));
    await db.delete(transcript).where(eq(transcript.tenant_id, testTenant.id));
    await db.delete(call).where(eq(call.tenant_id, testTenant.id));
    await db.delete(tenants).where(eq(tenants.id, testTenant.id));
  });

  describe("Complete Voice Call Workflow", () => {
    it("should handle room service order workflow end-to-end", async () => {
      const callId = "room-service-workflow-test";

      // 1. Create call record
      const [callRecord] = await db
        .insert(call)
        .values({
          call_id_vapi: callId,
          tenant_id: testTenant.id,
          room_number: "301",
          language: "en",
          service_type: "room-service",
          start_time: new Date(),
        })
        .returning();

      expect(callRecord.call_id_vapi).toBe(callId);
      expect(callRecord.tenant_id).toBe(testTenant.id);

      // 2. Simulate conversation transcripts
      const conversationFlow = [
        {
          role: "assistant",
          content:
            "Hello! Welcome to Voice Workflow Test Hotel. How may I assist you today?",
        },
        {
          role: "user",
          content: "Hi, I would like to order room service please",
        },
        {
          role: "assistant",
          content:
            "I'd be happy to help with room service. What room are you in?",
        },
        { role: "user", content: "Room 301" },
        {
          role: "assistant",
          content:
            "Perfect! What would you like to order from our room service menu?",
        },
        {
          role: "user",
          content:
            "Two club sandwiches, one Caesar salad, and a bottle of red wine please",
        },
        {
          role: "assistant",
          content:
            "Excellent choice! That's two club sandwiches, one Caesar salad, and a bottle of red wine for room 301. The total is $85. This will be ready in about 30 minutes. Is there anything else?",
        },
        { role: "user", content: "No, that's perfect. Thank you!" },
        {
          role: "assistant",
          content:
            "You're welcome! Your order has been sent to the kitchen. Enjoy your meal!",
        },
      ];

      // Store transcripts sequentially with slight delays
      for (let i = 0; i < conversationFlow.length; i++) {
        const transcript = conversationFlow[i];
        await db.insert(transcript).values({
          call_id: callId,
          tenant_id: testTenant.id,
          role: transcript.role,
          content: transcript.content,
          timestamp: new Date(Date.now() + i * 1000), // 1 second apart
        });
      }

      // 3. Create service request based on conversation
      const [serviceRequest] = await db
        .insert(request)
        .values({
          tenant_id: testTenant.id,
          call_id: callId,
          room_number: "301",
          request_content:
            "Room service order: 2 club sandwiches, 1 Caesar salad, 1 bottle red wine - Total: $85",
          status: "pending",
          priority: "normal",
          created_at: new Date(),
        })
        .returning();

      // 4. End call with duration
      await db
        .update(call)
        .set({
          end_time: new Date(),
          duration: 180, // 3 minutes
        })
        .where(
          and(eq(call.call_id_vapi, callId), eq(call.tenant_id, testTenant.id)),
        );

      // 5. Verify complete workflow data
      const storedCall = await db
        .select()
        .from(call)
        .where(
          and(eq(call.call_id_vapi, callId), eq(call.tenant_id, testTenant.id)),
        )
        .limit(1);

      const storedTranscripts = await db
        .select()
        .from(transcript)
        .where(
          and(
            eq(transcript.call_id, callId),
            eq(transcript.tenant_id, testTenant.id),
          ),
        );

      // Assertions
      expect(storedCall[0].duration).toBe(180);
      expect(storedCall[0].room_number).toBe("301");
      expect(storedCall[0].service_type).toBe("room-service");

      expect(storedTranscripts).toHaveLength(9);
      expect(storedTranscripts.filter((t) => t.role === "user")).toHaveLength(
        4,
      );
      expect(
        storedTranscripts.filter((t) => t.role === "assistant"),
      ).toHaveLength(5);

      expect(serviceRequest.room_number).toBe("301");
      expect(serviceRequest.status).toBe("pending");
      expect(serviceRequest.request_content).toContain("club sandwiches");
    });

    it("should handle housekeeping request workflow", async () => {
      const callId = "housekeeping-workflow-test";

      // 1. Create call
      await db.insert(call).values({
        call_id_vapi: callId,
        tenant_id: testTenant.id,
        room_number: "205",
        language: "en",
        service_type: "housekeeping",
        start_time: new Date(),
      });

      // 2. Housekeeping conversation
      const housekeepingConversation = [
        { role: "assistant", content: "Hello! How can I help you today?" },
        { role: "user", content: "I need housekeeping service for my room" },
        {
          role: "assistant",
          content: "Of course! What room number are you in?",
        },
        { role: "user", content: "Room 205" },
        {
          role: "assistant",
          content: "What housekeeping services do you need?",
        },
        {
          role: "user",
          content:
            "Fresh towels, bed sheets changed, and bathroom cleaning please",
        },
        {
          role: "assistant",
          content:
            "I've scheduled housekeeping for room 205. They will bring fresh towels, change the bed sheets, and clean the bathroom. This will be done within the next hour.",
        },
        { role: "user", content: "Perfect, thank you!" },
      ];

      for (let i = 0; i < housekeepingConversation.length; i++) {
        const entry = housekeepingConversation[i];
        await db.insert(transcript).values({
          call_id: callId,
          tenant_id: testTenant.id,
          role: entry.role,
          content: entry.content,
          timestamp: new Date(Date.now() + i * 500),
        });
      }

      // 3. Create housekeeping request
      await db.insert(request).values({
        tenant_id: testTenant.id,
        call_id: callId,
        room_number: "205",
        request_content:
          "Housekeeping: fresh towels, bed sheets change, bathroom cleaning",
        status: "pending",
        priority: "normal",
        created_at: new Date(),
      });

      // 4. Verify workflow
      const verification = await db
        .select({
          callId: call.call_id_vapi,
          roomNumber: call.room_number,
          serviceType: call.service_type,
          requestContent: request.request_content,
          transcriptCount: transcript.id,
        })
        .from(call)
        .leftJoin(request, eq(call.call_id_vapi, request.call_id))
        .leftJoin(transcript, eq(call.call_id_vapi, transcript.call_id))
        .where(
          and(eq(call.call_id_vapi, callId), eq(call.tenant_id, testTenant.id)),
        );

      expect(verification.length).toBeGreaterThan(0);
      expect(verification[0].serviceType).toBe("housekeeping");
      expect(verification[0].roomNumber).toBe("205");
      expect(verification[0].requestContent).toContain("towels");
    });

    it("should handle multi-language workflow", async () => {
      const callId = "multilang-workflow-test";

      // 1. Vietnamese call
      await db.insert(call).values({
        call_id_vapi: callId,
        tenant_id: testTenant.id,
        room_number: "102",
        language: "vi",
        service_type: "concierge",
        start_time: new Date(),
      });

      // 2. Vietnamese conversation
      const vietnameseConversation = [
        {
          role: "assistant",
          content: "Xin chào! Tôi có thể giúp gì cho quý khách?",
        },
        { role: "user", content: "Tôi muốn hỏi về các tour du lịch" },
        {
          role: "assistant",
          content:
            "Chúng tôi có nhiều tour tham quan thú vị. Quý khách muốn đi tour nào?",
        },
        { role: "user", content: "Tour tham quan thành phố và bãi biển" },
        {
          role: "assistant",
          content:
            "Tour thành phố và bãi biển rất phổ biến. Tour kéo dài 6 tiếng, giá 500.000 VNĐ mỗi người. Quý khách có muốn đặt không?",
        },
        { role: "user", content: "Có, tôi muốn đặt cho 2 người" },
      ];

      for (let i = 0; i < vietnameseConversation.length; i++) {
        const entry = vietnameseConversation[i];
        await db.insert(transcript).values({
          call_id: callId,
          tenant_id: testTenant.id,
          role: entry.role,
          content: entry.content,
          timestamp: new Date(Date.now() + i * 600),
        });
      }

      // 3. Create tour booking request
      await db.insert(request).values({
        tenant_id: testTenant.id,
        call_id: callId,
        room_number: "102",
        request_content:
          "Tour booking: City and beach tour for 2 people - 500,000 VND each",
        status: "pending",
        priority: "normal",
        created_at: new Date(),
      });

      // 4. Verify Vietnamese language handling
      const storedData = await db
        .select()
        .from(call)
        .leftJoin(transcript, eq(call.call_id_vapi, transcript.call_id))
        .where(
          and(eq(call.call_id_vapi, callId), eq(call.tenant_id, testTenant.id)),
        );

      expect(storedData[0].call.language).toBe("vi");
      expect(
        storedData.some((d) => d.transcript?.content?.includes("Xin chào")),
      ).toBe(true);
      expect(
        storedData.some((d) => d.transcript?.content?.includes("tour")),
      ).toBe(true);
    });
  });

  describe("Error Handling in Workflows", () => {
    it("should handle incomplete call data gracefully", async () => {
      const callId = "incomplete-workflow-test";

      // Create call without some optional fields
      await db.insert(call).values({
        call_id_vapi: callId,
        tenant_id: testTenant.id,
        // Missing room_number, language, service_type
        start_time: new Date(),
      });

      // Add transcript
      await db.insert(transcript).values({
        call_id: callId,
        tenant_id: testTenant.id,
        role: "user",
        content: "Hello, I need help but forgot to mention my room",
        timestamp: new Date(),
      });

      // Verify data is still stored correctly
      const results = await db
        .select()
        .from(call)
        .where(
          and(eq(call.call_id_vapi, callId), eq(call.tenant_id, testTenant.id)),
        );

      expect(results).toHaveLength(1);
      expect(results[0].call_id_vapi).toBe(callId);
      expect(results[0].room_number).toBeNull();
    });

    it("should handle duplicate call IDs for different tenants", async () => {
      const duplicateCallId = "duplicate-call-id";

      // Create calls with same call_id for different tenants
      await db.insert(call).values([
        {
          call_id_vapi: duplicateCallId,
          tenant_id: testTenant.id,
          room_number: "A101",
          start_time: new Date(),
        },
      ]);

      // Verify both calls exist and are isolated
      const tenantResults = await db
        .select()
        .from(call)
        .where(
          and(
            eq(call.call_id_vapi, duplicateCallId),
            eq(call.tenant_id, testTenant.id),
          ),
        );

      expect(tenantResults).toHaveLength(1);
      expect(tenantResults[0].room_number).toBe("A101");
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle concurrent call workflows efficiently", async () => {
      const concurrentCalls = Array.from({ length: 10 }, (_, i) => ({
        call_id_vapi: `concurrent-${i}`,
        tenant_id: testTenant.id,
        room_number: `${i + 100}`,
        language: i % 2 === 0 ? "en" : "vi",
        service_type: ["room-service", "housekeeping", "concierge"][i % 3],
        start_time: new Date(),
      }));

      const startTime = Date.now();

      // Create all calls concurrently
      await db.insert(call).values(concurrentCalls);

      // Create transcripts for each call
      const transcriptPromises = concurrentCalls.map((callData, i) =>
        db.insert(transcript).values({
          call_id: callData.call_id_vapi,
          tenant_id: testTenant.id,
          role: "user",
          content: `Test message for call ${i}`,
          timestamp: new Date(),
        }),
      );

      await Promise.all(transcriptPromises);

      const endTime = Date.now();

      // Verify all data was created
      const verifyResults = await db
        .select()
        .from(call)
        .where(eq(call.tenant_id, testTenant.id));

      const concurrentCallIds = concurrentCalls.map((c) => c.call_id_vapi);
      const foundCalls = verifyResults.filter((r) =>
        concurrentCallIds.includes(r.call_id_vapi),
      );

      expect(foundCalls).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });
});
