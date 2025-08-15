# 🚨 MEMORY LEAK FIX CHECKLIST - KHẮC PHỤC TRIỆT ĐỂ

**Mức độ ưu tiên**: CRITICAL - Thực hiện ngay lập tức
**Thời gian ước tính**: 4-6 giờ implementation + testing
**Mục tiêu**: Giảm 80-90% memory usage, loại bỏ hoàn toàn memory leaks

---

## 🔥 **PHASE 1: CRITICAL FIXES (Ưu tiên cao nhất - 2 giờ)**

### ✅ **Task 1.1: Fix Unbounded Collections**

**File**: `apps/server/shared/ConnectionPoolManager.ts`
**Lines**: 142-146
**Impact**: HIGH - Có thể gây 50-100MB leak

```typescript
// ❌ Current (BROKEN):
private metrics: PoolMetrics[] = [];
private alerts: PoolAlert[] = [];
private autoScalingEvents: AutoScalingEvent[] = [];
private queryCache = new Map<string, any>();

// ✅ Fix (BOUNDED):
private metrics: PoolMetrics[] = [];
private alerts: PoolAlert[] = [];
private autoScalingEvents: AutoScalingEvent[] = [];
private queryCache = new Map<string, any>();

// Add in constructor:
private readonly MAX_METRICS = 50;
private readonly MAX_ALERTS = 20;
private readonly MAX_EVENTS = 25;
private readonly MAX_CACHE_SIZE = 100;

// Add cleanup in methods:
private maintainArrayBounds() {
  if (this.metrics.length > this.MAX_METRICS) {
    this.metrics = this.metrics.slice(-this.MAX_METRICS);
  }
  if (this.alerts.length > this.MAX_ALERTS) {
    this.alerts = this.alerts.slice(-this.MAX_ALERTS);
  }
  if (this.autoScalingEvents.length > this.MAX_EVENTS) {
    this.autoScalingEvents = this.autoScalingEvents.slice(-this.MAX_EVENTS);
  }
  if (this.queryCache.size > this.MAX_CACHE_SIZE) {
    const entries = Array.from(this.queryCache.entries());
    this.queryCache.clear();
    const recentEntries = entries.slice(-this.MAX_CACHE_SIZE);
    recentEntries.forEach(([key, value]) => {
      this.queryCache.set(key, value);
    });
  }
}
```

**Action Items**:

- [ ] Add bounded collection limits
- [ ] Implement cleanup in all array/map operations
- [ ] Add maintenance method called every 5 minutes
- [ ] Test memory usage before/after

---

### ✅ **Task 1.2: Fix External Memory Monitor Collections**

**File**: `apps/server/monitoring/RealTimeExternalMemoryMonitor.ts`
**Lines**: 148-151, 364-366
**Impact**: HIGH - Có thể gây 30-50MB leak

```typescript
// ❌ Current config (TOO HIGH):
maxSnapshots: 500,
maxPatterns: 25,
maxAlerts: 50,

// ✅ Fix (MUCH LOWER):
maxSnapshots: 50,    // Reduce by 90%
maxPatterns: 10,     // Reduce by 60%
maxAlerts: 20,       // Reduce by 60%

// Add aggressive cleanup:
private maintainMemoryBounds(): void {
  // More aggressive cleanup than current slice operation
  if (this.snapshots.length > this.config.maxSnapshots) {
    const removeCount = Math.floor(this.snapshots.length * 0.5);
    this.snapshots.splice(0, removeCount);
  }
  // Similar for patterns and alerts
}
```

**Action Items**:

- [ ] Reduce all collection limits by 60-90%
- [ ] Implement aggressive cleanup (remove 50% when limit hit)
- [ ] Test monitoring still works with smaller limits
- [ ] Monitor memory reduction

---

### ✅ **Task 1.3: Fix VAPI Global Instance**

**File**: `apps/server/vapi.ts`
**Lines**: 8, entire file
**Impact**: MEDIUM - 10-20MB WebSocket connections

```typescript
// ❌ Current (GLOBAL INSTANCE):
export const vapi = new Vapi(process.env.VITE_VAPI_PUBLIC_KEY);

// ✅ Fix (FACTORY PATTERN):
class VapiManager {
  private static instance: Vapi | null = null;

  static getInstance(): Vapi {
    if (!this.instance) {
      this.instance = new Vapi(process.env.VITE_VAPI_PUBLIC_KEY!);
    }
    return this.instance;
  }

  static async cleanup(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.stop();
        // Clear any internal listeners/connections
        this.instance = null;
      } catch (error) {
        console.warn("Error cleaning up Vapi instance:", error);
      }
    }
  }
}

export const getVapi = () => VapiManager.getInstance();
export const cleanupVapi = () => VapiManager.cleanup();
```

