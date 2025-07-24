#!/usr/bin/env node

// ============================================
// BASIC LOAD TEST SCRIPT v1.0 - External Load Testing
// ============================================
// Simple load testing script using built-in Node.js modules
// Can be used to test the hotel management system externally

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// Test configuration
const config = {
  baseUrl: process.env.TEST_URL || 'http://localhost:10000',
  duration: parseInt(process.env.TEST_DURATION) || 60, // seconds
  concurrency: parseInt(process.env.TEST_CONCURRENCY) || 5,
  rampUpTime: parseInt(process.env.TEST_RAMPUP) || 10, // seconds
  endpoints: [
    { path: '/api/core/health', method: 'GET', weight: 30 },
    { path: '/api/admin/health', method: 'GET', weight: 20 },
    { path: '/api/hotel/health', method: 'GET', weight: 20 },
    { path: '/api/analytics/health', method: 'GET', weight: 15 },
    { path: '/api/voice/health', method: 'GET', weight: 15 },
  ],
};

// Test results tracking
const results = {
  startTime: null,
  endTime: null,
  requests: [],
  errors: [],
  summary: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    requestsPerSecond: 0,
    errorRate: 0,
  },
};

/**
 * Make HTTP request
 */
function makeRequest(endpoint) {
  return new Promise(resolve => {
    const startTime = performance.now();
    const url = new URL(endpoint.path, config.baseUrl);
    const client = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: endpoint.method,
      timeout: 30000,
      headers: {
        'User-Agent': 'BasicLoadTest/1.0',
        Accept: 'application/json',
      },
    };

    const req = client.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        const result = {
          endpoint: endpoint.path,
          method: endpoint.method,
          statusCode: res.statusCode,
          responseTime,
          timestamp: new Date(),
          success: res.statusCode >= 200 && res.statusCode < 400,
          contentLength: data.length,
        };

        results.requests.push(result);

        if (!result.success) {
          results.errors.push({
            ...result,
            error: `HTTP ${res.statusCode}`,
          });
        }

        resolve(result);
      });
    });

    req.on('error', error => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const result = {
        endpoint: endpoint.path,
        method: endpoint.method,
        statusCode: 0,
        responseTime,
        timestamp: new Date(),
        success: false,
        error: error.message,
      };

      results.requests.push(result);
      results.errors.push(result);

      resolve(result);
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const result = {
        endpoint: endpoint.path,
        method: endpoint.method,
        statusCode: 0,
        responseTime,
        timestamp: new Date(),
        success: false,
        error: 'Timeout',
      };

      results.requests.push(result);
      results.errors.push(result);

      resolve(result);
    });

    req.end();
  });
}

/**
 * Select weighted endpoint
 */
function selectEndpoint() {
  const totalWeight = config.endpoints.reduce((sum, ep) => sum + ep.weight, 0);
  const random = Math.random() * totalWeight;

  let currentWeight = 0;
  for (const endpoint of config.endpoints) {
    currentWeight += endpoint.weight;
    if (random <= currentWeight) {
      return endpoint;
    }
  }

  return config.endpoints[0];
}

/**
 * Run load test worker
 */
async function runWorker(workerId, duration) {
  console.log(`🚀 Starting worker ${workerId}`);

  const endTime = Date.now() + duration * 1000;
  const requestPromises = [];

  while (Date.now() < endTime) {
    const endpoint = selectEndpoint();
    const requestPromise = makeRequest(endpoint);
    requestPromises.push(requestPromise);

    // Wait between requests (simulate realistic user behavior)
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Wait for remaining requests to complete
  await Promise.all(requestPromises);
  console.log(`✅ Worker ${workerId} completed`);
}

/**
 * Calculate test results
 */
function calculateResults() {
  const totalDuration = (results.endTime - results.startTime) / 1000;

  results.summary.totalRequests = results.requests.length;
  results.summary.successfulRequests = results.requests.filter(
    r => r.success
  ).length;
  results.summary.failedRequests = results.requests.filter(
    r => !r.success
  ).length;

  if (results.requests.length > 0) {
    const responseTimes = results.requests.map(r => r.responseTime);
    results.summary.averageResponseTime =
      responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
    results.summary.minResponseTime = Math.min(...responseTimes);
    results.summary.maxResponseTime = Math.max(...responseTimes);
  }

  results.summary.requestsPerSecond =
    results.summary.totalRequests / totalDuration;
  results.summary.errorRate =
    results.summary.failedRequests / results.summary.totalRequests;

  // Calculate percentiles
  const sortedResponseTimes = results.requests
    .map(r => r.responseTime)
    .sort((a, b) => a - b);

  results.summary.p50ResponseTime =
    sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.5)] || 0;
  results.summary.p95ResponseTime =
    sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] || 0;
  results.summary.p99ResponseTime =
    sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] || 0;
}

/**
 * Print results
 */
