# 🎯 **Cursor Implementation Plan - Step by Step**

## **📋 Tổng quan Implementation**

### **🔄 Flow Chính**
```
Hotel Name Input → Research APIs → Build Knowledge Base → Create Vapi Assistant → Dashboard Ready
```

### **🏗️ Architecture Overview**
```
Current MVP (Mi Nhon Hotel) → Migrate to Multi-tenant SaaS Platform
├── Keep existing voice assistant functionality
├── Add multi-tenant database layer
├── Add hotel research engine
├── Add dynamic Vapi assistant creation
└── Add SaaS dashboard interface
```

## **🎯 Phase-by-Phase Implementation Plan**

### **PHASE 1: Database Foundation (Week 1)**

#### **What Cursor will do:**
1. **Extend existing database schema** trong `shared/db/schema.ts`
2. **Create migration files** để add new tables
3. **Migrate Mi Nhon Hotel** thành tenant đầu tiên

#### **Files to Create/Modify:**
```typescript
// shared/db/schema.ts - ADD these tables
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  hotelName: text('hotel_name').notNull(),
  subdomain: text('subdomain').unique().notNull(),
  customDomain: text('custom_domain'), // Production only
  subscriptionPlan: text('subscription_plan').default('trial'),
  subscriptionStatus: text('subscription_status').default('active'),
  trialEndsAt: timestamp('trial_ends_at'),
  createdAt: timestamp('created_at').defaultNow(),
  
  // Feature flags
  maxVoices: integer('max_voices').default(5),
  maxLanguages: integer('max_languages').default(4),
  voiceCloning: boolean('voice_cloning').default(false),
  multiLocation: boolean('multi_location').default(false),
  whiteLabel: boolean('white_label').default(false),
  dataRetentionDays: integer('data_retention_days').default(90),
  monthlyCallLimit: integer('monthly_call_limit').default(1000)
})

export const hotelProfiles = pgTable('hotel_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
  researchData: jsonb('research_data'), // Auto-researched hotel info
  assistantConfig: jsonb('assistant_config'), // Vapi assistant config
  vapiAssistantId: text('vapi_assistant_id'), // Store Vapi assistant ID
  servicesConfig: jsonb('services_config'), // Available services
  knowledgeBase: text('knowledge_base'), // Generated knowledge base
  systemPrompt: text('system_prompt'), // Custom system prompt
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// ADD tenant_id to existing tables
export const users = pgTable('users', {
  // existing fields...
  tenantId: uuid('tenant_id').references(() => tenants.id)
})

// Modify existing tables to add tenant_id
export const transcripts = pgTable('transcripts', {
  // existing fields...
  tenantId: uuid('tenant_id').references(() => tenants.id)
})

export const orders = pgTable('orders', {
  // existing fields...
  tenantId: uuid('tenant_id').references(() => tenants.id)
})
```

#### **Migration Script:**
```typescript
// migrations/xxx_add_multi_tenancy.sql
-- Cursor sẽ tạo migration để:
-- 1. Create new tables (tenants, hotel_profiles)
-- 2. Add tenant_id columns to existing tables
-- 3. Create Mi Nhon Hotel as first tenant
-- 4. Associate existing data with Mi Nhon tenant
```

---

### **PHASE 2: Hotel Research Engine (Week 2)**

#### **What Cursor will do:**
1. **Create hotel research service** để auto-research hotel data
2. **Implement Google Places API integration**
3. **Add web scraping capabilities** cho hotel websites
4. **Build knowledge base generator** từ research data

#### **Files to Create:**
```typescript
// server/services/hotelResearch.ts
export class HotelResearchService {
  // Basic tier research (Free APIs)
  async basicResearch(hotelName: string, location?: string): Promise<BasicHotelData> {
    const googlePlacesData = await this.getGooglePlacesData(hotelName, location)
    const websiteData = await this.scrapeOfficialWebsite(googlePlacesData.website)
    
    return {
      basicInfo: googlePlacesData,
      services: this.extractServices(websiteData),
      amenities: this.extractAmenities(websiteData),
      policies: this.extractPolicies(websiteData)
    }
  }
  
  // Advanced tier research (Paid APIs)
  async advancedResearch(hotelName: string): Promise<AdvancedHotelData> {
    const basicData = await this.basicResearch(hotelName)
    const socialMediaData = await this.getSocialMediaData(hotelName)
    const reviewData = await this.getReviewData(hotelName)
    const competitorData = await this.getCompetitorAnalysis(hotelName)
    
    return { ...basicData, socialMediaData, reviewData, competitorData }
  }
  
  private async getGooglePlacesData(name: string, location?: string) {
    // Google Places API integration
  }
  
  private async scrapeOfficialWebsite(url: string) {
    // Web scraping for hotel website
  }
  
  private async getSocialMediaData(hotelName: string) {
    // Social media scraping (Instagram, Facebook)
  }
}

// server/services/knowledgeBaseGenerator.ts
export class KnowledgeBaseGenerator {
  generateKnowledgeBase(hotelData: HotelData): string {
    return `
