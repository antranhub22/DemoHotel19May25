import { logger } from '@shared/utils/logger';
import fs from 'fs/promises';
import path from 'path';
import { TestReport } from '../testFramework';

// ============================================
// QUALITY GATE INTERFACES
// ============================================

export interface QualityGateConfig {
  name: string;
  description: string;
  enabled: boolean;
  thresholds: {
    minimumPassRate: number; // percentage (0-100)
    maximumFailureRate: number; // percentage (0-100)
    minimumCoverage?: number; // percentage (0-100)
    maximumResponseTime: number; // milliseconds
    minimumPerformanceScore: number; // percentage (0-100)
    requiredTestCategories: string[];
    blockedOnFailure: boolean;
  };
  rules: QualityGateRule[];
  environment: 'development' | 'staging' | 'production';
}

export interface QualityGateRule {
  id: string;
  name: string;
  description: string;
  type: 'threshold' | 'mandatory' | 'conditional';
  severity: 'low' | 'medium' | 'high' | 'critical';
  condition: (report: TestReport, config: QualityGateConfig) => boolean;
  errorMessage: string;
  recommendations?: string[];
}

export interface QualityGateResult {
  passed: boolean;
  score: number; // 0-100
  evaluation: {
    totalRules: number;
    passedRules: number;
    failedRules: number;
    criticalFailures: number;
  };
  ruleResults: Array<{
    rule: QualityGateRule;
    passed: boolean;
    message: string;
    impact: number;
  }>;
  deployment: {
    allowed: boolean;
    reason: string;
    blockedBy?: string[];
  };
  recommendations: string[];
  summary: string;
  timestamp: Date;
}

// ============================================
// PREDEFINED QUALITY GATE RULES
// ============================================

export const QUALITY_GATE_RULES: QualityGateRule[] = [
  {
    id: 'smoke-tests-pass',
    name: 'Smoke Tests Must Pass',
    description: 'All smoke tests must pass for basic functionality validation',
    type: 'mandatory',
    severity: 'critical',
    condition: report => {
      const smokeTests = report.results.filter(r =>
        r.metadata.tags?.includes('smoke')
      );
      return (
        smokeTests.length === 0 || smokeTests.every(r => r.status === 'passed')
      );
    },
    errorMessage: 'Smoke tests failed - basic functionality is broken',
    recommendations: [
      'Check API endpoints for basic functionality',
      'Verify database connectivity',
      'Review authentication mechanisms',
    ],
  },
  {
    id: 'integration-pass-rate',
    name: 'Integration Test Pass Rate',
    description: 'Integration tests must have at least 95% pass rate',
    type: 'threshold',
    severity: 'high',
    condition: (report, config) => {
      const integrationTests = report.results.filter(
        r => r.metadata.category === 'integration'
      );
      if (integrationTests.length === 0) return true;

      const passed = integrationTests.filter(r => r.status === 'passed').length;
      const passRate = (passed / integrationTests.length) * 100;
      return passRate >= config.thresholds.minimumPassRate;
    },
    errorMessage: 'Integration test pass rate below minimum threshold',
    recommendations: [
      'Review failed integration tests',
      'Check API endpoint implementations',
      'Verify database schema consistency',
    ],
  },
  {
    id: 'performance-thresholds',
    name: 'Performance Thresholds',
    description: 'API endpoints must meet performance requirements',
    type: 'threshold',
    severity: 'high',
    condition: (report, config) => {
      const performanceTests = report.results.filter(r =>
        r.metadata.tags?.includes('performance')
      );
      if (performanceTests.length === 0) return true;

      return performanceTests.every(
        r => r.duration <= config.thresholds.maximumResponseTime
      );
    },
    errorMessage: 'Performance thresholds exceeded',
    recommendations: [
      'Optimize slow API endpoints',
      'Review database query performance',
      'Consider implementing caching',
      'Analyze resource usage patterns',
    ],
  },
  {
    id: 'version-compatibility',
    name: 'Version Compatibility',
    description: 'All supported API versions must remain compatible',
    type: 'mandatory',
    severity: 'high',
    condition: report => {
      const versionTests = report.results.filter(r =>
        r.metadata.tags?.includes('version')
      );
      return (
        versionTests.length === 0 ||
        versionTests.every(r => r.status === 'passed')
      );
    },
    errorMessage: 'Version compatibility broken',
    recommendations: [
      'Review API changes for breaking modifications',
      'Update version compatibility documentation',
      'Consider deprecation warnings for older versions',
    ],
  },
  {
    id: 'error-rate-threshold',
    name: 'Error Rate Threshold',
    description: 'Overall test error rate must be below 5%',
    type: 'threshold',
    severity: 'medium',
    condition: (report, config) => {
      const totalTests = report.summary.total;
      const failedTests = report.summary.failed;
      if (totalTests === 0) return true;

      const errorRate = (failedTests / totalTests) * 100;
      return errorRate <= config.thresholds.maximumFailureRate;
    },
    errorMessage: 'Test error rate exceeds acceptable threshold',
    recommendations: [
      'Investigate and fix failing tests',
      'Review test data consistency',
      'Check environment configuration',
    ],
  },
  {
    id: 'critical-endpoints',
    name: 'Critical Endpoints',
    description: 'Critical Guest Journey endpoints must be functional',
    type: 'mandatory',
    severity: 'critical',
    condition: report => {
      const criticalEndpoints = [
        'guest-authentication',
        'call-management',
        'transcript-management',
      ];

      return criticalEndpoints.every(endpoint => {
        const endpointTests = report.results.filter(
          r =>
            r.metadata.tags?.includes(endpoint) ||
            r.testSuite.toLowerCase().includes(endpoint.replace('-', ' '))
        );
        return (
          endpointTests.length === 0 ||
          endpointTests.every(r => r.status === 'passed')
        );
      });
    },
    errorMessage: 'Critical Guest Journey endpoints failing',
    recommendations: [
      'Prioritize fixing guest authentication issues',
      'Ensure voice call functionality is operational',
      'Verify transcript processing is working',
    ],
  },
  {
    id: 'security-validation',
    name: 'Security Validation',
    description: 'Security-related tests must pass',
    type: 'mandatory',
    severity: 'critical',
    condition: report => {
      const securityTests = report.results.filter(
        r =>
          r.metadata.tags?.includes('security') ||
          r.metadata.tags?.includes('auth') ||
          r.metadata.tags?.includes('validation')
      );
      return (
        securityTests.length === 0 ||
        securityTests.every(r => r.status === 'passed')
      );
    },
    errorMessage: 'Security validation failed',
    recommendations: [
      'Review authentication mechanisms',
      'Check input validation functions',
      'Verify authorization controls',
      'Audit security-related code changes',
    ],
  },
];

