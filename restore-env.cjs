#!/usr/bin/env node

/**
 * Restore Original Environment Configuration
 * Restores .env from backup and removes test mode flags
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring original environment configuration...\n');

const envPath = path.join(__dirname, '.env');
const backupPath = path.join(__dirname, '.env.backup');

try {
  if (fs.existsSync(backupPath)) {
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    fs.writeFileSync(envPath, backupContent);
    
    console.log('✅ Restored .env from backup');
    console.log('✅ Test mode configuration removed');
    console.log('');
    console.log('🔧 Now you need to:');
    console.log('1. Get real API keys from:');
    console.log('   - OpenAI: https://platform.openai.com/');
    console.log('   - Vapi: https://vapi.ai/');
    console.log('2. Update .env with real keys');
    console.log('3. Run: node check-env.cjs');
    console.log('4. Start server: npm run dev');
    console.log('');
    console.log('📚 For detailed guide: fix-environment.md');
    
  } else {
    console.log('⚠️  No backup found (.env.backup)');
    console.log('');
    console.log('🔧 Manual restore:');
    console.log('1. Remove test mode section from .env');
    console.log('2. Set ENABLE_VOICE_ASSISTANT=true');
    console.log('3. Set ENABLE_MULTI_LANGUAGE=true');
    console.log('4. Add real API keys');
  }
  
} catch (error) {
  console.error('❌ Error restoring environment:', error.message);
  process.exit(1);
} 