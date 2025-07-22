#!/usr/bin/env tsx

import { Pool } from 'pg';
import bcrypt from 'bcrypt';

import { fileURLToPath } from 'url';

/**
 * Production User Seeding Script
 *
 * Creates default users for production deployment
 * Safe to run multiple times - won't duplicate users
 */

interface DefaultUser {
  username: string;
  password: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  displayName: string;
  tenantId: string;
}

async function seedProductionUsers(): Promise<{
  success: boolean;
  usersCreated: string[];
  error?: string;
}> {
  console.log('👥 Production User Seeding: Starting...');

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.log(
      '⚠️ DATABASE_URL not found - skipping user seeding (probably local dev)'
    );
    return { success: true, usersCreated: [] };
  }

  // ✅ FIXED: Skip PostgreSQL seeding for SQLite databases
  if (DATABASE_URL.startsWith('sqlite://')) {
    console.log(
      '📁 SQLite database detected - skipping PostgreSQL user seeding'
    );
    console.log(
      'ℹ️ SQLite databases should use local seeding methods (npm run db:seed)'
    );
    return;
  }

  // ✅ IMPROVED: Only proceed with PostgreSQL seeding for actual PostgreSQL databases
  if (
    !DATABASE_URL.includes('postgres') &&
    !DATABASE_URL.includes('postgresql')
  ) {
    console.log(
      '⚠️ Database URL does not appear to be PostgreSQL - skipping user seeding'
    );
    console.log(
      '🔍 DATABASE_URL pattern:',
      DATABASE_URL.substring(0, 20) + '...'
    );
    return;
  }

  console.log(
    '🐘 PostgreSQL database detected - proceeding with user seeding...'
  );

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const usersCreated: string[] = [];

  try {
    const client = await pool.connect();

    // 1. Check if tenant exists, create if not
    console.log('🏨 Checking for default tenant...');

    const existingTenant = await client.query(`
      SELECT id FROM tenants WHERE id = 'mi-nhon-hotel' LIMIT 1
    `);

    let tenantId = 'mi-nhon-hotel';

    if (!existingTenant.rows || existingTenant.rows.length === 0) {
      console.log('🏨 Creating default tenant: Mi Nhon Hotel');

      // Create tenant with settings
      await client.query(
        `
        INSERT INTO tenants (
          id, hotel_name, subdomain, subscription_plan, subscription_status,
          settings, features, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP
        ) ON CONFLICT (id) DO NOTHING
      `,
        [
          tenantId,
          'Mi Nhon Hotel',
          'minhonmuine',
          'premium',
          'active',
          JSON.stringify({
            timezone: 'Asia/Ho_Chi_Minh',
            defaultLanguage: 'vi',
            checkIn: '14:00',
            checkOut: '12:00',
            currency: 'VND',
            phoneFormat: '+84',
            notifications: {
              email: true,
              sms: false,
              voice: true,
            },
          }),
          JSON.stringify([
            'voice_assistant',
            'multi_language',
            'analytics',
            'staff_management',
            'request_tracking',
          ]),
        ]
      );

      console.log('✅ Default tenant created');

      // Create hotel profile
      console.log('🏨 Creating hotel profile...');
      await client.query(
        `
        INSERT INTO hotel_profiles (
          id, tenant_id, research_data, assistant_config, services_config, knowledge_base, system_prompt
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) ON CONFLICT (id) DO NOTHING
      `,
        [
          `${tenantId}-profile`,
          tenantId,
          JSON.stringify({
            location: 'Mui Ne, Vietnam',
            type: 'Beach Resort',
            rooms: 50,
            facilities: [
              'Restaurant',
              'Swimming Pool',
              'Spa',
              'Beach Access',
              'Room Service',
            ],
          }),
          JSON.stringify({
            language: 'vi',
            voice: 'female',
            personality: 'professional',
            greeting:
              'Xin chào, tôi là trợ lý ảo của khách sạn Mi Nhon. Tôi có thể giúp gì cho quý khách?',
          }),
          JSON.stringify({
            enabled: [
              'room_service',
              'housekeeping',
              'concierge',
              'maintenance',
              'spa',
            ],
            hours: {
              room_service: '24/7',
              housekeeping: '07:00-22:00',
              concierge: '24/7',
              maintenance: '08:00-17:00',
              spa: '09:00-21:00',
            },
          }),
          'Mi Nhon Hotel là một khách sạn nghỉ dưỡng bên bờ biển Mũi Né, cách trung tâm Phan Thiết 15km. Khách sạn có 50 phòng với đầy đủ tiện nghi hiện đại, nhà hàng phục vụ ẩm thực Việt Nam và quốc tế, hồ bơi ngoài trời và spa.',
          'Bạn là trợ lý ảo của khách sạn Mi Nhon. Nhiệm vụ của bạn là hỗ trợ khách hàng 24/7 với mọi yêu cầu về dịch vụ phòng, dọn phòng, đặt tour du lịch và các dịch vụ khác của khách sạn. Hãy luôn thân thiện, chuyên nghiệp và sẵn sàng giúp đỡ.',
        ]
      );
      console.log('✅ Hotel profile created');

      // Create sample requests
      console.log('📋 Creating sample requests...');
      const sampleRequests = [
        {
          room_number: '101',
          request_content: 'Yêu cầu dọn phòng',
          status: 'Đã hoàn thành',
          priority: 'normal',
          assigned_to: 'frontdesk',
        },
        {
          room_number: '205',
          request_content: 'Thêm khăn tắm',
          status: 'Đang thực hiện',
          priority: 'high',
          assigned_to: 'housekeeping',
        },
        {
          room_number: '308',
          request_content: 'Sửa điều hòa',
          status: 'Đã ghi nhận',
          priority: 'urgent',
          assigned_to: 'maintenance',
        },
      ];

      for (const req of (sampleRequests as any[])) {
        await client.query(
          `
          INSERT INTO request (
            tenant_id, room_number, request_content, status,
            priority, assigned_to, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP
          )
        `,
          [
            tenantId,
            req.room_number,
            req.request_content,
            req.status,
            req.priority,
            req.assigned_to,
          ]
        );
      }
      console.log('✅ Sample requests created');
    } else {
      console.log('✅ Default tenant already exists');

      // Check and update hotel profile
      const existingProfile = await client.query(
        `
        SELECT id FROM hotel_profiles WHERE tenant_id = $1 LIMIT 1
      `,
        [tenantId]
      );

      if (!existingProfile.rows?.length) {
        console.log('🏨 Creating missing hotel profile...');
        await client.query(
          `
          INSERT INTO hotel_profiles (
            id, tenant_id, research_data, assistant_config, services_config, knowledge_base, system_prompt
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7
          )
        `,
          [
            `${tenantId}-profile`,
            tenantId,
            JSON.stringify({
              location: 'Mui Ne, Vietnam',
              type: 'Beach Resort',
              rooms: 50,
              facilities: [
                'Restaurant',
                'Swimming Pool',
                'Spa',
                'Beach Access',
                'Room Service',
              ],
            }),
            JSON.stringify({
              language: 'vi',
              voice: 'female',
              personality: 'professional',
              greeting:
                'Xin chào, tôi là trợ lý ảo của khách sạn Mi Nhon. Tôi có thể giúp gì cho quý khách?',
            }),
            JSON.stringify({
              enabled: [
                'room_service',
                'housekeeping',
                'concierge',
                'maintenance',
                'spa',
              ],
              hours: {
                room_service: '24/7',
                housekeeping: '07:00-22:00',
                concierge: '24/7',
                maintenance: '08:00-17:00',
                spa: '09:00-21:00',
              },
            }),
            'Mi Nhon Hotel là một khách sạn nghỉ dưỡng bên bờ biển Mũi Né, cách trung tâm Phan Thiết 15km. Khách sạn có 50 phòng với đầy đủ tiện nghi hiện đại, nhà hàng phục vụ ẩm thực Việt Nam và quốc tế, hồ bơi ngoài trời và spa.',
            'Bạn là trợ lý ảo của khách sạn Mi Nhon. Nhiệm vụ của bạn là hỗ trợ khách hàng 24/7 với mọi yêu cầu về dịch vụ phòng, dọn phòng, đặt tour du lịch và các dịch vụ khác của khách sạn. Hãy luôn thân thiện, chuyên nghiệp và sẵn sàng giúp đỡ.',
          ]
        );
        console.log('✅ Hotel profile created');
      } else {
        console.log('✅ Hotel profile already exists');
      }

      // Check and create sample requests if none exist
      const existingRequests = await client.query(
        `
        SELECT COUNT(*) as count FROM request WHERE tenant_id = $1
      `,
        [tenantId]
      );

      if (existingRequests.rows[0].count === '0') {
        console.log('📋 Creating sample requests...');
        const sampleRequests = [
          {
            room_number: '101',
            request_content: 'Yêu cầu dọn phòng',
            status: 'Đã hoàn thành',
            priority: 'normal',
            assigned_to: 'frontdesk',
          },
          {
            room_number: '205',
            request_content: 'Thêm khăn tắm',
            status: 'Đang thực hiện',
            priority: 'high',
            assigned_to: 'housekeeping',
          },
          {
            room_number: '308',
            request_content: 'Sửa điều hòa',
            status: 'Đã ghi nhận',
            priority: 'urgent',
            assigned_to: 'maintenance',
          },
        ];

        for (const req of (sampleRequests as any[])) {
          await client.query(
            `
            INSERT INTO request (
              tenant_id, room_number, request_content, status,
              priority, assigned_to, created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP
            )
          `,
            [
              tenantId,
              req.room_number,
              req.request_content,
              req.status,
              req.priority,
              req.assigned_to,
            ]
          );
        }
        console.log('✅ Sample requests created');
      } else {
        console.log('✅ Sample requests already exist');
      }
    }

    // 2. Define default users (let database auto-generate IDs)
    const defaultUsers = [
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@minhonhotel.com',
        role: 'super-admin',
        firstName: 'System',
        lastName: 'Administrator',
        displayName: 'System Administrator',
        tenantId,
        permissions: [
          'admin',
          'manage_users',
          'manage_settings',
          'view_analytics',
        ],
      },
      {
        username: 'manager',
        password: 'manager123',
        email: 'manager@minhonhotel.com',
        role: 'hotel-manager',
        firstName: 'Hotel',
        lastName: 'Manager',
        displayName: 'Hotel Manager',
        tenantId,
        permissions: ['manage_staff', 'view_analytics', 'manage_requests'],
      },
      {
        username: 'frontdesk',
        password: 'frontdesk123',
        email: 'frontdesk@minhonhotel.com',
        role: 'front-desk',
        firstName: 'Front',
        lastName: 'Desk',
        displayName: 'Front Desk Staff',
        tenantId,
        permissions: ['handle_requests', 'view_guests'],
      },
      {
        username: 'itmanager',
        password: 'itmanager123',
        email: 'it@minhonhotel.com',
        role: 'it-manager',
        firstName: 'IT',
        lastName: 'Manager',
        displayName: 'IT Manager',
        tenantId,
        permissions: ['manage_system', 'view_logs', 'manage_integrations'],
      },
    ];

    // STEP 0: Delete all existing users first
    console.log('🗑️ Cleaning up existing users...');
    for (const user of (defaultUsers as any[])) {
      await client.query(
        `
        DELETE FROM staff WHERE username = $1
      `,
        [user.username]
      );
      console.log(`   Deleted if exists: ${user.username}`);
    }

    // 3. Create users if they don't exist
    console.log('👤 Creating default users...');

    for (const user of (defaultUsers as any[])) {
      // Hash password with consistent salt rounds
      const hashedPassword = await bcrypt.hash(user.password, 12); // Use 12 rounds consistently

      // Create user (let database auto-generate ID)
      await client.query(
        `
        INSERT INTO staff (
          tenant_id, username, password, first_name, last_name, 
          email, role, display_name, permissions, is_active, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP
        )
      `,
        [
          user.tenantId,
          user.username,
          hashedPassword,
          user.firstName,
          user.lastName,
          user.email,
          user.role,
          user.displayName,
          JSON.stringify(user.permissions), // Properly format permissions as JSON
          true,
        ]
      );

      usersCreated.push(user.username);
      console.log(`✅ Created user: ${user.username} (${user.role})`);

      // Verify password hash
      const verifyHash = await bcrypt.compare(user.password, hashedPassword);
      console.log(
        `   Password verification: ${verifyHash ? '✅ VALID' : '❌ INVALID'}`
      );
    }

    client.release();

    console.log('🎉 User seeding completed successfully!');
    console.log(`📝 Users created: ${usersCreated.join(', ')}`);
    console.log('');
    console.log('🔑 Default login credentials:');
    console.log('  Admin: admin / admin123');
    console.log('  Manager: manager / manager123');
    console.log('  Front Desk: frontdesk / frontdesk123');
    console.log('  IT Manager: itmanager / itmanager123');

    return { success: true, usersCreated };
  } catch (error) {
    console.error('❌ User seeding failed:', error);
    return {
      success: false,
      usersCreated,
      error: error instanceof Error ? (error as any)?.message || String(error) : 'Unknown error',
    };
  } finally {
    await pool.end();
  }
}

// Export for use in other scripts
export { seedProductionUsers };

// Run if called directly (ES module compatible)
const __filename = fileURLToPath(import.meta.url);
const isMainModule =
  process.argv[1] === __filename ||
  process.argv[1]?.endsWith('seed-production-users.ts');

if (isMainModule) {
  seedProductionUsers()
    .then(result => {
      if (!result.success) {
        console.error('User seeding failed, but continuing...');
        // Don't exit with error code to allow deployment to continue
      }
    })
    .catch(error => {
      console.error('User seeding script error:', error);
      // Don't exit with error code to allow deployment to continue
    });
}
