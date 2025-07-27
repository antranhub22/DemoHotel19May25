# 🎤 SIRI BUTTON DEBUG GUIDE - Khắc phục VAPI không hoạt động

## 🚨 **VẤN ĐỀ HIỆN TẠI**

Khi nhấn Siri button không thể gọi VAPI assistant

## 🔍 **BƯỚC 1: Kiểm tra Browser Console**

### **Mở Developer Tools:**

1. Nhấn **F12** hoặc **Ctrl+Shift+I**
2. Chọn tab **Console**
3. Nhấn Siri button và quan sát logs

### **Tìm kiếm những logs sau:**

#### **✅ LOGS THÀNH CÔNG (Expected):**

```
🚀 [DEBUG] Siri Button Click Event:
🎬 [DEBUG] SiriButtonContainer.handleStartCall called:
🚀 [DEBUG] VapiContextSimple.startCall called:
✅ [DEBUG] Vapi client initialized successfully:
📞 Call started
```

#### **❌ LOGS LỖI (Error):**

```
❌ Failed to initialize Vapi client
❌ Public key validation failed
❌ Network error
❌ Permission denied (microphone)
❌ CSP blocking
```

## 🔍 **BƯỚC 2: Kiểm tra Microphone Permissions**

### **Chrome/Edge:**

1. Click vào **Lock icon** bên trái URL
2. Kiểm tra **Microphone** permission → Phải là **Allow**
3. Nếu **Block** → Chọn **Allow** → Refresh page

### **Safari:**

1. **Safari Menu** → **Preferences** → **Websites** → **Microphone**
2. Tìm localhost:5173 → Chọn **Allow**

## 🔍 **BƯỚC 3: Test VAPI Connection**

Chạy command này để test VAPI public key:

```bash
curl -X GET "https://api.vapi.ai/assistant/18414a64-d242-447a-8162-ce3efd2cc8f1" \
  -H "Authorization: Bearer 4fba1458-6ea8-45c5-9653-76bbb54e64b5"
```

**Expected response:** Assistant configuration JSON  
**Error response:** 401 Unauthorized

## 🔍 **BƯỚC 4: Check Environment Variables**

Trong browser console, run:

```javascript
console.log('VAPI Config:', {
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY,
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID,
  hasPublicKey: !!import.meta.env.VITE_VAPI_PUBLIC_KEY,
  hasAssistantId: !!import.meta.env.VITE_VAPI_ASSISTANT_ID,
});
```

**Expected:** Tất cả values phải có và không undefined

## 🛠️ **QUICK FIXES**

### **Fix 1: Refresh và Clear Cache**

```bash
# Stop server
Ctrl+C

# Clear browser cache
# Trong Dev Tools → Application → Storage → Clear storage

# Restart server
npm run dev
```

### **Fix 2: Test với HTTPS**

Một số browsers yêu cầu HTTPS cho microphone access:

```bash
# Install ngrok
npm install -g ngrok

# In another terminal
ngrok http 5173

# Use the https URL provided by ngrok
```

### **Fix 3: Force Microphone Permission**

```javascript
// Trong browser console
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone access granted');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('❌ Microphone access denied:', err));
```

## 📋 **REPORT BACK**

Sau khi thực hiện các bước trên, hãy báo cáo:

1. **Console logs** khi nhấn Siri button
2. **Microphone permission status**
3. **Environment variables check result**
4. **Any specific error messages**

## 🆘 **COMMON ISSUES & SOLUTIONS**

### **Issue: "Public key validation failed"**

**Solution:** Check .env file có VITE_VAPI_PUBLIC_KEY

### **Issue: "Permission denied"**

**Solution:** Enable microphone permissions

### **Issue: "Network error"**

**Solution:** Check internet connection, firewall, CSP headers

### **Issue: "Vapi is not defined"**

**Solution:** CDN loading issue, check network tab

---

**🎯 Thực hiện từng bước và báo cáo kết quả để tôi có thể hỗ trợ thêm!**
