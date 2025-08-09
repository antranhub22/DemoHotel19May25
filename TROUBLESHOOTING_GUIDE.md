# 🛠️ **TROUBLESHOOTING GUIDE - ENVIRONMENT ISSUES**

> **Quick Fix Reference for Common Local/Production Environment Issues**

---

## 🚨 **CRITICAL ERRORS**

### **1. JWT_SECRET Error**

```
Error: JWT_SECRET must be at least 32 characters in production
```

**🔧 Quick Fix:**

```bash
./scripts/switch-env.sh local
# Auto-generates secure 64-character JWT secret
```

**🔍 Root Cause:** Production validation requires 32+ character JWT secrets  
**✅ Verification:** `echo "JWT length: $(grep 'JWT_SECRET=' .env | cut -d'=' -f2 | wc -c)"`

---

### **2. Database Connection Failed**

```
Database connection failed / Invalid DATABASE_URL
```

**🔧 Quick Fix:**

```bash
# Start PostgreSQL service
brew services start postgresql

# Create missing database
createdb demovoicehotelsaas_dev

# Sync schema
npx prisma db push
```

**🔍 Root Cause:** PostgreSQL not running or database doesn't exist  
**✅ Verification:** `psql -d demovoicehotelsaas_dev -c "SELECT version();"`

---

### **3. Port Already in Use**

```
Error: listen EADDRINUSE: address already in use :::10000
```

**🔧 Quick Fix:**

```bash
# Kill processes on port 10000
pkill -f ":10000"
# Or specific kill
lsof -ti:10000 | xargs kill -9

# Restart development server
npm run dev
```

**🔍 Root Cause:** Another process using port 10000  
**✅ Verification:** `lsof -i :10000`

---

## ⚠️ **COMMON WARNINGS**

### **4. Environment Variables Missing**

```
Environment validation failed / Variables not configured
```

**🔧 Quick Fix:**

```bash
# Regenerate complete environment
./scripts/switch-env.sh local

# Validate configuration
npm run validate:env

# Check specific missing variables
node scripts/validate-prod-parity.cjs
```

**🔍 Root Cause:** .env file incomplete or corrupted  
**✅ Verification:** `wc -l .env` (should be ~120 lines)

---

### **5. TypeScript Build Errors**

```
TypeScript compilation errors / Type mismatches
```

**🔧 Quick Fix:**

```bash
# Generate fresh Prisma client
npx prisma generate

# Check for TypeScript issues (non-blocking)
npx tsc --noEmit

# Force clean build
npm run build:production
```

**🔍 Root Cause:** Outdated Prisma client or type definitions  
**✅ Verification:** Build should complete with warnings only

---

### **6. OpenAI API Key Format Error**

```
OpenAI API Key should start with 'sk-'
```

**🔧 Quick Fix:**

```bash
# Update to proper format
sed -i '' 's/VITE_OPENAI_API_KEY=your-openai-api-key-here/VITE_OPENAI_API_KEY=sk-placeholder-openai-key-for-development/' .env
```

**🔍 Root Cause:** API key doesn't match expected format  
**✅ Verification:** `grep 'VITE_OPENAI_API_KEY=sk-' .env`

---

## 🔧 **DIAGNOSTIC COMMANDS**

### **Environment Health Check**

```bash
# Complete environment validation
npm run validate:env

# Production parity check
node scripts/validate-prod-parity.cjs

# Pre-deployment comprehensive test
node scripts/pre-deployment-test.cjs
```

### **Database Health Check**

```bash
# PostgreSQL service status
brew services list | grep postgresql

# Database connection test
psql -d demovoicehotelsaas_dev -c "SELECT COUNT(*) FROM information_schema.tables;"

# Prisma schema validation
npx prisma validate
```

### **Build System Health Check**

```bash
# Development build test
npm run dev &
sleep 5 && curl -f http://localhost:10000/api/health
pkill -f "npm run dev"

# Production build test
npm run build:production

# Bundle size check
ls -lh dist/public/assets/*.js | head -5
```