HOTEL INFORMATION:
Name: ${hotelData.name}
Location: ${hotelData.address}
Phone: ${hotelData.phone}
Website: ${hotelData.website}

SERVICES AVAILABLE:
${hotelData.services.map(s => `- ${s.name}: ${s.description}`).join('\n')}

ROOM TYPES:
${hotelData.roomTypes.map(r => `- ${r.name}: $${r.price}/night - ${r.description}`).join('\n')}

AMENITIES:
${hotelData.amenities.join(', ')}

POLICIES:
Check-in: ${hotelData.policies.checkIn}
Check-out: ${hotelData.policies.checkOut}
Cancellation: ${hotelData.policies.cancellation}

LOCAL ATTRACTIONS:
${hotelData.localAttractions.map(a => `- ${a.name}: ${a.description}`).join('\n')}
    `
  }
}
```

#### **Environment Variables to Add:**
```bash
# .env
GOOGLE_PLACES_API_KEY=your_google_places_key
SOCIAL_MEDIA_API_KEYS=your_keys
SCRAPING_SERVICE_URL=your_scraping_service
```

---

### **PHASE 3: Dynamic Vapi Assistant Creation (Week 3)**

#### **What Cursor will do:**
1. **Study Vapi API documentation** để understand assistant creation
2. **Create Vapi integration service**
3. **Build dynamic assistant generator**
4. **Create system prompt templates**

#### **Vapi API Integration Study:**
```typescript
// server/services/vapiIntegration.ts
export class VapiIntegrationService {
  private baseURL = 'https://api.vapi.ai'
  private apiKey = process.env.VAPI_API_KEY
  
  // Create new assistant via Vapi API
  async createAssistant(config: AssistantConfig): Promise<string> {
    const response = await fetch(`${this.baseURL}/assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `${config.hotelName} AI Concierge`,
        model: {
          provider: 'openai',
          model: 'gpt-4',
          systemMessage: config.systemPrompt
        },
        voice: {
          provider: 'playht',
          voiceId: config.voiceId
        },
        functions: config.functions
      })
    })
    
    const assistant = await response.json()
    return assistant.id
  }
  
  // Update existing assistant
  async updateAssistant(assistantId: string, config: Partial<AssistantConfig>) {
    await fetch(`${this.baseURL}/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    })
  }
  
  // Delete assistant
  async deleteAssistant(assistantId: string) {
    await fetch(`${this.baseURL}/assistant/${assistantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })
  }
}

// server/services/assistantGenerator.ts
export class AssistantGeneratorService {
  constructor(
    private vapiService: VapiIntegrationService,
    private knowledgeGenerator: KnowledgeBaseGenerator
  ) {}
  
  async generateAssistant(hotelData: HotelData, customization: AssistantCustomization): Promise<string> {
    // 1. Generate knowledge base
    const knowledgeBase = this.knowledgeGenerator.generateKnowledgeBase(hotelData)
    
    // 2. Build system prompt
    const systemPrompt = this.buildSystemPrompt(hotelData, knowledgeBase, customization)
    
    // 3. Generate functions based on hotel services
    const functions = this.generateFunctions(hotelData.services)
    
    // 4. Create assistant via Vapi API
    const assistantId = await this.vapiService.createAssistant({
      hotelName: hotelData.name,
      systemPrompt,
      voiceId: customization.voiceId,
      functions
    })
    
    return assistantId
  }
  
  private buildSystemPrompt(hotelData: HotelData, knowledgeBase: string, customization: AssistantCustomization): string {
    const basePrompt = `You are the AI concierge for ${hotelData.name}, a ${hotelData.category} hotel located in ${hotelData.location}.`
    
    const personalityPrompt = this.buildPersonalityPrompt(customization.personality)
    
    const knowledgePrompt = `Here is everything you need to know about the hotel:\n\n${knowledgeBase}`
    
    const instructionsPrompt = `
IMPORTANT INSTRUCTIONS:
- Always be helpful, professional, and knowledgeable
- Use the hotel information provided to answer questions accurately
- When booking services, collect necessary details (room number, guest name, timing)
- For complex requests, offer to connect to human staff
- Maintain the ${customization.personality.tone} tone throughout conversations
    `
    
    return [basePrompt, personalityPrompt, knowledgePrompt, instructionsPrompt].join('\n\n')
  }
  
