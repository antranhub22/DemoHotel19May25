# 🚀 Render Deployment Guide - Hotel Voice Assistant SaaS

## 📋 Overview

Hướng dẫn chi tiết để deploy Hotel Voice Assistant SaaS Platform lên Render với tất cả environment
variables cần thiết.

## 🎯 Quick Setup - Copy & Paste cho Render

### 1. Environment Variables cho Render

Copy toàn bộ các biến sau vào **Environment Variables** section trên Render:

```bash
# ==================== CORE SETTINGS ====================
NODE_ENV=production
PORT=10000
CLIENT_URL=https://your-frontend-domain.onrender.com

# ==================== DATABASE ====================
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# ==================== AUTHENTICATION ====================
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
STAFF_ACCOUNTS=admin@hotel.com:StrongPassword123,manager@hotel.com:StrongPassword456

# ==================== OPENAI INTEGRATION ====================
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_OPENAI_PROJECT_ID=proj_your-openai-project-id-here

# ==================== VAPI VOICE ASSISTANT ====================
VITE_VAPI_PUBLIC_KEY=pk_your-vapi-public-key-here
VITE_VAPI_ASSISTANT_ID=asst_your-vapi-assistant-id-here

# ==================== VAPI SAAS FEATURES ====================
VAPI_API_KEY=your-vapi-api-key-for-dynamic-creation

# ==================== HOTEL RESEARCH APIS ====================
GOOGLE_PLACES_API_KEY=your-google-places-api-key

# ==================== SAAS PLATFORM SETTINGS ====================
TALK2GO_DOMAIN=talk2go.online
SUBDOMAIN_SUFFIX=.talk2go.online
MINHON_TENANT_ID=minhon-default-tenant-id

# ==================== EMAIL SERVICES ====================
GMAIL_APP_PASSWORD=your-gmail-app-password
SUMMARY_EMAILS=admin@hotel.com,manager@hotel.com

# ==================== FEATURE FLAGS ====================
ENABLE_HOTEL_RESEARCH=true
ENABLE_DYNAMIC_ASSISTANT_CREATION=true
ENABLE_MULTI_LANGUAGE_SUPPORT=true
ENABLE_ANALYTICS_DASHBOARD=true
ENABLE_BILLING_SYSTEM=false

# ==================== PRODUCTION SETTINGS ====================
CORS_ORIGIN=https://your-frontend-domain.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_FORMAT=combined
SESSION_SECRET=your-session-secret-key-min-32-chars
SESSION_TIMEOUT=3600000

# ==================== OPTIONAL - MULTI-LANGUAGE ====================
VITE_VAPI_PUBLIC_KEY_VI=pk_your-vapi-public-key-vietnamese
VITE_VAPI_ASSISTANT_ID_VI=asst_your-vapi-assistant-id-vietnamese
VITE_VAPI_PUBLIC_KEY_FR=pk_your-vapi-public-key-french
VITE_VAPI_ASSISTANT_ID_FR=asst_your-vapi-assistant-id-french

# ==================== OPTIONAL - MONITORING ====================
SENTRY_DSN=your-sentry-dsn
GOOGLE_ANALYTICS_ID=your-google-analytics-id

# ==================== OPTIONAL - ADDITIONAL APIS ====================
YELP_API_KEY=your-yelp-api-key
TRIPADVISOR_API_KEY=your-tripadvisor-api-key
MAILJET_API_KEY=your-mailjet-api-key
MAILJET_SECRET_KEY=your-mailjet-secret-key

# ==================== OPTIONAL - STORAGE ====================
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-s3-bucket-name

# ==================== WEBSOCKET ====================
WS_TEST_URL=wss://your-app-name.onrender.com/ws
WS_TEST_CALLID=#YOUR-TEST-CALL-ID

# ==================== REFERENCE DATA ====================
REFERENCE_MAP={}
```

## 🔧 Step-by-Step Setup trên Render

### Step 1: Tạo PostgreSQL Database

1. **Tạo PostgreSQL service:**
   - Đăng nhập Render Dashboard
   - Click "New" → "PostgreSQL"
   - Chọn plan (Free tier available)
   - Tạo database

2. **Lấy DATABASE_URL:**
   - Vào PostgreSQL service vừa tạo
   - Copy **Internal Database URL**
   - Format: `postgresql://username:password@hostname:5432/database_name`

### Step 2: Tạo Web Service

1. **Tạo Web Service:**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Chọn branch: `main` hoặc `feature/data-analytics`

2. **Cấu hình Build Settings:**
   ```
   Build Command: npm run build
   Start Command: npm run start
   ```

### Step 3: Thiết lập Environment Variables

1. **Vào Environment section:**
   - Scroll xuống "Environment Variables"
   - Click "Add Environment Variable"

2. **Thêm từng biến một hoặc bulk add:**
   - Copy toàn bộ list trên
   - Thay thế `your-*` values với actual values

### Step 4: Cấu hình Domain

1. **Custom Domain (Optional):**
   - Vào Settings → Custom Domains
   - Add domain: `talk2go.online`
   - Configure DNS records

2. **Update Environment Variables:**
   ```bash
   CLIENT_URL=https://your-actual-domain.com
   TALK2GO_DOMAIN=your-actual-domain.com
   CORS_ORIGIN=https://your-actual-domain.com
   ```

## 🔑 API Keys cần thiết

### 1. OpenAI API Key

```bash
VITE_OPENAI_API_KEY=sk-your-openai-api-key
```

