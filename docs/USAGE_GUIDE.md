# 📚 Hướng dẫn sử dụng Documentation System

## 🎯 Tổng quan

Hệ thống tài liệu DemoHotel19May đã được tổ chức lại hoàn toàn để dễ tìm và đọc hơn. Tất cả 170+
file markdown đã được phân loại vào 18 categories chuyên biệt.

## 📁 Cấu trúc mới

```
docs/
├── 📋 project-info/     # Thông tin dự án (24 files)
├── 🏗️ architecture/     # Kiến trúc hệ thống (11 files)
├── 🚀 deployment/       # Hướng dẫn triển khai (48 files)
├── 💻 development/      # Hướng dẫn phát triển (12 files)
├── 🧪 testing/         # Tài liệu testing (15 files)
├── 🔧 troubleshooting/  # Xử lý sự cố (16 files)
├── 📊 api/             # Tài liệu API (8 files)
├── 🎙️ voice-assistant/ # Voice assistant (4 files)
├── 🗄️ database/        # Database (4 files)
├── 🔐 security/        # Bảo mật (6 files)
├── 📈 analytics/       # Analytics (1 files)
├── 🏢 multi-tenant/    # Multi-tenant (1 files)
├── 🔄 automation/      # Automation (5 files)
├── 📚 knowledge-base/  # Knowledge base (2 files)
├── 🎓 training/        # Đào tạo (2 files)
├── 📋 governance/      # Governance (2 files)
├── 🗂️ legacy/          # Legacy (20 files)
└── 📝 templates/       # Templates (1 files)
```

## 🔍 Cách tìm kiếm

### 1. Tìm kiếm nhanh theo chủ đề

**Bắt đầu dự án:**

```bash
# Xem tổng quan dự án
open docs/project-info/README.md

# Xem roadmap
open docs/project-info/IMPLEMENTATION_ROADMAP.md

# Xem changelog
open docs/project-info/CHANGELOG.md
```

**Triển khai:**

```bash
# Hướng dẫn triển khai nhanh
open docs/deployment/DEPLOYMENT_QUICKSTART.md

# Checklist triển khai
open docs/deployment/DEPLOYMENT_CHECKLIST.md

# Fix production issues
open docs/deployment/PRODUCTION_FIX.md
```

**Phát triển:**

```bash
# Setup môi trường
open docs/development/ENVIRONMENT_SETUP.md

# Hướng dẫn đóng góp
open docs/development/CONTRIBUTING.md

# Code review guide
open docs/development/CODE_REVIEW_GUIDE.md
```

**Testing:**

```bash
# Manual testing procedures
open docs/testing/manual-testing-procedures.md

# Bug fixes summary
open docs/testing/BUG_FIXES_SUMMARY.md

# Test solutions
open docs/testing/TEST_SOLUTION_1.md
```

**Troubleshooting:**

```bash
# Troubleshooting guide
open docs/troubleshooting/TROUBLESHOOTING_GUIDE.md

# Database cleanup
open docs/troubleshooting/DATABASE_CLEANUP_COMPLETION.md

# Voice assistant fixes
open docs/troubleshooting/VOICE_COMPONENT_EMERGENCY_FIXES.md
```

### 2. Tìm kiếm theo từ khóa

```bash
# Tìm kiếm trong toàn bộ docs
grep -r "keyword" ./docs/

# Tìm kiếm theo category
grep -r "deployment" ./docs/deployment/
grep -r "testing" ./docs/testing/
grep -r "voice" ./docs/voice-assistant/
```

### 3. Sử dụng sitemap

```bash
# Xem sitemap tổng thể
open docs/SITEMAP.md

# Xem index của category cụ thể
open docs/deployment/INDEX.md
open docs/testing/INDEX.md
```

## 🛠️ Quản lý docs

### Cập nhật tự động

```bash
# Tổ chức lại tất cả file markdown
npm run docs:organize

# Dọn dẹp và tối ưu hóa
npm run docs:cleanup

# Cập nhật toàn bộ (organize + cleanup)
npm run docs:update

# Validate cấu trúc docs
npm run docs:validate
```

### Thêm file mới

1. **Tạo file markdown mới** trong thư mục gốc
2. **Chạy script tổ chức:**
   ```bash
   npm run docs:organize
   ```
3. **File sẽ được tự động phân loại** vào category phù hợp

### Di chuyển file thủ công

```bash
# Di chuyển file vào category cụ thể
mv my-file.md docs/deployment/

# Cập nhật index
npm run docs:cleanup
```

## 📊 Thống kê

- **Tổng số file**: 170+ files
- **Số category**: 18 categories
- **File lớn nhất**: deployment/ (48 files)
- **File nhỏ nhất**: analytics/, multi-tenant/, templates/ (1 file mỗi)

## 🎯 Best Practices

### 1. Đặt tên file

```bash
# ✅ Tốt
DEPLOYMENT_GUIDE.md
VOICE_ASSISTANT_SETUP.md
DATABASE_MIGRATION.md

# ❌ Không tốt
deployment-guide.md
voice-assistant-setup.md
database-migration.md
```

### 2. Cấu trúc nội dung

```markdown
# Tiêu đề chính

## Mô tả ngắn gọn

## Nội dung chính

## Kết luận

---

_📚 Tài liệu này thuộc category: [category-name]_
```

### 3. Liên kết cross-reference

```markdown
# Liên kết đến file khác

Xem thêm: [Deployment Guide](../deployment/DEPLOYMENT_GUIDE.md)

# Liên kết đến section

Xem thêm: [Troubleshooting](../troubleshooting/TROUBLESHOOTING_GUIDE.md#common-issues)
```

## 🔄 Workflow

### Khi có file mới

1. Tạo file markdown trong thư mục gốc
2. Chạy `npm run docs:organize`
3. Kiểm tra file đã được phân loại đúng
4. Chạy `npm run docs:cleanup` để tạo index

### Khi cần tìm tài liệu

1. Xem `docs/SITEMAP.md` để hiểu cấu trúc
2. Vào category phù hợp
3. Xem `INDEX.md` của category đó
4. Sử dụng `grep` để tìm kiếm từ khóa

### Khi cần cập nhật

1. Chỉnh sửa file trong `docs/[category]/`
2. Chạy `npm run docs:cleanup` để cập nhật index
3. Commit thay đổi

## 📞 Hỗ trợ

Nếu bạn gặp vấn đề:

1. **Không tìm thấy file**: Kiểm tra `docs/SITEMAP.md`
2. **File bị phân loại sai**: Chạy `npm run docs:organize` lại
3. **Index không cập nhật**: Chạy `npm run docs:cleanup`
4. **Cần thêm category**: Chỉnh sửa `scripts/organize-docs.cjs`

## 🎉 Kết quả

✅ **Đã tổ chức**: 170+ file markdown  
✅ **Đã phân loại**: 18 categories chuyên biệt  
✅ **Đã tạo index**: Mỗi category có INDEX.md  
✅ **Đã tạo sitemap**: Tổng quan toàn bộ docs  
✅ **Đã tối ưu**: Xóa file trùng lặp, đổi tên file không rõ ràng  
✅ **Đã automation**: Script npm để quản lý docs

---

_📚 Hệ thống docs đã được tổ chức lại hoàn toàn để dễ tìm và đọc hơn!_
