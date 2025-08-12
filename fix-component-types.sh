#!/bin/bash

# Fix Component Type Errors Script
# This script fixes all TS2749 errors where component names are used as types

echo "🔧 Fixing Component Type Errors..."

# Fix AppWithDomains.tsx ProtectedRoute
sed -i '' 's/const ProtectedRoute: React.FC<ProtectedRoute>/const ProtectedRoute: React.FC<ProtectedRouteProps>/g' apps/client/src/AppWithDomains.tsx

# Fix Interface1Desktop.tsx
sed -i '' 's/const Interface1Desktop: React.FC<Interface1Desktop>/const Interface1Desktop: React.FC<Interface1DesktopProps>/g' apps/client/src/components/business/Interface1Desktop.tsx

# Fix Interface1Mobile.tsx  
sed -i '' 's/const Interface1Mobile: React.FC<Interface1Mobile>/const Interface1Mobile: React.FC<Interface1MobileProps>/g' apps/client/src/components/business/Interface1Mobile.tsx

# Fix VoiceAssistantWithSaaS.tsx
sed -i '' 's/const VoiceAssistantWithSaaS: React.FC<VoiceAssistantWithSaaS>/const VoiceAssistantWithSaaS: React.FC<VoiceAssistantWithSaaSProps>/g' apps/client/src/components/business/VoiceAssistantWithSaaS.tsx

# Fix AssistantConfigPanel.tsx
sed -i '' 's/const AssistantConfigPanel: React.FC<AssistantConfigPanel>/const AssistantConfigPanel: React.FC<AssistantConfigPanelProps>/g' apps/client/src/components/features/dashboard/dashboard/AssistantConfigPanel.tsx

# Fix FeatureToggle.tsx
sed -i '' 's/const FeatureToggle: React.FC<FeatureToggle>/const FeatureToggle: React.FC<FeatureToggleProps>/g' apps/client/src/components/features/dashboard/dashboard/FeatureToggle.tsx

# Fix HotelResearchPanel.tsx
sed -i '' 's/const HotelResearchPanel: React.FC<HotelResearchPanel>/const HotelResearchPanel: React.FC<HotelResearchPanelProps>/g' apps/client/src/components/features/dashboard/dashboard/HotelResearchPanel.tsx

# Fix MetricCard.tsx
sed -i '' 's/const MetricCard: React.FC<MetricCard>/const MetricCard: React.FC<MetricCardProps>/g' apps/client/src/components/features/dashboard/dashboard/MetricCard.tsx

# Fix Sidebar.tsx
sed -i '' 's/const Sidebar: React.FC<Sidebar>/const Sidebar: React.FC<SidebarProps>/g' apps/client/src/components/features/dashboard/dashboard/Sidebar.tsx

# Fix TopBar.tsx
sed -i '' 's/const TopBar: React.FC<TopBar>/const TopBar: React.FC<TopBarProps>/g' apps/client/src/components/features/dashboard/dashboard/TopBar.tsx

# Fix UsageChart.tsx
sed -i '' 's/const UsageChart: React.FC<UsageChart>/const UsageChart: React.FC<UsageChartProps>/g' apps/client/src/components/features/dashboard/dashboard/UsageChart.tsx

echo "✅ Component type errors fixed!"
echo "📝 Note: You may need to add proper interface definitions for each component"
