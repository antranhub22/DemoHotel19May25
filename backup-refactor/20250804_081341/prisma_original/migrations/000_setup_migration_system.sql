-- ============================================
-- MIGRATION SYSTEM SETUP
-- ============================================
-- 
-- This script sets up the migration tracking system
-- to monitor schema changes and ensure safe deployments.

BEGIN;

-- Create migration tracking table if not exists
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    execution_time_ms INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_migration_log_executed_at ON migration_log(executed_at);
CREATE INDEX IF NOT EXISTS idx_migration_log_success ON migration_log(success);

-- Add comments
COMMENT ON TABLE migration_log IS 'Tracks database migrations and their execution status';
COMMENT ON COLUMN migration_log.migration_name IS 'Unique identifier for the migration';
COMMENT ON COLUMN migration_log.execution_time_ms IS 'Migration execution time in milliseconds';

-- Insert initial record
INSERT INTO migration_log (migration_name, notes)
VALUES ('000_setup_migration_system', 'Migration tracking system initialized')
ON CONFLICT (migration_name) DO NOTHING;

COMMIT;