// ============================================
// QUALITY GATE CONFIGURATIONS
// ============================================

export const QUALITY_GATE_CONFIGS: Record<string, QualityGateConfig> = {
  development: {
    name: 'Development Quality Gate',
    description: 'Quality standards for development environment',
    enabled: true,
    thresholds: {
      minimumPassRate: 90,
      maximumFailureRate: 10,
      minimumCoverage: 70,
      maximumResponseTime: 1000,
      minimumPerformanceScore: 80,
      requiredTestCategories: ['integration'],
      blockedOnFailure: false,
    },
    rules: QUALITY_GATE_RULES.filter(r => r.severity !== 'low'),
    environment: 'development',
  },
  staging: {
    name: 'Staging Quality Gate',
    description: 'Quality standards for staging environment',
    enabled: true,
    thresholds: {
      minimumPassRate: 95,
      maximumFailureRate: 5,
      minimumCoverage: 80,
      maximumResponseTime: 800,
      minimumPerformanceScore: 90,
      requiredTestCategories: ['integration', 'performance'],
      blockedOnFailure: true,
    },
    rules: QUALITY_GATE_RULES,
    environment: 'staging',
  },
  production: {
    name: 'Production Quality Gate',
    description: 'Quality standards for production environment',
    enabled: true,
    thresholds: {
      minimumPassRate: 98,
      maximumFailureRate: 2,
      minimumCoverage: 90,
      maximumResponseTime: 500,
      minimumPerformanceScore: 95,
      requiredTestCategories: ['integration', 'performance', 'security'],
      blockedOnFailure: true,
    },
    rules: QUALITY_GATE_RULES,
    environment: 'production',
  },
};

// ============================================
// QUALITY GATE EVALUATOR
// ============================================

export class QualityGateEvaluator {
  private config: QualityGateConfig;

  constructor(environment: 'development' | 'staging' | 'production') {
    this.config = QUALITY_GATE_CONFIGS[environment];
  }

