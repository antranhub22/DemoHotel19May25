-- =====================================================
-- 🛡️ ROW-LEVEL SECURITY (RLS) IMPLEMENTATION
-- 
-- Enterprise-grade data isolation using PostgreSQL RLS
-- Ensures complete tenant isolation at the database level
-- =====================================================

-- ======================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ======================================

-- Enable RLS on main entity tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE call ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript ENABLE ROW LEVEL SECURITY;
ALTER TABLE request ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE message ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ======================================
-- CREATE APPLICATION ROLES
-- ======================================

-- Application role for general database access
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'application_role') THEN
        CREATE ROLE application_role;
    END IF;
END
$$;

-- Admin role for system operations
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin_role') THEN
        CREATE ROLE admin_role;
    END IF;
END
$$;

-- Read-only role for analytics
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'analytics_role') THEN
        CREATE ROLE analytics_role;
    END IF;
END
$$;

-- ======================================
-- GRANT BASIC PERMISSIONS
-- ======================================

-- Grant table access to application role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO application_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO application_role;

-- Grant full access to admin role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_role;

-- Grant read-only access to analytics role
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_role;

-- ======================================
-- CREATE HELPER FUNCTIONS
-- ======================================

-- Function to get current tenant ID from session
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('app.current_tenant_id', true),
        current_setting('rls.tenant_id', true),
        'public'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is system admin
