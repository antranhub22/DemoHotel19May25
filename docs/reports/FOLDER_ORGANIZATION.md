# 📁 Tổ Chức Thư Mục Project

## 🎯 Mục Đích

Tổ chức lại cấu trúc thư mục để dễ dàng quản lý và tìm kiếm file trong project.

## 📂 Cấu Trúc Thư Mục Mới

### 🗂️ Root Directory (Thư Mục Gốc)

Các file cấu hình chính của project:

- `package.json` - Cấu hình dependencies
- `package-lock.json` - Lock file cho dependencies
- `tsconfig.json` - Cấu hình TypeScript
- `vite.config.ts` - Cấu hình Vite
- `.cursorrules` - Rules cho Cursor IDE
- `.nvmrc` - Node.js version
- `render.yaml` - Cấu hình deployment
- `global.d.ts` - Global TypeScript definitions
- `README.md` - Hướng dẫn project

### 🗄️ Database Files (`database-files/`)

Chứa tất cả file liên quan đến database:

- `dev.db*` - SQLite database files
- `current_data_backup.txt` - Backup dữ liệu
- `current_schema_backup.sql` - Backup schema
- `dev.test.db` - Test database
- `dev-emergency.db` - Emergency database

### 📊 Reports (`reports/`)

Chứa các báo cáo và kết quả:

- `*.txt` - Text reports
- `*.html` - HTML reports
- `BUSINESS_LOGIC_REPORT.html` - Báo cáo business logic

### 🐛 Debug Files (`debug-files/`)

Chứa các file debug và test:

- `test-*.html` - Test HTML files
- `test-*.js` - Test JavaScript files
- `test-*.cjs` - Test CommonJS files
- `test-*.ts` - Test TypeScript files
- `debug-*.html` - Debug HTML files
- `debug-*.js` - Debug JavaScript files
- `debug-*.cjs` - Debug CommonJS files

### 📚 Documentation (`documentation/`)

Chứa tất cả file documentation:

- `*.md` - Markdown files
- Các hướng dẫn và tài liệu

### 💾 Backup Files (`backup-files/`)

Chứa các file backup:

- `*.backup-*` - Backup files
- `.eslintrc.js.backup-*` - ESLint backup files

### ⚙️ Config Files (`config-files/`)

Chứa các file cấu hình phụ:

- `*.json` - JSON config files
- `*.yaml` - YAML config files
- `*.yml` - YML config files
- `*.ts` - TypeScript config files
- `*.js` - JavaScript config files
- `*.cjs` - CommonJS config files
- `*.sh` - Shell script files

## 🔍 Cách Tìm File

### Tìm Database Files

```bash
ls database-files/
```

### Tìm Debug Files

```bash
ls debug-files/
```

### Tìm Reports

```bash
ls reports/
```

### Tìm Documentation

```bash
ls documentation/
```

## 📝 Lưu Ý

- Các file cấu hình chính vẫn ở root directory để dễ truy cập
- Mỗi thư mục có mục đích rõ ràng
- Dễ dàng tìm kiếm và quản lý file
- Giữ nguyên cấu trúc project hiện tại

## 🚀 Lợi Ích

1. **Dễ nhìn**: Cấu trúc rõ ràng, dễ phân biệt
2. **Dễ tìm**: File được phân loại theo chức năng
3. **Dễ quản lý**: Mỗi loại file có thư mục riêng
4. **Không ảnh hưởng**: Không thay đổi logic project