  async evaluateQualityGate(report: TestReport): Promise<QualityGateResult> {
    logger.info(
      `🚪 [QUALITY-GATE] Evaluating quality gate for ${this.config.environment}`,
      'QualityGate'
    );

    const ruleResults = this.config.rules.map(rule =>
      this.evaluateRule(rule, report)
    );

    const passedRules = ruleResults.filter(r => r.passed).length;
    const failedRules = ruleResults.filter(r => !r.passed).length;
    const criticalFailures = ruleResults.filter(
      r => !r.passed && r.rule.severity === 'critical'
    ).length;

    // Calculate overall score
    const score = this.calculateQualityScore(ruleResults, report);

    // Determine if deployment should be allowed
    const deploymentAllowed = this.determineDeploymentStatus(
      ruleResults,
      score
    );

    // Collect recommendations
    const recommendations = this.collectRecommendations(ruleResults);

    const result: QualityGateResult = {
      passed: criticalFailures === 0 && failedRules === 0,
      score,
      evaluation: {
        totalRules: this.config.rules.length,
        passedRules,
        failedRules,
        criticalFailures,
      },
      ruleResults,
      deployment: deploymentAllowed,
      recommendations,
      summary: this.generateSummary(ruleResults, score, deploymentAllowed),
      timestamp: new Date(),
    };

    logger.info(
      `🚪 [QUALITY-GATE] Evaluation complete: ${result.passed ? 'PASSED' : 'FAILED'}`,
      'QualityGate',
      {
        score: score,
        passedRules: passedRules,
        failedRules: failedRules,
        criticalFailures: criticalFailures,
        deploymentAllowed: deploymentAllowed.allowed,
      }
    );

    return result;
  }

  private evaluateRule(rule: QualityGateRule, report: TestReport): any {
    try {
      const passed = rule.condition(report, this.config);
      const impact = this.calculateRuleImpact(rule, passed);

      return {
        rule,
        passed,
        message: passed
          ? `✅ ${rule.name}: Passed`
          : `❌ ${rule.name}: ${rule.errorMessage}`,
        impact,
      };
    } catch (error) {
      logger.error(
        `❌ [QUALITY-GATE] Error evaluating rule ${rule.id}:`,
        'QualityGate',
        error
      );

      return {
        rule,
        passed: false,
        message: `❌ ${rule.name}: Evaluation error - ${error}`,
        impact: this.calculateRuleImpact(rule, false),
      };
    }
  }

  private calculateRuleImpact(rule: QualityGateRule, passed: boolean): number {
    if (passed) return 0;

    const severityWeights = {
      low: 5,
      medium: 15,
      high: 25,
      critical: 40,
    };

    return severityWeights[rule.severity];
  }

  private calculateQualityScore(
    ruleResults: any[],
    report: TestReport
  ): number {
    const maxScore = 100;
    const totalImpact = ruleResults.reduce(
      (sum, result) => sum + result.impact,
      0
    );

    // Base score from test results
    const testScore =
      report.summary.total > 0
        ? (report.summary.passed / report.summary.total) * 70
        : 70;

    // Performance score
    const performanceScore =
      report.performance.averageResponseTime <=
      this.config.thresholds.maximumResponseTime
        ? 20
        : 10;

    // Deduct impact from rule failures
    const finalScore = Math.max(0, testScore + performanceScore - totalImpact);

    return Math.min(maxScore, Math.round(finalScore));
  }

  private determineDeploymentStatus(
    ruleResults: any[],
    score: number
  ): { allowed: boolean; reason: string; blockedBy?: string[] } {
    const criticalFailures = ruleResults.filter(
      r => !r.passed && r.rule.severity === 'critical'
    );
    const highFailures = ruleResults.filter(
      r => !r.passed && r.rule.severity === 'high'
    );

    if (criticalFailures.length > 0) {
      return {
        allowed: false,
        reason: 'Critical quality gate rules failed',
        blockedBy: criticalFailures.map(f => f.rule.name),
      };
    }

    if (this.config.thresholds.blockedOnFailure && highFailures.length > 0) {
      return {
        allowed: false,
        reason: 'High severity quality gate rules failed',
        blockedBy: highFailures.map(f => f.rule.name),
      };
    }

    if (score < this.config.thresholds.minimumPerformanceScore) {
      return {
        allowed: false,
        reason: `Quality score ${score}% below minimum threshold ${this.config.thresholds.minimumPerformanceScore}%`,
      };
    }

    return {
      allowed: true,
      reason: 'All quality gate criteria met',
    };
  }

