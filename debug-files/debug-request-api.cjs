#!/usr/bin/env node

/**
 * Debug Script for /api/request API Endpoint
 * Kiểm tra các vấn đề phổ biến gây lỗi 500 Internal Server Error
 */

const axios = require('axios');

// Configuration
const API_BASE = 'https://minhonmuine.talk2go.online/api';
const TEST_REQUEST_PAYLOAD = {
    callId: 'debug-call-001',
    roomNumber: '101',
    orderType: 'Room Service',
    deliveryTime: 'asap',
    specialInstructions: 'Debug test request',
    items: [
        { name: 'Test Item', quantity: 1, price: 100 }
    ]
};

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
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    debug: (msg) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`),
    header: (msg) => console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}\n`),
};

async function checkServerHealth() {
    log.header('🏥 CHECKING SERVER HEALTH');

    try {
        const response = await axios.get(`${API_BASE}/health`, {
            timeout: 10000
        });
        log.success(`Server is responding: ${response.status}`);
        log.debug(`Health status: ${JSON.stringify(response.data, null, 2)}`);
        return true;
    } catch (error) {
        log.error(`Server health check failed: ${error.message}`);
        if (error.response) {
            log.debug(`Response status: ${error.response.status}`);
            log.debug(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return false;
    }
}

async function checkDatabaseConnection() {
    log.header('🗄️  CHECKING DATABASE CONNECTION');

    try {
        // Try to fetch requests to test DB connection
        const response = await axios.get(`${API_BASE}/request`, {
            timeout: 10000,
            headers: {
                'Host': 'minhonmuine.talk2go.online',
                'User-Agent': 'Debug-Script/1.0'
            }
        });
        log.success('Database connection is working');
        log.debug(`Found ${response.data.data?.length || 0} existing requests`);
        return true;
    } catch (error) {
        log.error(`Database connection test failed: ${error.message}`);
        if (error.response?.status === 500) {
            log.warning('This might be the same 500 error we\'re debugging');
            log.debug(`Error response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return false;
    }
}

async function testTenantIdentification() {
    log.header('🏨 TESTING TENANT IDENTIFICATION');

    const testHeaders = {
        'Host': 'minhonmuine.talk2go.online',
        'User-Agent': 'Debug-Script/1.0',
        'Content-Type': 'application/json'
    };

    log.debug(`Testing with headers: ${JSON.stringify(testHeaders, null, 2)}`);

    try {
        // Test tenant extraction logic
        const hostname = 'minhonmuine.talk2go.online';
        const subdomain = hostname.split('.')[0];
        log.info(`Extracted subdomain: "${subdomain}"`);
        log.info(`Expected tenant ID: "tenant-${subdomain}"`);

        return subdomain;
    } catch (error) {
        log.error(`Tenant identification failed: ${error.message}`);
        return null;
    }
}

async function debugCreateRequest() {
    log.header('📝 DEBUGGING CREATE REQUEST');

    const headers = {
        'Host': 'minhonmuine.talk2go.online',
        'User-Agent': 'Debug-Script/1.0',
        'Content-Type': 'application/json',
        'X-Debug': 'true'
    };

    log.debug(`Request payload: ${JSON.stringify(TEST_REQUEST_PAYLOAD, null, 2)}`);
    log.debug(`Request headers: ${JSON.stringify(headers, null, 2)}`);

    try {
        const response = await axios.post(`${API_BASE}/request`, TEST_REQUEST_PAYLOAD, {
            headers,
            timeout: 15000,
            validateStatus: () => true // Don't throw on error status codes
        });

        log.info(`Response status: ${response.status}`);
        log.debug(`Response headers: ${JSON.stringify(response.headers, null, 2)}`);
        log.debug(`Response data: ${JSON.stringify(response.data, null, 2)}`);

        if (response.status === 201) {
            log.success('✅ Request created successfully!');
            return response.data;
        } else if (response.status === 500) {
            log.error('🚨 500 Internal Server Error detected!');
            analyzeError(response.data);
            return null;
        } else {
            log.warning(`Unexpected status code: ${response.status}`);
            return response.data;
        }
    } catch (error) {
        log.error(`Request failed: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            log.error('Connection refused - server might be down');
        } else if (error.code === 'ETIMEDOUT') {
            log.error('Request timeout - server might be overloaded');
        }
        return null;
    }
}

function analyzeError(errorData) {
    log.header('🔍 ERROR ANALYSIS');

    if (!errorData) {
        log.warning('No error data provided');
        return;
    }

    if (errorData.error) {
        log.info(`Error message: ${errorData.error}`);
    }

    if (errorData.details) {
        log.info(`Error details: ${errorData.details}`);
    }

    if (errorData.code) {
        log.info(`Error code: ${errorData.code}`);
    }

    // Analyze common error patterns
    const errorMsg = String(errorData.error || errorData.details || '').toLowerCase();

    if (errorMsg.includes('database')) {
        log.warning('🗄️  Database-related error detected');
        log.info('- Check database connection');
        log.info('- Verify database schema');
        log.info('- Check PostgreSQL/SQLite setup');
    }

    if (errorMsg.includes('tenant')) {
        log.warning('🏨 Tenant-related error detected');
        log.info('- Check tenant identification logic');
        log.info('- Verify subdomain extraction');
        log.info('- Check tenant validation');
    }

    if (errorMsg.includes('service') || errorMsg.includes('container')) {
        log.warning('🔧 Service Container error detected');
        log.info('- Check ServiceContainer initialization');
        log.info('- Verify service dependencies');
        log.info('- Check modular architecture setup');
    }

    if (errorMsg.includes('feature') || errorMsg.includes('flag')) {
        log.warning('🚩 Feature Flag error detected');
        log.info('- Check FeatureFlags service');
        log.info('- Verify flag initialization');
        log.info('- Check flag dependencies');
    }
}

async function runDiagnostics() {
    log.header('🎯 API REQUEST DEBUG DIAGNOSTICS');
    log.info('Diagnosing /api/request 500 Internal Server Error');

    const results = {
        serverHealth: false,
        databaseConnection: false,
        tenantIdentification: null,
        requestCreation: null
    };

    // Step 1: Check server health
    results.serverHealth = await checkServerHealth();

    // Step 2: Check database connection
    results.databaseConnection = await checkDatabaseConnection();

    // Step 3: Test tenant identification
    results.tenantIdentification = await testTenantIdentification();

    // Step 4: Debug the actual request creation
    results.requestCreation = await debugCreateRequest();

    // Final report
    log.header('📊 DIAGNOSTIC RESULTS');

    log.info(`Server Health: ${results.serverHealth ? '✅ OK' : '❌ FAILED'}`);
    log.info(`Database Connection: ${results.databaseConnection ? '✅ OK' : '❌ FAILED'}`);
    log.info(`Tenant Identification: ${results.tenantIdentification ? '✅ OK' : '❌ FAILED'}`);
    log.info(`Request Creation: ${results.requestCreation ? '✅ OK' : '❌ FAILED'}`);

    // Recommendations
    log.header('💡 RECOMMENDATIONS');

    if (!results.serverHealth) {
        log.warning('1. Check if server is running and accessible');
    }

    if (!results.databaseConnection) {
        log.warning('2. Check database connection and schema');
    }

    if (!results.tenantIdentification) {
        log.warning('3. Check tenant identification logic');
    }

    if (!results.requestCreation) {
        log.warning('4. Check RequestController error logs');
        log.info('   - Look for database errors');
        log.info('   - Check service container issues');
        log.info('   - Verify feature flag problems');
    }

    return results;
}

// Run diagnostics if script is executed directly
if (require.main === module) {
    runDiagnostics()
        .then(() => {
            log.success('Diagnostics completed');
            process.exit(0);
        })
        .catch((error) => {
            log.error(`Diagnostics failed: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { runDiagnostics, checkServerHealth, debugCreateRequest }; 