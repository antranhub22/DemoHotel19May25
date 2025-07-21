#!/usr/bin/env node

// ================================================================
// 🔧 VAPI KEYS UPDATER SCRIPT
// ================================================================

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.cyan}🔧 ${msg}${colors.reset}`),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function updateEnvFile(publicKey, assistantId) {
  const envPath = '.env';
  
  if (!fs.existsSync(envPath)) {
    log.error('.env file not found!');
    return false;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update VITE_VAPI_PUBLIC_KEY
  const publicKeyRegex = /^VITE_VAPI_PUBLIC_KEY=.*/m;
  if (publicKeyRegex.test(envContent)) {
    envContent = envContent.replace(publicKeyRegex, `VITE_VAPI_PUBLIC_KEY=${publicKey}`);
  } else {
    envContent += `\nVITE_VAPI_PUBLIC_KEY=${publicKey}`;
  }
  
  // Update VITE_VAPI_ASSISTANT_ID
  const assistantIdRegex = /^VITE_VAPI_ASSISTANT_ID=.*/m;
  if (assistantIdRegex.test(envContent)) {
    envContent = envContent.replace(assistantIdRegex, `VITE_VAPI_ASSISTANT_ID=${assistantId}`);
  } else {
    envContent += `\nVITE_VAPI_ASSISTANT_ID=${assistantId}`;
  }
  
  // Write back to file
  fs.writeFileSync(envPath, envContent, 'utf8');
  return true;
}

async function main() {
  console.log(`${colors.bold}${colors.cyan}🔧 VAPI KEYS UPDATER${colors.reset}\n`);
  
  log.section('Cập nhật Real Vapi Keys');
  log.info('Bạn cần lấy real keys từ https://app.vapi.ai/');
  log.info('Public Key phải bắt đầu với pk_...');
  log.info('Assistant ID phải bắt đầu với asst_...');
  
  console.log();
  
  // Get public key
  let publicKey;
  while (true) {
    publicKey = await askQuestion('🔑 Nhập Vapi Public Key (pk_...): ');
    
    if (!publicKey) {
      log.error('Public key không được để trống!');
      continue;
    }
    
    if (!publicKey.startsWith('pk_')) {
      log.error('Public key phải bắt đầu với pk_');
      continue;
    }
    
    if (publicKey.includes('development') || publicKey.includes('dev')) {
      log.warning('⚠️  Key này có vẻ như là development key. Hãy chắc chắn đây là real key.');
      const confirm = await askQuestion('Bạn có chắc muốn sử dụng key này? (y/N): ');
      if (!confirm.toLowerCase().startsWith('y')) {
        continue;
      }
    }
    
    break;
  }
  
  // Get assistant ID
  let assistantId;
  while (true) {
    assistantId = await askQuestion('🤖 Nhập Vapi Assistant ID (asst_...): ');
    
    if (!assistantId) {
      log.error('Assistant ID không được để trống!');
      continue;
    }
    
    if (!assistantId.startsWith('asst_')) {
      log.error('Assistant ID phải bắt đầu với asst_');
      continue;
    }
    
    if (assistantId.includes('development') || assistantId.includes('dev')) {
      log.warning('⚠️  Assistant ID này có vẻ như là development ID. Hãy chắc chắn đây là real ID.');
      const confirm = await askQuestion('Bạn có chắc muốn sử dụng ID này? (y/N): ');
      if (!confirm.toLowerCase().startsWith('y')) {
        continue;
      }
    }
    
    break;
  }
  
  // Confirm update
  log.section('Xác nhận cập nhật');
  log.info(`Public Key: ${publicKey.substring(0, 20)}...`);
  log.info(`Assistant ID: ${assistantId}`);
  
  const confirm = await askQuestion('\n✅ Cập nhật .env file với những keys này? (Y/n): ');
  
  if (confirm.toLowerCase() === 'n') {
    log.info('Đã hủy cập nhật.');
    rl.close();
    return;
  }
  
  // Update file
  const success = updateEnvFile(publicKey, assistantId);
  
  if (success) {
    log.success('✅ Đã cập nhật .env file thành công!');
    
    log.section('Bước tiếp theo');
    log.info('1. Restart development server: npm run dev');
    log.info('2. Refresh browser page');
    log.info('3. Test Siri button again');
    log.info('4. Nếu vẫn có lỗi, check browser console');
    
    log.section('Kiểm tra validation');
    log.info('Chạy: npm run validate:env');
    log.info('Hoặc: node scripts/debug-vapi-issue.cjs');
    
  } else {
    log.error('❌ Không thể cập nhật .env file!');
  }
  
  rl.close();
}

// Handle Ctrl+C
rl.on('SIGINT', () => {
  console.log('\n👋 Đã hủy cập nhật.');
  rl.close();
  process.exit(0);
});

if (require.main === module) {
  main().catch(error => {
    log.error('Lỗi: ' + error.message);
    rl.close();
    process.exit(1);
  });
} 