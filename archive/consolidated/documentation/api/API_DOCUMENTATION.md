# API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
6. [WebSocket Events](#websocket-events)
7. [Rate Limiting](#rate-limiting)
8. [Examples](#examples)

## Overview

The Hotel Assistant API provides RESTful endpoints for managing hotel operations, voice calls,
orders, and analytics. All endpoints support multi-tenancy and require proper authentication.

### API Versioning

- Current Version: `v1`
- Base URL: `https://api.hotelassistant.com/v1`
- Content-Type: `application/json`

## Authentication

### JWT Token Authentication

All API endpoints require authentication via JWT tokens.

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123",
  "tenantId": "optional-tenant-id"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "tenantId": "tenant-uuid"
    },
    "tenant": {
      "id": "tenant-uuid",
      "hotelName": "Mi Nhon Hotel",
      "subscriptionPlan": "premium",
      "subscriptionStatus": "active"
    }
  }
}
```

#### Using the Token

Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

```http
POST /auth/refresh
Content-Type: application/json

{
  "token": "refresh-token"
}
```

## Base URL

### Development

```
http://localhost:3000
```

### Production

```
https://api.hotelassistant.com
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "status": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Common Error Codes

```json
{
  "AUTH_001": "Invalid credentials",
  "AUTH_002": "Token expired",
  "AUTH_003": "Insufficient permissions",
  "VAL_001": "Missing required field",
  "VAL_002": "Invalid email format",
  "DB_001": "Database connection error",
  "EXT_001": "External service unavailable"
}
```

## Endpoints

### Authentication

#### POST /auth/login

Authenticate user and get access token.

**Request Body:**

```json
{
  "username": "string",
  "password": "string",
  "tenantId": "string (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "number",
      "username": "string",
      "role": "admin|staff|manager",
      "tenantId": "string"
    },
    "tenant": {
      "id": "string",
      "hotelName": "string",
      "subscriptionPlan": "string",
      "subscriptionStatus": "string"
    }
  }
}
```

#### POST /auth/refresh

Refresh access token.

**Request Body:**

```json
{
  "token": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "string",
    "expiresIn": "number"
  }
}
```

### Calls

#### POST /calls/start

Start a new voice call.

**Request Body:**

```json
{
  "roomNumber": "string",
  "language": "en|fr|zh|ru|ko|vi",
  "serviceType": "string (optional)",
  "tenantId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "callId": "string",
    "vapiCallId": "string",
    "roomNumber": "string",
    "language": "string",
    "startTime": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /calls/end

End an active call.

**Request Body:**

```json
{
  "callId": "string",
  "duration": "number",
  "tenantId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "callId": "string",
    "endTime": "2024-01-01T00:00:00.000Z",
    "duration": "number"
  }
}
```

#### GET /calls/:id

Get call details.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "callIdVapi": "string",
    "roomNumber": "string",
    "language": "string",
    "serviceType": "string",
    "duration": "number",
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": "2024-01-01T00:00:00.000Z",
    "tenantId": "string"
  }
}
```

#### GET /calls

