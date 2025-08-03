#!/usr/bin/env node

/**
 * 🚨 RENDER PRODUCTION FIX TOOL
 * Diagnostic và fix cho production deployment trên Render
 */

const https = require('https');
const fs = require('fs');

const PRODUCTION_URL = 'minhonmuine.talk2go.online';
const API_BASE = `https://${PRODUCTION_URL}/api`;

class RenderProductionFix {
    constructor() {
        this.results = {
            healthCheck: null,
            corsCheck: null,
            authCheck: null,
            environmentIssues: [],
            fixCommands: []
        };
    }

    // Test server health
    async testHealth() {
        console.log('🔍 Testing server health...');

        try {
            const response = await this.makeRequest(`${API_BASE}/health`);
            if (response.statusCode === 200) {
                console.log('✅ Server is running');
                this.results.healthCheck = 'SUCCESS';
            } else {
                console.log(`❌ Server error: ${response.statusCode}`);
                this.results.healthCheck = `ERROR_${response.statusCode}`;
            }
        } catch (error) {
            console.log(`❌ Server not reachable: ${error.message}`);
            this.results.healthCheck = 'UNREACHABLE';
        }
    }

    // Test CORS configuration
    async testCORS() {
        console.log('🔍 Testing CORS configuration...');

        try {
            const response = await this.makeRequest(`${API_BASE}/health`, {
                headers: {
                    'Origin': `https://${PRODUCTION_URL}`,
                    'Access-Control-Request-Method': 'GET'
                }
            });

            const corsHeader = response.headers['access-control-allow-origin'];
            if (corsHeader === `https://${PRODUCTION_URL}`) {
                console.log('✅ CORS configured correctly');
                this.results.corsCheck = 'SUCCESS';
            } else {
                console.log(`❌ CORS misconfigured. Got: ${corsHeader}`);
                this.results.corsCheck = 'MISCONFIGURED';
                this.results.environmentIssues.push('CORS_ORIGIN needs to be set to https://minhonmuine.talk2go.online');
            }
        } catch (error) {
            console.log(`❌ CORS test failed: ${error.message}`);
            this.results.corsCheck = 'FAILED';
        }
    }

    // Test authentication endpoint
    async testAuth() {
        console.log('🔍 Testing authentication...');

        try {
            const loginData = JSON.stringify({
                username: 'admin',
                password: 'admin123'
            });

            const response = await this.makeRequest(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': `https://${PRODUCTION_URL}`
                },
                body: loginData
            });

