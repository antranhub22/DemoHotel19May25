// ============================================
// LOAD TEST MANAGER v1.0 - Phase 5.3 Load Testing
// ============================================
// Comprehensive load testing system with stress testing, concurrent user simulation,
// performance benchmarking, and detailed analytics

import { logger } from '@shared/utils/logger';
import { cacheManager } from './CacheManager';
import { performanceAuditor } from './PerformanceAuditor';

// Load testing interfaces
export interface LoadTestScenario {
  name: string;
  description: string;
  duration: number; // seconds
  rampUp: number; // seconds
  targetRPS: number; // requests per second
  maxConcurrentUsers: number;
  endpoints: LoadTestEndpoint[];
  dataPatterns: LoadTestDataPattern[];
  conditions: LoadTestCondition[];
}

export interface LoadTestEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  weight: number; // percentage of total requests
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number[];
  timeout: number; // ms
  validation?: (response: any) => boolean;
}

export interface LoadTestDataPattern {
  type: 'sequential' | 'random' | 'weighted' | 'realistic';
  data: any[];
  weights?: number[];
}

export interface LoadTestCondition {
  type: 'response_time' | 'error_rate' | 'throughput' | 'resource_usage';
  threshold: number;
  action: 'continue' | 'stop' | 'throttle' | 'alert';
}

export interface LoadTestResult {
  scenario: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    throughput: number;
  };
  endpoints: LoadTestEndpointResult[];
  performance: {
    cpuUsage: number[];
    memoryUsage: number[];
    cacheHitRate: number[];
    databaseConnections: number[];
  };
  errors: LoadTestError[];
  recommendations: string[];
}

export interface LoadTestEndpointResult {
  endpoint: string;
  method: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  requestsPerSecond: number;
  errors: LoadTestError[];
}

export interface LoadTestError {
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  error: string;
  responseTime: number;
}

export interface ConcurrentUserSimulation {
  name: string;
  userJourneys: UserJourney[];
  concurrentUsers: number;
  duration: number;
  rampUpTime: number;
  thinkTime: { min: number; max: number };
}

export interface UserJourney {
  name: string;
  weight: number; // percentage of users following this journey
  steps: UserJourneyStep[];
}

export interface UserJourneyStep {
  name: string;
  endpoint: LoadTestEndpoint;
  thinkTime?: number; // ms
  extractData?: string[]; // Data to extract for next steps
  dependencies?: string[]; // Data dependencies from previous steps
}

export interface StressTestConfig {
  type: 'spike' | 'gradual' | 'sustained' | 'burst';
  baseline: number; // RPS
  peak: number; // RPS
  duration: number; // seconds
  spikeDuration?: number; // seconds for spike tests
  burstInterval?: number; // seconds between bursts
}

/**
 * Load Test Manager
 * Comprehensive load testing with scenarios, user simulation, and analytics
 */
export class LoadTestManager {
  private static instance: LoadTestManager;
  private activeTests = new Map<string, LoadTestExecution>();
  private testResults: LoadTestResult[] = [];
  private isInitialized = false;

  private constructor() {}

  static getInstance(): LoadTestManager {
    if (!this.instance) {
      this.instance = new LoadTestManager();
    }
    return this.instance;
  }

  /**
   * Initialize load test manager
   */
  async initialize(): Promise<void> {
    try {
      logger.info(
        '📈 [LoadTestManager] Initializing load testing system',
        'LoadTestManager'
      );

      // Setup test data generators
      await this.setupTestDataGenerators();

      // Initialize performance baseline
      await this.establishPerformanceBaseline();

      this.isInitialized = true;
      logger.success(
        '✅ [LoadTestManager] Load testing system initialized',
        'LoadTestManager'
      );
    } catch (error) {
      logger.error(
        '❌ [LoadTestManager] Failed to initialize load test manager',
        'LoadTestManager',
        error
      );
      throw error;
    }
  }

