-- ============================================
-- AUTH SYSTEM DATABASE MIGRATION
-- ============================================
-- Creates production tables for sessions, audit logs, and verification tokens

-- ============================================
-- USER SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token_id VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB NOT NULL DEFAULT '{}',
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    location_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Indexes for performance
    INDEX idx_user_sessions_user_id (user_id),
    INDEX idx_user_sessions_token_id (token_id),
    INDEX idx_user_sessions_active (is_active, expires_at),
    INDEX idx_user_sessions_ip (ip_address),
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(255),
    username VARCHAR(255),
    email VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    session_id VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255),
    result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'failure', 'warning')),
    details JSONB DEFAULT '{}',
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    location_info JSONB DEFAULT '{}',
    
    -- Indexes for querying and performance
    INDEX idx_audit_logs_timestamp (timestamp),
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_event_type (event_type),
    INDEX idx_audit_logs_ip_address (ip_address),
    INDEX idx_audit_logs_result (result),
    INDEX idx_audit_logs_risk_level (risk_level),
    INDEX idx_audit_logs_session_id (session_id),
    
    -- Composite indexes for common queries
    INDEX idx_audit_logs_user_time (user_id, timestamp),
    INDEX idx_audit_logs_ip_time (ip_address, timestamp),
    INDEX idx_audit_logs_event_result (event_type, result)
);

-- ============================================
-- EMAIL VERIFICATION TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    token_type VARCHAR(50) DEFAULT 'email_verification' CHECK (token_type IN ('email_verification', 'password_reset')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN DEFAULT FALSE,
    
    -- Indexes
    INDEX idx_verification_tokens_token (token),
    INDEX idx_verification_tokens_email (email),
    INDEX idx_verification_tokens_user_id (user_id),
    INDEX idx_verification_tokens_expires (expires_at),
    INDEX idx_verification_tokens_type (token_type),
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- ============================================
-- SECURITY ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS security_alerts (
    id VARCHAR(255) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    user_id VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    trigger_event_id VARCHAR(255),
    related_events JSONB DEFAULT '[]',
    action_taken TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    
    -- Indexes
    INDEX idx_security_alerts_timestamp (timestamp),
    INDEX idx_security_alerts_severity (severity),
    INDEX idx_security_alerts_type (alert_type),
    INDEX idx_security_alerts_resolved (resolved),
    INDEX idx_security_alerts_user_id (user_id),
    INDEX idx_security_alerts_ip (ip_address),
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES staff(id) ON DELETE SET NULL,
    FOREIGN KEY (trigger_event_id) REFERENCES audit_logs(id) ON DELETE SET NULL
);

-- ============================================
-- RATE LIMITING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id VARCHAR(255) PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL, -- IP address or user ID
    limit_type VARCHAR(100) NOT NULL, -- 'login', 'registration', 'password_reset'
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Composite unique constraint
    UNIQUE(identifier, limit_type, window_start),
    
    -- Indexes
    INDEX idx_rate_limits_identifier (identifier),
    INDEX idx_rate_limits_type (limit_type),
    INDEX idx_rate_limits_expires (expires_at)
);

-- ============================================
-- FUNCTIONS FOR CLEANUP
-- ============================================

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at <= CURRENT_TIMESTAMP OR is_active = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE timestamp <= CURRENT_TIMESTAMP - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired verification tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM email_verification_tokens 
    WHERE expires_at <= CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired rate limits
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limits 
    WHERE expires_at <= CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS FOR AUTOMATIC CLEANUP
-- ============================================

-- Create extension if not exists (for scheduling)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup jobs (uncomment when pg_cron is available)
-- SELECT cron.schedule('cleanup-expired-sessions', '*/15 * * * *', 'SELECT cleanup_expired_sessions();');
-- SELECT cron.schedule('cleanup-old-audit-logs', '0 2 * * 0', 'SELECT cleanup_old_audit_logs();');
-- SELECT cron.schedule('cleanup-expired-tokens', '0 1 * * *', 'SELECT cleanup_expired_tokens();');
-- SELECT cron.schedule('cleanup-rate-limits', '*/5 * * * *', 'SELECT cleanup_expired_rate_limits();');

-- ============================================
-- INITIAL DATA / INDEXES OPTIMIZATION
-- ============================================

-- Add additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_event_time 
ON audit_logs(user_id, event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_event_time 
ON audit_logs(ip_address, event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active 
ON user_sessions(user_id, is_active, last_active_at DESC);

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_alerts_unresolved 
ON security_alerts(timestamp DESC) WHERE resolved = FALSE;

CREATE INDEX IF NOT EXISTS idx_audit_logs_failures 
ON audit_logs(timestamp DESC, ip_address) WHERE result = 'failure';

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE user_sessions IS 'Stores active user sessions with device and location information';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all authentication events';
COMMENT ON TABLE email_verification_tokens IS 'Email verification and password reset tokens';
COMMENT ON TABLE security_alerts IS 'Security alerts generated by the audit system';
COMMENT ON TABLE rate_limits IS 'Rate limiting data for various authentication endpoints';

COMMENT ON COLUMN user_sessions.device_info IS 'JSON containing device type, OS, browser, and fingerprint';
COMMENT ON COLUMN user_sessions.location_info IS 'JSON containing country, region, city, and ISP information';
COMMENT ON COLUMN audit_logs.details IS 'JSON containing event-specific additional information';
COMMENT ON COLUMN audit_logs.risk_level IS 'Risk assessment of the logged event';

-- Migration completed successfully
SELECT 'AUTH SYSTEM TABLES CREATED SUCCESSFULLY' AS status;