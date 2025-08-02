# 🚀 **PRODUCTION DEPLOYMENT GUIDE - RENDER**

## 📋 **OVERVIEW**

Hướng dẫn triển khai dashboard enhancements lên production Render với PostgreSQL, bao gồm:

- Database performance indexes
- Query optimization với A/B testing
- Caching layer activation
- Performance monitoring

---

## 🎯 **PRE-DEPLOYMENT CHECKLIST**

### **✅ Phase 1 Components (Already Completed)**

- [x] Dashboard logging & monitoring
- [x] Performance metrics collection
- [x] Database indexes (development)
- [x] Transparent caching layer
- [x] New API endpoints

### **🔄 Phase 2 Components (Being Deployed)**

- [ ] Production database indexes
- [ ] Query optimization A/B testing
- [ ] Environment variables configuration
- [ ] Performance monitoring activation

---

## 🗄️ **STEP 1: PRODUCTION DATABASE INDEXES**

### **Connect to Render PostgreSQL:**

```bash
# 1. Get database URL from Render dashboard
# Environment → Database → Connection details

# 2. Connect via psql
psql $DATABASE_URL

# 3. Check current database state
SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;
SELECT count(*) from request;
SELECT count(*) from call_summaries;
```

### **Apply Production Indexes:**

```sql
-- Run these commands ONE BY ONE in production database
-- Copy from: database-optimizations/production-indexes.sql

-- 1. Most critical index first
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_status_tenant_prod
ON request(status, tenant_id)
WHERE status IN ('Đã ghi nhận', 'Đang thực hiện', 'Hoàn thiện');

-- 2. Date filtering index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_created_tenant_prod
ON request(created_at DESC, tenant_id)
WHERE created_at IS NOT NULL;

-- 3. Today's requests index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_today_tenant_prod
ON request(tenant_id, created_at)
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day';

-- 4. Dashboard overview index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_dashboard_overview_prod
ON request(tenant_id, status, created_at DESC)
WHERE status IS NOT NULL AND created_at IS NOT NULL;

-- 5. Ordered results index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_tenant_created_desc_prod
ON request(tenant_id, created_at DESC NULLS LAST);
```

### **Verify Indexes:**

```sql
-- Check indexes were created
SELECT indexname, tablename FROM pg_indexes WHERE indexname LIKE '%_prod';

-- Check index sizes
SELECT indexname, pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes WHERE indexname LIKE '%_prod';
```

---

## ⚙️ **STEP 2: ENVIRONMENT VARIABLES CONFIGURATION**

### **Add to Render Environment Variables:**

```bash
# Dashboard Query Optimization
ENABLE_QUERY_OPTIMIZATION=true

# Cache Configuration (already exists, verify values)
REDIS_URL=<your-redis-url>  # If using Redis for caching

# Monitoring & Logging
LOG_LEVEL=info
PERFORMANCE_MONITORING=true

# Database Configuration (verify existing)
DATABASE_URL=<your-postgresql-url>
```

### **Apply Environment Variables in Render:**

1. Go to Render Dashboard → Your Service → Environment
2. Add new environment variables above
3. Click "Save Changes"
4. Service will redeploy automatically

---

## 🚀 **STEP 3: DEPLOY APPLICATION CODE**

### **Git Deployment:**

```bash
# Push latest changes to production branch
git add .
git commit -m "feat: Add dashboard performance optimization for production"
git push origin main

# Render will auto-deploy from GitHub
# Monitor deployment in Render dashboard
```

### **Monitor Deployment:**

1. **Render Dashboard:** Watch build logs for any errors
2. **Application Logs:** Check for startup messages:
   ```
   🔧 [QueryOptimizer] Initialized
   💾 [DashboardCache] Initialized
   📊 [Performance] Monitoring enabled
   ```

---

## 📊 **STEP 4: VERIFICATION & TESTING**

### **Test Dashboard Performance:**

```bash
# 1. Test new dashboard endpoints
curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.onrender.com/api/dashboard/requests-summary

curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.onrender.com/api/dashboard/query-optimization-stats

# 2. Test frontend dashboard
# Open dashboard in browser and check DevTools Network tab
# Response times should be 200-500ms (down from 1000-2000ms)
```

### **Monitor Performance Metrics:**

