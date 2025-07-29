# 🚀 Auto Deploy Setup Guide

## Phương án 1: GitHub Actions (Khuyến nghị)

### Bước 1: Lấy Render API Keys

1. Vào [Render Dashboard](https://dashboard.render.com)
2. Click vào service "DemoHotel19May25"
3. Vào Settings → API Keys
4. Tạo API key mới

### Bước 2: Thêm Secrets vào GitHub

1. Vào GitHub repo → Settings → Secrets and variables → Actions
2. Thêm secrets:
   - `RENDER_SERVICE_ID`: Service ID từ Render
   - `RENDER_API_KEY`: API key từ Render

### Bước 3: Kích hoạt workflow

- Push code lên branch `main` hoặc `master`
- GitHub Actions sẽ tự động chạy và deploy

## Phương án 2: Render Auto-Deploy

### Bước 1: Kết nối GitHub

1. Vào Render Dashboard → Service
2. Settings → Git
3. Connect GitHub repository
4. Chọn branch (main/master)

### Bước 2: Cài đặt Auto-Deploy

1. Settings → Build & Deploy
2. Enable "Auto-Deploy"
3. Chọn branch và trigger events

## Phương án 3: Manual Deploy Script

```bash
# Deploy script
#!/bin/bash
echo "🚀 Starting deployment..."

# Build
npm run build:production

# Run migration
npm run migrate:production

# Deploy to Render
curl -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json"

echo "✅ Deployment triggered!"
```

## Monitoring

- **GitHub Actions**: Xem logs trong Actions tab
- **Render**: Xem logs trong service dashboard
- **Health Check**: `https://minhonmuine.talk2go.online/api/health`
