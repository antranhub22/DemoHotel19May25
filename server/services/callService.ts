import { storage } from '../storage';
import { insertTranscriptSchema } from '@shared/schema';
import { db } from '../../src/db';
import { call, transcript } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

export class CallService {
  /**
   * Get transcripts by call ID
   */
  static async getTranscriptsByCallId(callId: string): Promise<any[]> {
    try {
      return await storage.getTranscriptsByCallId(callId);
    } catch (error) {
      console.error('Error getting transcripts:', error);
      throw new Error('Failed to retrieve transcripts');
    }
  }

  /**
   * Update call duration when call ends
   */
  static async updateCallDuration(callId: string, duration: number): Promise<void> {
    try {
      if (!callId) {
        throw new Error('Call ID is required');
      }
      
      await db
        .update(call)
        .set({ 
          duration: duration || 0,
          endTime: new Date()
        })
        .where(eq(call.callIdVapi, callId));
      
      console.log(`Updated call duration for ${callId}: ${duration} seconds`);
    } catch (error) {
      console.error('Error updating call duration:', error);
      throw new Error('Failed to update call duration');
    }
  }

  /**
   * Store test transcript
   */
  static async storeTestTranscript(callId: string, role: string, content: string): Promise<any> {
    try {
      if (!callId || !role || !content) {
        throw new Error('Call ID, role, and content are required');
      }
      
      // Validate transcript data
      const validatedData = insertTranscriptSchema.parse({
        callId,
        role,
        content
      });
      
      // Auto-create call record if it doesn't exist
      await this.ensureCallRecordExists(callId, content);
      
      // Store transcript in database
      await storage.addTranscript(validatedData);
      
      console.log(`Test transcript stored for call ${callId}: ${role} - ${content.substring(0, 100)}...`);
      
      return {
        success: true,
        message: 'Test transcript stored successfully',
        transcript: validatedData
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Zod')) {
        throw new Error(`Invalid transcript data: ${error.message}`);
      }
      console.error('Error storing test transcript:', error);
      throw new Error('Failed to store test transcript');
    }
  }

  /**
   * Ensure call record exists, create if not
   */
  private static async ensureCallRecordExists(callId: string, content: string): Promise<void> {
    try {
      const existingCall = await db
        .select()
        .from(call)
        .where(eq(call.callIdVapi, callId))
        .limit(1);
      
      if (existingCall.length === 0) {
        // Extract room number from content if possible
        const roomMatch = content.match(/room (\d+)/i) || content.match(/phòng (\d+)/i);
        const roomNumber = roomMatch ? roomMatch[1] : null;
        
        // Determine language from content
        const language = this.detectLanguage(content);
        
        await db.insert(call).values({
          callIdVapi: callId,
          roomNumber: roomNumber,
          duration: 0,
          language: language,
          createdAt: new Date()
        });
        
        console.log(`Auto-created call record for ${callId} with room ${roomNumber || 'unknown'} and language ${language}`);
      }
    } catch (callError) {
      console.error('Error creating call record:', callError);
      // Don't throw error, just log it
    }
  }

  /**
   * Detect language from content
   */
  private static detectLanguage(content: string): string {
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(content);
    const hasFrench = /[àâäéèêëîïôöùûüÿç]/.test(content) && !hasVietnamese;
    
    if (hasVietnamese) return 'vi';
    if (hasFrench) return 'fr';
    return 'en';
  }

  /**
   * Get call statistics
   */
  static async getCallStatistics(): Promise<any> {
    try {
      const totalCalls = await db.select().from(call);
      const totalTranscripts = await db.select().from(transcript);
      
      return {
        totalCalls: totalCalls.length,
        totalTranscripts: totalTranscripts.length,
        averageDuration: totalCalls.length > 0 
          ? totalCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / totalCalls.length 
          : 0
      };
    } catch (error) {
      console.error('Error getting call statistics:', error);
      throw new Error('Failed to get call statistics');
    }
  }
} 