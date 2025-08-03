# Scripts Directory

Thư mục chứa các script được tổ chức từ root directory:

## 📁 Cấu trúc thư mục

### 💻 `dev-scripts/`
Các script phát triển:
- Script khởi động/dừng development server
- PID files cho development processes

### 🚀 `deployment-scripts/`
Các script deployment:
- Script tối ưu hóa dashboard deployment

### 📊 `schema-scripts/`
Các script liên quan đến schema:
- Script báo cáo schema consistency

## 🚀 Cách sử dụng nhanh
```bash
# Khởi động development
cd scripts/dev-scripts && ./start-dev.sh

# Deploy dashboard
cd scripts/deployment-scripts && ./deploy-dashboard-optimization.sh

# Chạy schema report
cd scripts/schema-scripts && node schema-consistency-report.cjs
```
