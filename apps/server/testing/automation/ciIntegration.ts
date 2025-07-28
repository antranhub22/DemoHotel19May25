import { logger } from '@shared/utils/logger';
import { Express } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { ComprehensiveTestRunner, QuickTestRunner } from '../runAllTests';
import { TestReport, TestResult } from '../testFramework';
import { QualityGateEvaluator } from './qualityGate';

// ============================================
// CI INTEGRATION INTERFACES
// ============================================

export interface CITestConfig {
  environment: 'development' | 'staging' | 'production';
  testScope: 'smoke' | 'integration' | 'performance' | 'full';
  parallel: boolean;
  maxRetries: number;
  timeout: number;
  outputFormats: Array<'json' | 'junit' | 'html' | 'markdown'>;
  qualityGateEnabled: boolean;
  blockOnFailure: boolean;
  notifications: {
    slack?: { webhook: string; channel: string };
    email?: { recipients: string[]; smtp: any };
    github?: { token: string; repository: string };
  };
}

export interface CITestResult {
  success: boolean;
  testResults: TestReport;
  qualityGateResult?: any;
  artifacts: {
    reports: string[];
    logs: string[];
    screenshots?: string[];
  };
  metrics: {
    duration: number;
    testCount: number;
    passRate: number;
    performanceScore: number;
  };
  deployment: {
    allowed: boolean;
    environment: string;
    blockers: string[];
  };
}

export interface GitHubStatus {
  state: 'pending' | 'success' | 'failure' | 'error';
  description: string;
  context: string;
  target_url?: string;
}

// ============================================
// CI TEST EXECUTOR
// ============================================

export class CITestExecutor {
  private app: Express;
  private config: CITestConfig;
  private outputDir: string;

  constructor(app: Express, config: CITestConfig) {
    this.app = app;
    this.config = config;
    this.outputDir = path.join(
      process.cwd(),
      'test-results',
      'ci',
      Date.now().toString()
    );
  }

  async executeTests(): Promise<CITestResult> {
    const startTime = Date.now();

    logger.info(
      `🚀 [CI-EXECUTOR] Starting CI test execution - Scope: ${this.config.testScope}`,
      'CIExecutor'
    );

    try {
      // Create output directory
      await fs.mkdir(this.outputDir, { recursive: true });

      // Execute tests based on scope
      const testResults = await this.runTestsByScope();

      // Evaluate quality gate if enabled
      let qualityGateResult;
      if (this.config.qualityGateEnabled) {
        const evaluator = new QualityGateEvaluator(this.config.environment);
        qualityGateResult = await evaluator.evaluateQualityGate(testResults);
        await evaluator.saveQualityGateReport(
          qualityGateResult,
          this.outputDir
        );
      }

      // Generate reports in requested formats
      const reportPaths = await this.generateReports(
        testResults,
        qualityGateResult
      );

      // Calculate metrics
      const metrics = this.calculateMetrics(
        testResults,
        Date.now() - startTime
      );

      // Determine deployment status
      const deployment = this.determineDeploymentStatus(
        testResults,
        qualityGateResult
      );

      const result: CITestResult = {
        success: this.isOverallSuccess(testResults, qualityGateResult),
        testResults,
        qualityGateResult,
        artifacts: {
          reports: reportPaths,
          logs: await this.collectLogFiles(),
        },
        metrics,
        deployment,
      };

      // Send notifications
      await this.sendNotifications(result);

      // Update GitHub status if configured
      await this.updateGitHubStatus(result);

      logger.info(
        `${result.success ? '✅' : '❌'} [CI-EXECUTOR] CI test execution ${result.success ? 'completed successfully' : 'failed'}`,
        'CIExecutor',
        {
          duration: `${metrics.duration}ms`,
          tests: metrics.testCount,
          passRate: `${metrics.passRate}%`,
          deployment: deployment.allowed ? 'allowed' : 'blocked',
        }
      );

      return result;
    } catch (error) {
      logger.error(
        '❌ [CI-EXECUTOR] CI test execution failed:',
        'CIExecutor',
        error
      );

      // Create minimal error result
      const errorResult: CITestResult = {
        success: false,
        testResults: this.createEmptyTestReport(),
        artifacts: { reports: [], logs: [] },
        metrics: {
          duration: Date.now() - startTime,
          testCount: 0,
          passRate: 0,
          performanceScore: 0,
        },
        deployment: {
          allowed: false,
          environment: this.config.environment,
          blockers: ['Test execution failed'],
        },
      };

      await this.sendNotifications(errorResult);
      return errorResult;
    }
  }

