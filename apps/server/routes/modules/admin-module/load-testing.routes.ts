// ============================================================================
// ADMIN MODULE: LOAD TESTING ROUTES v1.0 - Performance Testing & Benchmarking
// ============================================================================
// API endpoints for load testing, stress testing, user simulation, and performance analysis
// Comprehensive load testing management with real-time monitoring

import express, { Request, Response } from 'express';

// ✅ Import Load Testing System
import {
  getActiveTests,
  getTestResults,
  loadTestManager,
  runLoadTest,
  runStressTest,
  runUserSimulation,
  type ConcurrentUserSimulation,
  type LoadTestScenario,
  type StressTestConfig,
} from '@server/shared/LoadTestManager';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// LOAD TEST EXECUTION
// ============================================

/**
 * POST /api/admin/load-testing/run - Run load test scenario
 */
router.post('/run', async (req: Request, res: Response) => {
  try {
    const scenario: LoadTestScenario = req.body;

    logger.api(
      `🚀 [LoadTesting] Load test requested: ${scenario.name}`,
      'LoadTestingAPI'
    );

    // Validate scenario
    if (!scenario.name || !scenario.duration || !scenario.targetRPS) {
      return (res as any).status(400).json({
        success: false,
        error: 'Invalid scenario: name, duration, and targetRPS are required',
        version: '1.0.0',
      });
    }

    const startTime = Date.now();
    const result = await runLoadTest(scenario);
    const executionTime = Date.now() - startTime;

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: result,
      _metadata: {
        endpoint: 'load-test-run',
        executionTime,
        scenario: scenario.name,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [LoadTesting] Load test execution failed',
      'LoadTestingAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to execute load test',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * POST /api/admin/load-testing/stress - Run stress test
 */
router.post('/stress', async (req: Request, res: Response) => {
  try {
    const {
      config,
      baseScenario,
    }: { config: StressTestConfig; baseScenario: LoadTestScenario } = req.body;

    logger.api(
      `💥 [LoadTesting] Stress test requested: ${config.type}`,
      'LoadTestingAPI'
    );

    // Validate inputs
    if (!config.type || !config.baseline || !config.peak || !baseScenario) {
      return (res as any).status(400).json({
        success: false,
        error: 'Invalid stress test configuration',
        version: '1.0.0',
      });
    }

    const startTime = Date.now();
    const result = await runStressTest(config, baseScenario);
    const executionTime = Date.now() - startTime;

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: result,
      _metadata: {
        endpoint: 'stress-test-run',
        executionTime,
        stressType: config.type,
        peakRPS: config.peak,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [LoadTesting] Stress test execution failed',
      'LoadTestingAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to execute stress test',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * POST /api/admin/load-testing/simulation - Run user simulation
 */
router.post('/simulation', async (req: Request, res: Response) => {
  try {
    const simulation: ConcurrentUserSimulation = req.body;

    logger.api(
      `👥 [LoadTesting] User simulation requested: ${simulation.name}`,
      'LoadTestingAPI'
    );

    // Validate simulation
    if (
      !simulation.name ||
      !simulation.userJourneys ||
      !simulation.concurrentUsers
    ) {
      return (res as any).status(400).json({
        success: false,
        error:
          'Invalid simulation: name, userJourneys, and concurrentUsers are required',
        version: '1.0.0',
      });
    }

    const startTime = Date.now();
    const result = await runUserSimulation(simulation);
    const executionTime = Date.now() - startTime;

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: result,
      _metadata: {
        endpoint: 'user-simulation-run',
        executionTime,
        simulation: simulation.name,
        concurrentUsers: simulation.concurrentUsers,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [LoadTesting] User simulation failed',
      'LoadTestingAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to execute user simulation',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// PREDEFINED TEST SCENARIOS
// ============================================

/**
 * GET /api/admin/load-testing/scenarios - Get predefined test scenarios
 */
router.get('/scenarios', async (req: Request, res: Response) => {
  try {
    logger.api(
      '📋 [LoadTesting] Predefined scenarios requested',
      'LoadTestingAPI'
    );

    const scenarios = getPredefinedScenarios();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        scenarios,
        categories: {
          basic: scenarios.filter(s => s.name.includes('Basic')),
          hotel: scenarios.filter(s => s.name.includes('Hotel')),
          voice: scenarios.filter(s => s.name.includes('Voice')),
          analytics: scenarios.filter(s => s.name.includes('Analytics')),
          stress: scenarios.filter(s => s.name.includes('Stress')),
        },
      },
      _metadata: {
        endpoint: 'predefined-scenarios',
        totalScenarios: scenarios.length,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [LoadTesting] Scenarios request failed',
      'LoadTestingAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get predefined scenarios',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * POST /api/admin/load-testing/scenarios/:scenarioName/run - Run predefined scenario
 */
router.post(
  '/scenarios/:scenarioName/run',
  async (req: Request, res: Response) => {
    try {
      const { scenarioName } = req.params;
      const { customization } = req.body;

      logger.api(
        `🎯 [LoadTesting] Predefined scenario run: ${scenarioName}`,
        'LoadTestingAPI'
      );

      const scenarios = getPredefinedScenarios();
      let scenario = scenarios.find(
        s => s.name.toLowerCase().replace(/\s+/g, '-') === scenarioName
      );

      if (!scenario) {
        return (res as any).status(404).json({
          success: false,
          error: 'Scenario not found',
          availableScenarios: scenarios.map(s =>
            s.name.toLowerCase().replace(/\s+/g, '-')
          ),
          version: '1.0.0',
        });
      }

      // Apply customizations if provided
      if (customization) {
        scenario = { ...scenario, ...customization };
      }

      const startTime = Date.now();
      const result = await runLoadTest(scenario);
      const executionTime = Date.now() - startTime;

      (res as any).status(200).json({
        success: true,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: result,
        _metadata: {
          endpoint: 'predefined-scenario-run',
          executionTime,
          scenarioName,
          customized: !!customization,
          version: '1.0.0',
        },
      });
    } catch (error) {
      logger.error(
        '❌ [LoadTesting] Predefined scenario execution failed',
        'LoadTestingAPI',
        error
      );
      (res as any).status(500).json({
        success: false,
        error: 'Failed to execute predefined scenario',
        details: (error as Error).message,
        version: '1.0.0',
      });
    }
  }
);

// ============================================
// TEST MONITORING & RESULTS
// ============================================

/**
 * GET /api/admin/load-testing/active - Get active tests
 */
router.get('/active', async (req: Request, res: Response) => {
  try {
    logger.api('🔄 [LoadTesting] Active tests requested', 'LoadTestingAPI');

    const activeTests = getActiveTests();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        activeTests,
        count: activeTests.length,
        totalProgress:
          activeTests.length > 0
            ? activeTests.reduce((sum, test) => sum + test.progress, 0) /
              activeTests.length
            : 0,
      },
      _metadata: {
        endpoint: 'active-tests',
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [LoadTesting] Active tests request failed',
      'LoadTestingAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get active tests',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/load-testing/results - Get test results
 */
router.get('/results', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const scenario = req.query.scenario as string;

    logger.api(
      `📊 [LoadTesting] Test results requested (limit: ${limit})`,
      'LoadTestingAPI'
    );

    let results = getTestResults(limit);

    // Filter by scenario if specified
    if (scenario) {
      results = results.filter(r =>
        r.scenario.toLowerCase().includes(scenario.toLowerCase())
      );
    }

    // Calculate summary statistics
    const summary = {
      totalTests: results.length,
      averageResponseTime:
        results.length > 0
          ? results.reduce((sum, r) => sum + r.summary.averageResponseTime, 0) /
            results.length
          : 0,
      averageErrorRate:
        results.length > 0
          ? results.reduce((sum, r) => sum + r.summary.errorRate, 0) /
            results.length
          : 0,
      averageThroughput:
        results.length > 0
          ? results.reduce((sum, r) => sum + r.summary.throughput, 0) /
            results.length
          : 0,
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        results,
        summary,
        filters: { scenario, limit },
      },
      _metadata: {
        endpoint: 'test-results',
        returned: results.length,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [LoadTesting] Results request failed',
      'LoadTestingAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get test results',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/load-testing/results/:testId - Get specific test result
 */
router.get('/results/:testId', async (req: Request, res: Response) => {
  try {
    const { testId } = req.params;

    logger.api(
      `📋 [LoadTesting] Specific test result requested: ${testId}`,
      'LoadTestingAPI'
    );

    const results = getTestResults(100); // Get more results to find specific test
    const result = results.find(
      r => r.scenario === testId || r.scenario.includes(testId)
    );

    if (!result) {
      return (res as any).status(404).json({
        success: false,
        error: 'Test result not found',
        availableTests: results.map(r => r.scenario),
        version: '1.0.0',
      });
    }

    // Enhanced result with additional analysis
    const enhancedResult = {
      ...result,
      analysis: {
        performanceGrade: calculatePerformanceGrade(result),
        bottlenecks: identifyBottlenecks(result),
        recommendations: result.recommendations,
        comparison: {
          responseTimeVsBenchmark: 'N/A', // Would compare against benchmarks
          throughputVsBenchmark: 'N/A',
          errorRateVsBenchmark: 'N/A',
        },
      },
    };

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: enhancedResult,
      _metadata: {
        endpoint: 'specific-test-result',
        testId,
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [LoadTesting] Specific result request failed',
      'LoadTestingAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get test result',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// COMPARISON & ANALYTICS
// ============================================

/**
 * POST /api/admin/load-testing/compare - Compare test results
 */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { testId1, testId2 } = req.body;

    logger.api(`⚖️ [LoadTesting] Test comparison requested`, 'LoadTestingAPI', {
      testId1,
      testId2,
    });

    if (!testId1 || !testId2) {
      return (res as any).status(400).json({
        success: false,
        error: 'Both testId1 and testId2 are required for comparison',
        version: '1.0.0',
      });
    }

    const comparison = loadTestManager.getPerformanceComparison(
      testId1,
      testId2
    );

    if (!comparison) {
      return (res as any).status(404).json({
        success: false,
        error: 'One or both test results not found',
        version: '1.0.0',
      });
    }

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: comparison,
      _metadata: {
        endpoint: 'test-comparison',
        comparedTests: [testId1, testId2],
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [LoadTesting] Comparison request failed',
      'LoadTestingAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to compare test results',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

/**
 * GET /api/admin/load-testing/benchmarks - Get performance benchmarks
 */
router.get('/benchmarks', async (req: Request, res: Response) => {
  try {
    logger.api('📏 [LoadTesting] Benchmarks requested', 'LoadTestingAPI');

    const benchmarks = getPerformanceBenchmarks();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: benchmarks,
      _metadata: {
        endpoint: 'performance-benchmarks',
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [LoadTesting] Benchmarks request failed',
      'LoadTestingAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get performance benchmarks',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// ============================================
// DIAGNOSTICS
// ============================================

/**
 * GET /api/admin/load-testing/diagnostics - Get load testing diagnostics
 */
router.get('/diagnostics', async (req: Request, res: Response) => {
  try {
    logger.api('🔧 [LoadTesting] Diagnostics requested', 'LoadTestingAPI');

    const diagnostics = loadTestManager.getDiagnostics();

    (res as any).status(200).json({
      success: true,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: diagnostics,
      _metadata: {
        endpoint: 'load-testing-diagnostics',
        version: '1.0.0',
      },
    });
  } catch (error) {
    logger.error(
      '❌ [LoadTesting] Diagnostics request failed',
      'LoadTestingAPI',
      error
    );
    (res as any).status(500).json({
      success: false,
      error: 'Failed to get load testing diagnostics',
      details: (error as Error).message,
      version: '1.0.0',
    });
  }
});

// Helper functions

function getPredefinedScenarios(): LoadTestScenario[] {
  return [
    {
      name: 'Basic Health Check Load Test',
      description: 'Basic load test targeting health endpoints',
      duration: 60,
      rampUp: 10,
      targetRPS: 10,
      maxConcurrentUsers: 50,
      endpoints: [
        {
          method: 'GET',
          path: '/api/core/health',
          weight: 50,
          expectedStatus: [200],
          timeout: 5000,
        },
        {
          method: 'GET',
          path: '/api/admin/health',
          weight: 30,
          expectedStatus: [200],
          timeout: 5000,
        },
        {
          method: 'GET',
          path: '/api/hotel/health',
          weight: 20,
          expectedStatus: [200],
          timeout: 5000,
        },
      ],
      dataPatterns: [],
      conditions: [
        {
          type: 'response_time',
          threshold: 1000,
          action: 'alert',
        },
        {
          type: 'error_rate',
          threshold: 0.05,
          action: 'alert',
        },
      ],
    },
    {
      name: 'Hotel Operations Load Test',
      description: 'Comprehensive hotel operations load test',
      duration: 300,
      rampUp: 30,
      targetRPS: 25,
      maxConcurrentUsers: 100,
      endpoints: [
        {
          method: 'GET',
          path: '/api/hotel/requests',
          weight: 40,
          expectedStatus: [200],
          timeout: 10000,
        },
        {
          method: 'POST',
          path: '/api/hotel/requests',
          weight: 20,
          expectedStatus: [201],
          timeout: 15000,
          body: { type: 'room-service', description: 'Test request' },
        },
        {
          method: 'GET',
          path: '/api/hotel/analytics',
          weight: 25,
          expectedStatus: [200],
          timeout: 8000,
        },
        {
          method: 'GET',
          path: '/api/hotel/dashboard',
          weight: 15,
          expectedStatus: [200],
          timeout: 12000,
        },
      ],
      dataPatterns: [],
      conditions: [
        {
          type: 'response_time',
          threshold: 2000,
          action: 'alert',
        },
        {
          type: 'error_rate',
          threshold: 0.03,
          action: 'stop',
        },
      ],
    },
    {
      name: 'Voice Assistant Load Test',
      description: 'Load test for voice assistant endpoints',
      duration: 180,
      rampUp: 20,
      targetRPS: 15,
      maxConcurrentUsers: 75,
      endpoints: [
        {
          method: 'GET',
          path: '/api/voice/calls',
          weight: 60,
          expectedStatus: [200],
          timeout: 8000,
        },
        {
          method: 'POST',
          path: '/api/voice/calls',
          weight: 30,
          expectedStatus: [201],
          timeout: 12000,
        },
        {
          method: 'GET',
          path: '/api/voice/transcripts',
          weight: 10,
          expectedStatus: [200],
          timeout: 6000,
        },
      ],
      dataPatterns: [],
      conditions: [
        {
          type: 'response_time',
          threshold: 3000,
          action: 'throttle',
        },
      ],
    },
    {
      name: 'Analytics Dashboard Load Test',
      description: 'High-load test for analytics and reporting',
      duration: 240,
      rampUp: 40,
      targetRPS: 20,
      maxConcurrentUsers: 80,
      endpoints: [
        {
          method: 'GET',
          path: '/api/analytics/overview',
          weight: 50,
          expectedStatus: [200],
          timeout: 15000,
        },
        {
          method: 'GET',
          path: '/api/analytics/reports',
          weight: 30,
          expectedStatus: [200],
          timeout: 20000,
        },
        {
          method: 'GET',
          path: '/api/analytics/metrics',
          weight: 20,
          expectedStatus: [200],
          timeout: 10000,
        },
      ],
      dataPatterns: [],
      conditions: [
        {
          type: 'response_time',
          threshold: 5000,
          action: 'alert',
        },
      ],
    },
    {
      name: 'High Stress Peak Load Test',
      description: 'Extreme stress test to find breaking points',
      duration: 120,
      rampUp: 15,
      targetRPS: 100,
      maxConcurrentUsers: 500,
      endpoints: [
        {
          method: 'GET',
          path: '/api/core/health',
          weight: 100,
          expectedStatus: [200],
          timeout: 30000,
        },
      ],
      dataPatterns: [],
      conditions: [
        {
          type: 'error_rate',
          threshold: 0.1,
          action: 'stop',
        },
        {
          type: 'resource_usage',
          threshold: 90,
          action: 'alert',
        },
      ],
    },
  ];
}

function calculatePerformanceGrade(result: any): string {
  let score = 100;

  // Response time scoring
  if (result.summary.averageResponseTime > 2000) score -= 30;
  else if (result.summary.averageResponseTime > 1000) score -= 15;
  else if (result.summary.averageResponseTime > 500) score -= 5;

  // Error rate scoring
  if (result.summary.errorRate > 0.05) score -= 40;
  else if (result.summary.errorRate > 0.02) score -= 20;
  else if (result.summary.errorRate > 0.01) score -= 10;

  // Throughput scoring
  const targetThroughput = result.summary.requestsPerSecond;
  const actualThroughput = result.summary.throughput;
  const throughputRatio = actualThroughput / targetThroughput;

  if (throughputRatio < 0.5) score -= 30;
  else if (throughputRatio < 0.7) score -= 15;
  else if (throughputRatio < 0.9) score -= 5;

  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function identifyBottlenecks(result: any): string[] {
  const bottlenecks: string[] = [];

  if (result.summary.averageResponseTime > 2000) {
    bottlenecks.push(
      'High average response time indicates server processing bottleneck'
    );
  }

  if (result.summary.p95ResponseTime > result.summary.averageResponseTime * 3) {
    bottlenecks.push('High 95th percentile suggests inconsistent performance');
  }

  if (result.summary.errorRate > 0.05) {
    bottlenecks.push(
      'High error rate indicates capacity or reliability issues'
    );
  }

  // Analyze endpoint-specific bottlenecks
  result.endpoints.forEach((endpoint: any) => {
    if (endpoint.averageResponseTime > 5000) {
      bottlenecks.push(
        `Endpoint ${endpoint.endpoint} has very slow response times`
      );
    }
    if (endpoint.errorRate > 0.1) {
      bottlenecks.push(`Endpoint ${endpoint.endpoint} has high error rate`);
    }
  });

  return bottlenecks;
}

function getPerformanceBenchmarks() {
  return {
    responseTime: {
      excellent: '<200ms',
      good: '<500ms',
      acceptable: '<1000ms',
      poor: '<2000ms',
      unacceptable: '>2000ms',
    },
    errorRate: {
      excellent: '<0.1%',
      good: '<0.5%',
      acceptable: '<1%',
      poor: '<5%',
      unacceptable: '>5%',
    },
    throughput: {
      description: 'Requests successfully processed per second',
      factors: [
        'Server capacity',
        'Database performance',
        'Cache efficiency',
        'Network latency',
      ],
    },
    concurrentUsers: {
      light: '<50 users',
      moderate: '50-200 users',
      heavy: '200-500 users',
      extreme: '>500 users',
    },
    recommendations: {
      optimization: [
        'Implement caching for frequently accessed data',
        'Optimize database queries and add indexes',
        'Use CDN for static assets',
        'Implement connection pooling',
        'Add horizontal scaling',
      ],
      monitoring: [
        'Set up performance alerts',
        'Monitor resource usage trends',
        'Track user experience metrics',
        'Implement distributed tracing',
      ],
    },
  };
}

export default router;
