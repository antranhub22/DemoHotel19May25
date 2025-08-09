#!/bin/bash

# TypeScript Mode Switcher Script
# Usage: bash scripts/switch-typescript-mode.sh [strict|relaxed]

MODE=${1:-"relaxed"}

case $MODE in
  "strict")
    echo "🔒 Switching to STRICT TypeScript mode..."
    if [ -f "tsconfig.strict.json" ]; then
      cp tsconfig.strict.json tsconfig.json
      echo "✅ Strict mode activated"
      echo "💡 Run: npm run type-check to see all errors"
    else
      echo "❌ tsconfig.strict.json not found!"
      exit 1
    fi
    ;;
    
  "relaxed")
    echo "🚀 Switching to RELAXED TypeScript mode..."
    if [ -f "tsconfig.strict.json" ]; then
      # Relaxed config is already in tsconfig.json
      echo "✅ Relaxed mode is active"
      echo "💡 Run: npm run type-check to see reduced errors"
    else
      echo "⚠️  No strict backup found. Creating one..."
      cp tsconfig.json tsconfig.strict.json
      echo "✅ Backup created and relaxed mode active"
    fi
    ;;
    
  *)
    echo "❌ Invalid mode: $MODE"
    echo "Usage: $0 [strict|relaxed]"
    exit 1
    ;;
esac

echo ""
echo "📊 Current TypeScript error count:"
npm run type-check 2>&1 | grep "error TS" | wc -l | awk '{print "   " $1 " errors"}'