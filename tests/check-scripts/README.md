# Check Scripts

Các script kiểm tra được di chuyển từ root directory:

## 🔍 Check Files
- `check-schema-consistency.js` - Kiểm tra tính nhất quán schema
- `check-schema-consistency.cjs` - Kiểm tra tính nhất quán schema (CJS)
- `check-production-db.js` - Kiểm tra production database
- `check-production-db.cjs` - Kiểm tra production database (CJS)
- `check-status.sh` - Kiểm tra trạng thái hệ thống

## ✅ Cách sử dụng
```bash
# Kiểm tra schema consistency
node check-schema-consistency.cjs

# Kiểm tra production database
node check-production-db.cjs

# Kiểm tra trạng thái
./check-status.sh
```
