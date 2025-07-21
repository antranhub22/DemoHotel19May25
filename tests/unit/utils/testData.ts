/* ========================================
   TEST DATA - STATIC TEST DATA
   ======================================== */

// ========================================
// HOTEL TEST DATA
// ========================================

export const testHotels = {
  minhon: {
    name: 'Mi Nhon Hotel',
    location: 'Mui Ne, Phan Thiet, Vietnam',
    phone: '+84 252 384 9999',
    email: 'info@minhonhotel.com',
    website: 'https://minhonhotel.com',
    description: 'A beautiful beachfront hotel in Mui Ne',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa', 'Beach Access'],
    roomTypes: [
      {
        name: 'Standard Room',
        description: 'Comfortable room with sea view',
        price: 1500000,
        capacity: 2,
        amenities: ['WiFi', 'TV', 'AC', 'Balcony'],
      },
      {
        name: 'Deluxe Room',
        description: 'Spacious room with ocean view',
        price: 2500000,
        capacity: 3,
        amenities: ['WiFi', 'TV', 'AC', 'Balcony', 'Mini Bar'],
      },
    ],
    services: [
      {
        name: 'Room Service',
        description: '24/7 room service',
        category: 'food',
        availability: '24/7' as const,
      },
      {
        name: 'Spa Treatment',
        description: 'Relaxing spa treatments',
        category: 'wellness',
        availability: 'business-hours' as const,
      },
    ],
    policies: {
      checkIn: '2:00 PM',
      checkOut: '12:00 PM',
      cancellation: 'Free cancellation up to 24 hours',
      pets: false,
      smoking: false,
    },
  },

  testHotel: {
    name: 'Test Hotel',
    location: 'Test Location',
    phone: '+1234567890',
    email: 'test@hotel.com',
    website: 'https://testhotel.com',
    description: 'A test hotel for testing purposes',
    amenities: ['WiFi', 'Pool'],
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
  },
};

// ========================================
// USER TEST DATA
// ========================================

export const testUsers = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin' as const,
    tenantId: 'test-tenant-id',
  },

  staff: {
    username: 'staff',
    password: 'staff123',
    role: 'staff' as const,
    tenantId: 'test-tenant-id',
  },

  manager: {
    username: 'manager',
    password: 'manager123',
    role: 'manager' as const,
    tenantId: 'test-tenant-id',
  },
};

// ========================================
// CALL TEST DATA
// ========================================

export const testCalls = {
  roomService: {
    callIdVapi: 'test-call-room-service',
    roomNumber: '101',
    language: 'en' as const,
    serviceType: 'room-service',
    duration: 300,
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: new Date('2024-01-01T10:05:00Z'),
    tenantId: 'test-tenant-id',
  },

  spaBooking: {
    callIdVapi: 'test-call-spa-booking',
    roomNumber: '202',
    language: 'vi' as const,
    serviceType: 'spa',
    duration: 600,
    startTime: new Date('2024-01-01T14:00:00Z'),
    endTime: new Date('2024-01-01T14:10:00Z'),
    tenantId: 'test-tenant-id',
  },

  tourInquiry: {
    callIdVapi: 'test-call-tour-inquiry',
    roomNumber: '303',
    language: 'en' as const,
    serviceType: 'tours',
    duration: 450,
    startTime: new Date('2024-01-01T16:00:00Z'),
    endTime: new Date('2024-01-01T16:07:30Z'),
    tenantId: 'test-tenant-id',
  },
};

// ========================================
// TRANSCRIPT TEST DATA
// ========================================

export const testTranscripts = {
  roomService: [
    {
      callId: 'test-call-room-service',
      role: 'user' as const,
      content: 'Hello, I would like to order room service for dinner',
      timestamp: new Date('2024-01-01T10:00:30Z'),
      isModelOutput: false,
      tenantId: 'test-tenant-id',
    },
    {
      callId: 'test-call-room-service',
      role: 'assistant' as const,
      content:
        'Of course! I can help you with room service. What would you like to order?',
      timestamp: new Date('2024-01-01T10:00:35Z'),
      isModelOutput: true,
      tenantId: 'test-tenant-id',
    },
    {
      callId: 'test-call-room-service',
      role: 'user' as const,
      content: 'I would like a grilled chicken salad and a bottle of water',
      timestamp: new Date('2024-01-01T10:01:00Z'),
      isModelOutput: false,
      tenantId: 'test-tenant-id',
    },
  ],

  spaBooking: [
    {
      callId: 'test-call-spa-booking',
      role: 'user' as const,
      content: 'Xin chào, tôi muốn đặt lịch spa',
      timestamp: new Date('2024-01-01T14:00:30Z'),
      isModelOutput: false,
      tenantId: 'test-tenant-id',
    },
    {
      callId: 'test-call-spa-booking',
      role: 'assistant' as const,
      content:
        'Xin chào! Tôi có thể giúp bạn đặt lịch spa. Bạn muốn đặt vào thời gian nào?',
      timestamp: new Date('2024-01-01T14:00:35Z'),
      isModelOutput: true,
      tenantId: 'test-tenant-id',
    },
  ],
};

