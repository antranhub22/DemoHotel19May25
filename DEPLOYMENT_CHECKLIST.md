# 🚀 DEPLOYMENT CHECKLIST - Multi-Tenant SaaS Hotel Assistant Platform

## 📋 Overview

This checklist ensures safe and successful deployment of the multi-tenant SaaS hotel assistant platform from the current Mi Nhon Hotel MVP to a full multi-tenant system.

## 🎯 Pre-Deployment Requirements

### ✅ Code & Environment Verification
- [ ] All code changes merged to `DASHBOARD-MASTER` branch
- [ ] Environment configuration validated: `npm run env:validate`
- [ ] All tests passing: `npm run test:all`
- [ ] Migration tests completed: `npm run migration:test:pre-deploy`
- [ ] Integration tests passed: `npm run test:integration pre-deploy`

### ✅ API Keys & Services Ready
- [ ] **OpenAI API Key** - Active with billing configured
- [ ] **Vapi API Key** - Both public key and API key for dynamic creation
- [ ] **Google Places API Key** - Enabled and quota configured
- [ ] **Database** - PostgreSQL instance configured and accessible
- [ ] **Domain** - DNS management access for subdomain configuration

---

## 🔧 STAGING DEPLOYMENT

### 1. Database Migration Steps

#### 1.1 Pre-Migration Backup
```bash
# Create staging database backup
pg_dump $STAGING_DATABASE_URL > staging-backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup size and integrity
ls -lh staging-backup-*.sql
```

#### 1.2 Run Migration Test
```bash
# Test migration in dry-run mode
npm run migration:test:dry-run

# Run full migration test
npm run migration:test:production
```

#### 1.3 Execute Migration
```bash
# Run database migration
npm run db:migrate

# Verify migration success
npm run migration:verify
```

#### 1.4 Create Mi Nhon Tenant
```bash
# Create Mi Nhon Hotel as first tenant
npm run seed:minhon-tenant

# Verify tenant creation
npm run db:verify-tenant
```

### 2. Environment Variable Updates

#### 2.1 Core Environment Variables
```bash
# Core Settings
NODE_ENV=staging
PORT=10000
CLIENT_URL=https://staging.talk2go.online

# Database
DATABASE_URL=postgresql://user:pass@staging-db:5432/hotel_assistant

# Authentication
JWT_SECRET=your-staging-jwt-secret-32-chars-min
STAFF_ACCOUNTS=admin@staging.com:StrongPassword123

# OpenAI
VITE_OPENAI_API_KEY=sk-your-openai-api-key
VITE_OPENAI_PROJECT_ID=proj_your-openai-project-id

# Vapi Integration
VITE_VAPI_PUBLIC_KEY=pk_your-vapi-public-key
VITE_VAPI_ASSISTANT_ID=asst_your-vapi-assistant-id
VAPI_API_KEY=your-vapi-api-key-for-dynamic-creation

# SaaS Features
GOOGLE_PLACES_API_KEY=your-google-places-api-key
TALK2GO_DOMAIN=staging.talk2go.online
SUBDOMAIN_SUFFIX=.staging.talk2go.online

# Multi-tenant
MINHON_TENANT_ID=minhon-staging-tenant-id

# Feature Flags
ENABLE_HOTEL_RESEARCH=true
ENABLE_DYNAMIC_ASSISTANT_CREATION=true
ENABLE_MULTI_LANGUAGE_SUPPORT=true
ENABLE_ANALYTICS_DASHBOARD=true
ENABLE_BILLING_SYSTEM=false
```

#### 2.2 Validate Environment
```bash
# Validate all environment variables
npm run env:health

# Test API connections
npm run env:test-apis

# Test database connection
npm run env:test-db
```

### 3. DNS Configuration for Subdomains

#### 3.1 DNS Records Setup
```bash
# Main domain
staging.talk2go.online    A    [IP_ADDRESS]

# Wildcard subdomain for tenants
*.staging.talk2go.online  A    [IP_ADDRESS]

# Specific tenant subdomains (examples)
minhon.staging.talk2go.online     A    [IP_ADDRESS]
demo.staging.talk2go.online       A    [IP_ADDRESS]
```

