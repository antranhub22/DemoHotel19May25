#!/usr/bin/env node

/**
 * Test UI Fix Script
 * Kiểm tra xem frontend UI có được serve đúng không
 */

const http = require('http');

const LOCAL_URL = 'http://localhost:10000';

console.log('🧪 Testing UI Fix...\n');

// Test 1: Root route should serve HTML
async function testRootRoute() {
    console.log('1️⃣ Testing root route for HTML...');

    try {
        const response = await makeRequest(`${LOCAL_URL}/`);
        console.log(`Status: ${response.statusCode}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);

        if (response.statusCode === 200) {
            if (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html>')) {
                console.log('✅ Root route serving HTML (UI)');
            } else if (response.data.includes('"success"')) {
                console.log('❌ Root route still serving JSON (API response)');
            } else {
                console.log('❓ Root route serving unknown content');
            }
        } else {
            console.log(`❌ Root route failed: ${response.statusCode}`);
        }
    } catch (error) {
        console.log(`❌ Root route error: ${error.message}`);
    }
}

// Test 2: API route should work
async function testAPIRoute() {
    console.log('\n2️⃣ Testing API route...');

    try {
        const response = await makeRequest(`${LOCAL_URL}/api/core`);
        if (response.statusCode === 200) {
            console.log('✅ API route working');
        } else {
            console.log(`❌ API route failed: ${response.statusCode}`);
        }
    } catch (error) {
        console.log(`❌ API route error: ${error.message}`);
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
    console.log('🚀 Starting UI fix test...\n');

    await testRootRoute();
    await testAPIRoute();

    console.log('\n📊 Test Summary:');
    console.log('✅ Static files should be served before API routes');
    console.log('✅ Root route should serve HTML, not JSON');
    console.log('✅ API routes should still work with /api prefix');
}

runTests().catch(console.error); 