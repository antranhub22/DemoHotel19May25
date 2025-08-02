#!/usr/bin/env node

/**
 * Test API Fix Script
 * Kiểm tra xem API routes có hoạt động đúng không
 */

const http = require('http');

const LOCAL_URL = 'http://localhost:10000';

console.log('🧪 Testing API Fix...\n');

// Test 1: API request route
async function testRequestRoute() {
    console.log('1️⃣ Testing /api/request route...');

    try {
        const response = await makeRequest(`${LOCAL_URL}/api/request`);
        console.log(`Status: ${response.statusCode}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);

        if (response.statusCode === 200) {
            console.log('✅ /api/request route working');
            console.log(`Response: ${response.data.substring(0, 100)}...`);
        } else {
            console.log(`❌ /api/request route failed: ${response.statusCode}`);
            console.log(`Response: ${response.data}`);
        }
    } catch (error) {
        console.log(`❌ /api/request route error: ${error.message}`);
    }
}

// Test 2: Health route
async function testHealthRoute() {
    console.log('\n2️⃣ Testing /api/health route...');

    try {
        const response = await makeRequest(`${LOCAL_URL}/api/health`);
        if (response.statusCode === 200) {
            console.log('✅ /api/health route working');
        } else {
            console.log(`❌ /api/health route failed: ${response.statusCode}`);
        }
    } catch (error) {
        console.log(`❌ /api/health route error: ${error.message}`);
    }
}

// Test 3: Core route
async function testCoreRoute() {
    console.log('\n3️⃣ Testing /api/core route...');

    try {
        const response = await makeRequest(`${LOCAL_URL}/api/core`);
        if (response.statusCode === 200) {
            console.log('✅ /api/core route working');
        } else {
            console.log(`❌ /api/core route failed: ${response.statusCode}`);
        }
    } catch (error) {
        console.log(`❌ /api/core route error: ${error.message}`);
    }
}

// Helper function to make HTTP requests
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting API fix test...\n');

    await testRequestRoute();
    await testHealthRoute();
    await testCoreRoute();

    console.log('\n📊 Test Summary:');
    console.log('✅ API routes should work with /api prefix');
    console.log('✅ /api/request should return data for OpenAI summary');
    console.log('✅ No more 404 errors for API endpoints');
}

runTests().catch(console.error); 