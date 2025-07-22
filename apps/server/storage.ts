import { staff, transcript, request, callSummaries,  } from '@shared/schema';
import { db } from './db';
import { eq, and, gte } from 'drizzle-orm';
import { logger } from '@shared/utils/logger';

// Type aliases for backward compatibility
type Order = typeof request.$inferSelect;
type InsertOrder = typeof request.$inferInsert;

// ✅ POSTGRESQL-ONLY TIMESTAMP UTILITIES - Simplified
const convertToPostgreSQLTimestamp = (
  timestamp: number | Date | string | null | undefined
): Date => {
  if (timestamp === null || timestamp === undefined) {
    return new Date();
  }

  if (typeof timestamp === 'number') {
    // Handle both seconds and milliseconds timestamps
    let validTimestamp = timestamp;

    // If timestamp is in seconds (Unix timestamp < 10^10), convert to milliseconds
    if (timestamp < 10000000000) {
      validTimestamp = timestamp * 1000;
    }

    // Validate timestamp range for PostgreSQL
    const minTimestamp = new Date('1970-01-01').getTime();
    const maxTimestamp = new Date('2038-01-19').getTime();

    if (validTimestamp < minTimestamp || validTimestamp > maxTimestamp) {
      logger.warn('⚠️ Timestamp ${timestamp} out of range, using current time', 'Component');
      return new Date();
    }

    const testDate = new Date(validTimestamp);
    return isNaN(testDate.getTime()) ? new Date() : testDate;
  }

  if (typeof timestamp === 'string') {
    const parsed = new Date(timestamp);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  return timestamp instanceof Date ? timestamp : new Date(timestamp);
};

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<Staff | undefined>;
  getUserByUsername(username: string): Promise<Staff | undefined>;
  createUser(user: InsertStaff): Promise<Staff>;

  // Transcript methods
  addTranscript(transcript: InsertTranscript): Promise<Transcript>;
  getTranscriptsByCallId(callId: string): Promise<Transcript[]>;

  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: string): Promise<Order | undefined>;
  getOrdersByRoomNumber(roomNumber: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  getAllOrders(filter: {
    status?: string;
    roomNumber?: string;
  }): Promise<Order[]>;
  deleteAllOrders(): Promise<number>;

  // Call Summary methods
  addCallSummary(summary: InsertCallSummary): Promise<CallSummary>;
  getCallSummaryByCallId(callId: string): Promise<CallSummary | undefined>;
  getRecentCallSummaries(hours: number): Promise<CallSummary[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<Staff | undefined> {
    try {
      const result = await db.select().from(staff).where(eq(staff.id, id));
      return result[0];
    } catch (error) {
      logger.error('Error getting user:', 'Component', error);
      throw new Error('Failed to get user');
    }
  }

  async getUserByUsername(username: string): Promise<Staff | undefined> {
    try {
      const result = await db
        .select()
        .from(staff)
        .where(eq(staff.username, username));
      return result[0];
    } catch (error) {
      logger.error('Error getting user by username:', 'Component', error);
      throw new Error('Failed to get user by username');
    }
  }

  async createUser(user: InsertStaff): Promise<Staff> {
    try {
      const result = await db.insert(staff).values(user).returning();
      return result[0];
    } catch (error) {
      logger.error('Error creating user:', 'Component', error);
      throw new Error('Failed to create user');
    }
  }

  async addTranscript(
    insertTranscript: InsertTranscript | any
  ): Promise<Transcript> {
    try {
      logger.debug('📝 [PostgreSQL Storage] Adding transcript:', 'Component', {
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
          insertTranscript.timestamp || Date.now()
        ), // ✅ PostgreSQL Date object
        tenant_id:
          insertTranscript.tenant_id || insertTranscript.tenantId || 'default',
      };

      // Ensure no ID field (let PostgreSQL handle SERIAL)
      delete (processedTranscript as any).id;

      logger.debug('📝 [PostgreSQL Storage] Final transcript for database:', 'Component', {
        ...processedTranscript,
        timestampISO:
          processedTranscript.timestamp instanceof Date
            ? processedTranscript.timestamp.toISOString()
            : 'Invalid Date',
        fieldCount: Object.keys(processedTranscript).length,
      });

      // ✅ PostgreSQL-optimized insert
      const result = await db
        .insert(transcript)
        .values(processedTranscript)
        .returning();

      if (result.length === 0) {
        throw new Error('Failed to insert transcript - no result returned');
      }

      logger.debug('✅ [PostgreSQL Storage] Transcript added successfully:', 'Component', {
        id: result[0].id,
        callId: result[0].call_id,
        timestamp: result[0].timestamp,
      });

      return result[0];
    } catch (error) {
      logger.error('❌ [PostgreSQL Storage] Error adding transcript:', 'Component', error);
      logger.error('📋 [PostgreSQL Storage] Input data:', 'Component', insertTranscript);
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
        status: 'pending',
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
    status: string
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
      logger.debug('🔍 [PostgreSQL Storage] getAllOrders called with filter:', 'Component', filter);

      // ✅ POSTGRESQL-OPTIMIZED: Only select existing columns
      let query = db.select().from(request);

      // Build where conditions
      const whereConditions = [];
      if (filter.status) {
        whereConditions.push(eq(request.status, filter.status));
        logger.debug('🔍 Added status filter:', 'Component', filter.status);
      }
      if (filter.roomNumber) {
        whereConditions.push(eq(request.room_number, filter.roomNumber));
        logger.debug('🔍 Added room number filter:', 'Component', filter.roomNumber);
      }

      if (whereConditions.length > 0) {
        query = query.where(
          whereConditions.length === 1
            ? whereConditions[0]
            : and(...whereConditions)
        ) as any;
      }

      const result = (await query) as Order[];
      logger.debug('✅ [PostgreSQL Storage] Query executed successfully, result count:', 'Component', result.length);
      return result;
    } catch (error) {
      logger.error('❌ [PostgreSQL Storage] getAllOrders error:', 'Component', error);
      throw error;
    }
  }

  async deleteAllOrders(): Promise<number> {
    const result = await db.delete(request);
    return result.rowCount || 0;
  }

  async addCallSummary(
    insertCallSummary: InsertCallSummary
  ): Promise<CallSummary> {
    try {
      logger.debug('📝 [PostgreSQL Storage] Adding call summary:', 'Component', {
        callId: insertCallSummary.call_id,
        content: insertCallSummary.content,
        hasTimestamp: 'timestamp' in insertCallSummary,
      });

      // ✅ POSTGRESQL-OPTIMIZED: Clean insert with proper timestamp conversion
      const processedSummary = {
        call_id: insertCallSummary.call_id,
        content: insertCallSummary.content,
        room_number: (insertCallSummary as any).room_number || null,
        duration: (insertCallSummary as any).duration || null,
        // For call_summaries, let database handle timestamp with CURRENT_TIMESTAMP
      };

      logger.debug('📝 [PostgreSQL Storage] Processed summary for database:', 'Component', processedSummary);

      const result = await db
        .insert(callSummaries)
        .values(processedSummary)
        .returning();

      logger.debug('✅ [PostgreSQL Storage] Call summary added successfully:', 'Component', {
        id: result[0].id,
        callId: result[0].call_id,
      });

      return result[0];
    } catch (error) {
      logger.error('❌ [PostgreSQL Storage] Error adding call summary:', 'Component', error);
      logger.error('📋 [PostgreSQL Storage] Input data:', 'Component', insertCallSummary);
      throw error;
    }
  }

  async getCallSummaryByCallId(
    callId: string
  ): Promise<CallSummary | undefined> {
    const result = await db
      .select()
      .from(callSummaries)
      .where(eq(callSummaries.call_id, callId));
    return result.length > 0 ? result[0] : undefined;
  }

  async getRecentCallSummaries(hours: number): Promise<CallSummary[]> {
    try {
      // ✅ POSTGRESQL-OPTIMIZED: Use Date object for timestamp comparison
      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - hours);

      logger.debug('🔍 [PostgreSQL Storage] Getting recent call summaries:', 'Component', {
        hours,
        timestampThreshold: hoursAgo.toISOString(),
      });

      // Query summaries newer than the calculated timestamp (Date comparison)
      return await db
        .select()
        .from(callSummaries)
        .where(gte(callSummaries.timestamp, hoursAgo))
        .orderBy(sql`${callSummaries.timestamp} DESC`);
    } catch (error) {
      logger.error('❌ [PostgreSQL Storage] Error getting recent call summaries:', 'Component', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
