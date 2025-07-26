/**
 * Ensure Production Tenant Exists
 * Auto-creates missing tenant on server startup
 */

import { postgres } from '@shared/db/connectionManager';
import { tenants } from '@shared/db/schema';
import { logger } from '@shared/utils/logger';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';

export async function ensureProductionTenant(): Promise<void> {
  try {
    logger.debug(
      '🔧 [Startup] Ensuring production tenant exists...',
      'Component'
    );

    // Skip if not production
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(
        '⏭️ [Startup] Skipping tenant check (not production)',
        'Component'
      );
      return;
    }

    // Get database connection
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      logger.error('❌ [Startup] DATABASE_URL not found', 'Component');
      return;
    }

    const sql = postgres(databaseUrl);
    const db = drizzle(sql);

    // Check if minhonmuine tenant exists
    const existingTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.subdomain, 'minhonmuine'))
      .limit(1);

    if (existingTenant.length > 0) {
      logger.debug(
        '✅ [Startup] Production tenant already exists',
        'Component'
      );
      await sql.end();
      return;
    }

    // Create missing tenant
    logger.warn(
      '🏨 [Startup] Creating missing production tenant...',
      'Component'
    );

    const newTenant = await db
      .insert(tenants)
      .values({
        id: 'mi-nhon-hotel',
        hotel_name: 'Mi Nhon Hotel',
        subdomain: 'minhonmuine',
        custom_domain: 'minhonmuine.talk2go.online',
        subscription_plan: 'premium',
        subscription_status: 'active',
        is_active: true,
        monthly_call_limit: 1000,
        max_voices: 5,
        max_languages: 6,
        voice_cloning: true,
        multi_location: true,
        white_label: false,
        data_retention_days: 365,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        created_at: new Date(),
        updated_at: new Date(),
        tier: 'premium',
        max_calls: 1000,
        max_users: 50,
      })
      .returning();

    logger.info(
      '✅ [Startup] Production tenant created successfully!',
      'Component',
      {
        id: newTenant[0]?.id,
        subdomain: newTenant[0]?.subdomain,
        hotelName: newTenant[0]?.hotel_name,
      }
    );

    await sql.end();
  } catch (error) {
    logger.error(
      '❌ [Startup] Failed to ensure production tenant:',
      'Component',
      error
    );
    // Don't throw - let server continue starting
  }
}
