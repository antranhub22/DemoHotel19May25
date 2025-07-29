# 🎭 RBAC (Role-Based Access Control) Guide

## 📋 Overview

Complete guide for implementing and managing Role-Based Access Control in the DemoHotel19May auth
system.

---

## 🏗️ RBAC Architecture

### **Core Components:**

1. **Users** - Individual people accessing the system
2. **Roles** - Job functions or responsibilities
3. **Permissions** - Specific actions on resources
4. **Resources** - System modules and features

### **RBAC Model:**

```
Users → Assigned to → Roles → Have → Permissions → On → Resources
```

**Example:**

```
John Doe → Hotel Manager → Can View/Edit → Dashboard/Analytics
Jane Smith → Front Desk → Can View → Guest Management
```

---

## 👥 User Roles

### **Primary Roles:**

#### **🏨 hotel-manager**

**Description**: Complete hotel management access **Responsibilities**: Full operational control,
staff management, analytics

**Permissions:**

```typescript
{
  dashboard: ['view', 'edit', 'view_client_interface'],
  analytics: ['view', 'export', 'advanced', 'view_advanced'],
  billing: ['view', 'edit'],
  staff: ['view', 'edit', 'delete', 'invite', 'manage'],
  settings: ['view', 'edit'],
  calls: ['view', 'join', 'transfer', 'end', 'override'],
  system: ['view', 'monitor'],
  assistant: ['configure', 'manage'],
  notifications: ['view', 'manage'],
  requests: ['view', 'manage'],
  guests: ['view', 'manage'],
  security: ['view', 'manage'],
  integrations: ['view', 'manage'],
  logs: ['view', 'export']
}
```

#### **🏨 front-desk**

**Description**: Guest service and front desk operations **Responsibilities**: Check-in/out, guest
requests, basic call handling

**Permissions:**

```typescript
{
  dashboard: ['view'],
  calls: ['view', 'join', 'transfer', 'end'],
  analytics: ['view_basic'],
  profile: ['view', 'edit'],
  guests: ['view', 'edit', 'checkin', 'checkout', 'manage'],
  requests: ['view', 'manage'],
  notifications: ['view'],
  system: []
}
```

#### **💻 it-manager**

**Description**: System administration and technical support **Responsibilities**: System
monitoring, integrations, technical debugging

**Permissions:**

```typescript
{
  dashboard: ['view'],
  system: ['view', 'edit', 'debug', 'restart', 'monitor'],
  integrations: ['view', 'edit', 'test', 'manage'],
  logs: ['view', 'export', 'debug'],
  calls: ['view', 'debug'],
  analytics: ['view', 'technical'],
  billing: [],
  staff: [],
  security: ['view', 'manage'],
  notifications: ['view']
}
```

### **Legacy Roles (Backward Compatibility):**

- `admin` → Maps to `hotel-manager`
- `staff` → Maps to `front-desk`
- `manager` → Maps to `hotel-manager`
- `frontdesk` → Maps to `front-desk`
- `itmanager` → Maps to `it-manager`
- `super-admin` → Maps to `hotel-manager` (with additional system access)

---

## 🔑 Permission System

### **Permission Structure:**

```typescript
interface Permission {
  module: string; // Resource module
  action: string; // Specific action
  allowed: boolean; // Permission granted
}
```

### **Permission Modules:**

#### **📊 Dashboard**

- `view` - Access dashboard
- `edit` - Modify dashboard settings
- `view_client_interface` - Access client interface

#### **📈 Analytics**

- `view` - Basic analytics access
- `view_basic` - Limited analytics
- `view_advanced` - Full analytics
- `export` - Export analytics data
- `advanced` - Advanced analytics features
- `technical` - System performance analytics

#### **👥 Staff**

- `view` - View staff list
- `edit` - Edit staff details
- `delete` - Remove staff
- `invite` - Invite new staff
- `manage` - Full staff management

#### **🏠 Guests**

- `view` - View guest list
- `edit` - Edit guest details
- `checkin` - Check-in guests
- `checkout` - Check-out guests
- `manage` - Full guest management

#### **📞 Calls**

- `view` - View call history
- `join` - Join active calls
- `transfer` - Transfer calls
- `end` - End calls
- `override` - Override call controls
- `debug` - Technical call debugging

#### **⚙️ System**

- `view` - View system status
- `edit` - Modify system settings
- `debug` - Debug system issues
- `restart` - Restart system services
- `monitor` - System monitoring

#### **🔗 Integrations**

- `view` - View integrations
- `edit` - Modify integrations
- `test` - Test integration connections
- `manage` - Full integration management

#### **📋 Requests**

- `view` - View guest requests
- `manage` - Handle guest requests

#### **🔔 Notifications**

- `view` - View notifications
- `manage` - Manage notification settings

