# 🔄 Hướng dẫn lấy DATABASE_URL từ Render

## ❌ Vấn đề hiện tại:
```
Error: password authentication failed for user "minhonhotelen1_user"
```

## ✅ Giải pháp:

### Bước 1: Đăng nhập Render Dashboard
- Truy cập: https://dashboard.render.com
- Đăng nhập tài khoản của bạn

### Bước 2: Tìm Database Service  
- Trong Dashboard, tìm service có tên `minhonhotelen1` (PostgreSQL)
- Click vào database service đó

### Bước 3: Lấy DATABASE_URL mới
- Click tab **"Connect"**
- Tìm section **"External Database URL"**
- Copy toàn bộ URL (bắt đầu với `postgresql://...`)

### Bước 4: Update file .env
```bash
# Thay thế dòng này trong file .env:
DATABASE_URL=postgresql://minhonhotelen1_user:Fjos7A0kcIGCOQZKtSaDoSHYOgvd8GWU@dpg-d036eph5pdvs73db24rg-a.oregon-postgres.render.com:5432/minhonhotelen1?sslmode=require

# Với URL mới từ Render Dashboard:
DATABASE_URL=<URL_MỚI_TỪ_RENDER>
```

### Bước 5: Test lại connection
```bash
node test-database-connection.js
```

## 🔍 Lưu ý:
- Database URL có thể thay đổi khi Render reset password
- Luôn lấy URL mới nhất từ Dashboard
- Đảm bảo copy đầy đủ URL bao gồm `?sslmode=require`