// ========================================
// ORDER TEST DATA
// ========================================

export const testOrders = {
  roomService: {
    roomNumber: '101',
    orderId: 'test-order-room-service',
    requestContent: 'Grilled chicken salad and bottle of water for dinner',
    status: 'pending' as const,
    tenantId: 'test-tenant-id',
  },

  spaBooking: {
    roomNumber: '202',
    orderId: 'test-order-spa-booking',
    requestContent: 'Spa treatment booking for tomorrow at 2 PM',
    status: 'in-progress' as const,
    tenantId: 'test-tenant-id',
  },

  tourBooking: {
    roomNumber: '303',
    orderId: 'test-order-tour-booking',
    requestContent: 'Sunset dune tour for 4 people',
    status: 'completed' as const,
    tenantId: 'test-tenant-id',
  },
};

// ========================================
// MESSAGE TEST DATA
// ========================================

export const testMessages = {
  roomService: [
    {
      requestId: 1,
      sender: 'staff',
      content:
        'Your room service order has been received and is being prepared',
      timestamp: new Date('2024-01-01T10:02:00Z'),
      tenantId: 'test-tenant-id',
    },
    {
      requestId: 1,
      sender: 'staff',
      content: 'Your order will be delivered in 20 minutes',
      timestamp: new Date('2024-01-01T10:03:00Z'),
      tenantId: 'test-tenant-id',
    },
  ],

  spaBooking: [
    {
      requestId: 2,
      sender: 'staff',
      content: 'Your spa appointment has been confirmed for tomorrow at 2 PM',
      timestamp: new Date('2024-01-01T14:02:00Z'),
      tenantId: 'test-tenant-id',
    },
  ],
};

// ========================================
// ANALYTICS TEST DATA
// ========================================

export const testAnalytics = {
  overview: {
    totalCalls: 150,
    averageDuration: 420,
    totalOrders: 75,
    averageOrderValue: 2500000,
    languageDistribution: {
      en: 60,
      vi: 40,
      fr: 30,
      zh: 10,
      ru: 5,
      ko: 5,
    },
    serviceTypeDistribution: {
      'room-service': 40,
      spa: 25,
      tours: 20,
      restaurant: 10,
      other: 5,
    },
  },

  serviceDistribution: [
    { type: 'room-service', count: 30, percentage: 40 },
    { type: 'spa', count: 19, percentage: 25 },
    { type: 'tours', count: 15, percentage: 20 },
    { type: 'restaurant', count: 8, percentage: 10 },
    { type: 'other', count: 3, percentage: 5 },
  ],

  hourlyActivity: [
    { hour: 8, calls: 5, orders: 2 },
    { hour: 9, calls: 8, orders: 4 },
    { hour: 10, calls: 12, orders: 6 },
    { hour: 11, calls: 15, orders: 8 },
    { hour: 12, calls: 18, orders: 10 },
    { hour: 13, calls: 16, orders: 9 },
    { hour: 14, calls: 14, orders: 7 },
    { hour: 15, calls: 12, orders: 6 },
    { hour: 16, calls: 10, orders: 5 },
    { hour: 17, calls: 8, orders: 4 },
    { hour: 18, calls: 6, orders: 3 },
    { hour: 19, calls: 4, orders: 2 },
    { hour: 20, calls: 3, orders: 1 },
  ],
};

// ========================================
// CONFIGURATION TEST DATA
// ========================================

export const testConfigs = {
  vapi: {
    publicKey: 'test-public-key',
    assistantId: 'test-assistant-id',
  },

  openai: {
    apiKey: 'test-openai-key',
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7,
  },

  email: {
    service: 'gmail' as const,
    user: 'test@hotel.com',
    pass: 'test-password',
    from: 'test@hotel.com',
    to: 'staff@hotel.com',
  },
};

// ========================================
// ERROR TEST DATA
// ========================================

export const testErrors = {
  authentication: {
    invalidCredentials: {
      status: 401,
      message: 'Invalid credentials',
      details: 'Username or password is incorrect',
    },
    tokenExpired: {
      status: 401,
      message: 'Token expired',
      details: 'Please login again',
    },
    unauthorized: {
      status: 403,
      message: 'Unauthorized',
      details: 'You do not have permission to access this resource',
    },
  },

  validation: {
    invalidEmail: {
      status: 400,
      message: 'Invalid email format',
      details: 'Please provide a valid email address',
    },
    missingRequiredField: {
      status: 400,
      message: 'Missing required field',
      details: 'Room number is required',
    },
  },

  server: {
    internalError: {
      status: 500,
      message: 'Internal server error',
      details: 'Something went wrong on our end',
    },
    serviceUnavailable: {
      status: 503,
      message: 'Service unavailable',
      details: 'The service is temporarily unavailable',
    },
  },
};
