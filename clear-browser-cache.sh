#!/bin/bash

# 🧹 Browser Cache Clearing Script for DemoHotel19May
# Fixes MIME type issues caused by cached assets

echo "🧹 Clearing browser cache for DemoHotel19May..."

# Force rebuild to ensure fresh assets
echo "📦 Rebuilding application with fresh assets..."
npm run build

# Clear Vite dev server cache
echo "🗑️ Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf apps/client/node_modules/.vite

# Clear dist and rebuild
echo "🔄 Force rebuilding dist folder..."
rm -rf dist
npm run build

echo "✅ Cache clearing completed!"
echo ""
echo "🔧 Next Steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Hard refresh browser:"
echo "   - Chrome/Firefox: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   - Or open DevTools → Right-click refresh → Empty Cache and Hard Reload"
echo "3. If still having issues, clear browser data for this site"
echo ""
echo "🌐 For production deployment:"
echo "   - Clear CDN cache if using one"
echo "   - Restart production server: npm run start" 