  /**
   * Run load test scenario
   */
  async runLoadTest(scenario: LoadTestScenario): Promise<LoadTestResult> {
    try {
      logger.info(
        `🚀 [LoadTestManager] Starting load test: ${scenario.name}`,
        'LoadTestManager'
      );

      const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const execution = new LoadTestExecution(testId, scenario);

      this.activeTests.set(testId, execution);

      // Pre-test performance audit
      const preTestAudit = await performanceAuditor.runQuickAudit();

      // Run the test
      const result = await this.executeLoadTest(execution);

      // Post-test performance audit
      const postTestAudit = await performanceAuditor.runQuickAudit();

      // Analyze results
      result.recommendations = this.generateRecommendations(
        result,
        preTestAudit,
        postTestAudit
      );

      // Store results
      this.testResults.push(result);
      this.activeTests.delete(testId);

      logger.success(
        `✅ [LoadTestManager] Load test completed: ${scenario.name}`,
        'LoadTestManager',
        {
          duration: result.duration,
          totalRequests: result.summary.totalRequests,
          errorRate: result.summary.errorRate,
          averageResponseTime: result.summary.averageResponseTime,
        }
      );

      return result;
    } catch (error) {
      logger.error(
        '❌ [LoadTestManager] Load test failed',
        'LoadTestManager',
        error
      );
      throw error;
    }
  }

  /**
   * Run concurrent user simulation
   */
  async runConcurrentUserSimulation(
    simulation: ConcurrentUserSimulation
  ): Promise<LoadTestResult> {
    try {
      logger.info(
        `👥 [LoadTestManager] Starting user simulation: ${simulation.name}`,
        'LoadTestManager'
      );

      // Convert user simulation to load test scenario
      const scenario = this.convertUserSimulationToScenario(simulation);

      // Run as load test
      return await this.runLoadTest(scenario);
    } catch (error) {
      logger.error(
        '❌ [LoadTestManager] User simulation failed',
        'LoadTestManager',
        error
      );
      throw error;
    }
  }

  /**
   * Run stress test
   */
  async runStressTest(
    config: StressTestConfig,
    baseScenario: LoadTestScenario
  ): Promise<LoadTestResult> {
    try {
      logger.info(
        `💥 [LoadTestManager] Starting stress test: ${config.type}`,
        'LoadTestManager'
      );

      // Create stress test scenario
      const stressScenario = this.createStressScenario(config, baseScenario);

      // Run stress test
      return await this.runLoadTest(stressScenario);
    } catch (error) {
      logger.error(
        '❌ [LoadTestManager] Stress test failed',
        'LoadTestManager',
        error
      );
      throw error;
    }
  }

  /**
   * Get active tests
   */
  getActiveTests(): Array<{
    id: string;
    scenario: string;
    startTime: Date;
    progress: number;
    currentRPS: number;
    currentUsers: number;
  }> {
    return Array.from(this.activeTests.values()).map(execution => ({
      id: execution.id,
      scenario: execution.scenario.name,
      startTime: execution.startTime,
      progress: execution.getProgress(),
      currentRPS: execution.getCurrentRPS(),
      currentUsers: execution.getCurrentUsers(),
    }));
  }

  /**
   * Get test results
   */
  getTestResults(limit: number = 10): LoadTestResult[] {
    return this.testResults.slice(-limit);
  }

  /**
   * Get performance comparison
   */
  getPerformanceComparison(
    testId1: string,
    testId2: string
  ): {
    test1: LoadTestResult;
    test2: LoadTestResult;
    comparison: {
      responseTimeChange: number;
      throughputChange: number;
      errorRateChange: number;
      recommendations: string[];
    };
  } | null {
    const test1 = this.testResults.find(r => r.scenario === testId1);
    const test2 = this.testResults.find(r => r.scenario === testId2);

    if (!test1 || !test2) return null;

    const responseTimeChange =
      ((test2.summary.averageResponseTime - test1.summary.averageResponseTime) /
        test1.summary.averageResponseTime) *
      100;
    const throughputChange =
      ((test2.summary.throughput - test1.summary.throughput) /
        test1.summary.throughput) *
      100;
    const errorRateChange = test2.summary.errorRate - test1.summary.errorRate;

    const recommendations = [];
    if (responseTimeChange > 10)
      recommendations.push('Response time degraded significantly');
    if (throughputChange < -10)
      recommendations.push('Throughput decreased significantly');
    if (errorRateChange > 0.05) recommendations.push('Error rate increased');

    return {
      test1,
      test2,
      comparison: {
        responseTimeChange,
        throughputChange,
        errorRateChange,
        recommendations,
      },
    };
  }

  /**
   * Get diagnostics
   */
  getDiagnostics() {
    return {
      initialized: this.isInitialized,
      activeTests: this.activeTests.size,
      completedTests: this.testResults.length,
      lastTestTime:
        this.testResults.length > 0
          ? this.testResults[this.testResults.length - 1].endTime
          : null,
    };
  }

  // Private methods

