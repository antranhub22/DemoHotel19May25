# 🛠️ Developer Environment Setup Guide

## Multi-Tenant Hotel Voice Assistant Platform

Complete guide for setting up the development environment for the Hotel Voice Assistant Platform with multi-tenant architecture.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [API Keys & Services](#api-keys--services)
5. [Installation Steps](#installation-steps)
6. [Development Workflow](#development-workflow)
7. [Testing Setup](#testing-setup)
8. [Deployment Guide](#deployment-guide)
9. [Common Issues](#common-issues)
10. [Advanced Configuration](#advanced-configuration)

---

## 🔧 Prerequisites

### System Requirements

```
Operating System:
✅ macOS 10.15+
✅ Ubuntu 20.04+
✅ Windows 10+ (with WSL2)
✅ Windows 11

Hardware:
- RAM: 8GB minimum, 16GB recommended
- Storage: 10GB free space
- CPU: 4 cores minimum
- Network: Stable internet connection
```

### Required Software

#### 1. Node.js & npm
```bash
# Install Node.js 18.x or higher
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

#### 2. Git
```bash
# Ubuntu/Debian
sudo apt-get install git

# macOS
brew install git

# Windows
# Download from https://git-scm.com/download/win
```

#### 3. Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

#### 4. Database (PostgreSQL)
```bash
# Option 1: Docker (Recommended for development)
docker run --name postgres-dev -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# Option 2: Local installation
sudo apt-get install postgresql postgresql-contrib
```

### Optional Development Tools

```bash
# VS Code (Recommended)
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list
sudo apt update
sudo apt install code

# Git GUI tools
sudo apt-get install gitk git-gui

# API testing tools
sudo snap install postman
```

---

## 🌐 Environment Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-organization/hotel-voice-assistant.git
cd hotel-voice-assistant

# Create development branch
git checkout -b feature/your-feature-name
```

### 2. Environment Variables

Create environment configuration files:

#### `.env` (Root level)
```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/hotel_assistant_dev
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=hotel_assistant_dev
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_PROJECT_ID=proj_your-project-id

# Vapi Configuration
VAPI_API_KEY=your-vapi-api-key
VAPI_PHONE_NUMBER=your-vapi-phone-number
VAPI_ASSISTANT_ID=your-default-assistant-id

# Google Services
GOOGLE_PLACES_API_KEY=your-google-places-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# AWS Configuration (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# Development Settings
NODE_ENV=development
PORT=3000
CLIENT_PORT=5173
API_BASE_URL=http://localhost:3000
CLIENT_BASE_URL=http://localhost:5173

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Session Configuration
SESSION_SECRET=your-session-secret
SESSION_EXPIRE=24h

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379
```

#### `client/.env` (Client-specific)
```bash
# Vite Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_BASE_URL=ws://localhost:3000

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-openai-api-key
VITE_OPENAI_PROJECT_ID=proj_your-project-id

# Vapi Configuration
VITE_VAPI_PUBLIC_KEY=pk_your-vapi-public-key
VITE_VAPI_ASSISTANT_ID=asst_your-assistant-id

# Google Configuration
VITE_GOOGLE_PLACES_API_KEY=your-google-places-api-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VOICE_CLONING=true
VITE_ENABLE_MULTI_LANGUAGE=true
VITE_ENABLE_DEBUG_MODE=true

# Development Settings
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

### 3. Set File Permissions

```bash
# Make environment files readable only by owner
chmod 600 .env
chmod 600 client/.env

# Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/*.ts
```

---

## 🗄️ Database Configuration

### 1. PostgreSQL Setup

#### Using Docker (Recommended)
```bash
# Create and start PostgreSQL container
docker run --name postgres-dev \
  -e POSTGRES_DB=hotel_assistant_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Connect to database
docker exec -it postgres-dev psql -U postgres -d hotel_assistant_dev
```

#### Local Installation
```bash
# Create database and user
sudo -u postgres psql

-- In PostgreSQL prompt:
CREATE DATABASE hotel_assistant_dev;
CREATE USER dev_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE hotel_assistant_dev TO dev_user;
\q
```

### 2. Database Schema Migration

```bash
# Install dependencies first
npm install

# Generate database schema
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 3. Database Tools

#### Install Database GUI Tools
```bash
# pgAdmin (Web-based)
docker run --name pgadmin-dev \
  -e PGADMIN_DEFAULT_EMAIL=admin@example.com \
  -e PGADMIN_DEFAULT_PASSWORD=password \
  -p 8080:80 \
  -d dpage/pgadmin4

# DBeaver (Desktop app)
sudo snap install dbeaver-ce
```

#### Database Backup/Restore
```bash
# Backup database
pg_dump -h localhost -U postgres hotel_assistant_dev > backup.sql

# Restore database
psql -h localhost -U postgres hotel_assistant_dev < backup.sql
```

---

## 🔑 API Keys & Services

### 1. OpenAI API Setup

```bash
# Get API key from https://platform.openai.com/api-keys
# Create project at https://platform.openai.com/projects

# Test OpenAI connection
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello, World!"}],
    "max_tokens": 50
  }'
```

### 2. Vapi API Setup

```bash
# Get API key from https://vapi.ai/dashboard
# Create assistant at https://vapi.ai/dashboard/assistants

# Test Vapi connection
curl -X GET https://api.vapi.ai/assistant \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY"
```

### 3. Google Places API Setup

```bash
# Enable APIs in Google Cloud Console:
# - Places API
# - Maps JavaScript API
# - Geocoding API

# Get API key from https://console.cloud.google.com/apis/credentials

# Test Google Places API
curl -X GET "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Grand%20Hotel&inputtype=textquery&fields=place_id,name,formatted_address&key=YOUR_API_KEY"
```

### 4. Email Service Setup

#### Gmail SMTP
```bash
# 1. Enable 2-factor authentication in Gmail
# 2. Generate app password: https://myaccount.google.com/apppasswords
# 3. Use app password in SMTP_PASSWORD
```

#### SendGrid (Alternative)
```bash
# Get API key from https://app.sendgrid.com/settings/api_keys

# Test SendGrid
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{
      "to": [{"email": "test@example.com"}],
      "subject": "Test Email"
    }],
    "from": {"email": "noreply@yourdomain.com"},
    "content": [{"type": "text/plain", "value": "Hello, World!"}]
  }'
```

---

## 📦 Installation Steps

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Client dependencies
cd client
npm install
cd ..

# Server dependencies
cd server
npm install
cd ..
```

### 2. Build Project

```bash
# Build client
npm run build:client

# Build server
npm run build:server

# Build everything
npm run build
```

### 3. Development Setup

```bash
# Generate database schema
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Start development servers
npm run dev
```

### 4. Verify Installation

```bash
# Check if servers are running
curl http://localhost:3000/api/health    # Server health check
curl http://localhost:5173              # Client dev server

# Check database connection
npm run db:check

# Run basic tests
npm run test:basic
```

---

## 🔄 Development Workflow

### 1. Start Development Environment

```bash
# Start all services
npm run dev

# Or start services individually
npm run dev:server    # Backend only
npm run dev:client    # Frontend only
npm run dev:db        # Database only
```

### 2. Development Commands

```bash
# Database operations
npm run db:generate   # Generate schema
npm run db:migrate    # Run migrations
npm run db:reset      # Reset database
npm run db:seed       # Seed sample data

# Code quality
npm run lint          # Run linter
npm run lint:fix      # Fix linting issues
npm run format        # Format code
npm run type-check    # TypeScript checks

# Testing
npm run test          # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e      # End-to-end tests
npm run test:watch    # Watch mode

# Building
npm run build         # Build for production
npm run build:client  # Build client only
npm run build:server  # Build server only
```

### 3. Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature description"

# Push branch
git push origin feature/your-feature-name

# Create pull request
# Use GitHub/GitLab interface
```

### 4. Code Style Guidelines

#### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### ESLint Configuration
```json
// .eslintrc.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
}
```

#### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## 🧪 Testing Setup

### 1. Test Configuration

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

#### Test Database Setup
```bash
# Create test database
createdb hotel_assistant_test

# Set test environment
export NODE_ENV=test
export DATABASE_URL=postgresql://postgres:password@localhost:5432/hotel_assistant_test

# Run test migrations
npm run db:migrate:test
```

### 2. Test Types

#### Unit Tests
```typescript
// tests/unit/hotel-research.test.ts
import { HotelResearchService } from '../../src/services/hotelResearch';

describe('HotelResearchService', () => {
  let service: HotelResearchService;

  beforeEach(() => {
    service = new HotelResearchService();
  });

  test('should research basic hotel data', async () => {
    const result = await service.basicResearch('Grand Hotel', 'New York');
    
    expect(result).toBeDefined();
    expect(result.basicInfo.name).toBe('Grand Hotel');
    expect(result.services).toBeInstanceOf(Array);
  });
});
```

#### Integration Tests
```typescript
// tests/integration/api.test.ts
import request from 'supertest';
import { app } from '../../src/app';

describe('API Integration Tests', () => {
  test('POST /api/dashboard/research-hotel', async () => {
    const response = await request(app)
      .post('/api/dashboard/research-hotel')
      .set('Authorization', 'Bearer test-token')
      .send({
        hotelName: 'Test Hotel',
        location: 'Test City'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

#### End-to-End Tests
```typescript
// tests/e2e/user-flow.test.ts
import { chromium, Browser, Page } from 'playwright';

describe('User Flow E2E Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  test('should complete hotel setup workflow', async () => {
    await page.goto('http://localhost:5173');
    
    // Login
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Hotel research
    await page.fill('[data-testid="hotel-name"]', 'Test Hotel');
    await page.click('[data-testid="research-button"]');
    
    // Wait for results
    await page.waitForSelector('[data-testid="research-results"]');
    
    expect(await page.textContent('[data-testid="hotel-name-display"]')).toBe('Test Hotel');
  });

  afterAll(async () => {
    await browser.close();
  });
});
```

### 3. Test Utilities

#### Test Data Factory
```typescript
// tests/utils/factory.ts
export const createTestTenant = () => ({
  id: 'test-tenant-id',
  hotelName: 'Test Hotel',
  subdomain: 'test-hotel',
  subscriptionPlan: 'professional',
  subscriptionStatus: 'active'
});

export const createTestUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  tenantId: 'test-tenant-id',
  role: 'admin'
});
```

#### Mock Services
```typescript
// tests/mocks/services.ts
export const mockOpenAIService = {
  generateCompletion: jest.fn().mockResolvedValue({
    choices: [{ message: { content: 'Test response' } }]
  })
};

export const mockVapiService = {
  createAssistant: jest.fn().mockResolvedValue('test-assistant-id'),
  updateAssistant: jest.fn().mockResolvedValue(true)
};
```

---

## 🚀 Deployment Guide

### 1. Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Run production tests
npm run test:production
```

### 2. Docker Deployment

#### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/hotel_assistant
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=hotel_assistant
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3. Environment-Specific Configurations

#### Production Environment
```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=strong-production-secret
LOG_LEVEL=info
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=1000
```

#### Staging Environment
```bash
# .env.staging
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@staging-host:5432/db
JWT_SECRET=staging-secret
LOG_LEVEL=debug
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=500
```

---

## 🔧 Common Issues

### 1. Database Connection Issues

**Problem:** Cannot connect to database
```bash
# Check database status
docker ps | grep postgres

# Check connection
psql -h localhost -U postgres -d hotel_assistant_dev

# Reset database
npm run db:reset
```

### 2. Port Conflicts

**Problem:** Port already in use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Use different port
PORT=3001 npm run dev
```

### 3. Environment Variables

**Problem:** Missing environment variables
```bash
# Check required variables
npm run env:check

# Copy from example
cp .env.example .env
```

### 4. Node Version Issues

**Problem:** Wrong Node.js version
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Use correct Node version
nvm install 18
nvm use 18

# Set default
nvm alias default 18
```

### 5. Permission Issues

**Problem:** Permission denied errors
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Fix file permissions
chmod -R 755 node_modules
```

---

## ⚙️ Advanced Configuration

### 1. Multi-Environment Setup

```bash
# Create environment-specific configs
configs/
├── development.json
├── staging.json
├── production.json
└── test.json
```

### 2. Custom Scripts

```json
// package.json scripts
{
  "scripts": {
    "dev:full": "concurrently \"npm run dev:server\" \"npm run dev:client\" \"npm run dev:db\"",
    "test:coverage": "jest --coverage",
    "db:backup": "pg_dump $DATABASE_URL > backup.sql",
    "db:restore": "psql $DATABASE_URL < backup.sql",
    "logs:tail": "tail -f logs/app.log",
    "monitor": "npm run logs:tail & npm run dev"
  }
}
```

### 3. IDE Configuration

#### VS Code Settings
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  }
}
```

#### VS Code Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "ms-python.python"
  ]
}
```

### 4. Monitoring & Logging

```typescript
// src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

---

## 📚 Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/)
- [pgAdmin](https://www.pgadmin.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Community
- [Stack Overflow](https://stackoverflow.com/)
- [GitHub Discussions](https://github.com/features/discussions)
- [Discord Community](https://discord.gg/developers)

---

## 🆘 Getting Help

### Support Channels
- **Email**: dev-support@talk2go.online
- **Slack**: #developers channel
- **GitHub**: Create an issue
- **Documentation**: https://dev-docs.talk2go.online

### Contribution Guidelines
- Follow the coding standards
- Write tests for new features
- Update documentation
- Submit pull requests for review

---

*This developer setup guide is regularly updated. For the latest version, check the repository documentation.*

**Last Updated:** January 2024  
**Version:** 2.0  
**Maintainer:** Development Team 