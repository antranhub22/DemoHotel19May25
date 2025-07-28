import { TestSuite } from '../testFramework';

// ============================================
// PERFORMANCE TESTING CONFIGURATIONS
// ============================================

export interface PerformanceBenchmark {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  expectedMaxResponseTime: number; // milliseconds
  expectedMinThroughput: number; // requests per second
  description: string;
  tags: string[];
}

export const performanceBenchmarks: PerformanceBenchmark[] = [
  {
    endpoint: '/api/calls',
    method: 'GET',
    expectedMaxResponseTime: 500,
    expectedMinThroughput: 100,
    description: 'Call list retrieval should be fast for real-time dashboards',
    tags: ['calls', 'list', 'dashboard'],
  },
  {
    endpoint: '/api/v2/calls',
    method: 'GET',
    expectedMaxResponseTime: 800,
    expectedMinThroughput: 50,
    description:
      'Advanced filtering may be slower but should remain responsive',
    tags: ['calls', 'advanced-filter', 'complex'],
  },
  {
    endpoint: '/api/transcripts',
    method: 'GET',
    expectedMaxResponseTime: 300,
    expectedMinThroughput: 80,
    description: 'Transcript retrieval for real-time conversation display',
    tags: ['transcripts', 'real-time', 'conversation'],
  },
  {
    endpoint: '/api/transcripts',
    method: 'POST',
    expectedMaxResponseTime: 200,
    expectedMinThroughput: 150,
    description: 'Transcript creation during live voice calls must be fast',
    tags: ['transcripts', 'creation', 'live'],
  },
  {
    endpoint: '/api/summaries',
    method: 'GET',
    expectedMaxResponseTime: 400,
    expectedMinThroughput: 70,
    description: 'Summary retrieval for guest service completion',
    tags: ['summaries', 'completion', 'service'],
  },
  {
    endpoint: '/api/guest/auth',
    method: 'POST',
    expectedMaxResponseTime: 300,
    expectedMinThroughput: 100,
    description: 'Guest authentication must be fast for mobile app experience',
    tags: ['auth', 'mobile', 'guest'],
  },
  {
    endpoint: '/api/version/current',
    method: 'GET',
    expectedMaxResponseTime: 100,
    expectedMinThroughput: 200,
    description: 'Version detection should have minimal overhead',
    tags: ['version', 'detection', 'overhead'],
  },
];

// ============================================
// LOAD TESTING SCENARIOS
// ============================================

export interface LoadTestScenario {
  name: string;
  description: string;
  duration: number; // seconds
  concurrentUsers: number;
  requestsPerUser: number;
  endpoints: Array<{
    endpoint: string;
    method: string;
    weight: number; // percentage of requests
    headers?: Record<string, string>;
    body?: any;
  }>;
  tags: string[];
}

