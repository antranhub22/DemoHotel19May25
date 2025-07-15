-- ===============================================
-- RBAC Migration for Unified Dashboard (SQLite Compatible)
-- Migration: 0005_rbac_migration_fixed.sql
-- Purpose: Add RBAC support to staff table and migrate roles
-- ===============================================

-- First, let's check current staff table structure
-- SQLite doesn't support IF NOT EXISTS for ADD COLUMN, so we'll use a different approach

-- Step 1: Backup existing staff data
CREATE TABLE IF NOT EXISTS staff_backup AS SELECT * FROM staff;

-- Step 2: Drop and recreate staff table with new schema
DROP TABLE IF EXISTS staff_temp;
CREATE TABLE staff_temp (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id),
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'front-desk',
  permissions TEXT DEFAULT '[]',
  display_name TEXT,
  avatar_url TEXT,
  last_login TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Migrate data from old table to new table
INSERT INTO staff_temp (
  id, tenant_id, username, password, first_name, last_name, 
  email, phone, role, is_active, created_at, updated_at
)
SELECT 
  COALESCE(id, 'staff-' || rowid),
  COALESCE(tenant_id, 'mi-nhon-hotel'), 
  username, 
  password,
  COALESCE(first_name, ''),
  COALESCE(last_name, ''),
  email,
  phone,
  CASE 
    WHEN role IN ('admin', 'manager') THEN 'hotel-manager'
    WHEN role = 'staff' THEN 'front-desk'
    WHEN role IN ('it', 'tech') THEN 'it-manager'
    ELSE 'front-desk'
  END as role,
  COALESCE(is_active, 1),
  COALESCE(created_at, CURRENT_TIMESTAMP),
  COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM staff;

-- Step 4: Set permissions based on roles
UPDATE staff_temp 
SET permissions = CASE role
  WHEN 'hotel-manager' THEN '[
    {"module":"dashboard","action":"view","allowed":true},
    {"module":"dashboard","action":"edit","allowed":true},
    {"module":"analytics","action":"view","allowed":true},
    {"module":"analytics","action":"export","allowed":true},
    {"module":"analytics","action":"advanced","allowed":true},
    {"module":"billing","action":"view","allowed":true},
    {"module":"billing","action":"edit","allowed":true},
    {"module":"staff","action":"view","allowed":true},
    {"module":"staff","action":"edit","allowed":true},
    {"module":"staff","action":"delete","allowed":true},
    {"module":"staff","action":"invite","allowed":true},
    {"module":"settings","action":"view","allowed":true},
    {"module":"settings","action":"edit","allowed":true},
    {"module":"calls","action":"view","allowed":true},
    {"module":"calls","action":"join","allowed":true},
    {"module":"calls","action":"transfer","allowed":true},
    {"module":"calls","action":"end","allowed":true},
    {"module":"calls","action":"override","allowed":true},
    {"module":"system","action":"view","allowed":true}
  ]'
  WHEN 'front-desk' THEN '[
    {"module":"dashboard","action":"view","allowed":true},
    {"module":"calls","action":"view","allowed":true},
    {"module":"calls","action":"join","allowed":true},
    {"module":"calls","action":"transfer","allowed":true},
    {"module":"calls","action":"end","allowed":true},
    {"module":"analytics","action":"view_basic","allowed":true},
    {"module":"profile","action":"view","allowed":true},
    {"module":"profile","action":"edit","allowed":true},
    {"module":"guests","action":"view","allowed":true},
    {"module":"guests","action":"edit","allowed":true},
    {"module":"guests","action":"checkin","allowed":true},
    {"module":"guests","action":"checkout","allowed":true}
  ]'
  WHEN 'it-manager' THEN '[
    {"module":"dashboard","action":"view","allowed":true},
    {"module":"system","action":"view","allowed":true},
    {"module":"system","action":"edit","allowed":true},
    {"module":"system","action":"debug","allowed":true},
    {"module":"system","action":"restart","allowed":true},
    {"module":"integrations","action":"view","allowed":true},
    {"module":"integrations","action":"edit","allowed":true},
    {"module":"integrations","action":"test","allowed":true},
    {"module":"logs","action":"view","allowed":true},
    {"module":"logs","action":"export","allowed":true},
    {"module":"logs","action":"debug","allowed":true},
    {"module":"calls","action":"view","allowed":true},
    {"module":"calls","action":"debug","allowed":true},
    {"module":"analytics","action":"view","allowed":true},
    {"module":"analytics","action":"technical","allowed":true}
  ]'
  ELSE '[]'
END
WHERE permissions = '[]' OR permissions IS NULL;

-- Step 5: Set display names
UPDATE staff_temp 
SET display_name = COALESCE(
  NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), ''),
  username
)
WHERE display_name IS NULL OR display_name = '';

-- Step 6: Drop old table and rename new one
DROP TABLE staff;
ALTER TABLE staff_temp RENAME TO staff;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_tenant_id ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);

-- Step 8: Insert sample users for each role if they don't exist
INSERT OR IGNORE INTO staff (
  id, username, password, role, display_name, email, 
  tenant_id, is_active, permissions, created_at
) VALUES 
-- Hotel Manager (password: manager123)
('staff-manager-1', 'manager', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hotel-manager', 'Hotel Manager', 'manager@minhonhotel.com', 'mi-nhon-hotel', 1, '[
  {"module":"dashboard","action":"view","allowed":true},
  {"module":"dashboard","action":"edit","allowed":true},
  {"module":"analytics","action":"view","allowed":true},
  {"module":"analytics","action":"export","allowed":true},
  {"module":"billing","action":"view","allowed":true},
  {"module":"billing","action":"edit","allowed":true},
  {"module":"staff","action":"view","allowed":true},
  {"module":"staff","action":"edit","allowed":true},
  {"module":"settings","action":"view","allowed":true},
  {"module":"settings","action":"edit","allowed":true},
  {"module":"calls","action":"view","allowed":true},
  {"module":"calls","action":"override","allowed":true}
]', CURRENT_TIMESTAMP),

-- Front Desk Staff (password: frontdesk123)
('staff-frontdesk-1', 'frontdesk', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'front-desk', 'Front Desk Staff', 'frontdesk@minhonhotel.com', 'mi-nhon-hotel', 1, '[
  {"module":"dashboard","action":"view","allowed":true},
  {"module":"calls","action":"view","allowed":true},
  {"module":"calls","action":"join","allowed":true},
  {"module":"calls","action":"transfer","allowed":true},
  {"module":"analytics","action":"view_basic","allowed":true},
  {"module":"guests","action":"view","allowed":true},
  {"module":"guests","action":"edit","allowed":true}
]', CURRENT_TIMESTAMP),

-- IT Manager (password: itmanager123)
('staff-it-1', 'itmanager', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'it-manager', 'IT Manager', 'it@minhonhotel.com', 'mi-nhon-hotel', 1, '[
  {"module":"dashboard","action":"view","allowed":true},
  {"module":"system","action":"view","allowed":true},
  {"module":"system","action":"edit","allowed":true},
  {"module":"system","action":"debug","allowed":true},
  {"module":"integrations","action":"view","allowed":true},
  {"module":"integrations","action":"edit","allowed":true},
  {"module":"logs","action":"view","allowed":true},
  {"module":"analytics","action":"technical","allowed":true}
]', CURRENT_TIMESTAMP);

-- Step 9: Clean up backup table (optional)
-- DROP TABLE staff_backup;

-- ===============================================
-- Migration completed successfully
-- Show current staff table structure
-- ===============================================
.schema staff 