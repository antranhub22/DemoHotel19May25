-- =====================================================
-- 🚀 ADVANCED PERFORMANCE INDEXES
-- 
-- Optimized indexing strategy for enterprise performance
-- Based on actual query patterns and business logic
-- =====================================================

-- ======================================
-- TENANT ISOLATION PERFORMANCE
-- ======================================

-- Primary tenant-based queries (most important)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_tenant_status_priority_created 
ON request (tenant_id, status, priority, created_at DESC)
WHERE status IN ('Đã ghi nhận', 'Đang xử lý', 'Tạm dừng');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_tenant_language_date 
ON call (tenant_id, language, DATE(start_time))
WHERE start_time IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_tenant_call_timestamp 
ON transcript (tenant_id, call_id, timestamp ASC);

-- ======================================
-- REAL-TIME QUERY OPTIMIZATION
-- ======================================

-- For live conversation display (high frequency)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_call_role_timestamp 
ON transcript (call_id, role, timestamp ASC)
WHERE timestamp > NOW() - INTERVAL '24 hours';

-- For recent activity dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_tenant_updated_status 
ON request (tenant_id, updated_at DESC, status)
WHERE updated_at > NOW() - INTERVAL '1 day';

-- For active calls monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_tenant_active 
ON call (tenant_id, start_time DESC)
WHERE end_time IS NULL OR end_time > NOW() - INTERVAL '1 hour';

-- ======================================
-- ANALYTICS & REPORTING OPTIMIZATION
-- ======================================

-- Status distribution analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_tenant_status_date 
ON request (tenant_id, status, DATE(created_at));

-- Priority analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_tenant_priority_date 
ON request (tenant_id, priority, DATE(created_at))
WHERE priority IS NOT NULL;

-- Language usage analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_tenant_language_hour 
ON call (tenant_id, language, EXTRACT(HOUR FROM start_time));

-- Room-based analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_tenant_room_month 
ON request (tenant_id, room_number, DATE_TRUNC('month', created_at))
WHERE room_number IS NOT NULL;

-- ======================================
-- SERVICE TYPE OPTIMIZATION
-- ======================================

-- Service catalog queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_tenant_category_active 
ON services (tenant_id, category, is_active, name)
WHERE is_active = true;

-- Service pricing queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_tenant_price_currency 
ON services (tenant_id, currency, price ASC)
WHERE is_active = true;

-- ======================================
-- STAFF MANAGEMENT OPTIMIZATION
-- ======================================

-- Active staff queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_tenant_role_active 
ON staff (tenant_id, role, is_active, last_login DESC)
WHERE is_active = true;

-- Staff assignment queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_assigned_status_updated 
ON request (assigned_to, status, updated_at DESC)
WHERE assigned_to IS NOT NULL;

-- Staff workload analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_assigned_tenant_date 
ON request (assigned_to, tenant_id, DATE(created_at))
WHERE assigned_to IS NOT NULL;

-- ======================================
-- SEARCH & FILTERING OPTIMIZATION
-- ======================================

-- Full-text search on requests (PostgreSQL specific)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_content_gin 
ON request USING gin(to_tsvector('english', request_content))
WHERE request_content IS NOT NULL;

-- Full-text search on transcripts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_content_gin 
ON transcript USING gin(to_tsvector('english', content))
WHERE length(content) > 10;

-- Guest name search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_guest_name_text 
ON request USING gin(guest_name gin_trgm_ops)
WHERE guest_name IS NOT NULL;

-- Room number partial matching
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_room_pattern 
ON request (tenant_id, room_number text_pattern_ops);

-- ======================================
-- ORDER & BILLING OPTIMIZATION
-- ======================================

-- Order value analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_tenant_amount_currency_date 
ON request (tenant_id, currency, total_amount, DATE(created_at))
WHERE total_amount IS NOT NULL AND total_amount > 0;

-- Order completion tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_tenant_completed_date 
ON request (tenant_id, completed_at, total_amount)
WHERE completed_at IS NOT NULL;

