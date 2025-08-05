# 🚀 Deployment Quickstart Guide

## Pre-Deployment Checklist

### 1. Validate Environment

```bash
# Check if system is ready for deployment
npm run validate:deployment:staging
npm run validate:deployment:production
```

### 2. Run Tests

```bash
# Run migration tests
npm run migration:test:pre-deploy

# Run integration tests
npm run test:integration:pre-deploy

# Run hotel research tests
npm run test:hotel-research:production
```

### 3. Environment Variables

Make sure these are configured:

- `DATABASE_URL` - PostgreSQL connection string
- `VITE_OPENAI_API_KEY` - OpenAI API key
- `VITE_VAPI_PUBLIC_KEY` - Vapi public key
- `VAPI_API_KEY` - Vapi API key for dynamic creation
- `GOOGLE_PLACES_API_KEY` - Google Places API key
- `TALK2GO_DOMAIN` - Your domain (talk2go.online)
- `JWT_SECRET` - Strong JWT secret (32+ characters)

## Staging Deployment

### 1. Validate Staging Environment

```bash
npm run validate:deployment:staging
```

### 2. Deploy to Staging

```bash
# Dry run first
npm run deploy:staging:dry-run

# Actual deployment
npm run deploy:staging
```

### 3. Verify Staging

```bash
# Check health
curl https://staging.talk2go.online/api/health

# Check Mi Nhon Hotel
curl https://minhon.staging.talk2go.online/api/health
```

## Production Deployment

### 1. Validate Production Environment

```bash
npm run validate:deployment:production
```

### 2. Create Database Backup

```bash
# Create backup before deployment
pg_dump $DATABASE_URL > production-backup-$(date +%Y%m%d-%H%M%S).sql
```

### 3. Deploy to Production

```bash
# Dry run first
npm run deploy:production:dry-run

# Actual deployment
npm run deploy:production
```

### 4. Verify Production

```bash
# Check health
curl https://talk2go.online/api/health

# Check Mi Nhon Hotel
curl https://minhon.talk2go.online/api/health

# Check dashboard
curl https://talk2go.online/api/dashboard/health
```

## Post-Deployment

### 1. Monitor System

- Check application logs
- Monitor database performance
- Verify all endpoints responding

### 2. Test Key Functionality

- Mi Nhon Hotel voice assistant
- New tenant creation
- Dashboard access
- Analytics data

### 3. Rollback (if needed)

```bash
# Emergency rollback
npm run deploy:production:rollback

# Or manual rollback
psql $DATABASE_URL < production-backup-TIMESTAMP.sql
```

## Common Issues

### Migration Fails

- Check database connection
- Verify backup was created
- Review migration logs

### API Keys Invalid

- Verify all API keys are active
- Check billing/quota status
- Test individual API connections

### DNS Issues

- Verify DNS records are propagated
- Check SSL certificates
- Test subdomain routing

## Support Commands

```bash
# Environment status
npm run env:status

# Test all APIs
npm run env:test-apis

# Test database
npm run env:test-db

# Generate environment template
npm run env:generate
```

## Emergency Contacts

- **Database Issues**: [DBA Contact]
- **API Issues**: [API Support]
- **DNS Issues**: [DNS Provider]
- **General Support**: [Team Lead]

---

**Remember**: Always test in staging first and have a rollback plan ready!
