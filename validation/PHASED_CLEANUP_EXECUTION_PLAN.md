# 🎯 PHASED DRIZZLE CLEANUP EXECUTION PLAN

**Generated:** $(date)  
**Target:** Complete và safe Drizzle → Prisma migration  
**Approach:** 🛡️ **Conservative** (Recommended based on risk assessment)

---

## 📋 **EXECUTION OVERVIEW**

**Total Timeline:** 2-3 weeks  
**Phases:** 5 distinct phases với validation checkpoints  
**Rollback Strategy:** Available at each phase  
**Risk Mitigation:** Comprehensive testing at each step

---

## 🎯 **PHASE-BY-PHASE EXECUTION PLAN**

### 🔧 **PHASE 1: SAFE INFRASTRUCTURE CLEANUP**

**Duration:** 2-3 days  
**Risk Level:** 🟢 **LOW**  
**Goal:** Remove duplicate schemas và deprecated files

#### **📋 Day 1: Schema Deduplication**

**🗂️ Step 1.1: Remove Duplicate Prisma Schema**

```bash
# Backup first
cp prisma/enhanced-schema.prisma backup/enhanced-schema.backup
cp prisma/schema.prisma backup/schema.backup

# Remove duplicate
rm prisma/enhanced-schema.prisma

# Verify Prisma still works
npx prisma validate
npx prisma generate
```

**🗂️ Step 1.2: Remove Simple Schema**

```bash
# Backup và remove
cp packages/shared/db/schema-simple.ts backup/
rm packages/shared/db/schema-simple.ts

# Update any imports (if any)
grep -r "schema-simple" --exclude-dir=backup .
```

**✅ Validation Checkpoint 1.1:**

- ✅ Prisma generates successfully
- ✅ No broken imports
- ✅ System still boots correctly

#### **📋 Day 2: Mark Deprecated Files**

**🏷️ Step 1.3: Mark db.ts as Deprecated**

```typescript
// apps/server/db.ts
console.warn("🚨 DEPRECATED: This file will be removed in next phase");
console.warn("🔄 Migration to Prisma in progress");
console.warn("📞 Contact team if you see this message in production");

// Add deprecation tracking
logger.warn("Legacy Drizzle connection used", {
  component: "apps/server/db.ts",
  migration_phase: "PHASE_1",
  action_required: "Migrate to Prisma",
});
```

**🏷️ Step 1.4: Audit Connection Usage**

```bash
# Find all getDatabase() usage
find . -name "*.ts" -not -path "./backup*" -not -path "./node_modules/*" | \
  xargs grep -l "getDatabase()" > audit/getDatabase_usage.txt

# Report findings
echo "Files using getDatabase():"
cat audit/getDatabase_usage.txt
```

**✅ Validation Checkpoint 1.2:**

- ✅ All deprecated files tagged
- ✅ Usage audit complete
- ✅ No new Drizzle usage introduced

#### **📋 Day 3: Testing & Documentation**

**📊 Step 1.5: System Health Check**

```bash
# Run comprehensive tests
npm run test
npm run build
npm run typecheck

# Check database connections
npm run db:health-check

# Verify all routes still work
npm run test:integration
```

**📝 Step 1.6: Document Changes**

```markdown
# Create PHASE_1_COMPLETION_REPORT.md

- Files removed: 2
- Files deprecated: 1
- System stability: ✅ Confirmed
- Next phase ready: ✅ Yes
```

**✅ Final Phase 1 Validation:**

- ✅ All tests pass
- ✅ System performance unchanged
- ✅ No regressions detected
- ✅ Ready for Phase 2

---

### 🔄 **PHASE 2: SIMPLE ROUTE MIGRATION**

**Duration:** 5-7 days  
**Risk Level:** 🟡 **MEDIUM**  
**Goal:** Migrate straightforward routes với basic CRUD

#### **📋 Day 1-2: Low Complexity Routes**

**🔧 Step 2.1: Migrate routes/api.ts**

```typescript
// BEFORE (Drizzle)
import { db } from "@shared/db";
import { eq } from "drizzle-orm";

// AFTER (Prisma)
import { prisma } from "@shared/db/DatabaseServiceFactory";

// Migration process:
// 1. Create parallel implementation
// 2. Test both versions
// 3. Switch to Prisma
// 4. Remove Drizzle code
```

