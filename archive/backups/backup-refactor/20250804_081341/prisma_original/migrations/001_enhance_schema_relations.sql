-- ============================================
-- PRISMA SCHEMA ENHANCEMENT MIGRATION
-- ============================================
-- 
-- This migration adds proper relations, indexes, and constraints
-- to improve performance and data integrity.
-- 
-- IMPORTANT: Test in staging environment first!
-- 
-- Created: 2025-02-01
-- Version: 1.0.0
-- Author: Prisma Migration System

BEGIN;

-- ============================================
-- STEP 1: ADD MISSING COLUMNS
-- ============================================

-- Add tenant_id to call_summaries if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='call_summaries' AND column_name='tenant_id') THEN
        ALTER TABLE call_summaries ADD COLUMN tenant_id VARCHAR(255);
        COMMENT ON COLUMN call_summaries.tenant_id IS 'Multi-tenant support for call summaries';
    END IF;
END $$;

-- Add tenant_id to users if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='tenant_id') THEN
        ALTER TABLE users ADD COLUMN tenant_id VARCHAR(255);
        COMMENT ON COLUMN users.tenant_id IS 'Multi-tenant support for users';
    END IF;
END $$;

-- ============================================
-- STEP 2: ADD UNIQUE CONSTRAINTS
-- ============================================

-- Add unique constraint to subdomain if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='tenants_subdomain_key') THEN
        ALTER TABLE tenants ADD CONSTRAINT tenants_subdomain_key UNIQUE (subdomain);
    END IF;
END $$;

-- Add unique constraint to custom_domain if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='tenants_custom_domain_key') THEN
        ALTER TABLE tenants ADD CONSTRAINT tenants_custom_domain_key UNIQUE (custom_domain);
    END IF;
END $$;

-- ============================================
-- STEP 3: ADD FOREIGN KEY CONSTRAINTS
-- ============================================

