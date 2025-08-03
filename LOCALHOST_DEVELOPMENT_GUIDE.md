# 🏨 DemoHotel - Localhost Development Guide

## ✅ Tình trạng: LOCALHOST ĐÃ HOẠT ĐỘNG

Localhost development environment đã được kiểm tra và sửa chữa hoàn toàn. Tất cả các vấn đề đã được giải quyết.

## 🚀 Khởi động nhanh

### Cách 1: Sử dụng script tự động (Khuyến nghị)

```bash
# Khởi động development environment
./start-dev.sh

# Dừng development environment
./stop-dev.sh
```

### Cách 2: Khởi động thủ công

```bash
# Terminal 1: Khởi động server
npm run dev

# Terminal 2: Khởi động client  
npm run dev:client
```

## 🔗 Các URL quan trọng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:10000
- **Health Check**: http://localhost:10000/api/health

## 📋 Các vấn đề đã sửa

### 1. ✅ Dependencies thiếu
- Đã cài đặt lại tất cả dependencies với `npm install --force`
- Sửa các conflicts và version mismatches

### 2. ✅ Environment Variables
- Sửa PORT từ 5173 → 10000 trong `.env`
- Sửa DATABASE_URL từ `file:./dev.db` → `sqlite://./apps/dev.db`
- Tất cả API keys và configurations đã được cấu hình đúng

### 3. ✅ Database Connection
- Sửa lỗi `db.$client.query` trong healthController.ts
- Sử dụng `connectionManager.healthCheck()` thay vì truy cập trực tiếp
- Database SQLite đã hoạt động bình thường

### 4. ✅ Server Configuration
- Server khởi động thành công trên port 10000
- Health check endpoint hoạt động: `{"success":true,"status":"healthy"}`
- Modular architecture và ServiceContainer hoạt động tốt

### 5. ✅ Client Configuration
- Vite dev server khởi động thành công trên port 3000
- Proxy configuration cho API calls đã được cấu hình đúng
- Hot reload và HMR hoạt động bình thường

## 🛠 Cấu hình hiện tại

### Environment (.env)
```env
NODE_ENV=development
PORT=10000
DATABASE_URL=sqlite://./apps/dev.db
JWT_SECRET=mi-nhon-hotel-jwt-secret-2024-secure
VITE_OPENAI_API_KEY=sk-proj-...
VITE_VAPI_PUBLIC_KEY=4fba1458-6ea8-45c5-9653-76bbb54e64b5
# ... các keys khác đã được cấu hình
```

### Database
- **Loại**: SQLite (development), PostgreSQL (production)
- **File**: `apps/dev.db`
- **Connection**: Unified connection manager với connectionManager
- **Health Check**: ✅ Healthy

### Ports
- **Server**: 10000
- **Client**: 3000
- **Proxy**: Client proxy API calls tới server

## 📊 Monitoring và Logs

### Logs tự động (khi dùng script)
```bash
# Xem logs realtime
tail -f logs/server.log   # Server logs
tail -f logs/client.log   # Client logs
```

### Health monitoring
```bash
# Kiểm tra health
curl http://localhost:10000/api/health

# Kiểm tra chi tiết
curl http://localhost:10000/api/health/detailed
```

## 🐛 Troubleshooting

### Nếu server không khởi động
1. Kiểm tra port 10000 có bị chiếm không: `lsof -i :10000`
2. Kiểm tra logs: `tail -f logs/server.log`
3. Kiểm tra database: `ls -la apps/dev.db`

### Nếu client không khởi động
1. Kiểm tra port 3000: `lsof -i :3000`
2. Kiểm tra logs: `tail -f logs/client.log`
3. Clear cache: `rm -rf node_modules/.vite`

### Force cleanup
```bash
# Dừng tất cả processes
pkill -f "tsx watch apps/server/index.ts"
pkill -f "vite dev --port 3000"

# Hoặc force kill
pkill -9 -f "tsx"
pkill -9 -f "vite"
```

## 🎯 Testing

### Kiểm tra server
```bash
curl http://localhost:10000/api/health
# Response: {"success":true,"status":"healthy",...}
```

### Kiểm tra client
```bash
curl http://localhost:3000
# Response: HTML với React app
```

### Kiểm tra database
```bash
# Database sẽ được tự động tạo nếu không tồn tại
ls -la apps/dev.db
```

## 📝 Scripts có sẵn

```bash
# Development
npm run dev              # Start server only
npm run dev:client       # Start client only
./start-dev.sh          # Start both (recommended)
./stop-dev.sh           # Stop both

# Build & Production
npm run build           # Build for production
npm run preview         # Preview production build
npm start              # Production mode

# Database
npm run db:studio      # Drizzle Studio
npm run db:migrate     # Run migrations

# Testing & Quality
npm run test           # Run tests
npm run lint           # Lint code
npm run format         # Format code
```

## 🎉 Kết luận

Localhost development environment đã hoạt động hoàn toàn:

- ✅ Server chạy trên http://localhost:10000
- ✅ Client chạy trên http://localhost:3000  
- ✅ Database SQLite hoạt động bình thường
- ✅ API endpoints phản hồi đúng
- ✅ Hot reload và development tools hoạt động
- ✅ Scripts tự động cho việc start/stop
- ✅ Logging và monitoring đầy đủ

Bạn có thể bắt đầu development ngay bây giờ với `./start-dev.sh`! 🚀