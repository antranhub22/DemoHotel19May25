# 🚀 Auth System Deployment Guide

## 📋 Overview

Complete deployment guide for the reorganized auth system in production and development environments.

---

## 🏗️ Architecture Overview

```
auth-system/
├── types/              # Shared TypeScript types
├── config/             # JWT & RBAC configuration
├── services/           # Business logic services  
├── middleware/         # Express middleware
├── routes/             # API route handlers
├── frontend/           # React components & hooks
├── tests/              # Testing suites
├── docs/               # Documentation
└── scripts/            # Deployment scripts
```

---

## 🔧 Environment Setup

### **Required Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-different-from-jwt

# Application
NODE_ENV=production
PORT=10000

# Optional: Enhanced security
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
```

### **Development Environment:**
```bash
# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://hotel_user:dev_password@localhost:5432/hotel_dev
JWT_SECRET=dev-secret-key-for-testing-only-change-in-production
NODE_ENV=development
PORT=3000
EOF
```

### **Production Environment:**
```bash
# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Set environment variables
export DATABASE_URL="postgresql://..."
export JWT_SECRET="$JWT_SECRET"
export JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
export NODE_ENV="production"
export PORT="10000"
```

---

## 🐳 Docker Deployment

### **Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 10000

CMD ["npm", "start"]
```

### **Docker Compose:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "10000:10000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/hotel
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=hotel
      - POSTGRES_USER=postgres  
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

---

## ☁️ Cloud Deployment

### **Render.com:**
```yaml
# render.yaml
services:
  - type: web
    name: hotel-auth-system
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: hotel-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production

databases:
  - name: hotel-db
    databaseName: hotel
    user: hotel_user
```

### **Heroku:**
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create hotel-auth-system

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### **Vercel:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "apps/client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "apps/client/dist/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "NODE_ENV": "production"
  }
}
```

---

## 🗄️ Database Setup

### **PostgreSQL Setup:**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE hotel_auth;
CREATE USER hotel_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE hotel_auth TO hotel_user;
EOF
```

### **Database Migration:**
```typescript
// Migration script
import { db } from './auth-system/config';
import { staff, tenants } from './auth-system/types';

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    // Create tables
    await db.migrate();
    
    // Seed default data
    await seedDefaultData();
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function seedDefaultData() {
  // Create default tenant
  const tenant = await db.insert(tenants).values({
    id: 'default-hotel',
    hotelName: 'Demo Hotel',
    subscriptionPlan: 'premium',
    subscriptionStatus: 'active'
  }).returning();

  // Create admin user
  await db.insert(staff).values({
    id: 'admin-user',
    username: 'admin',
    password: await bcrypt.hash('admin123', 12),
    role: 'hotel-manager',
    tenantId: tenant[0].id,
    isActive: true
  });
}
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy Auth System

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          JWT_SECRET: test-secret-key-for-ci-only
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

---

## 🔒 Security Configuration

### **Production Security Checklist:**

#### **1. Environment Security:**
```bash
# ✅ Use strong, unique secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# ✅ Enable HTTPS
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem

# ✅ Set secure headers
HELMET_ENABLED=true
CORS_ORIGIN=https://yourdomain.com
```

#### **2. Database Security:**
```sql
-- Create dedicated database user
CREATE USER auth_service WITH PASSWORD 'strong_random_password';

-- Grant minimal necessary permissions
GRANT CONNECT ON DATABASE hotel_auth TO auth_service;
GRANT USAGE ON SCHEMA public TO auth_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON staff, tenants TO auth_service;

-- Enable SSL connections
ALTER SYSTEM SET ssl = on;
```

#### **3. Application Security:**
```typescript
// Security middleware
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Helmet for security headers
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many auth attempts',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth', authLimiter);
```

---

## 📊 Monitoring & Logging

### **Application Monitoring:**
```typescript
import winston from 'winston';

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'auth-system' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Auth event logging
class AuthLogger {
  static logLogin(username: string, success: boolean, ip: string) {
    logger.info('Login attempt', {
      username,
      success,
      ip,
      timestamp: new Date().toISOString()
    });
  }

  static logPermissionCheck(userId: string, module: string, action: string, granted: boolean) {
    logger.info('Permission check', {
      userId,
      module,
      action,
      granted,
      timestamp: new Date().toISOString()
    });
  }
}
```

### **Health Checks:**
```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.raw('SELECT 1');
    
    // Check auth service
    const authHealthy = await UnifiedAuthService.healthCheck();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime(),
      database: 'connected',
      auth: authHealthy ? 'healthy' : 'unhealthy'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## 🧪 Testing in Production

### **Smoke Tests:**
```bash
#!/bin/bash
# production-smoke-test.sh

API_URL="${API_URL:-https://your-domain.com}"

echo "🧪 Running production smoke tests..."

# Test health endpoint
echo "Testing health endpoint..."
curl -f "$API_URL/health" || exit 1

# Test auth endpoint
echo "Testing auth endpoint..."
response=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}')

if echo "$response" | grep -q "success"; then
  echo "✅ Auth endpoint working"
else
  echo "❌ Auth endpoint failed"
  exit 1
fi

echo "✅ All smoke tests passed"
```

### **Load Testing:**
```javascript
// k6 load test
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10, // 10 virtual users
  duration: '30s',
};

export default function() {
  let response = http.post('https://your-domain.com/api/auth/login', {
    username: 'test',
    password: 'test'
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. "Invalid Token" Errors:**
```bash
# Check JWT secret
echo $JWT_SECRET | wc -c  # Should be > 32 characters

# Verify token format
curl -H "Authorization: Bearer TOKEN" /api/auth/me

# Check token expiration
node -e "console.log(new Date(JSON.parse(atob('PAYLOAD_PART')).exp * 1000))"
```

#### **2. Database Connection Issues:**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check connection pool
netstat -an | grep :5432
```

#### **3. Permission Denied:**
```bash
# Check user role and permissions
curl -H "Authorization: Bearer TOKEN" /api/auth/me

# Verify RBAC configuration
node -e "console.log(require('./auth-system/types').ROLE_HIERARCHY)"
```

### **Debug Mode:**
```bash
# Enable debug logging
DEBUG=auth:* NODE_ENV=development npm start

# View auth system logs
tail -f logs/auth.log

# Check system health
curl /health | jq
```

---

## 📋 Deployment Checklist

### **Pre-Deployment:**
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates installed
- [ ] Backup procedures in place
- [ ] Monitoring configured
- [ ] Load testing completed

### **Deployment:**
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Check health endpoints
- [ ] Verify auth flow
- [ ] Monitor error rates
- [ ] Test rollback procedure

### **Post-Deployment:**
- [ ] Monitor application logs
- [ ] Check performance metrics
- [ ] Verify user authentication
- [ ] Test permission system
- [ ] Update documentation
- [ ] Notify team of completion

---

## 🔄 Maintenance

### **Regular Tasks:**
```bash
# Weekly tasks
./scripts/rotate-jwt-secrets.sh
./scripts/cleanup-expired-tokens.sh
./scripts/audit-user-permissions.sh

# Monthly tasks
./scripts/database-backup.sh
./scripts/security-audit.sh
./scripts/performance-review.sh
```

### **Updates & Patches:**
```bash
# Update dependencies
npm audit fix
npm update

# Test updates
npm test
npm run type-check

# Deploy updates
./scripts/deploy-update.sh
```

---

**📝 Last Updated**: July 20, 2024  
**🔗 Related**: [Auth API](./AUTH_API.md) | [JWT Guide](./JWT_GUIDE.md) | [RBAC Guide](./RBAC_GUIDE.md) 