# 🔧 SỬA LỖI FRONTEND 401 ERRORS

## 📊 **VẤN ĐỀ XÁC ĐỊNH:**

Từ Network tab screenshot:

- ✅ **Website loads** - HTML/CSS/JS files đều 200 OK
- ✅ **Auth endpoints work** - Backend authentication functional
- ❌ **Multiple 401 errors** - Frontend requests thiếu authentication tokens
- ❌ **minhonmuine requests failing** - API calls không có proper auth headers

**🎯 Root cause**: Frontend không tự động attach auth tokens vào API requests

## ⚡ **GIẢI PHÁP NGAY LẬP TỨC:**

### 🎯 **Option 1: Manual Login (Test ngay - 2 phút)**

**Mở DevTools Console trên `minhonmuine.talk2go.online` và chạy:**

```javascript
// Step 1: Login và lấy token
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' }),
})
  .then(r => r.json())
  .then(data => {
    if (data.success && data.token) {
      // Step 2: Save token vào localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Login successful! Token saved.');

      // Step 3: Reload page để apply token
      window.location.reload();
    } else {
      console.log('❌ Login failed:', data);
    }
  })
  .catch(console.error);
```

**Expected result**: Sau khi reload, các 401 errors sẽ biến mất.

### 🎯 **Option 2: Quick Frontend Fix**

**Nếu bạn có quyền chỉnh sửa code, add này vào client:**

```javascript
// In apps/client/src/lib/api.ts hoặc tương tự
const api = axios.create({
  baseURL: window.location.origin + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach auth token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 🔍 **CHI TIẾT CÁC LỖI 401:**

### **Requests đang fail:**

1. **API calls** - Missing `Authorization: Bearer <token>` header
2. **WebSocket connections** - Missing auth in connection params
3. **Voice assistant calls** - No auth context
4. **Dashboard data** - Protected endpoints require auth

### **Why it happens:**

- Frontend app loads successfully (static files)
- App starts making API calls immediately
- No auth token available yet (user hasn't logged in)
- All protected API calls return 401

## 🚀 **TESTING STEPS:**

### **Test 1: Verify Manual Login Works**

```javascript
// Run this in Console after manual login above
fetch('/api/auth/me', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
})
  .then(r => r.json())
  .then(console.log);

// Should show user info, no 401
```

### **Test 2: Check Protected Endpoints**

```javascript
// Test dashboard data
fetch('/api/dashboard/config', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
})
  .then(r => r.json())
  .then(console.log);
```

### **Test 3: Verify Voice Assistant**

```javascript
// Test voice endpoints
fetch('/api/calls/recent', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
})
  .then(r => r.json())
  .then(console.log);
```

## 📋 **CHECKLIST:**

**Immediate fixes:**

- [ ] ✅ Manual login via console
- [ ] ✅ Verify token saved in localStorage
- [ ] ✅ Reload page to apply authentication
- [ ] ✅ Check 401 errors disappear from Network tab
- [ ] ✅ Test core features work

**Long-term fixes:**

- [ ] 🔧 Add auto-login mechanism
- [ ] 🔧 Implement proper auth interceptors
- [ ] 🔧 Add auth state management
- [ ] 🔧 Handle token expiration gracefully

## 🎯 **EXPECTED RESULTS:**

**After manual login:**

- ✅ No more 401 errors in Network tab
- ✅ Dashboard loads correctly
- ✅ Staff features accessible
- ✅ Voice assistant functional
- ✅ All API calls succeed

**🚀 Try the manual login first - it should fix 90% of the 401 errors immediately!**
