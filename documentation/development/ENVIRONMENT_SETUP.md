# 🔧 Environment Setup Guide

## Overview

This guide covers the complete environment configuration for the Hotel Voice Assistant SaaS
Platform. The platform requires various API keys and configurations to enable all features including
voice assistants, hotel research, multi-tenancy, and more.

## Quick Start

1. **Copy environment template:**

   ```bash
   cp config/environment.ts .env
   # Edit .env with your actual values
   ```

2. **Validate environment:**

   ```bash
   npm run env:validate
   npm run env:status
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

## Environment Variables Reference

### 🔥 Required (Basic Functionality)

These variables are **required** for the platform to function:

```bash
# Database
DATABASE_URL=file:./dev.db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# OpenAI Integration
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here

# Vapi Voice Assistant
VITE_VAPI_PUBLIC_KEY=pk_your-vapi-public-key-here
VITE_VAPI_ASSISTANT_ID=asst_your-vapi-assistant-id-here
```

### 🏢 Required (SaaS Features)

These variables are **required** for SaaS platform features:

```bash
# Vapi API for dynamic assistant creation
VAPI_API_KEY=your-vapi-api-key-for-dynamic-creation

# Google Places API for hotel research
GOOGLE_PLACES_API_KEY=your-google-places-api-key

# Platform domain
TALK2GO_DOMAIN=talk2go.online
```

### 🌍 Optional (Multi-language Support)

Enable voice assistants in multiple languages:

```bash
# Vietnamese
VITE_VAPI_PUBLIC_KEY_VI=pk_your-vapi-public-key-vietnamese
VITE_VAPI_ASSISTANT_ID_VI=asst_your-vapi-assistant-id-vietnamese

# French
VITE_VAPI_PUBLIC_KEY_FR=pk_your-vapi-public-key-french
VITE_VAPI_ASSISTANT_ID_FR=asst_your-vapi-assistant-id-french

# Chinese
VITE_VAPI_PUBLIC_KEY_ZH=pk_your-vapi-public-key-chinese
VITE_VAPI_ASSISTANT_ID_ZH=asst_your-vapi-assistant-id-chinese

# Russian
VITE_VAPI_PUBLIC_KEY_RU=pk_your-vapi-public-key-russian
VITE_VAPI_ASSISTANT_ID_RU=asst_your-vapi-assistant-id-russian

# Korean
VITE_VAPI_PUBLIC_KEY_KO=pk_your-vapi-public-key-korean
VITE_VAPI_ASSISTANT_ID_KO=asst_your-vapi-assistant-id-korean
```

### 📧 Optional (Email Services)

Choose one email service for notifications:

**Option 1: Gmail**

```bash
GMAIL_APP_PASSWORD=your-gmail-app-password
```

**Option 2: Mailjet**

```bash
MAILJET_API_KEY=your-mailjet-api-key
MAILJET_SECRET_KEY=your-mailjet-secret-key
```

**Email Configuration**

```bash
SUMMARY_EMAILS=admin@hotel.com,manager@hotel.com
```

### 🔍 Optional (Enhanced Hotel Research)

Additional APIs for comprehensive hotel research:

```bash
# Yelp API for reviews
YELP_API_KEY=your-yelp-api-key

# TripAdvisor API
TRIPADVISOR_API_KEY=your-tripadvisor-api-key

# Social Media Scraper
SOCIAL_MEDIA_SCRAPER_API_KEY=your-social-media-api-key
```

### 🏗️ Optional (Infrastructure)

Production infrastructure configuration:

```bash
# SSL/TLS
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/key.pem

# CDN
CDN_URL=https://your-cdn-url.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
GOOGLE_ANALYTICS_ID=your-google-analytics-id

# Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-s3-bucket-name

# Cache (Redis)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
```

## Getting API Keys

### 1. OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create account and add payment method
3. Go to API Keys section
4. Create new API key
5. Copy the key (starts with `sk-`)

### 2. Vapi API Keys

1. Visit [Vapi.ai](https://vapi.ai/)
2. Create account and subscribe to plan
3. Go to Dashboard
4. Copy Public Key (starts with `pk_`) for `VITE_VAPI_PUBLIC_KEY`
5. Copy Assistant ID (starts with `asst_`) for `VITE_VAPI_ASSISTANT_ID`
6. Copy API Key for `VAPI_API_KEY` (for dynamic creation)

### 3. Google Places API Key

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google Places API
4. Create credentials (API Key)
5. Restrict key to Google Places API for security

### 4. Email Service Keys

**Gmail App Password:**

1. Enable 2-factor authentication on Gmail
2. Go to App Passwords in Google Account settings
3. Generate app password for "Mail"
4. Use generated password (not your regular password)

**Mailjet:**

1. Visit [Mailjet](https://www.mailjet.com/)
2. Create account
3. Go to API Keys section
4. Copy API Key and Secret Key

## Environment Validation

Use these commands to validate your environment:

```bash
# Check environment status
npm run env:status

