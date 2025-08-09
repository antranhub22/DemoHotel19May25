#!/usr/bin/env node

/**
 * ================================================================
 * 🏨 MI NHON HOTEL - PRE-DEPLOYMENT TESTING SCRIPT
 * ================================================================
 * Purpose: Comprehensive testing before production deployment
 * Usage: node scripts/pre-deployment-test.cjs
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.cyan}${colors.bright}🔍 ${msg}${colors.reset}`)
};

// Test steps configuration
const TEST_STEPS = [
    {
        name: 'Environment Validation',
        command: 'node scripts/validate-env.cjs',
        critical: false
    },
    {
        name: 'Production Parity Check',
        command: 'node scripts/validate-prod-parity.cjs',
        critical: true
    },
    {
        name: 'TypeScript Build Check',
        command: 'npx tsc --noEmit',
        critical: false
    },
    {
        name: 'Production Build',
        command: 'npm run build:production',
        critical: true
    },
    {
        name: 'Database Schema Validation',
        command: 'npx prisma validate',
        critical: true
    },
    {
        name: 'Prisma Generate',
        command: 'npx prisma generate',
        critical: false
    },
    {
        name: 'ESLint Check',
        command: 'npm run lint --silent',
        critical: false
    }
];

// Run shell command safely
function runCommand(command, { timeout = 60000, silent = false } = {}) {
    try {
        const output = execSync(command, {
            timeout,
            encoding: 'utf8',
            stdio: silent ? 'pipe' : 'inherit'
        });
        return { success: true, output };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            output: error.stdout || error.stderr || ''
        };
    }
}

// Check file system requirements
function validateFileSystem() {
    log.section('File System Validation');

    const requiredFiles = [
        { path: '.env.local', name: 'Local environment file' },
        { path: '.env.production-local', name: 'Production-local environment file' },
        { path: '.env.example', name: 'Environment template' },
        { path: 'vite.config.ts', name: 'Vite configuration' },
        { path: 'prisma/schema.prisma', name: 'Prisma schema' },
        { path: 'package.json', name: 'Package configuration' }
    ];

    let allFilesExist = true;

    requiredFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
            log.success(`${file.name}: Found`);
        } else {
            log.error(`${file.name}: Missing (${file.path})`);
            allFilesExist = false;
        }
    });

    return allFilesExist;
}

// Check database connectivity
function validateDatabaseConnection() {
    log.section('Database Connection Test');

    try {
        const result = runCommand('npx prisma db push --accept-data-loss', { silent: true });

        if (result.success || result.output.includes('already in sync')) {
            log.success('Database connection: OK');
            return true;
        } else {
            log.error(`Database connection failed: ${result.error}`);
            return false;
        }
    } catch (error) {
        log.error(`Database validation error: ${error.message}`);
        return false;
    }
}

// Run all test steps
function runTestSteps() {
    log.section('Running Test Suite');

    let criticalFailures = 0;
    let warnings = 0;
    const results = [];

    TEST_STEPS.forEach((step, index) => {
        log.info(`Step ${index + 1}/${TEST_STEPS.length}: ${step.name}`);

        const result = runCommand(step.command, { silent: true });

        if (result.success) {
            log.success(`${step.name}: PASSED`);
            results.push({ step: step.name, status: 'PASSED' });
        } else {
            if (step.critical) {
                log.error(`${step.name}: FAILED (Critical)`);
                criticalFailures++;
                results.push({ step: step.name, status: 'FAILED', critical: true });
            } else {
                log.warning(`${step.name}: FAILED (Warning)`);
                warnings++;
                results.push({ step: step.name, status: 'WARNING' });
            }
        }
    });

    return { criticalFailures, warnings, results };
}

// Performance checks
function validatePerformance() {
    log.section('Performance Validation');

    try {
        // Check bundle size
        const distPath = path.join(process.cwd(), 'dist', 'public', 'assets');
        if (fs.existsSync(distPath)) {
            const files = fs.readdirSync(distPath);
            const jsFiles = files.filter(f => f.endsWith('.js'));

            if (jsFiles.length > 0) {
                log.success(`Bundle files generated: ${jsFiles.length} JS files`);

                // Check main bundle size
                const mainBundle = jsFiles.find(f => f.includes('index-'));
                if (mainBundle) {
                    const bundlePath = path.join(distPath, mainBundle);
                    const stats = fs.statSync(bundlePath);
                    const sizeKB = Math.round(stats.size / 1024);

                    if (sizeKB < 2000) { // Less than 2MB
                        log.success(`Main bundle size: ${sizeKB}KB (Good)`);
                    } else {
                        log.warning(`Main bundle size: ${sizeKB}KB (Large)`);
                    }
                }
                return true;
            }
        }

        log.warning('Bundle files not found - build may have failed');
        return false;
    } catch (error) {
        log.error(`Performance check failed: ${error.message}`);
        return false;
    }
}

// Security validation
function validateSecurity() {
    log.section('Security Validation');

    try {
        // Check for common security issues
        const envContent = fs.readFileSync('.env.local', 'utf8');

        // Check JWT secret strength
        const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
        if (jwtMatch && jwtMatch[1].length >= 32) {
            log.success('JWT Secret: Strong (32+ characters)');
        } else {
            log.error('JWT Secret: Weak (less than 32 characters)');
            return false;
        }

        // Check database connection security
        const dbMatch = envContent.match(/DATABASE_URL=(.+)/);
        if (dbMatch && dbMatch[1].includes('postgresql://')) {
            log.success('Database: PostgreSQL (Production-ready)');
        } else {
            log.warning('Database: Not PostgreSQL');
        }

        return true;
    } catch (error) {
        log.error(`Security validation failed: ${error.message}`);
        return false;
    }
}

// Generate deployment report
function generateDeploymentReport(testResults) {
    const reportPath = path.join(process.cwd(), 'pre-deployment-report.txt');

    const report = `
# 🏨 MI NHON HOTEL - PRE-DEPLOYMENT REPORT
Generated: ${new Date().toISOString()}

## Test Results Summary
${testResults.results.map(r => `- ${r.step}: ${r.status}${r.critical ? ' (Critical)' : ''}`).join('\n')}

## Statistics
- Critical Failures: ${testResults.criticalFailures}
- Warnings: ${testResults.warnings}
- Total Tests: ${testResults.results.length}

## Deployment Readiness
${testResults.criticalFailures === 0 ? '✅ READY FOR DEPLOYMENT' : '❌ NOT READY - Fix critical issues first'}

## Next Steps
${testResults.criticalFailures === 0
            ? '1. Review warnings if any\n2. Deploy to production\n3. Monitor deployment'
            : '1. Fix all critical failures\n2. Re-run pre-deployment test\n3. Ensure all tests pass'
        }
`;

    fs.writeFileSync(reportPath, report);
    log.info(`Deployment report generated: ${reportPath}`);
}

// Main execution
function main() {
    console.log(`${colors.cyan}${colors.bright}`);
    console.log('================================================================');
    console.log('🏨 MI NHON HOTEL - PRE-DEPLOYMENT TESTING');
    console.log('================================================================');
    console.log(`${colors.reset}\n`);

    // Run all validations
    const fileSystemOK = validateFileSystem();
    const databaseOK = validateDatabaseConnection();
    const testResults = runTestSteps();
    const performanceOK = validatePerformance();
    const securityOK = validateSecurity();

    // Generate report
    generateDeploymentReport(testResults);

    // Final summary
    log.section('Final Summary');

    const allCriticalPassed = fileSystemOK && databaseOK && testResults.criticalFailures === 0 && securityOK;

    if (allCriticalPassed) {
        log.success('🎉 ALL CRITICAL TESTS PASSED!');
        log.success('🚀 Ready for production deployment');

        if (testResults.warnings > 0 || !performanceOK) {
            log.warning(`⚠️  ${testResults.warnings} warnings found - review recommended`);
        }
    } else {
        log.error('🚨 DEPLOYMENT BLOCKED');
        log.error('💡 Fix all critical issues before deploying');
        process.exit(1);
    }

    console.log('\n================================================================\n');
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main };