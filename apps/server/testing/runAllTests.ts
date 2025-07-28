import { logger } from '@shared/utils/logger';
import { Express } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { allGuestJourneyTestSuites } from './suites/guestJourneyTests';
import { performanceTestSuite } from './suites/performanceTests';
import {
  ApiTestRunner,
  PerformanceTestRunner,
  TestDataManager,
  TestReport,
  TestResult,
  VersionTestRunner,
} from './testFramework';

// ============================================
// TEST EXECUTION CONFIGURATION
// ============================================

export interface TestExecutionConfig {
  includeCategories: Array<
    'unit' | 'integration' | 'e2e' | 'performance' | 'security'
  >;
  includeVersions: string[];
  includeTags: string[];
  excludeTags: string[];
  parallel: boolean;
  maxConcurrency: number;
  timeout: number;
  retries: number;
  generateReport: boolean;
  outputDir: string;
}

export const defaultTestConfig: TestExecutionConfig = {
  includeCategories: ['integration', 'performance'],
  includeVersions: ['v2.0', 'v2.1', 'v2.2'],
  includeTags: [],
  excludeTags: ['slow', 'experimental'],
  parallel: true,
  maxConcurrency: 5,
  timeout: 30000,
  retries: 2,
  generateReport: true,
  outputDir: './test-results/comprehensive',
};

// ============================================
// COMPREHENSIVE TEST RUNNER
// ============================================

export class ComprehensiveTestRunner {
  private app: Express;
  private apiTestRunner: ApiTestRunner;
  private versionTestRunner: VersionTestRunner;
  private performanceTestRunner: PerformanceTestRunner;
  private testDataManager: TestDataManager;
  private allResults: TestResult[] = [];
  private config: TestExecutionConfig;

  constructor(app: Express, config: TestExecutionConfig = defaultTestConfig) {
    this.app = app;
    this.config = config;
    this.apiTestRunner = new ApiTestRunner(app);
    this.versionTestRunner = new VersionTestRunner(app);
    this.performanceTestRunner = new PerformanceTestRunner(app);
    this.testDataManager = TestDataManager.getInstance();
  }

  async runComprehensiveTests(): Promise<{
    summary: any;
    guestJourneyResults: TestResult[];
    performanceResults: any;
    versionCompatibilityResults: any;
    report: TestReport;
  }> {
    const startTime = Date.now();

    logger.info(
      '🚀 [COMPREHENSIVE-TEST] Starting comprehensive test suite execution...',
      'ComprehensiveTest'
    );

    try {
      // Step 1: Setup test environment
      await this.setupTestEnvironment();

      // Step 2: Run Guest Journey API Tests
      logger.info(
        '📋 [COMPREHENSIVE-TEST] Running Guest Journey API tests...',
        'ComprehensiveTest'
      );
      const guestJourneyResults = await this.runGuestJourneyTests();

      // Step 3: Run Version Compatibility Tests
      logger.info(
        '🔄 [COMPREHENSIVE-TEST] Running version compatibility tests...',
        'ComprehensiveTest'
      );
      const versionCompatibilityResults =
        await this.runVersionCompatibilityTests();

      // Step 4: Run Performance Tests
      logger.info(
        '⚡ [COMPREHENSIVE-TEST] Running performance tests...',
        'ComprehensiveTest'
      );
      const performanceResults = await this.runPerformanceTests();

      // Step 5: Generate comprehensive report
      logger.info(
        '📊 [COMPREHENSIVE-TEST] Generating comprehensive report...',
        'ComprehensiveTest'
      );
      const report = await this.generateComprehensiveReport();

      // Step 6: Cleanup
      await this.cleanupTestEnvironment();

      const totalDuration = Date.now() - startTime;
      const summary = {
        totalDuration,
        totalTests: this.allResults.length,
        passed: this.allResults.filter(r => r.status === 'passed').length,
        failed: this.allResults.filter(r => r.status === 'failed').length,
        skipped: this.allResults.filter(r => r.status === 'skipped').length,
        categories: this.getCategoryBreakdown(),
        versions: this.getVersionBreakdown(),
        overallScore: this.calculateOverallScore(),
      };

      logger.info(
        '✅ [COMPREHENSIVE-TEST] Comprehensive test suite completed!',
        'ComprehensiveTest',
        {
          duration: `${totalDuration}ms`,
          score: `${summary.overallScore}%`,
          passed: summary.passed,
          failed: summary.failed,
        }
      );

      return {
        summary,
        guestJourneyResults,
        performanceResults,
        versionCompatibilityResults,
        report,
      };
    } catch (error) {
      logger.error(
        '❌ [COMPREHENSIVE-TEST] Test suite execution failed:',
        'ComprehensiveTest',
        error
      );
      throw error;
    }
  }

