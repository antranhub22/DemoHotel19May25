-- Migration: Add missing columns to request table for PostgreSQL
-- Date: 2025-01-20
-- Description: Add call_id, tenant_id and other missing columns to existing request table

-- Add missing columns to request table
ALTER TABLE request 
ADD COLUMN IF NOT EXISTS call_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS metadata TEXT,
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'order',
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS items TEXT,
ADD COLUMN IF NOT EXISTS delivery_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS special_instructions TEXT,
ADD COLUMN IF NOT EXISTS order_type VARCHAR(100);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_request_call_id ON request(call_id);
CREATE INDEX IF NOT EXISTS idx_request_tenant_id ON request(tenant_id);
CREATE INDEX IF NOT EXISTS idx_request_status ON request(status);
CREATE INDEX IF NOT EXISTS idx_request_type ON request(type);

-- Add foreign key constraint for tenant_id (if tenants table exists)
-- ALTER TABLE request ADD CONSTRAINT fk_request_tenant_id 
-- FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;

COMMENT ON COLUMN request.call_id IS 'Reference to call that generated this request';
COMMENT ON COLUMN request.tenant_id IS 'Multi-tenant isolation - hotel/client identifier';
COMMENT ON COLUMN request.priority IS 'Request priority: low, medium, high, urgent';
COMMENT ON COLUMN request.type IS 'Request type: order, service, maintenance, complaint'; 