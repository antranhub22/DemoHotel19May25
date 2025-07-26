#!/usr/bin/env node

/**
 * 🔧 VAPI DEBUG SCRIPT - Comprehensive diagnosis tool
 * 
 * This script diagnoses Vapi configuration issues and tests connectivity
 * 
 * Usage: node scripts/debug-vapi-issue.cjs
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Color codes for better terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🔍 ${title}`, 'cyan');
  console.log('='.repeat(60));
}

function logResult(label, value, isGood = null) {
  const status = isGood === true ? '✅' : isGood === false ? '❌' : '📋';
  const color = isGood === true ? 'green' : isGood === false ? 'red' : 'yellow';
  log(`${status} ${label}: ${value}`, color);
}

// UUID format validation
function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Vapi key format validation
function isValidVapiFormat(key, type) {
  if (!key) return false;

  // Accept any non-empty string for both public key and assistant ID
  if (type === 'publicKey' || type === 'assistantId') {
    return key.length > 0;
  }

  return false;
}

async function main() {
  log('🏨 VAPI CONFIGURATION DIAGNOSTIC TOOL', 'bright');
  log('Checking Vapi setup for Mi Nhon Hotel multi-language assistant\n', 'cyan');

  // 1. Environment Variables Check
  logSection('Environment Variables Check');

  const languages = ['EN', 'VI', 'FR', 'ZH', 'RU', 'KO'];
  const envResults = {};

  // Check main Vapi configuration
  const mainPublicKey = process.env.VITE_VAPI_PUBLIC_KEY;
  const mainAssistantId = process.env.VITE_VAPI_ASSISTANT_ID;
  const vapiApiKey = process.env.VAPI_API_KEY;

  logResult('VAPI_API_KEY', vapiApiKey ? `${vapiApiKey.substring(0, 10)}...` : 'NOT SET', !!vapiApiKey);
  logResult('VITE_VAPI_PUBLIC_KEY', mainPublicKey ? `${mainPublicKey.substring(0, 10)}...` : 'NOT SET', !!mainPublicKey);
  logResult('VITE_VAPI_ASSISTANT_ID', mainAssistantId ? `${mainAssistantId.substring(0, 10)}...` : 'NOT SET', !!mainAssistantId);

  // Validate main keys format
  if (mainPublicKey) {
    logResult('Main Public Key Format', isValidVapiFormat(mainPublicKey, 'publicKey') ? 'Valid' : 'Invalid', isValidVapiFormat(mainPublicKey, 'publicKey'));
  }
  if (mainAssistantId) {
    logResult('Main Assistant ID Format', isValidVapiFormat(mainAssistantId, 'assistantId') ? 'Valid' : 'Invalid', isValidVapiFormat(mainAssistantId, 'assistantId'));
  }

  // Check language-specific configurations
  logSection('Multi-Language Configuration Check');

  languages.forEach(lang => {
    const publicKeyVar = lang === 'EN' ? 'VITE_VAPI_PUBLIC_KEY' : `VITE_VAPI_PUBLIC_KEY_${lang}`;
    const assistantIdVar = lang === 'EN' ? 'VITE_VAPI_ASSISTANT_ID' : `VITE_VAPI_ASSISTANT_ID_${lang}`;

    const publicKey = process.env[publicKeyVar];
    const assistantId = process.env[assistantIdVar];

    log(`\n📍 ${lang} Language Configuration:`, 'magenta');
    logResult(`  Public Key (${publicKeyVar})`, publicKey ? `${publicKey.substring(0, 10)}...` : 'NOT SET', !!publicKey);
    logResult(`  Assistant ID (${assistantIdVar})`, assistantId ? `${assistantId.substring(0, 10)}...` : 'NOT SET', !!assistantId);

    // Validate format
    if (publicKey) {
      logResult(`  Public Key Format`, isValidVapiFormat(publicKey, 'publicKey') ? 'Valid' : 'Invalid', isValidVapiFormat(publicKey, 'publicKey'));
    }
    if (assistantId) {
      logResult(`  Assistant ID Format`, isValidVapiFormat(assistantId, 'assistantId') ? 'Valid' : 'Invalid', isValidVapiFormat(assistantId, 'assistantId'));
    }

    envResults[lang] = {
      publicKey,
      assistantId,
      hasPublicKey: !!publicKey,
      hasAssistantId: !!assistantId,
      validPublicKey: publicKey ? isValidVapiFormat(publicKey, 'publicKey') : false,
      validAssistantId: assistantId ? isValidVapiFormat(assistantId, 'assistantId') : false,
    };
  });

  // 2. File System Check
  logSection('File System Check');

  const importantFiles = [
    'apps/client/src/lib/vapiClient.ts',
    'apps/client/src/context/contexts/VapiContext.tsx',
    'apps/client/src/hooks/useHotelConfiguration.ts',
    '.env',
    'REAL_ENV_KEYS.txt'
  ];

  importantFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    logResult(file, exists ? 'Exists' : 'Missing', exists);
  });

  // 3. Network Connectivity Test
  logSection('Network Connectivity Test');

  if (vapiApiKey) {
    try {
      log('Testing Vapi API connectivity...', 'yellow');

      // Test basic Vapi API connectivity
      const fetch = require('node-fetch');
      const response = await fetch('https://api.vapi.ai/assistant', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      logResult('Vapi API Connectivity', `${response.status} ${response.statusText}`, response.ok);

      if (response.ok) {
        const assistants = await response.json();
        logResult('Available Assistants Count', assistants.length || 0, true);

        // Check if our assistant IDs exist in the account
        log('\n🔍 Verifying Assistant IDs in Vapi Account:', 'yellow');
        languages.forEach(lang => {
          const config = envResults[lang];
          if (config.assistantId) {
            const exists = assistants.some(a => a.id === config.assistantId);
            logResult(`  ${lang} Assistant (${config.assistantId.substring(0, 10)}...)`, exists ? 'Found' : 'Not Found', exists);
          }
        });
      }

    } catch (error) {
      logResult('Vapi API Test', `Failed: ${error.message}`, false);
    }
  } else {
    logResult('Vapi API Test', 'Skipped - No API key', false);
  }

  // 4. Configuration Summary
  logSection('Configuration Summary');

  let totalIssues = 0;
  let criticalIssues = 0;

  languages.forEach(lang => {
    const config = envResults[lang];
    let issues = [];

    if (!config.hasPublicKey) {
      issues.push('Missing public key');
      totalIssues++;
      if (lang === 'EN') criticalIssues++;
    }

    if (!config.hasAssistantId) {
      issues.push('Missing assistant ID');
      totalIssues++;
      if (lang === 'EN') criticalIssues++;
    }

    if (config.hasPublicKey && !config.validPublicKey) {
      issues.push('Invalid public key format');
      totalIssues++;
      criticalIssues++;
    }

    if (config.hasAssistantId && !config.validAssistantId) {
      issues.push('Invalid assistant ID format');
      totalIssues++;
      criticalIssues++;
    }

    if (issues.length === 0) {
      logResult(`${lang} Configuration`, 'OK', true);
    } else {
      logResult(`${lang} Configuration`, issues.join(', '), false);
    }
  });

  // 5. Recommendations
  logSection('Recommendations');

  if (criticalIssues === 0 && totalIssues === 0) {
    log('🎉 All configurations look good!', 'green');
    log('✅ Your Vapi setup should work correctly.', 'green');
  } else {
    log('⚠️  Issues found that may cause Vapi connection problems:', 'red');

    if (criticalIssues > 0) {
      log('\n🚨 Critical Issues (will prevent Vapi from working):', 'red');
      log('1. Check format validation in vapiClient.ts and VapiContext.tsx', 'yellow');
      log('2. Ensure all keys are properly set in environment variables', 'yellow');
      log('3. Verify assistant IDs exist in your Vapi account', 'yellow');
    }

    if (totalIssues > criticalIssues) {
      log('\n⚠️  Optional Issues (may limit multi-language support):', 'yellow');
      log('1. Set up language-specific assistant IDs for full multi-language support', 'yellow');
      log('2. Verify all assistant IDs are correctly configured', 'yellow');
    }

    log('\n🔧 Quick Fix Commands:', 'cyan');
    log('1. Copy environment variables from REAL_ENV_KEYS.txt to .env', 'white');
    log('2. Restart your development server', 'white');
    log('3. Clear browser cache and try again', 'white');
  }

  // 6. Debug Commands
  logSection('Debug Commands');
  log('Run these commands in browser console for more debugging:', 'yellow');
  log('- vapiDebug.setLevel("verbose") - Enable detailed Vapi logs', 'white');
  log('- vapiDebug.getLogs() - View recent Vapi debug logs', 'white');
  log('- vapiDebug.exportLogs() - Export all logs for analysis', 'white');
  log('- localStorage.clear() - Clear browser cache', 'white');

  log('\n✅ Diagnostic complete!', 'green');
  process.exit(criticalIssues > 0 ? 1 : 0);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

main().catch(error => {
  log(`\n❌ Script failed: ${error.message}`, 'red');
  process.exit(1);
}); 