-- Add foreign key constraint for request.tenant_id -> tenants.id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='fk_request_tenant') THEN
        ALTER TABLE request 
        ADD CONSTRAINT fk_request_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for transcript.tenant_id -> tenants.id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='fk_transcript_tenant') THEN
        ALTER TABLE transcript 
        ADD CONSTRAINT fk_transcript_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for call_summaries.tenant_id -> tenants.id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='fk_call_summaries_tenant') THEN
        ALTER TABLE call_summaries 
        ADD CONSTRAINT fk_call_summaries_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for users.tenant_id -> tenants.id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='fk_users_tenant') THEN
        ALTER TABLE users 
        ADD CONSTRAINT fk_users_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraint for staff.tenant_id -> tenants.id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='fk_staff_tenant') THEN
        ALTER TABLE staff 
        ADD CONSTRAINT fk_staff_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for request.assigned_to -> staff.id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='fk_request_assigned_staff') THEN
        ALTER TABLE request 
        ADD CONSTRAINT fk_request_assigned_staff 
        FOREIGN KEY (assigned_to) REFERENCES staff(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- STEP 4: ADD PERFORMANCE INDEXES
-- ============================================

-- Tenants indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_subscription_plan ON tenants(subscription_plan);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_trial_ends_at ON tenants(trial_ends_at);

-- Request indexes (additional to existing ones)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_priority ON request(priority);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_assigned_to ON request(assigned_to);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_created_at ON request(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_completed_at ON request(completed_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_room_number ON request(room_number);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_status_tenant ON request(status, tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_request_created_tenant ON request(created_at, tenant_id);

-- Transcript indexes (additional to existing ones)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_tenant_id ON transcript(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_timestamp ON transcript(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_role ON transcript(role);

-- Composite indexes for transcript queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_call_tenant ON transcript(call_id, tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transcript_time_tenant ON transcript(timestamp, tenant_id);

-- Call summaries indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_summaries_tenant_id ON call_summaries(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_summaries_room_number ON call_summaries(room_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_summaries_time_tenant ON call_summaries(timestamp, tenant_id);

-- Staff indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_is_active ON staff(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_email ON staff(email);

-- Users indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Orders indexes (for better performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_room_number ON orders(room_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Platform tokens indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_platform_tokens_platform ON platform_tokens(platform);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_platform_tokens_expires_at ON platform_tokens(expires_at);

-- User sessions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- ============================================
-- STEP 5: ADD DATABASE-LEVEL VALIDATIONS
-- ============================================

-- Add check constraints for better data integrity
DO $$ 
BEGIN
    -- Ensure subscription_plan is valid
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name='chk_tenants_subscription_plan') THEN
        ALTER TABLE tenants 
        ADD CONSTRAINT chk_tenants_subscription_plan 
        CHECK (subscription_plan IN ('trial', 'basic', 'premium', 'enterprise'));
    END IF;

    -- Ensure subscription_status is valid
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name='chk_tenants_subscription_status') THEN
        ALTER TABLE tenants 
        ADD CONSTRAINT chk_tenants_subscription_status 
        CHECK (subscription_status IN ('active', 'inactive', 'expired', 'cancelled'));
    END IF;

    -- Ensure request priority is valid
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name='chk_request_priority') THEN
        ALTER TABLE request 
        ADD CONSTRAINT chk_request_priority 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    END IF;

    -- Ensure request status is valid
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name='chk_request_status') THEN
        ALTER TABLE request 
        ADD CONSTRAINT chk_request_status 
        CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'Đã ghi nhận', 'Đang thực hiện', 'Đã hoàn thành'));
    END IF;

    -- Ensure urgency is valid
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name='chk_request_urgency') THEN
        ALTER TABLE request 
        ADD CONSTRAINT chk_request_urgency 
        CHECK (urgency IN ('low', 'normal', 'high', 'critical'));
    END IF;

    -- Ensure email format (basic validation)
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name='chk_tenants_email_format') THEN
        ALTER TABLE tenants 
        ADD CONSTRAINT chk_tenants_email_format 
        CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;

    -- Ensure phone format (basic validation)
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name='chk_tenants_phone_format') THEN
        ALTER TABLE tenants 
        ADD CONSTRAINT chk_tenants_phone_format 
        CHECK (phone IS NULL OR phone ~* '^\+?[0-9\s\-\(\)]+$');
    END IF;

    -- Ensure positive limits
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name='chk_tenants_positive_limits') THEN
        ALTER TABLE tenants 
        ADD CONSTRAINT chk_tenants_positive_limits 
        CHECK (
            (max_voices IS NULL OR max_voices > 0) AND
            (max_languages IS NULL OR max_languages > 0) AND
            (data_retention_days IS NULL OR data_retention_days > 0) AND
            (monthly_call_limit IS NULL OR monthly_call_limit > 0)
        );
    END IF;
END $$;

-- ============================================
-- STEP 6: UPDATE EXISTING DATA
-- ============================================

-- Set default tenant_id for existing records where needed
UPDATE call_summaries 
SET tenant_id = 'mi-nhon-hotel' 
WHERE tenant_id IS NULL;

UPDATE transcript 
SET tenant_id = 'mi-nhon-hotel' 
WHERE tenant_id IS NULL OR tenant_id = 'default';

UPDATE request 
SET tenant_id = 'mi-nhon-hotel' 
WHERE tenant_id IS NULL;

-- ============================================
-- STEP 7: ANALYZE TABLES FOR QUERY OPTIMIZATION
-- ============================================

ANALYZE tenants;
ANALYZE request;
ANALYZE transcript;
ANALYZE call_summaries;
ANALYZE staff;
ANALYZE users;
ANALYZE orders;

-- ============================================
-- STEP 8: ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE tenants IS 'Multi-tenant configuration and subscription management';
COMMENT ON TABLE request IS 'Guest requests with full lifecycle tracking';
COMMENT ON TABLE transcript IS 'Voice assistant conversation transcripts';
COMMENT ON TABLE call_summaries IS 'Summarized call data for analytics';
COMMENT ON TABLE staff IS 'Hotel staff members with role-based access';

COMMENT ON COLUMN tenants.subscription_plan IS 'Subscription tier: trial, basic, premium, enterprise';
COMMENT ON COLUMN tenants.subscription_status IS 'Current subscription state';
COMMENT ON COLUMN tenants.trial_ends_at IS 'Trial expiration date for trial subscriptions';
COMMENT ON COLUMN request.priority IS 'Request priority level affecting processing order';
COMMENT ON COLUMN request.urgency IS 'Request urgency classification';
COMMENT ON COLUMN request.assigned_to IS 'Staff member assigned to handle the request';

-- ============================================
-- MIGRATION COMPLETION
-- ============================================

-- Log migration completion
INSERT INTO migration_log (migration_name, executed_at, success)
VALUES ('001_enhance_schema_relations', NOW(), true)
ON CONFLICT (migration_name) DO UPDATE SET 
    executed_at = NOW(), 
    success = true;

COMMIT;

-- ============================================
-- POST-MIGRATION VERIFICATION
-- ============================================

-- Verify foreign keys are created
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('request', 'transcript', 'call_summaries', 'users', 'staff');

-- Verify indexes are created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('tenants', 'request', 'transcript', 'call_summaries', 'staff', 'users')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;