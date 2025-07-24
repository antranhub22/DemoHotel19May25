# 🚨 Hướng dẫn sửa lỗi Environment Configuration

## 🔍 Vấn đề phát hiện:

Từ logs và phân tích, có 3 vấn đề chính:

1. **API Keys giả**: Tất cả API keys trong `.env` đều là placeholder values
2. **Vapi keys thiếu**: Không có VAPI_API_KEY cho dynamic assistant creation
3. **401 Authentication errors**: Do các API keys không hợp lệ

## ✅ Giải pháp:

### 1. Cập nhật file `.env` (QUAN TRỌNG)

Mở file `.env` và thay thế các dòng sau:

```bash
# ❌ HIỆN TẠI (placeholder - không hoạt động):
VITE_OPENAI_API_KEY=sk-development-key-replace-with-real-key
VITE_VAPI_PUBLIC_KEY=pk_development-vapi-public-key
VITE_VAPI_ASSISTANT_ID=asst_development-assistant-id

# ✅ SỬA THÀNH (với keys thật):
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
VITE_VAPI_PUBLIC_KEY=pk_your-actual-vapi-public-key-here
VITE_VAPI_ASSISTANT_ID=asst_your-actual-assistant-id-here

# ✅ THÊM DÒNG MỚI (cho dynamic assistant creation):
VAPI_API_KEY=your-actual-vapi-api-key-here
```

### 2. Cách lấy API Keys:

#### 🤖 OpenAI API Key:

1. Truy cập: https://platform.openai.com/
2. Đăng ký tài khoản và thêm payment method
3. Vào API Keys section, tạo key mới
4. Copy key (bắt đầu với `sk-`) vào `VITE_OPENAI_API_KEY`

#### 🎙️ Vapi API Keys:

1. Truy cập: https://vapi.ai/
2. Đăng ký tài khoản và subscribe plan
3. Vào Dashboard:
   - Copy **Public Key** (bắt đầu với `pk_`) → `VITE_VAPI_PUBLIC_KEY`
   - Copy **Assistant ID** (bắt đầu với `asst_`) → `VITE_VAPI_ASSISTANT_ID`
   - Copy **API Key** → `VAPI_API_KEY`

#### 🗺️ Google Places API Key (Tùy chọn):

1. Truy cập: https://console.cloud.google.com/
2. Tạo project, enable Google Places API
3. Tạo credentials, copy API key → `GOOGLE_PLACES_API_KEY`

### 3. Kiểm tra sau khi sửa:

```bash
# Restart development server
npm run dev
```

Kiểm tra logs để đảm bảo:

- ✅ Không còn "Vapi API key not found"
- ✅ Không còn 401 errors trên frontend
- ✅ Database connection thành công

### 4. Test cơ bản:

1. Mở http://localhost:5173
2. Thử login với: `admin` / `admin123`
3. Kiểm tra voice assistant hoạt động
4. Kiểm tra staff dashboard accessible

## 🔧 Alternative: Test với Mock Data

Nếu chưa có API keys ngay, có thể tạm thời comment out các features cần API:

```bash
# Tạm thời disable voice assistant
ENABLE_VOICE_ASSISTANT=false
ENABLE_MULTI_LANGUAGE=false
```

Điều này sẽ cho phép test các features khác (staff dashboard, analytics) mà không cần API keys.

## 📋 Status Check Script

Sau khi sửa, chạy command này để kiểm tra:

```bash
# Kiểm tra environment variables
node -e "
console.log('🔍 Environment Check:');
console.log('OpenAI:', process.env.VITE_OPENAI_API_KEY?.startsWith('sk-') ? '✅ Valid format' : '❌ Invalid/missing');
console.log('Vapi Public:', process.env.VITE_VAPI_PUBLIC_KEY?.startsWith('pk_') ? '✅ Valid format' : '❌ Invalid/missing');
console.log('Vapi Assistant:', process.env.VITE_VAPI_ASSISTANT_ID?.startsWith('asst_') ? '✅ Valid format' : '❌ Invalid/missing');
console.log('Database:', process.env.DATABASE_URL || '❌ Missing');
"
```
