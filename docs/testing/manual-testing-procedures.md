# 📋 Manual Testing Procedures - Multi-Tenant Integration

## Overview

This document provides comprehensive manual testing procedures to complement automated integration
tests. These procedures verify that the multi-tenant voice assistant system works correctly from an
end-user perspective.

## 🎯 Testing Objectives

### 1. **Mi Nhon Hotel Functionality Remains Unchanged**

Verify that existing Mi Nhon Hotel functionality works exactly as before the multi-tenant migration.

### 2. **New Tenant Creation Works End-to-End**

Test the complete flow of creating and setting up a new hotel tenant.

### 3. **Multi-Tenant Data Isolation is Working**

Ensure that tenants cannot access each other's data and functionality.

### 4. **Dashboard APIs Work Correctly**

Verify all dashboard functionality works for different tenants.

### 5. **Voice Interface Works for Different Hotels**

Test voice assistants work correctly with tenant-specific knowledge.

---

## 🏨 Test Suite 1: Mi Nhon Hotel Compatibility

### Objective

Verify that Mi Nhon Hotel continues to work exactly as before the migration.

### Prerequisites

- [ ] Migration has been completed
- [ ] Mi Nhon Hotel exists as a tenant in the database
- [ ] Voice assistant is properly configured

### Test Procedures

#### Test 1.1: Voice Assistant Access

**Objective**: Verify Mi Nhon voice assistant is accessible and working

**Steps**:

1. Navigate to `http://localhost:3000` or Mi Nhon's domain
2. Verify the voice assistant interface loads
3. Click the voice assistant button
4. Say: "Hello, can you help me with hotel information?"
5. Verify the assistant responds with Mi Nhon-specific information

**Expected Results**:

- [ ] Voice interface loads without errors
- [ ] Assistant responds in the expected voice
- [ ] Response contains Mi Nhon Hotel specific information
- [ ] No tenant isolation errors in console

#### Test 1.2: Existing Data Access

**Objective**: Verify existing Mi Nhon data is accessible

**Steps**:

1. Access staff dashboard at `http://localhost:3000/staff`
2. Login with existing staff credentials
3. Navigate to call history
4. Verify existing call records are visible
5. Check analytics data

**Expected Results**:

- [ ] Staff login works with existing credentials
- [ ] Historical call data is visible
- [ ] Analytics show correct data
- [ ] No data appears to be missing

#### Test 1.3: Service Requests

**Objective**: Test hotel service request functionality

**Steps**:

1. Use voice assistant to request room service
2. Say: "I'd like to order room service for room 205"
3. Follow through the order process
4. Check staff dashboard for the new request

**Expected Results**:

- [ ] Voice assistant handles room service request
- [ ] Order appears in staff dashboard
- [ ] Email notifications work (if configured)
- [ ] Data is associated with Mi Nhon tenant

#### Test 1.4: Multi-language Support

**Objective**: Test Mi Nhon's multi-language functionality

**Steps**:

1. Switch language to Vietnamese
2. Test voice interaction in Vietnamese
3. Switch to English and test again
4. Verify translations work correctly

**Expected Results**:

- [ ] Language switching works
- [ ] Vietnamese voice assistant responds correctly
- [ ] English voice assistant works
- [ ] UI translations are correct

---

## 🏢 Test Suite 2: New Tenant Creation

### Objective

Test the complete flow of creating and setting up a new hotel tenant.

### Prerequisites

- [ ] Dashboard interface is accessible
- [ ] Hotel research APIs are configured
- [ ] Vapi integration is working

### Test Procedures

#### Test 2.1: Tenant Registration

**Objective**: Create a new tenant through the registration flow

**Steps**:

1. Navigate to tenant registration page
2. Fill in hotel information:
   - Hotel Name: "Grand Test Hotel"
   - Location: "Test City"
   - Contact Email: "test@grandtesthotel.com"
3. Complete registration process
4. Verify tenant creation confirmation

**Expected Results**:

