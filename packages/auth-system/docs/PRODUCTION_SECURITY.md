# 🔒 Production Security Configuration Guide

## 🚨 **CRITICAL PRODUCTION CHECKLIST**

### ✅ **Environment Variables Required**

```bash
# ============================================
# JWT SECRETS (CRITICAL - MUST BE STRONG)
# ============================================
JWT_SECRET=your-super-strong-32-character-secret-here-minimum
JWT_REFRESH_SECRET=your-different-32-character-refresh-secret

# ============================================
# DATABASE & ENVIRONMENT
# ============================================
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:5432/database

# ============================================
# OPTIONAL SECURITY ENHANCEMENTS
# ============================================
COOKIE_DOMAIN=.yourdomain.com
BCRYPT_ROUNDS=14

# ============================================
# EMAIL SERVICE (for verification/reset)
# ============================================
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password
```

---

## 🔐 **Production Security Features (AUTO-ENABLED)**

### **Password Requirements**

```typescript
✅ Minimum 12 characters (increased from 8)
✅ Must contain uppercase letters
✅ Must contain lowercase letters
✅ Must contain numbers
✅ Must contain special characters
✅ Password history - prevents reusing last 5 passwords
✅ Password expiry - force change every 90 days
```

### **Session Security**

```typescript
✅ Access tokens expire in 15 minutes (vs 1 hour in dev)
✅ Remember-me tokens expire in 14 days (vs 30 days in dev)
✅ IP address binding for tokens
✅ User-Agent fingerprinting
✅ Absolute session timeout (8 hours max)
✅ Refresh token rotation on every use
```

### **Rate Limiting**

```typescript
✅ Login attempts: 5 per minute (reduced from 10)
✅ Registration: 3 per IP per hour
✅ Password reset: 3 per email per hour
✅ Progressive lockout duration
✅ CAPTCHA after 3 failed attempts
```

### **Monitoring & Auditing**

```typescript
✅ All failed login attempts logged
✅ Suspicious activity detection
✅ Geolocation tracking for logins
✅ Alert system for multiple failures
✅ Device fingerprinting
```

---

## 🛡️ **Security Headers & Middleware**

### **Required Security Headers**

```javascript
// Add these to your Express app
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  next();
});
```

### **CORS Configuration**

```javascript
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "https://yourdomain.com",
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
```

---

## 🚀 **Deployment Security Checklist**

### **Before Deployment**

- [ ] All JWT secrets are 32+ characters and randomly generated
- [ ] Environment variables are properly set
- [ ] Database connections use SSL
- [ ] Email service is configured for verification/reset
- [ ] Security headers are configured
- [ ] HTTPS is enforced (SSL certificate)
- [ ] Rate limiting is tested
- [ ] Error messages don't leak sensitive information

### **Post Deployment**

- [ ] Test all authentication flows
- [ ] Verify password requirements work
- [ ] Test rate limiting functionality
- [ ] Check security headers in browser
- [ ] Monitor logs for errors
- [ ] Test email verification/password reset
- [ ] Verify token expiration works correctly

---

## 📊 **Security Monitoring**

### **Key Metrics to Monitor**

- Failed login attempt frequency
- Account lockout incidents
- Password reset request patterns
- Unusual login locations/times
- Multiple concurrent sessions
- Token validation failures

### **Alert Thresholds**

- 10+ failed attempts from same IP: ALERT
- 5+ password reset requests from same email in 1 hour: ALERT
- Login from new country/location: NOTIFY
- Multiple concurrent sessions beyond limit: ALERT

---

## 🔧 **Advanced Security Options**

### **Two-Factor Authentication (Future)**

```typescript
// Placeholder - ready for 2FA implementation
SECURITY_CONFIG.TWO_FACTOR_AVAILABLE = false; // Set to true when ready
```

### **Custom Rate Limiting**

```typescript
// Adjust these based on your needs
SECURITY_CONFIG.LOGIN_RATE_LIMIT = 3; // More restrictive
SECURITY_CONFIG.LOGIN_RATE_WINDOW = 300000; // 5 minutes
```

### **Session Management**

```typescript
// Reduce concurrent sessions for higher security
SECURITY_CONFIG.MAX_CONCURRENT_SESSIONS = 1; // Only 1 session
```

---

## ⚠️ **Development vs Production Differences**

| Feature               | Development       | Production                     |
| --------------------- | ----------------- | ------------------------------ |
| Password Requirements | Relaxed (8 chars) | Strict (12 chars + complexity) |
| Token Expiry          | 1 hour            | 15 minutes                     |
| IP Binding            | Disabled          | Enabled                        |
| Rate Limiting         | Relaxed           | Strict                         |
| Session Security      | Basic             | Enhanced                       |
| Monitoring            | Minimal           | Comprehensive                  |

---

## 🆘 **Emergency Procedures**

### **Security Breach Response**

1. **Immediate**: Invalidate all active sessions
2. **Force**: Password reset for all users
3. **Review**: Authentication logs for suspicious activity
4. **Update**: JWT secrets and redeploy
5. **Monitor**: For continued suspicious activity

### **Mass Logout (Emergency)**

```typescript
// Emergency: Clear all active sessions
await UnifiedAuthService.invalidateAllSessions();
```

---

**🔒 Security is not a one-time setup - continuously monitor and update your security measures!**