export const loadTestScenarios: LoadTestScenario[] = [
  {
    name: 'Peak Guest Activity',
    description:
      'Simulate peak guest activity with multiple voice calls and requests',
    duration: 60,
    concurrentUsers: 50,
    requestsPerUser: 20,
    endpoints: [
      {
        endpoint: '/api/guest/auth',
        method: 'POST',
        weight: 10,
        headers: { 'Content-Type': 'application/json' },
        body: { roomNumber: '101', lastName: 'Smith' },
      },
      {
        endpoint: '/api/calls',
        method: 'GET',
        weight: 25,
        headers: { 'API-Version': 'v2.2' },
      },
      {
        endpoint: '/api/transcripts',
        method: 'POST',
        weight: 30,
        headers: { 'Content-Type': 'application/json' },
        body: {
          callId: 'test-call',
          role: 'user',
          content: 'Room service request',
        },
      },
      {
        endpoint: '/api/transcripts',
        method: 'GET',
        weight: 20,
        headers: { 'API-Version': 'v2.2' },
      },
      {
        endpoint: '/api/summaries',
        method: 'POST',
        weight: 10,
        headers: { 'Content-Type': 'application/json' },
        body: { callId: 'test-call', content: 'Guest requested room service' },
      },
      {
        endpoint: '/api/summaries',
        method: 'GET',
        weight: 5,
        headers: { 'API-Version': 'v2.2' },
      },
    ],
    tags: ['peak', 'guest', 'voice', 'realistic'],
  },
  {
    name: 'Advanced Filtering Stress Test',
    description: 'Test advanced filtering performance under load',
    duration: 30,
    concurrentUsers: 25,
    requestsPerUser: 10,
    endpoints: [
      {
        endpoint:
          '/api/v2/calls?advancedFilter[AND][0][field]=language&advancedFilter[AND][0][operator]=eq&advancedFilter[AND][0][value]=en',
        method: 'GET',
        weight: 30,
        headers: { 'API-Version': 'v2.2' },
      },
      {
        endpoint: '/api/v2/calls?preset=TODAY_CALLS',
        method: 'GET',
        weight: 25,
        headers: { 'API-Version': 'v2.2' },
      },
      {
        endpoint: '/api/v2/calls?preset=LONG_CALLS',
        method: 'GET',
        weight: 20,
        headers: { 'API-Version': 'v2.2' },
      },
      {
        endpoint: '/api/transcripts?search=room service&searchFields=content',
        method: 'GET',
        weight: 15,
        headers: { 'API-Version': 'v2.2' },
      },
      {
        endpoint: '/api/summaries?search=guest&searchFields=content',
        method: 'GET',
        weight: 10,
        headers: { 'API-Version': 'v2.2' },
      },
    ],
    tags: ['advanced', 'filtering', 'complex', 'search'],
  },
  {
    name: 'Version Compatibility Load',
    description: 'Test performance across different API versions',
    duration: 45,
    concurrentUsers: 30,
    requestsPerUser: 15,
    endpoints: [
      {
        endpoint: '/api/v2.2/calls',
        method: 'GET',
        weight: 40,
        headers: { 'API-Version': 'v2.2' },
      },
      {
        endpoint: '/api/v2.1/calls',
        method: 'GET',
        weight: 30,
        headers: { 'API-Version': 'v2.1' },
      },
      {
        endpoint: '/api/v2.0/calls',
        method: 'GET',
        weight: 20,
        headers: { 'API-Version': 'v2.0' },
      },
      {
        endpoint: '/api/v1.1/calls',
        method: 'GET',
        weight: 10,
        headers: { 'API-Version': 'v1.1' },
      },
    ],
    tags: ['version', 'compatibility', 'migration'],
  },
  {
    name: 'Real-time Voice Processing',
    description: 'Simulate real-time voice transcript processing',
    duration: 120,
    concurrentUsers: 20,
    requestsPerUser: 50,
    endpoints: [
      {
        endpoint: '/api/transcripts',
        method: 'POST',
        weight: 60,
        headers: { 'Content-Type': 'application/json' },
        body: {
          callId: 'live-call',
          role: 'user',
          content: 'Real-time transcript chunk',
        },
      },
      {
        endpoint: '/api/transcripts/live-call',
        method: 'GET',
        weight: 30,
        headers: { 'API-Version': 'v2.2' },
      },
      {
        endpoint: '/api/calls',
        method: 'PATCH',
        weight: 10,
        headers: { 'Content-Type': 'application/json' },
        body: { status: 'in_progress', duration: 180 },
      },
    ],
    tags: ['real-time', 'voice', 'transcripts', 'live'],
  },
];

// ============================================
// PERFORMANCE TEST SUITE
// ============================================

export const performanceTestSuite: TestSuite = {
  name: 'Performance & Load Testing',
  description: 'Comprehensive performance testing for Guest Journey APIs',
  category: 'performance',
  version: 'v2.2',
  tags: ['performance', 'load', 'stress'],
  tests: [
    {
      name: 'Response Time Benchmarks',
      description: 'Test all endpoints meet response time requirements',
      method: 'GET',
      endpoint: '/api/calls',
      headers: {
        'API-Version': 'v2.2',
      },
      expectedStatus: 200,
      timeout: 500,
      customValidation: async response => {
        // This would be extended to test all benchmarks
        return response.success && response.meta && response.meta.pagination;
      },
      tags: ['benchmark', 'response-time'],
    },
    {
      name: 'Concurrent Request Handling',
      description: 'Test system handles concurrent requests efficiently',
      method: 'GET',
      endpoint: '/api/transcripts',
      headers: {
        'API-Version': 'v2.2',
      },
      expectedStatus: 200,
      timeout: 1000,
      customValidation: response => {
        return response.success && Array.isArray(response.data);
      },
      tags: ['concurrent', 'throughput'],
    },
    {
      name: 'Advanced Filter Performance',
      description: 'Test complex filtering remains performant',
      method: 'GET',
      endpoint: '/api/v2/calls',
      headers: {
        'API-Version': 'v2.2',
      },
      query: {
        'advancedFilter[AND][0][field]': 'language',
        'advancedFilter[AND][0][operator]': 'eq',
        'advancedFilter[AND][0][value]': 'en',
        'advancedFilter[AND][1][field]': 'duration',
        'advancedFilter[AND][1][operator]': 'gt',
        'advancedFilter[AND][1][value]': '120',
        sort: 'start_time',
        order: 'desc',
        page: 1,
        limit: 50,
      },
      expectedStatus: 200,
      timeout: 800,
      customValidation: response => {
        return (
          response.success &&
          response.meta &&
          response.meta.advancedQuery &&
          response.meta.performance
        );
      },
      tags: ['advanced-filter', 'complex', 'performance'],
    },
    {
      name: 'Version Detection Overhead',
      description: 'Test version detection adds minimal overhead',
      method: 'GET',
      endpoint: '/api/version/current',
      headers: {
        'API-Version': 'v2.2',
      },
      expectedStatus: 200,
      timeout: 100,
      customValidation: response => {
        return (
          response.success && response.data.version && response.data.client
        );
      },
      tags: ['version', 'overhead', 'detection'],
    },
    {
      name: 'Database Query Optimization',
      description: 'Test database queries are optimized for performance',
      method: 'GET',
      endpoint: '/api/calls',
      headers: {
        'API-Version': 'v2.2',
      },
      query: {
        page: 1,
        limit: 100,
        sort: 'start_time',
        order: 'desc',
      },
      expectedStatus: 200,
      timeout: 300,
      customValidation: response => {
        return (
          response.success &&
          Array.isArray(response.data) &&
          response.data.length <= 100 &&
          response.meta.pagination
        );
      },
      tags: ['database', 'optimization', 'query'],
    },
    {
      name: 'Memory Usage Monitoring',
      description: 'Test memory usage remains stable under load',
      method: 'GET',
      endpoint: '/api/health/versioned',
      headers: {
        'API-Version': 'v2.2',
      },
      expectedStatus: 200,
      timeout: 200,
      customValidation: response => {
        return (
          response.success &&
          response.data.status === 'healthy' &&
          response.meta.uptime !== undefined
        );
      },
      tags: ['memory', 'health', 'monitoring'],
    },
  ],
};