**Action Items**:

- [ ] Replace global instance with managed singleton
- [ ] Add cleanup method for WebSocket connections
- [ ] Update all imports to use getVapi()
- [ ] Call cleanup in server shutdown

---

## 🔧 **PHASE 2: HIGH PRIORITY FIXES (Ưu tiên cao - 2 giờ)**

### ✅ **Task 2.1: Comprehensive Timer Cleanup**

**Files**: Multiple (monitoring-reminder.ts, etc.)
**Impact**: MEDIUM - 5-15MB handles

```typescript
// Create global timer tracker
class TimerManager {
  private static timers = new Set<NodeJS.Timeout>();
  private static intervals = new Set<NodeJS.Timeout>();

  static setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    this.timers.add(timer);
    return timer;
  }

  static setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }

  static clearAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.intervals.forEach((interval) => clearInterval(interval));
    this.timers.clear();
    this.intervals.clear();
  }
}
```

**Action Items**:

- [ ] Create TimerManager class
- [ ] Replace all setTimeout/setInterval calls
- [ ] Add clearAll() to server shutdown
- [ ] Track timer count in monitoring

---

### ✅ **Task 2.2: EventEmitter Cleanup**

**Files**: All classes extending EventEmitter
**Impact**: MEDIUM - 5-10MB listeners

```typescript
// Add to all EventEmitter classes:
private cleanupListeners(): void {
  this.removeAllListeners();
  this.setMaxListeners(0);
}

// Add to shutdown methods:
async shutdown(): Promise<void> {
  this.cleanupListeners();
  // ... existing cleanup
}
```

**Action Items**:

- [ ] Add cleanupListeners() to all EventEmitter classes
- [ ] Call in all shutdown methods
- [ ] Set maxListeners(0) after cleanup
- [ ] Test event functionality still works

---

### ✅ **Task 2.3: WebSocket Server Cleanup**

**File**: `apps/server/shared/WebSocketDashboard.ts`
**Lines**: 65+
**Impact**: MEDIUM - 10-20MB connections

```typescript
// Add comprehensive WebSocket cleanup:
async shutdown(): Promise<void> {
  if (this.wss) {
    // Close all client connections
    this.wss.clients.forEach(client => {
      client.removeAllListeners();
      client.close();
    });

    // Close server
    await new Promise<void>((resolve) => {
      this.wss!.close(() => resolve());
    });

    this.wss = undefined;
  }

  // Clear client tracking
  this.clients.clear();
  this.removeAllListeners();
}
```

**Action Items**:

- [ ] Add WebSocket server shutdown
- [ ] Close all client connections properly
- [ ] Clear client tracking maps
- [ ] Remove all event listeners

---

## ⚡ **PHASE 3: INFRASTRUCTURE IMPROVEMENTS (1-2 giờ)**

### ✅ **Task 3.1: Enhanced Server Shutdown**

**File**: `apps/server/index.ts`
**Lines**: 522-605
**Impact**: CRITICAL - Ensures all cleanup happens

```typescript
// Enhance existing cleanup function:
const cleanup = async () => {
  console.log("🚨 Starting comprehensive cleanup...");

  try {
    // 1. Stop all timers first
    TimerManager.clearAll();

    // 2. Cleanup VAPI connections
    await cleanupVapi();

    // 3. Cleanup all EventEmitter instances
    await ConnectionPoolManager.getInstance()?.shutdown();
    await WebSocketDashboard.getInstance()?.shutdown();

    // 4. Stop external memory monitoring
    externalMemoryMonitor.stopMonitoring();

    // 5. Cleanup database connections
    await prismaManager.disconnect();

    // 6. Force garbage collection multiple times
    if (global.gc) {
      for (let i = 0; i < 3; i++) {
        global.gc();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log("✅ Cleanup completed successfully");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  }
};
```

**Action Items**:

- [ ] Enhance cleanup function with all new cleanup methods
- [ ] Add timeout to prevent hanging shutdown
- [ ] Log each cleanup step for debugging
- [ ] Test graceful shutdown works

---

### ✅ **Task 3.2: Memory Monitoring Verification**

