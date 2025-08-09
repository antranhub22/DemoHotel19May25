#!/bin/bash

echo "🚀 Phase 4: Fixing TypeScript Errors - Pattern-based approach"
echo "=============================================================="

# Pattern 1: Fix remaining TS2749 component type errors
echo "📝 Phase 4.1: Fixing remaining TS2749 component type errors..."

# VoiceLanguageSwitcher
sed -i '' 's/React\.FC<VoiceLanguageSwitcher>/React.FC<VoiceLanguageSwitcherProps>/g' apps/client/src/components/features/voice-assistant/interface1/VoiceLanguageSwitcher.tsx

# SiriButtonVisual  
sed -i '' 's/React\.FC<SiriButtonVisual>/React.FC<SiriButtonVisualProps>/g' apps/client/src/components/features/voice-assistant/siri/components/SiriButtonVisual.tsx

# MobileTouchDebugger
sed -i '' 's/React\.FC<MobileTouchDebugger>/React.FC<MobileTouchDebuggerProps>/g' apps/client/src/components/features/voice-assistant/siri/MobileTouchDebugger.tsx

# TranscriptDisplay
sed -i '' 's/React\.FC<TranscriptDisplay>/React.FC<TranscriptDisplayProps>/g' apps/client/src/components/ui/TranscriptDisplay.tsx

# VapiProvider
sed -i '' 's/React\.FC<VapiProvider>/React.FC<VapiProviderProps>/g' apps/client/src/context/contexts/VapiContextSimple.tsx

# HotelProvider  
sed -i '' 's/React\.FC<HotelProvider>/React.FC<HotelProviderProps>/g' apps/client/src/context/HotelContext.tsx

# CreateTenantModal
sed -i '' 's/React\.FC<CreateTenantModal>/React.FC<CreateTenantModalProps>/g' apps/client/src/domains/saas-provider/components/admin/TenantManagementPanel.tsx

echo "✅ Phase 4.1 Complete: Component types fixed"

# Pattern 2: Fix Language type conflicts (packages/types vs apps/client/src/types)
echo "📝 Phase 4.2: Fixing Language type conflicts..."

# Replace imports from packages/types with apps/client/src/types for Language
find apps/client/src -name "*.tsx" -o -name "*.ts" | xargs grep -l "import.*Language.*packages/types" | while read file; do
    echo "  Fixing Language import in: $file"
    sed -i '' 's|import.*Language.*from.*packages/types.*|import type { Language } from "@/types/common.types";|g' "$file"
done

echo "✅ Phase 4.2 Complete: Language import conflicts fixed"

# Pattern 3: Add missing Props interfaces for components
echo "📝 Phase 4.3: Adding missing Props interfaces..."

# Add Props interface before component definitions
cat >> apps/client/src/components/features/voice-assistant/interface1/VoiceLanguageSwitcher.tsx << 'EOF'

interface VoiceLanguageSwitcherProps {
  onLanguageChange?: (language: string) => void;
  currentLanguage?: string;
  className?: string;
}
EOF

cat >> apps/client/src/components/features/voice-assistant/siri/components/SiriButtonVisual.tsx << 'EOF'

interface SiriButtonVisualProps {
  isListening?: boolean;
  isLoading?: boolean;
  isConnected?: boolean;
  className?: string;
}
EOF

cat >> apps/client/src/components/features/voice-assistant/siri/MobileTouchDebugger.tsx << 'EOF'

interface MobileTouchDebuggerProps {
  enabled?: boolean;
  className?: string;
}
EOF

cat >> apps/client/src/components/ui/TranscriptDisplay.tsx << 'EOF'

interface TranscriptDisplayProps {
  transcript?: string;
  isListening?: boolean;
  className?: string;
}
EOF

cat >> apps/client/src/context/contexts/VapiContextSimple.tsx << 'EOF'

interface VapiProviderProps {
  children: React.ReactNode;
  publicKey?: string;
  assistantId?: string;
}
EOF

cat >> apps/client/src/context/HotelContext.tsx << 'EOF'

interface HotelProviderProps {
  children: React.ReactNode;
  tenantId?: string;
}
EOF

cat >> apps/client/src/domains/saas-provider/components/admin/TenantManagementPanel.tsx << 'EOF'

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
EOF

echo "✅ Phase 4.3 Complete: Props interfaces added"

echo ""
echo "🎯 Phase 4 Summary:"
echo "  ✅ Fixed remaining TS2749 component type errors"
echo "  ✅ Fixed Language type import conflicts"  
echo "  ✅ Added missing Props interfaces"
echo ""
echo "🔍 Checking progress..."
npm run type-check 2>&1 | grep "error TS" | wc -l