**🔧 Step 2.2: Migrate routes/staff.ts**

- Follow same pattern as api.ts
- Focus on simple CRUD operations
- Maintain existing API contracts

**✅ Validation Checkpoint 2.1:**

- ✅ Migrated routes return identical responses
- ✅ No API contract changes
- ✅ Performance within 10% of original

#### **📋 Day 3-4: Module Routes**

**🔧 Step 2.3: Migrate hotel-module/services.routes.ts**

```typescript
// Migration strategy:
// 1. Identify all Drizzle queries
// 2. Create Prisma equivalents
// 3. Parallel testing
// 4. Gradual switchover
```

**🔧 Step 2.4: Create Migration Utilities**

```typescript
// utils/migrationHelpers.ts
export function validateMigrationResult<T>(
  drizzleResult: T,
  prismaResult: T,
  identifier: string,
): boolean {
  // Deep comparison logic
  return JSON.stringify(drizzleResult) === JSON.stringify(prismaResult);
}
```

**✅ Validation Checkpoint 2.2:**

- ✅ All module routes migrated
- ✅ Business logic preserved
- ✅ Error handling maintained

#### **📋 Day 5-7: Complex Routes Preparation**

**🔧 Step 2.5: Analyze Complex Routes**

```bash
# Create complexity assessment
echo "Analyzing complex routes..."
wc -l apps/server/routes/calls.ts
wc -l apps/server/routes/summaries.ts
wc -l apps/server/routes/advanced-calls.ts

# Document complex queries
grep -n "db\." apps/server/routes/calls.ts > audit/calls_queries.txt
```

**🔧 Step 2.6: Prepare Complex Migration Strategy**

- Document all complex queries
- Identify potential Prisma equivalents
- Plan parallel implementation

**✅ Final Phase 2 Validation:**

- ✅ 3-4 simple routes migrated successfully
- ✅ No functionality loss
- ✅ Performance maintained
- ✅ Complex routes analyzed và planned

---

### 🏢 **PHASE 3: COMPLEX ROUTE MIGRATION**

**Duration:** 7-10 days  
**Risk Level:** 🔴 **HIGH**  
**Goal:** Migrate complex routes với advanced queries

#### **📋 Day 1-3: calls.ts Migration (404 lines)**

**🔧 Step 3.1: Parallel Implementation**

```typescript
// Create routes/calls-prisma.ts alongside calls.ts
// Implement all endpoints in Prisma
// Use feature flag to switch between implementations

// Example:
const USE_PRISMA_CALLS = process.env.USE_PRISMA_CALLS === "true";

if (USE_PRISMA_CALLS) {
  // Use Prisma implementation
} else {
  // Use Drizzle implementation (fallback)
}
```

**🔧 Step 3.2: Complex Query Migration**

```typescript
// BEFORE (Drizzle - complex pagination)
const calls = await db
  .select()
  .from(call)
  .leftJoin(transcript, eq(call.call_id_vapi, transcript.call_id))
  .where(
    and(
      eq(call.tenant_id, tenantId),
      gte(call.start_time, startDate),
      lte(call.start_time, endDate),
    ),
  )
  .orderBy(desc(call.start_time))
  .limit(limit)
  .offset(offset);

// AFTER (Prisma equivalent)
const calls = await prisma.call.findMany({
  where: {
    tenant_id: tenantId,
    start_time: {
      gte: startDate,
      lte: endDate,
    },
  },
  include: {
    transcript: true, // Equivalent to leftJoin
  },
  orderBy: {
    start_time: "desc",
  },
  take: limit,
  skip: offset,
});
```

**✅ Validation Checkpoint 3.1:**

- ✅ All calls endpoints work identically
- ✅ Complex queries return same results
- ✅ Performance within acceptable range

#### **📋 Day 4-6: summaries.ts & advanced-calls.ts**

**🔧 Step 3.3: Migrate summaries.ts**

- Apply same parallel implementation pattern
- Focus on aggregation queries
- Validate statistical results

