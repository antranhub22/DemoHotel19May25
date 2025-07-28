import { logger } from '@shared/utils/logger';
import { Express } from 'express';
import request from 'supertest';

export interface TestCase {
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, any>;
  expectedStatus: number;
  expectedResponse?: any;
  customValidation?: (response: any) => boolean | Promise<boolean>;
  timeout?: number;
  retries?: number;
  tags: string[];
}

export interface TestResult {
  testSuite: string;
  testCase: string;
  status: 'passed' | 'failed' | 'skipped' | 'timeout';
  duration: number;
  response?: any;
  error?: string;
  timestamp: Date;
  version?: string;
  metadata: Record<string, any>;
}

export interface TestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    coverage: number;
  };
  results: TestResult[];
  performance: {
    averageResponseTime: number;
    slowestEndpoint: string;
    fastestEndpoint: string;
    timeouts: number;
  };
  versions: {
    tested: string[];
    compatibility: Record<string, boolean>;
  };
  categories: Record<string, { passed: number; failed: number; total: number }>;
}

// ============================================
// TEST DATA MANAGEMENT
// ============================================

export class TestDataManager {
  private static instance: TestDataManager;
  private testData: Map<string, any> = new Map();
  private cleanupTasks: Array<() => Promise<void>> = [];

  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  async createTestTenant(): Promise<any> {
    const tenantData = {
      id: `test-tenant-${Date.now()}`,
      hotel_name: 'Test Hotel',
      contact_email: 'test@hotel.com',
      phone: '+1234567890',
      address: '123 Test Street',
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Insert test tenant (would use actual DB schema)
    this.testData.set(`tenant-${tenantData.id}`, tenantData);

    // Add cleanup task
    this.cleanupTasks.push(async () => {
      this.testData.delete(`tenant-${tenantData.id}`);
    });

    return tenantData;
  }

  async createTestCall(tenantId: string): Promise<any> {
    const callData = {
      id: `call-${Date.now()}`,
      tenant_id: tenantId,
      call_id_vapi: `vapi-${Date.now()}`,
      room_number: '101',
      language: 'en',
      service_type: 'room_service',
      start_time: new Date(),
      end_time: new Date(Date.now() + 300000), // 5 minutes later
      duration: 300,
      status: 'completed',
      created_at: new Date(),
    };

    this.testData.set(`call-${callData.id}`, callData);

    this.cleanupTasks.push(async () => {
      this.testData.delete(`call-${callData.id}`);
    });

    return callData;
  }

  async createTestTranscript(callId: string): Promise<any> {
    const transcriptData = {
      id: `transcript-${Date.now()}`,
      call_id: callId,
      role: 'user',
      content: 'I would like to order room service',
      timestamp: new Date(),
      created_at: new Date(),
    };

    this.testData.set(`transcript-${transcriptData.id}`, transcriptData);

    this.cleanupTasks.push(async () => {
      this.testData.delete(`transcript-${transcriptData.id}`);
    });

    return transcriptData;
  }

  async createTestSummary(callId: string): Promise<any> {
    const summaryData = {
      id: `summary-${Date.now()}`,
      call_id: callId,
      content: 'Guest requested room service - 2 sandwiches and coffee',
      room_number: '101',
      duration: 300,
      timestamp: new Date(),
    };

    this.testData.set(`summary-${summaryData.id}`, summaryData);

    this.cleanupTasks.push(async () => {
      this.testData.delete(`summary-${summaryData.id}`);
    });

    return summaryData;
  }

  getTestData(key: string): any {
    return this.testData.get(key);
  }

  async cleanup(): Promise<void> {
    logger.debug(
      '🧹 [TEST-FRAMEWORK] Cleaning up test data...',
      'TestFramework'
    );

    for (const cleanupTask of this.cleanupTasks) {
      try {
        await cleanupTask();
      } catch (error) {
        logger.error(
          '❌ [TEST-FRAMEWORK] Error during cleanup:',
          'TestFramework',
          error
        );
      }
    }

    this.cleanupTasks = [];
    this.testData.clear();

    logger.debug(
      '✅ [TEST-FRAMEWORK] Test data cleanup completed',
      'TestFramework'
    );
  }
}

// ============================================
// API TEST RUNNER
// ============================================

export class ApiTestRunner {
  private app: Express;
  private testDataManager: TestDataManager;
  private results: TestResult[] = [];

