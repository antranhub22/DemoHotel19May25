-- Migration: Create call table
-- Date: 2025-08-02
-- Description: Create call table to store detailed call information from Vapi.ai

CREATE TABLE IF NOT EXISTS call (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id),
  call_id_vapi TEXT NOT NULL UNIQUE,
  room_number VARCHAR(10),
  language VARCHAR(10),
  service_type VARCHAR(50),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS call_tenant_id_idx ON call(tenant_id);
CREATE INDEX IF NOT EXISTS call_vapi_call_id_idx ON call(call_id_vapi);
CREATE INDEX IF NOT EXISTS call_language_idx ON call(language);
CREATE INDEX IF NOT EXISTS call_service_type_idx ON call(service_type);
CREATE INDEX IF NOT EXISTS call_room_number_idx ON call(room_number);
CREATE INDEX IF NOT EXISTS call_created_at_idx ON call(created_at);
CREATE INDEX IF NOT EXISTS call_start_time_idx ON call(start_time);

-- Composite indexes for analytics queries
CREATE INDEX IF NOT EXISTS call_tenant_language_idx ON call(tenant_id, language);
CREATE INDEX IF NOT EXISTS call_tenant_service_idx ON call(tenant_id, service_type);
CREATE INDEX IF NOT EXISTS call_tenant_created_idx ON call(tenant_id, created_at);

-- Add comment for documentation
COMMENT ON TABLE call IS 'Stores detailed call information from Vapi.ai including timing, language, service type';
COMMENT ON COLUMN call.call_id_vapi IS 'Unique call ID from Vapi.ai';
COMMENT ON COLUMN call.duration IS 'Call duration in seconds'; 