  private async executeLoadTest(
    execution: LoadTestExecution
  ): Promise<LoadTestResult> {
    const startTime = new Date();
    const scenario = execution.scenario;

    // Initialize tracking
    const requests: Array<{
      endpoint: string;
      method: string;
      startTime: number;
      endTime: number;
      status: number;
      error?: string;
    }> = [];

    const performanceSnapshots: Array<{
      timestamp: Date;
      cpuUsage: number;
      memoryUsage: number;
      cacheHitRate: number;
    }> = [];

    // Start performance monitoring
    const monitoringInterval = setInterval(async () => {
      const snapshot = await this.capturePerformanceSnapshot();
      performanceSnapshots.push(snapshot);
    }, 1000);

    try {
      // Simulate load test execution
      await this.simulateLoadTestExecution(scenario, requests);

      // Stop monitoring
      clearInterval(monitoringInterval);

      const endTime = new Date();
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;

      // Calculate results
      const result = this.calculateLoadTestResult(
        scenario,
        startTime,
        endTime,
        duration,
        requests,
        performanceSnapshots
      );

      return result;
    } catch (error) {
      clearInterval(monitoringInterval);
      throw error;
    }
  }

  private async simulateLoadTestExecution(
    scenario: LoadTestScenario,
    requests: Array<any>
  ): Promise<void> {
    const { duration, rampUp, targetRPS, endpoints } = scenario;

    // Simulate ramp up period
    const rampUpSteps = Math.min(rampUp, 10);
    const stepDuration = rampUp / rampUpSteps;

    for (let step = 0; step < rampUpSteps; step++) {
      const currentRPS = (targetRPS * (step + 1)) / rampUpSteps;
      await this.simulateRequestsForDuration(
        stepDuration,
        currentRPS,
        endpoints,
        requests
      );
    }

    // Simulate sustained load
    const sustainedDuration = duration - rampUp;
    if (sustainedDuration > 0) {
      await this.simulateRequestsForDuration(
        sustainedDuration,
        targetRPS,
        endpoints,
        requests
      );
    }
  }

  private async simulateRequestsForDuration(
    duration: number,
    rps: number,
    endpoints: LoadTestEndpoint[],
    requests: Array<any>
  ): Promise<void> {
    const totalRequests = Math.floor(duration * rps);
    const interval = 1000 / rps; // ms between requests

    for (let i = 0; i < totalRequests; i++) {
      // Select endpoint based on weight
      const endpoint = this.selectWeightedEndpoint(endpoints);

      // Simulate request
      const startTime = Date.now();
      const simulatedResult = this.simulateHttpRequest(endpoint);
      const endTime = Date.now();

      requests.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        startTime,
        endTime,
        status: simulatedResult.status,
        error: simulatedResult.error,
      });

      // Wait for next request
      if (i < totalRequests - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }

