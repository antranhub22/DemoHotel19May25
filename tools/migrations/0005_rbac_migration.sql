-- ===============================================
-- RBAC Migration for Unified Dashboard
-- Migration: 0005_rbac_migration.sql
-- Purpose: Add RBAC support to staff table and migrate roles
-- ===============================================

-- Step 1: Add permissions column to staff table
ALTER TABLE staff ADD COLUMN IF NOT EXISTS permissions TEXT DEFAULT '[]';

-- Step 2: Add display name fields for better UX
ALTER TABLE staff ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Step 3: Add last_login tracking
ALTER TABLE staff ADD COLUMN IF NOT EXISTS last_login TEXT;

-- Step 4: Create role migration mapping
-- Update existing roles to RBAC roles
UPDATE staff 
SET role = CASE 
  WHEN role IN ('admin', 'manager') THEN 'hotel-manager'
  WHEN role = 'staff' THEN 'front-desk'
  WHEN role IN ('it', 'tech') THEN 'it-manager'
  ELSE 'front-desk'
END;

-- Step 5: Set default permissions for existing users based on new roles
UPDATE staff 
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
WHERE permissions IS NULL OR permissions = '[]';

-- Step 6: Set display names based on existing data
UPDATE staff 
SET display_name = COALESCE(
  NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), ''),
  username
)
WHERE display_name IS NULL;

-- Step 7: Ensure tenant_id is set for existing staff (assume mi-nhon-hotel for existing data)
UPDATE staff 
SET tenant_id = 'mi-nhon-hotel' 
WHERE tenant_id IS NULL OR tenant_id = '';

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_tenant_id ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);

-- Step 9: Insert sample users for each role if they don't exist
INSERT OR IGNORE INTO staff (
  id, username, password, role, display_name, email, 
  tenant_id, is_active, permissions, created_at
) VALUES 
-- Hotel Manager
('staff-manager-1', 'manager', '$2b$10$8K8XuZ5Zz5ZZzZzZzZzZzO8K8XuZ5Zz5ZZzZzZzZz', 'hotel-manager', 'Hotel Manager', 'manager@minhonhotel.com', 'mi-nhon-hotel', 1, '[
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

-- Front Desk Staff
('staff-frontdesk-1', 'frontdesk', '$2b$10$8K8XuZ5Zz5ZZzZzZzZzZzO8K8XuZ5Zz5ZZzZzZzZz', 'front-desk', 'Front Desk Staff', 'frontdesk@minhonhotel.com', 'mi-nhon-hotel', 1, '[
  {"module":"dashboard","action":"view","allowed":true},
  {"module":"calls","action":"view","allowed":true},
  {"module":"calls","action":"join","allowed":true},
  {"module":"calls","action":"transfer","allowed":true},
  {"module":"analytics","action":"view_basic","allowed":true},
  {"module":"guests","action":"view","allowed":true},
  {"module":"guests","action":"edit","allowed":true}
]', CURRENT_TIMESTAMP),

-- IT Manager
('staff-it-1', 'itmanager', '$2b$10$8K8XuZ5Zz5ZZzZzZzZzZzO8K8XuZ5Zz5ZZzZzZzZz', 'it-manager', 'IT Manager', 'it@minhonhotel.com', 'mi-nhon-hotel', 1, '[
  {"module":"dashboard","action":"view","allowed":true},
  {"module":"system","action":"view","allowed":true},
  {"module":"system","action":"edit","allowed":true},
  {"module":"system","action":"debug","allowed":true},
  {"module":"integrations","action":"view","allowed":true},
  {"module":"integrations","action":"edit","allowed":true},
  {"module":"logs","action":"view","allowed":true},
  {"module":"analytics","action":"technical","allowed":true}
]', CURRENT_TIMESTAMP);

-- Step 10: Verification queries (commented out, for manual checking)
-- SELECT role, COUNT(*) as count FROM staff GROUP BY role;
-- SELECT username, role, display_name, JSON_ARRAY_LENGTH(permissions) as permission_count FROM staff;

-- ===============================================
-- Migration completed successfully
-- =============================================== 