  private async runTestsByScope(): Promise<TestReport> {
    switch (this.config.testScope) {
      case 'smoke':
        return this.runSmokeTests();
      case 'integration':
        return this.runIntegrationTests();
      case 'performance':
        return this.runPerformanceTests();
      case 'full':
        return this.runFullTestSuite();
      default:
        throw new Error(`Unknown test scope: ${this.config.testScope}`);
    }
  }

  private async runSmokeTests(): Promise<TestReport> {
    logger.info('🔥 [CI-EXECUTOR] Running smoke tests...', 'CIExecutor');

    const quickRunner = new QuickTestRunner(this.app);
    const smokeResult = await quickRunner.runQuickSmokeTest();

    // Convert to TestReport format
    return {
      summary: {
        total: smokeResult.results.length,
        passed: smokeResult.results.filter(r => r.status === 'passed').length,
        failed: smokeResult.results.filter(r => r.status === 'failed').length,
        skipped: 0,
        duration: smokeResult.results.reduce((sum, r) => sum + r.duration, 0),
        coverage: smokeResult.passed ? 100 : 0,
      },
      results: smokeResult.results,
      performance: {
        averageResponseTime:
          smokeResult.results.reduce((sum, r) => sum + r.duration, 0) /
          smokeResult.results.length,
        slowestEndpoint: '',
        fastestEndpoint: '',
        timeouts: 0,
      },
      versions: {
        tested: ['v2.2'],
        compatibility: { 'v2.2': smokeResult.passed },
      },
      categories: {
        smoke: {
          passed: smokeResult.results.filter(r => r.status === 'passed').length,
          failed: smokeResult.results.filter(r => r.status === 'failed').length,
          total: smokeResult.results.length,
        },
      },
    };
  }

  private async runIntegrationTests(): Promise<TestReport> {
    logger.info('🔗 [CI-EXECUTOR] Running integration tests...', 'CIExecutor');

    const runner = new ComprehensiveTestRunner(this.app, {
      includeCategories: ['integration'],
      includeVersions: ['v2.1', 'v2.2'],
      includeTags: [],
      excludeTags: ['slow', 'performance'],
      parallel: this.config.parallel,
      maxConcurrency: 5,
      timeout: this.config.timeout,
      retries: this.config.maxRetries,
      generateReport: true,
      outputDir: this.outputDir,
    });

    const results = await runner.runComprehensiveTests();
    return results.report;
  }

  private async runPerformanceTests(): Promise<TestReport> {
    logger.info('⚡ [CI-EXECUTOR] Running performance tests...', 'CIExecutor');

    const runner = new ComprehensiveTestRunner(this.app, {
      includeCategories: ['performance'],
      includeVersions: ['v2.2'],
      includeTags: ['performance', 'load'],
      excludeTags: [],
      parallel: false, // Performance tests run sequentially
      maxConcurrency: 1,
      timeout: this.config.timeout * 2, // Double timeout for performance tests
      retries: 1,
      generateReport: true,
      outputDir: this.outputDir,
    });

    const results = await runner.runComprehensiveTests();
    return results.report;
  }

  private async runFullTestSuite(): Promise<TestReport> {
    logger.info('🧪 [CI-EXECUTOR] Running full test suite...', 'CIExecutor');

    const runner = new ComprehensiveTestRunner(this.app, {
      includeCategories: ['integration', 'performance'],
      includeVersions: ['v2.0', 'v2.1', 'v2.2'],
      includeTags: [],
      excludeTags: ['experimental'],
      parallel: this.config.parallel,
      maxConcurrency: 3,
      timeout: this.config.timeout,
      retries: this.config.maxRetries,
      generateReport: true,
      outputDir: this.outputDir,
    });

    const results = await runner.runComprehensiveTests();
    return results.report;
  }