  constructor(app: Express) {
    this.app = app;
    this.testDataManager = TestDataManager.getInstance();
  }

  async runTestSuite(testSuite: TestSuite): Promise<TestResult[]> {
    logger.debug(
      `🧪 [TEST-FRAMEWORK] Running test suite: ${testSuite.name}`,
      'TestFramework'
    );

    const suiteResults: TestResult[] = [];

    // Setup
    if (testSuite.setup) {
      try {
        await testSuite.setup();
      } catch (error) {
        logger.error(
          `❌ [TEST-FRAMEWORK] Setup failed for ${testSuite.name}:`,
          'TestFramework',
          error
        );
        return suiteResults;
      }
    }

    // Run tests
    for (const testCase of testSuite.tests) {
      const result = await this.runTestCase(testSuite, testCase);
      suiteResults.push(result);
      this.results.push(result);
    }

    // Teardown
    if (testSuite.teardown) {
      try {
        await testSuite.teardown();
      } catch (error) {
        logger.error(
          `❌ [TEST-FRAMEWORK] Teardown failed for ${testSuite.name}:`,
          'TestFramework',
          error
        );
      }
    }

    return suiteResults;
  }

  private async runTestCase(
    testSuite: TestSuite,
    testCase: TestCase
  ): Promise<TestResult> {
    const startTime = Date.now();

    logger.debug(
      `🔍 [TEST-FRAMEWORK] Running: ${testCase.name}`,
      'TestFramework'
    );

    try {
      // Build request
      let apiRequest = request(this.app)[
        testCase.method.toLowerCase() as keyof typeof request
      ];
      apiRequest = apiRequest(testCase.endpoint);

      // Add headers
      if (testCase.headers) {
        Object.entries(testCase.headers).forEach(([key, value]) => {
          apiRequest = apiRequest.set(key, value);
        });
      }

      // Add query parameters
      if (testCase.query) {
        apiRequest = apiRequest.query(testCase.query);
      }

      // Add body for POST/PUT/PATCH
      if (testCase.body && ['POST', 'PUT', 'PATCH'].includes(testCase.method)) {
        apiRequest = apiRequest.send(testCase.body);
      }

      // Set timeout
      if (testCase.timeout) {
        apiRequest = apiRequest.timeout(testCase.timeout);
      }

      // Execute request
      const response = await apiRequest;
      const duration = Date.now() - startTime;

      // Validate status code
      const statusMatch = response.status === testCase.expectedStatus;
      let customValidationResult = true;

      // Custom validation
      if (testCase.customValidation) {
        customValidationResult = await testCase.customValidation(response.body);
      }

      // Expected response validation
      let responseMatch = true;
      if (testCase.expectedResponse) {
        responseMatch = this.deepCompare(
          response.body,
          testCase.expectedResponse
        );
      }

      const passed = statusMatch && customValidationResult && responseMatch;

      const result: TestResult = {
        testSuite: testSuite.name,
        testCase: testCase.name,
        status: passed ? 'passed' : 'failed',
        duration,
        response: response.body,
        timestamp: new Date(),
        version: testSuite.version,
        metadata: {
          statusCode: response.status,
          statusMatch,
          customValidationResult,
          responseMatch,
          endpoint: testCase.endpoint,
          method: testCase.method,
          tags: testCase.tags,
          category: testSuite.category,
        },
      };

      if (!passed) {
        result.error = `Status: ${statusMatch ? '✅' : '❌'}, Custom: ${customValidationResult ? '✅' : '❌'}, Response: ${responseMatch ? '✅' : '❌'}`;
      }

      logger.debug(
        `${passed ? '✅' : '❌'} [TEST-FRAMEWORK] ${testCase.name}: ${passed ? 'PASSED' : 'FAILED'} (${duration}ms)`,
        'TestFramework'
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(
        `❌ [TEST-FRAMEWORK] ${testCase.name} failed:`,
        'TestFramework',
        error
      );

      return {
        testSuite: testSuite.name,
        testCase: testCase.name,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        version: testSuite.version,
        metadata: {
          endpoint: testCase.endpoint,
          method: testCase.method,
          tags: testCase.tags,
          category: testSuite.category,
        },
      };
    }
  }

  private deepCompare(actual: any, expected: any): boolean {
    if (typeof expected !== 'object' || expected === null) {
      return actual === expected;
    }

    if (Array.isArray(expected)) {
      if (!Array.isArray(actual) || actual.length !== expected.length) {
        return false;
      }
      return expected.every((item, index) =>
        this.deepCompare(actual[index], item)
      );
    }

    for (const key in expected) {
      if (!(key in actual) || !this.deepCompare(actual[key], expected[key])) {
        return false;
      }
    }

    return true;
  }

  generateReport(): TestReport {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    // Performance metrics
    const responseTimes = this.results.map(r => r.duration);
    const averageResponseTime =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    const endpointTimes = this.results.reduce(
      (acc, r) => {
        const endpoint = r.metadata.endpoint;
        if (!acc[endpoint]) acc[endpoint] = [];
        acc[endpoint].push(r.duration);
        return acc;
      },
      {} as Record<string, number[]>
    );

    const avgEndpointTimes = Object.entries(endpointTimes).map(
      ([endpoint, times]) => ({
        endpoint,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      })
    );

    const slowestEndpoint =
      avgEndpointTimes.sort((a, b) => b.avgTime - a.avgTime)[0]?.endpoint || '';
    const fastestEndpoint =
      avgEndpointTimes.sort((a, b) => a.avgTime - b.avgTime)[0]?.endpoint || '';

    // Version compatibility
    const testedVersions = [
      ...new Set(this.results.map(r => r.version).filter(Boolean)),
    ];
    const versionCompatibility = testedVersions.reduce(
      (acc, version) => {
        const versionResults = this.results.filter(r => r.version === version);
        const versionPassed = versionResults.every(r => r.status === 'passed');
        acc[version!] = versionPassed;
        return acc;
      },
      {} as Record<string, boolean>
    );

    // Category breakdown
    const categories = this.results.reduce(
      (acc, r) => {
        const category = r.metadata.category || 'uncategorized';
        if (!acc[category]) acc[category] = { passed: 0, failed: 0, total: 0 };
        acc[category].total++;
        if (r.status === 'passed') acc[category].passed++;
        if (r.status === 'failed') acc[category].failed++;
        return acc;
      },
      {} as Record<string, { passed: number; failed: number; total: number }>
    );

    return {
      summary: {
        total,
        passed,
        failed,
        skipped,
        duration: totalDuration,
        coverage: total > 0 ? (passed / total) * 100 : 0,
      },
      results: this.results,
      performance: {
        averageResponseTime,
        slowestEndpoint,
        fastestEndpoint,
        timeouts: this.results.filter(r => r.error?.includes('timeout')).length,
      },
      versions: {
        tested: testedVersions,
        compatibility: versionCompatibility,
      },
      categories,
    };
  }

  clearResults(): void {
    this.results = [];
  }
}

// ============================================
// VERSION TESTING UTILITIES
// ============================================

export class VersionTestRunner {
  private apiTestRunner: ApiTestRunner;

