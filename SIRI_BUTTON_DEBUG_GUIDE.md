# 🔍 Siri Button Debug Guide

## 🎯 Mục đích
Hướng dẫn debug để tìm ra tại sao nút Siri không kích hoạt được Vapi SDK.

## 🚀 Cách test

### Bước 1: Mở Chrome DevTools
1. Truy cập `minhonmuine.talk2go.online`
2. Nhấn F12 hoặc chuột phải → Inspect
3. Chuyển đến tab **Console**
4. Xóa log cũ bằng Ctrl+L

### Bước 2: Nhấn nút Siri
1. Nhấn vào nút Siri trên trang
2. Quan sát logs trong Console theo thứ tự:

## 📋 Debug Flow Sequence

### 🎬 **1. SiriCallButton - Event Detection**
```
🚀 [DEBUG] Siri Button Click Event: {
  eventType: "click",
  isListening: false,
  onCallStartAvailable: true,
  language: "en",
  containerId: "siri-button-container"
}
```

### 🎯 **2. SiriCallButton - Decision Flow**
```
🎯 [DEBUG] Call Flow Decision: {
  shouldStartCall: true,
  shouldEndCall: false,
  isListening: false,
  onCallStart: true
}
```

### 🟢 **3. SiriCallButton - Starting Call**
```
🟢 [DEBUG] About to start call: {
  language: "en",
  timestamp: "2025-01-25T16:33:00.000Z",
  callStartFunction: "async (lang) => { ... }"
}
```

### 🎬 **4. SiriButtonContainer - Call Handler**
```
🎬 [DEBUG] SiriButtonContainer.handleStartCall called: {
  language: "en",
  onCallStartFunction: true,
  onCallStartType: "function"
}

🚀 [DEBUG] About to call onCallStart: {
  language: "en",
  timestamp: "2025-01-25T16:33:00.000Z"
}
```

### 🎯 **5. useCallHandler - Main Logic**
```
🎯 [DEBUG] useCallHandler.handleCall called: {
  language: "en",
  hotelConfig: true,
  hotelConfigDetails: {
    hotelName: "Mi Nhon Hotel",
    hasVapiPublicKey: true,
    hasVapiAssistantId: true
  }
}
```

### 🔑 **6. Vapi Keys Retrieval**
```
🔑 [DEBUG] Getting Vapi keys: {
  language: "en",
  timestamp: "2025-01-25T16:33:00.000Z"
}

🔑 [DEBUG] Vapi keys retrieved: {
  publicKey: "pk_12345678901...",  // hoặc "MISSING"
  assistantId: "asst_12345678...", // hoặc "MISSING"
  language: "en",
  publicKeyLength: 46,
  assistantIdLength: 29
}
```

### 🔧 **7. Development Mode Check**
```
🔧 [DEBUG] Development mode check: {
  isDevelopment: true/false,
  envDEV: true/false,
  hasPublicKey: true/false,
  hasAssistantId: true/false
}
```

### 🚀 **8. Vapi Initialization**
```
🚀 [DEBUG] Starting Vapi initialization: {
  publicKey: "pk_12345678901...",
  assistantId: "asst_12345678...",
  language: "en"
}

📞 [DEBUG] About to start Vapi call: {
  assistantId: "asst_12345678...",
  language: "en"
}

⚠️ [DEBUG] NOTE: Actual Vapi SDK call should happen here!
```

## ❌ Các lỗi thường gặp

### **1. Hotel Configuration Missing**
```
❌ [DEBUG] Hotel configuration missing: {
  hotelConfig: null,
  timestamp: "..."
}
```
**→ Giải pháp**: Kiểm tra useHotelConfiguration hook

### **2. Vapi Keys Missing**
```
❌ [DEBUG] Vapi keys missing error: {
  error: "Vapi configuration not available for language: en",
  publicKeyMissing: true,
  assistantIdMissing: false,
  language: "en"
}
```
**→ Giải pháp**: Kiểm tra environment variables

### **3. Development Mode Bypass**
```
🔧 [DEBUG] Development mode bypass activated: {
  reason: "Missing Vapi keys",
  publicKeyMissing: true,
  assistantIdMissing: false
}
```
**→ Giải pháp**: Đây là normal trong dev mode, nhưng không có Vapi call thực

### **4. Double-Click Protection**
```
🚨 [DEBUG] Double-click protection triggered
```
**→ Giải pháp**: Đợi 100ms rồi thử lại

### **5. No Action Taken**
```
⚠️ [DEBUG] No action taken: {
  reason: "Conditions not met",
  isListening: true,
  onCallStartAvailable: false
}
```
**→ Giải pháp**: Kiểm tra state hoặc callback functions

## 🔧 Điểm dừng debug

### **Nếu không thấy logs đầu tiên (🚀 [DEBUG] Siri Button Click Event)**
- Nút Siri không được click
- Event listener không hoạt động
- Component không render

### **Nếu dừng ở hotel configuration**
- useHotelConfiguration hook lỗi
- Context không được provide

### **Nếu dừng ở Vapi keys**
- Environment variables không đúng
- getVapiPublicKeyByLanguage/getVapiAssistantIdByLanguage lỗi

### **Nếu thấy "NOTE: Actual Vapi SDK call should happen here!"**
- **ĐÂY LÀ VẤN ĐỀ CHÍNH!** 
- useCallHandler không gọi Vapi SDK thực sự
- Cần implement Vapi call thực

## 🎯 Kết luận

Sau khi test, check log nào là cuối cùng trong Console để xác định chính xác vấn đề ở đâu!

## 📞 Liên hệ
Paste logs vào chat để được hỗ trợ debug tiếp! 