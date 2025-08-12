#!/bin/bash

# Fix UserRole Conflicts Script
# This script standardizes UserRole types across the codebase

echo "🔧 Fixing UserRole Conflicts..."

# Step 1: Standardize UserRole in packages/types/core.ts
echo "📝 Updating packages/types/core.ts..."
sed -i '' "s/'super-admin'/'super_admin'/g" packages/types/core.ts

# Step 2: Find and replace all 'super-admin' with 'super_admin' in TypeScript files
echo "🔄 Replacing 'super-admin' with 'super_admin' across codebase..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s/'super-admin'/'super_admin'/g"
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/"super-admin"/"super_admin"/g'

# Step 3: Update specific problem files
echo "🎯 Fixing UnifiedDashboardLayout.tsx specifically..."
if [ -f "apps/client/src/components/features/dashboard/unified-dashboard/UnifiedDashboardLayout.tsx" ]; then
    sed -i '' "s/super-admin/super_admin/g" apps/client/src/components/features/dashboard/unified-dashboard/UnifiedDashboardLayout.tsx
fi

# Step 4: Update permission constants
echo "📋 Updating permission constants..."
if [ -f "packages/shared/constants/permissions.ts" ]; then
    sed -i '' "s/'super-admin'/'super_admin'/g" packages/shared/constants/permissions.ts
    sed -i '' 's/"super-admin"/"super_admin"/g' packages/shared/constants/permissions.ts
fi

# Step 5: Ensure consistent UserRole type across all type files
echo "🎨 Ensuring consistent UserRole type definition..."
cat > temp_userrole.txt << 'EOF'
export type UserRole = 'admin' | 'manager' | 'staff' | 'super_admin';
EOF

# Update auth types to be consistent
if [ -f "apps/client/src/types/auth.types.ts" ]; then
    sed -i '' "s/export type UserRole = .*/export type UserRole = 'admin' | 'manager' | 'staff' | 'super_admin';/" apps/client/src/types/auth.types.ts
fi

# Update common types to be consistent  
if [ -f "apps/client/src/types/common.types.ts" ]; then
    sed -i '' "s/export type UserRole = .*/export type UserRole = 'admin' | 'manager' | 'staff' | 'super_admin';/" apps/client/src/types/common.types.ts
fi

rm temp_userrole.txt

echo "✅ UserRole conflicts fixed!"
echo "📝 All 'super-admin' changed to 'super_admin' for consistency"
