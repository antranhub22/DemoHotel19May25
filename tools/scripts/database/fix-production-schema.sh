#!/bin/bash

# Fix Production Database Schema on Render
# This script adds missing columns to production database

echo "🔧 Production Database Schema Fix"
echo "================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable not set"
    echo "💡 Make sure you're running this with production environment variables"
    exit 1
fi

echo "📍 Target database: $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1)"
echo ""

# Confirm execution
read -p "🚨 This will modify the production database. Are you sure? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo ""
echo "🚀 Running schema migration..."

# Run the TypeScript migration script
npx tsx tools/scripts/fix-production-schema.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Schema migration completed successfully!"
    echo "🚀 You can now redeploy your application"
    echo ""
    echo "To redeploy on Render:"
    echo "  ./deploy-render.sh"
else
    echo "❌ Schema migration failed!"
    exit 1
fi 