#### 3.2 SSL Certificate Configuration
```bash
# Configure SSL for wildcard domain
certbot certonly --dns-cloudflare \
  -d staging.talk2go.online \
  -d *.staging.talk2go.online

# Update environment variables
SSL_CERT_PATH=/etc/letsencrypt/live/staging.talk2go.online/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/staging.talk2go.online/privkey.pem
```

### 4. Verification Steps

#### 4.1 Database Verification
```bash
# Check database structure
npm run db:verify

# Verify tenant data
npm run db:verify-tenants

# Check data integrity
npm run db:check-integrity
```

#### 4.2 Application Verification
```bash
# Start application
npm run start:staging

# Health check
curl https://staging.talk2go.online/api/health

# Test Mi Nhon Hotel functionality
curl https://minhon.staging.talk2go.online/api/health
```

#### 4.3 Feature Testing
```bash
# Test hotel research
npm run test:hotel-research:staging

# Test tenant creation
npm run test:tenant-creation:staging

# Test dashboard APIs
npm run test:dashboard:staging
```

### 5. Rollback Procedures (if needed)

#### 5.1 Database Rollback
```bash
# Stop application
npm run stop:staging

# Restore database backup
psql $STAGING_DATABASE_URL < staging-backup-TIMESTAMP.sql

# Verify rollback
npm run db:verify-rollback
```

#### 5.2 Application Rollback
```bash
# Revert to previous deployment
git checkout [PREVIOUS_COMMIT]

# Deploy previous version
npm run deploy:staging:rollback

# Verify application works
curl https://staging.talk2go.online/api/health
```

---

## 🚀 PRODUCTION DEPLOYMENT

### 1. Database Migration Steps

#### 1.1 Pre-Migration Backup
```bash
# Create production database backup
pg_dump $PRODUCTION_DATABASE_URL > production-backup-$(date +%Y%m%d-%H%M%S).sql

# Store backup in secure location
aws s3 cp production-backup-*.sql s3://hotel-assistant-backups/

# Verify backup integrity
pg_restore --list production-backup-*.sql | head -20
```

#### 1.2 Maintenance Window Setup
```bash
# Set maintenance mode
echo "MAINTENANCE_MODE=true" >> .env

# Deploy maintenance page
npm run deploy:maintenance

# Notify users via email/SMS
npm run notify:maintenance-start
```

#### 1.3 Run Migration Test
```bash
# Final migration test with production data
npm run migration:test:production

# Verify test results
npm run migration:verify-test-results
```

#### 1.4 Execute Migration
```bash
# Run database migration
npm run db:migrate:production

# Verify migration success
npm run migration:verify:production
```

#### 1.5 Create Mi Nhon Tenant
```bash
# Create Mi Nhon Hotel as first tenant with production data
npm run seed:minhon-tenant:production

# Verify tenant creation and data migration
npm run db:verify-tenant:production
```

### 2. Environment Variable Updates

#### 2.1 Production Environment Variables
```bash
# Core Settings
NODE_ENV=production
PORT=10000
CLIENT_URL=https://talk2go.online

# Database
DATABASE_URL=postgresql://user:pass@prod-db:5432/hotel_assistant

# Authentication
JWT_SECRET=your-production-jwt-secret-minimum-32-chars
STAFF_ACCOUNTS=admin@talk2go.online:VeryStrongPassword123

# OpenAI
VITE_OPENAI_API_KEY=sk-your-production-openai-api-key
VITE_OPENAI_PROJECT_ID=proj_your-production-openai-project-id

# Vapi Integration
VITE_VAPI_PUBLIC_KEY=pk_your-production-vapi-public-key
VITE_VAPI_ASSISTANT_ID=asst_your-production-vapi-assistant-id
VAPI_API_KEY=your-production-vapi-api-key-for-dynamic-creation

# SaaS Features
GOOGLE_PLACES_API_KEY=your-production-google-places-api-key
TALK2GO_DOMAIN=talk2go.online
SUBDOMAIN_SUFFIX=.talk2go.online

# Multi-tenant
MINHON_TENANT_ID=minhon-production-tenant-id

# Feature Flags
ENABLE_HOTEL_RESEARCH=true
ENABLE_DYNAMIC_ASSISTANT_CREATION=true
ENABLE_MULTI_LANGUAGE_SUPPORT=true
ENABLE_ANALYTICS_DASHBOARD=true
ENABLE_BILLING_SYSTEM=true

# Production Security
CORS_ORIGIN=https://talk2go.online
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=your-production-session-secret-minimum-32-chars
SSL_CERT_PATH=/etc/letsencrypt/live/talk2go.online/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/talk2go.online/privkey.pem

# Monitoring
SENTRY_DSN=your-production-sentry-dsn
GOOGLE_ANALYTICS_ID=your-production-google-analytics-id
LOG_LEVEL=info
```

