# Dashboard API Routes Documentation

## Overview

The dashboard API routes provide comprehensive SaaS functionality for the multi-tenant hotel voice assistant platform. These routes power the setup wizard, assistant management, and analytics dashboard.

## Base URL

All dashboard routes are prefixed with `/api/dashboard/`

## Authentication & Authorization

All routes require:
- ✅ **JWT Authentication** - Valid Bearer token in Authorization header
- ✅ **Tenant Identification** - Tenant extracted from JWT token
- ✅ **Row-Level Security** - Automatic tenant data isolation
- ✅ **Subscription Limits** - Automatic limit checking
- ✅ **Feature Gates** - Plan-based feature access control

## API Endpoints

### 1. Hotel Research

#### `POST /api/dashboard/research-hotel`

Automatically research hotel information using Google Places API and web scraping.

**Request Body:**
```json
{
  "hotelName": "Grand Hotel Saigon",
  "location": "Ho Chi Minh City", // Optional
  "researchTier": "basic" // "basic" | "advanced"
}
```

**Response:**
```json
{
  "success": true,
  "hotelData": {
    "name": "Grand Hotel Saigon",
    "address": "8 Dong Khoi Street, Ho Chi Minh City",
    "phone": "+84 28 3915 5555",
    "website": "https://grandhotelsaigon.com",
    "rating": 4.5,
    "location": { "lat": 10.7769, "lng": 106.7009 },
    "services": [...],
    "amenities": [...],
    "roomTypes": [...],
    "localAttractions": [...]
  },
  "knowledgeBase": "Generated knowledge base text...",
  "researchTier": "basic",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

**Features:**
- Google Places API integration
- Website scraping for detailed info
- Automatic knowledge base generation
- Basic/Advanced research tiers
- Rate limiting and error handling

### 2. Assistant Generation

#### `POST /api/dashboard/generate-assistant`

Generate a Vapi AI assistant from hotel research data.

**Request Body:**
```json
{
  "hotelData": {
    // Hotel data from research endpoint
  },
  "customization": {
    "personality": "professional", // professional, friendly, luxurious, casual, enthusiastic
    "tone": "friendly", // formal, friendly, warm, energetic, calm
    "languages": ["English", "Vietnamese"],
    "voiceId": "jennifer", // Optional
    "silenceTimeout": 30, // 10-120 seconds
    "maxDuration": 1800, // 300-3600 seconds
    "backgroundSound": "hotel-lobby" // office, off, hotel-lobby
  }
}
```

**Response:**
```json
{
  "success": true,
  "assistantId": "asst_abc123def456",
  "customization": {
    // Applied customization settings
  },
  "systemPrompt": "Generated system prompt...",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

**Features:**
- Dynamic Vapi assistant creation
- Customizable personality and voice settings
- Automatic function generation based on hotel services
- Knowledge base integration
- Multi-language support

### 3. Hotel Profile

#### `GET /api/dashboard/hotel-profile`

Get complete hotel profile, assistant status, and tenant information.

**Response:**
```json
{
  "success": true,
  "profile": {
    "tenantId": "tenant_123",
    "hasResearchData": true,
    "hasAssistant": true,
    "assistantId": "asst_abc123def456",
    "assistantStatus": "active", // not_created, active, error
    "assistantConfig": {
      "personality": "professional",
      "tone": "friendly",
      "languages": ["English", "Vietnamese"]
    },
    "knowledgeBase": "Generated knowledge base...",
    "systemPrompt": "Assistant system prompt...",
    "createdAt": "2024-01-20T09:00:00Z",
    "updatedAt": "2024-01-20T10:30:00Z"
  },
  "tenant": {
    "hotelName": "Grand Hotel Saigon",
    "subdomain": "grandhotelsaigon",
    "subscriptionPlan": "premium",
    "subscriptionStatus": "active",
    "trialEndsAt": null
  },
  "usage": {
    "callsThisMonth": 156,
    "voicesUsed": 2,
    "languagesUsed": 3,
    "storageUsed": 45, // KB
    "dataRetentionDays": 365
  },
  "limits": {
    "maxVoices": 15,
    "maxLanguages": 8,
    "monthlyCallLimit": 5000,
    "dataRetentionDays": 365,
    "maxStaffUsers": 15,
    "maxHotelLocations": 5
  },
  "features": {
    "voiceCloning": true,
    "multiLocation": true,
    "whiteLabel": false,
    "advancedAnalytics": true,
    "customIntegrations": true,
    "prioritySupport": true,
    "apiAccess": true,
    "bulkOperations": true
  }
}
```

**Features:**
- Complete tenant overview
- Assistant status monitoring
- Usage and limit tracking
- Feature flag status
- Setup progress tracking

### 4. Assistant Configuration

#### `PUT /api/dashboard/assistant-config`

Update assistant configuration and settings.

**Request Body:**
```json
{
  "personality": "luxurious", // Optional
  "tone": "formal", // Optional
  "languages": ["English"], // Optional
  "voiceId": "premium-voice", // Optional
  "silenceTimeout": 45, // Optional
  "maxDuration": 2400, // Optional
  "backgroundSound": "office", // Optional
  "systemPrompt": "Custom system prompt..." // Optional
}
```

**Response:**
```json
{
  "success": true,
  "updatedConfig": {
    // Merged configuration
  },
  "assistantId": "asst_abc123def456",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

**Features:**
- Partial configuration updates
- Real-time Vapi assistant updates
- Configuration merging
- System prompt customization

### 5. Analytics

#### `GET /api/dashboard/analytics`

Get tenant-filtered analytics data with plan-based access.

**Response (Premium Plan):**
```json
{
  "success": true,
  "analytics": {
    "overview": {
      "totalCalls": 1250,
      "averageDuration": "2:15",
      "successRate": 95.2,
      "topLanguages": ["English", "Vietnamese"],
      "callsThisMonth": 156,
      "growthRate": 12.5
    },
    "serviceDistribution": [
      { "service": "Room Service", "calls": 450, "percentage": 36 },
      { "service": "Concierge", "calls": 300, "percentage": 24 },
      { "service": "Housekeeping", "calls": 250, "percentage": 20 }
    ],
    "hourlyActivity": [
      { "hour": "09:00", "calls": 15 },
      { "hour": "10:00", "calls": 25 },
      { "hour": "11:00", "calls": 35 }
    ]
  },
  "tier": "advanced",
  "tenantId": "tenant_123"
}
```

**Response (Basic Plan):**
```json
{
  "success": true,
  "analytics": {
    "overview": {
      "totalCalls": 1250,
      "averageDuration": "2:15"
    }
  },
  "tier": "basic",
  "tenantId": "tenant_123",
  "upgradeMessage": "Upgrade to premium for detailed analytics"
}
```

**Features:**
- Plan-based analytics access
- Tenant-filtered data
- Real-time metrics
- Growth tracking
- Service distribution analysis

### 6. Service Health

#### `GET /api/dashboard/service-health`

Check health status of all integrated services.

**Response:**
```json
{
  "overall": "healthy", // healthy, degraded, down
  "services": {
    "hotelResearch": {
      "status": "healthy",
      "apis": {
        "googlePlaces": "available",
        "webScraping": "available"
      }
    },
    "vapi": {
      "status": "healthy",
      "connectionTime": 145,
      "apiVersion": "v1"
    },
    "tenant": {
      "status": "healthy",
      "tenantsCount": 25,
      "activeSubscriptions": 20
    }
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

**Features:**
- Multi-service health monitoring
- API availability checking
- Performance metrics
- Real-time status updates

### 7. Reset Assistant (Development)

#### `DELETE /api/dashboard/reset-assistant`

Delete and reset assistant for testing/development.

**Requires:** `apiAccess` feature flag

**Response:**
```json
{
  "success": true,
  "message": "Assistant has been reset. You can now generate a new one.",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

**Features:**
- Development/testing utility
- Complete assistant cleanup
- Vapi API integration cleanup
- Database state reset

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error description",
  "message": "Detailed error message",
  "code": "ERROR_CODE",
  "type": "ErrorType"
}
```

### Common Error Codes

- `RATE_LIMIT_EXCEEDED` - API rate limit reached
- `FEATURE_NOT_AVAILABLE` - Feature not in subscription plan
- `SUBSCRIPTION_LIMITS_EXCEEDED` - Usage limits exceeded
- `TENANT_NOT_FOUND` - Tenant not found
- `ASSISTANT_NOT_FOUND` - Assistant not created yet
- `VALIDATION_FAILED` - Request validation failed

## Security Features

### Multi-Tenant Isolation

- **Row-Level Security** - All data queries filtered by tenant ID
- **Feature Gates** - Plan-based feature access control
- **Rate Limiting** - Per-tenant rate limiting
- **Data Validation** - Comprehensive input validation

### Subscription Management

- **Usage Tracking** - Real-time usage monitoring
- **Limit Enforcement** - Automatic limit checking
- **Feature Flags** - Dynamic feature toggling
- **Plan Validation** - Subscription status verification

## Integration

### Services Used

- **HotelResearchService** - Google Places API + web scraping
- **AssistantGeneratorService** - Vapi assistant creation
- **VapiIntegrationService** - Vapi API management
- **KnowledgeBaseGenerator** - AI knowledge base generation
- **TenantService** - Multi-tenant management

### Database Tables

- **hotel_profiles** - Hotel research data and assistant info
- **tenants** - Tenant configuration and subscription info
- **call/transcript** - Analytics data with tenant filtering

### External APIs

- **Google Places API** - Hotel research
- **Vapi AI API** - Assistant creation and management
- **Web Scraping** - Additional hotel information

## Usage Examples

### Complete Setup Flow

```javascript
// 1. Research hotel
const researchResponse = await fetch('/api/dashboard/research-hotel', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    hotelName: 'Grand Hotel Saigon',
    location: 'Ho Chi Minh City',
    researchTier: 'basic'
  })
});

// 2. Generate assistant
const assistantResponse = await fetch('/api/dashboard/generate-assistant', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    hotelData: researchResponse.hotelData,
    customization: {
      personality: 'professional',
      tone: 'friendly',
      languages: ['English', 'Vietnamese']
    }
  })
});

// 3. Get profile status
const profileResponse = await fetch('/api/dashboard/hotel-profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Update Configuration

```javascript
const updateResponse = await fetch('/api/dashboard/assistant-config', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    personality: 'luxurious',
    tone: 'formal',
    voiceId: 'premium-voice'
  })
});
```

---

## Implementation Status

✅ **COMPLETED** - All dashboard API routes implemented
✅ **COMPLETED** - Tenant middleware integration
✅ **COMPLETED** - Service integration
✅ **COMPLETED** - Error handling and validation
✅ **COMPLETED** - Feature gates and subscription limits
✅ **COMPLETED** - Documentation and examples

**Next Steps:**
- Phase 4: Dashboard Frontend Implementation
- Phase 5: Frontend-Backend Integration Testing

---

*Part of the Mi Nhon Hotel → Multi-tenant SaaS transformation* 