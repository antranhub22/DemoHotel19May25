# 🚀 API Documentation - Hotel Voice Assistant Platform

## Multi-Tenant SaaS API Reference

Welcome to the comprehensive API documentation for the Hotel Voice Assistant Platform. This documentation covers all endpoints, authentication methods, and integration examples for the multi-tenant SaaS system.

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Base URLs & Environments](#base-urls--environments)
3. [Hotel Management API](#hotel-management-api)
4. [Assistant Configuration API](#assistant-configuration-api)
5. [Analytics & Reporting API](#analytics--reporting-api)
6. [Tenant Management API](#tenant-management-api)
7. [WebSocket API](#websocket-api)
8. [Webhooks](#webhooks)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)
11. [SDKs & Examples](#sdks--examples)

---

## 🔐 Authentication

### JWT Token Authentication

All API requests require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Obtaining Access Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@hotel.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@hotel.com",
    "tenantId": "tenant-456",
    "role": "admin"
  },
  "expiresIn": 3600
}
```

### Token Refresh

```http
POST /api/auth/refresh
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

## 🌐 Base URLs & Environments

### Production
```
https://api.talk2go.online
```

### Development
```
https://api-dev.talk2go.online
```

### Staging
```
https://api-staging.talk2go.online
```

---

## 🏨 Hotel Management API

### 1. Hotel Research & Onboarding

#### Research Hotel Information
```http
POST /api/dashboard/research-hotel
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "hotelName": "Grand Plaza Hotel",
  "location": "New York, NY",
  "researchDepth": "basic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "basicInfo": {
      "name": "Grand Plaza Hotel",
      "address": "123 Main Street, New York, NY 10001",
      "phone": "+1 (555) 123-4567",
      "website": "https://grandplaza.com",
      "rating": 4.5,
      "category": "luxury",
      "googlePlaceId": "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    "services": [
      {
        "id": "restaurant",
        "name": "Fine Dining Restaurant",
        "description": "Award-winning Italian cuisine",
        "hours": "6:00 PM - 11:00 PM",
        "phone": "+1 (555) 123-4567 ext. 1234"
      },
      {
        "id": "spa",
        "name": "Luxury Spa",
        "description": "Full-service spa and wellness center",
        "hours": "9:00 AM - 8:00 PM",
        "phone": "+1 (555) 123-4567 ext. 5678"
      }
    ],
    "amenities": [
      "swimming_pool",
      "fitness_center",
      "free_wifi",
      "parking",
      "concierge"
    ],
    "localAttractions": [
      {
        "name": "Times Square",
        "distance": "0.5 miles",
        "walkTime": "5 minutes",
        "description": "Famous commercial intersection"
      }
    ],
    "policies": {
      "checkIn": "3:00 PM",
      "checkOut": "11:00 AM",
      "cancellation": "24 hours",
      "pets": "allowed",
      "smoking": "prohibited"
    }
  }
}
```

#### Get Hotel Profile
```http
GET /api/dashboard/hotel-profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "hotel-123",
    "tenantId": "tenant-456",
    "researchData": { /* Research data object */ },
    "assistantConfig": { /* Assistant configuration */ },
    "vapiAssistantId": "asst_abc123",
    "servicesConfig": { /* Services configuration */ },
    "knowledgeBase": "Generated knowledge base content...",
    "systemPrompt": "You are the AI concierge for...",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}
```

#### Update Hotel Information
```http
PUT /api/dashboard/hotel-profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "basicInfo": {
    "name": "Grand Plaza Hotel",
    "address": "123 Main Street, New York, NY 10001",
    "phone": "+1 (555) 123-4567",
    "website": "https://grandplaza.com",
    "email": "info@grandplaza.com"
  },
  "services": [
    {
      "id": "restaurant",
      "name": "Fine Dining Restaurant",
      "description": "Award-winning Italian cuisine",
      "hours": "6:00 PM - 11:00 PM",
      "phone": "+1 (555) 123-4567 ext. 1234",
      "enabled": true
    }
  ],
  "policies": {
    "checkIn": "3:00 PM",
    "checkOut": "11:00 AM",
    "cancellation": "24 hours"
  }
}
```

### 2. Room Management

#### Get Room Types
```http
GET /api/dashboard/rooms
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "room-standard-king",
      "name": "Standard King Room",
      "description": "Comfortable king-size bed with city view",
      "basePrice": 129.00,
      "currency": "USD",
      "amenities": ["wifi", "tv", "air_conditioning"],
      "maxOccupancy": 2,
      "size": "300 sq ft",
      "images": ["room1.jpg", "room2.jpg"]
    }
  ]
}
```

#### Add/Update Room Type
```http
POST /api/dashboard/rooms
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Deluxe Suite",
  "description": "Spacious suite with separate living area",
  "basePrice": 299.00,
  "currency": "USD",
  "amenities": ["wifi", "tv", "minibar", "balcony"],
  "maxOccupancy": 4,
  "size": "600 sq ft"
}
```

---

## 🤖 Assistant Configuration API

### 1. Generate Assistant

#### Create New Assistant
```http
POST /api/dashboard/generate-assistant
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "hotelData": {
    "name": "Grand Plaza Hotel",
    "services": [/* services array */],
    "amenities": [/* amenities array */],
    "policies": {/* policies object */}
  },
  "customization": {
    "personality": "friendly",
    "voiceId": "sarah-professional",
    "languages": ["en-US", "es-ES", "fr-FR"],
    "tone": "professional",
    "brandName": "Grand Plaza AI Concierge"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assistantId": "asst_abc123",
    "vapiAssistantId": "vapi_xyz789",
    "generatedPrompt": "You are the AI concierge for Grand Plaza Hotel...",
    "knowledgeBase": "Generated knowledge base content...",
    "estimatedSetupTime": "3-5 minutes",
    "status": "generating"
  }
}
```

#### Get Assistant Configuration
```http
GET /api/dashboard/assistant-config
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assistantId": "asst_abc123",
    "vapiAssistantId": "vapi_xyz789",
    "personality": "friendly",
    "voiceId": "sarah-professional",
    "languages": ["en-US", "es-ES", "fr-FR"],
    "systemPrompt": "You are the AI concierge...",
    "functions": [
      {
        "name": "order_room_service",
        "description": "Order room service for guests",
        "parameters": {/* function parameters */}
      }
    ],
    "status": "active",
    "lastUpdated": "2024-01-20T14:45:00Z"
  }
}
```

#### Update Assistant Configuration
```http
PUT /api/dashboard/assistant-config
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "personality": "professional",
  "voiceId": "michael-warm",
  "languages": ["en-US", "es-ES", "fr-FR", "de-DE"],
  "customPrompt": "Additional instructions for the assistant...",
  "functions": [
    {
      "name": "book_spa_appointment",
      "enabled": true,
      "parameters": {/* updated parameters */}
    }
  ]
}
```

### 2. Voice Configuration

#### Get Available Voices
```http
GET /api/dashboard/voices
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sarah-professional",
      "name": "Sarah",
      "description": "Professional Female, US accent",
      "language": "en-US",
      "gender": "female",
      "style": "professional",
      "previewUrl": "https://audio.talk2go.online/voices/sarah-preview.mp3"
    },
    {
      "id": "michael-warm",
      "name": "Michael",
      "description": "Warm Male, British accent",
      "language": "en-GB",
      "gender": "male",
      "style": "warm",
      "previewUrl": "https://audio.talk2go.online/voices/michael-preview.mp3"
    }
  ]
}
```

#### Test Voice Configuration
```http
POST /api/dashboard/test-voice
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "voiceId": "sarah-professional",
  "text": "Hello, welcome to Grand Plaza Hotel. How may I assist you today?",
  "language": "en-US"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audioUrl": "https://audio.talk2go.online/test/generated-audio.mp3",
    "duration": 4.2,
    "expiresAt": "2024-01-20T15:00:00Z"
  }
}
```

---

## 📊 Analytics & Reporting API

### 1. Usage Analytics

#### Get Dashboard Metrics
```http
GET /api/dashboard/metrics
Authorization: Bearer <jwt_token>
Query Parameters:
- startDate: 2024-01-01
- endDate: 2024-01-31
- granularity: daily|weekly|monthly
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCalls": 4247,
    "successfulCalls": 3993,
    "successRate": 0.940,
    "averageCallDuration": 154.2,
    "guestSatisfaction": 4.7,
    "topLanguages": [
      {"language": "en-US", "percentage": 65.2},
      {"language": "es-ES", "percentage": 20.1},
      {"language": "fr-FR", "percentage": 10.3}
    ],
    "topRequestTypes": [
      {"type": "room_service", "count": 1487, "percentage": 35.0},
      {"type": "hotel_info", "count": 1062, "percentage": 25.0},
      {"type": "local_recommendations", "count": 849, "percentage": 20.0}
    ],
    "hourlyDistribution": [
      {"hour": 0, "calls": 12},
      {"hour": 1, "calls": 8},
      /* ... */
      {"hour": 23, "calls": 15}
    ]
  }
}
```

#### Get Conversation Analytics
```http
GET /api/dashboard/conversations
Authorization: Bearer <jwt_token>
Query Parameters:
- page: 1
- limit: 50
- startDate: 2024-01-01
- endDate: 2024-01-31
- language: en-US
- rating: 5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv-123",
        "startTime": "2024-01-20T14:30:00Z",
        "endTime": "2024-01-20T14:33:45Z",
        "duration": 225,
        "language": "en-US",
        "guestRating": 5,
        "resolved": true,
        "requestType": "room_service",
        "transcript": "Guest: I'd like to order room service...",
        "summary": "Guest ordered room service for room 204"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1247,
      "pages": 25
    }
  }
}
```

### 2. Performance Analytics

#### Get Performance Metrics
```http
GET /api/dashboard/performance
Authorization: Bearer <jwt_token>
Query Parameters:
- period: 7d|30d|90d|1y
```

**Response:**
```json
{
  "success": true,
  "data": {
    "responseTime": {
      "average": 0.85,
      "p95": 1.2,
      "p99": 2.1
    },
    "resolution": {
      "firstCallResolution": 0.89,
      "escalationRate": 0.11,
      "averageResolutionTime": 142.3
    },
    "quality": {
      "understandingAccuracy": 0.96,
      "responseRelevance": 0.94,
      "taskCompletion": 0.91
    },
    "trends": [
      {
        "date": "2024-01-20",
        "calls": 156,
        "successRate": 0.94,
        "satisfaction": 4.8
      }
    ]
  }
}
```

### 3. Custom Reports

#### Generate Custom Report
```http
POST /api/dashboard/reports
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reportType": "performance",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "metrics": [
    "totalCalls",
    "successRate",
    "guestSatisfaction",
    "languageDistribution"
  ],
  "groupBy": "daily",
  "format": "pdf",
  "includeCharts": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "report-456",
    "status": "generating",
    "estimatedTime": "2-3 minutes",
    "downloadUrl": null
  }
}
```

#### Get Report Status
```http
GET /api/dashboard/reports/{reportId}
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "report-456",
    "status": "completed",
    "downloadUrl": "https://reports.talk2go.online/report-456.pdf",
    "generatedAt": "2024-01-20T15:30:00Z",
    "expiresAt": "2024-01-27T15:30:00Z"
  }
}
```

---

## 🏢 Tenant Management API

### 1. Tenant Information

#### Get Tenant Details
```http
GET /api/dashboard/tenant
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tenant-456",
    "hotelName": "Grand Plaza Hotel",
    "subdomain": "grandplaza",
    "customDomain": "assistant.grandplaza.com",
    "subscriptionPlan": "professional",
    "subscriptionStatus": "active",
    "trialEndsAt": null,
    "features": {
      "maxVoices": 20,
      "maxLanguages": 6,
      "voiceCloning": true,
      "multiLocation": false,
      "whiteLabel": true,
      "dataRetentionDays": 90,
      "monthlyCallLimit": 5000
    },
    "usage": {
      "callsThisMonth": 2847,
      "callsUsedPercentage": 56.9,
      "languagesActive": 4,
      "dataStorageUsed": "2.4 GB"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Tenant Settings
```http
PUT /api/dashboard/tenant
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "hotelName": "Grand Plaza Hotel & Spa",
  "customDomain": "concierge.grandplaza.com",
  "settings": {
    "timezone": "America/New_York",
    "currency": "USD",
    "language": "en-US",
    "notifications": {
      "emailReports": true,
      "systemAlerts": true,
      "guestFeedback": true
    }
  }
}
```

### 2. Subscription Management

#### Get Subscription Details
```http
GET /api/dashboard/subscription
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plan": "professional",
    "status": "active",
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "renewalDate": "2024-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "trialEnd": null,
    "features": {
      "monthlyCalls": 5000,
      "languages": 6,
      "voiceCloning": true,
      "prioritySupport": true,
      "customBranding": true
    },
    "billing": {
      "amount": 9900,
      "currency": "USD",
      "interval": "month",
      "paymentMethod": "card",
      "lastPayment": "2024-01-01T00:00:00Z",
      "nextPayment": "2024-02-01T00:00:00Z"
    }
  }
}
```

#### Update Subscription
```http
PUT /api/dashboard/subscription
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "plan": "enterprise",
  "billingInterval": "annual"
}
```

### 3. User Management

#### Get Team Members
```http
GET /api/dashboard/users
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "email": "john@grandplaza.com",
      "name": "John Smith",
      "role": "admin",
      "status": "active",
      "lastLogin": "2024-01-20T14:30:00Z",
      "permissions": [
        "manage_assistant",
        "view_analytics",
        "manage_users",
        "manage_billing"
      ],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Invite User
```http
POST /api/dashboard/users/invite
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "email": "sarah@grandplaza.com",
  "name": "Sarah Johnson",
  "role": "manager",
  "permissions": [
    "manage_assistant",
    "view_analytics"
  ]
}
```

---

## 🔌 WebSocket API

### Real-time Updates

#### Connection
```javascript
const ws = new WebSocket('wss://api.talk2go.online/ws');

// Send authentication
ws.onopen = function() {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }));
};

// Listen for real-time updates
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

#### Event Types

**New Conversation:**
```json
{
  "type": "conversation_started",
  "data": {
    "conversationId": "conv-123",
    "language": "en-US",
    "startTime": "2024-01-20T14:30:00Z",
    "guestInfo": {
      "room": "204",
      "preferredLanguage": "en-US"
    }
  }
}
```

**Conversation Ended:**
```json
{
  "type": "conversation_ended",
  "data": {
    "conversationId": "conv-123",
    "duration": 145,
    "resolved": true,
    "rating": 5,
    "summary": "Guest ordered room service"
  }
}
```

**System Alert:**
```json
{
  "type": "system_alert",
  "data": {
    "level": "warning",
    "message": "High call volume detected",
    "timestamp": "2024-01-20T14:30:00Z"
  }
}
```

#### Subscribing to Events
```javascript
// Subscribe to specific event types
ws.send(JSON.stringify({
  type: 'subscribe',
  events: ['conversation_started', 'conversation_ended', 'system_alert']
}));
```

---

## 🪝 Webhooks

### Webhook Configuration

#### Register Webhook
```http
POST /api/dashboard/webhooks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "url": "https://your-hotel.com/webhook",
  "events": [
    "conversation.ended",
    "order.placed",
    "feedback.received"
  ],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

#### Conversation Ended
```json
{
  "event": "conversation.ended",
  "timestamp": "2024-01-20T14:33:45Z",
  "data": {
    "conversationId": "conv-123",
    "tenantId": "tenant-456",
    "duration": 225,
    "language": "en-US",
    "resolved": true,
    "rating": 5,
    "transcript": "Guest: I'd like to order room service...",
    "summary": "Guest ordered room service for room 204",
    "actions": [
      {
        "type": "order_placed",
        "orderId": "order-789",
        "items": ["Caesar Salad", "Grilled Salmon"]
      }
    ]
  }
}
```

#### Order Placed
```json
{
  "event": "order.placed",
  "timestamp": "2024-01-20T14:32:00Z",
  "data": {
    "orderId": "order-789",
    "conversationId": "conv-123",
    "tenantId": "tenant-456",
    "guest": {
      "room": "204",
      "name": "John Doe"
    },
    "items": [
      {
        "name": "Caesar Salad",
        "quantity": 1,
        "price": 12.99
      },
      {
        "name": "Grilled Salmon",
        "quantity": 1,
        "price": 28.99
      }
    ],
    "total": 41.98,
    "currency": "USD",
    "deliveryTime": "2024-01-20T15:00:00Z",
    "specialInstructions": "No croutons on salad"
  }
}
```

#### Feedback Received
```json
{
  "event": "feedback.received",
  "timestamp": "2024-01-20T14:35:00Z",
  "data": {
    "conversationId": "conv-123",
    "tenantId": "tenant-456",
    "rating": 5,
    "comment": "The AI assistant was very helpful and professional!",
    "categories": {
      "helpfulness": 5,
      "accuracy": 5,
      "speed": 4,
      "voice_quality": 5
    }
  }
}
```

### Webhook Verification

Verify webhook signatures using the secret:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  const expected = `sha256=${digest}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

---

## ⚠️ Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "hotelName",
      "reason": "Hotel name is required"
    },
    "timestamp": "2024-01-20T14:30:00Z",
    "requestId": "req-abc123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `TENANT_NOT_FOUND` | 404 | Tenant does not exist |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | API rate limit exceeded |
| `SUBSCRIPTION_EXPIRED` | 402 | Subscription has expired |
| `FEATURE_NOT_AVAILABLE` | 403 | Feature not available in current plan |
| `ASSISTANT_GENERATION_FAILED` | 500 | Failed to generate assistant |
| `VAPI_API_ERROR` | 502 | Error communicating with Vapi API |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### Error Handling Best Practices

```javascript
// Example error handling
try {
  const response = await fetch('/api/dashboard/hotel-profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    switch (error.error.code) {
      case 'INVALID_TOKEN':
        // Redirect to login
        break;
      case 'SUBSCRIPTION_EXPIRED':
        // Show upgrade modal
        break;
      case 'RATE_LIMIT_EXCEEDED':
        // Retry after delay
        break;
      default:
        // Show generic error
        break;
    }
  }
  
  const data = await response.json();
  // Handle success
} catch (error) {
  console.error('Network error:', error);
}
```

---

## 🚦 Rate Limiting

### Rate Limits by Plan

| Plan | Requests/Hour | Burst Limit |
|------|---------------|-------------|
| Trial | 100 | 20 |
| Basic | 1,000 | 100 |
| Professional | 5,000 | 500 |
| Enterprise | 50,000 | 5,000 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
Retry-After: 60
```

### Rate Limiting Best Practices

```javascript
// Implement exponential backoff
async function apiCall(url, options, retries = 3) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retries) * 1000;
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiCall(url, options, retries - 1);
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}
```

---

## 🛠️ SDKs & Examples

### JavaScript SDK

#### Installation
```bash
npm install @talk2go/hotel-assistant-sdk
```

#### Usage
```javascript
import { HotelAssistantSDK } from '@talk2go/hotel-assistant-sdk';

const sdk = new HotelAssistantSDK({
  apiKey: 'your-api-key',
  environment: 'production' // or 'development'
});

// Research hotel
const hotelData = await sdk.hotels.research({
  name: 'Grand Plaza Hotel',
  location: 'New York, NY'
});

// Generate assistant
const assistant = await sdk.assistants.create({
  hotelData,
  customization: {
    personality: 'friendly',
    voiceId: 'sarah-professional',
    languages: ['en-US', 'es-ES']
  }
});

// Get analytics
const metrics = await sdk.analytics.getMetrics({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Python SDK

#### Installation
```bash
pip install talk2go-hotel-assistant
```

#### Usage
```python
from talk2go import HotelAssistantClient

client = HotelAssistantClient(
    api_key="your-api-key",
    environment="production"
)

# Research hotel
hotel_data = client.hotels.research(
    name="Grand Plaza Hotel",
    location="New York, NY"
)

# Generate assistant
assistant = client.assistants.create(
    hotel_data=hotel_data,
    customization={
        "personality": "friendly",
        "voice_id": "sarah-professional",
        "languages": ["en-US", "es-ES"]
    }
)

# Get analytics
metrics = client.analytics.get_metrics(
    start_date="2024-01-01",
    end_date="2024-01-31"
)
```

### PHP SDK

#### Installation
```bash
composer require talk2go/hotel-assistant-php
```

#### Usage
```php
<?php
use Talk2Go\HotelAssistant\Client;

$client = new Client([
    'api_key' => 'your-api-key',
    'environment' => 'production'
]);

// Research hotel
$hotelData = $client->hotels()->research([
    'name' => 'Grand Plaza Hotel',
    'location' => 'New York, NY'
]);

// Generate assistant
$assistant = $client->assistants()->create([
    'hotel_data' => $hotelData,
    'customization' => [
        'personality' => 'friendly',
        'voice_id' => 'sarah-professional',
        'languages' => ['en-US', 'es-ES']
    ]
]);

// Get analytics
$metrics = $client->analytics()->getMetrics([
    'start_date' => '2024-01-01',
    'end_date' => '2024-01-31'
]);
```

### cURL Examples

#### Research Hotel
```bash
curl -X POST https://api.talk2go.online/api/dashboard/research-hotel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelName": "Grand Plaza Hotel",
    "location": "New York, NY"
  }'
