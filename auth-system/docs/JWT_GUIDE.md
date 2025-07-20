# 🔑 JWT Implementation Guide

## 📋 Overview

Complete guide for implementing and using JWT (JSON Web Tokens) in the DemoHotel19May auth system.

---

## 🏗️ JWT Architecture

### **Token Types:**
1. **Access Token** - Short-lived (1 hour), used for API requests
2. **Refresh Token** - Long-lived (7 days), used to get new access tokens
3. **Remember Me Token** - Extended-lived (30 days), for persistent sessions

### **Token Flow:**
```
Login → Access Token (1h) + Refresh Token (7d)
↓
Access Token Expires → Use Refresh Token → New Access Token
↓
Refresh Token Expires → Re-login Required
```

---

## 🔧 JWT Configuration

### **Core Settings:**
```typescript
export const JWT_CONFIG = {
  // Secrets
  SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  
  // Expiration
  ACCESS_TOKEN_EXPIRES_IN: '1h',      // Short-lived
  REFRESH_TOKEN_EXPIRES_IN: '7d',     // Long-lived
  REMEMBER_ME_EXPIRES_IN: '30d',      // Extended session
  
  // JWT Claims
  ISSUER: 'DemoHotel19May',
  AUDIENCE: 'hotel-voice-assistant',
  ALGORITHM: 'HS256' as const,
  
  // Cookie Settings (for refresh tokens)
  COOKIE_NAME: 'refresh_token',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_HTTP_ONLY: true,
  COOKIE_SAME_SITE: 'strict' as const
};
```

---

## 📝 JWT Payload Structure

### **Standard JWT Payload:**
```typescript
interface JWTPayload {
  // Core user identification
  userId: string;           // Primary user ID
  username: string;         // Login identifier
  email: string | null;     // User email (nullable)
  
  // Role & permissions
  role: UserRole;           // User role
  permissions: Permission[]; // Specific permissions array
  
  // Multi-tenant support
  tenantId: string;         // Tenant/hotel ID
  hotelId?: string;         // Legacy compatibility
  
  // JWT standard claims
  iat: number;              // Issued at (timestamp)
  exp: number;              // Expires at (timestamp)
  jti?: string;             // JWT ID (for token invalidation)
  iss?: string;             // Issuer
  aud?: string;             // Audience
}
```

### **Example Token Payload:**
```json
{
  "userId": "user-uuid-123",
  "username": "admin",
  "email": "admin@hotel.com",
  "role": "hotel-manager",
  "permissions": [
    {"module": "dashboard", "action": "view", "allowed": true},
    {"module": "analytics", "action": "view", "allowed": true}
  ],
  "tenantId": "mi-nhon-hotel",
  "hotelId": "mi-nhon-hotel",
  "iat": 1642684800,
  "exp": 1642688400,
  "jti": "user-123-1642684800-abc123",
  "iss": "DemoHotel19May",
  "aud": "hotel-voice-assistant"
}
```

---

## 🔐 Token Generation

### **Creating Access Token:**
```typescript
const generateAccessToken = (user: AuthUser, rememberMe = false): string => {
  const now = Math.floor(Date.now() / 1000);
  const jti = `${user.id}-${now}-${Math.random().toString(36).substr(2, 9)}`;

  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    tenantId: user.tenantId,
    hotelId: user.tenantId, // Backward compatibility
    iat: now,
    exp: now + getExpirationTime(JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN),
    jti: `${jti}-access`,
    iss: JWT_CONFIG.ISSUER,
    aud: JWT_CONFIG.AUDIENCE
  };

  return jwt.sign(payload, JWT_CONFIG.SECRET, { 
    algorithm: JWT_CONFIG.ALGORITHM 
  });
};
```