  private generateFunctions(services: HotelService[]): VapiFunction[] {
    const functions: VapiFunction[] = []
    
    // Core functions always included
    functions.push({
      name: 'get_hotel_info',
      description: 'Get basic hotel information',
      parameters: {
        type: 'object',
        properties: {
          info_type: { type: 'string', enum: ['hours', 'contact', 'location', 'amenities'] }
        }
      }
    })
    
    // Dynamic functions based on detected services
    if (services.some(s => s.type === 'room_service')) {
      functions.push({
        name: 'order_room_service',
        description: 'Order room service for hotel guests',
        parameters: {
          type: 'object',
          properties: {
            room_number: { type: 'string' },
            items: { type: 'array', items: { type: 'string' } },
            delivery_time: { type: 'string' },
            special_instructions: { type: 'string' }
          },
          required: ['room_number', 'items']
        }
      })
    }
    
    // Add more functions based on available services...
    
    return functions
  }
}
```

---

### **PHASE 4: Dashboard Frontend (Week 4)**

#### **What Cursor will do:**
1. **Create dashboard layout structure**
2. **Build setup wizard flow**
3. **Implement hotel research UI**
4. **Create assistant management interface**

#### **Key Components to Create:**
```typescript
// client/src/pages/dashboard/SetupWizard.tsx
export const SetupWizard = () => {
  const [step, setStep] = useState(1)
  const [hotelData, setHotelData] = useState<HotelData | null>(null)
  const [isResearching, setIsResearching] = useState(false)
  
  const handleHotelResearch = async (hotelName: string, location?: string) => {
    setIsResearching(true)
    try {
      const data = await api.post('/api/dashboard/research-hotel', { hotelName, location })
      setHotelData(data)
      setStep(2)
    } catch (error) {
      console.error('Research failed:', error)
    } finally {
      setIsResearching(false)
    }
  }
  
  const handleGenerateAssistant = async (customization: AssistantCustomization) => {
    const assistantId = await api.post('/api/dashboard/generate-assistant', {
      hotelData,
      customization
    })
    // Redirect to dashboard
  }
  
  return (
    <div className="setup-wizard">
      {step === 1 && (
        <HotelSearchStep 
          onSearch={handleHotelResearch}
          isLoading={isResearching}
        />
      )}
      {step === 2 && hotelData && (
        <ReviewDataStep 
          hotelData={hotelData}
          onConfirm={() => setStep(3)}
          onEdit={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <CustomizeAssistantStep
          onGenerate={handleGenerateAssistant}
        />
      )}
    </div>
  )
}

// client/src/components/dashboard/HotelSearchStep.tsx
export const HotelSearchStep = ({ onSearch, isLoading }) => (
  <Card className="max-w-2xl mx-auto">
    <CardHeader>
      <h2 className="text-2xl font-bold">Find Your Hotel</h2>
      <p className="text-gray-600">We'll research everything about your property</p>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Input
          placeholder="Hotel name (e.g., Grand Hotel Saigon)"
          value={hotelName}
          onChange={(e) => setHotelName(e.target.value)}
        />
        <Input
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Button 
          onClick={() => onSearch(hotelName, location)}
          disabled={!hotelName || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Researching hotel...
            </>
          ) : (
            'Research My Hotel'
          )}
        </Button>
      </div>
    </CardContent>
  </Card>
)
```

#### **Dashboard Layout Structure:**
```typescript
// client/src/pages/dashboard/DashboardLayout.tsx
export const DashboardLayout = () => {
  const { currentTenant } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{currentTenant?.hotelName}</h1>
            <Badge variant="success">Live</Badge>
          </div>
          <UserMenu />
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen">
          <nav className="p-4">
            <NavItem href="/dashboard" icon={<Home />} text="Overview" />
            <NavItem href="/dashboard/assistant" icon={<Bot />} text="Assistant" />
            <NavItem href="/dashboard/analytics" icon={<BarChart />} text="Analytics" />
            <NavItem href="/dashboard/settings" icon={<Settings />} text="Settings" />
            {currentTenant?.subscriptionPlan !== 'trial' && (
              <NavItem href="/dashboard/billing" icon={<CreditCard />} text="Billing" />
            )}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

---

### **PHASE 5: API Routes & Controllers (Week 5)**

#### **What Cursor will do:**
1. **Create dashboard API routes**
2. **Implement hotel research endpoints**
3. **Add assistant generation endpoints**
4. **Create tenant management APIs**

#### **API Routes Structure:**
```typescript
// server/routes/dashboard.ts
import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { tenantMiddleware } from '../middleware/tenant'

const router = express.Router()

// Apply auth to all dashboard routes
router.use(authMiddleware)
router.use(tenantMiddleware) // Extract tenant from JWT

// Hotel Research
router.post('/research-hotel', async (req, res) => {
  const { hotelName, location } = req.body
  const researchService = new HotelResearchService()
  
  try {
    const hotelData = await researchService.basicResearch(hotelName, location)
    res.json(hotelData)
  } catch (error) {
    res.status(500).json({ error: 'Research failed' })
  }
})

// Generate Assistant
router.post('/generate-assistant', async (req, res) => {
  const { hotelData, customization } = req.body
  const { tenantId } = req.user
  
  try {
    const assistantGenerator = new AssistantGeneratorService()
    const assistantId = await assistantGenerator.generateAssistant(hotelData, customization)
    
    // Save to database
    await db.update(hotelProfiles)
      .set({ 
        vapiAssistantId: assistantId,
        assistantConfig: customization,
        researchData: hotelData
      })
      .where(eq(hotelProfiles.tenantId, tenantId))
    
    res.json({ assistantId })
  } catch (error) {
    res.status(500).json({ error: 'Assistant generation failed' })
  }
})

// Get Hotel Profile
router.get('/hotel-profile', async (req, res) => {
  const { tenantId } = req.user
  
  try {
    const profile = await db.select()
      .from(hotelProfiles)
      .where(eq(hotelProfiles.tenantId, tenantId))
      .limit(1)
    
    res.json(profile[0] || null)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update Assistant Configuration
router.put('/assistant-config', async (req, res) => {
  const { tenantId } = req.user
  const { config } = req.body
  
  try {
    // Update in database
    await db.update(hotelProfiles)
      .set({ assistantConfig: config, updatedAt: new Date() })
      .where(eq(hotelProfiles.tenantId, tenantId))
    
    // Update Vapi assistant
    const profile = await db.select()
      .from(hotelProfiles)
      .where(eq(hotelProfiles.tenantId, tenantId))
      .limit(1)
    
    if (profile[0]?.vapiAssistantId) {
      const vapiService = new VapiIntegrationService()
      await vapiService.updateAssistant(profile[0].vapiAssistantId, config)
    }
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update assistant' })
  }
})

export default router
```

#### **Authentication Middleware Updates:**
```typescript
// server/middleware/tenant.ts
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.user // From JWT
    
    // Load tenant data
    const tenant = await db.select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1)
    
    if (!tenant[0]) {
      return res.status(404).json({ error: 'Tenant not found' })
    }
    
    // Check subscription status
    if (tenant[0].subscriptionStatus === 'expired') {
      return res.status(403).json({ error: 'Subscription expired' })
    }
    
    // Add tenant to request
    req.tenant = tenant[0]
    next()
  } catch (error) {
    res.status(500).json({ error: 'Tenant verification failed' })
  }
}

// server/middleware/featureGate.ts
export const requireFeature = (feature: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const tenant = req.tenant
    
    if (!tenant[feature]) {
      return res.status(403).json({ 
        error: 'Feature not available in your plan',
        feature,
        upgradeRequired: true
      })
    }
    
    next()
  }
}
```

---

## **🚀 Cursor Execution Steps**

### **Step 1: Setup (Day 1)**
```bash
# Cursor should:
1. Analyze current repo structure
2. Install new dependencies (if needed)
3. Create new environment variables
4. Setup database migration files
```

### **Step 2: Database (Day 2-3)**
```bash
# Cursor should:
1. Modify shared/db/schema.ts with new tables
2. Generate migration files
3. Create migration script for Mi Nhon Hotel
4. Run migrations
```

### **Step 3: Backend Services (Day 4-7)**
```bash
# Cursor should:
1. Create hotel research service
2. Study Vapi API and create integration
3. Build assistant generator service
4. Create dashboard API routes
```

### **Step 4: Frontend Components (Day 8-12)**
```bash
# Cursor should:
1. Create dashboard layout
2. Build setup wizard components
3. Create hotel research interface
4. Implement assistant management UI
```

### **Step 5: Integration (Day 13-14)**
```bash
# Cursor should:
1. Connect frontend to backend APIs
2. Test hotel research flow
3. Test assistant generation
4. Verify multi-tenancy works
```

---

## **📁 File Structure After Implementation**

```
Mi Nhon Hotel (Updated to SaaS)
├── client/src/
│   ├── components/
│   │   ├── VoiceAssistant.tsx (existing - updated for multi-tenant)
│   │   └── dashboard/
│   │       ├── DashboardLayout.tsx
│   │       ├── Sidebar.tsx
│   │       ├── TopBar.tsx
│   │       ├── MetricCard.tsx
│   │       ├── HotelResearchPanel.tsx
│   │       ├── AssistantConfigPanel.tsx
│   │       ├── UsageChart.tsx
│   │       ├── FeatureToggle.tsx
│   │       └── UpgradePrompt.tsx
│   ├── pages/
│   │   ├── VoiceAssistant.tsx (existing MVP)
│   │   └── dashboard/
│   │       ├── DashboardHome.tsx
│   │       ├── SetupWizard.tsx
│   │       ├── AssistantManager.tsx
│   │       ├── Analytics.tsx
│   │       ├── Settings.tsx
│   │       └── Billing.tsx
│   ├── services/
│   │   ├── chatService.ts (existing)
│   │   ├── openaiService.ts (existing)
│   │   └── dashboardApi.ts (new)
│   └── context/
│       └── AssistantContext.tsx (updated for multi-tenant)
├── server/
│   ├── models/ (existing)
│   ├── middleware/
│   │   ├── auth.ts (existing - updated)
│   │   ├── tenant.ts (new)
│   │   └── featureGate.ts (new)
│   ├── services/
│   │   ├── hotelResearch.ts (new)
│   │   ├── vapiIntegration.ts (new)
│   │   ├── assistantGenerator.ts (new)
│   │   ├── knowledgeBaseGenerator.ts (new)
│   │   └── tenantService.ts (new)
│   ├── routes/
│   │   ├── (existing routes)
│   │   └── dashboard.ts (new)
│   └── controllers/
│       └── dashboardController.ts (new)
├── shared/
│   ├── db/
│   │   └── schema.ts (updated with new tables)
│   └── types.ts (updated with new interfaces)
└── migrations/
    └── xxx_add_multi_tenancy.sql (new)
```

---

## **📝 Critical Information for Cursor**

### **🔑 Key Environment Variables Needed:**
```bash
# Database (existing)
DATABASE_URL=postgresql://...

# OpenAI (existing)
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_PROJECT_ID=proj_...

# Vapi (existing for Mi Nhon)
VITE_VAPI_PUBLIC_KEY=pk_...
VITE_VAPI_ASSISTANT_ID=asst_...

# New Vapi API for dynamic assistant creation
VAPI_API_KEY=your_vapi_api_key

# Hotel Research APIs
GOOGLE_PLACES_API_KEY=your_google_places_api_key
SOCIAL_MEDIA_API_KEYS=your_keys
SCRAPING_SERVICE_URL=your_scraping_service

# Domain configuration
TALK2GO_DOMAIN=talk2go.online

# JWT (existing)
JWT_SECRET=your_jwt_secret
```

### **🎯 Core Functionality Flow:**
1. **User Registration**: User signs up → Create tenant → Setup wizard
2. **Hotel Research**: Input hotel name → Research APIs → Generate knowledge base
3. **Assistant Creation**: Knowledge base + customization → Create Vapi assistant → Store assistant ID
4. **Assistant Ready**: User can test/customize → Dashboard shows metrics
5. **Multi-tenancy**: Each tenant has isolated data and separate Vapi assistant

### **🔧 Integration Points with Existing MVP:**
- **Preserve**: All existing voice assistant functionality for Mi Nhon Hotel
- **Extend**: `AssistantContext` for multi-tenancy support
- **Reuse**: Existing components (`VoiceAssistant`, `Interface` components) with tenant restrictions
- **Migrate**: Mi Nhon Hotel becomes first tenant in new system
- **Analytics**: Existing analytics extended with tenant filtering

### **🎨 UI/UX Considerations:**
- **Trial Users**: See upgrade prompts for locked features
- **Production Users**: Full access to all features
- **Responsive**: Mobile-first design with collapsible sidebar
- **Modern**: Clean SaaS aesthetic with card-based layouts
- **Intuitive**: Setup wizard guides new users through onboarding

### **🔐 Security & Isolation:**
- **Row-level security**: All data queries filtered by tenant_id
- **JWT tokens**: Include tenant information and feature flags
- **Rate limiting**: Per-tenant limits based on subscription plan
- **Feature gates**: Middleware checks for feature access

---

## **✅ Ready for Implementation**

This guide provides Cursor with:
- Complete technical specifications
- Step-by-step implementation plan
- Code examples and file structures
- Integration points with existing codebase
- Security and multi-tenancy considerations

**Cursor can now start implementing Phase 1 with the database foundation and work through each phase systematically.**