#### **🔒 Security**

- `view` - View security settings
- `manage` - Manage security configuration

#### **📝 Logs**

- `view` - View system logs
- `export` - Export log data
- `debug` - Debug using logs

---

## 🛠️ Implementation

### **Role Assignment:**

```typescript
class RoleService {
  static async assignRole(userId: string, role: UserRole): Promise<void> {
    await db.update(staff).set({ role }).where(eq(staff.id, userId));
  }

  static async getUserRole(userId: string): Promise<UserRole | null> {
    const user = await db.select().from(staff).where(eq(staff.id, userId)).limit(1);

    return user[0]?.role || null;
  }
}
```

### **Permission Checking:**

```typescript
class PermissionService {
  static hasPermission(user: AuthUser, module: string, action: string): boolean {
    return user.permissions.some(
      permission =>
        permission.module === module && permission.action === action && permission.allowed
    );
  }

  static hasAnyPermission(user: AuthUser, module: string, actions: string[]): boolean {
    return actions.some(action => this.hasPermission(user, module, action));
  }

  static hasAllPermissions(user: AuthUser, module: string, actions: string[]): boolean {
    return actions.every(action => this.hasPermission(user, module, action));
  }
}
```

### **Middleware Implementation:**

```typescript
export const requireRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHENTICATED',
      });
    }

    if (user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: `Role '${requiredRole}' required`,
        code: 'INSUFFICIENT_ROLE',
      });
    }

    next();
  };
};

export const requirePermission = (module: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHENTICATED',
      });
    }

    if (!PermissionService.hasPermission(user, module, action)) {
      return res.status(403).json({
        success: false,
        error: `Permission '${module}:${action}' required`,
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  };
};
```

---

## 🎯 Role Hierarchy

### **Hierarchy Structure:**

```typescript
export const ROLE_HIERARCHY = {
  'super-admin': 5, // Highest privilege
  'hotel-manager': 4, // Full hotel access
  'it-manager': 3, // System administration
  admin: 4, // Legacy: Maps to hotel-manager
  manager: 4, // Legacy: Maps to hotel-manager
  'front-desk': 2, // Guest operations
  frontdesk: 2, // Legacy: Maps to front-desk
  staff: 2, // Legacy: Maps to front-desk
  itmanager: 3, // Legacy: Maps to it-manager
};
```

### **Hierarchy-Based Permission Checking:**

```typescript
export const hasRolePrivilege = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  return userLevel >= requiredLevel;
};

// Usage in middleware
export const requireMinimumRole = (minimumRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser;

    if (!hasRolePrivilege(user.role, minimumRole)) {
      return res.status(403).json({
        success: false,
        error: `Minimum role '${minimumRole}' required`,
        code: 'INSUFFICIENT_ROLE',
      });
    }

    next();
  };
};
```

---

## 🎨 Frontend Integration

### **Permission-Based Rendering:**

```typescript
// Permission Guard Component
interface PermissionGuardProps {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action,
  children,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  const hasPermission = user.permissions.some(permission =>
    permission.module === module &&
    permission.action === action &&
    permission.allowed
  );

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

// Usage
<PermissionGuard module="analytics" action="view">
  <AnalyticsButton />
</PermissionGuard>
```

### **Role-Based Navigation:**

```typescript
// Dynamic Sidebar based on role
export const DynamicSidebar: React.FC = () => {
  const { user } = useAuth();

  const menuItems = useMemo(() => {
    if (!user) return [];

    return ROLE_MENU_CONFIG[user.role] || [];
  }, [user]);

  return (
    <nav>
      {menuItems.map(item => (
        <PermissionGuard
          key={item.key}
          module={item.module}
          action={item.requiredAction}
        >
          <MenuItem {...item} />
        </PermissionGuard>
      ))}
    </nav>
  );
};
```

### **Custom Hooks:**

```typescript
// usePermission hook
export const usePermission = (module: string, action: string): boolean => {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return false;

    return user.permissions.some(permission =>
      permission.module === module &&
      permission.action === action &&
      permission.allowed
    );
  }, [user, module, action]);
};

// useRole hook
export const useRole = (): UserRole | null => {
  const { user } = useAuth();
  return user?.role || null;
};

// Usage in components
const AnalyticsPage: React.FC = () => {
  const canView = usePermission('analytics', 'view');
  const canExport = usePermission('analytics', 'export');
  const role = useRole();

  if (!canView) {
    return <AccessDenied />;
  }

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      {canExport && <ExportButton />}
      {role === 'hotel-manager' && <AdvancedControls />}
    </div>
  );
};
```

---

## 🔧 Configuration Management

### **Menu Configuration:**

