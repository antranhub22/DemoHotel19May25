import { db } from '../src/db';
import { request, call, transcript } from '../src/db/schema';

export async function seedDevelopmentData() {
  const DATABASE_URL = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';
  const useSQLite = !DATABASE_URL && !isProduction;

  if (!useSQLite) {
    console.log('Skipping seed data - not using SQLite');
    return;
  }

  try {
    console.log('Seeding development data...');

    // Insert dummy calls
    const callsData = [
      { call_id_vapi: 'call-1', room_number: '101', duration: 120, language: 'en' },
      { call_id_vapi: 'call-2', room_number: '102', duration: 95, language: 'vi' },
      { call_id_vapi: 'call-3', room_number: '103', duration: 180, language: 'en' },
      { call_id_vapi: 'call-4', room_number: '104', duration: 65, language: 'fr' },
      { call_id_vapi: 'call-5', room_number: '105', duration: 145, language: 'en' },
    ];

    await db.insert(call).values(callsData).execute();

    // Insert dummy requests
    const requestsData = [
      { room_number: '101', orderId: 'ORD-001', guestName: 'John Doe', request_content: 'Room service - 2 hamburgers', service_type: 'room_service', status: 'completed' },
      { room_number: '102', orderId: 'ORD-002', guestName: 'Jane Smith', request_content: 'Laundry service', service_type: 'laundry', status: 'pending' },
      { room_number: '103', orderId: 'ORD-003', guestName: 'Bob Johnson', request_content: 'Spa booking at 3 PM', service_type: 'spa', status: 'completed' },
      { room_number: '104', orderId: 'ORD-004', guestName: 'Alice Brown', request_content: 'Tour booking - Red Sand Dunes', service_type: 'tour', status: 'pending' },
      { room_number: '105', orderId: 'ORD-005', guestName: 'Charlie Wilson', request_content: 'Restaurant reservation', service_type: 'restaurant', status: 'completed' },
      { room_number: '106', orderId: 'ORD-006', guestName: 'Diana Lee', request_content: 'Airport transfer', service_type: 'transport', status: 'pending' },
      { room_number: '107', orderId: 'ORD-007', guestName: 'Frank Miller', request_content: 'Room cleaning', service_type: 'housekeeping', status: 'completed' },
    ];

    await db.insert(request).values(requestsData).execute();

    console.log('Development data seeded successfully!');
  } catch (error) {
    console.error('Error seeding development data:', error);
  }
} 