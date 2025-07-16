import { staff, type Staff, type InsertStaff, transcript, type Transcript, type InsertTranscript, request, callSummaries, type CallSummary, type InsertCallSummary } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, sql } from "drizzle-orm";

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
    // Fix field mapping: Support both API format (callId) and database format (call_id)
    const dbTranscript = {
      call_id: insertTranscript.callId || insertTranscript.call_id,
      content: insertTranscript.content,
      role: insertTranscript.role,
      timestamp: insertTranscript.timestamp || Date.now(),
      tenant_id: insertTranscript.tenantId || insertTranscript.tenant_id || 'default'
    };
    
    console.log('Inserting transcript into database:', dbTranscript);
    const result = await db.insert(transcript).values(dbTranscript).returning();
    return result[0];
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
    const result = await db.insert(callSummaries).values(insertCallSummary).returning();
    return result[0];
  }
  
  async getCallSummaryByCallId(callId: string): Promise<CallSummary | undefined> {
    const result = await db.select().from(callSummaries).where(eq(callSummaries.call_id, callId));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getRecentCallSummaries(hours: number): Promise<CallSummary[]> {
    // Calculate the timestamp from 'hours' ago
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);
    
    // Query summaries newer than the calculated timestamp
    return await db.select()
      .from(callSummaries)
      .where(gte(callSummaries.timestamp, hoursAgo.toISOString()))
      .orderBy(sql`${callSummaries.timestamp} DESC`);
  }
}

export const storage = new DatabaseStorage();
