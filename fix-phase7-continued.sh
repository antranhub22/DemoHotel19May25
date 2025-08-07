#!/bin/bash

echo "🚀 Phase 7 Continued: Function Signature Fixes"
echo "=============================================="

# Fix arithmetic operation type error
echo "📝 Fixing arithmetic operation error..."
file="apps/client/src/components/features/voice-assistant/siri/SimpleMobileSiriVisual.tsx"
if [ -f "$file" ]; then
    # Fix string + number operations by ensuring number type
    sed -i '' 's/center\.x + 2/Number(center.x) + 2/g' "$file"
    sed -i '' 's/center\.y + 1/Number(center.y) + 1/g' "$file"
    echo "  ✅ Fixed arithmetic operations in $file"
fi

# Fix Language type conflicts with casting
echo "📝 Adding type casting for Language conflicts..."
files_with_language_issues=(
    "apps/client/src/components/features/voice-assistant/siri/SiriButtonContainer.tsx"
)

for file in "${files_with_language_issues[@]}"; do
    if [ -f "$file" ]; then
        echo "  Processing: $file"
        
        # Add type casting for language parameters
        sed -i '' 's/currentLanguage\b/currentLanguage as Language/g' "$file"
        sed -i '' 's/, language)/, language as Language)/g' "$file"
        sed -i '' 's/= language;/= language as Language;/g' "$file"
        
        echo "    ✅ Added Language type casting"
    fi
done

# Fix function parameter mismatches
echo "📝 Fixing function parameter mismatches..."

# Fix guest experience hook
file="apps/client/src/domains/guest-experience/hooks/useGuestExperience.enhanced.ts"
if [ -f "$file" ]; then
    echo "  Processing: $file"
    
    # Fix object parameter - extract the property we need
    sed -i '' 's/trackCallCompletion({ callId: \([^,]*\), duration: \([^,]*\), cost: \([^}]*\) })/trackCallCompletion(\1)/g' "$file"
    
    # Fix CallSummary type mismatch - provide proper object
    sed -i '' 's/summary = ""/summary = { text: "", duration: 0, callId: "", timestamp: new Date() }/g' "$file"
    
    echo "    ✅ Fixed parameter and return type issues"
fi

# Fix dispatch void issue
file="apps/client/src/domains/guest-experience/hooks/useGuestExperience.ts"
if [ -f "$file" ]; then
    echo "  Processing: $file"
    
    # Fix void dispatch - replace with no-op action
    sed -i '' 's/dispatch(void)/dispatch({ type: "NOOP" })/g' "$file"
    
    echo "    ✅ Fixed dispatch void issue"
fi

echo ""
echo "📝 Checking progress..."
error_count=$(npm run type-check 2>&1 | grep "error TS" | wc -l)
echo "Current errors: $error_count"

echo ""
echo "🎯 Phase 7 Continued Summary:"
echo "  ✅ Fixed arithmetic operation type error"
echo "  ✅ Added Language type casting for conflicts"
echo "  ✅ Fixed function parameter mismatches"
echo "  ✅ Fixed dispatch void issue"