### **Creating Refresh Token:**
```typescript
const generateRefreshToken = (user: AuthUser, rememberMe = false): string => {
  const now = Math.floor(Date.now() / 1000);
  const jti = `${user.id}-${now}-${Math.random().toString(36).substr(2, 9)}`;
  
  const expiry = rememberMe 
    ? JWT_CONFIG.REMEMBER_ME_EXPIRES_IN 
    : JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN;

  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    tenantId: user.tenantId,
    hotelId: user.tenantId,
    iat: now,
    exp: now + getExpirationTime(expiry),
    jti: `${jti}-refresh`,
    iss: JWT_CONFIG.ISSUER,
    aud: JWT_CONFIG.AUDIENCE
  };

  return jwt.sign(payload, JWT_CONFIG.REFRESH_SECRET, { 
    algorithm: JWT_CONFIG.ALGORITHM 
  });
};
```

---

## ✅ Token Validation

### **Verifying Access Token:**
```typescript
const verifyAccessToken = (token: string): TokenValidationResult => {
  try {
    const options: jwt.VerifyOptions = { 
      algorithms: [JWT_CONFIG.ALGORITHM],
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE
    };

    const decoded = jwt.verify(token, JWT_CONFIG.SECRET, options) as JWTPayload;
    
    return {
      valid: true,
      payload: decoded
    };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        expired: true,
        error: 'Token expired'
      };
    }
    
    return {
      valid: false,
      error: error.message || 'Invalid token'
    };
  }
};
```

### **Validation Result Interface:**
```typescript
interface TokenValidationResult {
  valid: boolean;
  payload?: JWTPayload;
  expired?: boolean;
  error?: string;
}
```

---

## 🚫 Token Blacklisting

### **Blacklist Management:**
```typescript
class TokenBlacklist {
  private static blacklistedTokens = new Set<string>();
  private static lastCleanup = Date.now();

  static addToken(jti: string): void {
    this.blacklistedTokens.add(jti);
    this.cleanup();
  }

  static isBlacklisted(jti: string): boolean {
    this.cleanup();
    return this.blacklistedTokens.has(jti);
  }

  private static cleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup > SECURITY_CONFIG.BLACKLIST_CLEANUP_INTERVAL) {
      // In production, use Redis or database storage
      this.blacklistedTokens.clear();
      this.lastCleanup = now;
    }
  }
}
```

### **Using Blacklist:**
```typescript
// During token verification
if (payload.jti && TokenBlacklist.isBlacklisted(payload.jti)) {
  return null; // Token is blacklisted
}

// During logout
if (payload.jti) {
  TokenBlacklist.addToken(payload.jti);
}
```

---

## 🔄 Token Refresh Flow

### **Frontend Token Refresh:**
```typescript
class AuthService {
  private refreshTokenPromise: Promise<AuthResult> | null = null;

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = this.doRefreshToken(refreshToken);
    const result = await this.refreshTokenPromise;
    this.refreshTokenPromise = null;
    
    return result;
  }

  private async doRefreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update stored tokens
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        return data;
      } else {
        // Refresh failed, redirect to login
        this.logout();
        throw new Error(data.error);
      }
    } catch (error) {
      this.logout();
      throw error;
    }
  }
}
```

### **Automatic Token Refresh (Axios Interceptor):**
```typescript
import axios from 'axios';

// Request interceptor - add token to headers
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const authService = new AuthService();
          const result = await authService.refreshToken(refreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${result.token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## 🔒 Security Best Practices

### **1. Secret Management:**
```bash
# Production secrets should be:
# - At least 32 characters long
# - Cryptographically random
# - Different for access and refresh tokens
# - Rotated regularly

# Generate secure secret:
openssl rand -base64 32
```

### **2. Token Storage:**
```typescript
// ✅ SECURE - HttpOnly cookies for refresh tokens
res.cookie(JWT_CONFIG.COOKIE_NAME, refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: JWT_CONFIG.COOKIE_MAX_AGE
});

// ✅ ACCEPTABLE - localStorage for access tokens (short-lived)
localStorage.setItem('token', accessToken);