- [ ] Registration form accepts input
- [ ] Validation works correctly
- [ ] Tenant is created successfully
- [ ] Confirmation email sent (if configured)

#### Test 2.2: Setup Wizard Flow

**Objective**: Complete the hotel setup wizard

**Steps**:

1. Access setup wizard for new tenant
2. **Step 1**: Enter hotel name "Grand Test Hotel"
3. **Step 2**: Review auto-researched hotel data
4. **Step 3**: Customize assistant personality and voice
5. **Step 4**: Complete setup and generate assistant

**Expected Results**:

- [ ] Setup wizard loads correctly
- [ ] Hotel research returns relevant data
- [ ] Assistant customization options work
- [ ] Assistant is created successfully
- [ ] Setup completion page shows success

#### Test 2.3: Dashboard Access

**Objective**: Verify new tenant can access their dashboard

**Steps**:

1. Login to new tenant dashboard
2. Navigate through all dashboard sections:
   - Overview
   - Assistant management
   - Analytics
   - Settings
3. Verify tenant-specific data is shown

**Expected Results**:

- [ ] Dashboard login works
- [ ] All sections load without errors
- [ ] Data is specific to the new tenant
- [ ] No other tenant's data is visible

#### Test 2.4: Voice Assistant Testing

**Objective**: Test the newly created voice assistant

**Steps**:

1. Navigate to new tenant's voice interface
2. Activate voice assistant
3. Ask about hotel amenities
4. Test service request functionality
5. Verify responses are tenant-specific

**Expected Results**:

- [ ] Voice assistant activates correctly
- [ ] Responses contain new tenant's information
- [ ] Service requests work
- [ ] Knowledge is specific to Grand Test Hotel

---

## 🔒 Test Suite 3: Multi-Tenant Data Isolation

### Objective

Ensure complete data isolation between tenants.

### Prerequisites

- [ ] Multiple tenants exist in the system
- [ ] Each tenant has some test data

### Test Procedures

#### Test 3.1: Dashboard Data Isolation

**Objective**: Verify tenants only see their own data

**Steps**:

1. Login to Mi Nhon Hotel dashboard
2. Note the call count and recent activities
3. Logout and login to Grand Test Hotel dashboard
4. Compare data - should be completely different
5. Try direct URL manipulation to access other tenant data

**Expected Results**:

- [ ] Each tenant sees only their own data
- [ ] Call counts are different between tenants
- [ ] Direct URL access to other tenant data fails
- [ ] Error handling works for unauthorized access

#### Test 3.2: Voice Assistant Isolation

**Objective**: Test voice assistant knowledge isolation

**Steps**:

1. Access Mi Nhon Hotel voice assistant
2. Ask: "What are your hotel amenities?"
3. Note the response (should include Mi Nhon specific amenities)
4. Access Grand Test Hotel voice assistant
5. Ask the same question
6. Compare responses

**Expected Results**:

- [ ] Mi Nhon assistant responds with Mi Nhon amenities
- [ ] Grand Test assistant responds with Grand Test amenities
- [ ] No cross-contamination of information
- [ ] Each assistant has unique knowledge base

#### Test 3.3: API Endpoint Isolation

**Objective**: Test API endpoints respect tenant boundaries

**Manual API Testing**:

1. Use browser developer tools or Postman
2. Test API endpoints with different tenant contexts:
   ```
   GET /api/analytics/overview
   GET /api/hotel-profile
   GET /api/transcripts
   ```
3. Verify responses are filtered by tenant

**Expected Results**:

- [ ] API responses contain only tenant-specific data
- [ ] Cross-tenant API access returns empty/error
- [ ] Authentication tokens are tenant-specific

#### Test 3.4: Database Query Isolation

**Objective**: Verify database queries are filtered by tenant

**Steps** (requires database access):

1. Connect to database
2. Run queries to verify tenant_id filtering:
   ```sql
   SELECT * FROM transcripts WHERE tenant_id = 'mi-nhon-tenant-id';
   SELECT * FROM transcripts WHERE tenant_id = 'test-tenant-id';
   ```
