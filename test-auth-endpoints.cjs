#!/usr/bin/env node

/**
 * 🔐 AUTH ENDPOINTS COMPREHENSIVE TESTING
 * Kiểm tra tất cả auth endpoints trên production
 */

const https = require('https');
const fs = require('fs');

const PRODUCTION_URL = 'minhonmuine.talk2go.online';
const API_BASE = `https://${PRODUCTION_URL}/api`;

class AuthEndpointsTester {
    constructor() {
        this.testCredentials = {
            username: 'admin',
            password: 'admin123'
        };
        this.authToken = null;
        this.refreshToken = null;
        this.results = {
            endpoints: {},
            summary: {
                passed: 0,
                failed: 0,
                total: 0
            }
        };
    }

    // Helper method for HTTP requests
    makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const req = https.request(url, options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = data ? JSON.parse(data) : {};
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            body: jsonData,
                            rawBody: data
                        });
                    } catch (e) {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            body: data,
                            rawBody: data
                        });
                    }
                });
            });

            req.on('error', reject);

            if (options.body) {
                req.write(options.body);
            }

            req.end();
        });
    }

    // Test result logging
    logTest(endpoint, method, success, statusCode, details) {
        const result = {
            method,
            success,
            statusCode,
            details,
            timestamp: new Date().toISOString()
        };

        this.results.endpoints[endpoint] = result;
        this.results.summary.total++;

        if (success) {
            this.results.summary.passed++;
            console.log(`✅ ${method} ${endpoint} - ${statusCode} - ${details}`);
        } else {
            this.results.summary.failed++;
            console.log(`❌ ${method} ${endpoint} - ${statusCode} - ${details}`);
        }
    }

    // Test 1: POST /api/auth/login
    async testLogin() {
        console.log('\n🔐 Testing Login Endpoint...');

        try {
            const loginData = JSON.stringify(this.testCredentials);

            const response = await this.makeRequest(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': `https://${PRODUCTION_URL}`
                },
                body: loginData
            });

            if (response.statusCode === 200 && response.body.success && response.body.token) {
                this.authToken = response.body.token;
                this.refreshToken = response.body.refreshToken;
                this.logTest('/api/auth/login', 'POST', true, 200, 'Login successful with valid token');
                return true;
            } else {
                this.logTest('/api/auth/login', 'POST', false, response.statusCode,
                    `Login failed: ${response.body.error || 'Unknown error'}`);
                return false;
            }
        } catch (error) {
            this.logTest('/api/auth/login', 'POST', false, 'ERROR', `Request failed: ${error.message}`);
            return false;
        }
    }

    // Test 2: GET /api/auth/me
    async testGetMe() {
        console.log('\n👤 Testing Get User Info Endpoint...');

        if (!this.authToken) {
            this.logTest('/api/auth/me', 'GET', false, 'NO_TOKEN', 'No auth token available');
            return false;
        }

        try {
            const response = await this.makeRequest(`${API_BASE}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Origin': `https://${PRODUCTION_URL}`
                }
            });

            if (response.statusCode === 200 && response.body.success) {
                this.logTest('/api/auth/me', 'GET', true, 200,
                    `User info retrieved: ${response.body.user?.username || 'Unknown'}`);
                return true;
            } else {
                this.logTest('/api/auth/me', 'GET', false, response.statusCode,
                    `Failed: ${response.body.error || 'Unknown error'}`);
                return false;
            }
        } catch (error) {
            this.logTest('/api/auth/me', 'GET', false, 'ERROR', `Request failed: ${error.message}`);
            return false;
        }
    }

    // Test 3: POST /api/auth/refresh
    async testRefresh() {
        console.log('\n🔄 Testing Token Refresh Endpoint...');

        if (!this.refreshToken) {
            this.logTest('/api/auth/refresh', 'POST', false, 'NO_REFRESH_TOKEN', 'No refresh token available');
            return false;
        }

        try {
            const refreshData = JSON.stringify({ token: this.refreshToken });

            const response = await this.makeRequest(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': `https://${PRODUCTION_URL}`
                },
                body: refreshData
            });

            if (response.statusCode === 200 && response.body.success && response.body.token) {
                this.logTest('/api/auth/refresh', 'POST', true, 200, 'Token refreshed successfully');
                return true;
            } else {
                this.logTest('/api/auth/refresh', 'POST', false, response.statusCode,
                    `Refresh failed: ${response.body.error || 'Unknown error'}`);
                return false;
            }
        } catch (error) {
            this.logTest('/api/auth/refresh', 'POST', false, 'ERROR', `Request failed: ${error.message}`);
            return false;
        }
    }

    // Test 4: GET /api/auth/permissions
    async testPermissions() {
        console.log('\n🔒 Testing Permissions Endpoint...');

        if (!this.authToken) {
            this.logTest('/api/auth/permissions', 'GET', false, 'NO_TOKEN', 'No auth token available');
            return false;
        }

        try {
            const response = await this.makeRequest(`${API_BASE}/auth/permissions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Origin': `https://${PRODUCTION_URL}`
                }
            });

            if (response.statusCode === 200) {
                this.logTest('/api/auth/permissions', 'GET', true, 200,
                    `Permissions retrieved: ${JSON.stringify(response.body.permissions || [])}`);
                return true;
            } else {
                this.logTest('/api/auth/permissions', 'GET', false, response.statusCode,
                    `Failed: ${response.body.error || 'Unknown error'}`);
                return false;
            }
        } catch (error) {
            this.logTest('/api/auth/permissions', 'GET', false, 'ERROR', `Request failed: ${error.message}`);
            return false;
        }
    }

    // Test 5: POST /api/auth/logout
    async testLogout() {
        console.log('\n👋 Testing Logout Endpoint...');

        if (!this.authToken) {
            this.logTest('/api/auth/logout', 'POST', false, 'NO_TOKEN', 'No auth token available');
            return false;
        }

        try {
            const response = await this.makeRequest(`${API_BASE}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json',
                    'Origin': `https://${PRODUCTION_URL}`
                }
            });

            if (response.statusCode === 200) {
                this.logTest('/api/auth/logout', 'POST', true, 200, 'Logout successful');
                return true;
            } else {
                this.logTest('/api/auth/logout', 'POST', false, response.statusCode,
                    `Logout failed: ${response.body.error || 'Unknown error'}`);
                return false;
            }
        } catch (error) {
            this.logTest('/api/auth/logout', 'POST', false, 'ERROR', `Request failed: ${error.message}`);
            return false;
        }
    }

    // Test invalid credentials
    async testInvalidLogin() {
        console.log('\n❌ Testing Invalid Login...');

        try {
            const invalidData = JSON.stringify({
                username: 'invalid',
                password: 'wrong'
            });

            const response = await this.makeRequest(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': `https://${PRODUCTION_URL}`
                },
                body: invalidData
            });

            if (response.statusCode === 401 || response.statusCode === 400) {
                this.logTest('/api/auth/login [invalid]', 'POST', true, response.statusCode,
                    'Correctly rejected invalid credentials');
                return true;
            } else {
                this.logTest('/api/auth/login [invalid]', 'POST', false, response.statusCode,
                    'Should reject invalid credentials');
                return false;
            }
        } catch (error) {
            this.logTest('/api/auth/login [invalid]', 'POST', false, 'ERROR', `Request failed: ${error.message}`);
            return false;
        }
    }

    // Generate comprehensive report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            productionUrl: PRODUCTION_URL,
            testResults: this.results,
            authFlowStatus: this.assessAuthFlow(),
            recommendations: this.generateRecommendations()
        };

        // Save detailed report
        fs.writeFileSync('auth-endpoints-test-report.json', JSON.stringify(report, null, 2));

        return report;
    }

    assessAuthFlow() {
        const { passed, total } = this.results.summary;
        const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

        if (percentage >= 90) return 'EXCELLENT';
        if (percentage >= 70) return 'GOOD';
        if (percentage >= 50) return 'FAIR';
        return 'POOR';
    }

    generateRecommendations() {
        const recs = [];

        Object.entries(this.results.endpoints).forEach(([endpoint, result]) => {
            if (!result.success) {
                if (result.statusCode === 401) {
                    recs.push(`Fix authentication for ${endpoint}`);
                } else if (result.statusCode === 404) {
                    recs.push(`Endpoint ${endpoint} not found - check routing`);
                } else if (result.statusCode === 500) {
                    recs.push(`Server error on ${endpoint} - check logs`);
                }
            }
        });

        if (recs.length === 0) {
            recs.push('All auth endpoints working correctly!');
        }

        return recs;
    }

    // Run complete test suite
    async runAllTests() {
        console.log(`🧪 AUTH ENDPOINTS TESTING: ${PRODUCTION_URL}\n`);
        console.log('='.repeat(60));

        // Run tests in order
        await this.testInvalidLogin(); // Test security first
        await this.testLogin();         // Get tokens
        await this.testGetMe();         // Test authenticated endpoint
        await this.testPermissions();   // Test permissions
        await this.testRefresh();       // Test refresh flow
        await this.testLogout();        // Test logout

        const report = this.generateReport();

        console.log('\n' + '='.repeat(60));
        console.log('📊 AUTH ENDPOINTS TEST SUMMARY:');
        console.log('='.repeat(60));
        console.log(`🌐 Production URL: https://${PRODUCTION_URL}`);
        console.log(`✅ Passed: ${this.results.summary.passed}`);
        console.log(`❌ Failed: ${this.results.summary.failed}`);
        console.log(`📊 Total Tests: ${this.results.summary.total}`);
        console.log(`🎯 Success Rate: ${Math.round((this.results.summary.passed / this.results.summary.total) * 100)}%`);
        console.log(`📋 Auth Flow Status: ${report.authFlowStatus}`);

        console.log('\n🔧 RECOMMENDATIONS:');
        report.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });

        console.log('\n📄 Detailed report saved: auth-endpoints-test-report.json');

        return report;
    }
}

// Run if called directly
if (require.main === module) {
    const tester = new AuthEndpointsTester();
    tester.runAllTests().catch(console.error);
}

module.exports = AuthEndpointsTester; 