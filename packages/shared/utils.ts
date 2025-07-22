import { db } from './db';
import { handlePostgreSQLResult } from './db/transformers';

// ============================================
// Database Utility Functions
// ============================================

// Delete all requests (used by server)
export async function deleteAllRequests() {
  try {
    const result = await db.delete(request);
    return handlePostgreSQLResult(result);
  } catch (error) {
    console.error('Error deleting all requests:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? (error as any)?.message || String(error)
          : 'Unknown error',
    };
  }
}

// Helper to convert Date to string for SQLite
export function dateToString(
  date: Date | string | null | undefined
): string | null {
  if (!date) {
    return null;
  }
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
}

// Get current timestamp as string
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
