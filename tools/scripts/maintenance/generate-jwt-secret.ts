#!/usr/bin/env node

/**
 * ===============================================
 * 🔐 JWT Secret Generator
 * ===============================================
 *
 * This script generates a secure JWT secret for production use
 */

import crypto from 'crypto';

function generateSecureSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64');
}

function generateHexSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

function generateAlphanumericSecret(length: number = 32): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return result;
}

function printSecrets(): void {
  console.log('🔐 JWT Secret Generator');
  console.log('='.repeat(40));
  console.log('');

  console.log('📋 Generated Secrets:');
  console.log('');

  console.log('1. Base64 Secret (Recommended):');
  console.log(`   JWT_SECRET=${generateSecureSecret(32)}`);
  console.log('');

  console.log('2. Hex Secret:');
  console.log(`   JWT_SECRET=${generateHexSecret(32)}`);
  console.log('');

  console.log('3. Alphanumeric Secret:');
  console.log(`   JWT_SECRET=${generateAlphanumericSecret(48)}`);
  console.log('');

  console.log('4. Session Secret (for EXPRESS_SESSION):');
  console.log(`   SESSION_SECRET=${generateSecureSecret(32)}`);
  console.log('');

  console.log('💡 Tips:');
  console.log('• Use Base64 secret for JWT_SECRET (most secure)');
  console.log('• Minimum 32 characters for production');
  console.log('• Never commit secrets to version control');
  console.log('• Use different secrets for different environments');
  console.log('• Rotate secrets regularly');
  console.log('');

  console.log('🚀 For Render Deployment:');
  console.log('• Copy the Base64 secret above');
  console.log('• Add to Environment Variables as JWT_SECRET');
  console.log('• Also add SESSION_SECRET for session management');
  console.log('');
}

// Generate secrets and display
printSecrets();