# Validate required variables
npm run env:validate

# Test basic functionality
npm run env:test

# Test SaaS features
npm run env:test-saas
```

## Configuration Templates

### Development Environment

```bash
NODE_ENV=development
PORT=10000
CLIENT_URL=http://localhost:5173
DATABASE_URL=file:./dev.db
JWT_SECRET=dev-jwt-secret-change-in-production
TALK2GO_DOMAIN=localhost:5173
ENABLE_HOTEL_RESEARCH=true
ENABLE_DYNAMIC_ASSISTANT_CREATION=true
LOG_LEVEL=debug
```

### Production Environment

```bash
NODE_ENV=production
PORT=10000
CLIENT_URL=https://your-frontend-domain.com
DATABASE_URL=postgresql://username:password@localhost:5432/database
JWT_SECRET=your-super-secure-jwt-secret
TALK2GO_DOMAIN=talk2go.online
ENABLE_HOTEL_RESEARCH=true
ENABLE_DYNAMIC_ASSISTANT_CREATION=true
ENABLE_BILLING_SYSTEM=true
LOG_LEVEL=info
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/key.pem
```

### Testing Environment

```bash
NODE_ENV=test
PORT=10001
CLIENT_URL=http://localhost:5174
DATABASE_URL=file:./test.db
JWT_SECRET=test-jwt-secret
TALK2GO_DOMAIN=test.localhost
ENABLE_HOTEL_RESEARCH=false
ENABLE_DYNAMIC_ASSISTANT_CREATION=false
LOG_LEVEL=error
```

## Feature Flags

Control platform features with environment variables:

```bash
# Enable/disable hotel research
ENABLE_HOTEL_RESEARCH=true

# Enable/disable dynamic assistant creation
ENABLE_DYNAMIC_ASSISTANT_CREATION=true

# Enable/disable multi-language support
ENABLE_MULTI_LANGUAGE_SUPPORT=true

# Enable/disable analytics dashboard
ENABLE_ANALYTICS_DASHBOARD=true

# Enable/disable billing system
ENABLE_BILLING_SYSTEM=false
```

## Security Best Practices

1. **Never commit .env files to version control**
2. **Use different values for dev/staging/production**
3. **Rotate API keys regularly**
4. **Use strong, unique JWT secrets**
5. **Enable SSL/TLS in production**
6. **Restrict API keys to specific services**
7. **Monitor API usage and costs**

## Troubleshooting

### Common Issues

**1. "Missing required environment variables"**

```bash
# Check which variables are missing
npm run env:status

# Validate environment
npm run env:validate
```

**2. "OpenAI API key invalid"**

- Check if key starts with `sk-`
- Verify account has sufficient credits
- Check if key is properly set

**3. "Vapi connection failed"**

- Verify public key starts with `pk_`
- Check assistant ID starts with `asst_`
- Ensure API key is valid

**4. "Google Places API error"**

- Enable Google Places API in Google Cloud Console
- Check if API key is properly set
- Verify billing is enabled

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug
NODE_ENV=development
```

### Environment Health Check

```bash
# Run comprehensive environment check
npm run env:health

# Test all API connections
npm run env:test-apis

# Check database connection
npm run env:test-db
```

## Cost Optimization

### API Usage Monitoring

Monitor API usage to control costs:

```bash
# OpenAI usage
OPENAI_MONTHLY_LIMIT=100

# Vapi usage
VAPI_MONTHLY_CALL_LIMIT=1000

# Google Places usage
GOOGLE_PLACES_MONTHLY_LIMIT=500
```

### Rate Limiting

Configure rate limiting to prevent abuse:

```bash
# Rate limiting (15 minutes window)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Support

For environment setup support:

1. Check this documentation
2. Run `npm run env:status` for diagnostics
3. Check logs for specific error messages
4. Contact support with environment status output

## Migration from Existing Setup

If migrating from an existing setup:

1. **Backup current .env file:**

   ```bash
   cp .env .env.backup
   ```

2. **Update environment variables:**

   ```bash
   # Add new SaaS variables
   echo "VAPI_API_KEY=your-key" >> .env
   echo "GOOGLE_PLACES_API_KEY=your-key" >> .env
   echo "TALK2GO_DOMAIN=talk2go.online" >> .env
   ```

3. **Validate migration:**

   ```bash
   npm run env:validate
   npm run env:test
   ```

4. **Test functionality:**
   ```bash
   npm run test:integration
   ```

## Environment Variables Complete List

For a complete list of all supported environment variables, see:

- `config/environment.ts` - Configuration file
- `ENVIRONMENT_TEMPLATES` - Template configurations
- `getEnvironmentStatus()` - Status checking function