```typescript
export const ROLE_MENU_CONFIG: Record<UserRole, MenuItemConfig[]> = {
  'hotel-manager': [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/dashboard',
      module: 'dashboard',
      requiredAction: 'view',
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: 'chart',
      path: '/analytics',
      module: 'analytics',
      requiredAction: 'view',
      children: [
        {
          key: 'overview',
          label: 'Overview',
          path: '/analytics/overview',
          module: 'analytics',
          requiredAction: 'view',
        },
        {
          key: 'advanced',
          label: 'Advanced',
          path: '/analytics/advanced',
          module: 'analytics',
          requiredAction: 'view_advanced',
        },
      ],
    },
  ],

  'front-desk': [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/dashboard',
      module: 'dashboard',
      requiredAction: 'view',
    },
    {
      key: 'guests',
      label: 'Guest Management',
      icon: 'users',
      path: '/guests',
      module: 'guests',
      requiredAction: 'view',
    },
  ],
};
```

### **Default Permissions:**

```typescript
export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  'hotel-manager': [
    { module: 'dashboard', action: 'view', allowed: true },
    { module: 'dashboard', action: 'edit', allowed: true },
    { module: 'analytics', action: 'view', allowed: true },
    { module: 'analytics', action: 'export', allowed: true },
    { module: 'staff', action: 'manage', allowed: true },
    // ... more permissions
  ],

  'front-desk': [
    { module: 'dashboard', action: 'view', allowed: true },
    { module: 'guests', action: 'view', allowed: true },
    { module: 'guests', action: 'checkin', allowed: true },
    { module: 'guests', action: 'checkout', allowed: true },
    // ... more permissions
  ],
};
```

---

## 🧪 Testing RBAC

### **Permission Testing:**

```typescript
describe('RBAC Permission System', () => {
  test('hotel-manager should have analytics access', () => {
    const hotelManager: AuthUser = createMockUser('hotel-manager');

    const canView = PermissionService.hasPermission(hotelManager, 'analytics', 'view');
    const canExport = PermissionService.hasPermission(hotelManager, 'analytics', 'export');

    expect(canView).toBe(true);
    expect(canExport).toBe(true);
  });

  test('front-desk should not have staff management access', () => {
    const frontDesk: AuthUser = createMockUser('front-desk');

    const canManageStaff = PermissionService.hasPermission(frontDesk, 'staff', 'manage');

    expect(canManageStaff).toBe(false);
  });
});
```

### **Middleware Testing:**

```typescript
describe('RBAC Middleware', () => {
  test('should allow access with correct permission', async () => {
    const req = createMockRequest({
      user: createMockUser('hotel-manager'),
    });
    const res = createMockResponse();
    const next = jest.fn();

    const middleware = requirePermission('analytics', 'view');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should deny access without permission', async () => {
    const req = createMockRequest({
      user: createMockUser('front-desk'),
    });
    const res = createMockResponse();
    const next = jest.fn();

    const middleware = requirePermission('staff', 'manage');
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
```

---

## 🚨 Security Considerations

### **1. Principle of Least Privilege:**

- Users should have only the minimum permissions needed
- Default to deny access
- Regularly audit and review permissions

### **2. Role Segregation:**

- Clear separation between operational and administrative roles
- IT managers shouldn't have billing access
- Front desk shouldn't have system administration access

### **3. Permission Validation:**

- Always validate permissions on both frontend and backend
- Never trust client-side permission checks alone
- Implement defense in depth

### **4. Audit Trail:**

```typescript
class AuditService {
  static async logPermissionCheck(
    userId: string,
    module: string,
    action: string,
    granted: boolean
  ): Promise<void> {
    await db.insert(auditLog).values({
      userId,
      action: 'PERMISSION_CHECK',
      details: { module, action, granted },
      timestamp: new Date(),
      ipAddress: getCurrentIP(),
    });
  }
}
```

---

## 📚 Best Practices

### **1. Role Design:**

- Design roles based on job functions, not individuals
- Keep role hierarchy simple and intuitive
- Use descriptive role names

### **2. Permission Granularity:**

- Balance between too granular and too coarse
- Group related permissions logically
- Consider future extensibility

### **3. Error Handling:**

```typescript
// Graceful permission errors
const handlePermissionError = (error: PermissionError) => {
  // Don't reveal what exists
  if (error.type === 'RESOURCE_NOT_FOUND') {
    return 'Resource not found';
  }

  // Generic permission message
  return 'You do not have permission to access this resource';
};
```

### **4. Documentation:**

- Document all roles and permissions
- Keep role descriptions up to date
- Provide clear examples

---

**📝 Last Updated**: July 20, 2024  
**🔗 Related**: [Auth API](./AUTH_API.md) | [JWT Guide](./JWT_GUIDE.md) |
[Deployment Guide](./DEPLOYMENT.md)
