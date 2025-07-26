#!/bin/bash

# ================================================================
# 🏨 MI NHON HOTEL - ENVIRONMENT SWITCHER (SIMPLIFIED)
# ================================================================
# Usage: ./scripts/switch-env.sh [local|production]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

ENV_TYPE="${1:-local}"

echo "🔧 Switching to $ENV_TYPE environment..."

cd "$PROJECT_ROOT"

case "$ENV_TYPE" in
  "local"|"dev")
    echo "💻 Setting up local development environment..."
    if [ -f ".env.local" ]; then
      cp .env.local .env
      echo "✅ Copied .env.local to .env"
    else
      echo "❌ .env.local not found!"
      echo "💡 Creating from template..."
      cp .env.example .env.local
      cp .env.local .env
      echo "⚠️  Please update .env.local with your local development values"
    fi
    ;;
    
  "production"|"prod")
    echo "🚀 Setting up production environment..."
    echo "⚠️  PRODUCTION MODE - Use with caution!"
    echo "💡 For production, set environment variables directly on your hosting platform"
    echo "📋 Required environment variables:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - VITE_OPENAI_API_KEY"
    echo "   - VITE_VAPI_PUBLIC_KEY"
    echo "   - VITE_VAPI_ASSISTANT_ID"
    echo "   - MAILJET_API_KEY (optional)"
    echo "   - And other service-specific keys..."
    
    # Don't copy production env file, just show guidance
    echo ""
    echo "🔐 For security, production values should be set in:"
    echo "   - Render: Dashboard > Environment"
    echo "   - Vercel: Project Settings > Environment Variables"
    echo "   - Heroku: Config Vars"
    echo "   - Docker: docker-compose.yml or Kubernetes secrets"
    ;;
    
  *)
    echo "❌ Invalid environment type: $ENV_TYPE"
    echo "📋 Available options:"
    echo "   - local (or dev) - for local development"
    echo "   - production (or prod) - for production deployment"
    echo ""
    echo "📖 Usage:"
    echo "   ./scripts/switch-env.sh local"
    echo "   ./scripts/switch-env.sh production"
    exit 1
    ;;
esac

echo ""
echo "🎯 Environment: $ENV_TYPE"
echo "📁 Project: $PROJECT_ROOT"

if [ -f ".env" ]; then
  echo "📋 Current .env configuration:"
  echo "   NODE_ENV=$(grep '^NODE_ENV=' .env 2>/dev/null | cut -d'=' -f2 || echo 'not set')"
  echo "   PORT=$(grep '^PORT=' .env 2>/dev/null | cut -d'=' -f2 || echo 'not set')"
  echo "   DATABASE_URL=$(grep '^DATABASE_URL=' .env 2>/dev/null | cut -d'=' -f2 | sed 's/postgresql:\/\/[^:]*:[^@]*@/postgresql:\/\/***:***@/' || echo 'not set')"
  echo ""
fi

echo "✅ Environment switch complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Review and update .env with your actual values"
echo "   2. Start the application: npm run dev"
echo "   3. Test the voice assistant and database connection"
echo ""
echo "🔍 Quick health check:"
echo "   npm run validate:env  # Check environment variables"
echo "   npm run test:db       # Test database connection" 