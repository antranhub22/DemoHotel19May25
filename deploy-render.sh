#!/bin/bash
set -e

echo "🚀 Render Deployment Script Starting..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Skip client build for now - serve from server
echo "⚠️ Skipping client build (serving via server)"

# Server doesn't need build (runs on tsx)
echo "✅ Server ready (runs on tsx)"

echo "🎉 Deployment ready!"
echo "Note: Client served via server static files" 