```bash
# 3. Check performance monitoring
curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.onrender.com/api/performance/metrics

# 4. Check cache performance
curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.onrender.com/api/cache/stats
```

### **Database Performance Check:**

```sql
-- Connect to production database again
psql $DATABASE_URL

-- Check query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT status, COUNT(*) FROM request
WHERE tenant_id = 'mi-nhon-hotel'
  AND status IN ('Đã ghi nhận', 'Đang thực hiện', 'Hoàn thiện')
GROUP BY status;

-- Should show "Index Scan" instead of "Seq Scan"
-- Execution time should be < 50ms
```

---

## 📈 **STEP 5: PERFORMANCE MONITORING**

### **Key Metrics to Monitor:**

| Metric              | Before      | Target After | Check URL                  |
| ------------------- | ----------- | ------------ | -------------------------- |
| Dashboard Load Time | 1-3 seconds | 200-500ms    | Frontend DevTools          |
| API Response Time   | 500-1500ms  | 100-300ms    | `/api/performance/metrics` |
| Cache Hit Rate      | 0%          | 60-80%       | `/api/cache/stats`         |
| Database Query Time | 200-800ms   | 50-200ms     | PostgreSQL logs            |

### **Monitoring Commands:**

```bash
# Application performance
curl -s https://your-app.onrender.com/api/performance/health | jq

# Cache effectiveness
curl -s https://your-app.onrender.com/api/cache/stats | jq

# Query optimization stats
curl -s https://your-app.onrender.com/api/dashboard/query-optimization-stats | jq
```

---

## 🚨 **ROLLBACK PLAN**

### **If Performance Issues Occur:**

1. **Disable Query Optimization:**

   ```bash
   # Set in Render environment
   ENABLE_QUERY_OPTIMIZATION=false
   # Service will redeploy and use fallback queries
   ```

2. **Clear Cache if Issues:**

   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     https://your-app.onrender.com/api/cache/clear
   ```

3. **Remove Database Indexes (Last Resort):**

   ```sql
   -- Connect to database
   psql $DATABASE_URL

   -- Remove indexes if they cause issues
   DROP INDEX CONCURRENTLY idx_request_status_tenant_prod;
   DROP INDEX CONCURRENTLY idx_request_created_tenant_prod;
   -- Continue for other indexes...
   ```

4. **Revert Code Deployment:**
   ```bash
   git revert HEAD
   git push origin main
   # Render will auto-deploy previous version
   ```

---

## ✅ **SUCCESS CRITERIA**

### **Dashboard Performance:**

- [ ] Frontend dashboard loads in < 1 second
- [ ] API endpoints respond in < 300ms
- [ ] Cache hit rate > 60%
- [ ] No increase in error rates

### **Database Performance:**

- [ ] All indexes created successfully
- [ ] Query execution time < 100ms
- [ ] Index usage confirmed in pg_stat_user_indexes
- [ ] No performance degradation on other queries

### **System Stability:**

- [ ] Application starts successfully
- [ ] No memory leaks or increased CPU usage
- [ ] Error logs show no new issues
- [ ] All dashboard functions work correctly

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues:**

| Issue             | Symptom                 | Solution                                                |
| ----------------- | ----------------------- | ------------------------------------------------------- |
| Slow Dashboard    | > 2 second load time    | Check query optimization stats, verify indexes          |
| High Memory Usage | Render service restarts | Reduce cache size, check for memory leaks               |
| Database Timeouts | 500 errors on dashboard | Check database connections, consider index optimization |
| Cache Misses      | Hit rate < 20%          | Check cache TTL settings, verify data consistency       |

### **Debug Commands:**

```bash
# Check application health
curl https://your-app.onrender.com/api/performance/health

# Check logs in Render dashboard
# Go to Render → Your Service → Logs

# Check database performance
psql $DATABASE_URL -c "SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';"
```

---

## 🎯 **NEXT STEPS AFTER SUCCESSFUL DEPLOYMENT**

1. **Monitor for 24-48 hours**
2. **Collect performance metrics**
3. **Decide on Phase 3 implementation**
4. **Consider additional optimizations based on real usage data**

---

**Deployment Date:** `_____________`  
**Deployed By:** `_____________`  
**Verification Status:** `_____________`  
**Rollback Plan Tested:** `_____________`
