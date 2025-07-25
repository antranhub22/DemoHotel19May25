import bcrypt from 'bcrypt';
import { DEV_CONFIG } from '@auth/config/auth.config';
import { call, db, eq, request, staff, tenants } from '@shared/db';
import { logger } from '@shared/utils/logger';

// Import dev users from auth config

export async function seedDevelopmentData() {
  try {
    logger.debug('Seeding development data...', 'Component');

    // First, ensure we have a tenant
    await seedTenant();

    // Then seed staff users
    await seedStaffUsers();

    // Then seed other data
    await seedCallsAndRequests();

    logger.debug('Development data seeded successfully!', 'Component');
  } catch (error) {
    logger.error('Error seeding development data:', 'Component', error);
  }
}

async function seedTenant() {
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

async function seedStaffUsers() {
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

async function seedCallsAndRequests() {
  try {
    // Check if data already exists
    const existingCalls = await db.select().from(call).limit(1);

    if (existingCalls.length > 0) {
      logger.debug(
        'Call/request data already exists, skipping seed...',
        'Component'
      );
      return;
    }

    logger.debug('Seeding call and request data...', 'Component');

    // Seed call data
    const callData = [
      {
        call_id_vapi: 'call-001-dev',
        tenant_id: 'mi-nhon-hotel',
      },
      {
        call_id_vapi: 'call-002-dev',
        tenant_id: 'mi-nhon-hotel',
      },
    ];

    // Insert call data
    for (const callItem of callData as any[]) {
      await db.insert(call).values(callItem).onConflictDoNothing();
    }

    // Seed request data
    const requestData = [
      {
        id: 'REQ-001',
        type: 'housekeeping',
        roomNumber: '101',
        orderId: 'ORD-001',
        requestContent: 'Yêu cầu dọn phòng lúc 2:00 PM',
        status: 'Đã ghi nhận',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      },
      {
        id: 'REQ-002',
        type: 'housekeeping',
        roomNumber: '202',
        orderId: 'ORD-002',
        requestContent: 'Cần thêm khăn tắm',
        status: 'Đang thực hiện',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: 'REQ-003',
        type: 'transportation',
        roomNumber: '303',
        orderId: 'ORD-003',
        requestContent: 'Yêu cầu taxi đến sân bay lúc 6:00 AM',
        status: 'Hoàn thiện',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      },
      {
        id: 'REQ-004',
        type: 'concierge',
        roomNumber: '404',
        orderId: 'ORD-004',
        requestContent: 'Thông tin về tour địa phương',
        status: 'Đã ghi nhận',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      },
      {
        id: 'REQ-005',
        type: 'maintenance',
        roomNumber: '505',
        orderId: 'ORD-005',
        requestContent: 'Sửa chữa điều hòa không hoạt động',
        status: 'Đang thực hiện',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      },
      {
        id: 'REQ-006',
        type: 'restaurant',
        roomNumber: '606',
        orderId: 'ORD-006',
        requestContent: 'Đặt bàn nhà hàng cho 4 người lúc 7:00 PM',
        status: 'Hoàn thiện',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      },
      {
        id: 'REQ-007',
        type: 'housekeeping',
        roomNumber: '707',
        orderId: 'ORD-007',
        requestContent: 'Yêu cầu dịch vụ giặt ủi',
        status: 'Đã ghi nhận',
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
      },
    ];

    // Insert requests
    for (const requestItem of requestData as any[]) {
      await db.insert(request).values(requestItem);
    }

    logger.debug('Call and request data seeded successfully!', 'Component');
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
  .catch((error) => {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  });
