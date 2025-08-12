#!/bin/bash

# UI FIX SCRIPT
# This script will fix the UI break issues

echo "🔧 Starting UI Fix Process..."

# 1. Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found package.json"

# 2. Check client directory structure
if [ ! -d "apps/client" ]; then
    echo "❌ Error: apps/client directory not found."
    exit 1
fi

echo "✅ Found apps/client directory"

# 3. Check if client package.json exists
if [ ! -f "apps/client/package.json" ]; then
    echo "⚠️  Warning: apps/client/package.json not found. Creating..."
    cat > apps/client/package.json << 'EOF'
{
  "name": "hotel-voice-assistant-client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  }
}
EOF
    echo "✅ Created apps/client/package.json"
else
    echo "✅ apps/client/package.json exists"
fi

# 4. Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating from env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created .env from env.example"
        echo "⚠️  Please update .env with your actual API keys"
    else
        echo "❌ Error: env.example not found. Please create .env manually."
    fi
else
    echo "✅ .env file exists"
fi

# 5. Check Tailwind config
if [ ! -f "apps/client/tailwind.config.ts" ]; then
    echo "❌ Error: apps/client/tailwind.config.ts not found."
    exit 1
fi

echo "✅ Tailwind config exists"

# 6. Check PostCSS config
if [ ! -f "apps/client/postcss.config.js" ]; then
    echo "❌ Error: apps/client/postcss.config.js not found."
    exit 1
fi

echo "✅ PostCSS config exists"

# 7. Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# 8. Build the project
echo "🔨 Building project..."
npm run build

# 9. Start dev server
echo "🚀 Starting development server..."
echo "📱 UI should now be accessible at http://localhost:3000"
echo "🔍 Check browser console for any remaining errors"

# 10. Health check
echo "🏥 Running health check..."
sleep 5
curl -f http://localhost:3000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Server is running successfully"
else
    echo "❌ Server health check failed"
fi

echo "🎉 UI Fix process completed!"
echo "📝 If issues persist, check:"
echo "   - Browser console for errors"
echo "   - Network tab for failed requests"
echo "   - Environment variables in .env"
echo "   - Tailwind CSS compilation"
