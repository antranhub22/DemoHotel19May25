# 🔍 COMPREHENSIVE MEMORY TRACKING SYSTEM

## Overview

This system provides detailed memory allocation tracking to identify exactly which code sections are consuming the most memory during spikes. It includes:

- **Real-time memory allocation tracking** for all operations
- **Function-level memory profiling** with decorators
- **API endpoint memory monitoring** via middleware
- **Memory spike detection** with automatic alerting
- **Database operation memory monitoring**
- **Heap snapshot analysis** for leak detection
- **Comprehensive monitoring APIs**

---

## 🚀 Quick Start

### 1. Access Memory Monitoring Dashboard

```bash
# Get current memory status
curl http://localhost:10000/api/memory/status

# Get top memory consumers
curl http://localhost:10000/api/memory/top-consumers

# Get comprehensive report
curl http://localhost:10000/api/memory/report
```

### 2. Monitor Memory Spikes

```bash
# Get recent memory spikes
curl http://localhost:10000/api/memory/spikes

# Force garbage collection
curl -X POST http://localhost:10000/api/memory/gc

# Generate heap snapshot
curl -X POST http://localhost:10000/api/memory/snapshot \
  -H "Content-Type: application/json" \
  -d '{"reason": "investigation"}'
```

---

## 📊 API Endpoints

| Endpoint                    | Method | Description                                |
| --------------------------- | ------ | ------------------------------------------ |
| `/api/memory/status`        | GET    | Current memory status and tracking summary |
| `/api/memory/top-consumers` | GET    | Top memory consuming operations/functions  |
| `/api/memory/history`       | GET    | Recent memory usage history                |
| `/api/memory/spikes`        | GET    | Recent memory spikes and alerts            |
| `/api/memory/database`      | GET    | Database operation memory statistics       |
| `/api/memory/heap-analysis` | GET    | Heap analysis and leak detection           |
| `/api/memory/snapshot`      | POST   | Generate heap snapshot                     |
| `/api/memory/gc`            | POST   | Force garbage collection                   |
| `/api/memory/config`        | GET    | Current monitoring configuration           |
| `/api/memory/report`        | GET    | Comprehensive memory report                |

---

## 🛠️ Using Memory Tracking in Code

### 1. Function-Level Profiling (Decorators)

```typescript
import { ProfileMemory } from "@server/shared/MemoryProfiler";

class UserService {
  @ProfileMemory({ logLevel: "info" })
  async processLargeUserData(userData: any[]): Promise<void> {
    // Function will be automatically profiled
    // Memory usage before/after will be logged
  }

  @ProfileMemory({
    logLevel: "warn",
    functionName: "UserService.criticalOperation",
  })
  async criticalOperation(): Promise<void> {
    // Custom function name and warning-level logging
  }
}
```

### 2. Manual Memory Tracking

```typescript
import { trackOperation } from "@server/shared/MemoryAllocationTracker";

async function processData(data: any[]) {
  return trackOperation(
    "data-processing",
    async () => {
      // Your operation here
      return processLargeDataset(data);
    },
    {
      dataSize: data.length,
      operation: "bulk-processing",
    },
  );
}
```

### 3. Block-Level Memory Profiling

```typescript
import { createMemoryBlock } from "@server/shared/MemoryProfiler";

async function complexOperation() {
  const block1 = createMemoryBlock("phase-1-parsing");

  // Phase 1: Data parsing
  const parsedData = await parseData();
  block1.end();

  const block2 = createMemoryBlock("phase-2-processing", {
    recordCount: parsedData.length,
  });

  // Phase 2: Data processing
  const result = await processData(parsedData);
  block2.end();

  return result;
}
```

### 4. Database Operation Monitoring

```typescript
import {
  dbMemoryMonitor,
  PrismaMemoryHelpers,
} from "@server/shared/DatabaseMemoryMonitor";

// Automatic Prisma monitoring
const users = await PrismaMemoryHelpers.findMany(
  "User",
  () => prisma.user.findMany({ take: 1000 }),
  { take: 1000 },
);

// Manual query monitoring
const result = await dbMemoryMonitor.monitorQuery(
  "SELECT",
  "SELECT * FROM users WHERE active = true",
  "users",
  () => prisma.$queryRaw`SELECT * FROM users WHERE active = true`,
  { expectedRecords: 500 },
);
```

