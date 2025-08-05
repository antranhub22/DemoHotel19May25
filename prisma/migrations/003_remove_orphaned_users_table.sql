-- ============================================
-- ORPHANED TABLE CLEANUP MIGRATION - Remove users table
-- ============================================
-- 
-- This migration removes the orphaned 'users' table which has been
-- replaced by the 'staff' table with proper relations and features
-- 
-- Created: 2025-01-20
-- Version: 1.0.0
-- Author: Schema Cleanup Process

BEGIN;

-- ============================================
-- STEP 1: SAFETY CHECK AND BACKUP
-- ============================================

-- Check if users table exists and has any data
DO $$
DECLARE
    user_count INTEGER := 0;
    table_exists BOOLEAN := FALSE;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Count records for safety
        EXECUTE 'SELECT COUNT(*) FROM users' INTO user_count;
        
        RAISE NOTICE 'Found users table with % records', user_count;
        
        -- Backup any existing data before deletion
        IF user_count > 0 THEN
            EXECUTE 'CREATE TABLE users_backup_20250120 AS SELECT * FROM users';
            RAISE NOTICE 'Created backup table: users_backup_20250120';
            
            INSERT INTO migration_log (migration_name, notes)
            VALUES ('003_remove_orphaned_users_backup', 
                    'Backed up ' || user_count || ' records from users table');
        END IF;
    ELSE
        RAISE NOTICE 'Users table does not exist - nothing to remove';
    END IF;
END $$;

-- ============================================
-- STEP 2: REMOVE ORPHANED USERS TABLE
-- ============================================

-- Drop orphaned users table (replaced by staff table)
DROP TABLE IF EXISTS users CASCADE;

-- Log the removal
INSERT INTO migration_log (migration_name, notes)
VALUES ('003_remove_orphaned_users_drop', 'Removed orphaned users table - functionality moved to staff table');

-- ============================================
-- STEP 3: VERIFY STAFF TABLE HAS NECESSARY FEATURES
-- ============================================

-- Ensure staff table has all necessary columns for user management
DO $$
BEGIN
    -- Check that staff table exists with proper columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
        RAISE EXCEPTION 'Staff table does not exist - cannot remove users table safely';
    END IF;
    
    -- Verify key columns exist in staff table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'staff' AND column_name = 'username') THEN
        RAISE EXCEPTION 'Staff table missing username column - migration unsafe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'staff' AND column_name = 'password') THEN
        RAISE EXCEPTION 'Staff table missing password column - migration unsafe';
    END IF;
    
    RAISE NOTICE 'Staff table verified - has all necessary user management features';
END $$;

-- ============================================
-- STEP 4: CLEANUP INDEXES AND CONSTRAINTS
-- ============================================

-- Remove any remaining indexes or constraints that referenced users table
DO $$
BEGIN
    -- Drop any remaining indexes (in case CASCADE didn't catch them all)
    EXECUTE 'DROP INDEX IF EXISTS users_username_key';
    EXECUTE 'DROP INDEX IF EXISTS idx_users_username';
    EXECUTE 'DROP INDEX IF EXISTS idx_users_email';
    
    RAISE NOTICE 'Cleaned up any remaining users table indexes';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'No additional indexes to clean up';
END $$;

-- ============================================
-- STEP 5: UPDATE COMMENTS AND DOCUMENTATION
-- ============================================

COMMENT ON TABLE staff IS 'User management and staff information (replaces deprecated users table)';
COMMENT ON COLUMN staff.username IS 'Unique username for authentication (replaces users.username)';
COMMENT ON COLUMN staff.password IS 'Encrypted password for authentication (replaces users.password)';

-- ============================================
-- MIGRATION COMPLETION
-- ============================================

-- Log migration completion
INSERT INTO migration_log (migration_name, executed_at, success, notes)
VALUES ('003_remove_orphaned_users_table', NOW(), true, 
        'Successfully removed orphaned users table - functionality consolidated into staff table');

COMMIT;

-- ============================================
-- POST-MIGRATION VERIFICATION
-- ============================================

-- Verify users table is gone
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Users table still exists after migration - check for errors';
    ELSE
        RAISE NOTICE '✅ Orphaned users table successfully removed';
    END IF;
END $$;

-- Show current table list for verification
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;