3. Verify results are properly isolated

**Expected Results**:

- [ ] Each query returns only tenant-specific data
- [ ] No data leakage between tenants
- [ ] Tenant IDs are properly assigned

---

## 📊 Test Suite 4: Dashboard APIs

### Objective

Verify all dashboard functionality works correctly for different tenants.

### Prerequisites

- [ ] Multiple tenants with different subscription plans
- [ ] Test data for each tenant

### Test Procedures

#### Test 4.1: Hotel Research API

**Objective**: Test hotel research functionality

**Steps**:

1. Login to a tenant dashboard
2. Navigate to hotel research section
3. Search for a test hotel: "Hilton Tokyo"
4. Review generated hotel data
5. Test with different hotels for different tenants

**Expected Results**:

- [ ] Hotel research returns relevant data
- [ ] Data is accurate and well-formatted
- [ ] Different tenants can research different hotels
- [ ] API rate limits work correctly

#### Test 4.2: Assistant Management

**Objective**: Test assistant configuration and management

**Steps**:

1. Access assistant management page
2. Test updating assistant personality
3. Change voice settings
4. Update system prompt
5. Test assistant with new configuration

**Expected Results**:

- [ ] Configuration changes save correctly
- [ ] Assistant reflects new settings
- [ ] Changes don't affect other tenants
- [ ] Voice interface updates appropriately

#### Test 4.3: Analytics Dashboard

**Objective**: Test analytics functionality

**Steps**:

1. Access analytics dashboard
2. Generate test call data
3. Verify analytics update in real-time
4. Test different time ranges
5. Export analytics data

**Expected Results**:

- [ ] Analytics show correct data
- [ ] Real-time updates work
- [ ] Data is tenant-specific
- [ ] Export functionality works

#### Test 4.4: Settings Management

**Objective**: Test tenant settings functionality

**Steps**:

1. Access settings page
2. Update contact information
3. Change subscription plan settings
4. Test feature toggles
5. Save and verify changes

**Expected Results**:

- [ ] Settings save correctly
- [ ] Changes reflect in UI immediately
- [ ] Feature toggles work
- [ ] Subscription limits are enforced

---

## 🎤 Test Suite 5: Voice Interface

### Objective

Test voice assistants work correctly with tenant-specific knowledge.

### Prerequisites

- [ ] Voice assistants are created for multiple tenants
- [ ] Different knowledge bases exist

### Test Procedures

#### Test 5.1: Basic Voice Functionality

**Objective**: Test basic voice assistant operations

**For each tenant**:

1. Access voice interface
2. Test voice activation
3. Test speech recognition
4. Test response generation
5. Test conversation flow

**Expected Results**:

- [ ] Voice activation works on all tenants
- [ ] Speech recognition accuracy is good
- [ ] Responses are natural and helpful
- [ ] Conversation flows smoothly

#### Test 5.2: Tenant-Specific Knowledge

**Objective**: Verify each assistant has correct knowledge

**Test Scenarios**:

**Mi Nhon Hotel**:

1. Ask: "What beaches are nearby?"
2. Expected: "Mui Ne Beach is just steps away..."

**Grand Test Hotel**:

1. Ask: "What beaches are nearby?"
2. Expected: Should mention different beaches or indicate none nearby

**Steps**:

1. Test each tenant's voice assistant
2. Ask identical questions
3. Compare responses
4. Verify accuracy of information

**Expected Results**:

- [ ] Each assistant has unique, accurate knowledge
- [ ] No cross-contamination of information
- [ ] Responses are contextually relevant

#### Test 5.3: Service Request Handling

**Objective**: Test service requests work correctly per tenant

**For each tenant**:

1. Request room service
2. Ask for housekeeping
3. Request transportation
4. Ask for local recommendations

**Expected Results**:

- [ ] Service requests are processed correctly
- [ ] Requests appear in correct tenant's dashboard
- [ ] Recommendations are location-appropriate
- [ ] Staff notifications work

