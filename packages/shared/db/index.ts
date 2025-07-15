// Database connection and schema exports
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { tenants, hotelProfiles, staff, call, transcript, request, message, call_summaries } from './schema';

// Create database connection
const sqlite = new Database('dev.db');
export const db = drizzle(sqlite, {
  schema: {
    tenants,
    hotelProfiles,
    staff,
    call,
    transcript,
    request,
    message,
    call_summaries,
  },
});

// Re-export schema tables
export {
  tenants,
  hotelProfiles,
  staff,
  call,
  transcript,
  request,
  message,
  call_summaries,
};

// Export database instance as default
export default db;

// ============================================
// Helper Functions
// ============================================

// Convert Date object to SQLite-compatible string
export function dateToString(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString();
}

// Get current timestamp as string
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// Safe number conversion for SQLite
export function toSafeNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
} 