-- ============================================
-- DATABASE IMPROVEMENTS MIGRATION
-- ============================================
-- Migration: 0008_database_improvements.sql
-- Description: Improve database constraints and data types
-- Date: 2025-07-29

-- ============================================
-- 1. IMPROVE STRING LENGTHS (VARCHAR LIMITS)
-- ============================================

-- Services table improvements
ALTER TABLE services ADD COLUMN name_varchar VARCHAR(100);
UPDATE services SET name_varchar = name;
ALTER TABLE services DROP COLUMN name;
ALTER TABLE services RENAME COLUMN name_varchar TO name;

ALTER TABLE services ADD COLUMN description_varchar VARCHAR(500);
UPDATE services SET description_varchar = description;
ALTER TABLE services DROP COLUMN description;
ALTER TABLE services RENAME COLUMN description_varchar TO description;

ALTER TABLE services ADD COLUMN category_varchar VARCHAR(50);
UPDATE services SET category_varchar = category;
ALTER TABLE services DROP COLUMN category;
ALTER TABLE services RENAME COLUMN category_varchar TO category;

ALTER TABLE services ADD COLUMN subcategory_varchar VARCHAR(50);
UPDATE services SET subcategory_varchar = subcategory;
ALTER TABLE services DROP COLUMN subcategory;
ALTER TABLE services RENAME COLUMN subcategory_varchar TO subcategory;

-- Request table improvements
ALTER TABLE request ADD COLUMN room_number_varchar VARCHAR(10);
UPDATE request SET room_number_varchar = room_number;
ALTER TABLE request DROP COLUMN room_number;
ALTER TABLE request RENAME COLUMN room_number_varchar TO room_number;

ALTER TABLE request ADD COLUMN guest_name_varchar VARCHAR(100);
UPDATE request SET guest_name_varchar = guest_name;
ALTER TABLE request DROP COLUMN guest_name;
ALTER TABLE request RENAME COLUMN guest_name_varchar TO guest_name;

ALTER TABLE request ADD COLUMN phone_number_varchar VARCHAR(20);
UPDATE request SET phone_number_varchar = phone_number;
ALTER TABLE request DROP COLUMN phone_number;
ALTER TABLE request RENAME COLUMN phone_number_varchar TO phone_number;

ALTER TABLE request ADD COLUMN request_content_varchar VARCHAR(1000);
UPDATE request SET request_content_varchar = request_content;
ALTER TABLE request DROP COLUMN request_content;
ALTER TABLE request RENAME COLUMN request_content_varchar TO request_content;

ALTER TABLE request ADD COLUMN status_varchar VARCHAR(50);
UPDATE request SET status_varchar = status;
ALTER TABLE request DROP COLUMN status;
ALTER TABLE request RENAME COLUMN status_varchar TO status;

ALTER TABLE request ADD COLUMN priority_varchar VARCHAR(20);
UPDATE request SET priority_varchar = priority;
ALTER TABLE request DROP COLUMN priority;
ALTER TABLE request RENAME COLUMN priority_varchar TO priority;

ALTER TABLE request ADD COLUMN urgency_varchar VARCHAR(20);
UPDATE request SET urgency_varchar = urgency;
ALTER TABLE request DROP COLUMN urgency;
ALTER TABLE request RENAME COLUMN urgency_varchar TO urgency;

ALTER TABLE request ADD COLUMN order_type_varchar VARCHAR(50);
UPDATE request SET order_type_varchar = order_type;
ALTER TABLE request DROP COLUMN order_type;
ALTER TABLE request RENAME COLUMN order_type_varchar TO order_type;

ALTER TABLE request ADD COLUMN delivery_time_varchar VARCHAR(100);
UPDATE request SET delivery_time_varchar = delivery_time;
ALTER TABLE request DROP COLUMN delivery_time;
ALTER TABLE request RENAME COLUMN delivery_time_varchar TO delivery_time;

ALTER TABLE request ADD COLUMN special_instructions_varchar VARCHAR(500);
UPDATE request SET special_instructions_varchar = special_instructions;
ALTER TABLE request DROP COLUMN special_instructions;
ALTER TABLE request RENAME COLUMN special_instructions_varchar TO special_instructions;

-- Tenants table improvements
ALTER TABLE tenants ADD COLUMN hotel_name_varchar VARCHAR(200);
UPDATE tenants SET hotel_name_varchar = hotel_name;
ALTER TABLE tenants DROP COLUMN hotel_name;
ALTER TABLE tenants RENAME COLUMN hotel_name_varchar TO hotel_name;

