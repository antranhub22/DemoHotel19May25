-- ============================================
-- ADD MISSING SERVICE COLUMNS TO REQUEST TABLE
-- ============================================
-- Migration: 0011_add_missing_request_service_columns.sql
-- Description: Add missing service-related columns to request table
-- Date: 2025-07-29

-- Add missing service-related columns to request table
ALTER TABLE request 
ADD COLUMN IF NOT EXISTS service_id INTEGER REFERENCES services(id),
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS total_amount REAL,
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'VND',
ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMP,
ADD COLUMN IF NOT EXISTS actual_completion TIMESTAMP,
ADD COLUMN IF NOT EXISTS special_instructions VARCHAR(500),
ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS order_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS delivery_time VARCHAR(100),
ADD COLUMN IF NOT EXISTS items TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_request_service_id ON request(service_id);
CREATE INDEX IF NOT EXISTS idx_request_guest_name ON request(guest_name);
CREATE INDEX IF NOT EXISTS idx_request_phone_number ON request(phone_number);
CREATE INDEX IF NOT EXISTS idx_request_total_amount ON request(total_amount);
CREATE INDEX IF NOT EXISTS idx_request_urgency ON request(urgency);

-- Add composite indexes for better performance
CREATE INDEX IF NOT EXISTS idx_request_service_urgency ON request(service_id, urgency);
CREATE INDEX IF NOT EXISTS idx_request_guest_phone ON request(guest_name, phone_number);

-- Add comments for documentation
COMMENT ON COLUMN request.service_id IS 'Reference to service that was requested';
COMMENT ON COLUMN request.guest_name IS 'Name of the guest making the request';
COMMENT ON COLUMN request.phone_number IS 'Phone number of the guest';
COMMENT ON COLUMN request.total_amount IS 'Total amount for the request';
COMMENT ON COLUMN request.currency IS 'Currency for the amount (default: VND)';
COMMENT ON COLUMN request.estimated_completion IS 'Estimated completion time';
COMMENT ON COLUMN request.actual_completion IS 'Actual completion time';
COMMENT ON COLUMN request.special_instructions IS 'Special instructions for the request';
COMMENT ON COLUMN request.urgency IS 'Urgency level: low, normal, high, urgent';
COMMENT ON COLUMN request.order_type IS 'Type of order: room_service, housekeeping, etc.';
COMMENT ON COLUMN request.delivery_time IS 'Preferred delivery time';
COMMENT ON COLUMN request.items IS 'JSON array of ordered items'; 