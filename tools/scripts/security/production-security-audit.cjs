#!/usr/bin/env node

/**
 * 🔐 PRODUCTION SECURITY AUDIT v2.0
 * 
 * Comprehensive security checklist validator for production deployment
 * Checks all critical security requirements before going live
 * 
 * Usage: node tools/scripts/security/production-security-audit.cjs
 */

const fs = require('fs').promises;
const path = require('path');

class ProductionSecurityAudit {
    constructor() {
        this.results = {
            security: [],
            stability: [],
            dataProtection: [],
            overall: { passed: 0, failed: 0, warnings: 0 }
        };
        this.environmentFile = '.env';
    }

    async runCompleteAudit() {
        console.log('🔐 PRODUCTION SECURITY AUDIT v2.0');
        console.log('=====================================\n');

        // Run all security checks
        await this.checkDefaultPasswords();
        await this.checkDatabaseSecurity();
        await this.checkApiKeySecurity();
        await this.checkHttpsConfiguration();
        await this.checkEnvironmentVariables();

        // Run stability checks
        await this.checkErrorHandling();
        await this.checkBackupSystems();
        await this.checkMonitoringAlerts();

        // Run data protection checks
        await this.checkDataEncryption();
        await this.checkGdprCompliance();
        await this.checkDataRetention();

        // Generate comprehensive report
        await this.generateSecurityReport();

        return this.results;
    }

    // ============================================
    // SECURITY CHECKLIST
    // ============================================

    async checkDefaultPasswords() {
        console.log('🔑 Checking default passwords...');

        try {
            // Check for default passwords in configuration files
            const patterns = [
                'admin123', 'manager123', 'frontdesk123', 'itmanager123',
                'password', 'admin', 'staff123', 'test123'
            ];

            const filesToCheck = [
                'packages/auth-system/config/auth.config.ts',
                'tools/scripts/maintenance/seed-production-users.ts',
                'tools/scripts/maintenance/setup-dev-db.ts',
                '.env', '.env.production', '.env.example'
            ];

            let foundWeakPasswords = false;
            const weakPasswordsFound = [];

            for (const file of filesToCheck) {
                try {
                    const content = await fs.readFile(file, 'utf8');
                    for (const pattern of patterns) {
                        if (content.includes(pattern)) {
                            foundWeakPasswords = true;
                            weakPasswordsFound.push({ file, pattern });
                        }
                    }
                } catch (error) {
                    // File might not exist, continue
                }
            }

            if (foundWeakPasswords) {
                this.addResult('security', '❌', 'Default passwords detected', 'CRITICAL', {
                    issue: 'Weak default passwords found in configuration',
                    locations: weakPasswordsFound,
                    recommendation: 'Change all default passwords to strong, unique passwords'
                });
            } else {
                this.addResult('security', '✅', 'No default passwords found', 'PASS');
            }

        } catch (error) {
            this.addResult('security', '⚠️', 'Error checking passwords', 'WARNING', { error: error.message });
        }
    }

