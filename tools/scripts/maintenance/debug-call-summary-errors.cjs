#!/usr/bin/env node

/**
 * Debug Script: Call Summary Generation Errors
 * 
 * Kiểm tra nhanh các nguyên nhân gây lỗi khi generate call summary sau khi nhấn nút Siri
 * 
 * Usage: node tools/scripts/maintenance/debug-call-summary-errors.cjs
 */

const fs = require('fs');
const path = require('path');

const LOG_PREFIX = '🔍 [Debug Call Summary]';

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

function log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const color = colors[level] || colors.reset;
    console.log(`${color}${LOG_PREFIX} [${timestamp}] ${message}${colors.reset}`, ...args);
}

function checkEnvironmentVariables() {
    log('blue', '🔧 CATEGORY 1: Environment Variables Check');

    const requiredEnvVars = [
        'VITE_OPENAI_API_KEY',
        'VITE_VAPI_PUBLIC_KEY',
        'VITE_VAPI_ASSISTANT_ID',
        'DATABASE_URL',
        'JWT_SECRET',
        'NODE_ENV'
    ];

    const issues = [];

    requiredEnvVars.forEach(envVar => {
        const value = process.env[envVar];
        if (!value) {
            issues.push(`❌ ${envVar} - MISSING`);
        } else if (value.includes('placeholder') || value.includes('your-') || value === 'undefined') {
            issues.push(`⚠️ ${envVar} - PLACEHOLDER VALUE`);
        } else {
            log('green', `✅ ${envVar} - OK`);
        }
    });

    return issues;
}

function checkFileStructure() {
    log('blue', '🗂️ CATEGORY 2: File Structure Check');

    const criticalFiles = [
        'apps/client/src/context/RefactoredAssistantContext.tsx',
        'apps/client/src/hooks/useConfirmHandler.ts',
        'apps/client/src/components/features/voice-assistant/siri/SiriButtonContainer.tsx',
        'apps/server/routes/api.ts',
        'apps/server/controllers/callsController.ts',
        'packages/shared/db/schema.ts',
        'apps/client/src/lib/authHelper.ts'
    ];

    const issues = [];

    criticalFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            log('green', `✅ ${filePath} - EXISTS`);
        } else {
            issues.push(`❌ ${filePath} - MISSING`);
        }
    });

    return issues;
}

function checkDatabaseConfiguration() {
    log('blue', '💾 CATEGORY 3: Database Configuration Check');

    const issues = [];

    // Check if database file exists for SQLite
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.startsWith('sqlite://')) {
        const dbPath = dbUrl.replace('sqlite://', '');
        if (fs.existsSync(dbPath)) {
            log('green', `✅ SQLite database exists: ${dbPath}`);
        } else {
            issues.push(`❌ SQLite database missing: ${dbPath}`);
        }
    } else if (dbUrl && dbUrl.startsWith('postgresql://')) {
        log('green', `✅ PostgreSQL URL configured`);
    } else {
        issues.push(`❌ DATABASE_URL not properly configured`);
    }

    // Check schema file
    const schemaPath = 'packages/shared/db/schema.ts';
    if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        if (schemaContent.includes('call_summaries')) {
            log('green', `✅ call_summaries table defined in schema`);
        } else {
            issues.push(`❌ call_summaries table missing from schema`);
        }
    }

    return issues;
}

function checkAPIEndpoints() {
    log('blue', '🌐 CATEGORY 4: API Endpoints Check');

    const issues = [];

    const apiFile = 'apps/server/routes/api.ts';
    if (fs.existsSync(apiFile)) {
        const apiContent = fs.readFileSync(apiFile, 'utf8');

        const requiredEndpoints = [
            '/store-summary',
            '/transcripts',
            '/analytics'
        ];

        requiredEndpoints.forEach(endpoint => {
            if (apiContent.includes(endpoint)) {
                log('green', `✅ API endpoint ${endpoint} - DEFINED`);
            } else {
                issues.push(`❌ API endpoint ${endpoint} - MISSING`);
            }
        });
    } else {
        issues.push(`❌ API routes file missing`);
    }

    return issues;
}

