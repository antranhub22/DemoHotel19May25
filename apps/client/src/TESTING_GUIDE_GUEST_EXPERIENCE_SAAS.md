# 🧪 Testing Guide: Guest Experience + SaaS Provider Integration

## 🎯 **What to Test**

After implementing SaaS Provider domain, Guest Experience now has **complete multi-tenant integration** with feature gating, usage tracking, and billing. Here's how to test it:

---

## 🚀 **Quick Start Testing**

### **1. Access the Enhanced Voice Assistant**

```
URL: http://localhost:3000/voice-saas
```

### **2. Test Different Subscription Plans**

Create test tenants with different plans to test feature gating:

**🔵 Trial Plan Testing:**

- Should only access basic voice features
- Multi-language should show upgrade prompts
- Voice cloning should be locked

**🟢 Basic Plan Testing:**

- Basic voice + Multi-language access
- Voice cloning should show upgrade prompts
- Advanced analytics should be locked

**🟣 Premium Plan Testing:**

- Basic voice + Multi-language + Voice cloning
- Advanced analytics should show upgrade prompts

**🟠 Enterprise Plan Testing:**

- Full access to all features
- No upgrade prompts should appear

---

## 📋 **Detailed Test Scenarios**

### **🏨 Tenant Context Testing**

**✅ Test:** Multiple Hotel Tenants

1. Switch between different tenant subdomains
2. Verify each tenant has separate usage tracking
3. Check language preferences are tenant-specific
4. Confirm feature access varies by tenant's subscription

**✅ Expected Results:**

- Each tenant maintains separate state
- Usage counters are tenant-specific
- Feature access matches subscription plan
- Language preferences saved per tenant

### **🎤 Voice Feature Gating Testing**

**✅ Test:** Basic Voice Access

```typescript
// Trial users should see:
✅ Basic voice assistant
❌ Multi-language (upgrade prompt)
❌ Voice cloning (upgrade prompt)
❌ Advanced analytics (upgrade prompt)
```

**✅ Test:** Premium Feature Prompts

1. Try accessing locked features
2. Verify upgrade prompts appear
3. Check "Upgrade" button functionality
4. Confirm feature descriptions are clear

**✅ Expected Results:**

- Clear upgrade prompts for locked features
- Smooth upgrade flow experience
- Feature availability matches subscription matrix

### **📊 Usage Tracking Testing**

**✅ Test:** Call Tracking

1. Start voice calls and verify tracking
2. Check usage dashboard updates in real-time
3. Test monthly limit enforcement
4. Verify usage warnings at 80% and 90%

**✅ Test:** Usage Limits

1. Simulate approaching monthly limits
2. Test call blocking when limits exceeded
3. Verify clear error messages
4. Check upgrade prompts when limits hit

**✅ Expected Results:**

- Real-time usage updates
- Accurate limit enforcement
- Clear warning messages
- Smooth upgrade experience

### **🌍 Multi-Language Feature Testing**

**✅ Test:** Language Selection with Gating

```typescript
// For Trial/Basic plans:
✅ English (always available)
❌ Vietnamese, French, Chinese, etc. (upgrade required)

// For Premium+ plans:
✅ All languages available
```

**✅ Test:** Language Persistence

1. Select different languages per tenant
2. Refresh page and verify persistence
3. Switch tenants and check isolation

**✅ Expected Results:**

- Feature gating works correctly
- Language preferences persist per tenant
- Upgrade prompts appear for premium languages

### **💰 Billing Integration Testing**

**✅ Test:** Cost Calculation

1. Make voice calls of different durations
2. Check cost calculation by plan:
   - Trial: $0 (free)
   - Basic: $0.05/minute
   - Premium: $0.03/minute
   - Enterprise: $0.02/minute

**✅ Test:** Usage Events

1. Monitor backend for usage tracking events
2. Verify `voice_call_started` and `voice_call_ended` events
3. Check duration tracking accuracy
4. Confirm tenant attribution

**✅ Expected Results:**

- Accurate cost calculations
- Proper usage event tracking
- Correct tenant attribution
- Real-time billing data updates

---

## 🔧 **Backend Integration Testing**

