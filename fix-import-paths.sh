#!/bin/bash

# Fix Import Path Errors Script
# This script fixes all broken import paths

echo "🔧 Fixing Import Path Errors..."

# Fix popup-system imports
find apps/client/src/components/features/popup-system -name "*.tsx" -exec sed -i '' "s|'../types/common.types'|'@/types/common.types'|g" {} \;
find apps/client/src/components/features/popup-system -name "*.tsx" -exec sed -i '' "s|\"../types/common.types\"|\"@/types/common.types\"|g" {} \;

# Fix voice-assistant imports
find apps/client/src/components/features/voice-assistant -name "*.tsx" -exec sed -i '' "s|'@/types/interface1.types'|'@/types/interface1.types'|g" {} \;

# Add Language import to files that need it
find apps/client/src/components/features/voice-assistant -name "*.tsx" -exec grep -l "Language" {} \; | xargs -I {} sed -i '' "1i\\
import type { Language } from '@/types/common.types';
" {}

echo "✅ Import path errors fixed!"
