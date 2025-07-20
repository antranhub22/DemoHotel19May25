-- Migration: Fix Production Database - Add Missing Staff Columns
-- Date: 2025-01-20  
-- Description: Add missing first_name, last_name and other columns to staff table for production compatibility

-- Add missing columns to staff table
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS permissions TEXT DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Update existing staff records to have proper values
UPDATE staff 
SET 
  first_name = COALESCE(first_name, SPLIT_PART(username, '.', 1)),
  last_name = COALESCE(last_name, SPLIT_PART(username, '.', 2)),
  display_name = COALESCE(display_name, username),
  permissions = COALESCE(permissions, '[]'),
  is_active = COALESCE(is_active, true)
WHERE first_name IS NULL OR last_name IS NULL OR display_name IS NULL;

-- Add missing columns to other tables if needed
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS hotel_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS max_voices INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS max_languages INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS voice_cloning BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS multi_location BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS white_label BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_retention_days INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS monthly_call_limit INTEGER DEFAULT 1000;

-- Update hotel_name from existing name column if available
UPDATE tenants 
SET hotel_name = COALESCE(hotel_name, name)
WHERE hotel_name IS NULL AND name IS NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_tenant_id ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

-- Add comments for documentation
COMMENT ON COLUMN staff.first_name IS 'User first name for display purposes';
COMMENT ON COLUMN staff.last_name IS 'User last name for display purposes';
COMMENT ON COLUMN staff.display_name IS 'Full display name (fallback to username)';
COMMENT ON COLUMN staff.permissions IS 'JSON array of user permissions';
COMMENT ON COLUMN staff.is_active IS 'Whether user account is active';
COMMENT ON COLUMN staff.last_login IS 'Timestamp of last successful login';

-- Log completion
INSERT INTO migration_log (migration_name, executed_at) 
VALUES ('0007_fix_production_staff_columns', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING; 