-- ============================================================================
-- DASHBOARD PERFORMANCE INDEXES - ZERO RISK Enhancement
-- ============================================================================
-- Non-disruptive index additions to optimize dashboard queries
-- Using CONCURRENTLY to avoid table locks and downtime

-- ============================================
-- REQUEST TABLE OPTIMIZATIONS
-- ============================================

-- Composite index for dashboard status filtering by tenant
-- Optimizes: SELECT COUNT(*) FROM request WHERE status = ? AND tenant_id = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_status_tenant_optimized 
ON request(status, tenant_id) 
WHERE status IN ('Đã ghi nhận', 'Đang thực hiện', 'Hoàn thiện');

-- Composite index for dashboard date filtering by tenant  
-- Optimizes: SELECT * FROM request WHERE created_at >= ? AND tenant_id = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_created_tenant_optimized
ON request(created_at DESC, tenant_id)
WHERE created_at IS NOT NULL;

-- Composite index for today's requests filtering
-- Optimizes: SELECT COUNT(*) FROM request WHERE DATE(created_at) = CURRENT_DATE AND tenant_id = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_today_tenant
ON request(tenant_id, created_at)
WHERE created_at >= CURRENT_DATE;

-- Composite index for dashboard overview queries
-- Optimizes complex dashboard queries combining status, date, and tenant
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_dashboard_overview
ON request(tenant_id, status, created_at DESC)
WHERE status IS NOT NULL AND created_at IS NOT NULL;

-- Index for order by created_at with tenant filtering
-- Optimizes: SELECT * FROM request WHERE tenant_id = ? ORDER BY created_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_tenant_created_desc
ON request(tenant_id, created_at DESC NULLS LAST);

-- ============================================
-- CALL_SUMMARIES TABLE OPTIMIZATIONS  
-- ============================================

-- Index for call summaries by tenant and date
-- Optimizes call analytics in dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_summaries_tenant_timestamp
ON call_summaries(tenant_id, timestamp DESC)
WHERE timestamp IS NOT NULL;

-- Index for today's calls filtering
-- Optimizes: SELECT COUNT(*) FROM call_summaries WHERE DATE(timestamp) = CURRENT_DATE
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_summaries_today
ON call_summaries(timestamp)
WHERE timestamp >= CURRENT_DATE;

-- Index for duration calculations
-- Optimizes: SELECT AVG(duration) FROM call_summaries WHERE duration IS NOT NULL
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_summaries_duration
ON call_summaries(duration)
WHERE duration IS NOT NULL AND duration != '';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Query to verify indexes were created successfully
-- Run this after index creation to confirm
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('request', 'call_summaries')
  AND indexname LIKE '%dashboard%' OR indexname LIKE '%optimized%'
ORDER BY tablename, indexname;
*/

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================

-- Uncomment these lines to remove indexes if needed:
/*
DROP INDEX CONCURRENTLY IF EXISTS idx_request_status_tenant_optimized;
DROP INDEX CONCURRENTLY IF EXISTS idx_request_created_tenant_optimized;
DROP INDEX CONCURRENTLY IF EXISTS idx_request_today_tenant;
DROP INDEX CONCURRENTLY IF EXISTS idx_request_dashboard_overview;
DROP INDEX CONCURRENTLY IF EXISTS idx_request_tenant_created_desc;
DROP INDEX CONCURRENTLY IF EXISTS idx_call_summaries_tenant_timestamp;
DROP INDEX CONCURRENTLY IF EXISTS idx_call_summaries_today;
DROP INDEX CONCURRENTLY IF EXISTS idx_call_summaries_duration;
*/

-- ============================================
-- PERFORMANCE TESTING QUERIES
-- ============================================

-- Test queries to verify performance improvement
-- Run EXPLAIN ANALYZE before and after index creation

/*
-- Dashboard status counts by tenant
EXPLAIN ANALYZE
SELECT 
    status,
    COUNT(*) as count
FROM request 
WHERE tenant_id = 'mi-nhon-hotel'
  AND status IN ('Đã ghi nhận', 'Đang thực hiện', 'Hoàn thiện')
GROUP BY status;

-- Today's requests count
EXPLAIN ANALYZE  
SELECT COUNT(*) as today_count
FROM request
WHERE tenant_id = 'mi-nhon-hotel'
  AND created_at >= CURRENT_DATE;

-- Recent requests with ordering
EXPLAIN ANALYZE
SELECT *
FROM request
WHERE tenant_id = 'mi-nhon-hotel'
ORDER BY created_at DESC
LIMIT 50;

-- Call summaries for analytics
EXPLAIN ANALYZE
SELECT 
    COUNT(*) as total_calls,
    AVG(CAST(duration AS INTEGER)) as avg_duration
FROM call_summaries
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days';
*/

-- ============================================
-- MAINTENANCE NOTES
-- ============================================

/*
IMPORTANT:
1. These indexes are created with CONCURRENTLY to avoid locks
2. Index creation may take time on large tables
3. Monitor disk space - indexes require additional storage
4. These indexes specifically optimize dashboard queries
5. Regular ANALYZE should be run after index creation

MONITORING:
- Check pg_stat_user_indexes for index usage
- Monitor query performance with pg_stat_statements
- Watch for slow queries in logs

SAFETY:
- All indexes can be dropped without affecting data
- CONCURRENTLY ensures no downtime during creation
- IF NOT EXISTS prevents errors on re-run
*/