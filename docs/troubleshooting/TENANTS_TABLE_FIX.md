# 🚨 **KHẮC PHỤC LỖI: "relation 'tenants' does not exist"**

## 🎯 **Mô tả lỗi**

Lỗi này xảy ra khi hệ thống auto-migration cố gắng chạy nhưng table `tenants` chưa được tạo trong database. Logs sẽ hiển thị:

```
Auto-migration failed: error: relation "tenants" does not exist
Missing tenant columns: hotel_name, subscription_plan, subscription_status
```

## 🔧 **Cách khắc phục**

### **Cách 1: Khắc phục nhanh (Ngay lập tức)**

Chạy script khắc phục đã được tạo sẵn:

```bash
npm run fix:tenants
```

Hoặc:

```bash
node scripts/fix-tenants-table.cjs
```

### **Cách 2: Chạy auto-migration thủ công**

```bash
npm run migrate:auto
```

### **Cách 3: Restart ứng dụng (Đã fix trong code)**

Sau khi update code, chỉ cần restart ứng dụng:

```bash
npm start
```

## ✅ **Kiểm tra sau khi fix**

1. **Kiểm tra table đã được tạo:**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_name = 'tenants';
```

2. **Kiểm tra structure của table:**

```sql
\d tenants
```

3. **Kiểm tra dữ liệu:**

```sql
SELECT COUNT(*) FROM tenants;
```

## 🛠 **Chi tiết kỹ thuật**

### **Nguyên nhân:**

1. Production migration không tạo table `tenants`
2. Auto-migration system cần table `tenants` tồn tại để thêm columns
3. Thứ tự khởi tạo: `runProductionMigration()` → `autoMigrateOnDeploy()`

### **Giải pháp áp dụng:**

1. **Đã thêm `tenants` table vào production migration** (`apps/server/startup/production-migration.ts`)
2. **Tạo script khắc phục ngay lập tức** (`scripts/fix-tenants-table.cjs`)
3. **Thêm npm scripts** để dễ sử dụng

### **Table schema được tạo:**

```sql
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  hotel_name VARCHAR(200),
  subdomain VARCHAR(50) NOT NULL UNIQUE,
  custom_domain VARCHAR(100),
  subscription_plan VARCHAR(50) DEFAULT 'trial',
  subscription_status VARCHAR(50) DEFAULT 'active',
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  max_voices INTEGER DEFAULT 5,
  max_languages INTEGER DEFAULT 4,
  voice_cloning BOOLEAN DEFAULT false,
  multi_location BOOLEAN DEFAULT false,
  white_label BOOLEAN DEFAULT false,
  data_retention_days INTEGER DEFAULT 90,
  monthly_call_limit INTEGER DEFAULT 1000,
  name VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  settings TEXT,
  tier VARCHAR(50) DEFAULT 'free',
  max_calls INTEGER DEFAULT 1000,
  max_users INTEGER DEFAULT 10,
  features TEXT
);
```

## 🚀 **Scripts có sẵn**

- `npm run fix:tenants` - Khắc phục nhanh table tenants
- `npm run migrate:auto` - Chạy auto-migration thủ công
- `npm run migrate:production` - Chạy production migration

## ⚡ **Lưu ý quan trọng**

- ✅ Script an toàn, có thể chạy nhiều lần (sử dụng `CREATE TABLE IF NOT EXISTS`)
- ✅ Tự động tạo tenant mặc định nếu table trống
- ✅ Tương thích với cả PostgreSQL và SQLite
- ⚠️ Đảm bảo `DATABASE_URL` được cấu hình đúng trước khi chạy

## 📞 **Hỗ trợ thêm**

Nếu vẫn gặp lỗi, kiểm tra:

1. **Environment variables:**

   ```bash
   echo $DATABASE_URL
   ```

2. **Database connection:**

   ```bash
   npm run health:check
   ```

3. **Logs chi tiết:**
   - Render logs: Deployment dashboard
   - Local logs: Console output khi start server