---

## 🚨 Memory Spike Detection

### Automatic Detection

The system automatically detects:

- **Medium spikes**: 25MB+ allocation
- **High spikes**: 50MB+ allocation
- **Critical spikes**: 100MB+ allocation

### Configuration

```typescript
import { memorySpikeDetector } from "@server/shared/MemorySpikeDetector";

memorySpikeDetector.configure({
  mediumThresholdMB: 20,
  highThresholdMB: 40,
  criticalThresholdMB: 80,
  consecutiveSpikesLimit: 3,
  enableHeapSnapshots: true,
});
```

### Custom Alerts

```typescript
memorySpikeDetector.onSpike((spike) => {
  if (spike.severity === "critical") {
    // Send alert to monitoring system
    sendAlert({
      message: `Critical memory spike: ${spike.memoryIncrease / 1024 / 1024}MB`,
      operation: spike.operation,
      timestamp: spike.timestamp,
    });
  }
});
```

---

## 🧠 Heap Analysis & Leak Detection

### Automatic Snapshots

- **Production**: Every 30 minutes
- **Development**: Every 10 minutes
- **On critical spikes**: Automatic

### Manual Analysis

```bash
# Generate snapshot
curl -X POST http://localhost:10000/api/memory/snapshot

# Get heap analysis
curl http://localhost:10000/api/memory/heap-analysis
```

### Leak Detection Patterns

The system detects:

- **Linear growth**: Consistent memory increase over time
- **Buffer leaks**: External memory growing faster than heap
- **Event listener leaks**: Heap growing without corresponding cleanup
- **Cache growth**: Unbounded object accumulation

---

## 📈 Memory Usage Patterns

### Understanding Memory Reports

```json
{
  "current": {
    "heapUsed": "245.67MB",
    "heapTotal": "512.00MB",
    "utilization": "48.0%"
  },
  "topMemoryConsumers": [
    {
      "operation": "DB.SELECT.users",
      "totalMemory": "125.34MB",
      "callCount": 1250,
      "avgMemory": "0.10MB"
    }
  ],
  "spikes": {
    "critical": 2,
    "high": 8,
    "medium": 15
  }
}
```

### Key Metrics

- **Heap Utilization**: Should stay below 80%
- **Memory Growth Rate**: < 5MB/hour is healthy
- **Spike Frequency**: < 1 critical spike/hour
- **GC Effectiveness**: Should free 60%+ memory

---

## 🔧 Configuration & Tuning

### Environment Variables

```bash
# Enable heap snapshots in production
MEMORY_ENABLE_SNAPSHOTS=true

# Configure thresholds
MEMORY_MEDIUM_THRESHOLD=25
MEMORY_HIGH_THRESHOLD=50
MEMORY_CRITICAL_THRESHOLD=100

# Monitoring intervals
MEMORY_CHECK_INTERVAL=30000
```

### Memory Thresholds by Operation Type

| Operation       | Threshold | Rationale                |
| --------------- | --------- | ------------------------ |
| SELECT queries  | 10MB      | Large result sets        |
| INSERT/UPDATE   | 5MB       | Moderate data processing |
| File uploads    | 25MB      | Expected large payloads  |
| Bulk operations | 50MB      | Batch processing         |
| Migrations      | 100MB     | Database schema changes  |

---

## 🎯 Performance Optimization

### Best Practices

1. **Profile First**: Use decorators on suspected functions
2. **Monitor Gradually**: Start with high-level tracking
3. **Focus on Spikes**: Investigate critical/high severity first
4. **Compare Snapshots**: Look for memory growth patterns
5. **Optimize Hot Paths**: Focus on frequently called functions

### Common Memory Issues

| Issue                | Detection                | Solution                 |
| -------------------- | ------------------------ | ------------------------ |
| Event Listener Leaks | Steady heap growth       | Use `ResourceTracker`    |
| Buffer Leaks         | High external memory     | Implement streaming      |
| Cache Overflow       | Large object counts      | Add size limits          |
| Circular References  | Objects not GC'd         | Use WeakMap/WeakSet      |
| Timer Leaks          | Background memory growth | Clear intervals/timeouts |

