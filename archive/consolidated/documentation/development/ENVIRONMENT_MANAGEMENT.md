# 🌍 Environment Management System

## 📋 **Overview**

The Mi Nhon Hotel Voice Assistant uses a sophisticated environment management system to handle
different deployment environments (development, staging, production) with proper security and
configuration isolation.

## 📁 **File Structure**

```
DemoHotel19May/
├── .env.example           # 📄 Template with all possible variables
├── .env.development       # 🔧 Development-specific config
├── .env.staging          # 🎭 Staging environment config
├── .env                  # 🚀 Active configuration (git-ignored)
├── config/env/
│   └── .env.local        # 🏠 Local overrides (git-ignored)
└── scripts/
    ├── switch-env.sh     # 🔄 Environment switcher script
    └── validate-env.js   # ✅ Environment validator
```

## 🎯 **Quick Start**

### **1. Setup Development Environment**

```bash
# Clone and setup
git clone <repository-url>
cd DemoHotel19May

# Switch to development environment
npm run env:development

# Validate environment
npm run validate:env

# Start development server
npm run dev
```

### **2. Available Commands**

```bash
# Environment Switching
npm run env:development    # Switch to development
npm run env:dev           # Alias for development
npm run env:staging       # Switch to staging
npm run env:production    # Production guidance

# Environment Validation
npm run validate:env      # Full validation
npm run validate:env:structure  # Check file structure
npm run validate:env:format     # Check variable formats

# Help
npm run env:help         # Show environment help
```

## 🔧 **Environment Types**

### **🔬 Development (.env.development)**

- **Purpose**: Local development and testing
- **Database**: SQLite (file:./dev.db)
- **APIs**: Development/test keys
- **Security**: Relaxed CORS, extended rate limits
- **Debugging**: All debug flags enabled
- **Auto-features**: Migration, seeding, DB fixes enabled

**Ideal for:**

- ✅ Local development
- ✅ Feature testing
- ✅ Database schema changes
- ✅ API integration testing

### **🎭 Staging (.env.staging)**

- **Purpose**: Pre-production testing
- **Database**: PostgreSQL (production-like)
- **APIs**: Staging keys with limited quotas
- **Security**: Production-like CORS settings
- **Debugging**: Minimal logging
- **Auto-features**: Migration enabled, manual DB fixes

**Ideal for:**

- ✅ User acceptance testing
- ✅ Performance testing
- ✅ Production deployment rehearsal
- ✅ Client demonstrations

### **🚀 Production (Environment Variables)**

- **Purpose**: Live application serving real users
- **Database**: PostgreSQL with SSL
- **APIs**: Production keys with full quotas
- **Security**: Strict CORS, rate limiting
- **Debugging**: Error logging only
- **Auto-features**: Minimal automation for safety

**Configured via:**

- ✅ Render: Dashboard > Environment Variables
- ✅ Vercel: Project Settings > Environment Variables
- ✅ Docker: docker-compose.yml or Kubernetes secrets

## 📋 **Environment Variables Reference**

### **🔧 Core Application**

```bash
NODE_ENV=development|staging|production
PORT=10000
```

### **🗄️ Database**

```bash
# Development (SQLite)
DATABASE_URL=file:./dev.db

# Production (PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/database
```

### **🔐 Authentication & Security**

```bash
JWT_SECRET=minimum-32-character-secret-key-here
STAFF_ACCOUNTS=admin:password,staff:password,manager:password
```

### **🤖 AI & Voice Assistant**

```bash
# OpenAI
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# Base Vapi (English)
VITE_VAPI_PUBLIC_KEY=pk_your-vapi-public-key
VITE_VAPI_ASSISTANT_ID=asst_your-assistant-id

# Multi-language Support
VITE_VAPI_PUBLIC_KEY_VI=pk_vietnamese-key    # Vietnamese
VITE_VAPI_PUBLIC_KEY_FR=pk_french-key        # French
VITE_VAPI_PUBLIC_KEY_ZH=pk_chinese-key       # Chinese
VITE_VAPI_PUBLIC_KEY_RU=pk_russian-key       # Russian
VITE_VAPI_PUBLIC_KEY_KO=pk_korean-key        # Korean

VITE_VAPI_ASSISTANT_ID_VI=asst_vietnamese-id
VITE_VAPI_ASSISTANT_ID_FR=asst_french-id
VITE_VAPI_ASSISTANT_ID_ZH=asst_chinese-id
VITE_VAPI_ASSISTANT_ID_RU=asst_russian-id
VITE_VAPI_ASSISTANT_ID_KO=asst_korean-id
```

### **📧 Email Services**

```bash
# Mailjet (Primary)
MAILJET_API_KEY=your-mailjet-api-key
MAILJET_SECRET_KEY=your-mailjet-secret
MAILJET_FROM_EMAIL=noreply@minhonhotel.com

# Gmail (Fallback)
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASS=your-app-specific-password
```

### **🌍 External Services**

```bash
GOOGLE_PLACES_API_KEY=your-google-places-key
VITE_API_URL=http://localhost:10000
CLIENT_URL=http://localhost:5173
```

## 🛠️ **Environment Management Scripts**

### **🔄 switch-env.sh**

**Purpose**: Switch between different environment configurations