CREATE OR REPLACE FUNCTION is_system_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(
        current_setting('app.is_admin', true)::boolean,
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('app.user_role', true),
        'user'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================
-- TENANT ISOLATION POLICIES
-- ======================================

-- TENANTS table: Users can only see their own tenant
CREATE POLICY tenant_isolation_tenants ON tenants
    FOR ALL TO application_role
    USING (
        id = get_current_tenant_id() 
        OR is_system_admin()
    );

-- HOTEL PROFILES: Tenant-scoped access
CREATE POLICY tenant_isolation_hotel_profiles ON hotel_profiles
    FOR ALL TO application_role
    USING (
        tenant_id = get_current_tenant_id()
        OR is_system_admin()
    );

-- SERVICES: Tenant-scoped access
CREATE POLICY tenant_isolation_services ON services
    FOR ALL TO application_role
    USING (
        tenant_id = get_current_tenant_id()
        OR is_system_admin()
    );

-- STAFF: Tenant-scoped access with role-based restrictions
CREATE POLICY tenant_isolation_staff ON staff
    FOR ALL TO application_role
    USING (
        tenant_id = get_current_tenant_id()
        OR is_system_admin()
    );

-- Additional policy for staff: users can only modify their own profile
CREATE POLICY staff_self_modification ON staff
    FOR UPDATE TO application_role
    USING (
        (tenant_id = get_current_tenant_id() AND id = current_setting('app.current_user_id', true))
        OR get_current_user_role() IN ('admin', 'manager')
        OR is_system_admin()
    );

-- CALLS: Tenant-scoped access
CREATE POLICY tenant_isolation_call ON call
    FOR ALL TO application_role
    USING (
        tenant_id = get_current_tenant_id()
        OR is_system_admin()
    );

-- TRANSCRIPTS: Tenant-scoped access
CREATE POLICY tenant_isolation_transcript ON transcript
    FOR ALL TO application_role
    USING (
        tenant_id = get_current_tenant_id()
        OR is_system_admin()
    );

-- REQUESTS: Tenant-scoped access with assignment-based visibility
CREATE POLICY tenant_isolation_request ON request
    FOR ALL TO application_role
    USING (
        tenant_id = get_current_tenant_id()
        OR is_system_admin()
    );

-- Additional policy for requests: assigned staff can see their requests
CREATE POLICY request_assignment_visibility ON request
    FOR SELECT TO application_role
    USING (
        assigned_to = current_setting('app.current_user_id', true)
        OR tenant_id = get_current_tenant_id()
        OR is_system_admin()
    );

-- CALL SUMMARIES: Tenant-scoped access
CREATE POLICY tenant_isolation_call_summaries ON call_summaries
    FOR ALL TO application_role
    USING (
        -- Call summaries don't have direct tenant_id, so we join with call table
        EXISTS (
            SELECT 1 FROM call 
            WHERE call.call_id_vapi = call_summaries.call_id 
            AND call.tenant_id = get_current_tenant_id()
        )
        OR is_system_admin()
    );

-- MESSAGES: Tenant-scoped access
CREATE POLICY tenant_isolation_message ON message
    FOR ALL TO application_role
    USING (
        tenant_id = get_current_tenant_id()
        OR is_system_admin()
    );

-- ORDER ITEMS: Access through request relationship
CREATE POLICY tenant_isolation_order_items ON order_items
    FOR ALL TO application_role
    USING (
        EXISTS (
            SELECT 1 FROM request 
            WHERE request.id = order_items.request_id 
            AND request.tenant_id = get_current_tenant_id()
        )
        OR is_system_admin()
    );

-- ======================================
-- ROLE-BASED ACCESS POLICIES
-- ======================================

-- Managers can see all data within their tenant
CREATE POLICY manager_full_access ON request
    FOR ALL TO application_role
    USING (
        tenant_id = get_current_tenant_id()
        AND (
            get_current_user_role() IN ('manager', 'admin')
            OR is_system_admin()
        )
    );

-- Front desk can see and modify unassigned requests
CREATE POLICY front_desk_unassigned_access ON request
    FOR ALL TO application_role
    USING (
        tenant_id = get_current_tenant_id()
        AND (
            assigned_to IS NULL
            OR assigned_to = current_setting('app.current_user_id', true)
            OR get_current_user_role() IN ('front-desk', 'manager', 'admin')
            OR is_system_admin()
        )
    );

-- Staff can only see transcripts for calls in their tenant
CREATE POLICY staff_transcript_access ON transcript
    FOR SELECT TO application_role
    USING (
        tenant_id = get_current_tenant_id()
        AND (
            get_current_user_role() IN ('manager', 'admin', 'front-desk')
            OR is_system_admin()
        )
    );

-- ======================================
-- ANALYTICS ROLE POLICIES
-- ======================================

-- Analytics role has read-only access with tenant scoping
CREATE POLICY analytics_read_only_tenants ON tenants
    FOR SELECT TO analytics_role
    USING (
        id = get_current_tenant_id()
        OR is_system_admin()
    );

CREATE POLICY analytics_read_only_requests ON request
    FOR SELECT TO analytics_role
    USING (
        tenant_id = get_current_tenant_id()
        OR is_system_admin()
    );

CREATE POLICY analytics_read_only_calls ON call
    FOR SELECT TO analytics_role
    USING (
        tenant_id = get_current_tenant_id()
        OR is_system_admin()
    );

-- ======================================
-- DATA RETENTION POLICIES
-- ======================================

-- Function to check if data is within retention period
CREATE OR REPLACE FUNCTION is_within_retention_period(created_date TIMESTAMP, table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    retention_days INTEGER;
BEGIN
    -- Get retention period from tenant settings
    SELECT COALESCE(data_retention_days, 90) INTO retention_days
    FROM tenants 
    WHERE id = get_current_tenant_id();
    
    -- Default to 90 days if not found
    retention_days := COALESCE(retention_days, 90);
    
    RETURN created_date >= (CURRENT_DATE - INTERVAL '1 day' * retention_days);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply retention policies to historical data
CREATE POLICY data_retention_transcripts ON transcript
    FOR SELECT TO application_role
    USING (
        (tenant_id = get_current_tenant_id() OR is_system_admin())
        AND is_within_retention_period(timestamp, 'transcript')
    );

CREATE POLICY data_retention_calls ON call
    FOR SELECT TO application_role
    USING (
        (tenant_id = get_current_tenant_id() OR is_system_admin())
        AND is_within_retention_period(created_at, 'call')
    );

-- ======================================
-- AUDIT POLICIES
-- ======================================

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id TEXT,
    tenant_id TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log access policy
CREATE POLICY audit_log_access ON audit_log
    FOR SELECT TO application_role
    USING (
        tenant_id = get_current_tenant_id()
        OR is_system_admin()
    );

-- Function to log data changes
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        operation,
        old_values,
        new_values,
        user_id,
        tenant_id
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        current_setting('app.current_user_id', true),
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.tenant_id
            ELSE NEW.tenant_id
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
CREATE TRIGGER audit_trigger_request
    AFTER INSERT OR UPDATE OR DELETE ON request
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_trigger_staff
    AFTER INSERT OR UPDATE OR DELETE ON staff
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_trigger_services
    AFTER INSERT OR UPDATE OR DELETE ON services
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ======================================
-- BYPASS POLICIES FOR ADMIN OPERATIONS
-- ======================================

-- Admin role can bypass all RLS policies
CREATE POLICY bypass_rls_admin ON tenants
    FOR ALL TO admin_role
    USING (true);

CREATE POLICY bypass_rls_admin_hotel_profiles ON hotel_profiles
    FOR ALL TO admin_role
    USING (true);

CREATE POLICY bypass_rls_admin_services ON services
    FOR ALL TO admin_role
    USING (true);

CREATE POLICY bypass_rls_admin_staff ON staff
    FOR ALL TO admin_role
    USING (true);

CREATE POLICY bypass_rls_admin_call ON call
    FOR ALL TO admin_role
    USING (true);

CREATE POLICY bypass_rls_admin_transcript ON transcript
    FOR ALL TO admin_role
    USING (true);

CREATE POLICY bypass_rls_admin_request ON request
    FOR ALL TO admin_role
    USING (true);

-- ======================================
-- UTILITY FUNCTIONS FOR APPLICATION
-- ======================================

-- Function to set tenant context (called by application)
CREATE OR REPLACE FUNCTION set_tenant_context(
    tenant_id TEXT,
    user_id TEXT DEFAULT NULL,
    user_role TEXT DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_id, true);
    
    IF user_id IS NOT NULL THEN
        PERFORM set_config('app.current_user_id', user_id, true);
    END IF;
    
    PERFORM set_config('app.user_role', user_role, true);
    PERFORM set_config('app.is_admin', is_admin::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear tenant context
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', '', true);
    PERFORM set_config('app.current_user_id', '', true);
    PERFORM set_config('app.user_role', '', true);
    PERFORM set_config('app.is_admin', '', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================
-- MONITORING AND DIAGNOSTICS
-- ======================================

-- View to check RLS policy status
CREATE OR REPLACE VIEW rls_policy_status AS
SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END AS rls_status,
    COUNT(pol.polname) AS policy_count
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
LEFT JOIN pg_policy pol ON pol.polrelid = c.oid
WHERE t.schemaname = 'public'
GROUP BY schemaname, tablename, rowsecurity
ORDER BY tablename;

-- Function to validate tenant isolation
CREATE OR REPLACE FUNCTION validate_tenant_isolation(test_tenant_id TEXT)
RETURNS TABLE(table_name TEXT, accessible_rows BIGINT, expected_rows BIGINT, status TEXT) AS $$
DECLARE
    rec RECORD;
    accessible_count BIGINT;
    total_count BIGINT;
BEGIN
    -- Set test tenant context
    PERFORM set_tenant_context(test_tenant_id);
    
    -- Check each tenant-isolated table
    FOR rec IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_name IN ('request', 'call', 'transcript', 'staff', 'services', 'hotel_profiles')
    LOOP
        -- Count accessible rows with RLS
        EXECUTE format('SELECT COUNT(*) FROM %I', rec.table_name) INTO accessible_count;
        
        -- Count total rows (bypassing RLS as admin)
        PERFORM set_config('app.is_admin', 'true', true);
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE tenant_id = %L', rec.table_name, test_tenant_id) INTO total_count;
        PERFORM set_config('app.is_admin', 'false', true);
        
        -- Return comparison
        RETURN QUERY SELECT 
            rec.table_name,
            accessible_count,
            total_count,
            CASE 
                WHEN accessible_count = total_count THEN 'PASS'
                ELSE 'FAIL'
            END;
    END LOOP;
    
    -- Clear context
    PERFORM clear_tenant_context();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 📝 USAGE INSTRUCTIONS
-- =====================================================

/*
-- Set tenant context in your application before making queries:
SELECT set_tenant_context('tenant-123', 'user-456', 'manager', false);

-- Your queries will now be automatically filtered by tenant:
SELECT * FROM request; -- Only returns requests for tenant-123

-- Clear context when done:
SELECT clear_tenant_context();

-- Check RLS status:
SELECT * FROM rls_policy_status;

-- Validate tenant isolation:
SELECT * FROM validate_tenant_isolation('tenant-123');
*/

-- =====================================================
-- 🔧 MAINTENANCE COMMANDS
-- =====================================================

-- Grant permissions to your application user:
-- GRANT application_role TO your_app_user;

-- For analytics user:
-- GRANT analytics_role TO your_analytics_user;

-- For admin operations:
-- GRANT admin_role TO your_admin_user;