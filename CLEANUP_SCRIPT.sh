#!/bin/bash

# 🧹 SUMMARY SYSTEM CLEANUP SCRIPT
# Removes all legacy files after unified architecture implementation

set -e

echo "🧹 Starting Summary System Cleanup..."
echo "⚠️  This will permanently delete legacy files"
echo ""

# Create backup directory
BACKUP_DIR="./backup-legacy-summary-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in: $BACKUP_DIR"

# 1. LEGACY INTERFACE COMPONENTS
echo ""
echo "🗑️  Phase 1: Legacy Interface Components"

if [ -f "apps/client/src/components/business/Interface1Desktop.tsx" ]; then
    echo "   📁 Backing up Interface1Desktop.tsx..."
    cp "apps/client/src/components/business/Interface1Desktop.tsx" "$BACKUP_DIR/"
    echo "   🗑️  Deleting Interface1Desktop.tsx..."
    rm "apps/client/src/components/business/Interface1Desktop.tsx"
    echo "   ✅ Interface1Desktop.tsx removed"
fi

if [ -f "apps/client/src/components/business/Interface1Mobile.tsx" ]; then
    echo "   📁 Backing up Interface1Mobile.tsx..."
    cp "apps/client/src/components/business/Interface1Mobile.tsx" "$BACKUP_DIR/"
    echo "   🗑️  Deleting Interface1Mobile.tsx..."
    rm "apps/client/src/components/business/Interface1Mobile.tsx"
    echo "   ✅ Interface1Mobile.tsx removed"
fi

# 2. LEGACY SUMMARY POPUPS
echo ""
echo "🗑️  Phase 2: Legacy Summary Popup Components"

if [ -f "apps/client/src/components/features/popup-system/MobileSummaryPopup.tsx" ]; then
    echo "   📁 Backing up MobileSummaryPopup.tsx..."
    cp "apps/client/src/components/features/popup-system/MobileSummaryPopup.tsx" "$BACKUP_DIR/"
    echo "   🗑️  Deleting MobileSummaryPopup.tsx..."
    rm "apps/client/src/components/features/popup-system/MobileSummaryPopup.tsx"
    echo "   ✅ MobileSummaryPopup.tsx removed"
fi

if [ -f "apps/client/src/components/features/popup-system/DesktopSummaryPopup.tsx" ]; then
    echo "   📁 Backing up DesktopSummaryPopup.tsx..."
    cp "apps/client/src/components/features/popup-system/DesktopSummaryPopup.tsx" "$BACKUP_DIR/"
    echo "   🗑️  Deleting DesktopSummaryPopup.tsx..."
    rm "apps/client/src/components/features/popup-system/DesktopSummaryPopup.tsx"
    echo "   ✅ DesktopSummaryPopup.tsx removed"
fi

if [ -f "apps/client/src/components/features/popup-system/SummaryPopupContent.tsx" ]; then
    echo "   📁 Backing up SummaryPopupContent.tsx..."
    cp "apps/client/src/components/features/popup-system/SummaryPopupContent.tsx" "$BACKUP_DIR/"
    echo "   🗑️  Deleting SummaryPopupContent.tsx..."
    rm "apps/client/src/components/features/popup-system/SummaryPopupContent.tsx"
    echo "   ✅ SummaryPopupContent.tsx removed"
fi

# 3. LEGACY HOOKS
echo ""
echo "🗑️  Phase 3: Legacy Hooks"

if [ -f "apps/client/src/hooks/useConfirmHandler.ts" ]; then
    echo "   📁 Backing up useConfirmHandler.ts..."
    cp "apps/client/src/hooks/useConfirmHandler.ts" "$BACKUP_DIR/"
    echo "   🗑️  Deleting useConfirmHandler.ts..."
    rm "apps/client/src/hooks/useConfirmHandler.ts"
    echo "   ✅ useConfirmHandler.ts removed"
fi

# 4. DUPLICATE VOICE ASSISTANT
echo ""
echo "🗑️  Phase 4: Duplicate Voice Assistant"

if [ -f "apps/client/src/components/business/VoiceAssistantRefactored.tsx" ]; then
    echo "   📁 Backing up VoiceAssistantRefactored.tsx..."
    cp "apps/client/src/components/business/VoiceAssistantRefactored.tsx" "$BACKUP_DIR/"
    echo "   🗑️  Deleting VoiceAssistantRefactored.tsx..."
    rm "apps/client/src/components/business/VoiceAssistantRefactored.tsx"
    echo "   ✅ VoiceAssistantRefactored.tsx removed"
fi

# 5. CHECK FOR REMAINING REFERENCES
echo ""
echo "🔍 Phase 5: Checking for remaining references..."

echo "   📝 Searching for remaining useConfirmHandler references..."
if grep -r "useConfirmHandler" apps/client/src/ --exclude-dir=node_modules --exclude="*.log" 2>/dev/null | grep -v "backup"; then
    echo "   ⚠️  WARNING: Found remaining useConfirmHandler references!"
    echo "   📝 Manual cleanup required for these files"
else
    echo "   ✅ No useConfirmHandler references found"
fi

echo "   📝 Searching for remaining Interface1Desktop/Mobile references..."
if grep -r "Interface1Desktop\|Interface1Mobile" apps/client/src/ --exclude-dir=node_modules --exclude="*.log" 2>/dev/null | grep -v "backup"; then
    echo "   ⚠️  WARNING: Found remaining Interface1Desktop/Mobile references!"
    echo "   📝 Manual cleanup required for these files"
else
    echo "   ✅ No Interface1Desktop/Mobile references found"
fi

echo "   📝 Searching for remaining MobileSummaryPopup/DesktopSummaryPopup references..."
if grep -r "MobileSummaryPopup\|DesktopSummaryPopup" apps/client/src/ --exclude-dir=node_modules --exclude="*.log" 2>/dev/null | grep -v "backup"; then
    echo "   ⚠️  WARNING: Found remaining popup references!"
    echo "   📝 Manual cleanup required for these files"
else
    echo "   ✅ No legacy popup references found"
fi

# 6. SUMMARY
echo ""
echo "🎯 CLEANUP SUMMARY:"
echo "   📦 Backup created: $BACKUP_DIR"
echo "   🗑️  Removed legacy Interface components"
echo "   🗑️  Removed legacy Summary popup components"
echo "   🗑️  Removed legacy hooks"
echo "   🗑️  Removed duplicate VoiceAssistant"
echo ""
echo "✅ CLEANUP COMPLETED!"
echo ""
echo "🧪 NEXT STEPS:"
echo "   1. Run: npm run type-check:frontend"
echo "   2. Test application functionality"
echo "   3. If issues, restore from backup: $BACKUP_DIR"
echo "   4. If successful, remove backup after 1 week"
echo ""
echo "🚀 Legacy files cleaned up successfully!"
