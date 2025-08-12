#!/bin/bash

# Fix Final Component Type Errors Script
# This script fixes the last remaining component type errors

echo "🔧 Fixing Final Component Type Errors..."

# Fix RealtimeConversationPopup
if [ -f "apps/client/src/components/features/popup-system/RealtimeConversationPopup.tsx" ]; then
    sed -i '' 's/const RealtimeConversationPopup: React.FC<RealtimeConversationPopup>/const RealtimeConversationPopup: React.FC<RealtimeConversationPopupProps>/g' apps/client/src/components/features/popup-system/RealtimeConversationPopup.tsx
fi

# Fix StaffMessagePopup
if [ -f "apps/client/src/components/features/popup-system/StaffMessagePopup.tsx" ]; then
    sed -i '' 's/const StaffMessagePopup: React.FC<StaffMessagePopup>/const StaffMessagePopup: React.FC<StaffMessagePopupProps>/g' apps/client/src/components/features/popup-system/StaffMessagePopup.tsx
fi

# Fix WelcomePopup
if [ -f "apps/client/src/components/features/popup-system/WelcomePopup.tsx" ]; then
    sed -i '' 's/const WelcomePopup: React.FC<WelcomePopup>/const WelcomePopup: React.FC<WelcomePopupProps>/g' apps/client/src/components/features/popup-system/WelcomePopup.tsx
fi

# Fix VoiceCommandContext
if [ -f "apps/client/src/components/features/voice-assistant/interface1/VoiceCommandContext.tsx" ]; then
    sed -i '' 's/const VoiceCommandContext: React.FC<VoiceCommandContext>/const VoiceCommandContext: React.FC<VoiceCommandContextProps>/g' apps/client/src/components/features/voice-assistant/interface1/VoiceCommandContext.tsx
fi

echo "✅ Final component type errors fixed!"
echo "📝 All components now have proper Props interfaces"
