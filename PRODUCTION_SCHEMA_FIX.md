# 🔧 Production Database Schema Fix

## 🚨 **Issue Description**

The production database on Render is missing columns that the updated code expects, causing authentication errors:

```bash
❌ Login error: error: column "first_name" does not exist
❌ Invalid credentials
```

## 🎯 **Root Cause**

- **Local development**: Updated PostgreSQL schema with new columns
- **Production**: Still has old schema without required columns
- **Result**: Code expects `first_name`, `last_name` etc. but they don't exist

## ✅ **Solution: Automated Migration**

### **Option 1: Quick Fix (Recommended)**

```bash
# Set production environment variables
export DATABASE_URL="your-production-database-url"

# Run automated schema fix
./fix-production-schema.sh
```

### **Option 2: Manual via npm script**

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migration
npm run fix:production-schema
```

### **Option 3: Direct SQL (Advanced)**

Connect to production database and run:
```sql
-- Add missing staff columns
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS permissions TEXT DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Update existing records
UPDATE staff 
SET 
  first_name = COALESCE(first_name, SPLIT_PART(username, '.', 1)),
  last_name = COALESCE(last_name, SPLIT_PART(username, '.', 2)),
  display_name = COALESCE(display_name, username),
  permissions = COALESCE(permissions, '[]'),
  is_active = COALESCE(is_active, true)
WHERE first_name IS NULL OR last_name IS NULL OR display_name IS NULL;
```

## 📊 **What Gets Fixed**

### **Staff Table Columns Added:**
- ✅ `first_name` - User's first name
- ✅ `last_name` - User's last name  
- ✅ `display_name` - Full display name (defaults to username)
- ✅ `avatar_url` - Profile picture URL
- ✅ `permissions` - JSON array of permissions
- ✅ `is_active` - Account status flag
- ✅ `last_login` - Last login timestamp

### **Tenants Table Columns Added:**
- ✅ `hotel_name` - Hotel display name
- ✅ `subscription_plan` - Current plan (trial/basic/premium)
- ✅ `subscription_status` - Status (active/inactive/expired)
- ✅ `max_voices`, `max_languages` - Feature limits
- ✅ `voice_cloning`, `multi_location`, `white_label` - Feature flags

## 🚀 **After Migration**

1. **Verify the fix worked:**
   ```bash
   # Check production logs for successful login
   ```

2. **Redeploy if needed:**
   ```bash
   ./deploy-render.sh
   ```

3. **Test authentication:**
   - Try logging in with existing credentials
   - Should see successful login without column errors

## 🛡️ **Safety Features**

- ✅ **Transaction-based**: All changes in single transaction (rollback on error)
- ✅ **Idempotent**: Safe to run multiple times (`IF NOT EXISTS`)
- ✅ **Data preservation**: Updates existing records with sensible defaults
- ✅ **Verification**: Confirms changes after migration

## 📝 **Migration Log**

The script will show progress:
```bash
🔧 Starting Production Database Schema Fix...
📍 Database: your-db-host
🔗 Testing database connection...
📊 Checking current schema state...
📋 Current staff table columns:
  - id: text (not null)
  - username: text (not null)
  - password: text (not null)
  - email: text (nullable)
🚨 Missing columns detected - running migration...
🔄 Running migration in transaction...
📝 Executing statement 1/15...
📝 Executing statement 2/15...
...
✅ Migration completed successfully!
🔍 Verifying migration results...
✅ New columns added:
  ✓ first_name: character varying
  ✓ last_name: character varying
  ✓ display_name: character varying
🎉 Production schema fix completed!
```

## 🔍 **Troubleshooting**

### If migration fails:
1. Check DATABASE_URL is correct
2. Verify database connectivity
3. Check database permissions
4. Review error messages in logs

### If login still fails after migration:
1. Clear application cache
2. Restart application
3. Check for other missing columns
4. Verify user passwords are still valid

## 📞 **Need Help?**

If you encounter issues:
1. Check the migration logs for specific errors
2. Verify all environment variables are set correctly
3. Test database connection manually
4. Contact support with error logs 