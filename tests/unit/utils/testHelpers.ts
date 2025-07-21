/* ========================================
   TEST HELPERS - UTILITY FUNCTIONS FOR TESTING
   ======================================== */

import { Language } from '@/types';

// ========================================
// TEST DATA GENERATORS
// ========================================

export const generateTestId = (prefix: string = 'test'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateTestEmail = (prefix: string = 'test'): string => {
  return `${prefix}-${Date.now()}@example.com`;
};

export const generateTestPhone = (): string => {
  return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
};

export const generateTestDate = (daysOffset: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
};

// ========================================
// MOCK DATA GENERATORS
// ========================================

export const createMockHotelData = (overrides: Partial<any> = {}) => {
  return {
    name: 'Test Hotel',
    location: 'Test Location',
    phone: '+1234567890',
    email: 'test@hotel.com',
    website: 'https://testhotel.com',
    description: 'A test hotel for testing purposes',
    amenities: ['WiFi', 'Pool', 'Restaurant'],
    roomTypes: [
      {
        name: 'Standard Room',
        description: 'A comfortable standard room',
        price: 100,
        capacity: 2,
        amenities: ['WiFi', 'TV', 'AC'],
      },
    ],
    services: [
      {
        name: 'Room Service',
        description: '24/7 room service',
        category: 'food',
        availability: '24/7' as const,
      },
    ],
    policies: {
      checkIn: '3:00 PM',
      checkOut: '11:00 AM',
      cancellation: 'Free cancellation up to 24 hours',
      pets: false,
      smoking: false,
    },
    ...overrides,
  };
};

export const createMockUserData = (overrides: Partial<any> = {}) => {
  return {
    id: generateTestId('user'),
    username: 'testuser',
    password: 'testpass123',
    role: 'admin' as const,
    tenantId: generateTestId('tenant'),
    createdAt: generateTestDate(),
    updatedAt: generateTestDate(),
    ...overrides,
  };
};

export const createMockCallData = (overrides: Partial<any> = {}) => {
  return {
    id: generateTestId('call'),
    callIdVapi: generateTestId('vapi'),
    roomNumber: '101',
    language: 'en' as Language,
    serviceType: 'room-service',
    duration: 300,
    startTime: generateTestDate(),
    endTime: generateTestDate(1),
    tenantId: generateTestId('tenant'),
    ...overrides,
  };
};

export const createMockTranscriptData = (overrides: Partial<any> = {}) => {
  return {
    id: 1,
    callId: generateTestId('call'),
    role: 'user' as const,
    content: 'Hello, I need room service',
    timestamp: generateTestDate(),
    isModelOutput: false,
    tenantId: generateTestId('tenant'),
    ...overrides,
  };
};

export const createMockOrderData = (overrides: Partial<any> = {}) => {
  return {
    id: 1,
    roomNumber: '101',
    orderId: generateTestId('order'),
    requestContent: 'I need room service for dinner',
    status: 'pending' as const,
    createdAt: generateTestDate(),
    updatedAt: generateTestDate(),
    tenantId: generateTestId('tenant'),
    ...overrides,
  };
};

// ========================================
// TEST UTILITIES
// ========================================

export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) {
        throw lastError;
      }
      await waitFor(delay);
    }
  }

  throw lastError!;
};

export const createMockResponse = <T>(data: T, status: number = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({ success: true, data }),
  } as Response;
};

export const createMockErrorResponse = (
  message: string,
  status: number = 400
) => {
  return {
    ok: false,
    status,
    json: async () => ({ success: false, error: message }),
  } as Response;
};

// ========================================
// ASSERTION HELPERS
// ========================================

export const expectApiResponse = <T>(response: any, expectedData?: T) => {
  expect(response).toHaveProperty('success');
  expect(typeof response.success).toBe('boolean');

  if (response.success) {
    expect(response).toHaveProperty('data');
    if (expectedData) {
      expect(response.data).toEqual(expectedData);
    }
  } else {
    expect(response).toHaveProperty('error');
    expect(typeof response.error).toBe('string');
  }
};

export const expectPaginatedResponse = <T>(
  response: any,
  expectedData?: T[]
) => {
  expect(response).toHaveProperty('data');
  expect(response).toHaveProperty('pagination');
  expect(Array.isArray(response.data)).toBe(true);

  expect(response.pagination).toHaveProperty('page');
  expect(response.pagination).toHaveProperty('limit');
  expect(response.pagination).toHaveProperty('total');
  expect(response.pagination).toHaveProperty('totalPages');

  if (expectedData) {
    expect(response.data).toEqual(expectedData);
  }
};

export const expectErrorResponse = (
  response: any,
  expectedStatus?: number,
  expectedMessage?: string
) => {
  expect(response.success).toBe(false);
  expect(response).toHaveProperty('error');

  if (expectedStatus) {
    expect(response.status).toBe(expectedStatus);
  }

  if (expectedMessage) {
    expect(response.error).toContain(expectedMessage);
  }
};

// ========================================
// TEST CLEANUP
// ========================================

export const cleanupTestData = async (data: any[]) => {
  // Implementation for cleaning up test data
  console.log('Cleaning up test data...');
};

export const resetTestDatabase = async () => {
  // Implementation for resetting test database
  console.log('Resetting test database...');
};

// ========================================
// TEST CONTEXT
// ========================================

export interface TestContext {
  testId: string;
  startTime: Date;
  data: Record<string, any>;
}

export const createTestContext = (): TestContext => {
  return {
    testId: generateTestId('test'),
    startTime: new Date(),
    data: {},
  };
};

export const cleanupTestContext = async (context: TestContext) => {
  // Cleanup test context
  console.log(`Cleaning up test context: ${context.testId}`);
};