#### Test 5.4: Multi-Language Support

**Objective**: Test language support varies by tenant

**Steps**:

1. Test language switching on each tenant
2. Verify available languages match subscription
3. Test voice responses in different languages
4. Verify UI translations

**Expected Results**:

- [ ] Language options match tenant subscription
- [ ] Voice assistants respond in correct language
- [ ] UI translations work correctly
- [ ] Premium features require appropriate plan

---

## 🔧 Test Suite 6: Error Handling and Edge Cases

### Objective

Test system behavior under various error conditions.

### Test Procedures

#### Test 6.1: Network Failures

**Objective**: Test system behavior when APIs are unavailable

**Steps**:

1. Simulate network failure (disconnect internet)
2. Try to use voice assistant
3. Try to access dashboard
4. Verify error messages are user-friendly

**Expected Results**:

- [ ] Graceful error handling
- [ ] User-friendly error messages
- [ ] System doesn't crash
- [ ] Retry mechanisms work

#### Test 6.2: Database Connection Issues

**Objective**: Test behavior when database is unavailable

**Steps**:

1. Simulate database unavailability
2. Try to access different parts of the system
3. Verify error handling
4. Test recovery when database comes back

**Expected Results**:

- [ ] Appropriate error messages shown
- [ ] System doesn't expose internal errors
- [ ] Automatic recovery works
- [ ] No data corruption occurs

#### Test 6.3: Invalid Tenant Access

**Objective**: Test security when invalid tenant access is attempted

**Steps**:

1. Try to access non-existent tenant
2. Try to access suspended tenant
3. Manipulate URLs to access other tenants
4. Test expired authentication tokens

**Expected Results**:

- [ ] Access denied appropriately
- [ ] Security errors logged
- [ ] No sensitive information exposed
- [ ] Redirects work correctly

---

## 📝 Test Documentation and Reporting

### Test Execution Log

For each test suite, document:

| Test ID | Test Name              | Date | Tester | Status | Notes |
| ------- | ---------------------- | ---- | ------ | ------ | ----- |
| 1.1     | Voice Assistant Access |      |        |        |       |
| 1.2     | Existing Data Access   |      |        |        |       |
| 1.3     | Service Requests       |      |        |        |       |
| ...     | ...                    |      |        |        |       |

### Issue Tracking

| Issue ID | Description   | Severity | Test Suite | Status | Resolution  |
| -------- | ------------- | -------- | ---------- | ------ | ----------- |
| ISS-001  | Example issue | High     | 1.1        | Open   | In progress |

### Sign-off Checklist

Before production deployment:

- [ ] All automated integration tests pass
- [ ] All manual test suites completed
- [ ] No critical or high severity issues remain
- [ ] Performance testing completed
- [ ] Security testing completed
- [ ] Documentation updated
- [ ] Training completed for support staff

### Testing Team Roles

- **Test Lead**: Overall testing coordination
- **Functional Tester**: Manual test execution
- **Automation Tester**: Automated test maintenance
- **Performance Tester**: Load and performance testing
- **Security Tester**: Security and penetration testing

---

## 🚀 Production Readiness Checklist

### Technical Readiness

- [ ] All integration tests pass
- [ ] Manual testing completed without critical issues
- [ ] Performance benchmarks met
- [ ] Security requirements satisfied
- [ ] Monitoring and alerting configured

### Business Readiness

- [ ] User acceptance testing completed
- [ ] Support team trained
- [ ] Documentation completed
- [ ] Rollback procedures verified
- [ ] Communication plan executed

### Deployment Readiness

- [ ] Production environment prepared
- [ ] Database migration tested
- [ ] Backup procedures verified
- [ ] Deployment scripts tested
- [ ] Post-deployment tests prepared

---

**Note**: This manual testing should be performed in addition to automated tests to ensure
comprehensive coverage of the multi-tenant system functionality. Document all results and issues
found during testing.

**Last Updated**: {Current Date} **Next Review**: {Review Date}
