const fs = require('fs');
const path = require('path');

const filePath = 'apps/server/services/unifiedAuthService.ts';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix all property name mismatches
const fixes = [
  // Fix displayName property mismatches
  { from: 'user.displayName', to: 'user.display_name' },
  // Fix avatarUrl property mismatches  
  { from: 'user.avatarUrl', to: 'user.avatar_url' },
  // Fix lastLogin property mismatches
  { from: 'user.lastLogin', to: 'user.last_login' },
  // Fix AuthUser property access
  { from: 'user.tenant_id', to: 'user.tenantId' }
];

console.log('🔧 Fixing property name mismatches in unifiedAuthService.ts...');

fixes.forEach(fix => {
  const regex = new RegExp(fix.from.replace('.', '\\.'), 'g');
  const matches = content.match(regex);
  if (matches) {
    content = content.replace(regex, fix.to);
    console.log(`✅ Fixed ${matches.length} instances of ${fix.from} → ${fix.to}`);
  }
});

// Write the fixed content back
fs.writeFileSync(filePath, content, 'utf8');

console.log('🎉 All property name fixes completed!'); 