Get paginated list of calls.

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `sortBy` (string, default: "startTime")
- `sortOrder` (string, default: "desc")
- `roomNumber` (string, optional)
- `language` (string, optional)
- `serviceType` (string, optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "callIdVapi": "string",
      "roomNumber": "string",
      "language": "string",
      "serviceType": "string",
      "duration": "number",
      "startTime": "2024-01-01T00:00:00.000Z",
      "endTime": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Transcripts

#### POST /transcripts

Save a transcript entry.

**Request Body:**

```json
{
  "callId": "string",
  "role": "user|assistant",
  "content": "string",
  "tenantId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "number",
    "callId": "string",
    "role": "string",
    "content": "string",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /transcripts/:callId

Get transcripts for a specific call.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "callId": "string",
      "role": "string",
      "content": "string",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "isModelOutput": "boolean"
    }
  ]
}
```

### Orders/Requests

#### POST /orders

Create a new order/request.

**Request Body:**

```json
{
  "roomNumber": "string",
  "orderId": "string",
  "requestContent": "string",
  "tenantId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "number",
    "roomNumber": "string",
    "orderId": "string",
    "requestContent": "string",
    "status": "string",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /orders

Get paginated list of orders.

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional)
- `roomNumber` (string, optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "roomNumber": "string",
      "orderId": "string",
      "requestContent": "string",
      "status": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### PATCH /orders/:orderId/status

Update order status.

**Request Body:**

```json
{
  "status": "pending|in-progress|completed|cancelled",
  "tenantId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "number",
    "orderId": "string",
    "status": "string",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Messages

#### POST /messages

Send a message for an order.

**Request Body:**

```json
{
  "requestId": "number",
  "sender": "string",
  "content": "string",
  "tenantId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "number",
    "requestId": "number",
    "sender": "string",
    "content": "string",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /messages/:requestId

Get messages for a specific request.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "requestId": "number",
      "sender": "string",
      "content": "string",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Hotel Management

#### POST /hotel/research

Research hotel information.

**Request Body:**

```json
{
  "hotelName": "string",
  "location": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "name": "string",
    "address": "string",
    "phone": "string",
    "email": "string",
    "website": "string",
    "description": "string",
    "amenities": ["string"],
    "roomTypes": [
      {
        "name": "string",
        "description": "string",
        "price": "number",
        "capacity": "number",
        "amenities": ["string"]
      }
    ],
    "services": [
      {
        "name": "string",
        "description": "string",
        "category": "string",
        "price": "number",
        "availability": "string"
      }
    ],
    "policies": {
      "checkIn": "string",
      "checkOut": "string",
      "cancellation": "string",
      "pets": "boolean",
      "smoking": "boolean"
    }
  }
}
```

#### POST /hotel/generate-assistant

Generate AI assistant configuration.

**Request Body:**

```json
{
  "hotelData": {
    "name": "string",
    "address": "string",
    "phone": "string",
    "email": "string",
    "website": "string",
    "description": "string",
    "amenities": ["string"],
    "roomTypes": ["object"],
    "services": ["object"],
    "policies": "object"
  },
  "customization": {
    "voice": {
      "gender": "male|female",
      "accent": "string",
      "speed": "number"
    },
    "personality": {
      "tone": "professional|friendly|formal|casual",
      "style": "string",
      "language": "string"
    },
    "capabilities": {
      "languages": ["string"],
      "services": ["string"],
      "features": ["string"]
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "assistantId": "string",
    "config": "object",
    "knowledgeBase": "string",
    "systemPrompt": "string"
  }
}
```

#### GET /hotel/profile/:tenantId

Get hotel profile.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "tenantId": "string",
    "researchData": "object",
    "assistantConfig": "object",
    "servicesConfig": "object",
    "knowledgeBase": "string",
    "systemPrompt": "string",
    "vapiAssistantId": "string",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /hotel/config/:tenantId

Update hotel configuration.

**Request Body:**

```json
{
  "assistantConfig": "object",
  "servicesConfig": "object",
  "knowledgeBase": "string (optional)",
  "systemPrompt": "string (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "tenantId": "string",
    "assistantConfig": "object",
    "servicesConfig": "object",
    "knowledgeBase": "string",
    "systemPrompt": "string",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Analytics

#### GET /analytics/:tenantId

Get analytics overview.

**Query Parameters:**

- `startDate` (string, optional)
- `endDate` (string, optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCalls": "number",
      "averageDuration": "number",
      "totalOrders": "number",
      "averageOrderValue": "number"
    },
    "languageDistribution": {
      "en": "number",
      "fr": "number",
      "zh": "number",
      "ru": "number",
      "ko": "number",
      "vi": "number"
    },
    "serviceTypeDistribution": [
      {
        "type": "string",
        "count": "number",
        "percentage": "number"
      }
    ],
    "hourlyActivity": [
      {
        "hour": "number",
        "calls": "number",
        "orders": "number"
      }
    ]
  }
}
```

#### GET /analytics/:tenantId/service-distribution

Get service type distribution.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "type": "string",
      "count": "number",
      "percentage": "number"
    }
  ]
}
```

#### GET /analytics/:tenantId/hourly-activity

Get hourly activity data.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "hour": "number",
      "calls": "number",
      "orders": "number"
    }
  ]
}
```

### Health

#### GET /health

Basic health check.

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /health/detailed

Detailed health check with service status.

**Response:**

```json
{
  "success": true,
  "data": {
    "database": {
      "status": "healthy|degraded|down",
      "responseTime": "number",
      "lastCheck": "2024-01-01T00:00:00.000Z"
    },
    "vapi": {
      "status": "healthy|degraded|down",
      "responseTime": "number",
      "lastCheck": "2024-01-01T00:00:00.000Z"
    },
    "openai": {
      "status": "healthy|degraded|down",
      "responseTime": "number",
      "lastCheck": "2024-01-01T00:00:00.000Z"
    },
    "email": {
      "status": "healthy|degraded|down",
      "responseTime": "number",
      "lastCheck": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## WebSocket Events

### Connection

```javascript
const socket = io("ws://localhost:3000", {
  auth: {
    token: "jwt-token",
  },
});
```

### Client to Server Events

#### init

Initialize connection with tenant context.

```javascript
socket.emit("init", {
  tenantId: "tenant-uuid",
  roomNumber: "101", // optional
  language: "en", // optional
});
```

#### transcript

Send transcript data.

```javascript
socket.emit("transcript", {
  content: "Hello, I need room service",
  role: "user", // 'user' | 'assistant'
});
```

#### call_end

End call with duration.

```javascript
socket.emit("call_end", {
  callId: "call-uuid",
  duration: 300, // seconds
});
```

### Server to Client Events

#### transcript

Receive transcript updates.

```javascript
socket.on("transcript", (data) => {
  console.log("Transcript:", data);
  // {
  //   content: 'Hello, I need room service',
  //   role: 'user',
  //   timestamp: '2024-01-01T00:00:00.000Z',
  //   callId: 'call-uuid'
  // }
});
```

#### order_status_update

Receive order status updates.

```javascript
socket.on("order_status_update", (data) => {
  console.log("Order update:", data);
  // {
  //   orderId: 'order-uuid',
  //   reference: 'REF123',
  //   status: 'in-progress',
  //   timestamp: '2024-01-01T00:00:00.000Z',
  //   roomNumber: '101'
  // }
});
```

#### call_end

Receive call end notification.

```javascript
socket.on("call_end", (data) => {
  console.log("Call ended:", data);
  // {
  //   callId: 'call-uuid',
  //   duration: 300,
  //   timestamp: '2024-01-01T00:00:00.000Z'
  // }
});
```

#### error

Receive error notifications.

```javascript
socket.on("error", (data) => {
  console.error("Error:", data);
  // {
  //   message: 'Error message',
  //   code: 'ERROR_CODE',
  //   timestamp: '2024-01-01T00:00:00.000Z'
  // }
});
```

## Rate Limiting

### Limits

- **Authentication**: 5 requests per minute
- **API Calls**: 100 requests per minute
- **WebSocket**: 1000 messages per minute
- **File Upload**: 10 files per hour

### Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "status": 429,
  "retryAfter": 60
}
```

## Examples

### JavaScript/TypeScript

#### Using Fetch

```javascript
const login = async (username, password) => {
  const response = await fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  return data;
};

const getCalls = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/calls?${queryString}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};
```

#### Using Axios

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.hotelassistant.com",
  timeout: 10000,
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const callsApi = {
  start: (data) => api.post("/calls/start", data),
  end: (data) => api.post("/calls/end", data),
  get: (id) => api.get(`/calls/${id}`),
  list: (params) => api.get("/calls", { params }),
};
```

### cURL Examples

#### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

#### Start Call

```bash
curl -X POST http://localhost:3000/calls/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "roomNumber": "101",
    "language": "en",
    "serviceType": "room-service",
    "tenantId": "tenant-uuid"
  }'
```

#### Get Analytics

```bash
curl -X GET "http://localhost:3000/analytics/tenant-uuid?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Python

#### Using requests

```python
import requests

class HotelAssistantAPI:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()

    def login(self, username, password):
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"username": username, "password": password}
        )
        data = response.json()
        if data["success"]:
            self.token = data["data"]["token"]
            self.session.headers["Authorization"] = f"Bearer {self.token}"
        return data

    def start_call(self, room_number, language, service_type=None):
        response = self.session.post(
            f"{self.base_url}/calls/start",
            json={
                "roomNumber": room_number,
                "language": language,
                "serviceType": service_type,
                "tenantId": "tenant-uuid"
            }
        )
        return response.json()

    def get_analytics(self, tenant_id, start_date=None, end_date=None):
        params = {}
        if start_date:
            params["startDate"] = start_date
        if end_date:
            params["endDate"] = end_date

        response = self.session.get(
            f"{self.base_url}/analytics/{tenant_id}",
            params=params
        )
        return response.json()

# Usage
api = HotelAssistantAPI("http://localhost:3000")
login_result = api.login("admin", "password123")
analytics = api.get_analytics("tenant-uuid")
```

### Postman Collection

Import this collection into Postman:

```json
{
  "info": {
    "name": "Hotel Assistant API",
    "description": "API collection for Hotel Assistant",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Calls",
      "item": [
        {
          "name": "Start Call",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"roomNumber\": \"101\",\n  \"language\": \"en\",\n  \"serviceType\": \"room-service\",\n  \"tenantId\": \"tenant-uuid\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/calls/start",
              "host": ["{{baseUrl}}"],
              "path": ["calls", "start"]
            }
          }
        }
      ]
    }
  ]
}
```
