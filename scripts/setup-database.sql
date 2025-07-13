-- ===============================================
-- Database Setup Script for Mi Nhon Hotel
-- ===============================================

-- Step 1: Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    hotel_name TEXT NOT NULL,
    domain TEXT,
    subdomain TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    subscription_plan TEXT DEFAULT 'trial',
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create hotel_profiles table
CREATE TABLE IF NOT EXISTS hotel_profiles (
    id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
    hotel_name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    amenities TEXT[],
    policies TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create basic tables if they don't exist
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'staff',
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transcript (
    id SERIAL PRIMARY KEY,
    call_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    role VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS request (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10),
    order_id VARCHAR(100),
    request_content TEXT,
    status VARCHAR(100) DEFAULT 'Đã ghi nhận',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS message (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES request(id),
    sender VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS call (
    id SERIAL PRIMARY KEY,
    call_id_vapi VARCHAR(100) NOT NULL UNIQUE,
    room_number VARCHAR(10),
    language VARCHAR(10),
    service_type VARCHAR(50),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Add tenant_id columns to existing tables
ALTER TABLE staff ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE transcript ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE request ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE message ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE call ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 5: Insert Mi Nhon tenant
INSERT INTO tenants (id, hotel_name, domain, subdomain, email, phone, address, subscription_plan, subscription_status)
VALUES ('mi-nhon-hotel', 'Mi Nhon Hotel', 'minhonmuine.talk2go.online', 'minhonmuine', 
        'info@minhonhotel.com', '+84 252 3847 007', 
        '97 Nguyen Dinh Chieu, Ham Tien, Mui Ne, Phan Thiet, Vietnam', 
        'premium', 'active')
ON CONFLICT (id) DO UPDATE SET
    hotel_name = EXCLUDED.hotel_name,
    domain = EXCLUDED.domain,
    subdomain = EXCLUDED.subdomain,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    subscription_plan = EXCLUDED.subscription_plan,
    subscription_status = EXCLUDED.subscription_status,
    updated_at = CURRENT_TIMESTAMP;

-- Step 6: Insert hotel profile
INSERT INTO hotel_profiles (id, tenant_id, hotel_name, description, address, phone, email, website, amenities, policies)
VALUES ('mi-nhon-hotel-profile', 'mi-nhon-hotel', 'Mi Nhon Hotel', 
        'A beautiful beachfront hotel in Mui Ne, Vietnam',
        '97 Nguyen Dinh Chieu, Ham Tien, Mui Ne, Phan Thiet, Vietnam',
        '+84 252 3847 007', 'info@minhonhotel.com', 'https://minhonhotel.com',
        ARRAY['Pool', 'Restaurant', 'Free WiFi', 'Beach Access', 'Spa'],
        ARRAY['Check-in: 2:00 PM', 'Check-out: 12:00 PM', 'No smoking'])
ON CONFLICT (id) DO UPDATE SET
    hotel_name = EXCLUDED.hotel_name,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    amenities = EXCLUDED.amenities,
    policies = EXCLUDED.policies,
    updated_at = CURRENT_TIMESTAMP;

-- Step 7: Insert default staff accounts
INSERT INTO staff (id, username, password, role, name, email, tenant_id)
VALUES (1, 'admin@hotel.com', 'StrongPassword123', 'admin', 'Administrator', 'admin@hotel.com', 'mi-nhon-hotel')
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    tenant_id = EXCLUDED.tenant_id,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO staff (id, username, password, role, name, email, tenant_id)
VALUES (2, 'manager@hotel.com', 'StrongPassword456', 'manager', 'Hotel Manager', 'manager@hotel.com', 'mi-nhon-hotel')
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    tenant_id = EXCLUDED.tenant_id,
    updated_at = CURRENT_TIMESTAMP;

-- Step 8: Update existing records to associate with Mi Nhon tenant
UPDATE staff SET tenant_id = 'mi-nhon-hotel' WHERE tenant_id IS NULL;
UPDATE transcript SET tenant_id = 'mi-nhon-hotel' WHERE tenant_id IS NULL;
UPDATE request SET tenant_id = 'mi-nhon-hotel' WHERE tenant_id IS NULL;
UPDATE message SET tenant_id = 'mi-nhon-hotel' WHERE tenant_id IS NULL;
UPDATE call SET tenant_id = 'mi-nhon-hotel' WHERE tenant_id IS NULL;

-- Step 9: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_tenant_id ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transcript_tenant_id ON transcript(tenant_id);
CREATE INDEX IF NOT EXISTS idx_request_tenant_id ON request(tenant_id);
CREATE INDEX IF NOT EXISTS idx_message_tenant_id ON message(tenant_id);
CREATE INDEX IF NOT EXISTS idx_call_tenant_id ON call(tenant_id);

-- Completed database setup
SELECT 'Database setup completed successfully!' as result; 