---

## 🎯 **SPECIFIC SCENARIOS**

### **Scenario A: Fresh Machine Setup**

```bash
# 1. Install dependencies
npm install

# 2. Setup PostgreSQL
brew install postgresql
brew services start postgresql

# 3. Create database
createdb demovoicehotelsaas_dev

# 4. Setup environment
./scripts/switch-env.sh local

# 5. Initialize database
npx prisma db push

# 6. Start development
npm run dev
```

### **Scenario B: Switching from SQLite to PostgreSQL**

```bash
# 1. Install PostgreSQL (if not installed)
brew install postgresql
brew services start postgresql

# 2. Create new database
createdb demovoicehotelsaas_dev

# 3. Update environment to PostgreSQL
./scripts/switch-env.sh local

# 4. Migrate schema
npx prisma db push

# 5. Verify connection
psql -d demovoicehotelsaas_dev -c "\\dt"
```

### **Scenario C: Production Testing Locally**

```bash
# 1. Switch to production mode
./scripts/switch-env.sh prod-local

# 2. Create production-like database
createdb demovoicehotelsaas_prod_local

# 3. Test production build
npm run build:production

# 4. Test production server (if available)
# NODE_ENV=production npm start

# 5. Switch back to development
./scripts/switch-env.sh local
```

---

## 🔍 **DEBUGGING TECHNIQUES**

### **Environment Variable Debugging**

```bash
# Show all environment variables
printenv | grep -E "(NODE_ENV|PORT|DATABASE_URL|JWT_SECRET)" | head -10

# Check specific .env file
cat .env | grep -E "(NODE_ENV|PORT|DATABASE_URL|JWT_SECRET)"

# Compare environments
diff .env.local .env.production-local | head -10
```

### **Database Connection Debugging**

```bash
# Test PostgreSQL connection directly
psql -h localhost -p 5432 -U $(whoami) -d demovoicehotelsaas_dev

# Check database URL format
echo $DATABASE_URL

# List all databases
psql -l | grep demovoice
```

### **Port and Network Debugging**

```bash
# Check what's using port 10000
lsof -i :10000

# Check all node processes
ps aux | grep node | grep -v grep

# Network connectivity test
curl -f http://localhost:10000/api/health 2>/dev/null || echo "Server not responding"
```

---

## 📞 **ESCALATION MATRIX**

### **Level 1: Quick Fixes (< 2 minutes)**

- JWT secret regeneration
- Environment switching
- Process killing/restarting
- Database creation

### **Level 2: Standard Fixes (2-5 minutes)**

- PostgreSQL installation/setup
- Schema migration
- Build system issues
- Configuration validation

### **Level 3: Complex Issues (5+ minutes)**

- Deep TypeScript errors
- Complex database migrations
- Build optimization
- Security configuration

---

## ✅ **SUCCESS VERIFICATION**

### **After Any Fix, Verify:**

```bash
# 1. Environment is valid
npm run validate:env

# 2. Database is connected
psql -d demovoicehotelsaas_dev -c "SELECT version();"

# 3. Development server starts
npm run dev &
sleep 3 && curl -f http://localhost:10000/api/health
pkill -f "npm run dev"

# 4. Production build works
npm run build:production

# 5. Production parity is maintained
node scripts/validate-prod-parity.cjs
```

---

## 🎉 **QUICK WIN COMMANDS**

```bash
# The "Nuclear Option" - Reset Everything
./scripts/switch-env.sh local
dropdb demovoicehotelsaas_dev --if-exists
createdb demovoicehotelsaas_dev
npx prisma db push
npm run validate:env

# The "Works On My Machine" Verification
node scripts/pre-deployment-test.cjs

# The "Ready for Production" Check
node scripts/validate-prod-parity.cjs
```

---

**💡 Remember: Most issues are environment-related. When in doubt, regenerate your environment configuration!**
