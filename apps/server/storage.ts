// ✅ COMPLETED MIGRATION: Now using Prisma only
import { logger } from "@shared/utils/logger";

// ✅ MEMORY LEAK FIX: Use singleton Prisma client instead of creating new instances
import { PrismaConnectionManager } from "@shared/db/PrismaConnectionManager";
const prisma = PrismaConnectionManager.getInstance().getClient();

// ✅ Import missing types from shared/db

// ✅ TYPE CLEANUP: Use Prisma generated types
type Order = any; // Will be replaced by Prisma types
type InsertOrder = any;

// ✅ POSTGRESQL-ONLY TIMESTAMP UTILITIES - Simplified
const convertToPostgreSQLTimestamp = (
  timestamp: number | Date | string | null | undefined,
): Date => {
  if (timestamp === null || timestamp === undefined) {
    return new Date();
  }

  if (typeof timestamp === "number") {
    // Handle both seconds and milliseconds timestamps
    let validTimestamp = timestamp;

    // If timestamp is in seconds (Unix timestamp < 10^10), convert to milliseconds
    if (timestamp < 10000000000) {
      validTimestamp = timestamp * 1000;
    }

    // Validate timestamp range for PostgreSQL
    const minTimestamp = new Date("1970-01-01").getTime();
    const maxTimestamp = new Date("2038-01-19").getTime();

    if (validTimestamp < minTimestamp || validTimestamp > maxTimestamp) {
      logger.warn(
        "⚠️ Timestamp ${timestamp} out of range, using current time",
        "Component",
      );
      return new Date();
    }

    const testDate = new Date(validTimestamp);
    return isNaN(testDate.getTime()) ? new Date() : testDate;
  }

  if (typeof timestamp === "string") {
    const parsed = new Date(timestamp);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  return timestamp instanceof Date ? timestamp : new Date(timestamp);
};

// modify the interface with any CRUD methods
// you might need

export class DatabaseStorage {
  async getUser(id: string): Promise<AuthUserCamelCase | undefined> {
    try {
      // ✅ PRISMA ONLY: Clean implementation
      logger.debug("🔄 [STORAGE] Using Prisma for getUser");
      const user = await prisma.staff.findUnique({
        where: { id },
      });

      return user ? authUserMapper.toFrontend(user) : undefined;
    } catch (error) {
      logger.error("Error getting user:", "Component", error);
      throw new Error("Failed to get user");
    }
  }

  async getUserByUsername(
    username: string,
  ): Promise<AuthUserCamelCase | undefined> {
    try {
      const result = await db
        .select()
        .from(staff)
        .where(eq(staff.username, username));
      return result[0] ? authUserMapper.toFrontend(result[0]) : undefined;
    } catch (error) {
      logger.error("Error getting user by username:", "Component", error);
      throw new Error("Failed to get user by username");
    }
  }

  async createUser(user: InsertStaff): Promise<AuthUserCamelCase> {
    try {
      // ✅ PRISMA ONLY: Clean implementation
      logger.debug("🔄 [STORAGE] Using Prisma for createUser");
      const newUser = await prisma.staff.create({
        data: {
          id: user.id,
          tenant_id: user.tenant_id,
          username: user.username,
          password: user.password,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          permissions: user.permissions,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          is_active: user.is_active,
        },
      });

      return authUserMapper.toFrontend(newUser);
    } catch (error) {
      logger.error("Error creating user:", "Component", error);
      throw new Error("Failed to create user");
    }
  }

  async addTranscript(
    insertTranscript: InsertTranscript | any,
  ): Promise<Transcript> {
    try {
      logger.debug("📝 [PostgreSQL Storage] Adding transcript:", "Component", {
        callId: insertTranscript.callId || insertTranscript.call_id,
        role: insertTranscript.role,
        contentLength: insertTranscript.content?.length,
        originalTimestamp: insertTranscript.timestamp,
        timestampType: typeof insertTranscript.timestamp,
      });

      // ✅ POSTGRESQL-OPTIMIZED: Clean insert with proper timestamp conversion
      const processedTranscript = {
        call_id: insertTranscript.callId || insertTranscript.call_id,
        content: insertTranscript.content,
        role: insertTranscript.role,
        timestamp: convertToPostgreSQLTimestamp(
          insertTranscript.timestamp || Date.now(),
        ), // ✅ PostgreSQL Date object
        tenant_id:
          insertTranscript.tenant_id || insertTranscript.tenantId || "default",
      };

      // Ensure no ID field (let PostgreSQL handle SERIAL)
      delete (processedTranscript as any).id;

      logger.debug(
        "📝 [PostgreSQL Storage] Final transcript for database:",
        "Component",
        {
          ...processedTranscript,
          timestampISO:
            processedTranscript.timestamp instanceof Date
              ? processedTranscript.timestamp.toISOString()
              : "Invalid Date",
          fieldCount: Object.keys(processedTranscript).length,
        },
      );

      // ✅ PRISMA ONLY: Clean transcript insert
      logger.debug("🔄 [STORAGE] Using Prisma for addTranscript");
      const result = await prisma.transcript.create({
        data: {
          call_id: processedTranscript.call_id,
          content: processedTranscript.content,
          role: processedTranscript.role,
          timestamp: processedTranscript.timestamp,
          tenant_id: processedTranscript.tenant_id,
        },
      });

      logger.debug(
        "✅ [PostgreSQL Storage] Transcript added successfully:",
        "Component",
        {
          id: result.id,
          callId: result.call_id,
          timestamp: result.timestamp,
        },
      );

      return result;
    } catch (error) {
      logger.error(
        "❌ [PostgreSQL Storage] Error adding transcript:",
        "Component",
        error,
      );
      logger.error(
        "📋 [PostgreSQL Storage] Input data:",
        "Component",
        insertTranscript,
      );
      throw error;
    }
  }

  async getTranscriptsByCallId(callId: string): Promise<Transcript[]> {
    return await db
      .select()
      .from(transcript)
      .where(eq(transcript.call_id, callId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db
      .insert(request)
      .values({
        ...insertOrder,
        status: "pending",
      })
      .returning();
    return result[0];
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const result = await db
      .select()
      .from(request)
      .where(eq(request.id, parseInt(id)));
    return result.length > 0 ? result[0] : undefined;
  }

  async getOrdersByRoomNumber(roomNumber: string): Promise<Order[]> {
    return await db
      .select()
      .from(request)
      .where(eq(request.room_number, roomNumber));
  }

  async updateOrderStatus(
    id: string,
    status: string,
  ): Promise<Order | undefined> {
    const result = await db
      .update(request)
      .set({ status })
      .where(eq(request.id, parseInt(id)))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async getAllOrders(filter: {
    status?: string;
    roomNumber?: string;
  }): Promise<Order[]> {
    try {
      logger.debug(
        "🔍 [PostgreSQL Storage] getAllOrders called with filter:",
        "Component",
        filter,
      );

      // ✅ PRISMA ONLY: Clean getAllOrders implementation
      logger.debug("🔄 [STORAGE] Using Prisma for getAllOrders");

      const whereConditions: any = {};
      if (filter.status) {
        whereConditions.status = filter.status;
        logger.debug("🔍 Added status filter:", "Component", filter.status);
      }
      if (filter.roomNumber) {
        whereConditions.room_number = filter.roomNumber;
        logger.debug(
          "🔍 Added room number filter:",
          "Component",
          filter.roomNumber,
        );
      }

      const result = await prisma.request.findMany({
        where:
          Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      });
      logger.debug(
        "✅ [PostgreSQL Storage] Query executed successfully, result count:",
        "Component",
        result.length,
      );
      return result;
    } catch (error) {
      logger.error(
        "❌ [PostgreSQL Storage] getAllOrders error:",
        "Component",
        error,
      );
      throw error;
    }
  }

  async deleteAllOrders(): Promise<number> {
    // ✅ PRISMA ONLY: Clean deleteAllOrders implementation
    logger.debug("🔄 [STORAGE] Using Prisma for deleteAllOrders");
    const result = await prisma.request.deleteMany({});
    return result.count;
  }

  async addCallSummary(
    insertCallSummary: InsertCallSummary,
  ): Promise<CallSummary> {
    try {
      logger.debug(
        "📝 [PostgreSQL Storage] Adding call summary:",
        "Component",
        {
          callId: insertCallSummary.call_id,
          content: insertCallSummary.content,
          hasTimestamp: "timestamp" in insertCallSummary,
        },
      );

      // ✅ POSTGRESQL-OPTIMIZED: Clean insert with proper timestamp conversion
      const processedSummary = {
        call_id: insertCallSummary.call_id,
        content: insertCallSummary.content,
        room_number: (insertCallSummary as any).room_number || null,
        duration: (insertCallSummary as any).duration || null,
        // For call_summaries, let database handle timestamp with CURRENT_TIMESTAMP
      };

      logger.debug(
        "📝 [PostgreSQL Storage] Processed summary for database:",
        "Component",
        processedSummary,
      );

      // ✅ PRISMA ONLY: Clean addCallSummary implementation
      logger.debug("🔄 [STORAGE] Using Prisma for addCallSummary");
      const result = await prisma.call_summaries.create({
        data: {
          call_id: processedSummary.call_id,
          content: processedSummary.content,
          room_number: processedSummary.room_number,
          duration: processedSummary.duration,
        },
      });

      logger.debug(
        "✅ [PostgreSQL Storage] Call summary added successfully:",
        "Component",
        {
          id: result.id,
          callId: result.call_id,
        },
      );

      return result;
    } catch (error) {
      logger.error(
        "❌ [PostgreSQL Storage] Error adding call summary:",
        "Component",
        error,
      );
      logger.error(
        "📋 [PostgreSQL Storage] Input data:",
        "Component",
        insertCallSummary,
      );
      throw error;
    }
  }

  async getCallSummaryByCallId(
    callId: string,
  ): Promise<CallSummary | undefined> {
    const result = await db
      .select()
      .from(call_summaries)
      .where(eq(call_summaries.call_id, callId));
    return result.length > 0 ? result[0] : undefined;
  }

  async getRecentCallSummaries(hours: number): Promise<CallSummary[]> {
    try {
      // ✅ POSTGRESQL-OPTIMIZED: Use Date object for timestamp comparison
      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - hours);

      logger.debug(
        "🔍 [PostgreSQL Storage] Getting recent call summaries:",
        "Component",
        {
          hours,
          timestampThreshold: hoursAgo.toISOString(),
        },
      );

      // Query summaries newer than the calculated timestamp (Date comparison)
      return await db
        .select()
        .from(call_summaries)
        .where(gte(call_summaries.timestamp, hoursAgo))
        .orderBy(sql`${call_summaries.timestamp} DESC`);
    } catch (error) {
      logger.error(
        "❌ [PostgreSQL Storage] Error getting recent call summaries:",
        "Component",
        error,
      );
      throw error;
    }
  }

  // ✅ NEW: Add service request to database
  async addServiceRequest(
    serviceRequest: any,
    callId: string,
    tenantId: string,
    summary: string,
  ): Promise<any> {
    try {
      // Extract guest name from summary
      const guestNameMatch = summary.match(
        /Guest's Name.*?:\s*([^\n]+)|Tên khách.*?:\s*([^\n]+)/i,
      );
      const guestName = guestNameMatch
        ? (guestNameMatch[1] || guestNameMatch[2])?.trim()
        : null;

      // Generate order ID
      const orderId = `REQ-${Date.now()}`;

      // Map serviceRequest to Prisma request schema fields
      const requestData = {
        tenant_id: tenantId,
        call_id: callId,
        room: serviceRequest.details?.roomNumber || "N/A",
        order_id: orderId,
        guest_name: guestName || "Guest",
        content: serviceRequest.requestText || "Service request",
        status: "Đã ghi nhận",
        // Prisma: total_amount is Decimal?, convert numeric if present
        total_amount: serviceRequest.details?.amount
          ? parseFloat(
              serviceRequest.details.amount.toString().replace(/[^\d.]/g, ""),
            )
          : null,
        special_instructions: serviceRequest.details?.otherDetails || null,
        order_type: serviceRequest.serviceType || "service-request",
        delivery_time: serviceRequest.details?.time
          ? new Date(serviceRequest.details.time)
          : null,
        // items column is String? → store as JSON string for compatibility
        items: JSON.stringify(serviceRequest.details || {}),
        priority: "medium",
        urgency: "normal",
        created_at: new Date(),
        updated_at: new Date(),
      } as any;

      logger.debug(
        "💾 [DatabaseStorage] Adding service request to database",
        "Component",
        {
          callId,
          tenantId,
          serviceType: serviceRequest.serviceType,
          roomNumber: requestData.room_number,
          guestName: requestData.guest_name,
          orderId,
        },
      );

      // ✅ PRISMA ONLY: Clean addServiceRequest implementation
      logger.debug("🔄 [STORAGE] Using Prisma for addServiceRequest");
      const result = await prisma.request.create({ data: requestData });

      logger.success(
        "✅ [DatabaseStorage] Service request saved successfully",
        "Component",
        {
          requestId: result.id,
          orderId,
          roomNumber: requestData.room_number,
        },
      );

      return result;
    } catch (error) {
      logger.error(
        "❌ [DatabaseStorage] Failed to add service request:",
        "Component",
        error,
      );
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
