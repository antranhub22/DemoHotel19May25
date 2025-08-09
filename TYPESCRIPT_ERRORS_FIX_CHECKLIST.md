# TYPESCRIPT ERRORS FIX CHECKLIST

## 🚨 PHÂN TÍCH LỖI TYPESCRIPT (450 errors)

### 📊 PHÂN LOẠI LỖI CHÍNH

#### 1. **Component Type Errors (TS2749)** - 80+ errors
- `'ComponentName' refers to a value, but is being used as a type`
- **Nguyên nhân**: Sử dụng component name thay vì interface type
- **Giải pháp**: Tạo interface props cho mỗi component

#### 2. **Missing Type Definitions** - 50+ errors
- `Cannot find name 'Language'`, `RefObject`, `ReactNode`
- **Nguyên nhân**: Thiếu import type definitions
- **Giải pháp**: Add proper imports

#### 3. **Prisma Type Issues** - 30+ errors
- `TenantGetPayload`, `StaffGetPayload` không tồn tại
- **Nguyên nhân**: Prisma client types không đúng
- **Giải pháp**: Update Prisma imports và types

#### 4. **Import/Export Issues** - 40+ errors
- `Cannot find module '../types/common.types'`
- **Nguyên nhân**: Broken import paths
- **Giải pháp**: Fix import paths và exports

#### 5. **Property Access Errors** - 60+ errors
- `Property 'propertyName' does not exist on type`
- **Nguyên nhân**: Type definitions không match với usage
- **Giải pháp**: Update type definitions

## 🛠️ PHASE 1: FIX CORE TYPE DEFINITIONS

### 1.1 Fix Missing React Types
```typescript
// Add to global types file
import type { RefObject, ReactNode } from 'react';
import type { ComponentType } from 'react';

// Export common types
export type { RefObject, ReactNode, ComponentType };
```

### 1.2 Fix Language Type Definition
```typescript
// apps/client/src/types/common.types.ts
export type Language = 'en' | 'vi' | 'fr';

// apps/client/src/types/interface1.types.ts
export type { Language } from './common.types';
```

### 1.3 Fix Prisma Types
```typescript
// packages/shared/schema.ts
import type { Prisma } from '@prisma/client';

export type Tenant = Prisma.tenantsGetPayload<{}>;
export type InsertTenant = Prisma.tenantsCreateInput;
export type Staff = Prisma.staffGetPayload<{}>;
export type InsertStaff = Prisma.staffCreateInput;
// ... continue for all models
```

## 🛠️ PHASE 2: FIX COMPONENT TYPE ERRORS

### 2.1 Create Component Interface Templates
```typescript
// Template for component interfaces
interface ComponentNameProps {
  // Add props here
  children?: ReactNode;
  className?: string;
}

// Template for component exports
export const ComponentName: React.FC<ComponentNameProps> = ({ children, className }) => {
  // Component implementation
};
```

### 2.2 Fix Specific Component Errors

#### 2.2.1 Fix ProtectedRoute
```typescript
// apps/client/src/App.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: "admin" | "manager" | "staff";
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true, requiredRole, redirectTo = "/login" }) => {
  // Implementation
};
```

#### 2.2.2 Fix Dashboard Components
```typescript
// apps/client/src/components/features/dashboard/dashboard/DashboardLayout.tsx
interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  gradientFrom?: string;
  gradientTo?: string;
  loading?: boolean;
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, subtitle, gradientFrom, gradientTo, loading = false, children }) => {
  // Implementation
};
```

## 🛠️ PHASE 3: FIX IMPORT/EXPORT ISSUES

### 3.1 Fix Missing Type Files
```typescript
// apps/client/src/types/common.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type Language = 'en' | 'vi' | 'fr';
export type UserRole = 'admin' | 'manager' | 'staff' | 'super_admin';

// Add other common types
```

### 3.2 Fix Import Paths
```typescript
// Update all imports to use correct paths
import type { Language } from '@/types/common.types';
import type { ApiResponse } from '@/types/common.types';
import type { UserRole } from '@/types/auth';
```

## 🛠️ PHASE 4: FIX PRISMA TYPE ISSUES

### 4.1 Update Prisma Schema Types
```typescript
// packages/shared/schema.ts
import type { Prisma } from '@prisma/client';

// Use correct Prisma type names
export type Tenant = Prisma.tenantsGetPayload<{}>;
export type InsertTenant = Prisma.tenantsCreateInput;
export type Staff = Prisma.staffGetPayload<{}>;
export type InsertStaff = Prisma.staffCreateInput;
export type Call = Prisma.callsGetPayload<{}>;
export type InsertCall = Prisma.callsCreateInput;
export type Transcript = Prisma.transcriptsGetPayload<{}>;
export type InsertTranscript = Prisma.transcriptsCreateInput;
export type Request = Prisma.requestsGetPayload<{}>;
export type InsertRequest = Prisma.requestsCreateInput;
export type Message = Prisma.messagesGetPayload<{}>;
export type InsertMessage = Prisma.messagesCreateInput;
export type CallSummary = Prisma.call_summariesGetPayload<{}>;
export type InsertCallSummary = Prisma.call_summariesCreateInput;
```

