# 🚀 UNIFIED AUTH SYSTEM - DEPLOYMENT GUIDE

## 📋 OVERVIEW

Hướng dẫn triển khai **Unified Auth System** với JWT authentication, RBAC, và multi-tenant support.

---

## 🎯 SYSTEM REQUIREMENTS

### ✅ **Already Completed:**

- 🧹 **Backend**: Legacy code cleaned up, unified routes integrated
- 🔧 **Frontend**: All auth endpoints updated to use unified API
- 🛡️ **Security**: JWT + RBAC + permissions system ready
- 📱 **Features**: Access tokens, refresh tokens, token blacklist

### 🚀 **Ready for Deployment:**

- Backend unified auth system (100% complete)
- Frontend migration (100% complete)
- Production-ready architecture

---

## 🐳 OPTION 1: DOCKER SETUP (RECOMMENDED)

### **Step 1: Start PostgreSQL Container**

```bash
# Start PostgreSQL database
docker run -d \
  --name hotel-postgres \
  -e POSTGRES_DB=hotel_dev \
  -e POSTGRES_USER=hotel_user \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  postgres:15

# Verify database is running
docker ps | grep hotel-postgres
```

### **Step 2: Set Environment Variables**

```bash
export DATABASE_URL="postgresql://hotel_user:dev_password@localhost:5432/hotel_dev"
export JWT_SECRET="your-super-secret-jwt-key-change-in-production"
export NODE_ENV="development"
export PORT="10000"
```

### **Step 3: Start Application**

```bash
# Install dependencies (if not done)
npm install

# Run database migrations
npm run db:migrate

# Seed default users
npm run db:seed

# Start development server
npm run dev
```

---

## 🌐 OPTION 2: CLOUD DATABASE (PRODUCTION)

### **Render.com Deployment:**

```bash
# Environment Variables to set in Render:
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-production-jwt-secret-key
NODE_ENV=production
PORT=10000

# Optional:
AUTO_MIGRATE=true
SEED_USERS=true
```

### **Vercel/Heroku Deployment:**

```bash
# Set these environment variables:
DATABASE_URL=postgresql://...
JWT_SECRET=...
NODE_ENV=production
```

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### **Phase 1: Database Setup**

1. **Choose Database Option:**
   - 🐳 **Local**: Docker PostgreSQL (development)
   - ☁️ **Cloud**: Render/Heroku PostgreSQL (production)
   - 🏢 **Self-hosted**: Your own PostgreSQL server

2. **Run Database Migrations:**

   ```bash
   npm run db:migrate
   ```

3. **Seed Initial Data:**
   ```bash
   npm run db:seed
   ```

### **Phase 2: Application Deployment**

1. **Set Environment Variables:**

   ```bash
   # Required:
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key

   # Optional:
   NODE_ENV=production
   PORT=10000
   AUTO_MIGRATE=true
   SEED_USERS=true
   ```

2. **Build and Start:**
   ```bash
   npm run build
   npm run start
   ```

### **Phase 3: Verification**

1. **Health Check:**

   ```bash
   curl http://localhost:10000/api/health
   ```

2. **Test Authentication:**

   ```bash
   # Test login
   curl -X POST http://localhost:10000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

3. **Test Protected Endpoint:**
   ```bash
   # Test with token from login response
   curl http://localhost:10000/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

---

## 🎛️ CONFIGURATION OPTIONS

### **JWT Configuration:**

```typescript
// Default settings (in auth.config.ts):
ACCESS_TOKEN_EXPIRES_IN: '1h'; // Short-lived access token
REFRESH_TOKEN_EXPIRES_IN: '7d'; // Long-lived refresh token
JWT_ALGORITHM: 'HS256'; // Signing algorithm
```

### **Security Settings:**

```typescript
// Rate limiting and security
MAX_LOGIN_ATTEMPTS: 5;
LOGIN_RATE_LIMIT: 10; // requests per minute
BCRYPT_ROUNDS: 12; // Password hashing strength
```

### **Multi-tenant Settings:**

```typescript
// Tenant support
DEFAULT_TENANT_ID: 'mi-nhon-hotel';
TENANT_ISOLATION: true; // Row-level security
```

---

## 🛡️ SECURITY CHECKLIST

### ✅ **Production Security:**

- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS in production
- [ ] Set secure cookie settings
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable database SSL in production

### ✅ **Database Security:**

- [ ] Use strong database passwords
- [ ] Enable database SSL/TLS
- [ ] Configure firewall rules
- [ ] Regular database backups
- [ ] Monitor database access

---

## 🧪 TESTING

### **Manual Testing:**

```bash
# Run comprehensive test suite
node test-unified-auth-integration.mjs

# Test specific endpoints
curl -X POST /api/auth/login -d '{"username":"admin","password":"admin123"}'
curl -X GET /api/auth/me -H "Authorization: Bearer TOKEN"
curl -X POST /api/auth/refresh -d '{"refreshToken":"REFRESH_TOKEN"}'
curl -X POST /api/auth/logout -H "Authorization: Bearer TOKEN"
```

### **Automated Testing:**

```bash
# Run all tests
npm test

# Run auth-specific tests
npm run test:auth
```

---

## 🚨 TROUBLESHOOTING

### **Common Issues:**

1. **Database Connection Error:**

   ```
   Error: ❌ DATABASE_URL environment variable is required!
   ```

   **Solution:** Set DATABASE_URL environment variable

2. **JWT Secret Missing:**

   ```
   Error: JWT_SECRET environment variable is required
   ```

   **Solution:** Set JWT_SECRET environment variable

3. **Token Invalid:**

   ```
   Error: Invalid authentication token
   ```

   **Solution:** Check token format and expiration

4. **Permission Denied:**
   ```
   Error: Insufficient permissions
   ```
   **Solution:** Check user role and permissions

### **Debug Commands:**

```bash
# Check environment variables
npm run validate:env

# Test database connection
npm run test:db

# Check auth service
npm run test:auth
```

---

## 📊 MONITORING

### **Health Endpoints:**

- `GET /api/health` - Server health check
- `GET /api/auth/me` - Authentication status
- `GET /api/dashboard/stats` - System statistics

### **Logging:**

- Authentication attempts (success/failure)
- Token generation and validation
- Permission checks
- Database queries

---

## 🔄 MIGRATION FROM LEGACY

### **Already Completed:**

✅ Backend legacy routes removed  
✅ Frontend endpoints updated  
✅ Unified auth system integrated  
✅ RBAC permissions system ready

### **Backward Compatibility:**

✅ Legacy `/api/staff/login` → `/api/auth/staff/login` (with deprecation warning)  
✅ Legacy token format supported  
✅ Existing user sessions preserved

---

## 🎉 DEPLOYMENT COMPLETE

Once deployed, your **Unified Auth System** provides:

- 🔐 **JWT Authentication** with access + refresh tokens
- 🛡️ **Role-Based Access Control (RBAC)**
- 🏢 **Multi-tenant Support** with row-level security
- 🔄 **Token Management** with blacklist support
- 📱 **Modern API** with standardized responses
- 🔒 **Security Best Practices** built-in

**System Status: �� PRODUCTION READY**
