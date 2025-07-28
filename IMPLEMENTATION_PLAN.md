# 🚀 API CONSISTENCY IMPLEMENTATION PLAN

## ✅ COMPLETED: Phase 1 Tasks 1.1 & 1.2

### ✅ Task 1.1: API Response Helpers (COMPLETED)

- ✅ Created `apps/server/utils/apiHelpers.ts`
- ✅ Created `apps/server/utils/pagination.ts`
- ✅ Standardized response format across all APIs

### ✅ Task 1.2: Guest Journey APIs Standardization (COMPLETED)

- ✅ **guest-public.ts**: Standard responses, **FIXED** `/request` → `/requests`
- ✅ **transcripts.ts**: Standard responses, enhanced validation
- ✅ **calls.ts**: Standard responses, **FIXED** `/calls` → `/`, enhanced validation
- ✅ **api.ts**: Standard responses, fixed template literals, removed type casting
- ✅ **vapi-config.ts**: Standard responses, enhanced validation
- ✅ **email.ts**: Standard responses, email validation, pagination

---

## 🎯 CURRENT TASK: Phase 1 Task 1.3 - URL Structure Standardization

### 📊 ANALYSIS: Current URL Structure Issues

#### ❌ NON-RESTFUL PATTERNS IDENTIFIED:

1. **api.ts** (`/api` mount):
   - `/store-transcript` → Should be `POST /api/transcripts/`
   - `/store-summary` → Should be `POST /api/summaries/`
   - `/transcripts/:callId` → Should be `GET /api/transcripts/:callId`
   - `/summaries/:callId` → Should be `GET /api/summaries/:callId`
   - `/translate-to-vietnamese` → Should be `POST /api/translations/`

2. **email.ts** (`/api/email` mount):
   - `/send-service-email` → Should be `POST /api/emails/service`
   - `/send-call-summary-email` → Should be `POST /api/emails/call-summary`
   - `/mobile-test-email` → Should be `POST /api/emails/mobile-test`
   - `/mobile-call-summary-email` → Should be `POST /api/emails/mobile-call-summary`

3. **calls.ts** route conflicts:
   - `/call-end` should be `PATCH /api/calls/:callId/end`
   - `/test-transcript` duplicates functionality in transcripts.ts

#### ✅ GOOD RESTFUL PATTERNS:

- **guest-public.ts**: `/api/guest/{auth|requests|health|hotel-info}`
- **transcripts.ts**: `/api/transcripts/{|:callId|test-transcript}`
- **vapi-config.ts**: `/api/vapi/config/:language`

### 🎯 STANDARDIZATION ACTIONS:

#### 🔧 ACTION 1: Consolidate Duplicate Routes

```bash
# MOVE from api.ts to appropriate files:
/store-transcript     → transcripts.ts
/store-summary        → NEW: summaries.ts
/transcripts/:callId  → transcripts.ts (already exists)
/summaries/:callId    → NEW: summaries.ts
/translate-to-vietnamese → NEW: translations.ts
```

#### 🔧 ACTION 2: RESTful URL Structure

```bash
# CURRENT → TARGET
/api/email/send-service-email        → POST /api/emails/service
/api/email/send-call-summary-email   → POST /api/emails/call-summary
/api/calls/call-end                  → PATCH /api/calls/:callId/end
/api/store-transcript                → POST /api/transcripts/
/api/store-summary                   → POST /api/summaries/
```

#### 🔧 ACTION 3: Resource Naming Consistency

```bash
# ENSURE PLURAL RESOURCE NAMES:
✅ /api/calls/        (already plural)
✅ /api/transcripts/  (already plural)
✅ /api/guests/       (already plural via guest-public)
➕ /api/summaries/   (new - plural)
➕ /api/emails/      (standardize email.ts)
➕ /api/translations/ (new - plural)
```

---

## 📋 IMPLEMENTATION STEPS:

### ⚡ STEP 1: Create New Route Files

1. Create `apps/server/routes/summaries.ts`
2. Create `apps/server/routes/translations.ts`
3. Update `apps/server/routes/emails.ts` (rename from email.ts)

### ⚡ STEP 2: Move Endpoints

1. Move `/store-transcript` from api.ts → transcripts.ts
2. Move summary endpoints from api.ts → summaries.ts
3. Move translation endpoint from api.ts → translations.ts

### ⚡ STEP 3: Update Main Router

1. Update route mounts in `apps/server/routes/index.ts`
2. Ensure proper ordering (specific before general)
3. Remove old `/api` general mount

### ⚡ STEP 4: Update Frontend APIs

1. Update all frontend API calls to new URLs
2. Ensure backward compatibility during transition

---

## 🎯 EXPECTED OUTCOME:

- ✅ 100% RESTful API structure
- ✅ No route conflicts or duplicates
- ✅ Clear resource-based URL hierarchy
- ✅ Consistent plural naming
- ✅ Proper HTTP methods for actions

---

## ⏭️ NEXT: Continue with remaining Phase 1 tasks...
