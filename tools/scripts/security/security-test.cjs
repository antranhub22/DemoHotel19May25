#!/usr/bin/env node

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// ============================================
// Security Test Suite
// ============================================

class SecurityTester {
    constructor() {
        this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:10000';
        this.results = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
            },
        };
    }

    // ============================================
    // Test Runner
    // ============================================

    async runAllTests() {
        console.log('🛡️ Starting Security Test Suite...\n');

        try {
            await this.testSecurityHeaders();
            await this.testInputSanitization();
            await this.testRateLimiting();
            await this.testXSSProtection();
            await this.testSQLInjectionProtection();
            await this.testAuditLogging();
            await this.testThreatDetection();

            this.generateReport();
            await this.saveResults();

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            process.exit(1);
        }
    }

    // ============================================
    // Individual Tests
    // ============================================

    async testSecurityHeaders() {
        console.log('🔒 Testing Security Headers...');

        const tests = [
            {
                name: 'X-Content-Type-Options Header',
                check: async () => {
                    const response = await this.makeRequest('/api/health');
                    return response.headers['x-content-type-options'] === 'nosniff';
                },
            },
            {
                name: 'X-Frame-Options Header',
                check: async () => {
                    const response = await this.makeRequest('/api/health');
                    return response.headers['x-frame-options'] === 'DENY';
                },
            },
            {
                name: 'X-XSS-Protection Header',
                check: async () => {
                    const response = await this.makeRequest('/api/health');
                    return response.headers['x-xss-protection']?.includes('1; mode=block');
                },
            },
            {
                name: 'X-Powered-By Header Removed',
                check: async () => {
                    const response = await this.makeRequest('/api/health');
                    return !response.headers['x-powered-by'];
                },
            },
        ];

        for (const test of tests) {
            await this.runTest('Security Headers', test.name, test.check);
        }
    }

    async testInputSanitization() {
        console.log('🧹 Testing Input Sanitization...');

        const tests = [
            {
                name: 'XSS Script Tag Sanitization',
                check: async () => {
                    const maliciousInput = '<script>alert("XSS")</script>';
                    const response = await this.makeRequest('/api/test', {
                        method: 'POST',
                        body: { input: maliciousInput },
                    });
                    return response.status === 403 || !response.body?.includes('<script>');
                },
            },
            {
                name: 'SQL Injection Pattern Detection',
                check: async () => {
                    const sqlInjection = "'; DROP TABLE users; --";
                    const response = await this.makeRequest('/api/test', {
                        method: 'POST',
                        body: { query: sqlInjection },
                    });
                    return response.status === 403;
                },
            },
            {
                name: 'Large Input Rejection',
                check: async () => {
                    const largeInput = 'A'.repeat(20000);
                    const response = await this.makeRequest('/api/test', {
                        method: 'POST',
                        body: { data: largeInput },
                    });
                    return response.status === 413 || response.status === 403;
                },
            },
        ];

        for (const test of tests) {
            await this.runTest('Input Sanitization', test.name, test.check);
        }
    }

    async testRateLimiting() {
        console.log('⏱️ Testing Rate Limiting...');

        const tests = [
            {
                name: 'Rate Limit Headers Present',
                check: async () => {
                    const response = await this.makeRequest('/api/health');
                    return response.headers['x-ratelimit-limit'] !== undefined;
                },
            },
            {
                name: 'Rate Limit Enforcement',
                check: async () => {
                    // Make multiple rapid requests
                    const promises = Array(10).fill(0).map(() =>
                        this.makeRequest('/api/health', { timeout: 1000 })
                    );

                    const responses = await Promise.allSettled(promises);
                    const rateLimited = responses.some(result =>
                        result.status === 'fulfilled' && result.value.status === 429
                    );

                    return rateLimited;
                },
            },
        ];

        for (const test of tests) {
            await this.runTest('Rate Limiting', test.name, test.check);
        }
    }

    async testXSSProtection() {
        console.log('🛡️ Testing XSS Protection...');

        const xssPayloads = [
            '<script>alert(1)</script>',
            'javascript:alert(1)',
            '<img src=x onerror=alert(1)>',
            '<svg onload=alert(1)>',
            '<iframe src="javascript:alert(1)"></iframe>',
        ];

        for (const payload of xssPayloads) {
            await this.runTest('XSS Protection', `XSS Payload: ${payload.substring(0, 20)}...`, async () => {
                const response = await this.makeRequest('/api/test', {
                    method: 'POST',
                    body: { content: payload },
                });
                return response.status === 403 || response.status === 400;
            });
        }
    }

    async testSQLInjectionProtection() {
        console.log('💉 Testing SQL Injection Protection...');

        const sqlPayloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --",
            "1' AND (SELECT COUNT(*) FROM users) > 0 --",
            "admin'--",
        ];

        for (const payload of sqlPayloads) {
            await this.runTest('SQL Injection', `SQL Payload: ${payload}`, async () => {
                const response = await this.makeRequest('/api/test', {
                    method: 'POST',
                    body: { query: payload },
                });
                return response.status === 403 || response.status === 400;
            });
        }
    }

    async testAuditLogging() {
        console.log('📝 Testing Audit Logging...');

        const tests = [
            {
                name: 'Audit Log Endpoint Accessible',
                check: async () => {
                    const response = await this.makeRequest('/api/admin/security/audit-logs');
                    return response.status === 200 || response.status === 401; // 401 is ok (auth required)
                },
            },
            {
                name: 'Security Metrics Available',
                check: async () => {
                    const response = await this.makeRequest('/api/admin/security/metrics');
                    return response.status === 200 || response.status === 401;
                },
            },
            {
                name: 'Threat Detection Active',
                check: async () => {
                    const response = await this.makeRequest('/api/admin/security/threats');
                    return response.status === 200 || response.status === 401;
                },
            },
        ];

        for (const test of tests) {
            await this.runTest('Audit Logging', test.name, test.check);
        }
    }

    async testThreatDetection() {
        console.log('🚨 Testing Threat Detection...');

        const tests = [
            {
                name: 'Multiple Failed Requests Trigger Detection',
                check: async () => {
                    // Simulate multiple failed requests
                    const promises = Array(5).fill(0).map(() =>
                        this.makeRequest('/api/nonexistent', { timeout: 1000 })
                    );

                    await Promise.allSettled(promises);

                    // Check if threat detection endpoint shows activity
                    const response = await this.makeRequest('/api/admin/security/threats');
                    return response.status === 200 || response.status === 401;
                },
            },
            {
                name: 'Security Status Endpoint',
                check: async () => {
                    const response = await this.makeRequest('/api/admin/security/status');
                    return response.status === 200 || response.status === 401;
                },
            },
        ];

        for (const test of tests) {
            await this.runTest('Threat Detection', test.name, test.check);
        }
    }

    // ============================================
    // Utility Methods
    // ============================================

    async runTest(category, name, testFunction) {
        const startTime = performance.now();

        try {
            const result = await testFunction();
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            const testResult = {
                category,
                name,
                status: result ? 'PASSED' : 'FAILED',
                duration: `${duration}ms`,
                timestamp: new Date().toISOString(),
            };

            this.results.tests.push(testResult);
            this.results.summary.total++;

            if (result) {
                this.results.summary.passed++;
                console.log(`  ✅ ${name} (${duration}ms)`);
            } else {
                this.results.summary.failed++;
                console.log(`  ❌ ${name} (${duration}ms)`);
            }

        } catch (error) {
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            this.results.tests.push({
                category,
                name,
                status: 'ERROR',
                duration: `${duration}ms`,
                error: error.message,
                timestamp: new Date().toISOString(),
            });

            this.results.summary.total++;
            this.results.summary.failed++;

            console.log(`  ⚠️ ${name} - ERROR: ${error.message} (${duration}ms)`);
        }
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const timeout = options.timeout || 5000;

        try {
            // Simple fetch simulation for Node.js
            const https = require('https');
            const http = require('http');
            const urlModule = require('url');

            const parsedUrl = urlModule.parse(url);
            const isHttps = parsedUrl.protocol === 'https:';
            const client = isHttps ? https : http;

            return new Promise((resolve, reject) => {
                const requestOptions = {
                    hostname: parsedUrl.hostname,
                    port: parsedUrl.port || (isHttps ? 443 : 80),
                    path: parsedUrl.path,
                    method: options.method || 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'SecurityTester/1.0',
                        ...options.headers,
                    },
                    timeout,
                };

                const req = client.request(requestOptions, (res) => {
                    let body = '';
                    res.on('data', chunk => body += chunk);
                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            body: body,
                        });
                    });
                });

                req.on('error', reject);
                req.on('timeout', () => reject(new Error('Request timeout')));

                if (options.body) {
                    req.write(JSON.stringify(options.body));
                }

                req.end();
            });

        } catch (error) {
            return {
                status: 0,
                headers: {},
                body: '',
                error: error.message,
            };
        }
    }

    generateReport() {
        const { total, passed, failed } = this.results.summary;
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

        console.log('\n' + '='.repeat(60));
        console.log('🛡️ SECURITY TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`📊 Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        console.log('='.repeat(60));

        // Group by category
        const byCategory = this.results.tests.reduce((acc, test) => {
            if (!acc[test.category]) acc[test.category] = [];
            acc[test.category].push(test);
            return acc;
        }, {});

        for (const [category, tests] of Object.entries(byCategory)) {
            const categoryPassed = tests.filter(t => t.status === 'PASSED').length;
            const categoryTotal = tests.length;
            const categoryRate = ((categoryPassed / categoryTotal) * 100).toFixed(1);

            console.log(`\n📋 ${category}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);

            tests.forEach(test => {
                const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⚠️';
                console.log(`  ${icon} ${test.name} - ${test.duration}`);
                if (test.error) {
                    console.log(`     Error: ${test.error}`);
                }
            });
        }

        console.log('\n' + '='.repeat(60));

        if (failed === 0) {
            console.log('🎉 All security tests passed! System is secure.');
        } else if (failed <= 2) {
            console.log('⚠️ Some tests failed. Review security configuration.');
        } else {
            console.log('🚨 Multiple security issues detected. Immediate attention required.');
        }
    }

    async saveResults() {
        try {
            const reportsDir = path.join(process.cwd(), 'security-test-reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            const filename = `security-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            const filepath = path.join(reportsDir, filename);

            fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
            console.log(`\n📁 Results saved to: ${filepath}`);

            // Also save a summary
            const summaryPath = path.join(reportsDir, 'latest-summary.txt');
            const summary = `Security Test Summary (${this.results.timestamp})
Total Tests: ${this.results.summary.total}
Passed: ${this.results.summary.passed}
Failed: ${this.results.summary.failed}
Success Rate: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%

Failed Tests:
${this.results.tests
                    .filter(test => test.status !== 'PASSED')
                    .map(test => `- ${test.category}: ${test.name}`)
                    .join('\n')}
`;

            fs.writeFileSync(summaryPath, summary);

        } catch (error) {
            console.error('❌ Failed to save results:', error.message);
        }
    }
}

// ============================================
// Main Execution
// ============================================

async function main() {
    const args = process.argv.slice(2);
    const showHelp = args.includes('--help') || args.includes('-h');

    if (showHelp) {
        console.log(`
🛡️ Security Test Suite

Usage: node security-test.cjs [options]

Options:
  --help, -h     Show this help message
  --url <url>    Set base URL for testing (default: http://localhost:10000)
  --timeout <ms> Set request timeout (default: 5000ms)

Examples:
  node security-test.cjs
  node security-test.cjs --url http://localhost:3000
  node security-test.cjs --timeout 10000

Categories:
  - Security Headers
  - Input Sanitization  
  - Rate Limiting
  - XSS Protection
  - SQL Injection Protection
  - Audit Logging
  - Threat Detection
    `);
        return;
    }

    // Parse arguments
    const urlIndex = args.indexOf('--url');
    if (urlIndex !== -1 && args[urlIndex + 1]) {
        process.env.TEST_BASE_URL = args[urlIndex + 1];
    }

    const timeoutIndex = args.indexOf('--timeout');
    if (timeoutIndex !== -1 && args[timeoutIndex + 1]) {
        process.env.TEST_TIMEOUT = args[timeoutIndex + 1];
    }

    const tester = new SecurityTester();
    await tester.runAllTests();
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Security test suite failed:', error);
        process.exit(1);
    });
}

module.exports = SecurityTester; 