            if (response.statusCode === 200) {
                console.log('✅ Authentication working');
                this.results.authCheck = 'SUCCESS';
            } else if (response.statusCode === 401) {
                console.log('❌ 401 Unauthorized - likely CORS or credentials issue');
                this.results.authCheck = 'UNAUTHORIZED';
                this.results.environmentIssues.push('Check CORS_ORIGIN and STAFF_ACCOUNTS configuration');
            } else {
                console.log(`❌ Auth error: ${response.statusCode}`);
                this.results.authCheck = `ERROR_${response.statusCode}`;
            }
        } catch (error) {
            console.log(`❌ Auth test failed: ${error.message}`);
            this.results.authCheck = 'FAILED';
        }
    }

    // Generate fix commands
    generateFixCommands() {
        console.log('\n🛠️ Generating fix commands...');

        this.results.fixCommands = [
            '# ===========================================',
            '# RENDER ENVIRONMENT VARIABLES FIX',
            '# Copy these to Render Dashboard → Environment',
            '# ===========================================',
            '',
            'NODE_ENV=production',
            'PORT=10000',
            'CORS_ORIGIN=https://minhonmuine.talk2go.online',
            'CLIENT_URL=https://minhonmuine.talk2go.online',
            'JWT_SECRET=minhon-hotel-production-secret-2024-minimum-32-characters',
            'STAFF_ACCOUNTS=admin:admin123,manager:manager123,frontdesk:frontdesk123',
            'ENABLE_ANALYTICS=true',
            'ENABLE_STAFF_DASHBOARD=true',
            'AUTO_MIGRATE=true',
            'LOG_LEVEL=info'
        ];

        if (this.results.environmentIssues.length > 0) {
            this.results.fixCommands.push('');
            this.results.fixCommands.push('# CRITICAL ISSUES TO FIX:');
            this.results.environmentIssues.forEach(issue => {
                this.results.fixCommands.push(`# - ${issue}`);
            });
        }
    }

    // Generate report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            productionUrl: PRODUCTION_URL,
            testResults: this.results,
            summary: {
                status: this.getOverallStatus(),
                criticalIssues: this.results.environmentIssues.length,
                recommendation: this.getRecommendation()
            }
        };

        // Save detailed report
        fs.writeFileSync('render-production-diagnostic.json', JSON.stringify(report, null, 2));

        // Save fix commands
        fs.writeFileSync('render-fix-commands.txt', this.results.fixCommands.join('\n'));

        return report;
    }

    getOverallStatus() {
        const { healthCheck, corsCheck, authCheck } = this.results;

        if (healthCheck === 'SUCCESS' && corsCheck === 'SUCCESS' && authCheck === 'SUCCESS') {
            return 'HEALTHY';
        } else if (healthCheck === 'UNREACHABLE') {
            return 'SERVER_DOWN';
        } else if (corsCheck === 'MISCONFIGURED' || authCheck === 'UNAUTHORIZED') {
            return 'CONFIGURATION_ISSUE';
        } else {
            return 'NEEDS_INVESTIGATION';
        }
    }

    getRecommendation() {
        const status = this.getOverallStatus();

        switch (status) {
            case 'HEALTHY':
                return 'All systems operational';
            case 'SERVER_DOWN':
                return 'Check Render deployment status and logs';
            case 'CONFIGURATION_ISSUE':
                return 'Apply fix commands to Render environment variables and redeploy';
            default:
                return 'Review diagnostic results and check Render logs';
        }
    }

    // Helper method for HTTP requests
    makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const req = https.request(url, options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                });
            });

            req.on('error', reject);

            if (options.body) {
                req.write(options.body);
            }

            req.end();
        });
    }

    // Run complete diagnostic
    async runDiagnostic() {
        console.log(`🚨 RENDER PRODUCTION DIAGNOSTIC: ${PRODUCTION_URL}\n`);
        console.log('='.repeat(60));

        await this.testHealth();
        await this.testCORS();
        await this.testAuth();

        this.generateFixCommands();
        const report = this.generateReport();

        console.log('\n' + '='.repeat(60));
        console.log('📊 DIAGNOSTIC SUMMARY:');
        console.log('='.repeat(60));
        console.log(`🌐 URL: https://${PRODUCTION_URL}`);
        console.log(`📡 Health: ${this.results.healthCheck}`);
        console.log(`🔒 CORS: ${this.results.corsCheck}`);
        console.log(`🔐 Auth: ${this.results.authCheck}`);
        console.log(`🚨 Issues: ${this.results.environmentIssues.length}`);
        console.log(`📋 Status: ${report.summary.status}`);
        console.log(`💡 Action: ${report.summary.recommendation}`);

        if (this.results.environmentIssues.length > 0) {
            console.log('\n🔧 CRITICAL ISSUES:');
            this.results.environmentIssues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
        }

        console.log('\n📄 Files generated:');
        console.log('   • render-production-diagnostic.json (detailed report)');
        console.log('   • render-fix-commands.txt (environment variables)');

        console.log('\n🎯 NEXT STEPS:');
        console.log('   1. Open render-fix-commands.txt');
        console.log('   2. Copy content to Render → Environment Variables');
        console.log('   3. Click "Manual Deploy" in Render');
        console.log('   4. Wait 2-3 minutes for deployment');
        console.log('   5. Test website again');

        return report;
    }
}

// Run if called directly
if (require.main === module) {
    const fixer = new RenderProductionFix();
    fixer.runDiagnostic().catch(console.error);
}

module.exports = RenderProductionFix; 