---

## 📊 Monitoring Dashboard

### Real-time Metrics

The system provides real-time tracking of:

- Current memory usage
- Memory allocation rate
- Function execution times
- Database query efficiency
- Memory spike frequency

### Historical Analysis

- Memory usage trends over time
- Performance regression detection
- Leak pattern identification
- Optimization impact measurement

---

## 🚨 Alerting & Notifications

### Automatic Alerts

The system generates alerts for:

- Critical memory spikes (>100MB)
- High memory utilization (>80%)
- Memory leaks (>50MB/hour growth)
- Failed garbage collection
- Heap snapshot generation failures

### Integration with Monitoring

```typescript
// Example: Integrate with external monitoring
memorySpikeDetector.onSpike(async (spike) => {
  if (spike.severity === "critical") {
    await sendToDatadog({
      metric: "memory.spike.critical",
      value: spike.memoryIncrease,
      tags: ["operation:" + spike.operation],
    });
  }
});
```

---

## 🧪 Testing Memory Usage

### Load Testing with Memory Monitoring

```typescript
// Test memory under load
import { loadTestWithMemoryMonitoring } from "@tests/memory/load.monitor.test";

await loadTestWithMemoryMonitoring({
  concurrent: 100,
  duration: 60000, // 1 minute
  endpoint: "/api/heavy-operation",
  memoryThreshold: 200 * 1024 * 1024, // 200MB
});
```

### Memory Regression Tests

```typescript
// Ensure functions don't exceed memory budgets
import { testMemoryBudget } from "@tests/memory/budget.test";

await testMemoryBudget("UserService.processUsers", {
  maxMemoryMB: 50,
  iterations: 100,
  input: generateTestUsers(1000),
});
```

---

## 🔍 Troubleshooting Guide

### High Memory Usage

1. **Check top consumers**: `/api/memory/top-consumers`
2. **Look for spikes**: `/api/memory/spikes`
3. **Generate heap snapshot**: `POST /api/memory/snapshot`
4. **Force garbage collection**: `POST /api/memory/gc`
5. **Analyze heap patterns**: `/api/memory/heap-analysis`

### Memory Leaks

1. **Monitor over time**: Check growth rate in reports
2. **Compare snapshots**: Look for object count increases
3. **Check event listeners**: Use ResourceTracker
4. **Validate cleanup**: Ensure proper resource disposal
5. **Profile functions**: Use @ProfileMemory decorator

### Performance Issues

1. **Identify hot functions**: Check function profiling data
2. **Optimize database queries**: Review DB memory usage
3. **Implement streaming**: For large data processing
4. **Add caching**: With proper size limits
5. **Use memory blocks**: Profile specific code sections

---

## 📚 Advanced Usage

### Custom Memory Profilers

```typescript
import { memoryProfiler } from "@server/shared/MemoryProfiler";

// Create custom profiler for specific use case
const customProfiler = await memoryProfiler.profileFunction(
  "custom-operation",
  async () => {
    // Complex operation
    return await processComplexData();
  },
  {
    logLevel: "error", // Only log if memory usage is high
    context: {
      useCase: "batch-processing",
      expectedMemory: "50MB",
    },
  },
);
```

### Memory-Aware Algorithms

```typescript
import { memoryTracker } from "@server/shared/MemoryAllocationTracker";

async function memoryAwareProcessing(data: any[]) {
  const chunkSize = await determineOptimalChunkSize();

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);

    await trackOperation("chunk-processing", () => processChunk(chunk), {
      chunkIndex: i / chunkSize,
      chunkSize,
    });

    // Check memory after each chunk
    const currentMemory = process.memoryUsage();
    if (currentMemory.heapUsed > 400 * 1024 * 1024) {
      // 400MB
      // Force GC if memory is high
      if (global.gc) global.gc();
    }
  }
}
```

---

This comprehensive memory tracking system provides the tools needed to identify, monitor, and resolve memory issues in your Node.js application. Use the APIs, decorators, and monitoring tools to maintain optimal memory performance.