  private async setupTestEnvironment(): Promise<void> {
    logger.debug(
      '⚙️ [COMPREHENSIVE-TEST] Setting up test environment...',
      'ComprehensiveTest'
    );

    try {
      // Create test data
      const testTenant = await this.testDataManager.createTestTenant();
      const testCall = await this.testDataManager.createTestCall(testTenant.id);
      await this.testDataManager.createTestTranscript(testCall.id);
      await this.testDataManager.createTestSummary(testCall.id);

      // Ensure output directory exists
      if (this.config.generateReport) {
        await fs.mkdir(this.config.outputDir, { recursive: true });
      }

      logger.debug(
        '✅ [COMPREHENSIVE-TEST] Test environment setup completed',
        'ComprehensiveTest'
      );
    } catch (error) {
      logger.error(
        '❌ [COMPREHENSIVE-TEST] Failed to setup test environment:',
        'ComprehensiveTest',
        error
      );
      throw error;
    }
  }

  private async runGuestJourneyTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Filter test suites based on configuration
    const filteredSuites = allGuestJourneyTestSuites.filter(suite => {
      return (
        this.config.includeCategories.includes(suite.category) &&
        this.config.includeVersions.includes(suite.version) &&
        this.shouldIncludeSuite(suite.tags)
      );
    });

    logger.debug(
      `🔍 [COMPREHENSIVE-TEST] Running ${filteredSuites.length} Guest Journey test suites`,
      'ComprehensiveTest'
    );

    for (const testSuite of filteredSuites) {
      try {
        const suiteResults = await this.apiTestRunner.runTestSuite(testSuite);
        results.push(...suiteResults);
        this.allResults.push(...suiteResults);

        const passed = suiteResults.filter(r => r.status === 'passed').length;
        const total = suiteResults.length;

        logger.debug(
          `${passed === total ? '✅' : '⚠️'} [COMPREHENSIVE-TEST] ${testSuite.name}: ${passed}/${total} passed`,
          'ComprehensiveTest'
        );
      } catch (error) {
        logger.error(
          `❌ [COMPREHENSIVE-TEST] Failed to run suite ${testSuite.name}:`,
          'ComprehensiveTest',
          error
        );
      }
    }

