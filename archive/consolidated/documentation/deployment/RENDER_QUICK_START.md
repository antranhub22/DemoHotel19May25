# 🚀 Render Deployment - Quick Start Guide

## 📋 Tóm tắt nhanh để deploy lên Render

### 1. Files đã tạo cho bạn:

- `render-env-variables.txt` - Copy & paste environment variables
- `docs/RENDER_DEPLOYMENT_GUIDE.md` - Hướng dẫn chi tiết
- `scripts/generate-jwt-secret.ts` - Generate JWT secret

### 2. Quick Steps:

#### Step 1: Generate JWT Secret

```bash
tsx scripts/generate-jwt-secret.ts
```

Copy JWT_SECRET và SESSION_SECRET từ output.

#### Step 2: Copy Environment Variables

Mở file `render-env-variables.txt` và copy toàn bộ content.

#### Step 3: Setup trên Render

1. Tạo PostgreSQL database trên Render
2. Tạo Web Service từ GitHub repo
3. Paste environment variables vào Environment Variables section
4. Update với actual values:
   - `DATABASE_URL` - từ PostgreSQL service
   - `JWT_SECRET` - từ script generate
   - `SESSION_SECRET` - từ script generate
   - `VITE_OPENAI_API_KEY` - từ OpenAI
   - `VITE_VAPI_PUBLIC_KEY` - từ Vapi
   - `VITE_VAPI_ASSISTANT_ID` - từ Vapi
   - `VAPI_API_KEY` - từ Vapi
   - `GOOGLE_PLACES_API_KEY` - từ Google Cloud

#### Step 4: Deploy

Build Command: `npm run build` Start Command: `npm run start`

### 3. API Keys cần thiết:

#### OpenAI API Key

- Đăng ký: https://platform.openai.com/
- Tạo API key (starts with `sk-`)
- Add payment method

#### Vapi API Keys

- Đăng ký: https://vapi.ai/
- Lấy Public Key (`pk-`)
- Lấy Assistant ID (`asst-`)
- Lấy API Key (for dynamic creation)

#### Google Places API Key

- Đăng ký: https://console.cloud.google.com/
- Enable Google Places API
- Create credentials

#### Gmail App Password (Optional)

- Enable 2FA trên Gmail
- Create App Password: https://myaccount.google.com/apppasswords

### 4. Generated JWT Secrets:

```
JWT_SECRET=W3oaxogr2TkVnr5gSeqGTll/dJ+jZlJ3GGZHAJ0R42U=
SESSION_SECRET=A/jGu1ZDdv7ByMHJSpQLBQErptNmoyiwSIje3mZbOUI=
```

### 5. Environment Variables Template:

```
NODE_ENV=production
PORT=10000
CLIENT_URL=https://your-app-name.onrender.com
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=W3oaxogr2TkVnr5gSeqGTll/dJ+jZlJ3GGZHAJ0R42U=
SESSION_SECRET=A/jGu1ZDdv7ByMHJSpQLBQErptNmoyiwSIje3mZbOUI=
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_VAPI_PUBLIC_KEY=pk-your-vapi-key
VITE_VAPI_ASSISTANT_ID=asst-your-assistant-id
VAPI_API_KEY=your-vapi-api-key
GOOGLE_PLACES_API_KEY=your-google-places-key
GMAIL_APP_PASSWORD=your-gmail-app-password
TALK2GO_DOMAIN=talk2go.online
ENABLE_HOTEL_RESEARCH=true
ENABLE_DYNAMIC_ASSISTANT_CREATION=true
CORS_ORIGIN=https://your-app-name.onrender.com
```

### 6. Validation Commands:

```bash
# Check environment locally
npm run env:validate-saas
npm run env:health

# Generate new secrets
npm run env:jwt-secret

# Test before deploy
npm run build
npm run start
```

### 7. Files để reference:

- `render-env-variables.txt` - Complete environment variables list
- `docs/RENDER_DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `docs/ENVIRONMENT_SETUP.md` - Complete environment setup guide

## 🎯 Ready to Deploy!

1. ✅ Copy environment variables từ `render-env-variables.txt`
2. ✅ Replace với actual API keys
3. ✅ Deploy trên Render
4. ✅ Check logs và test functionality

Good luck! 🚀
