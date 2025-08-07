#!/bin/bash

# Fix Language Import Issues Script
# This script fixes duplicate Language imports and broken import paths

echo "🔧 Fixing Language Import Issues..."

# Step 1: Fix duplicate Language imports in voice-assistant files
echo "🔄 Fixing duplicate Language imports..."

# Remove duplicate Language import lines that were accidentally added
find apps/client/src/components/features/voice-assistant -name "*.tsx" -exec sed -i '' '/^import type { Language } from/d' {} \;

# Step 2: Fix broken import paths in voice-assistant files  
echo "🔗 Fixing broken import paths..."

# Fix NotificationSystem.tsx
if [ -f "apps/client/src/components/features/voice-assistant/interface1/NotificationSystem.tsx" ]; then
    sed -i '' "s|'../types/common.types'|'@/types/common.types'|g" apps/client/src/components/features/voice-assistant/interface1/NotificationSystem.tsx
fi

# Fix RecentRequestCard.tsx
if [ -f "apps/client/src/components/features/voice-assistant/interface1/RecentRequestCard.tsx" ]; then
    sed -i '' "s|'../types/common.types'|'@/types/common.types'|g" apps/client/src/components/features/voice-assistant/interface1/RecentRequestCard.tsx
fi

# Fix VoiceCommandContext.tsx
if [ -f "apps/client/src/components/features/voice-assistant/interface1/VoiceCommandContext.tsx" ]; then
    sed -i '' "s|'../types/common.types'|'@/types/common.types'|g" apps/client/src/components/features/voice-assistant/interface1/VoiceCommandContext.tsx
fi

# Step 3: Fix component type errors in voice-assistant files
echo "🎯 Fixing component type errors..."

# Fix RecentRequestCard
if [ -f "apps/client/src/components/features/voice-assistant/interface1/RecentRequestCard.tsx" ]; then
    sed -i '' 's/const RecentRequestCard: React.FC<RecentRequestCard>/const RecentRequestCard: React.FC<RecentRequestCardProps>/g' apps/client/src/components/features/voice-assistant/interface1/RecentRequestCard.tsx
fi

# Step 4: Remove any remaining '../types/common.types' imports
echo "🧹 Cleaning up remaining broken import paths..."
find apps/client/src -name "*.tsx" -exec sed -i '' "s|'../types/common.types'|'@/types/common.types'|g" {} \;
find apps/client/src -name "*.ts" -exec sed -i '' "s|'../types/common.types'|'@/types/common.types'|g" {} \;

echo "✅ Language import issues fixed!"
echo "📝 All import paths now use @/ aliases consistently"
