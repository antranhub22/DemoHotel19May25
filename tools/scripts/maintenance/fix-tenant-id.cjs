const fs = require('fs');

const filePath = 'apps/server/services/unifiedAuthService.ts';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Fixing tenantId back to tenant_id in unifiedAuthService.ts...');

// Fix tenantId back to tenant_id for database access
content = content.replace(/user\.tenantId/g, 'user.tenant_id');

// Count fixes
const matches = content.match(/user\.tenant_id/g);
console.log(`✅ Fixed ${matches ? matches.length : 0} instances of tenantId → tenant_id`);

// Write the fixed content back
fs.writeFileSync(filePath, content, 'utf8');

console.log('🎉 Tenant ID fixes completed!'); 