// ❌ AVOID - localStorage for refresh tokens
// localStorage.setItem('refreshToken', refreshToken); // Don't do this
```

### **3. Token Validation:**
```typescript
// Always verify:
// - Token signature
// - Token expiration
// - Token issuer and audience
// - Token not in blacklist
// - User still exists and is active

const validateToken = async (token: string): Promise<AuthUser | null> => {
  // 1. Verify JWT signature and claims
  const validation = verifyAccessToken(token);
  if (!validation.valid || !validation.payload) {
    return null;
  }

  // 2. Check blacklist
  if (validation.payload.jti && TokenBlacklist.isBlacklisted(validation.payload.jti)) {
    return null;
  }

  // 3. Verify user still exists and is active
  const user = await findUserById(validation.payload.userId);
  if (!user || !user.isActive) {
    return null;
  }

  return createAuthUserFromDbUser(user);
};
```

### **4. Rate Limiting:**
```typescript
// Implement rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/auth/login', authRateLimit, loginHandler);
app.post('/api/auth/refresh', authRateLimit, refreshHandler);
```

---

## 🧪 Testing JWT Implementation

### **Unit Tests:**
```typescript
describe('JWT Token Generation', () => {
  test('should generate valid access token', () => {
    const user = createMockUser();
    const token = generateAccessToken(user);
    
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as JWTPayload;
    
    expect(decoded.userId).toBe(user.id);
    expect(decoded.username).toBe(user.username);
    expect(decoded.role).toBe(user.role);
    expect(decoded.iss).toBe(JWT_CONFIG.ISSUER);
    expect(decoded.aud).toBe(JWT_CONFIG.AUDIENCE);
  });

  test('should reject expired token', () => {
    const expiredToken = jwt.sign(
      { userId: '123', exp: Math.floor(Date.now() / 1000) - 3600 },
      JWT_CONFIG.SECRET
    );

    const validation = verifyAccessToken(expiredToken);
    expect(validation.valid).toBe(false);
    expect(validation.expired).toBe(true);
  });
});
```

### **Integration Tests:**
```typescript
describe('Token Refresh Flow', () => {
  test('should refresh expired access token', async () => {
    // 1. Login to get tokens
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test' });
    
    const { refreshToken } = loginRes.body;

    // 2. Refresh token
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.token).toBeDefined();
  });
});
```

---

## 🚨 Common Issues & Troubleshooting

### **1. "Invalid Token" Errors:**
```typescript
// Check:
// - Token format (Bearer token)
// - Token not expired
// - Correct secret used
// - Issuer/audience match
// - User still exists

const debugToken = (token: string) => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    console.log('Token header:', decoded?.header);
    console.log('Token payload:', decoded?.payload);
    console.log('Token expires:', new Date((decoded?.payload as any)?.exp * 1000));
  } catch (error) {
    console.error('Token decode error:', error);
  }
};
```

### **2. "Token Expired" Errors:**
```typescript
// Implement automatic token refresh
const handleTokenExpired = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      const newTokens = await refreshAccessToken(refreshToken);
      localStorage.setItem('token', newTokens.token);
      return newTokens.token;
    } catch (error) {
      // Refresh failed, logout user
      logout();
      redirectToLogin();
    }
  }
};
```

### **3. Clock Skew Issues:**
```typescript
// Add clock tolerance for token validation
const verifyOptions: jwt.VerifyOptions = {
  algorithms: [JWT_CONFIG.ALGORITHM],
  issuer: JWT_CONFIG.ISSUER,
  audience: JWT_CONFIG.AUDIENCE,
  clockTolerance: 60 // 60 seconds tolerance
};
```

---

## 📚 Additional Resources

- **JWT.io** - Debug and inspect tokens
- **RFC 7519** - JWT specification
- **OWASP JWT Security** - Security best practices
- **Node.js jsonwebtoken** - Library documentation

---

**📝 Last Updated**: July 20, 2024  
**🔗 Related**: [Auth API](./AUTH_API.md) | [RBAC Guide](./RBAC_GUIDE.md) | [Deployment Guide](./DEPLOYMENT.md) 