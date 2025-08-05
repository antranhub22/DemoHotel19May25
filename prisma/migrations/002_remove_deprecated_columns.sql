-- ============================================
-- SCHEMA CLEANUP MIGRATION - Remove Deprecated Columns
-- ============================================
-- 
-- This migration removes deprecated columns from hotel_profiles table
-- These columns have been moved to tenants table or are no longer used
-- 
-- Created: 2025-01-20
-- Version: 1.0.0
-- Author: Schema Cleanup Process

BEGIN;

-- ============================================
-- STEP 1: BACKUP DATA (SAFETY)
-- ============================================

-- Create temporary backup table for recovery if needed
CREATE TABLE IF NOT EXISTS hotel_profiles_backup_20250120 AS 
SELECT * FROM hotel_profiles;

-- Log backup creation
INSERT INTO migration_log (migration_name, notes)
VALUES ('002_remove_deprecated_columns_backup', 'Created backup table hotel_profiles_backup_20250120');

-- ============================================
-- STEP 2: REMOVE DEPRECATED COLUMNS
-- ============================================

-- Remove deprecated hotel information columns (moved to tenants table)
DO $$ 
BEGIN
    -- Remove hotel_name (moved to tenants.hotel_name)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='hotel_profiles' AND column_name='hotel_name') THEN
        ALTER TABLE hotel_profiles DROP COLUMN hotel_name;
        RAISE NOTICE 'Removed deprecated column: hotel_name';
    END IF;

    -- Remove description (no longer used)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='hotel_profiles' AND column_name='description') THEN
        ALTER TABLE hotel_profiles DROP COLUMN description;
        RAISE NOTICE 'Removed deprecated column: description';
    END IF;

    -- Remove address (no longer used)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='hotel_profiles' AND column_name='address') THEN
        ALTER TABLE hotel_profiles DROP COLUMN address;
        RAISE NOTICE 'Removed deprecated column: address';
    END IF;

    -- Remove phone (no longer used)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='hotel_profiles' AND column_name='phone') THEN
        ALTER TABLE hotel_profiles DROP COLUMN phone;
        RAISE NOTICE 'Removed deprecated column: phone';
    END IF;

    -- Remove email (no longer used)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='hotel_profiles' AND column_name='email') THEN
        ALTER TABLE hotel_profiles DROP COLUMN email;
        RAISE NOTICE 'Removed deprecated column: email';
    END IF;

    -- Remove website (no longer used)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='hotel_profiles' AND column_name='website') THEN
        ALTER TABLE hotel_profiles DROP COLUMN website;
        RAISE NOTICE 'Removed deprecated column: website';
    END IF;

    -- Remove amenities (no longer used)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='hotel_profiles' AND column_name='amenities') THEN
        ALTER TABLE hotel_profiles DROP COLUMN amenities;
        RAISE NOTICE 'Removed deprecated column: amenities';
    END IF;

    -- Remove policies (no longer used)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='hotel_profiles' AND column_name='policies') THEN
        ALTER TABLE hotel_profiles DROP COLUMN policies;
        RAISE NOTICE 'Removed deprecated column: policies';
    END IF;
END $$;

-- ============================================
-- STEP 3: VERIFY REMAINING COLUMNS
-- ============================================

-- Log remaining columns for verification
DO $$
DECLARE
    remaining_columns TEXT;
BEGIN
    SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
    INTO remaining_columns
    FROM information_schema.columns 
    WHERE table_name = 'hotel_profiles';
    
    RAISE NOTICE 'Remaining hotel_profiles columns: %', remaining_columns;
    
    INSERT INTO migration_log (migration_name, notes)
    VALUES ('002_remove_deprecated_columns_verify', 
            'Remaining columns: ' || remaining_columns);
END $$;

-- ============================================
-- STEP 4: UPDATE COMMENTS
-- ============================================

COMMENT ON TABLE hotel_profiles IS 'Hotel AI assistant configuration and knowledge base (cleaned up)';
COMMENT ON COLUMN hotel_profiles.research_data IS 'Auto-generated hotel research data from Google Places API';
COMMENT ON COLUMN hotel_profiles.assistant_config IS 'Vapi assistant configuration JSON';
COMMENT ON COLUMN hotel_profiles.vapi_assistant_id IS 'Vapi assistant ID for voice calls';
COMMENT ON COLUMN hotel_profiles.services_config IS 'Hotel services configuration JSON';
COMMENT ON COLUMN hotel_profiles.knowledge_base IS 'Generated knowledge base for AI assistant';
COMMENT ON COLUMN hotel_profiles.system_prompt IS 'AI assistant system prompt template';

-- ============================================
-- STEP 5: ANALYZE TABLE FOR PERFORMANCE
-- ============================================

ANALYZE hotel_profiles;

-- ============================================
-- MIGRATION COMPLETION
-- ============================================

-- Log migration completion
INSERT INTO migration_log (migration_name, executed_at, success, notes)
VALUES ('002_remove_deprecated_columns', NOW(), true, 'Successfully removed 8 deprecated columns from hotel_profiles');

COMMIT;

-- ============================================
-- POST-MIGRATION VERIFICATION
-- ============================================

-- Display final table structure
\d hotel_profiles;

-- Show backup table for safety
SELECT 'Backup table created: hotel_profiles_backup_20250120' AS safety_note;