**🔧 Step 3.4: Migrate advanced-calls.ts**

- Handle advanced filtering logic
- Maintain search functionality
- Preserve sorting options

**✅ Validation Checkpoint 3.2:**

- ✅ All complex routes migrated
- ✅ No data discrepancies
- ✅ User-facing features work correctly

#### **📋 Day 7-10: Dashboard Routes**

**🔧 Step 3.5: Migrate dashboard.ts (722 lines)**

```typescript
// This is the most complex file
// Strategy:
// 1. Break into smaller functions
// 2. Migrate function by function
// 3. Extensive testing for each function
// 4. Validate analytics results
```

**✅ Final Phase 3 Validation:**

- ✅ All complex routes migrated
- ✅ Dashboard functionality preserved
- ✅ Analytics accuracy maintained
- ✅ User experience unchanged

---

### 🔧 **PHASE 4: SERVICE LAYER MIGRATION**

**Duration:** 8-12 days  
**Risk Level:** 🔴 **CRITICAL**  
**Goal:** Migrate core business logic services

#### **📋 Day 1-3: Analytics Services**

**🔧 Step 4.1: Migrate analytics.ts (247 lines)**

```typescript
// Critical analytics functions
// Strategy: Parallel validation with production data
// Every analytics result must match exactly

// Example migration:
// getOverview() function
const drizzleOverview = await getDrizzleOverview();
const prismaOverview = await getPrismaOverview();

// Validation
if (!isAnalyticsMatch(drizzleOverview, prismaOverview)) {
  throw new Error("Analytics mismatch detected");
}
```

**🔧 Step 4.2: Migrate RequestAnalytics.ts & CallAnalytics.ts**

- Follow same validation pattern
- Ensure statistical accuracy
- Maintain performance characteristics

**✅ Validation Checkpoint 4.1:**

- ✅ Analytics results match 100%
- ✅ Performance maintained
- ✅ Business intelligence preserved

#### **📋 Day 4-7: Core Services**

**🔧 Step 4.3: Migrate tenantService.ts**

```typescript
// Multi-tenancy is critical
// Extra validation for tenant isolation
// Test with multiple tenants simultaneously
```

**🔧 Step 4.4: Migrate QueryOptimizer.ts**

- Update optimization strategies for Prisma
- Maintain performance improvements
- Document new optimization patterns

**✅ Validation Checkpoint 4.2:**

- ✅ Tenant isolation maintained
- ✅ Query optimization effective
- ✅ No cross-tenant data leakage

#### **📋 Day 8-12: The Big One - RequestService.ts (2219 lines)**

**🔧 Step 4.5: Break Down RequestService**

```typescript
// Strategy: Modular migration
// 1. Identify distinct functionalities
// 2. Create separate Prisma service classes
// 3. Migrate module by module
// 4. Intensive testing at each step

// Example breakdown:
class PrismaRequestCRUD {
  // Basic CRUD operations
}

class PrismaRequestAnalytics {
  // Analytics functions
}

class PrismaRequestValidation {
  // Validation logic
}
```

**🔧 Step 4.6: Parallel Testing Strategy**

```typescript
// Run both services in parallel for 24-48 hours
// Compare all outputs
// Monitor for discrepancies
// Gradual cutover only after 100% confidence
```

**✅ Final Phase 4 Validation:**

- ✅ All services migrated successfully
- ✅ Business logic 100% preserved
- ✅ No functionality regressions
- ✅ Performance within acceptable range

---

### 🧹 **PHASE 5: INFRASTRUCTURE CLEANUP**

**Duration:** 3-5 days  
**Risk Level:** 🔴 **HIGH**  
**Goal:** Remove all Drizzle infrastructure

#### **📋 Day 1-2: Controller Cleanup**

**🔧 Step 5.1: Remove Hybrid Logic**

```typescript
// BEFORE (requestController.ts)
try {
  const service = new PrismaRequestService();
} catch (error) {
  return new RequestService(); // Drizzle fallback
}

// AFTER
const service = new PrismaRequestService();
// No fallback - if Prisma fails, system fails
// Proper error handling without silent degradation
```

**🔧 Step 5.2: Update All Controllers**

