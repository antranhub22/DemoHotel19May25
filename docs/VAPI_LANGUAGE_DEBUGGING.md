# 🔧 Vapi Language Configuration Debugging Guide

## 📋 Overview

This guide helps debug why different language selections might still use the English assistant instead of language-specific assistants.

## 🚀 Quick Test Commands

### 1. Test Local Development
```bash
npm run test:vapi
```

### 2. Test Production on Render
```bash
# Replace YOUR-DOMAIN with your actual Render domain
npm run test:vapi https://your-app.onrender.com
```

### 3. Manual API Tests
```bash
# Test French assistant config
curl https://your-app.onrender.com/api/vapi/config/fr

# Test Vietnamese assistant config  
curl https://your-app.onrender.com/api/vapi/config/vi

# Test Chinese assistant config
curl https://your-app.onrender.com/api/vapi/config/zh
```

## 🔍 Understanding Test Results

### ✅ SUCCESS Response (Working)
```json
{
  "language": "fr",
  "publicKey": "pk_live_abc123...",
  "assistantId": "assistant_def456...",
  "fallback": false
}
```

### ⚠️ FALLBACK Response (Environment Variables Missing)
```json
{
  "language": "fr", 
  "publicKey": "",
  "assistantId": "",
  "fallback": true
}
```

## 🔧 Troubleshooting Steps

### Step 1: Check Environment Variables on Render

Ensure these variables are set in your Render service:

**Assistant IDs:**
- `VITE_VAPI_ASSISTANT_ID` (English - default)
- `VITE_VAPI_ASSISTANT_ID_FR` (French)
- `VITE_VAPI_ASSISTANT_ID_VI` (Vietnamese)
- `VITE_VAPI_ASSISTANT_ID_ZH` (Chinese)
- `VITE_VAPI_ASSISTANT_ID_RU` (Russian)  
- `VITE_VAPI_ASSISTANT_ID_KO` (Korean)

**Public Keys:**
- `VITE_VAPI_PUBLIC_KEY` (English - default)
- `VITE_VAPI_PUBLIC_KEY_FR` (French)
- `VITE_VAPI_PUBLIC_KEY_VI` (Vietnamese)
- `VITE_VAPI_PUBLIC_KEY_ZH` (Chinese)
- `VITE_VAPI_PUBLIC_KEY_RU` (Russian)
- `VITE_VAPI_PUBLIC_KEY_KO` (Korean)

### Step 2: Restart Render Service

After adding environment variables, **restart your Render service** to load new values.

### Step 3: Check Server Logs

Look for these debug messages in Render logs:

```
[API] Getting Vapi config for language: fr
[API] Vapi config for fr: { publicKey: "pk_live_...", assistantId: "assistant_..." }
```

### Step 4: Test Frontend Language Selection

1. Open your app in browser
2. Change language to French/Vietnamese/etc.
3. Press Siri Button
4. Check browser console for debug logs:

```
🤖 [getVapiAssistantIdByLanguage] Selected assistant for fr: { assistantId: "assistant_...", fallback: false }
```

## 🎯 Expected Behavior

### ✅ Working Correctly:
1. User selects language (e.g., French)
2. System calls `/api/vapi/config/fr`
3. API returns French-specific assistant ID
4. Vapi connects with French assistant
5. User speaks French with French assistant

### ❌ Problem Behavior:
1. User selects language (e.g., French)
2. System calls `/api/vapi/config/fr` 
3. API returns `fallback: true` with English assistant
4. Vapi connects with English assistant
5. User speaks French but gets English assistant

## 🔄 Common Solutions

### Issue: All languages show "FALLBACK"
**Solution**: Environment variables not set on Render
1. Go to Render dashboard → Your service → Environment
2. Add all `VITE_VAPI_*` variables  
3. Click "Save" and restart service

### Issue: Some languages work, others don't
**Solution**: Missing specific language variables
1. Check which languages show "SUCCESS" vs "FALLBACK"
2. Add missing `VITE_VAPI_ASSISTANT_ID_XX` variables
3. Restart service

### Issue: Variables set but still fallback
**Solution**: Variable name mismatch
1. Ensure exact naming: `VITE_VAPI_ASSISTANT_ID_FR` (not `VAPI_ASSISTANT_ID_FR`)
2. Use uppercase language codes: `FR`, `VI`, `ZH`, `RU`, `KO`
3. Restart service after fixing names

## 📞 Testing Voice Calls

Once environment variables are configured:

1. **Select language**: Use language dropdown in header
2. **Press Siri Button**: Should connect to language-specific assistant
3. **Speak in selected language**: Assistant should respond in same language
4. **Check logs**: Look for debug messages showing correct assistant selection

## 🚨 Emergency Fallback

If language-specific assistants fail, the system will automatically fallback to English assistant to ensure functionality is not broken.

## 📝 Debug Log Examples

### Successful Language Switch:
```
🌍 [Language Change] User selected language: fr
🔧 [fetchVapiConfig] Received config for fr: { assistantId: "assistant_...", fallback: false }
🤖 [getVapiAssistantIdByLanguage] Selected assistant for fr: { assistantId: "assistant_...", fallback: false }
```

### Fallback to English:
```
🌍 [Language Change] User selected language: fr  
🔧 [fetchVapiConfig] Using fallback config for fr: { assistantId: "assistant_en...", fallback: true }
[API] Language fr config not found, falling back to English
``` 