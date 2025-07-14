# DemoHotel19May - Monorepo Structure

## 📁 Cấu trúc mới sau Restructure

```
DemoHotel19May/
├── 📁 apps/                          # Applications
│   ├── 📁 client/                    # Frontend React app
│   │   ├── index.html
│   │   ├── public/
│   │   └── src/
│   └── 📁 server/                    # Backend Node.js app
│       ├── index.ts
│       ├── routes/
│       ├── services/
│       └── models/
├── 📁 packages/                      # Shared packages
│   ├── 📁 shared/                    # Shared utilities & types
│   ├── 📁 types/                     # Type definitions
│   └── 📁 config/                    # Shared configurations
├── 📁 tools/                         # Development tools
│   ├── 📁 scripts/                   # Build scripts
│   └── 📁 migrations/                # Database migrations
├── 📁 tests/                         # Test suites
├── 📁 docs/                          # Documentation
├── 📁 assets/                        # Static assets
└── 📁 .infrastructure/               # Infrastructure files
    ├── docker-compose.yml
    ├── Dockerfile
    └── deployment/
```

## 🚀 Cải tiến trong cấu trúc mới

### ✅ Lợi ích:
- **Monorepo structure**: Tách biệt rõ ràng apps và packages
- **Clean root directory**: Chỉ giữ lại config files cần thiết
- **Consolidated documentation**: Tất cả docs trong một folder
- **Logical grouping**: Tools, tests, assets được nhóm hợp lý
- **Scalable**: Dễ dàng thêm apps/packages mới

### 🔧 Cập nhật config:
- **vite.config.ts**: Cập nhật paths cho `apps/client/`
- **tsconfig.json**: Cập nhật include paths và aliases
- **tailwind.config.ts**: Cập nhật content paths
- **drizzle.config.ts**: Cập nhật schema và migration paths

## 📦 Development

### Frontend (Client):
```bash
# Development
npm run dev

# Build
npm run build
```

### Backend (Server):
```bash
# Development
npm run server:dev

# Build
npm run server:build
```

## 🗂️ Cấu trúc cũ vs mới

| Cũ | Mới | Lý do |
|-----|-----|--------|
| `client/` | `apps/client/` | Monorepo structure |
| `server/` | `apps/server/` | Monorepo structure |
| `shared/` | `packages/shared/` | Shared packages |
| `config/` | `packages/config/` | Shared configurations |
| `lib/` | `packages/shared/` | Consolidated utilities |
| `scripts/` | `tools/scripts/` | Development tools |
| `migrations/` | `tools/migrations/` | Database tools |
| `*.md` files | `docs/` | Consolidated documentation |
| `public/` | `assets/` | Static assets |
| `docker-*` | `.infrastructure/` | Infrastructure files |

## 🔄 Migration completed on branch: `restructure-repo`

Backup được tạo tại branch: `backup-before-restructure` 