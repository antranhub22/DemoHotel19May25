# Database Tests

Các thư mục test database được di chuyển từ root directory:

## 📁 Test Folders
- `test-pitr/` - Point-in-time recovery tests
- `test-migrations/` - Database migration tests
- `test-recovery/` - Database recovery tests
- `test-backups/` - Database backup tests

## 🗄️ Test Categories

### Point-in-time Recovery Tests
Tests cho việc khôi phục database tại một thời điểm cụ thể.

### Migration Tests
Tests cho việc migrate database schema và data.

### Recovery Tests
Tests cho việc khôi phục database từ backup.

### Backup Tests
Tests cho việc tạo và quản lý backup database.

## 🚀 Cách sử dụng
```bash
# Chạy PITR tests
cd test-pitr && npm test

# Chạy migration tests
cd test-migrations && npm test

# Chạy recovery tests
cd test-recovery && npm test

# Chạy backup tests
cd test-backups && npm test
``` 