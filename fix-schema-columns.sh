#!/bin/bash

echo "🔧 Sửa lỗi column names - MASS REPLACE..."

# Fix staff table references
find apps/server -name "*.ts" -exec sed -i '' 's/staff\.tenantId/staff.tenant_id/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/staff\.displayName/staff.display_name/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/staff\.avatarUrl/staff.avatar_url/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/staff\.lastLogin/staff.last_login/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/staff\.isActive/staff.is_active/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/staff\.firstName/staff.first_name/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/staff\.lastName/staff.last_name/g' {} \;

# Fix call table references
find apps/server -name "*.ts" -exec sed -i '' 's/call\.callIdVapi/call.call_id_vapi/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/call\.tenantId/call.tenant_id/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/call\.roomNumber/call.room_number/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/call\.serviceType/call.service_type/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/call\.startTime/call.start_time/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/call\.endTime/call.end_time/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/call\.createdAt/call.created_at/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/call\.updatedAt/call.updated_at/g' {} \;

# Fix other table references
find apps/server -name "*.ts" -exec sed -i '' 's/\.tenantId/.tenant_id/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/\.callId/.call_id/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/\.roomNumber/.room_number/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/\.orderId/.order_id/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/\.callIdVapi/.call_id_vapi/g' {} \;

# Fix object properties in results
find apps/server -name "*.ts" -exec sed -i '' 's/staffUser\.tenantId/staffUser.tenant_id/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/updatedOrder\.orderId/updatedOrder.order_id/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/result\[0\]\.orderId/result[0].order_id/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/user\.tenantId/user.tenant_id/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/user\.displayName/user.display_name/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/user\.avatarUrl/user.avatar_url/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/user\.lastLogin/user.last_login/g' {} \;

# Fix call_summaries references  
find apps/server -name "*.ts" -exec sed -i '' 's/callSummaries\.callId/call_summaries.call_id/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/s\.callId/s.call_id/g' {} \;
find apps/server -name "*.ts" -exec sed -i '' 's/s\.roomNumber/s.room_number/g' {} \;

echo "✅ Hoàn thành mass replace!" 