function checkAuthenticationFiles() {
    log('blue', '🔐 CATEGORY 5: Authentication Files Check');

    const issues = [];

    const authFiles = [
        'apps/client/src/lib/authHelper.ts',
        'packages/auth-system/middleware/auth.middleware.ts',
        'packages/auth-system/services/UnifiedAuthService.ts'
    ];

    authFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');

            if (content.includes('authenticatedFetch')) {
                log('green', `✅ ${filePath} - AUTH FUNCTIONS OK`);
            } else {
                issues.push(`⚠️ ${filePath} - AUTH FUNCTIONS INCOMPLETE`);
            }
        } else {
            issues.push(`❌ ${filePath} - MISSING`);
        }
    });

    return issues;
}

function checkVapiIntegration() {
    log('blue', '📞 CATEGORY 6: Vapi Integration Check');

    const issues = [];

    const vapiFile = 'apps/server/services/vapiIntegration.ts';
    if (fs.existsSync(vapiFile)) {
        const content = fs.readFileSync(vapiFile, 'utf8');

        if (content.includes('VapiIntegrationService')) {
            log('green', `✅ VapiIntegrationService - DEFINED`);
        } else {
            issues.push(`❌ VapiIntegrationService - MISSING`);
        }

        if (content.includes('createAssistant')) {
            log('green', `✅ createAssistant method - DEFINED`);
        } else {
            issues.push(`❌ createAssistant method - MISSING`);
        }
    } else {
        issues.push(`❌ Vapi integration service - MISSING`);
    }

    return issues;
}

function checkSiriButtonComponents() {
    log('blue', '🎯 CATEGORY 7: Siri Button Components Check');

    const issues = [];

    const siriFiles = [
        'apps/client/src/components/features/voice-assistant/siri/SiriButton.ts',
        'apps/client/src/components/features/voice-assistant/siri/SiriButtonContainer.tsx',
        'apps/client/src/components/features/voice-assistant/siri/SiriCallButton.tsx'
    ];

    siriFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');

            if (content.includes('onCallStart') && content.includes('onCallEnd')) {
                log('green', `✅ ${path.basename(filePath)} - CALL HANDLERS OK`);
            } else {
                issues.push(`⚠️ ${path.basename(filePath)} - CALL HANDLERS INCOMPLETE`);
            }
        } else {
            issues.push(`❌ ${path.basename(filePath)} - MISSING`);
        }
    });

    return issues;
}

function generateSummaryReport(allIssues) {
    log('bright', '\n📋 SUMMARY REPORT');

    const totalIssues = allIssues.flat().length;

    if (totalIssues === 0) {
        log('green', '🎉 NO ISSUES FOUND - All basic checks passed!');
        log('yellow', '💡 If you still have errors, check:');
        log('yellow', '   - Browser DevTools Console for runtime errors');
        log('yellow', '   - Network tab for failed API requests');
        log('yellow', '   - Authentication tokens in localStorage');
        log('yellow', '   - Server logs for backend errors');
    } else {
        log('red', `🚨 FOUND ${totalIssues} POTENTIAL ISSUES:`);
        allIssues.flat().forEach(issue => {
            log('red', `   ${issue}`);
        });

        log('yellow', '\n🛠️ RECOMMENDED ACTIONS:');
        log('yellow', '1. Fix missing environment variables first');
        log('yellow', '2. Restore missing files from git');
        log('yellow', '3. Run database setup scripts');
        log('yellow', '4. Test authentication endpoints');
        log('yellow', '5. Check API integration manually');
    }
}

async function main() {
    log('bright', '🚀 Starting Call Summary Error Diagnosis...\n');

    const allIssues = [];

    // Run all checks
    allIssues.push(checkEnvironmentVariables());
    allIssues.push(checkFileStructure());
    allIssues.push(checkDatabaseConfiguration());
    allIssues.push(checkAPIEndpoints());
    allIssues.push(checkAuthenticationFiles());
    allIssues.push(checkVapiIntegration());
    allIssues.push(checkSiriButtonComponents());

    // Generate summary
    generateSummaryReport(allIssues);

    log('bright', '\n✅ Diagnosis complete!');
    log('cyan', 'For detailed troubleshooting, see the 69-point checklist above.');
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        log('red', 'Script error:', error);
        process.exit(1);
    });
}

module.exports = {
    checkEnvironmentVariables,
    checkFileStructure,
    checkDatabaseConfiguration,
    checkAPIEndpoints,
    checkAuthenticationFiles,
    checkVapiIntegration,
    checkSiriButtonComponents
}; 