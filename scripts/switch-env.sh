#!/bin/bash

# ================================================================
# 🏨 MI NHON HOTEL - ENVIRONMENT SWITCHER
# ================================================================
# Usage: ./scripts/switch-env.sh [development|staging|production]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

ENV_TYPE="${1:-development}"

echo "🔧 Switching to $ENV_TYPE environment..."

cd "$PROJECT_ROOT"

case "$ENV_TYPE" in
  "development"|"dev")
    echo "📚 Setting up development environment..."
    if [ -f ".env.development" ]; then
      cp .env.development .env
      echo "✅ Copied .env.development to .env"
    else
      echo "❌ .env.development not found!"
      echo "💡 Creating from template..."
      cp .env.example .env.development
      cp .env.development .env
      echo "⚠️  Please update .env.development with your development values"
    fi
    ;;
    
  "staging")
    echo "🎭 Setting up staging environment..."
    if [ -f ".env.staging" ]; then
      cp .env.staging .env
      echo "✅ Copied .env.staging to .env"
    else
      echo "❌ .env.staging not found!"
      echo "💡 Creating from template..."
      cp .env.example .env.staging
      cp .env.staging .env
      echo "⚠️  Please update .env.staging with your staging values"
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
    echo "   - development (or dev)"
    echo "   - staging"
    echo "   - production (or prod)"
    echo ""
    echo "📖 Usage:"
    echo "   ./scripts/switch-env.sh development"
    echo "   ./scripts/switch-env.sh staging"
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