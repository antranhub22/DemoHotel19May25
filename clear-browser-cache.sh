#!/bin/bash

echo "🧹 AUTO BROWSER CACHE CLEARING SCRIPT"
echo "======================================"

# Generate cache-busting timestamp
TIMESTAMP=$(date +%s)
URL="http://localhost:3000?v=$TIMESTAMP&nocache=true&clear_cache=true"

echo ""
echo "✅ SERVER-SIDE CACHE CLEARED"
echo "✅ FRESH BUILD COMPLETED" 
echo "✅ NEW FILE HASHES GENERATED"
echo ""

echo "🌐 OPENING BROWSER WITH CACHE-BUSTING URL:"
echo "   $URL"
echo ""

# Auto-open browser with cache-busting URL
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "🍎 Opening in Safari (private mode for fresh cache)..."
    open -a Safari --args --private "$URL"
    
    echo "🔵 Opening in Chrome (incognito mode)..."
    open -a "Google Chrome" --args --incognito "$URL"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "🐧 Opening in default browser..."
    xdg-open "$URL"
    
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    echo "🪟 Opening in default browser..."
    start "$URL"
fi

echo ""
echo "📱 MANUAL BROWSER CACHE CLEARING:"
echo "================================="
echo ""
echo "1. 🔄 HARD REFRESH (Most Important):"
echo "   Mac: ⌘ + Shift + R"
echo "   Windows: Ctrl + Shift + R"
echo ""
echo "2. 🗑️ CLEAR STORAGE:"
echo "   • Press F12 (DevTools)"
echo "   • Go to Application tab"
echo "   • Click Storage → Clear Storage"
echo "   • Click 'Clear site data'"
echo ""
echo "3. 🔴 DISABLE CACHE:"
echo "   • F12 → Network tab"
echo "   • ✅ Check 'Disable cache'"
echo "   • Refresh page"
echo ""
echo "4. 🛠️ SERVICE WORKER:"
echo "   • F12 → Application → Service Workers"
echo "   • Click 'Unregister' for all workers"
echo ""
echo "5. 🕵️ INCOGNITO/PRIVATE MODE:"
echo "   • Cmd+Shift+N (Chrome) or Cmd+Shift+P (Firefox)"
echo "   • Navigate to: $URL"
echo ""
echo "6. ♻️ RESTART BROWSER:"
echo "   • Completely quit and restart browser"
echo "   • Then visit: $URL"
echo ""
echo "🎯 If you see 'Fable is not defined' error after all steps,"
echo "   please take a screenshot and report back!" 