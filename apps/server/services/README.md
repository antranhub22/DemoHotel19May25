# Hotel Research Services Documentation

## Overview

This directory contains the hotel research engine services that power the multi-tenant SaaS
platform. These services automatically research hotel information and generate knowledge bases for
AI assistants.

## Services

### 1. HotelResearchService (`hotelResearch.ts`)

Automatically researches hotel information using multiple data sources:

**Features:**

- ✅ Google Places API integration for basic hotel info
- ✅ Website scraping for detailed services and amenities
- ✅ Rate limiting and error handling
- ✅ Data validation and sanitization
- ✅ Support for both basic and advanced research tiers

**API Methods:**

- `basicResearch(hotelName, location)` - Basic hotel research using free APIs
- `advancedResearch(hotelName, location)` - Advanced research with paid APIs
- `getServiceHealth()` - Check service status and API availability

**Data Sources:**

- Google Places API (basic info, photos, reviews)
- Website scraping (services, policies, room types)
- Nearby attractions and points of interest

### 2. KnowledgeBaseGenerator (`knowledgeBaseGenerator.ts`)

Generates comprehensive knowledge bases from hotel research data:

**Features:**

- ✅ Knowledge base generation from hotel data
- ✅ System prompt generation for AI assistants
- ✅ FAQ generation from hotel information
- ✅ Service menu generation
- ✅ Customizable personality and tone settings

**API Methods:**

- `generateKnowledgeBase(hotelData)` - Create comprehensive knowledge base
- `generateSystemPrompt(hotelData, customization)` - Generate AI assistant prompt
- `generateFAQSection(hotelData)` - Create FAQ from hotel data
- `generateServiceMenu(hotelData)` - Generate service menu structure

### 3. VapiIntegrationService (`vapiIntegration.ts`)

Dynamic Vapi assistant creation and management for multi-tenant SaaS:

**Features:**

- ✅ Dynamic Vapi assistant creation via API
- ✅ Assistant updating and management
- ✅ Dynamic function generation based on hotel services
- ✅ System prompt template generation
- ✅ Multi-tenant assistant isolation
- ✅ Comprehensive error handling and logging

**API Methods:**

- `createAssistant(config)` - Create new Vapi assistant
- `updateAssistant(id, config)` - Update existing assistant
- `deleteAssistant(id)` - Delete assistant
- `getAssistant(id)` - Get assistant details
- `listAssistants()` - List all assistants
- `getServiceHealth()` - Check Vapi API connection

**Assistant Generator:**

- `generateAssistant(hotelData, customization)` - Generate complete assistant
- `updateAssistant(id, hotelData, customization)` - Update assistant with new data
- Dynamic function generation for: room service, housekeeping, transportation, spa, concierge
- Customizable personality, tone, voice, and background settings

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Required for Google Places API
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Required for Vapi assistant creation
VAPI_API_KEY=your_vapi_api_key_here

# Optional for advanced research
SOCIAL_MEDIA_API_KEYS=your_social_media_api_keys_here
SCRAPING_SERVICE_URL=your_scraping_service_url_here
```

### Google Places API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Places API
4. Create credentials (API Key)
5. Add API key to `.env` file

## Usage Examples

### Basic Hotel Research

```typescript
import { HotelResearchService } from './services/hotelResearch';

const research = new HotelResearchService();
const hotelData = await research.basicResearch('Grand Hotel Saigon', 'Ho Chi Minh City');
```

### Generate Knowledge Base

```typescript
import { KnowledgeBaseGenerator } from './services/knowledgeBaseGenerator';

const generator = new KnowledgeBaseGenerator();
const knowledgeBase = generator.generateKnowledgeBase(hotelData);
const systemPrompt = generator.generateSystemPrompt(hotelData, {
  personality: 'professional',
  tone: 'friendly',
  languages: ['English', 'Vietnamese'],
});
```

### Health Check

```typescript
const health = await research.getServiceHealth();
console.log('Service status:', health.status);
console.log('APIs available:', health.apis);
```

### Generate Vapi Assistant

```typescript
import { VapiIntegrationService, AssistantGeneratorService } from './services/vapiIntegration';

const assistantGenerator = new AssistantGeneratorService();
const assistantId = await assistantGenerator.generateAssistant(hotelData, {
  personality: 'professional',
  tone: 'friendly',
  languages: ['English', 'Vietnamese'],
  voiceId: 'jennifer',
  backgroundSound: 'hotel-lobby',
});

console.log('Assistant created:', assistantId);
```

### Update Assistant

```typescript
await assistantGenerator.updateAssistant(assistantId, updatedHotelData, {
  personality: 'luxurious',
  tone: 'formal',
  languages: ['English'],
  voiceId: 'premium-voice',
});
```

## Error Handling

The services include comprehensive error handling:

- **HotelResearchError**: Custom error class for research failures
- **Rate limiting**: Automatic rate limiting to prevent API abuse
- **Graceful degradation**: Services work even if some APIs are unavailable
- **Data validation**: Input/output validation using Zod schemas

## Rate Limiting

- **Basic research**: 100 requests per hour per service
- **Advanced research**: 50 requests per hour per service
- **Google Places API**: Respects Google's rate limits

## Testing

The services include comprehensive test coverage:

```bash
# Run hotel research tests
npm run test:hotel-research
```

## Integration

These services integrate with:

- **Dashboard API**: Provides research and assistant creation endpoints for setup wizard
- **Database**: Stores research results and assistant IDs in `hotel_profiles` table
- **Multi-tenant System**: Each tenant gets isolated assistants and data
- **Knowledge Base Flow**: Research → Knowledge Base → System Prompt → Vapi Assistant
- **Dynamic Functions**: Hotel services automatically generate corresponding Vapi functions
- **Real-time Updates**: Assistant configurations update when hotel data changes

## Next Steps

1. ✅ Phase 2: Hotel Research Engine - **COMPLETED**
2. ✅ Phase 3: Dynamic Vapi Assistant Creation - **COMPLETED**
3. 🔄 Phase 4: Dashboard Frontend
4. 🔄 Phase 5: API Routes & Integration

---

_Generated as part of the Mi Nhon Hotel → Multi-tenant SaaS transformation_
