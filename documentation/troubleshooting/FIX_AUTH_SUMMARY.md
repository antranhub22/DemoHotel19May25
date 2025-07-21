# 🔧 GIẢI PHÁP XỬ LÝ LỖI AUTHENTICATION

## 🎯 Vấn đề gặp phải

- Lỗi 400: "Invalid login credentials" khi login
- Lỗi 401: "Invalid authentication" khi gọi API
- WebSocket không kết nối được

## ✅ Giải pháp đã triển khai

### 1. **Cấu hình Environment (.env)**

```bash
DATABASE_URL=sqlite://./apps/dev.db
JWT_SECRET=unified-auth-super-secret-jwt-key-change-in-production
NODE_ENV=development
PORT=10000
```

### 2. **Setup SQLite Database**

- Hỗ trợ dual database: SQLite (dev) và PostgreSQL (production)
- Script tạo database: `tools/scripts/setup-dev-db.ts`
- Tạo sẵn users mặc định:
  - admin / admin123 (super-admin)
  - manager / manager123 (hotel-manager)
  - frontdesk / frontdesk123 (front-desk)
  - itmanager / itmanager123 (it-manager)

### 3. **Cập nhật Vite Config**

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:10000',
    changeOrigin: true,
    secure: false,
  },
  '/socket.io': {
    target: 'http://localhost:10000',
    changeOrigin: true,
    secure: false,
    ws: true,
  },
}
```

### 4. **Khởi động ứng dụng**

```bash
# Setup database
npx tsx tools/scripts/setup-dev-db.ts

# Start server
./start-dev.sh

# Hoặc chạy thủ công
export DATABASE_URL=sqlite://./apps/dev.db
export JWT_SECRET=unified-auth-super-secret-jwt-key-change-in-production
npm run dev
```

### 5. **Test Authentication**

```bash
# Test với curl
curl -X POST http://localhost:10000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager","password":"manager123"}'

# Test với script
npx tsx tools/scripts/test-auth.ts
```

## 🔍 Nguyên nhân lỗi

1. **Lỗi 400**: Validation schema yêu cầu `username` hoặc `email`, nhưng frontend có thể gửi sai
   format
2. **Lỗi 401**: Token không hợp lệ hoặc không có token trong header
3. **Database**: Không có user trong database hoặc password không match

## 📝 Lưu ý

- Đảm bảo server chạy trên port 10000
- Frontend (Vite) chạy trên port 3000 với proxy đến backend
- Sử dụng SQLite cho development, PostgreSQL cho production
- Tất cả passwords đều được hash với bcrypt
