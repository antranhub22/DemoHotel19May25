# 🔐 Auth System API Documentation

## 📋 Overview

Complete API reference for the DemoHotel19May authentication system, including JWT authentication,
RBAC, and multi-tenant support.

---

## 🚀 Base Configuration

### **Import Structure:**

```typescript
// Main auth system import
import { UnifiedAuthService, authenticateJWT, AuthUser } from './auth-system';

// Specific imports
import { AuthUser, JWTPayload } from './auth-system/types';
import { JWT_CONFIG } from './auth-system/config';
import { authenticateJWT } from './auth-system/middleware';
```

### **Environment Variables:**

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-key

# Optional
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
```

---

## 🔑 Core Services

### **UnifiedAuthService**

#### `login(credentials: LoginCredentials): Promise<AuthResult>`

Authenticate user with username/email and password.

**Parameters:**

```typescript
interface LoginCredentials {
  username?: string; // Primary login method
  email?: string; // Alternative login method
  password: string; // Required password
  tenantId?: string; // Optional tenant specification
  rememberMe?: boolean; // Extended session option
}
```

**Returns:**

```typescript
interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string; // Access token (JWT)
  refreshToken?: string; // Refresh token
  expiresIn?: number; // Token expiration (seconds)
  tokenType?: string; // Usually "Bearer"
  error?: string; // Error message if failed
  errorCode?: string; // Error code for programmatic handling
}
```

**Example:**

```typescript
const result = await UnifiedAuthService.login({
  username: 'admin',
  password: 'admin123',
  rememberMe: true,
});

if (result.success) {
  console.log('Logged in:', result.user);
  localStorage.setItem('token', result.token!);
} else {
  console.error('Login failed:', result.error);
}
```

---

#### `verifyToken(token: string): Promise<AuthUser | null>`

Verify and decode JWT token.

**Parameters:**

- `token`: JWT access token string

**Returns:**

- `AuthUser` object if valid
- `null` if invalid or expired

**Example:**

```typescript
const user = await UnifiedAuthService.verifyToken(token);
if (user) {
  console.log('Valid user:', user.username);
} else {
  console.log('Invalid token');
}
```

---

#### `refreshToken(refreshToken: string): Promise<AuthResult>`

Generate new access token using refresh token.

**Parameters:**

- `refreshToken`: Valid refresh token string

**Returns:**

- New `AuthResult` with fresh tokens

**Example:**

```typescript
const result = await UnifiedAuthService.refreshToken(oldRefreshToken);
if (result.success) {
  localStorage.setItem('token', result.token!);
}
```

---

#### `logout(token: string): Promise<{ success: boolean }>`

Invalidate token and add to blacklist.

**Parameters:**

- `token`: Token to invalidate

**Returns:**

- Success status

**Example:**

```typescript
await UnifiedAuthService.logout(currentToken);
localStorage.removeItem('token');
```

---

#### `hasPermission(user: AuthUser, module: string, action: string): boolean`

Check if user has specific permission.

**Parameters:**

- `user`: AuthUser object
- `module`: Permission module (e.g., 'dashboard', 'analytics')
- `action`: Permission action (e.g., 'view', 'edit', 'delete')

**Returns:**

- Boolean permission result

**Example:**

```typescript
const canEdit = UnifiedAuthService.hasPermission(user, 'dashboard', 'edit');
if (canEdit) {
  // Show edit controls
}
```

---

## 🛡️ Middleware

### **authenticateJWT**

Express middleware for JWT authentication.

**Usage:**

```typescript
import { authenticateJWT } from './auth-system/middleware';

// Protect single route
app.get('/api/protected', authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});

// Protect multiple routes
app.use('/api/admin', authenticateJWT);
```

**Request Extensions:**

```typescript
interface AuthenticatedRequest extends Request {
  user: AuthUser; // Authenticated user object
  tenant: {
    // Tenant information
    id: string;
    hotelName: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
  };
}
```

---

### **requireRole(role: UserRole)**

Middleware for role-based access control.

**Usage:**

```typescript
import { requireRole } from './auth-system/middleware';

// Require specific role
app.get('/api/admin', [authenticateJWT, requireRole('admin')], handler);

// Convenience combinations
app.get('/api/admin', authMiddleware.adminOnly, handler);
app.get('/api/manager', authMiddleware.managerOrHigher, handler);
```

---

### **requirePermission(module: string, action: string)**

Middleware for permission-based access control.

**Usage:**

```typescript
import { requirePermission } from './auth-system/middleware';

// Check specific permission
app.get('/api/analytics', [authenticateJWT, requirePermission('analytics', 'view')], handler);

