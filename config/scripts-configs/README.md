# Scripts Configurations

Các script và file cấu hình được di chuyển từ `config-files/`:

## 🔧 Script Files
- `🚨-EMERGENCY-CALL-CLEANUP.js` - Script cleanup call khẩn cấp
- `🛑-FORCE-END-STUCK-CALL.js` - Script kết thúc call bị stuck
- `🧪-TEST-OFFICIAL-VAPI.js` - Script test VAPI chính thức
- `auto-fix-production.cjs` - Script tự động fix production
- `check-env.cjs` - Script kiểm tra environment
- `clear-browser-cache.sh` - Script xóa cache browser
- `DEPLOYMENT_ROLLBACK.sh` - Script rollback deployment
- `fix-production-auth.cjs` - Script fix authentication production
- `fix-production-tenant.js` - Script fix tenant production
- `fix-security.js` - Script fix security
- `render-environment-fix.cjs` - Script fix environment Render
- `restore-env.cjs` - Script restore environment
- `test-auth-fix.sh` - Script test auth fix

## 🐳 Docker Files
- `docker-compose.yml` - Docker compose configuration
- `docker-compose.production.yml` - Docker compose production

## 📊 Report Files
- `auth-endpoints-test-report.json` - Báo cáo test auth endpoints
- `render-production-diagnostic.json` - Diagnostic production Render
- `repository-sync-report-2025-07-24.json` - Báo cáo sync repository

## 🚀 Cách sử dụng
```bash
# Chạy script fix production
node auto-fix-production.cjs

# Kiểm tra environment
node check-env.cjs

# Fix production auth
node fix-production-auth.cjs

# Rollback deployment
./DEPLOYMENT_ROLLBACK.sh
``` 