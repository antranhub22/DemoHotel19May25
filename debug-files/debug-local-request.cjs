#!/usr/bin/env node

/**
 * Local Debug Script for /api/request API Endpoint
 * Kiểm tra API khi chạy local development
 */

const axios = require('axios');

// Configuration for local testing
const LOCAL_API_BASE = 'http://localhost:10000/api';
const REMOTE_API_BASE = 'https://mininhonmuine.talk2go.online/api';

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

async function checkLocalServer() {
    log.header('🏠 CHECKING LOCAL SERVER');

    try {
        const response = await axios.get(`${LOCAL_API_BASE}/health`, {
            timeout: 5000
        });
        log.success(`Local server is running: ${response.status}`);
        log.debug(`Health status: ${JSON.stringify(response.data, null, 2)}`);
        return true;
    } catch (error) {
        log.error(`Local server check failed: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            log.warning('Local server is not running. Start with: npm run dev');
        }
        return false;
    }
}

async function checkRemoteServer() {
    log.header('🌐 CHECKING REMOTE SERVER');

    try {
        const response = await axios.get(`${REMOTE_API_BASE}/health`, {
            timeout: 10000
        });
        log.success(`Remote server is accessible: ${response.status}`);
        log.debug(`Health status: ${JSON.stringify(response.data, null, 2)}`);
        return true;
    } catch (error) {
        log.error(`Remote server check failed: ${error.message}`);
        if (error.code === 'ENOTFOUND') {
            log.warning('Domain not found - might be configuration issue');
        }
        return false;
    }
}

async function testLocalRequest() {
    log.header('📝 TESTING LOCAL REQUEST');

    const headers = {
        'Host': 'mininhonmuine.talk2go.online',
        'User-Agent': 'Debug-Script/1.0',
        'Content-Type': 'application/json',
        'X-Debug': 'true'
    };

    log.debug(`Request URL: ${LOCAL_API_BASE}/request`);
    log.debug(`Request payload: ${JSON.stringify(TEST_REQUEST_PAYLOAD, null, 2)}`);

    try {
        const response = await axios.post(`${LOCAL_API_BASE}/request`, TEST_REQUEST_PAYLOAD, {
            headers,
            timeout: 15000,
            validateStatus: () => true // Don't throw on error status codes
        });

        log.info(`Response status: ${response.status}`);
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
            log.error('Connection refused - server not running on port 10000');
        }
        return null;
    }
}

async function testGetRequests() {
    log.header('📋 TESTING GET REQUESTS');

    try {
        const response = await axios.get(`${LOCAL_API_BASE}/request`, {
            headers: {
                'Host': 'mininhonmuine.talk2go.online',
                'User-Agent': 'Debug-Script/1.0'
            },
            timeout: 10000,
            validateStatus: () => true
        });

        log.info(`Response status: ${response.status}`);
        log.debug(`Response data: ${JSON.stringify(response.data, null, 2)}`);

        if (response.status === 200) {
            log.success('✅ GET requests successful!');
            log.info(`Found ${response.data.data?.length || 0} existing requests`);
            return response.data;
        } else if (response.status === 500) {
            log.error('🚨 500 Internal Server Error on GET!');
            analyzeError(response.data);
            return null;
        } else {
            log.warning(`Unexpected status code: ${response.status}`);
            return response.data;
        }
    } catch (error) {
        log.error(`GET request failed: ${error.message}`);
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

    if (errorData.debugId) {
        log.info(`Debug ID: ${errorData.debugId}`);
    }

    if (errorData.stack) {
        log.debug(`Stack trace: ${errorData.stack}`);
    }

    // Analyze common error patterns
    const errorMsg = String(errorData.error || errorData.details || '').toLowerCase();

    if (errorMsg.includes('database')) {
        log.warning('🗄️  Database-related error detected');
        log.info('- Check database connection');
        log.info('- Verify database schema');
        log.info('- Run: npm run db:migrate');
    }

    if (errorMsg.includes('tenant')) {
        log.warning('🏨 Tenant-related error detected');
        log.info('- Check tenant identification logic');
        log.info('- Verify subdomain extraction');
        log.info('- Check tenant exists in database');
    }

    if (errorMsg.includes('service') || errorMsg.includes('container')) {
        log.warning('🔧 Service Container error detected');
        log.info('- Check ServiceContainer initialization');
        log.info('- Verify service dependencies');
        log.info('- Check modular architecture setup');
    }
}

async function runLocalDiagnostics() {
    log.header('🎯 LOCAL API REQUEST DEBUG DIAGNOSTICS');
    log.info('Testing API endpoints locally and remotely');

    const results = {
        localServer: false,
        remoteServer: false,
        getRequests: null,
        postRequest: null
    };

    // Step 1: Check local server
    results.localServer = await checkLocalServer();

    // Step 2: Check remote server (if local fails)
    if (!results.localServer) {
        results.remoteServer = await checkRemoteServer();
    }

    // Step 3: Test GET requests (if server is available)
    if (results.localServer) {
        results.getRequests = await testGetRequests();
    }

    // Step 4: Test POST request (if server is available)
    if (results.localServer) {
        results.postRequest = await testLocalRequest();
    }

    // Final report
    log.header('📊 DIAGNOSTIC RESULTS');

    log.info(`Local Server (port 10000): ${results.localServer ? '✅ OK' : '❌ NOT RUNNING'}`);
    log.info(`Remote Server: ${results.remoteServer ? '✅ OK' : '❌ NOT ACCESSIBLE'}`);
    log.info(`GET Requests: ${results.getRequests ? '✅ OK' : '❌ FAILED'}`);
    log.info(`POST Request: ${results.postRequest ? '✅ OK' : '❌ FAILED'}`);

    // Recommendations
    log.header('💡 RECOMMENDATIONS');

    if (!results.localServer && !results.remoteServer) {
        log.warning('🔧 START THE SERVER:');
        log.info('   npm run dev          # Start development server');
        log.info('   npm run dev:server   # Start server only');
        log.info('   npm run start        # Start production server');
    }

    if (results.localServer && !results.getRequests) {
        log.warning('🗄️  DATABASE ISSUES:');
        log.info('   npm run db:migrate   # Run database migrations');
        log.info('   npm run db:seed      # Seed database with test data');
    }

    if (results.localServer && !results.postRequest) {
        log.warning('🐛 SERVER ERRORS:');
        log.info('   Check server logs for detailed error information');
        log.info('   Enable debug logging: DEBUG_ENABLED=true');
    }

    return results;
}

// Run diagnostics
if (require.main === module) {
    runLocalDiagnostics()
        .then(() => {
            log.success('Local diagnostics completed');
            process.exit(0);
        })
        .catch((error) => {
            log.error(`Diagnostics failed: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { runLocalDiagnostics, checkLocalServer, testLocalRequest }; 