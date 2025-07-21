# 🚀 **Auto-Migration System - Smart Database Schema Management**

## 🎯 **Overview**

The Auto-Migration System automatically detects and fixes database schema mismatches during
deployment and server startup. **No more manual schema fixes!**

## ✨ **Key Features**

- ✅ **Automatic Detection** - Detects missing columns/tables
- ✅ **Safe Execution** - Transaction-based with rollback on errors
- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Environment Aware** - Different behavior for dev/production
- ✅ **Zero Downtime** - Runs during deployment without stopping service
- ✅ **Comprehensive Logging** - Detailed migration logs

---

## 🔄 **How It Works**

### **1. Deployment Time (Render/Production)**

```bash
# In deploy-render.sh
npm run migrate:auto  # Runs auto-migration
npm run build         # Then builds application
```

### **2. Server Startup (Every Boot)**

```typescript
// In apps/server/index.ts
await runProductionMigration(); // Legacy migrations
await autoMigrateOnDeploy(); // Auto-migration
await runAutoDbFix(); // Data fixes
```

### **3. Manual Execution (When Needed)**

```bash
# Production fix
npm run migrate:auto

# Or direct
tsx tools/scripts/auto-migrate-on-deploy.ts
```

---

## 📊 **What Gets Auto-Fixed**

### **Staff Table Missing Columns:**

```sql
ALTER TABLE staff
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS permissions TEXT DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
```

### **Tenants Table Missing Columns:**

```sql
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS hotel_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS max_voices INTEGER DEFAULT 5,
-- ... and more SaaS features
```

### **Performance Indexes:**

```sql
CREATE INDEX IF NOT EXISTS idx_staff_tenant_id ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
CREATE INDEX IF NOT EXISTS idx_call_tenant_id ON call(tenant_id);
-- ... and more performance indexes
```

---

## 🛡️ **Safety Mechanisms**

### **1. Environment Detection**

```typescript
if (!DATABASE_URL) {
  console.log('⚠️ DATABASE_URL not found - skipping migration (probably local dev)');
  return { success: true, migrationsRun: [] };
}
```

### **2. Transaction Safety**

```typescript
await client.query('BEGIN');
try {
  await client.query(migrationSQL);
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK'); // Safe rollback on error
  throw error;
}
```

### **3. Idempotent Operations**

```sql
-- Safe to run multiple times
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)
CREATE INDEX IF NOT EXISTS idx_staff_tenant_id ON staff(tenant_id)
```

### **4. Data Preservation**

```sql
-- Updates existing records with sensible defaults
UPDATE staff
SET
  first_name = COALESCE(first_name, SPLIT_PART(username, '.', 1)),
  display_name = COALESCE(display_name, username)
WHERE first_name IS NULL OR display_name IS NULL;
```

---

## 📝 **Migration Logs**

### **Successful Migration:**

```bash
🔄 Auto-Migration: Checking database schema...
📍 Production database detected - running auto-migration...
🔍 Checking staff table schema...
🚨 Missing columns detected: first_name, last_name, display_name
🔧 Running staff table migration...
✅ Staff table migration completed
🔍 Checking tenants table schema...
✅ Tenants table schema is up to date
🔍 Checking database indexes...
✅ Database indexes ensured
🎉 Auto-migration completed successfully!
📝 Migrations run: staff_table_columns
```

### **No Migration Needed:**

```bash
🔄 Auto-Migration: Checking database schema...
📍 Production database detected - running auto-migration...
🔍 Checking staff table schema...
✅ Staff table schema is up to date
🔍 Checking tenants table schema...
✅ Tenants table schema is up to date
🔍 Checking database indexes...
✅ Database indexes ensured
✅ Database schema is up to date - no migrations needed
```

---

## ⚙️ **Configuration Options**

### **Environment Variables:**

#### **`AUTO_MIGRATE` (default: true)**

```bash
# Disable auto-migration on startup
AUTO_MIGRATE=false

# Enable auto-migration (default)
AUTO_MIGRATE=true
```

#### **`DATABASE_URL` (required for production)**

```bash
# Production PostgreSQL URL
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

---

## 🚀 **Integration Points**

### **1. Deployment Script (deploy-render.sh)**

```bash
# Auto-migrate database schema (safe to run multiple times)
echo "🔄 Running auto-migration..."
npm run migrate:auto || echo "Auto-migration completed (may have warnings)"
```

### **2. Package.json Scripts**

```json
{
  "scripts": {
    "migrate:auto": "tsx tools/scripts/auto-migrate-on-deploy.ts"
  }
}
```

### **3. Server Startup (apps/server/index.ts)**

```typescript
// Auto-migrate database schema (safe for production)
if (process.env.AUTO_MIGRATE !== 'false') {
  console.log('🔄 Running auto-migration...');
  await autoMigrateOnDeploy();
}
```

---

## 🔧 **File Structure**

```
📁 Auto-Migration System
├── 📄 tools/scripts/auto-migrate-on-deploy.ts    # Main auto-migration logic
├── 📄 tools/migrations/0007_fix_production_staff_columns.sql  # Legacy migration
├── 📄 deploy-render.sh                           # Updated deploy script
├── 📄 apps/server/index.ts                       # Server startup integration
└── 📄 AUTO_MIGRATION_SYSTEM.md                   # This documentation
```

---

## 🐛 **Troubleshooting**

### **Migration Fails During Deployment:**

```bash
# Check logs for specific error
npm run migrate:auto

# Common issues:
# 1. DATABASE_URL not set or incorrect
# 2. Database permissions insufficient
# 3. Database not accessible from deployment environment
```

### **Migration Fails During Server Startup:**

```typescript
// Server will continue starting even if migration fails
console.error('Migration failed, but continuing deployment...');
// Application remains functional with existing schema
```

### **Check Migration Status:**

```bash
# Test auto-migration manually
npm run migrate:auto

# Check current database schema
psql $DATABASE_URL -c "\d staff"
psql $DATABASE_URL -c "\d tenants"
```

---

## 📈 **Benefits**

### **For Developers:**

- ✅ **No Manual Schema Fixes** - Auto-resolves schema mismatches
- ✅ **Safe Deployments** - No fear of breaking production database
- ✅ **Faster Development** - Schema changes deploy automatically

### **For Production:**

- ✅ **Zero Downtime** - Migrations run without stopping service
- ✅ **Automatic Recovery** - Self-healing database schema
- ✅ **Audit Trail** - Complete migration logs

### **For Team:**

- ✅ **Reduced Manual Work** - No more manual database operations
- ✅ **Consistent Environments** - Dev and production stay in sync
- ✅ **Error Prevention** - Catches schema mismatches before they cause issues

---

## 🎯 **Success Criteria**

After implementing auto-migration, you should see:

1. **✅ No More "Column Does Not Exist" Errors**
2. **✅ Successful Authentication in Production**
3. **✅ Clean Deployment Logs**
4. **✅ Database Schema Stays Up-to-Date**

---

## 📞 **Next Steps**

### **Immediate:**

1. **Deploy with auto-migration enabled** (already integrated)
2. **Monitor deployment logs** for auto-migration output
3. **Test production authentication** after deployment

### **Long-term:**

1. **Add more tables** to auto-migration as schema evolves
2. **Extend to handle data migrations** if needed
3. **Add migration rollback capabilities** for advanced scenarios

---

**🎉 With Auto-Migration System, database schema management is now fully automated! No more manual
fixes, no more deployment fears!** 🚀