// Convenience method
app.get('/api/analytics', authMiddleware.withPermission('analytics', 'view'), handler);
```

---

## 🎭 User Roles & Permissions

### **Available Roles:**

```typescript
type UserRole =
  | 'hotel-manager' // Full hotel management access
  | 'front-desk' // Guest service operations
  | 'it-manager' // System administration
  | 'admin' // Legacy: Full system access
  | 'staff' // Legacy: Basic operations
  | 'manager' // Legacy: Management operations
  | 'super-admin'; // Legacy: System-wide access
```

### **Permission Modules:**

- `dashboard` - Dashboard access and configuration
- `analytics` - Data analytics and reporting
- `billing` - Billing and subscription management
- `staff` - Staff management and invitations
- `settings` - Hotel settings and configuration
- `calls` - Voice call management and monitoring
- `system` - System administration and monitoring
- `assistant` - Voice assistant configuration
- `notifications` - Notification management
- `requests` - Guest request management
- `guests` - Guest management and check-in/out
- `security` - Security settings and access control
- `integrations` - Third-party integrations
- `logs` - System logs and debugging

### **Permission Actions:**

- `view` - Read access
- `edit` - Modify access
- `delete` - Delete access
- `create` - Create new items
- `manage` - Full management access
- `export` - Export data
- `debug` - Debug and troubleshoot
- `monitor` - Monitor system status

---

## 🔧 Configuration

### **JWT Configuration:**

```typescript
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET,
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: '1h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  REMEMBER_ME_EXPIRES_IN: '30d',
  ALGORITHM: 'HS256' as const,
  ISSUER: 'DemoHotel19May',
  AUDIENCE: 'hotel-voice-assistant',
};
```

### **Security Configuration:**

```typescript
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  BLACKLIST_CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
  PASSWORD_MIN_LENGTH: 8,
  REQUIRE_STRONG_PASSWORDS: true,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};
```

---

## 🧪 Testing Examples

### **Unit Testing:**

```typescript
import { UnifiedAuthService } from './auth-system/services';

describe('UnifiedAuthService', () => {
  test('should login with valid credentials', async () => {
    const result = await UnifiedAuthService.login({
      username: 'testuser',
      password: 'testpass',
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.token).toBeDefined();
  });

  test('should reject invalid credentials', async () => {
    const result = await UnifiedAuthService.login({
      username: 'testuser',
      password: 'wrongpass',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### **Integration Testing:**

```typescript
import request from 'supertest';
import app from './app';

describe('Auth Integration', () => {
  test('should authenticate and access protected route', async () => {
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(loginRes.status).toBe(200);
    const { token } = loginRes.body;

    // Access protected route
    const protectedRes = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(protectedRes.status).toBe(200);
  });
});
```

---

## 🚨 Error Handling

### **Error Codes:**

```typescript
type AuthErrorCode =
  | 'INVALID_CREDENTIALS' // Wrong username/password
  | 'USER_INACTIVE' // Account disabled
  | 'TOKEN_EXPIRED' // Token has expired
  | 'TOKEN_INVALID' // Invalid token format
  | 'TOKEN_BLACKLISTED' // Token has been revoked
  | 'INSUFFICIENT_PERMISSIONS' // Missing required permissions
  | 'TENANT_NOT_FOUND' // Invalid tenant
  | 'SERVER_ERROR' // Internal server error
  | 'VALIDATION_ERROR'; // Input validation failed
```

### **Error Response Format:**

```typescript
{
  success: false,
  error: "Human-readable error message",
  code: "ERROR_CODE",
  details?: any  // Additional error details
}
```

---

## 🔄 Migration Guide

### **From Old System:**

```typescript
// OLD:
import { AuthUser } from '@shared/types/auth';
import { JWT_CONFIG } from '@config/auth.config';
import { UnifiedAuthService } from '../../services/auth/UnifiedAuthService.v2';

// NEW:
import { AuthUser, JWT_CONFIG, UnifiedAuthService } from './auth-system';
```

### **Path Aliases:**

Add to `tsconfig.json`:

```json
{
  "paths": {
    "@auth/*": ["./auth-system/*"],
    "@auth/types": ["./auth-system/types"],
    "@auth/config": ["./auth-system/config"],
    "@auth/services": ["./auth-system/services"],
    "@auth/middleware": ["./auth-system/middleware"]
  }
}
```

---

**📝 Last Updated**: July 20, 2024  
**🔗 Related**: [JWT Guide](./JWT_GUIDE.md) | [RBAC Guide](./RBAC_GUIDE.md) |
[Deployment Guide](./DEPLOYMENT.md)
