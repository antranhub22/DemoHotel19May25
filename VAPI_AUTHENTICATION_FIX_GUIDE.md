# 🔧 VAPI Authentication Fix Guide

## Tổng quan vấn đề

Lỗi "Invalid authentication token" với mã "TOKEN_MISSING" thường xảy ra do:

1. **Environment variables chưa được cấu hình đúng**
2. **VAPI credentials không hợp lệ hoặc đã hết hạn**
3. **Format credentials không đúng**
4. **VAPI SDK không được khởi tạo đúng cách**

## 🚀 Giải pháp nhanh

### Bước 1: Chạy debug tool

```bash
# Chạy từ root directory của project
node tools/scripts/debug-vapi-credentials.cjs
```

### Bước 2: Kiểm tra environment variables trên Render

1. Đăng nhập vào **Render Dashboard**
2. Chọn service của bạn
3. Vào tab **Environment**
4. Kiểm tra các biến sau:

```env
VITE_VAPI_PUBLIC_KEY=pk_your_real_public_key_here
VITE_VAPI_ASSISTANT_ID=asst_your_real_assistant_id_here
VAPI_API_KEY=your_server_api_key_here
```

### Bước 3: Lấy credentials từ VAPI Console

1. Truy cập [https://console.vapi.ai/](https://console.vapi.ai/)
2. Đăng nhập vào tài khoản của bạn
3. **Lấy Public Key:**
   - Vào tab "API Keys"
   - Copy "Public Key" (bắt đầu với `pk_`)
4. **Lấy Assistant ID:**
   - Vào tab "Assistants"
   - Chọn assistant muốn sử dụng
   - Copy "Assistant ID" (bắt đầu với `asst_`)
5. **Lấy Server API Key:**
   - Vào tab "API Keys"
   - Copy "Private Key" cho server-side calls

## 🔍 Kiểm tra chi tiết

### Format credentials đúng:

- **Public Key:** `pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Assistant ID:** `asst_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **API Key:** Không có format cố định nhưng thường dài > 20 ký tự

### Kiểm tra trong code:

1. **Mở Developer Tools** (F12)
2. **Console tab**
3. Chạy lệnh:

```javascript
// Kiểm tra environment variables
console.log('Public Key:', import.meta.env.VITE_VAPI_PUBLIC_KEY?.substring(0, 15) + '...');
console.log('Assistant ID:', import.meta.env.VITE_VAPI_ASSISTANT_ID?.substring(0, 15) + '...');

// Test VAPI credentials validation
vapiDebugFix.setLevel("verbose");
vapiDebugFix.help();
```

## 🛠️ Cách sửa lỗi

### Tình huống 1: Environment variables missing

**Triệu chứng:** Debug tool báo "MISSING" cho các biến môi trường

**Giải pháp:**
1. Cập nhật environment variables trên Render
2. Deploy lại service
3. Kiểm tra lại

### Tình huống 2: Invalid format

**Triệu chứng:** Credentials không bắt đầu với `pk_` hoặc `asst_`

**Giải pháp:**
1. Lấy lại credentials từ VAPI console
2. Kiểm tra copy/paste đầy đủ
3. Cập nhật trên Render

### Tình huống 3: Credentials hết hạn

**Triệu chứng:** Format đúng nhưng vẫn lỗi authentication

**Giải pháp:**
1. Tạo mới API keys trên VAPI console
2. Cập nhật tất cả environment variables
3. Deploy lại

### Tình huống 4: Network/Connection issues

**Triệu chứng:** Lỗi network hoặc timeout

**Giải pháp:**
1. Kiểm tra kết nối internet
2. Kiểm tra firewall/proxy settings
3. Thử lại sau một lúc

## 🧪 Test VAPI Connection

### Sử dụng VapiTestComponent

Thêm component test vào giao diện:

```typescript
import { VapiTestComponent } from '@/components/VapiTestComponent';

// Trong component của bạn
<VapiTestComponent />
```

### Test trong Console

```javascript
// Import enhanced VAPI client
import { initVapiFix, startCallFix, validateVapiCredentials } from '@/lib/vapiClientFix';

// Test credentials
const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;

const validation = validateVapiCredentials(publicKey);
console.log('Validation result:', validation);

// Test initialization
try {
  const vapi = await initVapiFix(publicKey);
  console.log('VAPI initialized successfully:', vapi);
} catch (error) {
  console.error('VAPI initialization failed:', error);
}
```

## 📋 Checklist xử lý

- [ ] Chạy debug tool để xác định vấn đề
- [ ] Kiểm tra format credentials
- [ ] Verify credentials trên VAPI console
- [ ] Cập nhật environment variables trên Render
- [ ] Deploy lại service
- [ ] Test VAPI connection với VapiTestComponent
- [ ] Kiểm tra Siri button hoạt động

## 🔄 Quy trình deploy

### Cập nhật environment variables:

1. **Render Dashboard:**
   ```
   VITE_VAPI_PUBLIC_KEY=pk_your_new_key
   VITE_VAPI_ASSISTANT_ID=asst_your_new_id
   VAPI_API_KEY=your_new_server_key
   ```

2. **Trigger deploy:**
   - Click "Manual Deploy" button
   - Hoặc push code change để trigger auto deploy

3. **Verify deployment:**
   - Kiểm tra logs
   - Test VAPI connection
   - Test Siri button functionality

## 🆘 Troubleshooting

### Debug commands:

```bash
# Kiểm tra environment variables
node tools/scripts/debug-vapi-credentials.cjs

# Test API connectivity
curl -H "Authorization: Bearer YOUR_VAPI_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.vapi.ai/assistant
```

### Common error messages:

1. **"Invalid authentication token"** → Sai credentials
2. **"TOKEN_MISSING"** → Thiếu public key
3. **"Invalid public key format"** → Format sai (không bắt đầu với pk_)
4. **"Assistant not found"** → Sai assistant ID
5. **"Network error"** → Kết nối internet

### Browser console debug:

```javascript
// Enable verbose logging
vapiDebugFix.setLevel("verbose");

// Check stored credentials
console.log('Environment check:');
console.log('- Public Key exists:', !!import.meta.env.VITE_VAPI_PUBLIC_KEY);
console.log('- Assistant ID exists:', !!import.meta.env.VITE_VAPI_ASSISTANT_ID);
console.log('- API Key exists:', !!import.meta.env.VAPI_API_KEY);

// Export debug logs
vapiDebugFix.exportLogs();
```

## 🎯 Next Steps

Sau khi fix xong authentication:

1. **Test Siri button:** Nhấn button để kiểm tra voice call
2. **Test multi-language:** Thử các ngôn ngữ khác nhau
3. **Monitor logs:** Theo dõi logs để đảm bảo không có lỗi
4. **Performance testing:** Kiểm tra tốc độ response

## 📞 Support

Nếu vẫn gặp vấn đề:

1. Chạy debug tool và export report
2. Check browser console errors
3. Kiểm tra Render deployment logs
4. Verify VAPI account status

**Lưu ý:** Đảm bảo tài khoản VAPI của bạn còn credit và không bị suspend.