function printResults() {
  console.log('\n📊 LOAD TEST RESULTS');
  console.log('=====================');
  console.log(
    `🕐 Duration: ${((results.endTime - results.startTime) / 1000).toFixed(2)}s`
  );
  console.log(`📈 Total Requests: ${results.summary.totalRequests}`);
  console.log(`✅ Successful: ${results.summary.successfulRequests}`);
  console.log(`❌ Failed: ${results.summary.failedRequests}`);
  console.log(
    `📊 Requests/sec: ${results.summary.requestsPerSecond.toFixed(2)}`
  );
  console.log(
    `⚡ Avg Response Time: ${results.summary.averageResponseTime.toFixed(2)}ms`
  );
  console.log(
    `🔥 Min Response Time: ${results.summary.minResponseTime.toFixed(2)}ms`
  );
  console.log(
    `🐌 Max Response Time: ${results.summary.maxResponseTime.toFixed(2)}ms`
  );
  console.log(
    `📊 P50 Response Time: ${results.summary.p50ResponseTime.toFixed(2)}ms`
  );
  console.log(
    `📊 P95 Response Time: ${results.summary.p95ResponseTime.toFixed(2)}ms`
  );
  console.log(
    `📊 P99 Response Time: ${results.summary.p99ResponseTime.toFixed(2)}ms`
  );
  console.log(
    `🚨 Error Rate: ${(results.summary.errorRate * 100).toFixed(2)}%`
  );

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS');
    console.log('=========');
    const errorGroups = {};
    results.errors.forEach(error => {
      const key = `${error.endpoint} - ${error.error || error.statusCode}`;
      errorGroups[key] = (errorGroups[key] || 0) + 1;
    });

    Object.entries(errorGroups).forEach(([error, count]) => {
      console.log(`${error}: ${count} occurrences`);
    });
  }

  // Performance assessment
  console.log('\n🎯 PERFORMANCE ASSESSMENT');
  console.log('=========================');

  let grade = 'A';
  const recommendations = [];

  if (results.summary.averageResponseTime > 1000) {
    grade = grade === 'A' ? 'B' : grade;
    recommendations.push('High average response time - consider optimization');
  }

  if (results.summary.errorRate > 0.05) {
    grade = grade === 'A' ? 'C' : grade === 'B' ? 'C' : grade;
    recommendations.push('High error rate - investigate reliability issues');
  }

  if (results.summary.p95ResponseTime > 3000) {
    grade = grade === 'A' ? 'B' : grade;
    recommendations.push(
      'High 95th percentile response time - check for outliers'
    );
  }

  console.log(`📝 Grade: ${grade}`);

  if (recommendations.length > 0) {
    console.log('💡 Recommendations:');
    recommendations.forEach(rec => console.log(`  - ${rec}`));
  } else {
    console.log('🎉 Excellent performance!');
  }
}

/**
 * Export results to JSON
 */
function exportResults() {
  const filename = `load-test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const fs = require('fs');
  const path = require('path');

  const exportData = {
    config,
    results: {
      ...results,
      duration: (results.endTime - results.startTime) / 1000,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const outputDir = path.join(process.cwd(), 'test-results', 'load-testing');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    console.log(`\n💾 Results exported to: ${filepath}`);
  } catch (error) {
    console.error(`❌ Failed to export results: ${error.message}`);
  }
}

/**
 * Main load test execution
 */
async function runLoadTest() {
  console.log('🚀 BASIC LOAD TEST STARTING');
  console.log('============================');
  console.log(`🎯 Target: ${config.baseUrl}`);
  console.log(`⏱️ Duration: ${config.duration}s`);
  console.log(`👥 Concurrency: ${config.concurrency}`);
  console.log(`📈 Ramp-up: ${config.rampUpTime}s`);
  console.log(`📊 Endpoints: ${config.endpoints.length}`);

  results.startTime = Date.now();

  // Start workers with ramp-up
  const workers = [];
  const rampUpDelay = (config.rampUpTime * 1000) / config.concurrency;

  for (let i = 0; i < config.concurrency; i++) {
    setTimeout(() => {
      workers.push(runWorker(i + 1, config.duration));
    }, i * rampUpDelay);
  }

  // Wait for all workers to complete
  await Promise.all(workers);

  results.endTime = Date.now();

  // Calculate and display results
  calculateResults();
  printResults();

  // Export results
  if (process.env.EXPORT_RESULTS !== 'false') {
    exportResults();
  }

  console.log('\n✅ Load test completed!');

  // Exit with appropriate code
  process.exit(results.summary.errorRate > 0.1 ? 1 : 0);
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⏹️ Load test interrupted');
  if (results.startTime) {
    results.endTime = Date.now();
    calculateResults();
    printResults();
  }
  process.exit(2);
});

// Run the load test if this script is executed directly
if (require.main === module) {
  runLoadTest().catch(error => {
    console.error('❌ Load test failed:', error);
    process.exit(1);
  });
}

module.exports = { runLoadTest, config, results };