### **🌐 API Header Testing**

Verify all API calls include proper tenant headers:

```bash
# Check network tab for:
X-Tenant-ID: <tenant_id>
Content-Type: application/json
Authorization: Bearer <token>
```

### **📈 Usage Tracking API Testing**

Monitor these endpoints:

```bash
POST /api/usage/track
POST /api/tenant/{id}/usage/current
GET /api/tenant/{id}/features
```

### **🔒 Feature Access API Testing**

Test feature access control:

```bash
GET /api/tenant/{id}/features/check
POST /api/platform/feature-flags
```

---

## 🐛 **Common Issues to Watch For**

### **❌ Potential Issues:**

**1. Missing Tenant Context**

- **Symptom**: Features work without subscription checks
- **Check**: Verify `currentTenant` is loaded before operations

**2. Usage Not Tracking**

- **Symptom**: Usage dashboard doesn't update
- **Check**: Network tab for `/api/usage/track` calls

**3. Feature Gates Not Working**

- **Symptom**: Premium features accessible on trial plan
- **Check**: `canAccessFeature()` function calls

**4. Cross-Tenant Data Leakage**

- **Symptom**: Usage data shared between tenants
- **Check**: Tenant ID isolation in localStorage and API calls

### **✅ Expected Behaviors:**

**Correct Feature Gating:**

```typescript
Trial User clicks "Voice Cloning":
→ Shows upgrade prompt
→ "Voice cloning requires Premium plan or higher"
→ Upgrade button leads to billing page
```

**Correct Usage Tracking:**

```typescript
Voice call starts:
→ API call: POST /api/usage/track { event: "voice_call_started" }
→ Usage dashboard updates immediately
→ Remaining calls/minutes counter decreases
```

**Correct Limit Enforcement:**

```typescript
Monthly limit reached:
→ Start call button becomes disabled
→ Error message: "Monthly usage limits exceeded"
→ Upgrade prompt appears
```

---

## 📱 **Mobile Testing**

### **📲 Test on Different Devices**

- **iOS Safari**: Voice feature detection
- **Android Chrome**: Touch interactions
- **Mobile responsiveness**: Usage dashboard layout

### **📶 Test Network Conditions**

- **Slow network**: Usage tracking with delays
- **Offline mode**: Graceful error handling
- **Poor connection**: Feature gate fallbacks

---

## 🎯 **Success Criteria**

### **✅ All Tests Pass When:**

1. **Feature Gating**: Premium features properly locked per plan
2. **Usage Tracking**: Real-time updates and accurate limits
3. **Multi-Tenant**: Complete isolation between tenants
4. **Billing Integration**: Accurate cost calculations
5. **Upgrade Flow**: Smooth prompts and upgrade experience
6. **Error Handling**: Graceful failures with clear messages
7. **Performance**: No performance degradation
8. **Backward Compatibility**: Original components still work

### **📊 Test Results Dashboard**

Create a test checklist:

```
□ Trial plan: Feature gating working
□ Basic plan: Multi-language access working
□ Premium plan: Voice cloning access working
□ Enterprise plan: All features accessible
□ Usage tracking: Real-time updates working
□ Usage limits: Enforcement working
□ Cross-tenant isolation: Working correctly
□ Mobile responsiveness: Working on all devices
□ API integration: All endpoints responding
□ Billing accuracy: Cost calculations correct
```

---

## 🔗 **Quick Test Links**

For rapid testing, bookmark these URLs:

```
🏠 Original Voice Assistant: http://localhost:3000/
🚀 SaaS-Integrated Version: http://localhost:3000/voice-saas
🏢 Platform Admin Dashboard: http://localhost:3000/platform-admin
📊 Hotel Dashboard: http://localhost:3000/hotel-dashboard
```

---

## 🎉 **Ready for Production?**

**✅ When all tests pass:**

1. Replace main route to use `VoiceAssistantWithSaaS`
2. Deploy to staging for full integration testing
3. Monitor usage tracking and billing accuracy
4. Gather user feedback on upgrade prompts
5. Roll out to production gradually

**The Guest Experience is now a fully SaaS-aware, multi-tenant system! 🚀**
