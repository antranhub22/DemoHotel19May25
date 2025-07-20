import { staff, type Staff, type InsertStaff, transcript, type Transcript, type InsertTranscript, request, callSummaries, type CallSummary, type InsertCallSummary } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, sql } from "drizzle-orm";

// ✅ TIMESTAMP CONVERSION UTILITIES
const isPostgreSQL = () => {
  return !!process.env.DATABASE_URL && process.env.NODE_ENV === 'production';
};

const convertTimestamp = (timestamp: number | Date | string | null | undefined): any => {
  if (timestamp === null || timestamp === undefined) {
    return null;
  }
  
  if (isPostgreSQL()) {
    // PostgreSQL: Convert to proper Date object
    if (typeof timestamp === 'number') {
      // Handle both seconds and milliseconds timestamps
      const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
      return new Date(ts);
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  } else {
    // SQLite: Keep as integer (Unix timestamp)
    if (typeof timestamp === 'number') {
      return timestamp;
    }
    if (timestamp instanceof Date) {
      return Math.floor(timestamp.getTime() / 1000);
    }
    if (typeof timestamp === 'string') {
      return Math.floor(new Date(timestamp).getTime() / 1000);
    }
    return Math.floor(Date.now() / 1000);
  }
};

const getCurrentTimestamp = (): any => {
  if (isPostgreSQL()) {
    return new Date();
  } else {
    return Math.floor(Date.now() / 1000);
  }
};

// Type aliases for backward compatibility
type Order = typeof request.$inferSelect;
type InsertOrder = typeof request.$inferInsert;

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
  getAllOrders(filter: { status?: string; roomNumber?: string }): Promise<Order[]>;
  deleteAllOrders(): Promise<number>;
  
  // Call Summary methods
  addCallSummary(summary: InsertCallSummary): Promise<CallSummary>;
  getCallSummaryByCallId(callId: string): Promise<CallSummary | undefined>;
  getRecentCallSummaries(hours: number): Promise<CallSummary[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<Staff | undefined> {
    const result = await db.select().from(staff).where(eq(staff.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<Staff | undefined> {
    const result = await db.select().from(staff).where(eq(staff.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertStaff: InsertStaff): Promise<Staff> {
    const result = await db.insert(staff).values(insertStaff).returning();
    return result[0];
  }
  
  async addTranscript(insertTranscript: InsertTranscript | any): Promise<Transcript> {
    try {
      console.log('📝 [DatabaseStorage] Adding transcript:', {
        callId: insertTranscript.callId || insertTranscript.call_id,
        role: insertTranscript.role,
        contentLength: insertTranscript.content?.length,
        originalTimestamp: insertTranscript.timestamp,
        timestampType: typeof insertTranscript.timestamp
      });

      // ✅ EMERGENCY FIX: Completely remove any ID field and ensure clean insert
      const processedTranscript = {
        call_id: insertTranscript.callId || insertTranscript.call_id,
        content: insertTranscript.content,
        role: insertTranscript.role,
        timestamp: convertTimestamp(insertTranscript.timestamp || Date.now()),
        tenant_id: insertTranscript.tenant_id || insertTranscript.tenantId || 'default'
      };

      // ✅ NUCLEAR OPTION: Remove ALL possible ID variations
      delete (processedTranscript as any).id;
      delete (processedTranscript as any).Id;
      delete (processedTranscript as any).ID;
      delete (processedTranscript as any)._id;

      // ✅ DEBUG: Ensure no ID field leaked through
      if ('id' in processedTranscript) {
        console.error('❌ [DatabaseStorage] ID field detected in transcript data - removing!');
        delete (processedTranscript as any).id;
      }

      console.log('📝 [DatabaseStorage] Final transcript for database (no ID):', {
        ...processedTranscript,
        hasIdField: 'id' in processedTranscript,
        fieldCount: Object.keys(processedTranscript).length
      });

      // ✅ EMERGENCY WORKAROUND: Generate manual ID for broken PostgreSQL table
      const finalTranscript = {
        ...processedTranscript,
        // Generate unique ID if database doesn't auto-increment
        id: Date.now() + Math.floor(Math.random() * 1000)
      };

      const result = await db.insert(transcript).values(finalTranscript).returning();
      
      if (result.length === 0) {
        throw new Error('Failed to insert transcript - no result returned');
      }

      console.log('✅ [DatabaseStorage] Transcript added successfully:', {
        id: result[0].id,
        callId: result[0].call_id,
        timestamp: result[0].timestamp
      });

      return result[0];
    } catch (error) {
      console.error('❌ [DatabaseStorage] Error adding transcript:', error);
      console.error('📋 [DatabaseStorage] Input data:', insertTranscript);
      throw error;
    }
  }
  
  async getTranscriptsByCallId(callId: string): Promise<Transcript[]> {
    return await db.select().from(transcript).where(eq(transcript.call_id, callId));
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db.insert(request).values({
      ...insertOrder,
      status: "pending"
    }).returning();
    return result[0];
  }
  
  async getOrderById(id: string): Promise<Order | undefined> {
    const result = await db.select().from(request).where(eq(request.id, parseInt(id)));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getOrdersByRoomNumber(roomNumber: string): Promise<Order[]> {
    return await db.select().from(request).where(eq(request.room_number, roomNumber));
  }
  
  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await db
      .update(request)
      .set({ status })
      .where(eq(request.id, parseInt(id)))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getAllOrders(filter: { status?: string; roomNumber?: string }): Promise<Order[]> {
    try {
      console.log('🔍 getAllOrders called with filter:', filter);
      console.log('🔍 Database connection status:', db ? 'Connected' : 'Not connected');
      
      let query = db.select({
        id: request.id,
        room_number: request.room_number,
        request_content: request.request_content,
        status: request.status,
        created_at: request.created_at,
        order_id: request.order_id,
        updated_at: request.updated_at,
        tenant_id: request.tenant_id,
        description: request.description,
        priority: request.priority,
        assigned_to: request.assigned_to,
        completed_at: request.completed_at,
        metadata: request.metadata,
        type: request.type,
        total_amount: request.total_amount,
        items: request.items,
        delivery_time: request.delivery_time,
        special_instructions: request.special_instructions,
        order_type: request.order_type
      }).from(request);
      console.log('🔍 Base query created');
      
      // Build where conditions properly
      const whereConditions = [];
      if (filter.status) {
        whereConditions.push(eq(request.status, filter.status));
        console.log('🔍 Added status filter:', filter.status);
      }
      if (filter.roomNumber) {
        whereConditions.push(eq(request.room_number, filter.roomNumber));
        console.log('🔍 Added room number filter:', filter.roomNumber);
      }
      
      if (whereConditions.length > 0) {
        query = query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
        console.log('🔍 Where conditions applied');
      }
      
      console.log('🔍 About to execute query...');
      const result = await query;
      console.log('✅ Query executed successfully, result count:', result.length);
      console.log('✅ First result:', result[0] ? JSON.stringify(result[0], null, 2) : 'No results');
      return result;
    } catch (error) {
      console.error('❌ getAllOrders error details:');
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('❌ Error type:', typeof error);
      console.error('❌ Full error object:', error);
      throw error;
    }
  }
  
  async deleteAllOrders(): Promise<number> {
    const result = await db.delete(request);
    return result.rowCount || 0;
  }
  
  async addCallSummary(insertCallSummary: InsertCallSummary): Promise<CallSummary> {
    try {
      console.log('📝 [DatabaseStorage] Adding call summary:', {
        callId: insertCallSummary.call_id,
        content: insertCallSummary.content,
        hasTimestamp: 'timestamp' in insertCallSummary
      });

      // ✅ FIXED: call_summaries uses text timestamp with CURRENT_TIMESTAMP default
      const processedSummary = {
        call_id: insertCallSummary.call_id,
        content: insertCallSummary.content,
        room_number: (insertCallSummary as any).room_number || null,
        duration: (insertCallSummary as any).duration || null,
        // For call_summaries, let database handle timestamp with CURRENT_TIMESTAMP
      };

      console.log('📝 [DatabaseStorage] Processed summary for database:', processedSummary);

      const result = await db.insert(callSummaries).values(processedSummary).returning();
      
      console.log('✅ [DatabaseStorage] Call summary added successfully:', {
        id: result[0].id,
        callId: result[0].call_id
      });

      return result[0];
    } catch (error) {
      console.error('❌ [DatabaseStorage] Error adding call summary:', error);
      console.error('📋 [DatabaseStorage] Input data:', insertCallSummary);
      throw error;
    }
  }
  
  async getCallSummaryByCallId(callId: string): Promise<CallSummary | undefined> {
    const result = await db.select().from(callSummaries).where(eq(callSummaries.call_id, callId));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getRecentCallSummaries(hours: number): Promise<CallSummary[]> {
    try {
      // ✅ FIXED: call_summaries uses text timestamp in ISO format
      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - hours);
      const timestampThreshold = hoursAgo.toISOString();
      
      console.log('🔍 [DatabaseStorage] Getting recent call summaries:', {
        hours,
        timestampThreshold,
        hoursAgo: hoursAgo.toISOString()
      });

      // Query summaries newer than the calculated timestamp (ISO string comparison)
      return await db.select()
        .from(callSummaries)
        .where(gte(callSummaries.timestamp, timestampThreshold))
        .orderBy(sql`${callSummaries.timestamp} DESC`);
    } catch (error) {
      console.error('❌ [DatabaseStorage] Error getting recent call summaries:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