  private collectRecommendations(ruleResults: any[]): string[] {
    const recommendations: string[] = [];

    ruleResults.forEach(result => {
      if (!result.passed && result.rule.recommendations) {
        recommendations.push(...result.rule.recommendations);
      }
    });

    // Add general recommendations based on patterns
    const failedCategories = ruleResults
      .filter(r => !r.passed)
      .map(r => r.rule.type);

    if (failedCategories.includes('mandatory')) {
      recommendations.push(
        'Priority: Fix mandatory requirements before proceeding'
      );
    }

    if (failedCategories.includes('threshold')) {
      recommendations.push(
        'Consider performance optimization and load testing'
      );
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private generateSummary(
    ruleResults: any[],
    score: number,
    deployment: { allowed: boolean; reason: string }
  ): string {
    const totalRules = ruleResults.length;
    const passedRules = ruleResults.filter(r => r.passed).length;
    const failedRules = totalRules - passedRules;

    return `Quality Gate ${deployment.allowed ? 'PASSED' : 'FAILED'}: ${passedRules}/${totalRules} rules passed, Score: ${score}%. ${deployment.reason}`;
  }

  async saveQualityGateReport(
    result: QualityGateResult,
    outputPath: string
  ): Promise<void> {
    try {
      // Generate detailed JSON report
      const jsonReport = {
        qualityGate: {
          config: this.config,
          result: result,
          generatedAt: new Date().toISOString(),
          environment: this.config.environment,
        },
      };

      const jsonPath = path.join(
        outputPath,
        `quality-gate-${this.config.environment}-${Date.now()}.json`
      );
      await fs.writeFile(jsonPath, JSON.stringify(jsonReport, null, 2));

      // Generate Markdown summary
      const markdownReport = this.generateMarkdownReport(result);
      const mdPath = path.join(
        outputPath,
        `quality-gate-summary-${this.config.environment}-${Date.now()}.md`
      );
      await fs.writeFile(mdPath, markdownReport);

      logger.info('📊 [QUALITY-GATE] Reports saved:', 'QualityGate', {
        json: jsonPath,
        markdown: mdPath,
      });
    } catch (error) {
      logger.error(
        '❌ [QUALITY-GATE] Failed to save reports:',
        'QualityGate',
        error
      );
      throw error;
    }
  }

  private generateMarkdownReport(result: QualityGateResult): string {
    return `# 🚪 Quality Gate Report - ${this.config.environment.toUpperCase()}

## 📊 Overall Result

**Status**: ${result.passed ? '✅ PASSED' : '❌ FAILED'}
**Score**: ${result.score}/100
**Deployment**: ${result.deployment.allowed ? '✅ ALLOWED' : '🚫 BLOCKED'}

${!result.deployment.allowed ? `**Blocked By**: ${result.deployment.blockedBy?.join(', ') || 'Score threshold'}` : ''}

## 📋 Rule Evaluation

| Rule | Status | Impact | Message |
|------|--------|---------|---------|
${result.ruleResults
  .map(
    r =>
      `| ${r.rule.name} | ${r.passed ? '✅' : '❌'} | ${r.impact} | ${r.message} |`
  )
  .join('\n')}

## 📈 Quality Metrics

- **Total Rules**: ${result.evaluation.totalRules}
- **Passed Rules**: ${result.evaluation.passedRules}
- **Failed Rules**: ${result.evaluation.failedRules}
- **Critical Failures**: ${result.evaluation.criticalFailures}

## 🎯 Recommendations

${
  result.recommendations.length > 0
    ? result.recommendations.map(rec => `- ${rec}`).join('\n')
    : 'No specific recommendations - all quality checks passed!'
}

## 🎯 Summary

${result.summary}

---
*Generated on ${result.timestamp.toLocaleString()}*
*Environment: ${this.config.environment}*`;
  }
}

// ============================================
// EXPORT UTILITIES
// ============================================

export const createQualityGateEvaluator = (
  environment: 'development' | 'staging' | 'production'
) => {
  return new QualityGateEvaluator(environment);
};

export const getQualityGateConfig = (environment: string) => {
  return QUALITY_GATE_CONFIGS[environment];
};

export default {
  QualityGateEvaluator,
  QUALITY_GATE_CONFIGS,
  QUALITY_GATE_RULES,
  createQualityGateEvaluator,
  getQualityGateConfig,
};