- Remove all Drizzle fallback logic
- Update error handling
- Ensure proper monitoring

**✅ Validation Checkpoint 5.1:**

- ✅ No Drizzle fallbacks remain
- ✅ Error handling robust
- ✅ Monitoring alerts working

#### **📋 Day 3-4: Infrastructure Removal**

**🔧 Step 5.3: Remove Core Drizzle Files**

```bash
# Final removal (point of no return)
rm packages/shared/db/schema.ts
rm packages/shared/db/connectionManager.ts
rm packages/shared/db/index.ts
rm apps/server/db.ts

# Update package.json
npm uninstall drizzle-orm drizzle-zod drizzle-kit
```

**🔧 Step 5.4: Clean Import References**

```bash
# Find any remaining Drizzle imports
find . -name "*.ts" -not -path "./node_modules/*" | \
  xargs grep -l "from 'drizzle" || echo "No Drizzle imports found ✅"

# Fix any remaining imports
```

**✅ Validation Checkpoint 5.2:**

- ✅ No Drizzle files remain
- ✅ No broken imports
- ✅ System builds successfully

#### **📋 Day 5: Final Testing**

**🔧 Step 5.5: Comprehensive System Test**

```bash
# Full test suite
npm run test:all
npm run test:integration
npm run test:e2e

# Performance testing
npm run test:performance

# Production simulation
npm run test:production
```

**✅ Final System Validation:**

- ✅ All tests pass
- ✅ Performance acceptable
- ✅ No Drizzle dependencies remain
- ✅ System ready for production

---

## 🛡️ **SAFETY PROTOCOLS**

### **🚨 Emergency Stop Conditions**

**Immediate halt if:**

1. **Data corruption detected** in any phase
2. **Performance degradation >30%** sustained
3. **Business logic failures** in critical paths
4. **Security vulnerabilities** discovered
5. **Test failures >5%** of test suite

### **🔄 Rollback Procedures**

**Phase-specific rollbacks:**

```bash
# Phase 1-2 Rollback
git revert <commit-range>
npm install  # Restore dependencies

# Phase 3-4 Rollback
git checkout main
npm run db:reset
npm run db:seed

# Phase 5 Rollback (Emergency only)
git revert --hard <pre-migration-commit>
# Restore from database backup
```

### **📊 Success Metrics**

**Each phase must achieve:**

- ✅ **Functionality:** 100% feature parity
- ✅ **Performance:** <10% degradation
- ✅ **Reliability:** <1% error rate increase
- ✅ **Security:** No new vulnerabilities
- ✅ **Data Integrity:** Zero data loss

---

## 🎯 **FINAL RECOMMENDATIONS**

### **🛡️ CONSERVATIVE APPROACH (Recommended)**

**Why Conservative:**

1. **Business Critical System** - Hotel operations depend on this
2. **Complex Legacy Code** - 2200+ lines với intricate business logic
3. **Hybrid System Risks** - Current fallback logic is dangerous
4. **High Stakes** - Data corruption could affect customer bookings

**Timeline:** 2-3 weeks  
**Resource Requirements:**

- 1 Senior Developer (full-time)
- 1 QA Engineer (part-time)
- Database backup capabilities
- Staging environment access

### **📋 Pre-Migration Checklist**

**Before starting Phase 1:**

- ✅ Full database backup completed
- ✅ Staging environment ready
- ✅ Monitoring alerts configured
- ✅ Rollback procedures tested
- ✅ Team training completed
- ✅ Stakeholder approval received

### **🚀 Success Criteria**

**Migration considered successful when:**

- ✅ Zero Drizzle dependencies remain
- ✅ All business logic preserved
- ✅ Performance within 10% of baseline
- ✅ No data integrity issues
- ✅ All tests passing
- ✅ Production deployment stable

---

**🎯 FINAL DECISION POINT:**

**Proceed with Conservative Approach?**

- **✅ YES:** Begin Phase 1 immediately
- **⏸️ WAIT:** Address any concerns first
- **❌ NO:** Maintain current hybrid state (NOT recommended)

**Next Step:** Confirm approach và begin Phase 1 execution.\*\*
