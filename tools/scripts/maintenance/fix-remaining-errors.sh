#!/bin/bash

echo "🔧 Sửa lỗi Phase 2 - REST OF THE ERRORS..."

# Fix type interface mismatches
find apps/server -name "*.ts" -exec sed -i '' 's/serviceDetails\.room_number/serviceDetails.roomNumber/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/callDetails\.room_number/callDetails.roomNumber/g' {} \;

# Fix req.params naming
find apps/server -name "*.ts" -exec sed -i '' 's/req\.params\.call_id/req.params.callId/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/req\.params\.room_number/req.params.roomNumber/g' {} \;

# Fix WebSocket client properties
find apps/server -name "*.ts" -exec sed -i '' 's/ws\.call_id/ws.callId/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/client\.call_id/client.callId/g' {} \;

# Fix filter object mismatches
find apps/server -name "*.ts" -exec sed -i '' 's/filter\.room_number/filter.roomNumber/g' {} \;

# Fix req.tenant_id mismatches  
find apps/server -name "*.ts" -exec sed -i '' 's/req\.tenant_id/req.tenantId/g' {} \;

# Fix middleware exports
find apps/server -name "*.ts" -exec sed -i '' 's/tenantMiddleware\.tenant_identification/tenantMiddleware.tenantIdentification/g' {} \;

# Fix AuthUser field access
find apps/server -name "*.ts" -exec sed -i '' 's/\.user\.tenant_id/.user.tenantId/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/\.user!\.tenant_id/.user!.tenantId/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/\.user?\.tenant_id/.user?.tenantId/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/user\.display_name/user.displayName/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/user\.avatar_url/user.avatarUrl/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/user\.last_login/user.lastLogin/g' {} \;

# Fix specific object properties that were wrong direction
find apps/server -name "*.ts" -exec sed -i '' 's/callDetails\.call_id/callDetails.callId/g' {} \;

# Fix property setting that got reversed
find apps/server -name "*.ts" -exec sed -i '' 's/lastLogin:/last_login:/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/updatedAt:/updated_at:/g' {} \;

echo "✅ Phase 2 hoàn thành!" 