#### 2.2 Validate Production Environment
```bash
# Comprehensive environment validation
npm run env:validate-production

# Test all API connections
npm run env:test-apis:production

# Database connectivity test
npm run env:test-db:production
```

### 3. DNS Configuration for Subdomains

#### 3.1 Production DNS Records
```bash
# Main domain
talk2go.online              A    [PRODUCTION_IP]
www.talk2go.online          CNAME talk2go.online

# Wildcard subdomain for tenants
*.talk2go.online            A    [PRODUCTION_IP]

# Specific tenant subdomains
minhon.talk2go.online       A    [PRODUCTION_IP]
demo.talk2go.online         A    [PRODUCTION_IP]
```

#### 3.2 SSL Certificate Configuration
```bash
# Configure SSL for wildcard domain
certbot certonly --dns-cloudflare \
  -d talk2go.online \
  -d www.talk2go.online \
  -d *.talk2go.online

# Set up automatic renewal
echo "0 0,12 * * * root certbot renew --quiet" >> /etc/crontab
```

#### 3.3 CDN Configuration (Optional)
```bash
# Configure CloudFlare settings
# - SSL/TLS: Full (strict)
# - Always Use HTTPS: On
# - HSTS: Enabled
# - Minimum TLS Version: 1.2
# - Cache Level: Standard
```

### 4. Verification Steps

#### 4.1 Database Verification
```bash
# Verify database structure
npm run db:verify:production

# Check tenant data integrity
npm run db:verify-tenants:production

# Test data isolation
npm run db:verify-isolation:production

# Performance check
npm run db:performance-check:production
```

#### 4.2 Application Verification
```bash
# Start production application
npm run start:production

# Health check
curl https://talk2go.online/api/health

# Test Mi Nhon Hotel functionality
curl https://minhon.talk2go.online/api/health

# Test dashboard access
curl https://talk2go.online/api/dashboard/health
```

#### 4.3 Feature Testing
```bash
# Test hotel research functionality
npm run test:hotel-research:production

# Test tenant creation flow
npm run test:tenant-creation:production

# Test dashboard APIs
npm run test:dashboard:production

# Test voice assistant functionality
npm run test:voice-assistant:production
```

#### 4.4 Performance Testing
```bash
# Load testing
npm run test:load:production

# Database performance
npm run test:db-performance:production

# API response times
npm run test:api-performance:production
```

#### 4.5 Security Testing
```bash
# Tenant isolation security test
npm run test:security:tenant-isolation

# API security test
npm run test:security:api

# Authentication security test
npm run test:security:auth
```

### 5. Post-Deployment Tasks

#### 5.1 Disable Maintenance Mode
```bash
# Remove maintenance mode
echo "MAINTENANCE_MODE=false" >> .env

# Deploy live application
npm run deploy:live

# Notify users maintenance is complete
npm run notify:maintenance-complete
```

#### 5.2 Monitoring Setup
```bash
# Start monitoring services
npm run monitoring:start

# Set up alerts
npm run monitoring:setup-alerts

# Configure dashboards
npm run monitoring:setup-dashboards
```

#### 5.3 Backup Schedule
```bash
# Set up daily database backups
echo "0 2 * * * root pg_dump $DATABASE_URL > /backups/daily-$(date +%Y%m%d).sql" >> /etc/crontab

# Set up weekly full system backup
echo "0 3 * * 0 root /scripts/full-backup.sh" >> /etc/crontab
```

