import { DEV_CONFIG } from '@auth/config/auth.config';
import { eq, getDatabase, request, staff, tenants } from '@shared/db';
import { logger } from '@shared/utils/logger';
import bcrypt from 'bcrypt';

// Import dev users from auth config

export async function seedDevelopmentData() {
  try {
    logger.debug('Seeding development data...', 'Component');

    // ✅ NEW: Get database connection asynchronously
    const db = await getDatabase();
    if (!db) {
      logger.error('❌ Database connection failed during seeding', 'Component');
      return;
    }

    // First, ensure we have a tenant
    await seedTenant(db);

    // Then seed staff users
    await seedStaffUsers(db);

    // Then seed other data
    await seedCallsAndRequests(db);

    logger.debug('Development data seeded successfully!', 'Component');
  } catch (error) {
    logger.error('Error seeding development data:', 'Component', error);
  }
}

async function seedTenant(db: any) {
  try {
    // Check if tenant exists
    const existingTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, 'mi-nhon-hotel'))
      .limit(1);

    if (existingTenant.length === 0) {
      logger.debug('Creating default tenant...', 'Component');
      await db.insert(tenants).values({
        id: 'mi-nhon-hotel',
        hotel_name: 'Mi Nhon Hotel',
        subdomain: 'minhonmuine',
        subscription_plan: 'premium',
        subscription_status: 'active',
        is_active: true,
        monthly_call_limit: 1000,
        max_voices: 5,
        max_languages: 6,
        created_at: new Date(),
        updated_at: new Date(),
      });
      logger.debug('Default tenant created successfully', 'Component');
    } else {
      logger.debug('Default tenant already exists', 'Component');
    }
  } catch (error) {
    logger.error('Error seeding tenant:', 'Component', error);
  }
}

async function seedStaffUsers(db: any) {
  try {
    // Check if staff users already exist
    const existingStaff = await db.select().from(staff).limit(1);

    if (existingStaff.length > 0) {
      logger.debug('Staff users already exist, skipping seed...', 'Component');
      return;
    }

    logger.debug('Creating development staff users...', 'Component');

    // Create staff users from DEV_CONFIG
    for (const devUser of DEV_CONFIG.DEFAULT_DEV_USERS) {
      const hashedPassword = await bcrypt.hash(devUser.password, 10);

      await db.insert(staff).values({
        id: `staff-${devUser.username}`,
        username: devUser.username,
        email: `${devUser.username}@minhonhotel.com`,
        password: hashedPassword,
        role: devUser.role,
        display_name:
          devUser.username.charAt(0).toUpperCase() + devUser.username.slice(1),
        tenant_id: 'mi-nhon-hotel',
        is_active: true,
        permissions: JSON.stringify([]), // Will use role-based permissions
        created_at: new Date(),
        updated_at: new Date(),
      });

      logger.debug(
        `Created staff user: ${devUser.username} (${devUser.role})`,
        'Component'
      );
    }

    logger.debug('Development staff users created successfully!', 'Component');
  } catch (error) {
    logger.error('Error seeding staff users:', 'Component', error);
  }
}

async function seedCallsAndRequests(db: any) {
  try {
    // Check if data already exists
    const existingRequests = await db.select().from(request).limit(1);

    if (existingRequests.length > 0) {
      logger.debug(
        'Request data already exists, skipping seed...',
        'Component'
      );
      return;
    }

    logger.debug('Seeding request data...', 'Component');

    // Seed request data
    const requestData = [
      {
        tenant_id: 'mi-nhon-hotel',
        room_number: '101',
        request_content: 'Yêu cầu dọn phòng lúc 2:00 PM',
        guest_name: 'John Doe',
        priority: 'medium',
        status: 'pending',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        updated_at: new Date(),
      },
      {
        tenant_id: 'mi-nhon-hotel',
        room_number: '202',
        request_content: 'Cần thêm khăn tắm',
        guest_name: 'Jane Smith',
        priority: 'low',
        status: 'in-progress',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updated_at: new Date(),
      },
      {
        tenant_id: 'mi-nhon-hotel',
        room_number: '303',
        request_content: 'Yêu cầu taxi đến sân bay lúc 6:00 AM',
        guest_name: 'Mike Johnson',
        priority: 'high',
        status: 'completed',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        updated_at: new Date(),
      },
      {
        tenant_id: 'mi-nhon-hotel',
        room_number: '404',
        request_content: 'Thông tin về tour địa phương',
        guest_name: 'Sarah Wilson',
        priority: 'medium',
        status: 'pending',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updated_at: new Date(),
      },
      {
        tenant_id: 'mi-nhon-hotel',
        room_number: '505',
        request_content: 'Sửa chữa điều hòa không hoạt động',
        guest_name: 'David Brown',
        priority: 'high',
        status: 'in-progress',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        updated_at: new Date(),
      },
    ];

    // Insert request data
    for (const requestItem of requestData) {
      await db.insert(request).values(requestItem);
    }

    logger.debug('Request data seeded successfully!', 'Component');
  } catch (error) {
    logger.error('Error seeding call and request data:', 'Component', error);
  }
}

// Run seeding immediately
seedDevelopmentData()
  .then(() => {
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  });