    return results;
  }

  private async runVersionCompatibilityTests(): Promise<any> {
    const results: any = {
      compatibility: {},
      migrations: {},
      deprecationStatus: {},
    };

    try {
      // Test version compatibility for key endpoints
      const keyEndpoints = [
        '/api/{version}/calls',
        '/api/{version}/transcripts',
        '/api/{version}/summaries',
      ];

      for (const endpoint of keyEndpoints) {
        results.compatibility[endpoint] =
          await this.versionTestRunner.testVersionCompatibility(
            endpoint,
            this.config.includeVersions
          );
      }

      // Test migration paths
      const migrationPaths = [
        { from: 'v1.1', to: 'v2.0' },
        { from: 'v2.0', to: 'v2.1' },
        { from: 'v2.1', to: 'v2.2' },
      ];

      for (const migration of migrationPaths) {
        try {
          const migrationResults =
            await this.versionTestRunner.testVersionMigration(
              migration.from,
              migration.to
            );
          results.migrations[`${migration.from}-${migration.to}`] =
            migrationResults;
          this.allResults.push(...migrationResults);
        } catch (error) {
          logger.error(
            `❌ [COMPREHENSIVE-TEST] Migration test failed ${migration.from} → ${migration.to}:`,
            'ComprehensiveTest',
            error
          );
        }
      }
    } catch (error) {
      logger.error(
        '❌ [COMPREHENSIVE-TEST] Version compatibility tests failed:',
        'ComprehensiveTest',
        error
      );
    }

    return results;
  }

  private async runPerformanceTests(): Promise<any> {
    const results: any = {
      benchmarks: {},
      loadTests: {},
      recommendations: [],
    };

    try {
      // Run performance test suite
      const performanceResults =
        await this.apiTestRunner.runTestSuite(performanceTestSuite);
      this.allResults.push(...performanceResults);

      // Run load tests for key endpoints
      const loadTestEndpoints = [
        { endpoint: '/api/calls', requests: 100, concurrency: 10 },
        { endpoint: '/api/transcripts', requests: 200, concurrency: 20 },
        { endpoint: '/api/v2/calls', requests: 50, concurrency: 5 },
      ];

      for (const loadTest of loadTestEndpoints) {
        try {
          const loadResult = await this.performanceTestRunner.loadTest(
            loadTest.endpoint,
            {
              requests: loadTest.requests,
              concurrency: loadTest.concurrency,
              timeout: 5000,
              headers: { 'API-Version': 'v2.2' },
            }
          );

          results.loadTests[loadTest.endpoint] = loadResult;

          // Generate recommendations based on results
          if (loadResult.averageResponseTime > 500) {
            results.recommendations.push({
              endpoint: loadTest.endpoint,
              issue: 'High response time',
              recommendation:
                'Consider adding caching or optimizing database queries',
            });
          }

          if (loadResult.requestsPerSecond < 50) {
            results.recommendations.push({
              endpoint: loadTest.endpoint,
              issue: 'Low throughput',
              recommendation:
                'Consider implementing connection pooling or horizontal scaling',
            });
          }
        } catch (error) {
          logger.error(
            `❌ [COMPREHENSIVE-TEST] Load test failed for ${loadTest.endpoint}:`,
            'ComprehensiveTest',
            error
          );
        }
      }
    } catch (error) {
      logger.error(
        '❌ [COMPREHENSIVE-TEST] Performance tests failed:',
        'ComprehensiveTest',
        error
      );
    }

    return results;
  }

  private async generateComprehensiveReport(): Promise<TestReport> {
    const report = this.apiTestRunner.generateReport();

    if (this.config.generateReport) {
      try {
        // Generate detailed JSON report
        const jsonReport = {
          ...report,
          executionConfig: this.config,
          timestamp: new Date().toISOString(),
          environment: {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime(),
          },
        };

        const jsonPath = path.join(
          this.config.outputDir,
          `comprehensive-test-report-${Date.now()}.json`
        );
        await fs.writeFile(jsonPath, JSON.stringify(jsonReport, null, 2));

        // Generate HTML report
        const htmlReport = this.generateHtmlReport(jsonReport);
        const htmlPath = path.join(
          this.config.outputDir,
          `comprehensive-test-report-${Date.now()}.html`
        );
        await fs.writeFile(htmlPath, htmlReport);

        // Generate summary markdown
        const markdownSummary = this.generateMarkdownSummary(jsonReport);
        const mdPath = path.join(
          this.config.outputDir,
          `test-summary-${Date.now()}.md`
        );
        await fs.writeFile(mdPath, markdownSummary);

        logger.info(
          '📁 [COMPREHENSIVE-TEST] Reports generated:',
          'ComprehensiveTest',
          {
            json: jsonPath,
            html: htmlPath,
            markdown: mdPath,
          }
        );
      } catch (error) {
        logger.error(
          '❌ [COMPREHENSIVE-TEST] Failed to generate reports:',
          'ComprehensiveTest',
          error
        );
      }
    }

    return report;
  }

  private generateHtmlReport(report: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Comprehensive Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .warning { color: #ffc107; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #e9ecef; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🧪 Comprehensive Test Report</h1>
    
    <div class="summary">
        <h2>📊 Test Summary</h2>
        <div class="metric">
            <strong>Total Tests:</strong> ${report.summary.total}
        </div>
        <div class="metric">
            <strong class="passed">Passed:</strong> ${report.summary.passed}
        </div>
        <div class="metric">
            <strong class="failed">Failed:</strong> ${report.summary.failed}
        </div>
        <div class="metric">
            <strong>Coverage:</strong> ${report.summary.coverage.toFixed(1)}%
        </div>
        <div class="metric">
            <strong>Duration:</strong> ${(report.summary.duration / 1000).toFixed(2)}s
        </div>
    </div>

    <h2>⚡ Performance Metrics</h2>
    <div class="metric">
        <strong>Average Response Time:</strong> ${report.performance.averageResponseTime.toFixed(2)}ms
    </div>
    <div class="metric">
        <strong>Slowest Endpoint:</strong> ${report.performance.slowestEndpoint}
    </div>
    <div class="metric">
        <strong>Fastest Endpoint:</strong> ${report.performance.fastestEndpoint}
    </div>

    <h2>🔄 Version Compatibility</h2>
    <table>
        <tr>
            <th>Version</th>
            <th>Compatible</th>
            <th>Tests</th>
        </tr>
        ${Object.entries(report.versions.compatibility)
          .map(
            ([version, compatible]) => `
        <tr>
            <td>${version}</td>
            <td class="${compatible ? 'passed' : 'failed'}">${compatible ? '✅' : '❌'}</td>
            <td>${report.results.filter((r: any) => r.version === version).length}</td>
        </tr>
        `
          )
          .join('')}
    </table>

    <h2>📋 Detailed Results</h2>
    <table>
        <tr>
            <th>Test Suite</th>
            <th>Test Case</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Version</th>
        </tr>
        ${report.results
          .map(
            (result: any) => `
        <tr>
            <td>${result.testSuite}</td>
            <td>${result.testCase}</td>
            <td class="${result.status}">${result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️'}</td>
            <td>${result.duration}ms</td>
            <td>${result.version || 'N/A'}</td>
        </tr>
        `
          )
          .join('')}
    </table>

    <footer>
        <p><em>Generated on ${new Date().toLocaleString()}</em></p>
    </footer>
</body>
</html>`;
  }

  private generateMarkdownSummary(report: any): string {
    return `# 🧪 Comprehensive Test Report

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | ${report.summary.total} |
| **Passed** | ${report.summary.passed} ✅ |
| **Failed** | ${report.summary.failed} ❌ |
| **Coverage** | ${report.summary.coverage.toFixed(1)}% |
| **Duration** | ${(report.summary.duration / 1000).toFixed(2)}s |

## ⚡ Performance Results

- **Average Response Time**: ${report.performance.averageResponseTime.toFixed(2)}ms
- **Slowest Endpoint**: ${report.performance.slowestEndpoint}
- **Fastest Endpoint**: ${report.performance.fastestEndpoint}
- **Timeouts**: ${report.performance.timeouts}

## 🔄 Version Compatibility

${Object.entries(report.versions.compatibility)
  .map(
    ([version, compatible]) =>
      `- **${version}**: ${compatible ? '✅ Compatible' : '❌ Issues detected'}`
  )
  .join('\n')}

## 📋 Category Breakdown

${Object.entries(report.categories)
  .map(
    ([category, stats]: [string, any]) =>
      `- **${category}**: ${stats.passed}/${stats.total} passed (${((stats.passed / stats.total) * 100).toFixed(1)}%)`
  )
  .join('\n')}

## 🎯 Recommendations

${
  report.recommendations?.length > 0
    ? report.recommendations
        .map((rec: any) => `- **${rec.endpoint}**: ${rec.recommendation}`)
        .join('\n')
    : 'All tests performing within acceptable parameters.'
}

---
*Generated on ${new Date().toLocaleString()}*`;
  }

  private shouldIncludeSuite(tags: string[]): boolean {
    // Check include tags
    if (this.config.includeTags.length > 0) {
      const hasIncludeTag = this.config.includeTags.some(tag =>
        tags.includes(tag)
      );
      if (!hasIncludeTag) return false;
    }

    // Check exclude tags
    if (this.config.excludeTags.length > 0) {
      const hasExcludeTag = this.config.excludeTags.some(tag =>
        tags.includes(tag)
      );
      if (hasExcludeTag) return false;
    }

    return true;
  }

  private getCategoryBreakdown(): Record<string, any> {
    const categories: Record<
      string,
      { passed: number; failed: number; total: number }
    > = {};

    this.allResults.forEach(result => {
      const category = result.metadata.category || 'uncategorized';
      if (!categories[category]) {
        categories[category] = { passed: 0, failed: 0, total: 0 };
      }

      categories[category].total++;
      if (result.status === 'passed') categories[category].passed++;
      if (result.status === 'failed') categories[category].failed++;
    });

    return categories;
  }

  private getVersionBreakdown(): Record<string, any> {
    const versions: Record<
      string,
      { passed: number; failed: number; total: number }
    > = {};

    this.allResults.forEach(result => {
      const version = result.version || 'unknown';
      if (!versions[version]) {
        versions[version] = { passed: 0, failed: 0, total: 0 };
      }

      versions[version].total++;
      if (result.status === 'passed') versions[version].passed++;
      if (result.status === 'failed') versions[version].failed++;
    });

    return versions;
  }

  private calculateOverallScore(): number {
    if (this.allResults.length === 0) return 0;

    const passed = this.allResults.filter(r => r.status === 'passed').length;
    const total = this.allResults.length;

    return Math.round((passed / total) * 100);
  }

  private async cleanupTestEnvironment(): Promise<void> {
    try {
      await this.testDataManager.cleanup();
      logger.debug(
        '🧹 [COMPREHENSIVE-TEST] Test environment cleaned up',
        'ComprehensiveTest'
      );
    } catch (error) {
      logger.error(
        '❌ [COMPREHENSIVE-TEST] Failed to cleanup test environment:',
        'ComprehensiveTest',
        error
      );
    }
  }
}

// ============================================
// QUICK TEST RUNNER FOR DEVELOPMENT
// ============================================

export class QuickTestRunner {
  private app: Express;
  private apiTestRunner: ApiTestRunner;

  constructor(app: Express) {
    this.app = app;
    this.apiTestRunner = new ApiTestRunner(app);
  }

  async runQuickSmokeTest(): Promise<{
    passed: boolean;
    results: TestResult[];
  }> {
    logger.info('🔥 [QUICK-TEST] Running smoke test...', 'QuickTest');

    const smokeTestSuite = {
      name: 'Quick Smoke Test',
      description: 'Basic functionality verification',
      category: 'integration' as const,
      version: 'v2.2',
      tags: ['smoke', 'quick'],
      tests: [
        {
          name: 'API Health Check',
          description: 'Verify API is responding',
          method: 'GET' as const,
          endpoint: '/api/health/versioned',
          headers: { 'API-Version': 'v2.2' },
          expectedStatus: 200,
          customValidation: (response: any) =>
            response.success && response.data.status === 'healthy',
          tags: ['health'],
        },
        {
          name: 'Version Detection',
          description: 'Verify version detection works',
          method: 'GET' as const,
          endpoint: '/api/version/current',
          headers: { 'API-Version': 'v2.2' },
          expectedStatus: 200,
          customValidation: (response: any) =>
            response.success && response.data.version,
          tags: ['version'],
        },
        {
          name: 'Basic Call List',
          description: 'Verify call listing works',
          method: 'GET' as const,
          endpoint: '/api/calls',
          headers: { 'API-Version': 'v2.2' },
          query: { page: 1, limit: 5 },
          expectedStatus: 200,
          customValidation: (response: any) =>
            response.success && Array.isArray(response.data),
          tags: ['calls'],
        },
      ],
    };

    const results = await this.apiTestRunner.runTestSuite(smokeTestSuite);
    const passed = results.every(r => r.status === 'passed');

    logger.info(
      `${passed ? '✅' : '❌'} [QUICK-TEST] Smoke test ${passed ? 'PASSED' : 'FAILED'}`,
      'QuickTest',
      {
        results: results.length,
        passed: results.filter(r => r.status === 'passed').length,
      }
    );

    return { passed, results };
  }
}

// ============================================
// EXPORTS
// ============================================

export default {
  ComprehensiveTestRunner,
  QuickTestRunner,
  defaultTestConfig,
};
