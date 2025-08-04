#!/bin/bash

# 🚀 Simple Deployment Script for Render
echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🏗️ Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build application
echo "🔨 Building application..."
npm run build:production

echo "✅ Deployment process completed!"