### 6. Rollback Procedures (if needed)

#### 6.1 Emergency Rollback
```bash
# Immediate rollback (if critical issues)
npm run rollback:emergency

# Restore database
psql $DATABASE_URL < production-backup-TIMESTAMP.sql

# Revert application
git checkout [PREVIOUS_PRODUCTION_COMMIT]
npm run deploy:production:rollback
```

#### 6.2 Gradual Rollback
```bash
# Enable maintenance mode
echo "MAINTENANCE_MODE=true" >> .env

# Stop application
npm run stop:production

# Restore database backup
psql $DATABASE_URL < production-backup-TIMESTAMP.sql

# Deploy previous version
npm run deploy:production:previous-version

# Verify rollback
npm run verify:rollback

# Disable maintenance mode
echo "MAINTENANCE_MODE=false" >> .env
```

---

## 🔍 VERIFICATION CHECKLIST

### ✅ Mi Nhon Hotel Compatibility
- [ ] Original voice assistant functionality works
- [ ] All existing data preserved and accessible
- [ ] No performance degradation
- [ ] All API endpoints respond correctly
- [ ] Staff dashboard accessible and functional

### ✅ Multi-Tenant Functionality
- [ ] Tenant creation flow works
- [ ] Data isolation between tenants verified
- [ ] Subdomain routing works correctly
- [ ] Dashboard APIs work for all tenants
- [ ] Voice assistants unique per tenant

### ✅ SaaS Features
- [ ] Hotel research functionality working
- [ ] Dynamic assistant creation working
- [ ] Knowledge base generation working
- [ ] Analytics dashboard displaying data
- [ ] Subscription management working

### ✅ Performance & Security
- [ ] Database queries optimized with tenant filtering
- [ ] API response times acceptable (< 500ms)
- [ ] SSL certificates valid and auto-renewing
- [ ] Rate limiting configured and working
- [ ] Monitoring and alerting active

---

## 📞 EMERGENCY CONTACTS

### Development Team
- **Lead Developer**: [Contact Info]
- **Database Administrator**: [Contact Info]
- **DevOps Engineer**: [Contact Info]

### External Services
- **Vapi.ai Support**: [Contact Info]
- **OpenAI Support**: [Contact Info]
- **Google Cloud Support**: [Contact Info]
- **DNS Provider Support**: [Contact Info]

### Rollback Authority
- **Decision Maker**: [Contact Info]
- **Backup Contact**: [Contact Info]

---

## 📊 SUCCESS METRICS

### Deployment Success Indicators
- [ ] **Zero Data Loss** - All Mi Nhon data preserved
- [ ] **100% Tenant Isolation** - No cross-tenant data access
- [ ] **< 2 Second Response Time** - API performance maintained
- [ ] **99.9% Uptime** - Service availability maintained
- [ ] **No Security Breaches** - All security tests passed

### Business Metrics
- [ ] **Mi Nhon Hotel** - Continues normal operations
- [ ] **New Tenant Creation** - Setup flow working
- [ ] **Voice Assistant Quality** - Functionality maintained
- [ ] **Dashboard Usage** - Analytics and management working
- [ ] **Customer Satisfaction** - No user complaints

---

## 📝 DEPLOYMENT LOG

### Staging Deployment
- **Date**: ___________
- **Time**: ___________
- **Deployed by**: ___________
- **Git Commit**: ___________
- **Database Migration**: ___________
- **Status**: ___________

### Production Deployment
- **Date**: ___________
- **Time**: ___________
- **Deployed by**: ___________
- **Git Commit**: ___________
- **Database Migration**: ___________
- **Status**: ___________

---

## 🎯 FINAL NOTES

- **Always test in staging first** before production deployment
- **Have rollback plan ready** and tested
- **Monitor closely** for first 24 hours after deployment
- **Document any issues** encountered during deployment
- **Update this checklist** based on lessons learned

**Remember**: This migration transforms the application from single-tenant to multi-tenant. Take time to thoroughly test and understand the implications before production deployment.

---

**Generated**: $(date)
**Version**: 1.0.0 