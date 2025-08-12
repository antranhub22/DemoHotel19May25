#!/bin/bash

echo "🔧 Phase 7: Fixing Duplicate Properties in VoiceCommandContext"
echo "============================================================="

file="apps/client/src/components/features/voice-assistant/interface1/VoiceCommandContext.tsx"

# Remove Korean content in zh properties (these are duplicates from ko->zh replacement)
echo "📝 Removing Korean duplicates in zh properties..."

# Remove Korean duplicate #1 (around line 149)
sed -i '' '/zh: {$/,/한국어.*도움/{ 
    /zh: {$/,/},$/d
}' "$file"

echo "  ✅ Removed Korean duplicates"

# Also fix useAssistant import issue
echo "📝 Adding missing useAssistant import..."
sed -i '' '/^import { useCallback, useEffect, useState } from '\''react'\'';$/a\
import { useAssistant } from '\''@/context'\'';
' "$file"

echo "  ✅ Added useAssistant import"

echo ""
echo "📝 Checking progress..."
error_count=$(npm run type-check 2>&1 | grep "error TS" | wc -l)
echo "Current errors: $error_count"

echo ""
echo "🎯 Duplicate Fixes Summary:"
echo "  ✅ Removed Korean duplicate zh properties"
echo "  ✅ Added missing useAssistant import"
echo "  📊 Progress: Targeting significant error reduction"
