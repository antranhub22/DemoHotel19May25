# Production Deployment Guide - Hotel Voice Assistant

## 🚀 Current Production Status

- ❌ **Database Connection Failed**: PostgreSQL authentication error
- ✅ **Application Code**: Ready for production
- ✅ **Build Process**: Working correctly

## 🔧 Required Actions for Production

### 1. Database Issues (URGENT)

**Problem**: PostgreSQL authentication failed for `minhonhotelen1_user`

**Solutions**:

```bash
# Option A: Fix existing PostgreSQL on Render
1. Log into Render dashboard
2. Check PostgreSQL service status
3. Verify/reset database credentials
4. Update DATABASE_URL environment variable

# Option B: Create new PostgreSQL database
1. Create new PostgreSQL on Render
2. Update DATABASE_URL with new credentials
3. Run migrations: npm run db:setup
```

### 2. Environment Variables Setup

**Required for Production**:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secure-jwt-secret-32-chars-minimum
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key
VITE_VAPI_ASSISTANT_ID=your-vapi-assistant-id
```

### 3. Deployment Commands

```bash
# Build for production
npm run build:production

# Deploy to Render
npm run deploy

# Or manual production start
NODE_ENV=production npm start
```

### 4. Health Checks

After deployment, verify:

```bash
# Test API health
curl https://your-domain.onrender.com/api/health

# Test guest requests
curl -X POST https://your-domain.onrender.com/api/guest/requests \
  -H "Content-Type: application/json" \
  -d '{"requestText": "Test order", "roomNumber": "101"}'
```

## 🔍 Troubleshooting Production

### Database Connection Issues

1. **Check Render PostgreSQL Status**:
   - Login to Render dashboard
   - Verify PostgreSQL service is running
   - Check connection limits and usage

2. **Test Database Connection**:

   ```bash
   # Connect directly to verify credentials
   psql $DATABASE_URL
   ```

3. **Fallback Options**:
   - Use external PostgreSQL (Supabase, Neon, etc.)
   - Temporary SQLite for testing (not recommended for production)

### Environment Variables

Ensure all required env vars are set in Render:

- Navigate to Service Settings → Environment
- Add all variables from `.infrastructure/render-env-variables.txt`
- Deploy to apply changes

### Performance Monitoring

- Monitor Render service logs
- Check memory/CPU usage
- Verify response times for `/api/health`

## 🎯 Next Steps

1. **IMMEDIATE**: Fix PostgreSQL connection or create new database
2. **SHORT-TERM**: Verify all environment variables
3. **LONG-TERM**: Set up monitoring and automated backups
