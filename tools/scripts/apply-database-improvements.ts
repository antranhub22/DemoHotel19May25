import { db } from '@shared/db';
import { logger } from '@shared/utils/logger';

/**
 * Apply database improvements safely
 */
async function applyDatabaseImprovements() {
  try {
    logger.debug(
      '🔧 [Database] Starting database improvements',
      'DatabaseImprovements'
    );

    // ============================================
    // 1. IMPROVE DEFAULT VALUES CONSISTENCY
    // ============================================

    logger.debug(
      '🔧 [Database] Updating default values...',
      'DatabaseImprovements'
    );

    // Services table defaults
    await db.execute(`
      UPDATE services 
      SET currency = 'VND' 
      WHERE currency IS NULL
    `);

    await db.execute(`
      UPDATE services 
      SET is_active = 1 
      WHERE is_active IS NULL
    `);

    // Request table defaults
    await db.execute(`
      UPDATE request 
      SET status = 'Đã ghi nhận' 
      WHERE status IS NULL
    `);

    await db.execute(`
      UPDATE request 
      SET priority = 'medium' 
      WHERE priority IS NULL
    `);

    await db.execute(`
      UPDATE request 
      SET urgency = 'normal' 
      WHERE urgency IS NULL
    `);

    await db.execute(`
      UPDATE request 
      SET currency = 'VND' 
      WHERE currency IS NULL
    `);

    // Tenants table defaults
    await db.execute(`
      UPDATE tenants 
      SET subscription_plan = 'trial' 
      WHERE subscription_plan IS NULL
    `);

    await db.execute(`
      UPDATE tenants 
      SET subscription_status = 'active' 
      WHERE subscription_status IS NULL
    `);

    await db.execute(`
      UPDATE tenants 
      SET is_active = 1 
      WHERE is_active IS NULL
    `);

    logger.success(
      '✅ [Database] Default values updated successfully',
      'DatabaseImprovements'
    );

    // ============================================
    // 2. CREATE PERFORMANCE INDEXES
    // ============================================

    logger.debug(
      '🔧 [Database] Creating performance indexes...',
      'DatabaseImprovements'
    );

    // Services table indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_services_name 
      ON services(name)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_services_category_active 
      ON services(category, is_active)
    `);

    // Request table indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_request_tenant_status 
      ON request(tenant_id, status)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_request_room_number 
      ON request(room_number)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_request_created_at 
      ON request(created_at)
    `);

    // Tenants table indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_tenants_subdomain 
      ON tenants(subdomain)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_tenants_active 
      ON tenants(is_active)
    `);

    logger.success(
      '✅ [Database] Performance indexes created successfully',
      'DatabaseImprovements'
    );

    // ============================================
    // 3. VERIFICATION
    // ============================================

    logger.debug(
      '🔧 [Database] Running verification queries...',
      'DatabaseImprovements'
    );

    // Verify default values
    const servicesCurrencyCheck = await db.execute(`
      SELECT currency, COUNT(*) as count 
      FROM services 
      GROUP BY currency
    `);

    const requestStatusCheck = await db.execute(`
      SELECT status, priority, urgency, COUNT(*) as count 
      FROM request 
      GROUP BY status, priority, urgency
    `);

    const tenantsStatusCheck = await db.execute(`
      SELECT subscription_plan, subscription_status, is_active, COUNT(*) as count 
      FROM tenants 
      GROUP BY subscription_plan, subscription_status, is_active
    `);

    logger.success(
      '✅ [Database] Verification completed successfully',
      'DatabaseImprovements',
      {
        servicesCurrency: servicesCurrencyCheck,
        requestStatus: requestStatusCheck,
        tenantsStatus: tenantsStatusCheck,
      }
    );

    logger.success(
      '🎉 [Database] All database improvements applied successfully!',
      'DatabaseImprovements'
    );
  } catch (error) {
    logger.error(
      '❌ [Database] Failed to apply database improvements:',
      'DatabaseImprovements',
      error
    );
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  applyDatabaseImprovements()
    .then(() => {
      console.log('✅ Database improvements completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Database improvements failed:', error);
      process.exit(1);
    });
}

export { applyDatabaseImprovements };