**Files**: monitoring files
**Impact**: VERIFICATION - Confirm fixes work

```typescript
// Add memory verification after fixes:
class MemoryVerification {
  static async verifyFixes(): Promise<{
    beforeMB: number;
    afterMB: number;
    improvement: number;
    leaksFixed: boolean;
  }> {
    const before = process.memoryUsage();

    // Force cleanup
    if (global.gc) global.gc();

    const after = process.memoryUsage();

    const beforeMB = before.rss / 1024 / 1024;
    const afterMB = after.rss / 1024 / 1024;
    const improvement = ((beforeMB - afterMB) / beforeMB) * 100;

    return {
      beforeMB,
      afterMB,
      improvement,
      leaksFixed: improvement > 20, // 20%+ improvement = success
    };
  }
}
```

**Action Items**:

- [ ] Add memory verification testing
- [ ] Run before/after comparisons
- [ ] Confirm 20%+ memory improvement
- [ ] Document results

---

## 🎯 **PHASE 4: FINAL VALIDATION (30 phút)**

### ✅ **Task 4.1: Load Testing**

**Action Items**:

- [ ] Run server for 30 minutes under load
- [ ] Monitor memory usage stays stable
- [ ] Confirm no growth over time
- [ ] Check WebSocket connections stay low
- [ ] Verify database connections don't accumulate

### ✅ **Task 4.2: Production Deployment**

**Action Items**:

- [ ] Deploy to staging first
- [ ] Monitor for 1 hour
- [ ] Check memory stays under 100MB total
- [ ] Deploy to production if stable
- [ ] Monitor production for 24 hours

---

## 📊 **SUCCESS CRITERIA**

### **Memory Usage Targets:**

- **Before fixes**: 200-300MB RSS
- **After fixes**: 50-100MB RSS (50-70% reduction)
- **External memory**: < 30MB (vs 119MB+ before)
- **Stability**: No growth over 24 hours

### **Performance Targets:**

- **Startup time**: < 10 seconds
- **API response**: < 500ms
- **WebSocket latency**: < 100ms
- **Database queries**: < 200ms

### **Reliability Targets:**

- **Zero memory leaks**: No unbounded growth
- **Clean shutdown**: < 5 seconds graceful shutdown
- **Connection stability**: No connection accumulation
- **Error rate**: < 1% under normal load

---

## 🚨 **EMERGENCY ROLLBACK PLAN**

Nếu các fixes gây lỗi:

1. **Immediate rollback**: `git revert` latest commits
2. **Restart services**: Restart all affected services
3. **Monitor recovery**: Confirm functionality restored
4. **Debug issues**: Analyze what went wrong
5. **Reapply fixes**: Fix issues and reapply incrementally

---

## 📈 **MONITORING DASHBOARD**

Sau khi implement, monitor các metrics:

- **RSS Memory**: Target < 100MB
- **External Memory**: Target < 30MB
- **Active Handles**: Target < 50
- **WebSocket Connections**: Target < 10
- **Database Connections**: Target < 5
- **Timer Count**: Target < 20

**Critical Alert Thresholds:**

- RSS > 150MB = WARNING
- RSS > 200MB = CRITICAL
- External > 50MB = WARNING
- External > 80MB = CRITICAL

---

## ✅ **IMPLEMENTATION CHECKLIST**

**Phase 1 (CRITICAL - 2 hours):**

- [ ] Task 1.1: Fix unbounded collections ✅
- [ ] Task 1.2: Fix external memory monitor ✅
- [ ] Task 1.3: Fix VAPI global instance ✅

**Phase 2 (HIGH - 2 hours):**

- [ ] Task 2.1: Timer cleanup ✅
- [ ] Task 2.2: EventEmitter cleanup ✅
- [ ] Task 2.3: WebSocket cleanup ✅

**Phase 3 (INFRASTRUCTURE - 1-2 hours):**

- [ ] Task 3.1: Enhanced shutdown ✅
- [ ] Task 3.2: Memory verification ✅

**Phase 4 (VALIDATION - 30 minutes):**

- [ ] Task 4.1: Load testing ✅
- [ ] Task 4.2: Production deployment ✅

**Final verification:**

- [ ] Memory usage < 100MB ✅
- [ ] No memory leaks detected ✅
- [ ] All functionality working ✅
- [ ] 24-hour stability confirmed ✅

---

**🎯 THÀNH CÔNG = Memory usage giảm 60-80%, ứng dụng stable, không có memory leaks**