```

#### Get Analytics
```bash
curl -X GET "https://api.talk2go.online/api/dashboard/metrics?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Assistant
```bash
curl -X PUT https://api.talk2go.online/api/dashboard/assistant-config \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "personality": "professional",
    "voiceId": "michael-warm",
    "languages": ["en-US", "es-ES", "fr-FR"]
  }'
```

---

## 🔗 Additional Resources

### Documentation Links
- [Getting Started Guide](https://docs.talk2go.online/getting-started)
- [Authentication Guide](https://docs.talk2go.online/authentication)
- [Webhooks Guide](https://docs.talk2go.online/webhooks)
- [SDKs Repository](https://github.com/talk2go/sdks)

### Support
- **Email**: api-support@talk2go.online
- **Documentation**: https://docs.talk2go.online
- **Status Page**: https://status.talk2go.online
- **Community**: https://community.talk2go.online

### Changelog
- **v2.0.0** (2024-01-20): Multi-tenant support, new analytics endpoints
- **v1.5.0** (2024-01-10): Webhooks, real-time updates
- **v1.0.0** (2024-01-01): Initial API release

---

*This API documentation is regularly updated. For the latest version, please visit our [documentation portal](https://docs.talk2go.online).*

**Last Updated:** January 2024  
**API Version:** 2.0  
**Support:** api-support@talk2go.online 