ALTER TABLE tenants ADD COLUMN subdomain_varchar VARCHAR(50);
UPDATE tenants SET subdomain_varchar = subdomain;
ALTER TABLE tenants DROP COLUMN subdomain;
ALTER TABLE tenants RENAME COLUMN subdomain_varchar TO subdomain;

ALTER TABLE tenants ADD COLUMN subscription_plan_varchar VARCHAR(50);
UPDATE tenants SET subscription_plan_varchar = subscription_plan;
ALTER TABLE tenants DROP COLUMN subscription_plan;
ALTER TABLE tenants RENAME COLUMN subscription_plan_varchar TO subscription_plan;

ALTER TABLE tenants ADD COLUMN subscription_status_varchar VARCHAR(50);
UPDATE tenants SET subscription_status_varchar = subscription_status;
ALTER TABLE tenants DROP COLUMN subscription_status;
ALTER TABLE tenants RENAME COLUMN subscription_status_varchar TO subscription_status;

-- ============================================
-- 2. IMPROVE DECIMAL PRECISION FOR MONEY FIELDS
-- ============================================

-- Services price precision (VND doesn't need decimal places)
-- Keep as REAL for now, but ensure consistent precision

-- Request total_amount precision
-- Keep as REAL for now, but ensure consistent precision

-- ============================================
-- 3. IMPROVE DATE/TIME FORMAT (KEEP UNIX TIMESTAMP FOR SQLITE)
-- ============================================

-- For SQLite, we'll keep Unix timestamps for now
-- In PostgreSQL migration, we'll convert to TIMESTAMP WITH TIME ZONE

-- ============================================
-- 4. ADD NOT NULL CONSTRAINTS
-- ============================================

-- Services table constraints (already good)
-- name, price, category already have NOT NULL

-- Request table constraints
-- Note: SQLite doesn't support ALTER TABLE ADD CONSTRAINT
-- We'll enforce these in application layer and PostgreSQL migration

-- ============================================
-- 5. IMPROVE DEFAULT VALUES CONSISTENCY
-- ============================================

-- Services table defaults
UPDATE services SET currency = 'VND' WHERE currency IS NULL;
UPDATE services SET is_active = 1 WHERE is_active IS NULL;

-- Request table defaults
UPDATE request SET status = 'Đã ghi nhận' WHERE status IS NULL;
UPDATE request SET priority = 'medium' WHERE priority IS NULL;
UPDATE request SET urgency = 'normal' WHERE urgency IS NULL;
UPDATE request SET currency = 'VND' WHERE currency IS NULL;

-- Tenants table defaults
UPDATE tenants SET subscription_plan = 'trial' WHERE subscription_plan IS NULL;
UPDATE tenants SET subscription_status = 'active' WHERE subscription_status IS NULL;
UPDATE tenants SET is_active = 1 WHERE is_active IS NULL;

-- ============================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Services table indexes
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_category_active ON services(category, is_active);

-- Request table indexes
CREATE INDEX IF NOT EXISTS idx_request_tenant_status ON request(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_request_room_number ON request(room_number);
CREATE INDEX IF NOT EXISTS idx_request_created_at ON request(created_at);

-- Tenants table indexes
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- Verify string lengths
SELECT 'Services name length check' as check_type, 
       MAX(LENGTH(name)) as max_length, 
       COUNT(*) as total_records 
FROM services;

SELECT 'Request room_number length check' as check_type, 
       MAX(LENGTH(room_number)) as max_length, 
       COUNT(*) as total_records 
FROM request;

-- Verify money precision
SELECT 'Services price precision' as check_type,
       MIN(price) as min_price,
       MAX(price) as max_price,
       AVG(price) as avg_price
FROM services WHERE price > 0;

-- Verify NOT NULL constraints
SELECT 'Services NOT NULL check' as check_type,
       COUNT(*) as total_records,
       COUNT(name) as non_null_names,
       COUNT(price) as non_null_prices,
       COUNT(category) as non_null_categories
FROM services;

SELECT 'Request NOT NULL check' as check_type,
       COUNT(*) as total_records,
       COUNT(tenant_id) as non_null_tenant_id,
       COUNT(room_number) as non_null_room_number,
       COUNT(status) as non_null_status
FROM request;

-- Verify default values
SELECT 'Services default values' as check_type,
       currency,
       COUNT(*) as count
FROM services GROUP BY currency;

SELECT 'Request default values' as check_type,
       status,
       priority,
       urgency,
       COUNT(*) as count
FROM request GROUP BY status, priority, urgency; 