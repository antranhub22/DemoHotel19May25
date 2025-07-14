import { db } from '../../packages/shared/db';
import { call, request } from '../../packages/shared/db';
import { eq } from 'drizzle-orm';

export async function seedDevelopmentData() {
  try {
    // Check if data already exists
    const existingCalls = await db.select().from(call).limit(1);
    
    if (existingCalls.length > 0) {
      console.log('Development data already exists, skipping seed...');
      return;
    }

    console.log('Seeding development data...');
    
    // Seed call data
    const callData = [
      {
        id: 'test-call-001',
        callIdVapi: 'test-call-001',
        roomNumber: '101',
        language: 'vi',
        serviceType: 'room_service',
        duration: 120,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: 'test-call-002',
        callIdVapi: 'test-call-002',
        roomNumber: '202',
        language: 'en',
        serviceType: 'housekeeping',
        duration: 90,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      },
      {
        id: 'test-call-003',
        callIdVapi: 'test-call-003',
        roomNumber: '303',
        language: 'fr',
        serviceType: 'transportation',
        duration: 150,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
      },
      {
        id: 'test-call-004',
        callIdVapi: 'test-call-004',
        roomNumber: '404',
        language: 'vi',
        serviceType: 'concierge',
        duration: 75,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
      },
      {
        id: 'test-call-005',
        callIdVapi: 'test-call-005',
        roomNumber: '505',
        language: 'en',
        serviceType: 'maintenance',
        duration: 45,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() // 10 hours ago
      }
    ];

    // Insert calls
    for (const callItem of callData) {
      await db.insert(call).values(callItem);
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
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      },
      {
        id: 'REQ-002',
        type: 'housekeeping',
        roomNumber: '202',
        orderId: 'ORD-002',
        requestContent: 'Cần thêm khăn tắm',
        status: 'Đang thực hiện',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: 'REQ-003',
        type: 'transportation',
        roomNumber: '303',
        orderId: 'ORD-003',
        requestContent: 'Yêu cầu taxi đến sân bay lúc 6:00 AM',
        status: 'Hoàn thiện',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
      },
      {
        id: 'REQ-004',
        type: 'concierge',
        roomNumber: '404',
        orderId: 'ORD-004',
        requestContent: 'Thông tin về tour địa phương',
        status: 'Đã ghi nhận',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      },
      {
        id: 'REQ-005',
        type: 'maintenance',
        roomNumber: '505',
        orderId: 'ORD-005',
        requestContent: 'Sửa chữa điều hòa không hoạt động',
        status: 'Đang thực hiện',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
      },
      {
        id: 'REQ-006',
        type: 'restaurant',
        roomNumber: '606',
        orderId: 'ORD-006',
        requestContent: 'Đặt bàn nhà hàng cho 4 người lúc 7:00 PM',
        status: 'Hoàn thiện',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
      },
      {
        id: 'REQ-007',
        type: 'housekeeping',
        roomNumber: '707',
        orderId: 'ORD-007',
        requestContent: 'Yêu cầu dịch vụ giặt ủi',
        status: 'Đã ghi nhận',
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() // 7 hours ago
      }
    ];

    // Insert requests
    for (const requestItem of requestData) {
      await db.insert(request).values(requestItem);
    }

    console.log('Development data seeded successfully!');
  } catch (error) {
    console.error('Error seeding development data:', error);
  }
} 