  constructor(app: Express) {
    this.apiTestRunner = new ApiTestRunner(app);
  }

  async testVersionCompatibility(
    endpoint: string,
    versions: string[]
  ): Promise<Record<string, TestResult>> {
    const results: Record<string, TestResult> = {};

    for (const version of versions) {
      const testSuite: TestSuite = {
        name: `Version Compatibility - ${version}`,
        description: `Test ${endpoint} compatibility with version ${version}`,
        category: 'integration',
        version,
        tags: ['version', 'compatibility'],
        tests: [
          {
            name: `${endpoint} - ${version}`,
            description: `Test ${endpoint} with version ${version}`,
            method: 'GET',
            endpoint: endpoint.replace('{version}', version),
            headers: {
              'API-Version': version,
              Accept: `application/vnd.hotel.${version}+json`,
            },
            expectedStatus: 200,
            tags: ['compatibility', version],
          },
        ],
      };

      const suiteResults = await this.apiTestRunner.runTestSuite(testSuite);
      if (suiteResults.length > 0) {
        results[version] = suiteResults[0];
      }
    }

    return results;
  }

  async testVersionMigration(
    fromVersion: string,
    toVersion: string
  ): Promise<TestResult[]> {
    const testSuite: TestSuite = {
      name: `Version Migration - ${fromVersion} to ${toVersion}`,
      description: `Test migration path from ${fromVersion} to ${toVersion}`,
      category: 'integration',
      version: toVersion,
      tags: ['migration', 'version'],
      tests: [
        {
          name: 'Migration Guide Available',
          description: 'Check if migration guide exists',
          method: 'GET',
          endpoint: `/api/migration/${fromVersion}/${toVersion}`,
          expectedStatus: 200,
          customValidation: response => {
            return (
              response.success &&
              response.data.migration &&
              response.data.migration.guide
            );
          },
          tags: ['migration'],
        },
        {
          name: 'Migration Validation',
          description: 'Validate migration compatibility',
          method: 'POST',
          endpoint: '/api/migration/validate',
          body: {
            fromVersion,
            toVersion,
            clientCode: 'fetch("/api/calls")',
          },
          expectedStatus: 200,
          customValidation: response => {
            return (
              response.success && response.data.hasOwnProperty('compatible')
            );
          },
          tags: ['migration', 'validation'],
        },
      ],
    };

    return await this.apiTestRunner.runTestSuite(testSuite);
  }
}

// ============================================
// PERFORMANCE TESTING UTILITIES
// ============================================

export class PerformanceTestRunner {
  private app: Express;

