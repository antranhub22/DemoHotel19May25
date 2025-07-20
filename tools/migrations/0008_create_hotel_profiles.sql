-- Migration: Create hotel_profiles table
-- Date: 2025-01-20
-- Description: Add hotel_profiles table for storing hotel-specific configuration and data

-- Create hotel_profiles table
CREATE TABLE IF NOT EXISTS hotel_profiles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  research_data TEXT,
  assistant_config TEXT,
  vapi_assistant_id TEXT,
  services_config TEXT,
  knowledge_base TEXT,
  system_prompt TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hotel_profiles_tenant_id ON hotel_profiles(tenant_id);

-- Add comments for better documentation
COMMENT ON TABLE hotel_profiles IS 'Stores hotel-specific configuration and data';
COMMENT ON COLUMN hotel_profiles.id IS 'Primary key - usually tenant_id + "-profile"';
COMMENT ON COLUMN hotel_profiles.tenant_id IS 'Reference to tenants table';
COMMENT ON COLUMN hotel_profiles.research_data IS 'JSON data about hotel research (location, type, facilities etc)';
COMMENT ON COLUMN hotel_profiles.assistant_config IS 'JSON configuration for voice assistant';
COMMENT ON COLUMN hotel_profiles.vapi_assistant_id IS 'Vapi.ai assistant ID for this hotel';
COMMENT ON COLUMN hotel_profiles.services_config IS 'JSON configuration for hotel services';
COMMENT ON COLUMN hotel_profiles.knowledge_base IS 'Hotel knowledge base for AI assistant';
COMMENT ON COLUMN hotel_profiles.system_prompt IS 'System prompt for AI assistant'; 