### 4.2 Fix Database Transformer Types
```typescript
// packages/shared/db/transformers.ts
import type { Prisma } from '@prisma/client';

export type Tenant = Prisma.tenantsGetPayload<{}>;
export type InsertTenant = Prisma.tenantsCreateInput;
export type Staff = Prisma.staffGetPayload<{}>;
export type InsertStaff = Prisma.staffCreateInput;
// ... continue for all models
```

## 🛠️ PHASE 5: FIX PROPERTY ACCESS ERRORS

### 5.1 Fix Room Type Properties
```typescript
// Update Room interface
interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  bedType: string;
  bedCount: number;
  capacity: number;
  size: number;
  view: string;
  basePrice: number;
  status: string;
  currentGuest?: {
    guestName: string;
  };
  lastCleaning?: Date;
}
```

### 5.2 Fix Task Type Properties
```typescript
// Update HousekeepingTask interface
interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  taskType: string;
  priority: string;
  description: string;
  estimatedDuration: number;
  assignedStaffName?: string;
  scheduledStart?: Date;
  status: string;
}
```

### 5.3 Fix Request Type Properties
```typescript
// Update MaintenanceRequest interface
interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: string;
  urgency: string;
  source: string;
  reportedAt: Date;
  assignedStaffName?: string;
  status: string;
}
```

## 🛠️ PHASE 6: FIX USER ROLE CONFLICTS

### 6.1 Standardize UserRole Type
```typescript
// apps/client/src/types/auth.ts
export type UserRole = 'admin' | 'manager' | 'staff' | 'super_admin';

// packages/types/core.ts
export type UserRole = 'admin' | 'manager' | 'staff' | 'super_admin';
```

### 6.2 Fix Role Usage
```typescript
// Update all role references
const role: UserRole = 'super_admin'; // instead of 'super-admin'
```

## 🛠️ PHASE 7: FIX FUNCTION SIGNATURE ERRORS

### 7.1 Fix Function Parameter Types
```typescript
// Fix function signatures
const handleRoomStatusChange = (roomId: string, newStatus: string) => {
  // Implementation
};

const selectTask = (task: HousekeepingTask) => {
  // Implementation
};

const completeTask = (taskId: string) => {
  // Implementation
};
```

### 7.2 Fix State Management Types
```typescript
// Fix state types
const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
const [roomFilters, setRoomFilters] = useState<{
  status?: string;
  floor?: number;
}>({});
```

## 📋 CHECKLIST THỰC HIỆN

### ✅ PHASE 1: Core Type Definitions
- [ ] Create apps/client/src/types/common.types.ts
- [ ] Add Language type definition
- [ ] Add React type imports
- [ ] Export common types

### ✅ PHASE 2: Component Interfaces
- [ ] Fix ProtectedRoute interface
- [ ] Fix DashboardLayout interface
- [ ] Fix MetricCard interface
- [ ] Fix all component type errors (80+ files)

### ✅ PHASE 3: Import/Export Fixes
- [ ] Fix missing type file imports
- [ ] Update import paths
- [ ] Add missing exports
- [ ] Fix module resolution

### ✅ PHASE 4: Prisma Types
- [ ] Update Prisma schema types
- [ ] Fix database transformer types
- [ ] Update all Prisma imports
- [ ] Fix Prisma client types

### ✅ PHASE 5: Property Access
- [ ] Fix Room type properties
- [ ] Fix Task type properties
- [ ] Fix Request type properties
- [ ] Update all property access

### ✅ PHASE 6: User Role Standardization
- [ ] Standardize UserRole type
- [ ] Fix role usage throughout codebase
- [ ] Update role references

### ✅ PHASE 7: Function Signatures
- [ ] Fix function parameter types
- [ ] Fix state management types
- [ ] Update all function calls

## 🚀 COMMANDS TO RUN

```bash
# 1. Check current TypeScript errors
npm run type-check

# 2. Fix specific error categories
# Phase 1: Core types
# Phase 2: Component interfaces
# Phase 3: Import/export fixes
# Phase 4: Prisma types
# Phase 5: Property access
# Phase 6: User role standardization
# Phase 7: Function signatures

# 3. Verify fixes
npm run type-check

# 4. Build project
npm run build
```

## 🎯 EXPECTED OUTCOME

Sau khi hoàn thành checklist này:

- ✅ **0 TypeScript errors**
- ✅ **Clean build process**
- ✅ **Proper type safety**
- ✅ **Better development experience**
- ✅ **IntelliSense working correctly**

## 📝 NOTES

- **Backup code** trước khi fix
- **Fix từng phase một** để dễ debug
- **Test sau mỗi phase** để đảm bảo không break functionality
- **Document changes** để team có thể follow