  private async generateReports(
    testResults: TestReport,
    qualityGateResult?: any
  ): Promise<string[]> {
    const reportPaths: string[] = [];

    try {
      for (const format of this.config.outputFormats) {
        switch (format) {
          case 'json':
            const jsonPath = await this.generateJSONReport(
              testResults,
              qualityGateResult
            );
            reportPaths.push(jsonPath);
            break;
          case 'junit':
            const junitPath = await this.generateJUnitReport(testResults);
            reportPaths.push(junitPath);
            break;
          case 'html':
            const htmlPath = await this.generateHTMLReport(
              testResults,
              qualityGateResult
            );
            reportPaths.push(htmlPath);
            break;
          case 'markdown':
            const mdPath = await this.generateMarkdownReport(
              testResults,
              qualityGateResult
            );
            reportPaths.push(mdPath);
            break;
        }
      }
    } catch (error) {
      logger.error(
        '❌ [CI-EXECUTOR] Error generating reports:',
        'CIExecutor',
        error
      );
    }

    return reportPaths;
  }

  private async generateJSONReport(
    testResults: TestReport,
    qualityGateResult?: any
  ): Promise<string> {
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      scope: this.config.testScope,
      testResults,
      qualityGate: qualityGateResult,
      ci: {
        config: this.config,
        buildInfo: {
          commit: process.env.GITHUB_SHA,
          branch: process.env.GITHUB_REF_NAME,
          pr:
            process.env.GITHUB_EVENT_NAME === 'pull_request'
              ? process.env.GITHUB_EVENT_NUMBER
              : null,
          workflow: process.env.GITHUB_WORKFLOW,
          runId: process.env.GITHUB_RUN_ID,
        },
      },
    };

