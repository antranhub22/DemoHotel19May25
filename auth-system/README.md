# 🔐 Auth System Module

## 📋 Overview

Unified authentication and authorization system for DemoHotel19May. This module consolidates all JWT, RBAC, and multi-tenant authentication logic into a single, well-organized system.

## 🗂️ Structure

```
auth-system/
├── types/          # TypeScript types & interfaces
├── config/         # JWT & RBAC configuration  
├── services/       # Auth business logic
├── middleware/     # Express middleware
├── routes/         # API endpoints
├── frontend/       # React components & hooks
├── tests/          # Auth testing suite
├── docs/           # Auth documentation
├── scripts/        # Setup & deployment scripts
└── index.ts        # Main barrel export
```

## 🚀 Quick Start

```typescript
// Import everything
import { UnifiedAuthService, authenticateJWT, JWT_CONFIG } from './auth-system';

// Or import specific modules
import { AuthUser, JWTPayload } from './auth-system/types';
import { JWT_CONFIG } from './auth-system/config';
import { UnifiedAuthService } from './auth-system/services';
```

## 🔧 Features

- ✅ **JWT Authentication** - Access & refresh tokens
- ✅ **RBAC System** - Role-based access control
- ✅ **Multi-tenant Support** - Tenant isolation
- ✅ **Token Management** - Blacklist & refresh
- ✅ **Frontend Integration** - React hooks & context
- ✅ **Type Safety** - Full TypeScript support

## 📚 Documentation

See `./docs/` for detailed documentation:
- `AUTH_API.md` - API endpoints
- `JWT_GUIDE.md` - JWT implementation
- `RBAC_GUIDE.md` - Role setup
- `DEPLOYMENT.md` - Deployment guide

## 🧪 Testing

```bash
# Run auth tests
npm run test:auth

# Run integration tests  
npm run test:auth:integration
```

## 🎯 Status

**✅ Phase 1 Complete**: Folder structure created
**🔄 In Progress**: Moving files from original locations
**⏳ Pending**: Import updates and testing

---

*Generated during auth system reorganization - DemoHotel19May v2.0* 