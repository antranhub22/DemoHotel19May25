import { db, call, request } from '@shared/db';
import { eq } from 'drizzle-orm';
import { logger } from '@shared/utils/logger';
import type { InsertCall } from '@shared/db/schema';

export async function seedDevelopmentData() {
  try {
    // Check if data already exists
    const existingCalls = await db.select().from(call).limit(1);

    if (existingCalls.length > 0) {
      logger.debug('Development data already exists, skipping seed...', 'Component');
      return;
    }

    logger.debug('Seeding development data...', 'Component');

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
    for (const callItem of callData) {
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
    for (const requestItem of requestData) {
      await db.insert(request).values(requestItem);
    }

    logger.debug('Development data seeded successfully!', 'Component');
  } catch (error) {
    logger.error('Error seeding development data:', 'Component', error);
  }
}