    const filePath = path.join(
      this.outputDir,
      `ci-test-report-${this.config.testScope}.json`
    );
    await fs.writeFile(filePath, JSON.stringify(report, null, 2));
    return filePath;
  }

  private async generateJUnitReport(testResults: TestReport): Promise<string> {
    const xml = this.convertToJUnitXML(testResults);
    const filePath = path.join(
      this.outputDir,
      `junit-test-results-${this.config.testScope}.xml`
    );
    await fs.writeFile(filePath, xml);
    return filePath;
  }

  private convertToJUnitXML(testResults: TestReport): string {
    const totalTests = testResults.summary.total;
    const failures = testResults.summary.failed;
    const duration = testResults.summary.duration / 1000; // Convert to seconds

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="${totalTests}" failures="${failures}" time="${duration}">`;

    // Group tests by test suite
    const testsByClass = testResults.results.reduce(
      (acc, test) => {
        const className = test.testSuite || 'Unknown';
        if (!acc[className]) acc[className] = [];
        acc[className].push(test);
        return acc;
      },
      {} as Record<string, TestResult[]>
    );

    Object.entries(testsByClass).forEach(([className, tests]) => {
      const classTests = tests.length;
      const classFailures = tests.filter(t => t.status === 'failed').length;
      const classTime = tests.reduce((sum, t) => sum + t.duration, 0) / 1000;

      xml += `
  <testsuite name="${className}" tests="${classTests}" failures="${classFailures}" time="${classTime}">`;

      tests.forEach(test => {
        xml += `
    <testcase classname="${className}" name="${test.testCase}" time="${test.duration / 1000}">`;

        if (test.status === 'failed') {
          xml += `
      <failure message="${test.error || 'Test failed'}">${test.error || 'No error details available'}</failure>`;
        }

        xml += `
    </testcase>`;
      });

      xml += `
  </testsuite>`;
    });

    xml += `
</testsuites>`;

    return xml;
  }

  private async generateHTMLReport(
    testResults: TestReport,
    qualityGateResult?: any
  ): Promise<string> {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>CI Test Report - ${this.config.environment}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .metric.success { border-left: 4px solid #28a745; }
        .metric.warning { border-left: 4px solid #ffc107; }
        .metric.danger { border-left: 4px solid #dc3545; }
        .metric-value { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #6c757d; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .status-skipped { color: #ffc107; }
        .quality-gate { margin: 20px 0; padding: 20px; border-radius: 5px; }
        .quality-gate.passed { background: #d4edda; border: 1px solid #c3e6cb; }
        .quality-gate.failed { background: #f8d7da; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 CI Test Report</h1>
            <p><strong>Environment:</strong> ${this.config.environment} | <strong>Scope:</strong> ${this.config.testScope}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="summary">
            <div class="metric ${testResults.summary.failed === 0 ? 'success' : 'danger'}">
                <div class="metric-value">${testResults.summary.total}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric ${testResults.summary.passed === testResults.summary.total ? 'success' : 'warning'}">
                <div class="metric-value">${testResults.summary.passed}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric ${testResults.summary.failed === 0 ? 'success' : 'danger'}">
                <div class="metric-value">${testResults.summary.failed}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${Math.round(testResults.summary.coverage)}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${Math.round(testResults.performance.averageResponseTime)}ms</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
        </div>

        ${
          qualityGateResult
            ? `
        <div class="quality-gate ${qualityGateResult.passed ? 'passed' : 'failed'}">
            <h3>🚪 Quality Gate: ${qualityGateResult.passed ? '✅ PASSED' : '❌ FAILED'}</h3>
            <p><strong>Score:</strong> ${qualityGateResult.score}/100</p>
            <p><strong>Deployment:</strong> ${qualityGateResult.deployment.allowed ? '✅ Allowed' : '🚫 Blocked'}</p>
            ${!qualityGateResult.deployment.allowed ? `<p><strong>Reason:</strong> ${qualityGateResult.deployment.reason}</p>` : ''}
        </div>
        `
            : ''
        }

        <h3>📋 Test Results</h3>
        <table>
            <thead>
                <tr>
                    <th>Test Suite</th>
                    <th>Test Case</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Version</th>
                </tr>
            </thead>
            <tbody>
                ${testResults.results
                  .map(
                    result => `
                <tr>
                    <td>${result.testSuite}</td>
                    <td>${result.testCase}</td>
                    <td class="status-${result.status}">${result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️'} ${result.status}</td>
                    <td>${result.duration}ms</td>
                    <td>${result.version || 'N/A'}</td>
                </tr>
                `
                  )
                  .join('')}
            </tbody>
        </table>

        <footer style="text-align: center; margin-top: 40px; color: #6c757d;">
            <p>Generated by Hotel Voice Assistant CI Pipeline</p>
        </footer>
    </div>
</body>
</html>`;

    const filePath = path.join(
      this.outputDir,
      `ci-test-report-${this.config.testScope}.html`
    );
    await fs.writeFile(filePath, html);
    return filePath;
  }

  private async generateMarkdownReport(
    testResults: TestReport,
    qualityGateResult?: any
  ): Promise<string> {
    const md = `# 🧪 CI Test Report - ${this.config.environment.toUpperCase()}

**Environment**: ${this.config.environment}  
**Test Scope**: ${this.config.testScope}  
**Generated**: ${new Date().toLocaleString()}

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | ${testResults.summary.total} |
| **Passed** | ${testResults.summary.passed} ✅ |
| **Failed** | ${testResults.summary.failed} ${testResults.summary.failed > 0 ? '❌' : ''} |
| **Success Rate** | ${Math.round(testResults.summary.coverage)}% |
| **Average Response Time** | ${Math.round(testResults.performance.averageResponseTime)}ms |
| **Duration** | ${(testResults.summary.duration / 1000).toFixed(2)}s |

${
  qualityGateResult
    ? `
## 🚪 Quality Gate

**Status**: ${qualityGateResult.passed ? '✅ PASSED' : '❌ FAILED'}  
**Score**: ${qualityGateResult.score}/100  
**Deployment**: ${qualityGateResult.deployment.allowed ? '✅ Allowed' : '🚫 Blocked'}  
${!qualityGateResult.deployment.allowed ? `**Reason**: ${qualityGateResult.deployment.reason}` : ''}
`
    : ''
}

## 📋 Test Results by Category

${Object.entries(testResults.categories)
  .map(
    ([category, stats]) =>
      `- **${category}**: ${stats.passed}/${stats.total} passed (${Math.round((stats.passed / stats.total) * 100)}%)`
  )
  .join('\n')}

## 🔄 Version Compatibility

${Object.entries(testResults.versions.compatibility)
  .map(
    ([version, compatible]) =>
      `- **${version}**: ${compatible ? '✅ Compatible' : '❌ Issues detected'}`
  )
  .join('\n')}

---
*Generated by Hotel Voice Assistant CI Pipeline*`;

    const filePath = path.join(
      this.outputDir,
      `ci-test-summary-${this.config.testScope}.md`
    );
    await fs.writeFile(filePath, md);
    return filePath;
  }

  private calculateMetrics(testResults: TestReport, duration: number): any {
    return {
      duration,
      testCount: testResults.summary.total,
      passRate:
        testResults.summary.total > 0
          ? Math.round(
              (testResults.summary.passed / testResults.summary.total) * 100
            )
          : 0,
      performanceScore: Math.round(testResults.summary.coverage),
    };
  }

  private determineDeploymentStatus(
    testResults: TestReport,
    qualityGateResult?: any
  ): any {
    const blockers: string[] = [];

    if (testResults.summary.failed > 0) {
      blockers.push(`${testResults.summary.failed} test failures`);
    }

    if (qualityGateResult && !qualityGateResult.passed) {
      blockers.push('Quality gate failed');
      if (qualityGateResult.deployment.blockedBy) {
        blockers.push(...qualityGateResult.deployment.blockedBy);
      }
    }

    return {
      allowed: blockers.length === 0,
      environment: this.config.environment,
      blockers,
    };
  }

  private isOverallSuccess(
    testResults: TestReport,
    qualityGateResult?: any
  ): boolean {
    const testsPass = testResults.summary.failed === 0;
    const qualityGatePass = !qualityGateResult || qualityGateResult.passed;
    return testsPass && qualityGatePass;
  }

  private async collectLogFiles(): Promise<string[]> {
    // Collect relevant log files
    return [];
  }

  private createEmptyTestReport(): TestReport {
    return {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        coverage: 0,
      },
      results: [],
      performance: {
        averageResponseTime: 0,
        slowestEndpoint: '',
        fastestEndpoint: '',
        timeouts: 0,
      },
      versions: { tested: [], compatibility: {} },
      categories: {},
    };
  }

  private async sendNotifications(result: CITestResult): Promise<void> {
    // Implementation for various notification channels
    logger.info('📢 [CI-EXECUTOR] Sending notifications...', 'CIExecutor');
  }

  private async updateGitHubStatus(result: CITestResult): Promise<void> {
    // Implementation for GitHub status updates
    logger.info('📱 [CI-EXECUTOR] Updating GitHub status...', 'CIExecutor');
  }
}

// ============================================
// CI RUNNER FACTORY
// ============================================

export const createCITestExecutor = (
  app: Express,
  config: Partial<CITestConfig> = {}
) => {
  const defaultConfig: CITestConfig = {
    environment: (process.env.NODE_ENV as any) || 'development',
    testScope: (process.env.TEST_SCOPE as any) || 'full',
    parallel: true,
    maxRetries: 2,
    timeout: 30000,
    outputFormats: ['json', 'html', 'junit'],
    qualityGateEnabled: true,
    blockOnFailure: true,
    notifications: {},
  };

  return new CITestExecutor(app, { ...defaultConfig, ...config });
};

export default {
  CITestExecutor,
  createCITestExecutor,
};
