import { db, call, transcript, request } from '@shared/db';
import { desc, eq, count, sql } from 'drizzle-orm';

const isPostgres =
  process.env.NODE_ENV === 'production' ||
  process.env.DATABASE_URL?.includes('postgres');

export async function getOverview() {
  try {
    // Get total calls
    const totalCallsResult = await db.select({ count: count() }).from(call);
    const totalCalls = totalCallsResult[0]?.count || 0;

    // Get average call duration
    const avgDurationResult = await db
      .select({
        avg: sql`AVG(${call.duration})`.as('avg'),
      })
      .from(call)
      .where(sql`${call.duration} IS NOT NULL`);
    const averageCallDuration = Math.round(
      Number(avgDurationResult[0]?.avg) || 0
    );

    // Get language distribution
    const languageResult = await db
      .select({
        language: call.language,
        count: count(),
      })
      .from(call)
      .groupBy(call.language);

    const languageDistribution = languageResult.map(
      (row: { language: string | null; count: number }) => ({
        language: row.language || 'unknown',
        count: row.count,
      })
    );

    return {
      totalCalls,
      averageCallDuration,
      languageDistribution,
    };
  } catch (error) {
    console.error('Error in getOverview:', error);
    return {
      totalCalls: 0,
      averageCallDuration: 0,
      languageDistribution: [],
    };
  }
}

export async function getServiceDistribution() {
  try {
    const result = await db
      .select({
        serviceType: call.service_type,
        count: count(),
      })
      .from(call)
      .where(sql`${call.service_type} IS NOT NULL`)
      .groupBy(call.service_type);

    return result.map((row: { serviceType: string | null; count: number }) => ({
      serviceType: row.serviceType || 'unknown',
      count: row.count,
    }));
  } catch (error) {
    console.error('Error in getServiceDistribution:', error);
    return [];
  }
}

export async function getHourlyActivity() {
  try {
    if (isPostgres) {
      // PostgreSQL version
      const result = await db
        .select({
          hour: sql`EXTRACT(HOUR FROM ${call.created_at})`.as('hour'),
          count: count(),
        })
        .from(call)
        .groupBy(sql`EXTRACT(HOUR FROM ${call.created_at})`);

      return result.map((row: { hour: unknown; count: number }) => ({
        hour: Number(row.hour),
        count: row.count,
      }));
    } else {
      // SQLite version
      const result = await db
        .select({
          hour: sql`CAST(strftime('%H', datetime(${call.created_at}, 'unixepoch')) AS INTEGER)`.as(
            'hour'
          ),
          count: count(),
        })
        .from(call)
        .groupBy(
          sql`strftime('%H', datetime(${call.created_at}, 'unixepoch'))`
        );

      return result.map((row: { hour: unknown; count: number }) => ({
        hour: Number(row.hour),
        count: row.count,
      }));
    }
  } catch (error) {
    console.error('Error in getHourlyActivity:', error);
    return [];
  }
}

export async function getLanguageDistribution() {
  try {
    const result = await db
      .select({
        language: call.language,
        count: count(),
      })
      .from(call)
      .groupBy(call.language);

    return result.map((row: { language: string | null; count: number }) => ({
      language: row.language || 'unknown',
      count: row.count,
    }));
  } catch (error) {
    console.error('Error in getLanguageDistribution:', error);
    return [];
  }
}