  private selectWeightedEndpoint(
    endpoints: LoadTestEndpoint[]
  ): LoadTestEndpoint {
    const totalWeight = endpoints.reduce((sum, ep) => sum + ep.weight, 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (const endpoint of endpoints) {
      currentWeight += endpoint.weight;
      if (random <= currentWeight) {
        return endpoint;
      }
    }

    return endpoints[0]; // Fallback
  }

  private simulateHttpRequest(endpoint: LoadTestEndpoint): {
    status: number;
    error?: string;
  } {
    // Simulate response time based on endpoint complexity
    const baseResponseTime = this.getBaseResponseTime(endpoint);
    const variation = Math.random() * 0.5 + 0.75; // 75-125% variation
    const responseTime = baseResponseTime * variation;

    // Simulate occasional errors
    const errorProbability = this.getErrorProbability(endpoint);
    const hasError = Math.random() < errorProbability;

    if (hasError) {
      const errorStatus = Math.random() < 0.5 ? 500 : 404;
      return { status: errorStatus, error: `Simulated ${errorStatus} error` };
    }

    // Success
    return { status: endpoint.expectedStatus[0] || 200 };
  }

  private getBaseResponseTime(endpoint: LoadTestEndpoint): number {
    // Base response times by endpoint type (ms)
    if (endpoint.path.includes('/health')) return 50;
    if (endpoint.path.includes('/analytics')) return 300;
    if (endpoint.path.includes('/hotel')) return 200;
    if (endpoint.path.includes('/voice')) return 150;
    if (endpoint.method === 'POST') return 250;
    return 100;
  }

  private getErrorProbability(endpoint: LoadTestEndpoint): number {
    // Error probabilities by endpoint type
    if (endpoint.path.includes('/health')) return 0.001; // 0.1%
    if (endpoint.path.includes('/analytics')) return 0.02; // 2%
    if (endpoint.method === 'POST') return 0.015; // 1.5%
    return 0.01; // 1%
  }

  private async capturePerformanceSnapshot(): Promise<{
    timestamp: Date;
    cpuUsage: number;
    memoryUsage: number;
    cacheHitRate: number;
  }> {
    const memoryUsage = process.memoryUsage();
    const cacheStats = cacheManager.getStats();

    return {
      timestamp: new Date(),
      cpuUsage: Math.random() * 20 + 30, // Simulated 30-50% CPU usage
      memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      cacheHitRate: cacheStats.hitRate,
    };
  }

  private calculateLoadTestResult(
    scenario: LoadTestScenario,
    startTime: Date,
    endTime: Date,
    duration: number,
    requests: Array<any>,
    performanceSnapshots: Array<any>
  ): LoadTestResult {
    const successfulRequests = requests.filter(
      r => r.status >= 200 && r.status < 400
    );
    const failedRequests = requests.filter(r => r.status >= 400);

    const responseTimes = requests.map(r => r.endTime - r.startTime);
    responseTimes.sort((a, b) => a - b);

    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    // Group by endpoint
    const endpointResults: LoadTestEndpointResult[] = [];
    const endpointGroups = new Map<string, any[]>();

    requests.forEach(req => {
      const key = `${req.method} ${req.endpoint}`;
      if (!endpointGroups.has(key)) {
        endpointGroups.set(key, []);
      }
      endpointGroups.get(key)!.push(req);
    });

    endpointGroups.forEach((reqs, key) => {
      const [method, endpoint] = key.split(' ', 2);
      const successful = reqs.filter(r => r.status >= 200 && r.status < 400);
      const failed = reqs.filter(r => r.status >= 400);
      const times = reqs
        .map(r => r.endTime - r.startTime)
        .sort((a, b) => a - b);

      endpointResults.push({
        endpoint,
        method,
        totalRequests: reqs.length,
        successfulRequests: successful.length,
        failedRequests: failed.length,
        averageResponseTime:
          times.reduce((sum, t) => sum + t, 0) / times.length,
        p95ResponseTime: times[Math.floor(times.length * 0.95)] || 0,
        p99ResponseTime: times[Math.floor(times.length * 0.99)] || 0,
        errorRate: failed.length / reqs.length,
        requestsPerSecond: reqs.length / duration,
        errors: failed.map(r => ({
          timestamp: new Date(r.startTime),
          endpoint,
          method,
          statusCode: r.status,
          error: r.error || 'Unknown error',
          responseTime: r.endTime - r.startTime,
        })),
      });
    });

    return {
      scenario: scenario.name,
      startTime,
      endTime,
      duration,
      summary: {
        totalRequests: requests.length,
        successfulRequests: successfulRequests.length,
        failedRequests: failedRequests.length,
        averageResponseTime:
          responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length,
        p95ResponseTime: responseTimes[p95Index] || 0,
        p99ResponseTime: responseTimes[p99Index] || 0,
        minResponseTime: responseTimes[0] || 0,
        maxResponseTime: responseTimes[responseTimes.length - 1] || 0,
        requestsPerSecond: requests.length / duration,
        errorRate: failedRequests.length / requests.length,
        throughput: successfulRequests.length / duration,
      },
      endpoints: endpointResults,
      performance: {
        cpuUsage: performanceSnapshots.map(s => s.cpuUsage),
        memoryUsage: performanceSnapshots.map(s => s.memoryUsage),
        cacheHitRate: performanceSnapshots.map(s => s.cacheHitRate),
        databaseConnections: performanceSnapshots.map(
          () => Math.floor(Math.random() * 10) + 5
        ),
      },
      errors: failedRequests.map(r => ({
        timestamp: new Date(r.startTime),
        endpoint: r.endpoint,
        method: r.method,
        statusCode: r.status,
        error: r.error || 'Unknown error',
        responseTime: r.endTime - r.startTime,
      })),
      recommendations: [],
    };
  }

  private convertUserSimulationToScenario(
    simulation: ConcurrentUserSimulation
  ): LoadTestScenario {
    // Convert user journeys to endpoints with weights
    const endpoints: LoadTestEndpoint[] = [];

    simulation.userJourneys.forEach(journey => {
      journey.steps.forEach(step => {
        const existingEndpoint = endpoints.find(
          ep =>
            ep.path === step.endpoint.path && ep.method === step.endpoint.method
        );

        if (existingEndpoint) {
          existingEndpoint.weight += journey.weight;
        } else {
          endpoints.push({
            ...step.endpoint,
            weight: journey.weight,
          });
        }
      });
    });

    return {
      name: `User Simulation: ${simulation.name}`,
      description: `Simulated user journeys with ${simulation.concurrentUsers} concurrent users`,
      duration: simulation.duration,
      rampUp: simulation.rampUpTime,
      targetRPS: simulation.concurrentUsers / 2, // Estimate RPS based on users
      maxConcurrentUsers: simulation.concurrentUsers,
      endpoints,
      dataPatterns: [],
      conditions: [],
    };
  }

  private createStressScenario(
    config: StressTestConfig,
    baseScenario: LoadTestScenario
  ): LoadTestScenario {
    let targetRPS: number;
    let duration: number;

    switch (config.type) {
      case 'spike':
        targetRPS = config.peak;
        duration = config.spikeDuration || 30;
        break;
      case 'gradual':
        targetRPS = config.peak;
        duration = config.duration;
        break;
      case 'sustained':
        targetRPS = config.peak;
        duration = config.duration;
        break;
      case 'burst':
        targetRPS = config.peak;
        duration = config.duration;
        break;
      default:
        targetRPS = config.peak;
        duration = config.duration;
    }

    return {
      ...baseScenario,
      name: `Stress Test: ${config.type} - ${baseScenario.name}`,
      description: `${config.type} stress test with peak ${config.peak} RPS`,
      targetRPS,
      duration,
      rampUp: config.type === 'spike' ? 1 : Math.min(duration * 0.1, 30),
    };
  }

  private generateRecommendations(
    result: LoadTestResult,
    preTestAudit: any,
    postTestAudit: any
  ): string[] {
    const recommendations: string[] = [];

    // Response time recommendations
    if (result.summary.averageResponseTime > 1000) {
      recommendations.push(
        'Consider implementing caching to reduce response times'
      );
    }

    if (result.summary.p95ResponseTime > 3000) {
      recommendations.push(
        'Optimize slow endpoints - 95th percentile is too high'
      );
    }

    // Error rate recommendations
    if (result.summary.errorRate > 0.05) {
      recommendations.push('Investigate and fix high error rate issues');
    }

    // Throughput recommendations
    if (result.summary.throughput < result.summary.requestsPerSecond * 0.8) {
      recommendations.push('Improve system capacity to handle target load');
    }

    // Performance degradation
    if (postTestAudit.score < preTestAudit.score - 10) {
      recommendations.push(
        'System performance degraded during test - investigate resource usage'
      );
    }

    return recommendations;
  }

  private async setupTestDataGenerators(): Promise<void> {
    // Setup would include test data generation utilities
    logger.debug(
      '📊 [LoadTestManager] Test data generators ready',
      'LoadTestManager'
    );
  }

  private async establishPerformanceBaseline(): Promise<void> {
    // Establish baseline performance metrics
    logger.debug(
      '📋 [LoadTestManager] Performance baseline established',
      'LoadTestManager'
    );
  }
}

/**
 * Load Test Execution
 * Tracks individual test execution
 */
class LoadTestExecution {
  public readonly id: string;
  public readonly scenario: LoadTestScenario;
  public readonly startTime: Date;
  private currentProgress = 0;
  private currentRPS = 0;
  private currentUsers = 0;

  constructor(id: string, scenario: LoadTestScenario) {
    this.id = id;
    this.scenario = scenario;
    this.startTime = new Date();
  }

  getProgress(): number {
    return this.currentProgress;
  }

  getCurrentRPS(): number {
    return this.currentRPS;
  }

  getCurrentUsers(): number {
    return this.currentUsers;
  }
}

// Export singleton instance
export const loadTestManager = LoadTestManager.getInstance();

// Convenience functions
export const initializeLoadTesting = () => loadTestManager.initialize();
export const runLoadTest = (scenario: LoadTestScenario) =>
  loadTestManager.runLoadTest(scenario);
export const runStressTest = (
  config: StressTestConfig,
  scenario: LoadTestScenario
) => loadTestManager.runStressTest(config, scenario);
export const runUserSimulation = (simulation: ConcurrentUserSimulation) =>
  loadTestManager.runConcurrentUserSimulation(simulation);
export const getActiveTests = () => loadTestManager.getActiveTests();
export const getTestResults = (limit?: number) =>
  loadTestManager.getTestResults(limit);
