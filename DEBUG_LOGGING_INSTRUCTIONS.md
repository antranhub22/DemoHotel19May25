# 🔍 DEBUG LOGGING INSTRUCTIONS - Production Testing

## 📋 **BƯỚC 1: Mở Console Tab**

Bạn đang ở **Network tab**, cần chuyển sang **Console tab**:

1. ✅ Đang ở Developer Tools (F12)
2. ❌ Đang ở **Network** tab 
3. 🎯 **CLICK "Console" tab** (bên cạnh Elements, Sources)

## 🎯 **BƯỚC 2: Start Voice Call và Monitor Logs**

### **Thực hiện cuộc gọi:**
1. Click vào **microphone button** để bắt đầu call
2. Nói một vài câu (ví dụ: "Hello, I want to order room service")
3. Chờ assistant response

### **Logs cần quan sát:**

#### **🟢 EXPECTED SUCCESS LOGS:**
```
🔄 [useConversationState] Evaluating showConversation (DETAILED):
📝 [VapiProvider] Received transcript message:
🔍 [ChatPopup] Props and state changed:
🔍 [RealtimeConversationPopup] Transcripts changed:
```

#### **🔴 POTENTIAL ERROR LOGS:**
```
❌ Race condition detected
❌ Transcripts cleared after VAPI start
❌ showConversation = false
❌ isOpen = false
```

## 🧪 **BƯỚC 3: Filter Logs**

Trong Console, type để filter:
```
🔍 [ChatPopup]
```
hoặc
```
🔍 [VapiProvider]
```

## 📊 **BƯỚC 4: Copy Logs và Report**

Nếu vẫn không hoạt động:
1. Right-click trong Console → "Save as..."
2. Hoặc copy relevant logs
3. Share với developer để analysis

## 🚀 **QUICK TEST CHECKLIST**

- [ ] Console tab opened
- [ ] Voice call started
- [ ] Transcript logs visible
- [ ] showConversation = true
- [ ] ChatPopup isOpen = true
- [ ] Transcripts array populated 