import { db } from '../src/db';
import { request, call, transcript } from '../src/db/schema';
import { count, avg, sql } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const useSQLite = !DATABASE_URL && !isProduction;

// 1. Tổng quan hoạt động
export async function getAnalyticsOverview() {
  try {
    const totalCallsResult = await db.select({ value: count() }).from(call);
    const avgDurationResult = await db.select({ value: avg(call.duration) }).from(call);
    
    // Phân bổ ngôn ngữ (Giả sử có cột 'language' trong bảng 'call')
    const languageDistributionResult = await db.select({
      language: call.language,
      count: count()
    }).from(call).groupBy(call.language);

    return {
      totalCalls: totalCallsResult[0]?.value || 0,
      averageCallDuration: parseFloat(avgDurationResult[0]?.value || '0').toFixed(2),
      languageDistribution: languageDistributionResult,
    };
  } catch (error) {
    console.error('Error in getAnalyticsOverview:', error);
    return {
      totalCalls: 0,
      averageCallDuration: '0',
      languageDistribution: [],
    };
  }
}

// 2. Phân loại dịch vụ phổ biến
export async function getServiceDistribution() {
  try {
    const result = await db.select({
      serviceType: request.service_type,
      count: count()
    }).from(request)
      .groupBy(request.service_type)
      .orderBy(sql`count DESC`)
      .limit(10);
    return result;
  } catch (error) {
    console.error('Error in getServiceDistribution:', error);
    return [];
  }
}

// 3. Hoạt động theo giờ
export async function getHourlyActivity() {
  try {
    let result;
    
    if (useSQLite) {
      // SQLite uses strftime() function
      result = await db.select({
        hour: sql`CAST(strftime('%H', created_at) AS INTEGER)`,
        count: count()
      }).from(request)
        .groupBy(sql`strftime('%H', created_at)`)
        .orderBy(sql`hour`);
    } else {
      // PostgreSQL uses EXTRACT() function
      result = await db.select({
        hour: sql`EXTRACT(hour FROM created_at)`,
        count: count()
      }).from(request)
        .groupBy(sql`EXTRACT(hour FROM created_at)`)
        .orderBy(sql`hour`);
    }

    return result;
  } catch (error) {
    console.error('Error in getHourlyActivity:', error);
    return [];
  }
} 