- Đăng ký tại: https://platform.openai.com/
- Tạo API key và add payment method

### 2. Vapi API Keys

```bash
VITE_VAPI_PUBLIC_KEY=pk_your-vapi-public-key
VITE_VAPI_ASSISTANT_ID=asst_your-vapi-assistant-id
VAPI_API_KEY=your-vapi-api-key-for-dynamic-creation
```

- Đăng ký tại: https://vapi.ai/
- Lấy Public Key, Assistant ID, và API Key

### 3. Google Places API Key

```bash
GOOGLE_PLACES_API_KEY=your-google-places-api-key
```

- Tạo tại: https://console.cloud.google.com/
- Enable Google Places API
- Tạo credentials

### 4. Gmail App Password

```bash
GMAIL_APP_PASSWORD=your-gmail-app-password
```

- Enable 2FA trên Gmail
- Tạo App Password tại: https://myaccount.google.com/apppasswords

### 5. JWT Secret (Generate ngẫu nhiên)

```bash
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
```

- Generate bằng: `openssl rand -base64 32`
- Hoặc dùng: https://generate-secret.vercel.app/32

## 📋 Render Configuration Template

### Build Settings

```
Build Command: npm run build
Start Command: npm run start
Auto-Deploy: Yes
```

### Environment Variables (Key-Value pairs)

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:pass@host:5432/db
CLIENT_URL=https://your-app.onrender.com
JWT_SECRET=your-32-char-secret
VITE_OPENAI_API_KEY=sk-your-key
VITE_VAPI_PUBLIC_KEY=pk_your-key
VITE_VAPI_ASSISTANT_ID=asst_your-id
VAPI_API_KEY=your-api-key
GOOGLE_PLACES_API_KEY=your-places-key
GMAIL_APP_PASSWORD=your-gmail-password
TALK2GO_DOMAIN=talk2go.online
ENABLE_HOTEL_RESEARCH=true
ENABLE_DYNAMIC_ASSISTANT_CREATION=true
```

## 🚀 Deployment Process

### 1. Pre-deployment Check

```bash
# Run locally first
npm run env:validate-saas
npm run env:health
npm run build
npm run start
```

### 2. Deploy to Render

1. Push code to GitHub
2. Render auto-deploys từ GitHub
3. Monitor build logs
4. Check deployment status

### 3. Post-deployment Validation

```bash
# Check deployment health
curl https://your-app.onrender.com/health

# Check environment status
curl https://your-app.onrender.com/api/status
```

## 🛠️ Troubleshooting

### Common Issues

**1. Build Failed - Missing Dependencies**

```bash
# Solution: Check package.json dependencies
npm install --production
```

**2. Environment Variables Not Loading**

```bash
# Solution: Check variable names exactly match
# No spaces around = sign
# Values enclosed in quotes if contain spaces
```

**3. Database Connection Failed**

```bash
# Solution: Check DATABASE_URL format
# Ensure PostgreSQL service is running
# Check network connectivity
```

**4. API Keys Invalid**

```bash
# Solution: Verify API keys are correct
# Check key format (sk-, pk-, asst-)
# Ensure billing is enabled for APIs
```

## 🔒 Security Checklist

### Production Security

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] All API keys are valid and restricted
- [ ] Database URL is using SSL
- [ ] CORS_ORIGIN is set to actual domain
- [ ] Rate limiting is enabled
- [ ] Session timeout is configured
- [ ] Email notifications are working

### Environment Variables Security

- [ ] No sensitive data in source code
- [ ] All secrets are in environment variables
- [ ] Production and development configs are separate
- [ ] API keys have proper restrictions
- [ ] Database credentials are secure

## 📊 Monitoring & Logs

### Render Logs

```bash
# View deployment logs
# Go to Render Dashboard → Your Service → Logs

# Common log patterns to watch:
# ✅ Environment: production | SaaS: ✅ | Port: 10000
# ✅ Database connection successful
# ✅ Server starting on port 10000
```

### Health Checks

```bash
# Add to your monitoring
GET https://your-app.onrender.com/health
GET https://your-app.onrender.com/api/status
```

## 🎯 Post-Deployment Tasks

### 1. Verify Functionality

- [ ] Website loads correctly
- [ ] Voice assistant works
- [ ] Database queries succeed
- [ ] API endpoints respond
- [ ] Email notifications work

### 2. Performance Optimization

- [ ] Enable caching
- [ ] Configure CDN
- [ ] Monitor response times
- [ ] Set up error tracking

### 3. Backup & Recovery

- [ ] Setup database backups
- [ ] Document recovery procedures
- [ ] Test backup restoration

## 📞 Support & Help

### Resources

- **Environment Validation**: `npm run env:health`
- **Documentation**: `docs/ENVIRONMENT_SETUP.md`
- **Render Docs**: https://render.com/docs
- **Troubleshooting**: Check logs in Render dashboard

### Quick Commands

```bash
# Local testing
npm run env:validate-saas
npm run env:test-apis
npm run env:test-db

# Generate new config
npm run env:generate
npm run env:template production
```

---

## 🎉 Ready to Deploy!

Với hướng dẫn này, bạn có thể deploy Hotel Voice Assistant SaaS Platform lên Render với đầy đủ
environment variables và cấu hình cần thiết.

**Next Steps:**

1. Copy environment variables vào Render
2. Update với actual API keys
3. Deploy và test
4. Monitor logs và performance

Good luck! 🚀
