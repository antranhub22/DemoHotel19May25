-- 1. Create hotel_profiles table
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

-- 2. Create index
CREATE INDEX IF NOT EXISTS idx_hotel_profiles_tenant_id ON hotel_profiles(tenant_id);

-- 3. Insert hotel profile for Mi Nhon Hotel
INSERT INTO hotel_profiles (
  id, 
  tenant_id,
  research_data,
  assistant_config,
  services_config,
  knowledge_base,
  system_prompt
) VALUES (
  'mi-nhon-hotel-profile',
  'mi-nhon-hotel',
  '{"location":"Mui Ne, Vietnam","type":"Beach Resort","rooms":50,"facilities":["Restaurant","Swimming Pool","Spa","Beach Access","Room Service"]}',
  '{"language":"vi","voice":"female","personality":"professional","greeting":"Xin chào, tôi là trợ lý ảo của khách sạn Mi Nhon. Tôi có thể giúp gì cho quý khách?"}',
  '{"enabled":["room_service","housekeeping","concierge","maintenance","spa"],"hours":{"room_service":"24/7","housekeeping":"07:00-22:00","concierge":"24/7","maintenance":"08:00-17:00","spa":"09:00-21:00"}}',
  'Mi Nhon Hotel là một khách sạn nghỉ dưỡng bên bờ biển Mũi Né, cách trung tâm Phan Thiết 15km. Khách sạn có 50 phòng với đầy đủ tiện nghi hiện đại, nhà hàng phục vụ ẩm thực Việt Nam và quốc tế, hồ bơi ngoài trời và spa.',
  'Bạn là trợ lý ảo của khách sạn Mi Nhon. Nhiệm vụ của bạn là hỗ trợ khách hàng 24/7 với mọi yêu cầu về dịch vụ phòng, dọn phòng, đặt tour du lịch và các dịch vụ khác của khách sạn. Hãy luôn thân thiện, chuyên nghiệp và sẵn sàng giúp đỡ.'
) ON CONFLICT (id) DO UPDATE SET
  research_data = EXCLUDED.research_data,
  assistant_config = EXCLUDED.assistant_config,
  services_config = EXCLUDED.services_config,
  knowledge_base = EXCLUDED.knowledge_base,
  system_prompt = EXCLUDED.system_prompt,
  updated_at = CURRENT_TIMESTAMP; 