// ============================================
// STRESS TESTING SCENARIOS
// ============================================

export interface StressTestScenario {
  name: string;
  description: string;
  phases: Array<{
    name: string;
    duration: number; // seconds
    concurrentUsers: number;
    requestRate: number; // requests per second per user
  }>;
  endpoints: string[];
  acceptableFailureRate: number; // percentage
  tags: string[];
}

export const stressTestScenarios: StressTestScenario[] = [
  {
    name: 'Gradual Load Increase',
    description: 'Gradually increase load to find breaking point',
    phases: [
      { name: 'Baseline', duration: 30, concurrentUsers: 10, requestRate: 1 },
      { name: 'Light Load', duration: 60, concurrentUsers: 25, requestRate: 2 },
      {
        name: 'Medium Load',
        duration: 60,
        concurrentUsers: 50,
        requestRate: 3,
      },
      {
        name: 'Heavy Load',
        duration: 60,
        concurrentUsers: 100,
        requestRate: 4,
      },
      { name: 'Peak Load', duration: 60, concurrentUsers: 200, requestRate: 5 },
      {
        name: 'Stress Load',
        duration: 60,
        concurrentUsers: 400,
        requestRate: 6,
      },
    ],
    endpoints: ['/api/calls', '/api/transcripts', '/api/summaries'],
    acceptableFailureRate: 5, // 5% failure rate acceptable at peak
    tags: ['gradual', 'breaking-point', 'scalability'],
  },
  {
    name: 'Spike Load Test',
    description: 'Test system handles sudden traffic spikes',
    phases: [
      { name: 'Normal', duration: 60, concurrentUsers: 20, requestRate: 2 },
      { name: 'Spike', duration: 30, concurrentUsers: 200, requestRate: 10 },
      { name: 'Recovery', duration: 60, concurrentUsers: 20, requestRate: 2 },
    ],
    endpoints: ['/api/guest/auth', '/api/transcripts', '/api/calls'],
    acceptableFailureRate: 10, // 10% failure during spike acceptable
    tags: ['spike', 'recovery', 'elasticity'],
  },
  {
    name: 'Sustained High Load',
    description: 'Test system stability under sustained high load',
    phases: [
      { name: 'Ramp Up', duration: 120, concurrentUsers: 100, requestRate: 3 },
      {
        name: 'Sustained',
        duration: 600,
        concurrentUsers: 100,
        requestRate: 3,
      },
      { name: 'Ramp Down', duration: 120, concurrentUsers: 20, requestRate: 1 },
    ],
    endpoints: ['/api/v2/calls', '/api/transcripts', '/api/summaries'],
    acceptableFailureRate: 2, // Very low failure rate for sustained load
    tags: ['sustained', 'stability', 'endurance'],
  },
];

// ============================================
// PERFORMANCE METRICS & REPORTING
// ============================================

export interface PerformanceMetrics {
  timestamp: Date;
  endpoint: string;
  method: string;
  responseTime: {
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    concurrentUsers: number;
  };
  errors: {
    total: number;
    rate: number; // percentage
    types: Record<string, number>;
  };
  resources: {
    cpuUsage: number; // percentage
    memoryUsage: number; // MB
    dbConnections: number;
  };
}

export interface PerformanceReport {
  summary: {
    testDuration: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    peakThroughput: number;
    overallScore: number; // 0-100
  };
  benchmarks: Array<{
    endpoint: string;
    expected: PerformanceBenchmark;
    actual: PerformanceMetrics;
    passed: boolean;
    deviation: number; // percentage
  }>;
  bottlenecks: Array<{
    endpoint: string;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
  }>;
  trends: {
    responseTimeOverTime: Array<{ time: number; value: number }>;
    throughputOverTime: Array<{ time: number; value: number }>;
    errorRateOverTime: Array<{ time: number; value: number }>;
  };
}

// ============================================
// EXPORT ALL PERFORMANCE TESTING COMPONENTS
// ============================================

export default {
  performanceBenchmarks,
  loadTestScenarios,
  performanceTestSuite,
  stressTestScenarios,
};