-- Order items aggregation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_request_quantity_price 
ON order_items (request_id, quantity, unit_price);

-- ======================================
-- CALL PERFORMANCE METRICS
-- ======================================

-- Call duration analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_tenant_duration_date 
ON call (tenant_id, duration, DATE(start_time))
WHERE duration IS NOT NULL AND duration > 0;

-- Call success rate tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_tenant_success_date 
ON call (tenant_id, DATE(start_time))
WHERE duration IS NOT NULL AND duration > 10; -- Successful calls

-- Call volume by hour
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_tenant_hour_date 
ON call (tenant_id, EXTRACT(HOUR FROM start_time), DATE(start_time));

-- ======================================
-- HOTEL CONFIGURATION OPTIMIZATION
-- ======================================

-- Hotel profile lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hotel_profiles_tenant_vapi 
ON hotel_profiles (tenant_id, vapi_assistant_id)
WHERE vapi_assistant_id IS NOT NULL;

-- Tenant subscription queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_subscription_active 
ON tenants (subscription_plan, subscription_status, is_active)
WHERE is_active = true;

-- Subdomain routing (critical for multi-tenant)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_subdomain_active 
ON tenants (subdomain, is_active)
WHERE is_active = true;

-- ======================================
-- MESSAGE & COMMUNICATION OPTIMIZATION
-- ======================================

-- Request messages timeline
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_request_created 
ON message (request_id, created_at ASC);

-- Recent messages for notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_tenant_recent 
ON message (tenant_id, created_at DESC)
WHERE created_at > NOW() - INTERVAL '7 days';

-- ======================================
-- PARTIAL INDEXES FOR HOT DATA
-- ======================================

-- Only index recent data for high-frequency queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_recent_hot 
ON transcript (call_id, timestamp DESC)
WHERE timestamp > NOW() - INTERVAL '1 hour';

-- Only index active requests
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_active_hot 
ON request (tenant_id, status, updated_at DESC)
WHERE status NOT IN ('Hoàn thành', 'Đã hủy');

-- Only index ongoing calls
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_ongoing_hot 
ON call (tenant_id, start_time DESC)
WHERE end_time IS NULL;

-- ======================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ======================================

-- Dashboard summary query optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_dashboard_summary 
ON request (tenant_id, status, priority, assigned_to, DATE(created_at));

-- Call summary analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_summary_analytics 
ON call (tenant_id, language, service_type, DATE(start_time), duration);

-- Staff performance analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_performance 
ON request (assigned_to, tenant_id, status, completed_at, created_at)
WHERE assigned_to IS NOT NULL;

-- ======================================
-- PERFORMANCE MONITORING INDEXES
-- ======================================

-- Query performance tracking (for slow query detection)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_large_scan_prevention 
ON request (tenant_id, id DESC)
WHERE created_at > NOW() - INTERVAL '30 days';

-- =====================================================
-- 📊 INDEX USAGE VALIDATION QUERIES
-- =====================================================

-- Use these queries to validate index effectiveness:

/*
-- Check index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename IN ('request', 'call', 'transcript', 'staff', 'tenants')
ORDER BY idx_scan DESC;

-- Check table scan statistics  
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    seq_tup_read / GREATEST(seq_scan, 1) as avg_seq_read
FROM pg_stat_user_tables 
WHERE tablename IN ('request', 'call', 'transcript', 'staff', 'tenants')
ORDER BY seq_tup_read DESC;

-- Find unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;
*/

-- =====================================================
-- 🎯 MAINTENANCE COMMANDS
-- =====================================================

-- Run these commands periodically for optimal performance:

-- Update table statistics
-- ANALYZE request, call, transcript, staff, tenants, services;

-- Rebuild indexes if needed (maintenance window only)
-- REINDEX INDEX CONCURRENTLY idx_request_tenant_status_priority_created;

-- Monitor index bloat
-- SELECT * FROM pg_stat_user_indexes WHERE idx_blks_hit < idx_blks_read;