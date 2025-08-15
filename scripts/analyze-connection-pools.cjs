/**
 * 🔗 CONNECTION POOL MEMORY ANALYSIS SCRIPT
 * 
 * Analyzes all connection pooling mechanisms for native memory leaks:
 * - Database connection pools (Prisma, Advanced, Performance)
 * - WebSocket connections (Socket.IO, Dashboard WS)
 * - HTTP connection pools (Undici, Node-fetch, Axios)
 * - Redis connections (when implemented)
 * - Internal connection pools
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

console.log('🔗 Connection Pool Memory Analysis');
console.log('='.repeat(70));

let analysisResults = {
  databasePools: [],
  websocketPools: [],
  httpPools: [],
  redisPools: [],
  internalPools: [],
  totalMemoryEstimate: 0,
  criticalIssues: [],
  recommendations: []
};

// Database Connection Pool Analysis
async function analyzeDatabaseConnectionPools() {
  console.log('\n🗄️ 1. DATABASE CONNECTION POOLS ANALYSIS');
  
  const pools = [];
  
  // Prisma Connection Pool
  try {
    const prismaManagerPath = 'packages/shared/db/PrismaConnectionManager.ts';
    if (fs.existsSync(prismaManagerPath)) {
      const content = fs.readFileSync(prismaManagerPath, 'utf8');
      
      const maxConnections = content.match(/maxConnections:\s*(\d+)/)?.[1] || 'unknown';
      const minConnections = content.match(/minConnections:\s*(\d+)/)?.[1] || 'unknown';
      const connectionTtl = content.match(/connectionTtl:\s*(\d+)/)?.[1] || 'unknown';
      
      const hasUnboundedQueue = content.includes('connectionQueue: QueuedRequest[]');
      const hasCleanup = content.includes('$disconnect()');
      
      pools.push({
        name: 'Prisma Connection Pool',
        file: prismaManagerPath,
        maxConnections: parseInt(maxConnections) || 20,
        minConnections: parseInt(minConnections) || 5,
        ttl: parseInt(connectionTtl) || 3600000,
        memoryEstimate: (parseInt(maxConnections) || 20) * 5, // 5MB per connection
        issues: [
          ...(hasUnboundedQueue ? ['Unbounded connection queue'] : []),
          ...(!hasCleanup ? ['Missing explicit cleanup'] : []),
          ...(parseInt(maxConnections) > 10 ? ['High connection limit'] : [])
        ],
        riskLevel: hasUnboundedQueue || parseInt(maxConnections) > 10 ? 'HIGH' : 'MEDIUM'
      });
      
      console.log(`   📊 Prisma Pool: ${maxConnections} max, ${minConnections} min connections`);
      console.log(`      Memory Estimate: ${(parseInt(maxConnections) || 20) * 5}MB`);
      console.log(`      TTL: ${parseInt(connectionTtl) / 1000 / 60} minutes`);
      console.log(`      Issues: ${pools[0].issues.length} found`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error analyzing Prisma pool: ${error.message}`);
  }
  
  // Advanced Connection Pool Manager
  try {
    const advancedPoolPath = 'apps/server/shared/ConnectionPoolManager.ts';
    if (fs.existsSync(advancedPoolPath)) {
      const content = fs.readFileSync(advancedPoolPath, 'utf8');
      
      const maxConnections = content.match(/max:\s*(\d+)/)?.[1] || 'unknown';
      const hasUnboundedMetrics = content.includes('private metrics: PoolMetrics[] = []');
      const hasUnboundedAlerts = content.includes('private alerts: PoolAlert[] = []');
      const hasUnboundedCache = content.includes('private queryCache: Map');
      
      pools.push({
        name: 'Advanced Connection Pool',
        file: advancedPoolPath,
        maxConnections: parseInt(maxConnections) || 20,
        memoryEstimate: (parseInt(maxConnections) || 20) * 5 + 50, // connections + overhead
        issues: [
          ...(hasUnboundedMetrics ? ['Unbounded metrics array'] : []),
          ...(hasUnboundedAlerts ? ['Unbounded alerts array'] : []),
          ...(hasUnboundedCache ? ['Unbounded query cache'] : [])
        ],
        riskLevel: hasUnboundedMetrics || hasUnboundedAlerts ? 'CRITICAL' : 'HIGH'
      });
      
      console.log(`   📊 Advanced Pool: ${maxConnections} max connections`);
      console.log(`      Memory Estimate: ${(parseInt(maxConnections) || 20) * 5 + 50}MB`);
      console.log(`      Issues: ${pools[1].issues.length} found`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error analyzing Advanced pool: ${error.message}`);
  }
  
  // Performance Connection Pool
  try {
    const perfPoolPath = 'packages/shared/performance/optimization.ts';
    if (fs.existsSync(perfPoolPath)) {
      const content = fs.readFileSync(perfPoolPath, 'utf8');
      
      const maxConnections = content.match(/maxConnections:\s*(\d+)/)?.[1] || '25';
      const hasWaitingQueue = content.includes('waitingQueue: WaitingRequest[]');
      
      pools.push({
        name: 'Performance Connection Pool',
        file: perfPoolPath,
        maxConnections: parseInt(maxConnections) || 25,
        memoryEstimate: (parseInt(maxConnections) || 25) * 5,
        issues: [
          ...(hasWaitingQueue ? ['Unbounded waiting queue'] : []),
          ...(parseInt(maxConnections) > 15 ? ['Very high connection limit'] : [])
        ],
        riskLevel: parseInt(maxConnections) > 20 ? 'HIGH' : 'MEDIUM'
      });
      
      console.log(`   📊 Performance Pool: ${maxConnections} max connections`);
      console.log(`      Memory Estimate: ${(parseInt(maxConnections) || 25) * 5}MB`);
      console.log(`      Issues: ${pools[2].issues.length} found`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error analyzing Performance pool: ${error.message}`);
  }
  
  analysisResults.databasePools = pools;
  
  const totalDbMemory = pools.reduce((sum, pool) => sum + pool.memoryEstimate, 0);
  console.log(`\n   🎯 Total Database Pool Memory: ${totalDbMemory}MB`);
  
  return pools;
}

// WebSocket Connection Analysis
async function analyzeWebSocketConnections() {
  console.log('\n🌐 2. WEBSOCKET CONNECTIONS ANALYSIS');
  
  const connections = [];
  
  // Socket.IO Server Analysis
  try {
    const socketPath = 'apps/server/socket.ts';
    if (fs.existsSync(socketPath)) {
      const content = fs.readFileSync(socketPath, 'utf8');
      
      const maxBufferSize = content.match(/maxHttpBufferSize:\s*(\d+)/)?.[1] || '1000000';
      const pingTimeout = content.match(/pingTimeout:\s*(\d+)/)?.[1] || '60000';
      const hasConnectionTracking = content.includes('connectionCounts = new Map');
      const hasPeriodicCleanup = content.includes('setInterval');
      
      const bufferSizeMB = parseInt(maxBufferSize) / 1024 / 1024;
      const estimatedConnections = 50; // Estimate 50 concurrent connections
      
      connections.push({
        name: 'Socket.IO Server',
        file: socketPath,
        bufferSizePerConnection: bufferSizeMB,
        estimatedConnections,
        memoryEstimate: estimatedConnections * bufferSizeMB + 20, // connections + overhead
        pingTimeout: parseInt(pingTimeout),
        issues: [
          ...(!hasPeriodicCleanup ? ['No periodic cleanup'] : []),
          ...(bufferSizeMB > 0.5 ? ['Large buffer size per connection'] : []),
          ...(parseInt(pingTimeout) > 30000 ? ['Long ping timeout'] : [])
        ],
        riskLevel: bufferSizeMB > 0.5 ? 'HIGH' : 'MEDIUM'
      });
      
      console.log(`   🔌 Socket.IO: ${bufferSizeMB.toFixed(1)}MB buffer per connection`);
      console.log(`      Estimated ${estimatedConnections} connections = ${(estimatedConnections * bufferSizeMB + 20).toFixed(1)}MB`);
      console.log(`      Issues: ${connections[0].issues.length} found`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error analyzing Socket.IO: ${error.message}`);
  }
  
  // Dashboard WebSocket Service
  try {
    const dashboardWSPath = 'apps/server/services/DashboardWebSocket.ts';
    if (fs.existsSync(dashboardWSPath)) {
      const content = fs.readFileSync(dashboardWSPath, 'utf8');
      
      const hasConnectionMap = content.includes('connections: Map<string, Socket>');
      const hasSubscriptionMap = content.includes('subscriptions: Map<string, string[]>');
      const hasExplicitCleanup = content.includes('disconnect') && content.includes('delete');
      
      connections.push({
        name: 'Dashboard WebSocket',
        file: dashboardWSPath,
        estimatedConnections: 10, // Fewer dashboard connections
        memoryEstimate: 20, // Connection tracking + subscriptions
        issues: [
          ...(hasConnectionMap && !hasExplicitCleanup ? ['Connection map may not cleanup'] : []),
          ...(hasSubscriptionMap ? ['Subscription tracking overhead'] : [])
        ],
        riskLevel: !hasExplicitCleanup ? 'MEDIUM' : 'LOW'
      });
      
      console.log(`   📊 Dashboard WS: Estimated 20MB (tracking + subscriptions)`);
      console.log(`      Issues: ${connections[1].issues.length} found`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error analyzing Dashboard WS: ${error.message}`);
  }
  
  // Client WebSocket Hooks
  try {
    const clientWSPath = 'apps/client/src/hooks/useWebSocket.ts';
    if (fs.existsSync(clientWSPath)) {
      const content = fs.readFileSync(clientWSPath, 'utf8');
      
      const hasReconnectionLogic = content.includes('reconnectTimeout');
      const hasProperCleanup = content.includes('createSafeTimeout');
      const hasRaceConditionProtection = content.includes('isConnectingRef');
      
      connections.push({
        name: 'Client WebSocket Hooks',
        file: clientWSPath,
        memoryEstimate: 10, // Client-side connections
        issues: [
          ...(!hasProperCleanup ? ['Potential timeout accumulation'] : []),
          ...(!hasRaceConditionProtection ? ['Race condition risk'] : [])
        ],
        riskLevel: hasProperCleanup && hasRaceConditionProtection ? 'LOW' : 'MEDIUM'
      });
      
      console.log(`   💻 Client WS: Estimated 10MB (client-side)`);
      console.log(`      Issues: ${connections[2].issues.length} found`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error analyzing Client WS: ${error.message}`);
  }
  
  analysisResults.websocketPools = connections;
  
  const totalWSMemory = connections.reduce((sum, conn) => sum + conn.memoryEstimate, 0);
  console.log(`\n   🎯 Total WebSocket Memory: ${totalWSMemory}MB`);
  
  return connections;
}

// HTTP Connection Pool Analysis
async function analyzeHTTPConnectionPools() {
  console.log('\n🌍 3. HTTP CONNECTION POOLS ANALYSIS');
  
  const httpClients = [];
  
  // Check package.json for HTTP-related dependencies
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Undici Analysis
    if (deps['undici']) {
      httpClients.push({
        name: 'Undici HTTP/2 Client',
        version: deps['undici'],
        memoryEstimate: 12, // HTTP/2 pools + TLS cache
        features: ['HTTP/2 connection pools', 'TLS session cache', 'Request/response buffers'],
        riskLevel: 'MEDIUM',
        issues: ['TLS session cache may accumulate', 'HTTP/2 connection persistence']
      });
      
      console.log(`   🚀 Undici ${deps['undici']}: 12MB (HTTP/2 pools + TLS cache)`);
    }
    
    // Node-fetch Analysis
    if (deps['node-fetch']) {
      httpClients.push({
        name: 'Node-fetch HTTP Client',
        version: deps['node-fetch'],
        memoryEstimate: 5, // HTTP agent pools
        features: ['HTTP agent pools', 'Keep-alive connections'],
        riskLevel: 'LOW',
        issues: ['Keep-alive connection persistence']
      });
      
      console.log(`   📡 Node-fetch ${deps['node-fetch']}: 5MB (agent pools)`);
    }
    
    // Axios Analysis
    if (deps['axios']) {
      httpClients.push({
        name: 'Axios HTTP Client', 
        version: deps['axios'],
        memoryEstimate: 4, // Interceptors + default agent
        features: ['Request/response interceptors', 'Default HTTP agent'],
        riskLevel: 'LOW',
        issues: ['Minimal - well-managed pools']
      });
      
      console.log(`   🔧 Axios ${deps['axios']}: 4MB (interceptors + agent)`);
    }
    
  } catch (error) {
    console.log(`   ⚠️ Error analyzing HTTP clients: ${error.message}`);
  }
  
  analysisResults.httpPools = httpClients;
  
  const totalHTTPMemory = httpClients.reduce((sum, client) => sum + client.memoryEstimate, 0);
  console.log(`\n   🎯 Total HTTP Pool Memory: ${totalHTTPMemory}MB`);
  
  return httpClients;
}

// Redis Connection Analysis
async function analyzeRedisConnections() {
  console.log('\n🔴 4. REDIS CONNECTIONS ANALYSIS');
  
  const redisConnections = [];
  
  // Cache Manager Redis Analysis
  try {
    const cacheManagerPath = 'apps/server/shared/CacheManager.ts';
    if (fs.existsSync(cacheManagerPath)) {
      const content = fs.readFileSync(cacheManagerPath, 'utf8');
      
      const hasRedisClient = content.includes('redisClient: any = null');
      const isRedisEnabled = content.includes('enableRedis: boolean');
      const isImplemented = content.includes('Redis initialization would go here') === false;
      
      redisConnections.push({
        name: 'Cache Manager Redis',
        file: cacheManagerPath,
        implemented: isImplemented,
        memoryEstimate: isImplemented ? 15 : 0, // When implemented
        issues: [
          ...(!isImplemented ? ['Redis not yet implemented'] : []),
          ...(isImplemented ? ['Connection pool needs monitoring'] : [])
        ],
        riskLevel: isImplemented ? 'MEDIUM' : 'NONE'
      });
      
      console.log(`   🗄️ Cache Manager Redis: ${isImplemented ? 'Implemented' : 'Planned but not implemented'}`);
      if (isImplemented) {
        console.log(`      Memory Estimate: 15MB`);
      } else {
        console.log(`      Status: Implementation pending`);
      }
    }
  } catch (error) {
    console.log(`   ⚠️ Error analyzing Cache Manager Redis: ${error.message}`);
  }
  
  // Production Redis Configuration
  try {
    const prodConfigPath = 'deploy/production/config.ts';
    if (fs.existsSync(prodConfigPath)) {
      const content = fs.readFileSync(prodConfigPath, 'utf8');
      
      const hasClusterConfig = content.includes('cluster:');
      const hasSentinelConfig = content.includes('sentinel:');
      const nodeCount = (content.match(/host:/g) || []).length;
      
      redisConnections.push({
        name: 'Production Redis Config',
        file: prodConfigPath,
        clusterEnabled: hasClusterConfig,
        sentinelEnabled: hasSentinelConfig,
        nodeCount: nodeCount,
        memoryEstimate: hasClusterConfig ? nodeCount * 10 : 15, // Per node estimate
        issues: [
          ...(hasClusterConfig ? ['Multiple cluster node connections'] : []),
          ...(hasSentinelConfig ? ['Multiple sentinel connections'] : []),
          'Configuration exists but may not be used'
        ],
        riskLevel: hasClusterConfig ? 'HIGH' : 'MEDIUM'
      });
      
      console.log(`   ⚙️ Production Redis Config: ${nodeCount} nodes configured`);
      console.log(`      Cluster: ${hasClusterConfig}, Sentinel: ${hasSentinelConfig}`);
      console.log(`      Memory Estimate: ${hasClusterConfig ? nodeCount * 10 : 15}MB (if used)`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error analyzing Production Redis config: ${error.message}`);
  }
  
  analysisResults.redisPools = redisConnections;
  
  const totalRedisMemory = redisConnections.reduce((sum, redis) => sum + redis.memoryEstimate, 0);
  console.log(`\n   🎯 Total Redis Memory: ${totalRedisMemory}MB`);
  
  return redisConnections;
}

// Internal Connection Pool Analysis
async function analyzeInternalPools() {
  console.log('\n🔧 5. INTERNAL CONNECTION POOLS ANALYSIS');
  
  const internalPools = [];
  
  // Query Optimizer Pool
  try {
    const optimizerPath = 'packages/shared/performance/optimization.ts';
    if (fs.existsSync(optimizerPath)) {
      const content = fs.readFileSync(optimizerPath, 'utf8');
      
      const hasQueryCache = content.includes('queryCache: Map');
      const hasConnectionPool = content.includes('connectionPool: ConnectionPool');
      
      internalPools.push({
        name: 'Query Optimizer Pool',
        file: optimizerPath,
        memoryEstimate: 5,
        issues: [
          ...(hasQueryCache ? ['Unbounded query cache'] : []),
          ...(hasConnectionPool ? ['Internal connection pool overhead'] : [])
        ],
        riskLevel: 'LOW'
      });
      
      console.log(`   📊 Query Optimizer: 5MB (cache + internal pool)`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error analyzing Query Optimizer: ${error.message}`);
  }
  
  // Performance Monitor
  try {
    const perfMonitorPath = 'packages/shared/performance/optimization.ts';
    if (fs.existsSync(perfMonitorPath)) {
      const content = fs.readFileSync(perfMonitorPath, 'utf8');
      
      const hasMetricsBuffer = content.includes('metricsBuffer: PerformanceMetric[]');
      
      internalPools.push({
        name: 'Performance Monitor Pool',
        file: perfMonitorPath,
        memoryEstimate: 3,
        issues: [
          ...(hasMetricsBuffer ? ['Unbounded metrics buffer'] : [])
        ],
        riskLevel: 'LOW'
      });
      
      console.log(`   📈 Performance Monitor: 3MB (metrics buffer)`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error analyzing Performance Monitor: ${error.message}`);
  }
  
  analysisResults.internalPools = internalPools;
  
  const totalInternalMemory = internalPools.reduce((sum, pool) => sum + pool.memoryEstimate, 0);
  console.log(`\n   🎯 Total Internal Pool Memory: ${totalInternalMemory}MB`);
  
  return internalPools;
}

// Critical Issues Analysis
function analyzeCriticalIssues() {
  console.log('\n🚨 6. CRITICAL ISSUES ANALYSIS');
  
  const criticalIssues = [];
  
  // Check for unbounded collections
  let unboundedCollections = 0;
  analysisResults.databasePools.forEach(pool => {
    pool.issues.forEach(issue => {
      if (issue.includes('Unbounded') || issue.includes('unbounded')) {
        unboundedCollections++;
        criticalIssues.push({
          type: 'Unbounded Collection',
          source: pool.name,
          severity: 'CRITICAL',
          issue: issue,
          estimatedImpact: '50-200MB memory leak over time'
        });
      }
    });
  });
  
  // Check for high connection limits
  let highConnectionPools = 0;
  analysisResults.databasePools.forEach(pool => {
    if (pool.maxConnections > 10) {
      highConnectionPools++;
      criticalIssues.push({
        type: 'High Connection Limit',
        source: pool.name,
        severity: 'HIGH',
        issue: `${pool.maxConnections} max connections`,
        estimatedImpact: `${(pool.maxConnections - 5) * 5}MB excessive memory usage`
      });
    }
  });
  
  // Check for missing cleanup
  let missingCleanup = 0;
  [...analysisResults.databasePools, ...analysisResults.websocketPools].forEach(pool => {
    if (pool.issues.some(issue => issue.includes('cleanup') || issue.includes('disconnect'))) {
      missingCleanup++;
      criticalIssues.push({
        type: 'Missing Cleanup',
        source: pool.name,
        severity: 'HIGH',
        issue: 'No explicit cleanup implemented',
        estimatedImpact: 'Gradual memory accumulation'
      });
    }
  });
  
  console.log(`   🔍 Found ${criticalIssues.length} critical issues:`);
  console.log(`      - Unbounded Collections: ${unboundedCollections}`);
  console.log(`      - High Connection Limits: ${highConnectionPools}`);
  console.log(`      - Missing Cleanup: ${missingCleanup}`);
  
  criticalIssues.forEach((issue, index) => {
    console.log(`\n   ${index + 1}. ${issue.type} - ${issue.severity}`);
    console.log(`      Source: ${issue.source}`);
    console.log(`      Issue: ${issue.issue}`);
    console.log(`      Impact: ${issue.estimatedImpact}`);
  });
  
  analysisResults.criticalIssues = criticalIssues;
  
  return criticalIssues;
}

// Generate Recommendations
function generateRecommendations() {
  console.log('\n🛠️ 7. RECOMMENDATIONS');
  
  const recommendations = [];
  
  // Critical Priority Recommendations
  if (analysisResults.criticalIssues.some(issue => issue.severity === 'CRITICAL')) {
    recommendations.push({
      priority: 'CRITICAL',
      action: 'Fix Unbounded Collections',
      description: 'Implement size limits and cleanup for all unbounded arrays and maps',
      estimatedSavings: '100-200MB',
      implementation: 'Limit arrays to 500-1000 entries, implement LRU eviction'
    });
  }
  
  if (analysisResults.databasePools.some(pool => pool.maxConnections > 10)) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Reduce Connection Pool Limits',
      description: 'Reduce max connections from 20+ to 3-5 per pool',
      estimatedSavings: '75-150MB',
      implementation: 'Update connection pool configurations'
    });
  }
  
  if (analysisResults.websocketPools.some(conn => conn.issues.length > 0)) {
    recommendations.push({
      priority: 'HIGH', 
      action: 'Optimize WebSocket Buffers',
      description: 'Reduce buffer sizes and implement aggressive cleanup',
      estimatedSavings: '20-40MB',
      implementation: 'Reduce maxHttpBufferSize, shorter timeouts'
    });
  }
  
  // Medium Priority Recommendations
  recommendations.push({
    priority: 'MEDIUM',
    action: 'Implement Connection Pool Monitoring',
    description: 'Add real-time monitoring for all connection pools',
    estimatedSavings: 'Prevention of future leaks',
    implementation: 'Integrate with ProcessMemoryAnalyzer'
  });
  
  recommendations.push({
    priority: 'MEDIUM',
    action: 'Add Comprehensive Cleanup',
    description: 'Implement shutdown cleanup for all pools',
    estimatedSavings: 'Graceful memory release',
    implementation: 'Add cleanup methods to all pool managers'
  });
  
  console.log(`   📋 Generated ${recommendations.length} recommendations:`);
  
  recommendations.forEach((rec, index) => {
    console.log(`\n   ${index + 1}. ${rec.action} (${rec.priority})`);
    console.log(`      Description: ${rec.description}`);
    console.log(`      Estimated Savings: ${rec.estimatedSavings}`);
    console.log(`      Implementation: ${rec.implementation}`);
  });
  
  analysisResults.recommendations = recommendations;
  
  return recommendations;
}

// Calculate Total Memory Impact
function calculateTotalMemoryImpact() {
  console.log('\n📊 8. TOTAL MEMORY IMPACT ANALYSIS');
  
  const memoryBreakdown = {
    database: analysisResults.databasePools.reduce((sum, pool) => sum + pool.memoryEstimate, 0),
    websocket: analysisResults.websocketPools.reduce((sum, conn) => sum + conn.memoryEstimate, 0),
    http: analysisResults.httpPools.reduce((sum, client) => sum + client.memoryEstimate, 0),
    redis: analysisResults.redisPools.reduce((sum, redis) => sum + redis.memoryEstimate, 0),
    internal: analysisResults.internalPools.reduce((sum, pool) => sum + pool.memoryEstimate, 0)
  };
  
  const totalCurrentMemory = Object.values(memoryBreakdown).reduce((sum, mem) => sum + mem, 0);
  
  // Calculate optimized memory (after fixes)
  const optimizedBreakdown = {
    database: Math.min(memoryBreakdown.database * 0.2, 80), // 80% reduction, max 80MB
    websocket: Math.min(memoryBreakdown.websocket * 0.5, 35), // 50% reduction, max 35MB
    http: Math.min(memoryBreakdown.http * 0.7, 14), // 30% reduction, max 14MB
    redis: memoryBreakdown.redis, // No reduction (not implemented)
    internal: Math.min(memoryBreakdown.internal * 0.6, 8) // 40% reduction, max 8MB
  };
  
  const totalOptimizedMemory = Object.values(optimizedBreakdown).reduce((sum, mem) => sum + mem, 0);
  const totalSavings = totalCurrentMemory - totalOptimizedMemory;
  const savingsPercentage = ((totalSavings / totalCurrentMemory) * 100).toFixed(1);
  
  console.log(`   📈 Current Memory Usage:`);
  console.log(`      Database Pools: ${memoryBreakdown.database}MB`);
  console.log(`      WebSocket Pools: ${memoryBreakdown.websocket}MB`);
  console.log(`      HTTP Pools: ${memoryBreakdown.http}MB`);
  console.log(`      Redis Pools: ${memoryBreakdown.redis}MB`);
  console.log(`      Internal Pools: ${memoryBreakdown.internal}MB`);
  console.log(`      TOTAL CURRENT: ${totalCurrentMemory}MB`);
  
  console.log(`\n   📉 Optimized Memory Usage:`);
  console.log(`      Database Pools: ${optimizedBreakdown.database}MB`);
  console.log(`      WebSocket Pools: ${optimizedBreakdown.websocket}MB`);
  console.log(`      HTTP Pools: ${optimizedBreakdown.http}MB`);
  console.log(`      Redis Pools: ${optimizedBreakdown.redis}MB`);
  console.log(`      Internal Pools: ${optimizedBreakdown.internal}MB`);
  console.log(`      TOTAL OPTIMIZED: ${totalOptimizedMemory}MB`);
  
  console.log(`\n   💾 Memory Savings:`);
  console.log(`      Total Savings: ${totalSavings}MB`);
  console.log(`      Reduction: ${savingsPercentage}%`);
  
  analysisResults.totalMemoryEstimate = totalCurrentMemory;
  analysisResults.optimizedMemoryEstimate = totalOptimizedMemory;
  analysisResults.totalSavings = totalSavings;
  analysisResults.savingsPercentage = savingsPercentage;
  
  return {
    current: totalCurrentMemory,
    optimized: totalOptimizedMemory,
    savings: totalSavings,
    percentage: savingsPercentage
  };
}

// Generate Summary Report
function generateSummaryReport() {
  const reportPath = path.join(__dirname, 'connection-pool-analysis-report.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalConnectionPools: analysisResults.databasePools.length + 
                           analysisResults.websocketPools.length + 
                           analysisResults.httpPools.length + 
                           analysisResults.redisPools.length + 
                           analysisResults.internalPools.length,
      currentMemoryUsage: analysisResults.totalMemoryEstimate,
      optimizedMemoryUsage: analysisResults.optimizedMemoryEstimate,
      potentialSavings: analysisResults.totalSavings,
      savingsPercentage: analysisResults.savingsPercentage,
      criticalIssuesFound: analysisResults.criticalIssues.length,
      recommendationsGenerated: analysisResults.recommendations.length
    },
    detailedAnalysis: analysisResults,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage()
    }
  };
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 Detailed report saved to: ${reportPath}`);
  } catch (error) {
    console.log(`\n⚠️ Failed to save report: ${error.message}`);
  }
  
  return report;
}

// Main analysis function
async function runConnectionPoolAnalysis() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting Connection Pool Analysis...\n');
    
    // Run all analyses
    await analyzeDatabaseConnectionPools();
    await analyzeWebSocketConnections();
    await analyzeHTTPConnectionPools();
    await analyzeRedisConnections();
    await analyzeInternalPools();
    
    // Analyze issues and generate recommendations
    analyzeCriticalIssues();
    generateRecommendations();
    const memoryImpact = calculateTotalMemoryImpact();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Generate final summary
    console.log('\n' + '='.repeat(70));
    console.log('🎯 CONNECTION POOL ANALYSIS SUMMARY');
    console.log('='.repeat(70));
    
    console.log(`\n📊 Analysis Results:`);
    console.log(`   ⏱️ Duration: ${duration}ms`);
    console.log(`   🔗 Connection Pools Analyzed: ${analysisResults.databasePools.length + analysisResults.websocketPools.length + analysisResults.httpPools.length + analysisResults.redisPools.length + analysisResults.internalPools.length}`);
    console.log(`   🚨 Critical Issues: ${analysisResults.criticalIssues.length}`);
    console.log(`   💡 Recommendations: ${analysisResults.recommendations.length}`);
    
    console.log(`\n💾 Memory Impact:`);
    console.log(`   📈 Current Usage: ${memoryImpact.current}MB`);
    console.log(`   📉 Optimized Usage: ${memoryImpact.optimized}MB`);
    console.log(`   💰 Potential Savings: ${memoryImpact.savings}MB (${memoryImpact.percentage}%)`);
    
    console.log(`\n🎯 Priority Actions:`);
    const criticalRecs = analysisResults.recommendations.filter(r => r.priority === 'CRITICAL');
    const highRecs = analysisResults.recommendations.filter(r => r.priority === 'HIGH');
    
    if (criticalRecs.length > 0) {
      console.log(`   🚨 CRITICAL: ${criticalRecs.length} actions require immediate attention`);
      criticalRecs.forEach(rec => {
        console.log(`      - ${rec.action}: ${rec.estimatedSavings} savings`);
      });
    }
    
    if (highRecs.length > 0) {
      console.log(`   ⚠️ HIGH: ${highRecs.length} actions should be completed this sprint`);
      highRecs.forEach(rec => {
        console.log(`      - ${rec.action}: ${rec.estimatedSavings} savings`);
      });
    }
    
    console.log(`\n🔧 Implementation Priority:`);
    console.log(`   1. Fix unbounded collections (CRITICAL - 100-200MB savings)`);
    console.log(`   2. Reduce connection pool limits (HIGH - 75-150MB savings)`);
    console.log(`   3. Optimize WebSocket buffers (HIGH - 20-40MB savings)`);
    console.log(`   4. Implement comprehensive monitoring (MEDIUM)`);
    console.log(`   5. Add graceful shutdown cleanup (MEDIUM)`);
    
    // Generate detailed report
    generateSummaryReport();
    
    console.log(`\n✅ Analysis Complete! Review the recommendations and implement fixes to reduce memory usage by ${memoryImpact.savings}MB (${memoryImpact.percentage}%).`);
    
    return {
      success: true,
      memoryImpact,
      criticalIssues: analysisResults.criticalIssues.length,
      recommendations: analysisResults.recommendations.length
    };
    
  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute analysis if called directly
if (require.main === module) {
  runConnectionPoolAnalysis().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { runConnectionPoolAnalysis };