  constructor(app: Express) {
    this.app = app;
  }

  async loadTest(
    endpoint: string,
    options: {
      requests: number;
      concurrency: number;
      timeout?: number;
      headers?: Record<string, string>;
    }
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    requestsPerSecond: number;
    errors: string[];
  }> {
    const { requests, concurrency, timeout = 5000, headers = {} } = options;
    const results: Array<{ success: boolean; time: number; error?: string }> =
      [];

    logger.debug(
      `🏋️ [PERF-TEST] Load testing ${endpoint} - ${requests} requests, ${concurrency} concurrent`,
      'PerformanceTest'
    );

    const startTime = Date.now();
    const batches = Math.ceil(requests / concurrency);

    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrency, requests - batch * concurrency);
      const promises: Promise<{
        success: boolean;
        time: number;
        error?: string;
      }>[] = [];

      for (let i = 0; i < batchSize; i++) {
        promises.push(this.singleRequest(endpoint, headers, timeout));
      }

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    const totalTime = Date.now() - startTime;
    const successfulRequests = results.filter(r => r.success).length;
    const failedRequests = results.filter(r => !r.success).length;
    const responseTimes = results.filter(r => r.success).map(r => r.time);
    const errors = results.filter(r => !r.success).map(r => r.error!);

    return {
      totalRequests: requests,
      successfulRequests,
      failedRequests,
      averageResponseTime:
        responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length
          : 0,
      minResponseTime:
        responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime:
        responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      requestsPerSecond:
        totalTime > 0 ? (successfulRequests * 1000) / totalTime : 0,
      errors: [...new Set(errors)],
    };
  }

  private async singleRequest(
    endpoint: string,
    headers: Record<string, string>,
    timeout: number
  ): Promise<{ success: boolean; time: number; error?: string }> {
    const startTime = Date.now();

    try {
      let apiRequest = request(this.app).get(endpoint);

      Object.entries(headers).forEach(([key, value]) => {
        apiRequest = apiRequest.set(key, value);
      });

      await apiRequest.timeout(timeout);

      return {
        success: true,
        time: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        time: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// ============================================
// EXPORTS
// ============================================

export default {
  TestDataManager,
  ApiTestRunner,
  VersionTestRunner,
  PerformanceTestRunner,
};
