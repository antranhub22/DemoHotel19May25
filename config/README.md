# Configuration Directory

Thư mục chứa các file cấu hình được tổ chức từ root directory:

## 📁 Cấu trúc thư mục

### ⚙️ `build-configs/`
Các file cấu hình build:
- Vite configuration
- TypeScript global definitions
- Build info files

### 🧪 `test-configs/`
Các file cấu hình test:
- Vitest configuration
- Jest configuration
- Playwright configuration

### 🔍 `lint-configs/`
Các file cấu hình lint:
- ESLint configuration
- Prettier configuration
- Ignore files
- Updated ESLint configuration

### 🔧 `scripts-configs/`
Các script và file cấu hình:
- Production fix scripts
- Environment check scripts
- Docker configurations
- Deployment scripts
- Security fix scripts

## 🔧 Cách sử dụng
Các file này được sử dụng tự động bởi build tools, test runners, và lint tools.

### 🌍 `env-configs/`
Các file cấu hình environment:
- Environment variables
- Backup environment files

### 🚀 `deployment-configs/`
Các file cấu hình deployment:
- Render configuration
- Docker configuration
- Deployment ignore files

### 📝 `typescript-configs/`
Các file cấu hình TypeScript:
- Node.js TypeScript config
- TypeScript compiler settings

## 🚀 Cách sử dụng nhanh
```bash
# Environment configs
cd config/env-configs && ls -la

# Deployment configs
cd config/deployment-configs && cat render.yaml

# TypeScript configs
cd config/typescript-configs && cat tsconfig.node.json

# Scripts configs
cd config/scripts-configs && ls -la
```

### 🎨 `style-configs/`
Các file cấu hình style:
- Tailwind CSS configuration
- PostCSS configuration

### 🗄️ `database-configs/`
Các file cấu hình database:
- Drizzle ORM configuration
- Database schema settings

## 🚀 Cách sử dụng nhanh
```bash
# Style configs
cd config/style-configs && cat tailwind.config.ts

# Database configs
cd config/database-configs && cat drizzle.config.ts
```
