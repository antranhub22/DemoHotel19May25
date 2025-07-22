/**
 * Transformation Test Examples
 * Shows how camelCase ↔ snake_case conversion works
 */

import { requestMapper, toCamelCase, toSnakeCase, transformObjectToCamelCase,  } from './transformers';
// ✅ TEST 1: Basic string transformation
console.log('=== String Transformation Tests ===');
console.log('roomNumber →', toSnakeCase('roomNumber')); // → room_number
console.log('callId →', toSnakeCase('callId')); // → call_id
console.log('request_content →', toCamelCase('request_content')); // → requestContent
console.log('tenant_id →', toCamelCase('tenant_id')); // → tenantId

// ✅ TEST 2: Frontend → Database transformation
console.log('\n=== Frontend → Database Transformation ===');
const frontendRequest = {
  callId: 'ORD-12345',
  roomNumber: '205',
  orderType: 'Room Service',
  deliveryTime: 'asap',
  specialInstructions: 'Extra towels please',
  items: [
    {
      id: '1',
      name: 'Towel Service',
      description: 'Fresh towels',
      quantity: 2,
      price: 0,
    },
  ],
  totalAmount: 0,
  status: 'pending',
  createdAt: new Date().toISOString(),
};

const databaseRequest = requestMapper.toDatabase(frontendRequest);
console.log('Frontend (camelCase):', JSON.stringify(frontendRequest, null, 2));
console.log('Database (snake_case):', JSON.stringify(databaseRequest, null, 2));

// ✅ TEST 3: Database → Frontend transformation
console.log('\n=== Database → Frontend Transformation ===');
const databaseResponse = {
  id: 1001,
  tenant_id: 'hotel-123',
  call_id: 'ORD-12345',
  room_number: '205',
  order_id: 'ORD-1705334425-456',
  request_content: 'Towel Service x2',
  status: 'Đã ghi nhận',
  created_at: 1705334425,
  updated_at: 1705334425,
  description: 'Extra towels please',
  priority: 'medium',
  assigned_to: null,
};

const frontendResponse = requestMapper.toFrontend(databaseResponse);
console.log(
  'Database (snake_case):',
  JSON.stringify(databaseResponse, null, 2)
);
console.log('Frontend (camelCase):', JSON.stringify(frontendResponse, null, 2));

// ✅ TEST 4: Complex nested object transformation
console.log('\n=== Nested Object Transformation ===');
const complexObject = {
  user_info: {
    first_name: 'John',
    last_name: 'Doe',
    contact_details: {
      phone_number: '+1234567890',
      email_address: 'john@example.com',
    },
  },
  request_items: [
    {
      item_id: '1',
      item_name: 'Service',
      created_at: new Date().toISOString(),
    },
  ],
};

const camelCaseObject = transformObjectToCamelCase(complexObject);
console.log('Snake_case:', JSON.stringify(complexObject, null, 2));
console.log('CamelCase:', JSON.stringify(camelCaseObject, null, 2));

export { frontendRequest, databaseRequest, databaseResponse, frontendResponse };
