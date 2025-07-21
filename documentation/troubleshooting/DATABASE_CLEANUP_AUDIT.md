# DATABASE CLEANUP AUDIT REPORT

Generated: $(date)
Database: SQLite (dev.db)

## 🎯 EXECUTIVE SUMMARY

Sau khi xóa bảng `orders` và phân tích toàn bộ database, tôi đã phát hiện **3 trường hợp tương tự** cần được xử lý để đảm bảo tính nhất quán.

**Overall Database Health: 🟡 MEDIUM RISK**
- ✅ Bảng `orders` đã được xóa thành công
- ⚠️ 3 alias gây nhầm lẫn còn tồn tại
- ⚠️ 1 bảng database riêng biệt nhưng có cùng chức năng

---

## 📊 DATABASE TABLES ANALYSIS

### Current Tables in Database:
```
call            ✅ Active (0 records)
call_summaries  ✅ Active (0 records) 
hotel_profiles  ✅ Active (0 records)
message         ✅ Active (0 records)
request         ✅ Active (1 record) - MAIN TABLE
staff           ✅ Active (1 record)
tenants         ✅ Active (2 records)
transcript      ✅ Active (0 records)
users           ⚠️ NOT IN SCHEMA - ORPHANED TABLE (0 records)
```

---

## 🚨 FOUND ISSUES

### 1. **ALIAS DUPLICATION: `callSummaries = call`**
**Risk Level: 🟡 MEDIUM**

**Problem:**
- Schema định nghĩa: `export const callSummaries = call;`
- Bảng `call_summaries` tồn tại riêng biệt trong database
- Code sử dụng `callSummaries` alias thay vì `call` trực tiếp

**Files Affected:**
- `packages/shared/db/schema.ts:163`
- `apps/server/storage.ts` (5 references)
- `apps/server/routes.ts` (2 references)

**Impact:**
- Nhầm lẫn giữa bảng `call` và `call_summaries`
- Code không rõ ràng về việc đang làm việc với bảng nào

### 2. **ALIAS DUPLICATION: `users = staff`**
**Risk Level: 🟡 MEDIUM**

**Problem:**
- Schema định nghĩa: `export const users = staff;`
- Bảng `users` orphaned tồn tại trong database (0 records)
- Code sử dụng alias `users` thay vì `staff`

**Files Affected:**
- `packages/shared/db/schema.ts:156`
- `apps/server/storage.ts` (3 references)
- `packages/shared/schema.ts:166`

**Impact:**
- Nhầm lẫn về bảng đang được sử dụng
- Bảng `users` orphaned trong database

### 3. **ALIAS DUPLICATION: `transcripts = transcript`**
**Risk Level: 🟢 LOW**

**Problem:**
- Schema định nghĩa: `export const transcripts = transcript;`
- Tên số ít/số nhiều gây nhầm lẫn

**Files Affected:**
- `packages/shared/db/schema.ts:157`
- `apps/server/storage.ts` (1 reference)

**Impact:**
- Tương đối nhỏ, chỉ là vấn đề naming convention

### 4. **ORPHANED TABLE: `users`**
**Risk Level: 🟡 MEDIUM**

**Problem:**
- Bảng `users` tồn tại trong database nhưng không được định nghĩa trong schema
- 0 records, có thể là legacy table

---

## 🔧 RECOMMENDED CLEANUP ACTIONS

### Priority 1: Critical (Fix Immediately)

#### 1.1 Remove `callSummaries` Alias
```sql
-- Check if call_summaries table is actually needed
-- If not, consider dropping it
```

```typescript
// In schema.ts, remove:
export const callSummaries = call;

// Update all references to use 'call' directly
```

#### 1.2 Remove `users` Alias & Orphaned Table
```sql
-- Drop orphaned users table
DROP TABLE IF EXISTS users;
```

```typescript
// In schema.ts, remove:
export const users = staff;

// Update all references to use 'staff' directly
```

### Priority 2: Medium (Clean up when convenient)

#### 2.1 Fix `transcripts` Alias
```typescript
// In schema.ts, remove:
export const transcripts = transcript;

// Update references to use 'transcript' directly
```

### Priority 3: Documentation

#### 3.1 Update Schema Documentation
- Document why certain aliases were removed
- Clarify naming conventions for future tables

---

## 📈 EXPECTED BENEFITS AFTER CLEANUP

### Performance
- ✅ Reduced confusion in query planning
- ✅ Cleaner database structure

### Developer Experience
- ✅ Clear table naming without aliases
- ✅ Reduced cognitive load when reading code
- ✅ Easier onboarding for new developers

### Maintenance
- ✅ Single source of truth for each entity
- ✅ Reduced risk of bugs from alias confusion
- ✅ Simpler database migrations

---

## 🎯 CLEANUP ESTIMATION

**Total Work Required: 4-6 hours**

1. **Remove callSummaries alias** (2 hours)
   - Update 7 file references
   - Test call summary functionality

2. **Remove users alias** (1 hour)
   - Update 3 file references
   - Drop orphaned table

3. **Remove transcripts alias** (1 hour)
   - Update 1 file reference

4. **Testing & Documentation** (1-2 hours)
   - Verify all functionality works
   - Update documentation

---

## 🚀 NEXT STEPS

1. **Review this audit** with team
2. **Prioritize cleanup tasks** based on risk level
3. **Create cleanup scripts** for each alias removal
4. **Test thoroughly** before deploying to production
5. **Update documentation** to prevent future duplications

---

## 📝 NOTES

- Bảng `request` đã được consolidate thành công từ `orders`
- Database hiện tại ổn định với 1 record trong `request` table
- Các alias còn lại chủ yếu gây nhầm lẫn về mặt code clarity
- Không có data loss risk cho các cleanup này

**Status:** ✅ READY FOR CLEANUP 