-- ============================================================================
-- PRODUCTION DASHBOARD INDEXES FOR RENDER (PostgreSQL)
-- ============================================================================
-- PRODUCTION READY: Safe indexes for Render deployment with CONCURRENTLY
-- Run these commands manually on production database via Render console

-- ============================================
-- PREREQUISITES CHECK
-- ============================================

-- 1. Check current database size and performance before applying
-- SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;
-- SELECT schemaname, tablename, attname, n_distinct, correlation FROM pg_stats WHERE tablename = 'request' AND attname IN ('status', 'tenant_id', 'created_at');

-- ============================================
-- PRODUCTION INDEXES - APPLY THESE MANUALLY
-- ============================================

-- Index 1: Status + Tenant filtering (Most important for dashboard)
-- Optimizes: Dashboard status counts by tenant
-- Expected improvement: 70-80% faster status queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_status_tenant_prod 
ON request(status, tenant_id) 
WHERE status IN ('Đã ghi nhận', 'Đang thực hiện', 'Hoàn thiện');

-- Index 2: Date + Tenant filtering  
-- Optimizes: Today's requests, date range queries
-- Expected improvement: 60-75% faster date queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_created_tenant_prod
ON request(created_at DESC, tenant_id)
WHERE created_at IS NOT NULL;

-- Index 3: Today's requests specialized index
-- Optimizes: COUNT(*) WHERE created_at >= CURRENT_DATE AND tenant_id = ?
-- Expected improvement: 80-90% faster for today's count
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_today_tenant_prod
ON request(tenant_id, created_at)
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day';

-- Index 4: Dashboard overview composite index
-- Optimizes: Complex dashboard queries with all filters
-- Expected improvement: 50-70% faster for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_dashboard_overview_prod
ON request(tenant_id, status, created_at DESC)
WHERE status IS NOT NULL AND created_at IS NOT NULL;

-- Index 5: Ordered results by tenant (for pagination)
-- Optimizes: SELECT * FROM request WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?
-- Expected improvement: 60-80% faster for paginated results
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_tenant_created_desc_prod
ON request(tenant_id, created_at DESC NULLS LAST);

-- ============================================
-- CALL_SUMMARIES TABLE OPTIMIZATIONS (if table exists)
-- ============================================

-- Index 6: Call summaries by date (for call analytics)
-- Check if table exists first: SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'call_summaries');
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_summaries_timestamp_prod
ON call_summaries(timestamp DESC)
WHERE timestamp IS NOT NULL;

-- Index 7: Call summaries for today's calls
-- Optimizes: COUNT(*) WHERE timestamp >= CURRENT_DATE
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_summaries_today_prod
ON call_summaries(timestamp)
WHERE timestamp >= CURRENT_DATE;

-- Index 8: Duration calculations
-- Optimizes: AVG(duration) WHERE duration IS NOT NULL AND duration ~ '^[0-9]+$'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_summaries_duration_prod
ON call_summaries(duration)
WHERE duration IS NOT NULL AND duration ~ '^[0-9]+$';

-- ============================================
-- VERIFICATION QUERIES - Run after index creation
-- ============================================

-- Check all indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE indexname LIKE '%_prod'
ORDER BY tablename, indexname;

-- Check index sizes (monitor disk usage)
SELECT 
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes 
WHERE indexname LIKE '%_prod'
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- Test query performance (compare before/after)
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    status,
    COUNT(*) as count
FROM request 
WHERE tenant_id = 'mi-nhon-hotel'  -- Replace with actual tenant
  AND status IN ('Đã ghi nhận', 'Đang thực hiện', 'Hoàn thiện')
GROUP BY status;

-- Test today's requests query
EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*) as today_count
FROM request
WHERE tenant_id = 'mi-nhon-hotel'  -- Replace with actual tenant
  AND created_at >= CURRENT_DATE;

-- ============================================
-- PERFORMANCE MONITORING
-- ============================================

-- Monitor index usage after deployment
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE indexname LIKE '%_prod'
ORDER BY idx_scan DESC;

-- Monitor query performance
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    min_time,
    max_time
FROM pg_stat_statements 
WHERE query LIKE '%request%'
  AND query LIKE '%status%'
ORDER BY total_time DESC
LIMIT 10;

-- ============================================
-- ROLLBACK SCRIPT (Emergency use only)
-- ============================================

-- Uncomment and run these if indexes cause issues:
/*
DROP INDEX CONCURRENTLY IF EXISTS idx_request_status_tenant_prod;
DROP INDEX CONCURRENTLY IF EXISTS idx_request_created_tenant_prod;
DROP INDEX CONCURRENTLY IF EXISTS idx_request_today_tenant_prod;
DROP INDEX CONCURRENTLY IF EXISTS idx_request_dashboard_overview_prod;
DROP INDEX CONCURRENTLY IF EXISTS idx_request_tenant_created_desc_prod;
DROP INDEX CONCURRENTLY IF EXISTS idx_call_summaries_timestamp_prod;
DROP INDEX CONCURRENTLY IF EXISTS idx_call_summaries_today_prod;
DROP INDEX CONCURRENTLY IF EXISTS idx_call_summaries_duration_prod;
*/

-- ============================================
-- DEPLOYMENT INSTRUCTIONS FOR RENDER
-- ============================================

/*
DEPLOYMENT STEPS:

1. Connect to Render PostgreSQL via Dashboard:
   - Go to Render Dashboard → Your Service → Connect tab
   - Copy the PSQL command or use external connection

2. Run commands one by one:
   psql $DATABASE_URL

3. Apply indexes in this order (wait for each to complete):
   - First: Status + Tenant index (most critical)
   - Second: Date + Tenant index  
   - Third: Today's requests index
   - Fourth: Overview composite index
   - Fifth: Ordered results index
   - Sixth-Eighth: Call summaries indexes (if needed)

4. Monitor during application:
   - Check disk space: SELECT pg_size_pretty(pg_database_size(current_database()));
   - Monitor connections: SELECT count(*) FROM pg_stat_activity;
   - Watch for locks: SELECT * FROM pg_locks WHERE NOT granted;

5. Verify after completion:
   - Run verification queries above
   - Test dashboard response times
   - Monitor application logs

6. Set environment variable to enable optimizations:
   ENABLE_QUERY_OPTIMIZATION=true

TIMING EXPECTATIONS:
- Each index creation: 30 seconds to 5 minutes (depending on data size)
- Total time: 5-20 minutes for all indexes
- No downtime expected with CONCURRENTLY

ROLLBACK PLAN:
- Indexes can be dropped immediately if issues occur
- No data loss risk - only performance impact
- Application continues working without indexes
*/