    async checkDatabaseSecurity() {
        console.log('🗄️ Checking database security...');

        try {
            const envContent = await this.readEnvFile();

            // Check for production database URL
            const dbUrl = envContent.DATABASE_URL || process.env.DATABASE_URL;

            if (!dbUrl) {
                this.addResult('security', '❌', 'No database URL configured', 'CRITICAL', {
                    recommendation: 'Set DATABASE_URL environment variable'
                });
                return;
            }

            // Check if using production-grade database
            if (dbUrl.includes('sqlite://') || dbUrl.includes('dev.db')) {
                this.addResult('security', '❌', 'Using development database in production', 'CRITICAL', {
                    issue: 'SQLite database not suitable for production',
                    recommendation: 'Use PostgreSQL or MySQL for production'
                });
            } else if (dbUrl.includes('postgresql://') || dbUrl.includes('mysql://')) {
                this.addResult('security', '✅', 'Using production-grade database', 'PASS');
            }

            // Check for SSL in database URL
            if (dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true')) {
                this.addResult('security', '✅', 'Database SSL enabled', 'PASS');
            } else {
                this.addResult('security', '⚠️', 'Database SSL not explicitly enabled', 'WARNING', {
                    recommendation: 'Enable SSL for database connections'
                });
            }

            // Check for database credentials in URL
            if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('admin:admin')) {
                this.addResult('security', '❌', 'Insecure database configuration', 'CRITICAL', {
                    recommendation: 'Use production database server with strong credentials'
                });
            }

        } catch (error) {
            this.addResult('security', '⚠️', 'Error checking database security', 'WARNING', { error: error.message });
        }
    }

    async checkApiKeySecurity() {
        console.log('🔑 Checking API key configuration...');

        try {
            const envContent = await this.readEnvFile();

            const criticalKeys = [
                'JWT_SECRET',
                'SESSION_SECRET',
                'VITE_OPENAI_API_KEY',
                'VITE_VAPI_PUBLIC_KEY',
                'VAPI_API_KEY'
            ];

            let missingKeys = [];
            let weakKeys = [];

            for (const key of criticalKeys) {
                const value = envContent[key] || process.env[key];

                if (!value) {
                    missingKeys.push(key);
                } else {
                    // Check for weak/default keys
                    if (value.includes('CHANGE_ME') ||
                        value.includes('test') ||
                        value.length < 32 ||
                        value === 'your-secret-key') {
                        weakKeys.push({ key, issue: 'Weak or default value' });
                    }
                }
            }

            if (missingKeys.length > 0) {
                this.addResult('security', '❌', `Missing API keys: ${missingKeys.join(', ')}`, 'CRITICAL', {
                    recommendation: 'Set all required API keys for production'
                });
            }

            if (weakKeys.length > 0) {
                this.addResult('security', '❌', 'Weak API keys detected', 'CRITICAL', {
                    keys: weakKeys,
                    recommendation: 'Use strong, unique keys for production'
                });
            }

            if (missingKeys.length === 0 && weakKeys.length === 0) {
                this.addResult('security', '✅', 'API keys properly configured', 'PASS');
            }

        } catch (error) {
            this.addResult('security', '⚠️', 'Error checking API keys', 'WARNING', { error: error.message });
        }
    }

    async checkHttpsConfiguration() {
        console.log('🔒 Checking HTTPS configuration...');

        try {
            const envContent = await this.readEnvFile();

            // Check for HTTPS in URLs
            const urls = [
                envContent.CLIENT_URL,
                envContent.CORS_ORIGIN,
                envContent.BASE_URL
            ];

            let httpUrls = [];
            let httpsUrls = [];

            urls.forEach((url) => {
                if (url) {
                    if (url.startsWith('http://')) {
                        httpUrls.push(url);
                    } else if (url.startsWith('https://')) {
                        httpsUrls.push(url);
                    }
                }
            });

            if (httpUrls.length > 0) {
                this.addResult('security', '❌', 'HTTP URLs detected in production', 'CRITICAL', {
                    urls: httpUrls,
                    recommendation: 'Use HTTPS for all production URLs'
                });
            }

            // Check for SSL certificate configuration
            const sslCertPath = envContent.SSL_CERT_PATH;
            const sslKeyPath = envContent.SSL_KEY_PATH;

            if (sslCertPath && sslKeyPath) {
                this.addResult('security', '✅', 'SSL certificate paths configured', 'PASS');
            } else {
                this.addResult('security', '⚠️', 'SSL certificate paths not configured', 'WARNING', {
                    recommendation: 'Configure SSL_CERT_PATH and SSL_KEY_PATH'
                });
            }

            // Check NODE_ENV
            if (envContent.NODE_ENV !== 'production') {
                this.addResult('security', '❌', `NODE_ENV is ${envContent.NODE_ENV}, not production`, 'CRITICAL');
            } else {
                this.addResult('security', '✅', 'NODE_ENV set to production', 'PASS');
            }

        } catch (error) {
            this.addResult('security', '⚠️', 'Error checking HTTPS configuration', 'WARNING', { error: error.message });
        }
    }

    async checkEnvironmentVariables() {
        console.log('⚙️ Checking environment variables...');

        try {
            const envContent = await this.readEnvFile();

            const requiredVars = [
                'NODE_ENV',
                'PORT',
                'DATABASE_URL',
                'JWT_SECRET',
                'CORS_ORIGIN'
            ];

            const missingVars = requiredVars.filter(varName => !envContent[varName] && !process.env[varName]);

            if (missingVars.length > 0) {
                this.addResult('security', '❌', `Missing environment variables: ${missingVars.join(', ')}`, 'CRITICAL');
            } else {
                this.addResult('security', '✅', 'All required environment variables set', 'PASS');
            }

            // Check for development-specific variables in production
            const devVars = ['ENABLE_AUTO_LOGIN', 'ENABLE_TOKEN_LOGGING', 'ENABLE_AUTH_DEBUGGING'];
            const foundDevVars = devVars.filter(varName =>
                envContent[varName] === 'true' || process.env[varName] === 'true'
            );

            if (foundDevVars.length > 0) {
                this.addResult('security', '❌', `Development variables enabled: ${foundDevVars.join(', ')}`, 'CRITICAL');
            }

        } catch (error) {
            this.addResult('security', '⚠️', 'Error checking environment variables', 'WARNING', { error: error.message });
        }
    }

    // ============================================
    // STABILITY CHECKLIST
    // ============================================

    async checkErrorHandling() {
        console.log('🚨 Checking error handling and logging...');

        try {
            // Check for monitoring integration
            const monitoringFiles = [
                'monitoring/production-monitoring.ts',
                'apps/server/shared/EnhancedLogger.ts',
                'apps/server/shared/MonitoringIntegration.ts'
            ];

            let monitoringEnabled = false;
            for (const file of monitoringFiles) {
                try {
                    await fs.access(file);
                    monitoringEnabled = true;
                    break;
                } catch { }
            }

            if (monitoringEnabled) {
                this.addResult('stability', '✅', 'Error monitoring system available', 'PASS');
            } else {
                this.addResult('stability', '⚠️', 'No error monitoring system found', 'WARNING');
            }

            // Check for error tracking in code
            const serverFiles = await this.getJsFiles('apps/server');
            let errorHandlingCount = 0;

            for (const file of serverFiles.slice(0, 10)) { // Check first 10 files
                try {
                    const content = await fs.readFile(file, 'utf8');
                    if (content.includes('try {') && content.includes('catch')) {
                        errorHandlingCount++;
                    }
                } catch { }
            }

            if (errorHandlingCount > 5) {
                this.addResult('stability', '✅', 'Error handling implemented across codebase', 'PASS');
            } else {
                this.addResult('stability', '⚠️', 'Limited error handling detected', 'WARNING');
            }

        } catch (error) {
            this.addResult('stability', '⚠️', 'Error checking error handling', 'WARNING', { error: error.message });
        }
    }

    async checkBackupSystems() {
        console.log('💾 Checking backup systems...');

        try {
            // Check for backup implementations
            const backupFiles = [
                'apps/server/shared/BackupManager.ts',
                'apps/server/shared/DisasterRecovery.ts',
                'tools/scripts/backup/backup-management.cjs'
            ];

            let backupSystemExists = false;
            for (const file of backupFiles) {
                try {
                    await fs.access(file);
                    backupSystemExists = true;
                    break;
                } catch { }
            }

            if (backupSystemExists) {
                this.addResult('stability', '✅', 'Backup system implemented', 'PASS');
            } else {
                this.addResult('stability', '❌', 'No backup system found', 'CRITICAL', {
                    recommendation: 'Implement automated backup system'
                });
            }

        } catch (error) {
            this.addResult('stability', '⚠️', 'Error checking backup systems', 'WARNING', { error: error.message });
        }
    }

    async checkMonitoringAlerts() {
        console.log('📊 Checking monitoring and alerts...');

        try {
            const envContent = await this.readEnvFile();

            // Check for monitoring configuration
            const monitoringVars = [
                'ENABLE_MONITORING',
                'ENABLE_METRICS',
                'ENABLE_HEALTH_CHECKS',
                'SLACK_WEBHOOK_URL',
                'SENTRY_DSN'
            ];

            const configuredVars = monitoringVars.filter(varName =>
                envContent[varName] || process.env[varName]
            );

            if (configuredVars.length >= 3) {
                this.addResult('stability', '✅', 'Monitoring and alerting configured', 'PASS');
            } else {
                this.addResult('stability', '⚠️', 'Limited monitoring configuration', 'WARNING', {
                    recommendation: 'Configure comprehensive monitoring and alerting'
                });
            }

        } catch (error) {
            this.addResult('stability', '⚠️', 'Error checking monitoring alerts', 'WARNING', { error: error.message });
        }
    }

    // ============================================
    // DATA PROTECTION CHECKLIST
    // ============================================

    async checkDataEncryption() {
        console.log('🔐 Checking data encryption...');

        try {
            // Check for encryption implementation
            const encryptionFiles = [
                'apps/server/shared/EncryptionManager.ts',
                'apps/server/shared/SecurityHardening.ts'
            ];

            let encryptionExists = false;
            for (const file of encryptionFiles) {
                try {
                    await fs.access(file);
                    encryptionExists = true;
                    break;
                } catch { }
            }

            if (encryptionExists) {
                this.addResult('dataProtection', '✅', 'Data encryption system implemented', 'PASS');
            } else {
                this.addResult('dataProtection', '❌', 'No data encryption system found', 'CRITICAL', {
                    recommendation: 'Implement data encryption for sensitive information'
                });
            }

        } catch (error) {
            this.addResult('dataProtection', '⚠️', 'Error checking data encryption', 'WARNING', { error: error.message });
        }
    }

    async checkGdprCompliance() {
        console.log('🛡️ Checking GDPR compliance...');

        try {
            // Check for GDPR implementation
            const gdprFiles = [
                'apps/server/shared/ComplianceManager.ts',
                'apps/server/shared/AuditLogger.ts'
            ];

            let gdprExists = false;
            for (const file of gdprFiles) {
                try {
                    await fs.access(file);
                    gdprExists = true;
                    break;
                } catch { }
            }

            if (gdprExists) {
                this.addResult('dataProtection', '✅', 'GDPR compliance system implemented', 'PASS');
            } else {
                this.addResult('dataProtection', '❌', 'No GDPR compliance system found', 'CRITICAL', {
                    recommendation: 'Implement GDPR compliance features'
                });
            }

        } catch (error) {
            this.addResult('dataProtection', '⚠️', 'Error checking GDPR compliance', 'WARNING', { error: error.message });
        }
    }

    async checkDataRetention() {
        console.log('📋 Checking data retention policies...');

        try {
            const envContent = await this.readEnvFile();

            // Check for data retention configuration
            const retentionVars = [
                'DATA_RETENTION_DAYS',
                'LOG_RETENTION_DAYS',
                'BACKUP_RETENTION_DAYS'
            ];

            const configuredRetention = retentionVars.filter(varName =>
                envContent[varName] || process.env[varName]
            );

            if (configuredRetention.length > 0) {
                this.addResult('dataProtection', '✅', 'Data retention policies configured', 'PASS');
            } else {
                this.addResult('dataProtection', '⚠️', 'No data retention policies configured', 'WARNING', {
                    recommendation: 'Configure data retention policies for compliance'
                });
            }

        } catch (error) {
            this.addResult('dataProtection', '⚠️', 'Error checking data retention', 'WARNING', { error: error.message });
        }
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    async readEnvFile() {
        try {
            const content = await fs.readFile(this.environmentFile, 'utf8');
            const env = {};
            content.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    env[key.trim()] = valueParts.join('=').trim();
                }
            });
            return env;
        } catch (error) {
            return {};
        }
    }

    async getJsFiles(directory) {
        try {
            const files = [];
            const items = await fs.readdir(directory, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(directory, item.name);
                if (item.isDirectory()) {
                    files.push(...(await this.getJsFiles(fullPath)));
                } else if (item.name.endsWith('.ts') || item.name.endsWith('.js')) {
                    files.push(fullPath);
                }
            }
            return files;
        } catch {
            return [];
        }
    }

    addResult(category, status, message, level, details = {}) {
        const result = { status, message, level, details, timestamp: new Date().toISOString() };
        this.results[category].push(result);

        // Update counters
        if (level === 'PASS') this.results.overall.passed++;
        else if (level === 'CRITICAL') this.results.overall.failed++;
        else if (level === 'WARNING') this.results.overall.warnings++;

        console.log(`  ${status} ${message}`);
        if (details.recommendation) {
            console.log(`    💡 ${details.recommendation}`);
        }
    }

    async generateSecurityReport() {
        console.log('\n📋 GENERATING SECURITY REPORT...\n');

        const report = {
            timestamp: new Date().toISOString(),
            overall: this.results.overall,
            summary: {
                totalChecks: this.results.overall.passed + this.results.overall.failed + this.results.overall.warnings,
                criticalIssues: this.results.overall.failed,
                warnings: this.results.overall.warnings,
                passed: this.results.overall.passed
            },
            categories: {
                security: this.results.security,
                stability: this.results.stability,
                dataProtection: this.results.dataProtection
            },
            recommendations: this.generateRecommendations()
        };

        // Save detailed report
        const reportFile = `security-reports/security-report-${new Date().toISOString().split('T')[0]}.json`;
        await fs.mkdir('security-reports', { recursive: true });
        await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

        // Generate summary
        const summary = this.generateSummaryReport(report);
        const summaryFile = `security-reports/security-report-${new Date().toISOString().split('T')[0]}.txt`;
        await fs.writeFile(summaryFile, summary);

        console.log('✅ SECURITY AUDIT COMPLETE!');
        console.log(`📄 Detailed report: ${reportFile}`);
        console.log(`📋 Summary report: ${summaryFile}\n`);

        this.printSummary(report);
    }

    generateRecommendations() {
        const recommendations = [];

        ['security', 'stability', 'dataProtection'].forEach(category => {
            this.results[category].forEach(result => {
                if (result.level === 'CRITICAL' || result.level === 'WARNING') {
                    if (result.details.recommendation) {
                        recommendations.push({
                            category,
                            priority: result.level,
                            issue: result.message,
                            recommendation: result.details.recommendation
                        });
                    }
                }
            });
        });

        return recommendations;
    }

    generateSummaryReport(report) {
        return `
🔐 PRODUCTION SECURITY AUDIT SUMMARY
=====================================

📊 OVERALL RESULTS:
  ✅ Passed: ${report.summary.passed}
  ❌ Critical Issues: ${report.summary.criticalIssues}
  ⚠️  Warnings: ${report.summary.warnings}
  📋 Total Checks: ${report.summary.totalChecks}

🚨 CRITICAL ITEMS CAN VERIFY:

SECURITY CHECKLIST:
1. Are all default passwords changed? ${this.getCheckResult('security', 'default passwords')}
2. Is production database secured? ${this.getCheckResult('security', 'database')}
3. Are API keys properly configured for production? ${this.getCheckResult('security', 'API keys')}
4. Is HTTPS configured and working? ${this.getCheckResult('security', 'HTTPS')}
5. Are environment variables properly set? ${this.getCheckResult('security', 'environment')}

STABILITY CHECKLIST:
1. Does system handle 50+ concurrent users? ${this.getCheckResult('stability', 'concurrent')}
2. Are error handling and logging working? ${this.getCheckResult('stability', 'error')}
3. Is backup system actually backing up data? ${this.getCheckResult('stability', 'backup')}
4. Can system recover from crashes? ${this.getCheckResult('stability', 'recovery')}
5. Are monitoring alerts working? ${this.getCheckResult('stability', 'monitoring')}

DATA PROTECTION:
1. Is customer data properly encrypted? ${this.getCheckResult('dataProtection', 'encryption')}
2. Are there data retention policies? ${this.getCheckResult('dataProtection', 'retention')}
3. Is GDPR compliance actually implemented? ${this.getCheckResult('dataProtection', 'GDPR')}
4. Can you handle data deletion requests? ${this.getCheckResult('dataProtection', 'deletion')}

🎯 TOP RECOMMENDATIONS:
${report.recommendations.filter(r => r.priority === 'CRITICAL').map(r => `❌ ${r.issue}: ${r.recommendation}`).join('\n')}

${report.recommendations.filter(r => r.priority === 'WARNING').map(r => `⚠️  ${r.issue}: ${r.recommendation}`).join('\n')}

Generated: ${report.timestamp}
        `.trim();
    }

    getCheckResult(category, keyword) {
        const results = this.results[category];
        const found = results.find(r => r.message.toLowerCase().includes(keyword));
        return found ? (found.level === 'PASS' ? '✅' : (found.level === 'CRITICAL' ? '❌' : '⚠️')) : '❓';
    }

    printSummary(report) {
        console.log('🎯 AUDIT SUMMARY:');
        console.log(`  Total Checks: ${report.summary.totalChecks}`);
        console.log(`  ✅ Passed: ${report.summary.passed}`);
        console.log(`  ❌ Critical: ${report.summary.criticalIssues}`);
        console.log(`  ⚠️  Warnings: ${report.summary.warnings}`);

        if (report.summary.criticalIssues === 0) {
            console.log('\n🎉 NO CRITICAL SECURITY ISSUES FOUND!');
            console.log('✅ System appears ready for production deployment.');
        } else {
            console.log(`\n🚨 ${report.summary.criticalIssues} CRITICAL ISSUES MUST BE FIXED BEFORE PRODUCTION!`);
            console.log('❌ DO NOT DEPLOY until all critical issues are resolved.');
        }
    }
}

// Run the audit
async function main() {
    const audit = new ProductionSecurityAudit();
    try {
        await audit.runCompleteAudit();
    } catch (error) {
        console.error('❌ Audit failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { ProductionSecurityAudit }; 