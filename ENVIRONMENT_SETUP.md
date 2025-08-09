# 🏨 **MI NHON HOTEL - ENVIRONMENT SETUP GUIDE**

> **Updated**: August 2025  
> **Status**: ✅ Production-Local Parity Achieved

## 🎯 **QUICK START**

### **1. Environment Switching**

```bash
# Development mode (recommended)
./scripts/switch-env.sh local

# Production testing mode
./scripts/switch-env.sh prod-local

# Validate configuration
npm run validate:env
```

### **2. Database Setup**

```bash
# PostgreSQL is required (matches production)
createdb demovoicehotelsaas_dev
npx prisma db push
```

### **3. Development Server**

```bash
npm run dev
# Server: http://localhost:10000 (matches production port)
```

---

## 📊 **PRODUCTION ALIGNMENT STATUS**

| **Component**         | **Local**  | **Production** | **Status**     |
| --------------------- | ---------- | -------------- | -------------- |
| Database              | PostgreSQL | PostgreSQL     | ✅ **ALIGNED** |
| Port                  | 10000      | 10000          | ✅ **ALIGNED** |
| JWT Security          | 64-char    | 64-char        | ✅ **ALIGNED** |
| Environment Variables | 120 vars   | 120 vars       | ✅ **ALIGNED** |
| Build Process         | Vite       | Vite           | ✅ **ALIGNED** |
| Schema                | Prisma     | Prisma         | ✅ **ALIGNED** |

---

## 🔧 **ENVIRONMENT MODES**

### **🟢 Local Development (NODE_ENV=development)**

- **Purpose**: Day-to-day development
- **Database**: `demovoicehotelsaas_dev`
- **Port**: `10000` (matches production)
- **Security**: Development-friendly settings
- **Logging**: Debug level enabled

**Switch to:**

```bash
./scripts/switch-env.sh local
```

### **🟡 Production-Local Testing (NODE_ENV=production)**

- **Purpose**: Test production settings locally
- **Database**: `demovoicehotelsaas_prod_local`
- **Port**: `10000`
- **Security**: Production-level settings
- **Logging**: Info level only

**Switch to:**

```bash
./scripts/switch-env.sh prod-local
```

### **🔴 Production (NODE_ENV=production)**

- **Purpose**: Live deployment on Render
- **Database**: Remote PostgreSQL
- **Port**: `10000`
- **Security**: Maximum security settings
- **Environment**: Render platform variables

---

## 📋 **VALIDATION COMMANDS**

### **Environment Validation**

```bash
# Comprehensive environment check
npm run validate:env

# Production parity check
node scripts/validate-prod-parity.cjs

# Pre-deployment testing
node scripts/pre-deployment-test.cjs
```

### **Database Validation**

```bash
# Schema validation
npx prisma validate

# Connection test
npx prisma db push --accept-data-loss

# Migration status
npx prisma migrate status
```

### **Build Validation**

```bash
# Production build test
npm run build:production

# Bundle analysis
npm run perf:analyze
```

---

## 🔐 **SECURITY CONFIGURATION**

### **JWT Configuration**

- **Local**: 64-character secure secret
- **Production**: Environment-specific secret
- **Validation**: Automatic length checking

### **Database Security**

- **Local**: PostgreSQL with local auth
- **Production**: Encrypted connections
- **Schema**: Prisma ORM with type safety

### **CORS & Rate Limiting**

- **Development**: Localhost origins allowed
- **Production**: Specific domain restrictions
- **Rate Limits**: Environment-appropriate limits

---

## 🚀 **DEPLOYMENT WORKFLOW**

### **Pre-Deployment Checklist**

```bash
# 1. Validate environment
npm run validate:env

# 2. Test production mode locally
./scripts/switch-env.sh prod-local
npm run dev

# 3. Run comprehensive tests
node scripts/pre-deployment-test.cjs

# 4. Build for production
npm run build:production

# 5. Switch back to development
./scripts/switch-env.sh local
```

### **Production Deployment**

1. **Environment Variables**: Set on Render platform
2. **Database**: Automatic migration on deploy
3. **Build**: `npm run build:production`
4. **Start**: `npm run start`

---

## 🛠️ **TROUBLESHOOTING**

### **Common Issues**

#### **1. JWT Secret Error**

```
Error: JWT_SECRET must be at least 32 characters
```

**Solution:**

```bash
./scripts/switch-env.sh local
# JWT secret will be auto-generated
```

#### **2. Database Connection Failed**

```
Database connection failed
```

**Solution:**

```bash
# Ensure PostgreSQL is running
brew services start postgresql

# Create database if missing
createdb demovoicehotelsaas_dev
```

#### **3. Port Already in Use**

```
Port 10000 is already in use
```

**Solution:**

```bash
# Kill existing processes
pkill -f "port 10000"
npm run dev
```

#### **4. Environment Variables Missing**

```
Environment validation failed
```

**Solution:**

```bash
# Regenerate environment file
./scripts/switch-env.sh local
npm run validate:env
```

---

## 📁 **FILE STRUCTURE**

```
DemoHotel19May/
├── .env                     # Active environment (auto-generated)
├── .env.local              # Development configuration
├── .env.production-local   # Production testing configuration
├── .env.example           # Template file
├── scripts/
│   ├── switch-env.sh           # Environment switcher
│   ├── validate-env.cjs        # Environment validator
│   ├── validate-prod-parity.cjs # Production alignment check
│   └── pre-deployment-test.cjs  # Comprehensive testing
└── vite.config.ts         # Build configuration (port 10000)
```

---

## 🎯 **NEXT STEPS**

1. **Development**: Use `./scripts/switch-env.sh local`
2. **Add API Keys**: Update `.env.local` with your actual keys
3. **Test Production**: Use `./scripts/switch-env.sh prod-local`
4. **Deploy**: Follow pre-deployment checklist

---

## 📞 **SUPPORT**

- **Environment Issues**: Run `node scripts/validate-prod-parity.cjs`
- **Database Issues**: Check PostgreSQL service status
- **Build Issues**: Run `npm run build:production`
- **Security Issues**: Validate with `npm run validate:env`

---

**🎉 Your local environment is now 100% aligned with production!**
