#!/bin/bash

# Fix Remaining Component Type Errors Script
# This script fixes the remaining TS2749 component type errors

echo "🔧 Fixing Remaining Component Type Errors..."

# Fix StaffRequestDetailModal
if [ -f "apps/client/src/components/features/dashboard/StaffRequestDetailModal.tsx" ]; then
    sed -i '' 's/const StaffRequestDetailModal: React.FC<StaffRequestDetailModal>/const StaffRequestDetailModal: React.FC<StaffRequestDetailModalProps>/g' apps/client/src/components/features/dashboard/StaffRequestDetailModal.tsx
fi

# Fix NoPermissionMessage
if [ -f "apps/client/src/components/features/dashboard/unified-dashboard/guards/PermissionGuard.tsx" ]; then
    sed -i '' 's/const NoPermissionMessage: React.FC<NoPermissionMessage>/const NoPermissionMessage: React.FC<NoPermissionMessageProps>/g' apps/client/src/components/features/dashboard/unified-dashboard/guards/PermissionGuard.tsx
fi

# Fix DynamicSidebar
if [ -f "apps/client/src/components/features/dashboard/unified-dashboard/layout/DynamicSidebar.tsx" ]; then
    sed -i '' 's/const DynamicSidebar: React.FC<DynamicSidebar>/const DynamicSidebar: React.FC<DynamicSidebarProps>/g' apps/client/src/components/features/dashboard/unified-dashboard/layout/DynamicSidebar.tsx
fi

# Fix UnifiedDashboardLayout
if [ -f "apps/client/src/components/features/dashboard/unified-dashboard/UnifiedDashboardLayout.tsx" ]; then
    sed -i '' 's/const UnifiedDashboardLayout: React.FC<UnifiedDashboardLayout>/const UnifiedDashboardLayout: React.FC<UnifiedDashboardLayoutProps>/g' apps/client/src/components/features/dashboard/unified-dashboard/UnifiedDashboardLayout.tsx
fi

# Fix DebugWrapper
if [ -f "apps/client/src/components/features/debug/DebugWrapper.tsx" ]; then
    sed -i '' 's/const DebugWrapper: React.FC<DebugWrapper>/const DebugWrapper: React.FC<DebugWrapperProps>/g' apps/client/src/components/features/debug/DebugWrapper.tsx
fi

# Fix PerformanceMonitor
if [ -f "apps/client/src/components/features/debug/PerformanceMonitor.tsx" ]; then
    sed -i '' 's/const PerformanceMonitor: React.FC<PerformanceMonitor>/const PerformanceMonitor: React.FC<PerformanceMonitorProps>/g' apps/client/src/components/features/debug/PerformanceMonitor.tsx
fi

# Fix all remaining popup-system components
find apps/client/src/components/features/popup-system -name "*.tsx" -exec sed -i '' 's/const \([A-Za-z]*\): React.FC<\1>/const \1: React.FC<\1Props>/g' {} \;

# Fix all remaining voice-assistant components  
find apps/client/src/components/features/voice-assistant -name "*.tsx" -exec sed -i '' 's/const \([A-Za-z]*\): React.FC<\1>/const \1: React.FC<\1Props>/g' {} \;

echo "✅ Remaining component type errors fixed!"
echo "📝 All components now use proper Props interfaces"