```bash
# Usage
./scripts/switch-env.sh [environment]

# Examples
./scripts/switch-env.sh development  # Setup for local development
./scripts/switch-env.sh staging      # Setup for staging testing
./scripts/switch-env.sh production   # Show production guidance
```

**Features:**

- ✅ Automatic file copying
- ✅ Environment detection
- ✅ Configuration validation
- ✅ Security guidance for production

### **✅ validate-env.js**

**Purpose**: Validate environment configuration completeness and format

```bash
# Usage
node scripts/validate-env.js [command]

# Commands
node scripts/validate-env.js validate    # Full validation (default)
node scripts/validate-env.js structure   # Check file structure
node scripts/validate-env.js format      # Check variable formats
node scripts/validate-env.js help        # Show help
```

**Validation Checks:**

- ✅ Required variables present
- ✅ API key format validation
- ✅ Database URL format
- ✅ JWT secret length (32+ chars)
- ✅ File structure integrity

## 🔐 **Security Best Practices**

### **🚫 Never Commit Secrets**

```bash
# ✅ SAFE - Template file (no real values)
.env.example

# ❌ DANGER - Contains real secrets
.env
.env.development
.env.staging
.env.production
```

### **🎯 Environment-Specific Security**

#### **Development**

- ✅ Use test/development API keys
- ✅ Relaxed CORS for localhost
- ✅ SQLite for easy setup
- ✅ Extended rate limits for testing

#### **Staging**

- ✅ Separate staging API keys
- ✅ Production-like security settings
- ✅ Test email recipients only
- ✅ Limited API quotas

#### **Production**

- ✅ Production API keys with full quotas
- ✅ Strict CORS and rate limiting
- ✅ SSL-enabled database connections
- ✅ Error-only logging

## 🔄 **Deployment Workflows**

### **🔧 Development Workflow**

```bash
# 1. Setup environment
npm run env:development
npm run validate:env

# 2. Start development
npm run dev

# 3. Test changes
npm run test
npm run validate:env

# 4. Build and verify
npm run build
```

### **🎭 Staging Workflow**

```bash
# 1. Prepare staging environment
npm run env:staging
npm run validate:env

# 2. Build for staging
npm run build:production

# 3. Deploy to staging server
# (Platform-specific deployment)

# 4. Run staging tests
npm run test:staging
```

### **🚀 Production Workflow**

```bash
# 1. Set environment variables on hosting platform
# (Render, Vercel, Docker, etc.)

# 2. Deploy via platform
git push origin main  # Trigger auto-deployment

# 3. Verify deployment
npm run validate:env:production
```

## 🆘 **Troubleshooting**

### **❌ Common Issues**

#### **1. Missing .env file**

```bash
Error: .env file not found!

# Fix:
npm run env:development
```

#### **2. Invalid API key format**

```bash
Error: VITE_VAPI_PUBLIC_KEY format is invalid

# Fix: Check your Vapi dashboard for correct key format
```

#### **3. JWT secret too short**

```bash
Error: JWT_SECRET should be at least 32 characters

# Fix: Generate longer secret
openssl rand -base64 32
```

#### **4. Database connection failed**

```bash
Error: Could not connect to database

# Development fix:
DATABASE_URL=file:./dev.db

# Production fix: Check PostgreSQL connection string
```

### **🔍 Debug Commands**

```bash
# Check environment structure
npm run validate:env:structure

# Check variable formats
npm run validate:env:format

# Full environment audit
npm run validate:env

# Show environment help
npm run env:help
```

## 📈 **Advanced Usage**

### **🎛️ Custom Environment Variables**

Add new variables to:

1. `.env.example` (template)
2. `scripts/validate-env.js` (validation)
3. Environment-specific files

### **🔧 Environment Detection in Code**

```typescript
// Detect current environment
const isDevelopment = process.env.NODE_ENV === "development";
const isStaging = process.env.NODE_ENV === "staging";
const isProduction = process.env.NODE_ENV === "production";

// Environment-specific configuration
const config = {
  database: {
    url: process.env.DATABASE_URL,
    ssl: isProduction,
  },
  vapi: {
    publicKey: process.env.VITE_VAPI_PUBLIC_KEY,
    debug: isDevelopment,
  },
  logging: {
    level: isDevelopment ? "debug" : "info",
  },
};
```

### **🔄 Multi-Environment CI/CD**

```yaml
# GitHub Actions example
- name: Setup Development Environment
  run: npm run env:development

- name: Validate Environment
  run: npm run validate:env

- name: Build Application
  run: npm run build
```

## 📚 **Additional Resources**

- **[Deployment Guide](../deployment/DEPLOYMENT_QUICKSTART.md)** - Platform-specific deployment
  instructions
- **[Environment Setup](ENVIRONMENT_SETUP.md)** - Detailed setup procedures
- **[Security Guide](../../troubleshooting/TROUBLESHOOTING_GUIDE.md)** - Security best practices
- **[API Documentation](../../api/API_DOCUMENTATION.md)** - API configuration reference

---

## 🎯 **Summary**

The Environment Management System provides:

✅ **Secure** - No secrets in version control  
✅ **Flexible** - Easy switching between environments  
✅ **Validated** - Automatic configuration checking  
✅ **Documented** - Comprehensive variable reference  
✅ **Automated** - Scripts for common tasks

**Quick Commands:**

```bash
npm run env:development    # Setup development
npm run validate:env       # Check configuration
npm run dev               # Start development server
```
