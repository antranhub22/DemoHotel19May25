#!/usr/bin/env node

/**
 * Get Render Database URL
 * This script helps get the actual DATABASE_URL from Render deployment
 */

const https = require('https');
const fs = require('fs');

// Render API configuration
const RENDER_API_TOKEN = process.env.RENDER_API_TOKEN;
const SERVICE_ID = 'srv-d015p73uibrs73a20dog'; // From your logs

if (!RENDER_API_TOKEN) {
  console.error('❌ RENDER_API_TOKEN environment variable is required!');
  console.error(
    '💡 Get your API token from: https://dashboard.render.com/account/api-keys'
  );
  console.error('💡 Then run: export RENDER_API_TOKEN=your_token_here');
  process.exit(1);
}

async function getRenderDatabaseUrl() {
  try {
    console.log('🔍 Fetching environment variables from Render...');

    const options = {
      hostname: 'api.render.com',
      port: 443,
      path: `/v1/services/${SERVICE_ID}/env-vars`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${RENDER_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const request = https.request(options, response => {
      let data = '';

      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        if (response.statusCode === 200) {
          const envVars = JSON.parse(data);
          const databaseUrl = envVars.find(env => env.key === 'DATABASE_URL');

          if (databaseUrl) {
            console.log('✅ Found DATABASE_URL from Render:');
            console.log(`📋 ${databaseUrl.key}=${databaseUrl.value}`);
            console.log('\n💡 To use this DATABASE_URL:');
            console.log(`export DATABASE_URL="${databaseUrl.value}"`);
            console.log('\n🚀 Then run the migration:');
            console.log('node fix-production-database.js');
          } else {
            console.error(
              '❌ DATABASE_URL not found in Render environment variables'
            );
          }
        } else {
          console.error(
            '❌ Failed to fetch environment variables:',
            response.statusCode
          );
          console.error('Response:', data);
        }
      });
    });

    request.on('error', error => {
      console.error('❌ Request failed:', error.message);
    });

    request.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Alternative: Manual DATABASE_URL input
function manualDatabaseUrl() {
  console.log('\n📝 Manual DATABASE_URL Setup:');
  console.log(
    '1. Go to Render Dashboard: https://dashboard.render.com/web/srv-d015p73uibrs73a20dog'
  );
  console.log('2. Navigate to Environment tab');
  console.log('3. Copy the DATABASE_URL value');
  console.log('4. Run: export DATABASE_URL="your_database_url_here"');
  console.log('5. Then run: node fix-production-database.js');
}

console.log('🎯 Render Database URL Helper');
console.log('=============================');

if (RENDER_API_TOKEN) {
  getRenderDatabaseUrl();
} else {
  manualDatabaseUrl();
}
