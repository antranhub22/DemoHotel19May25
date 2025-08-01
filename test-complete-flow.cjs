#!/usr/bin/env node

/**
 * 🧪 TEST COMPLETE FLOW
 * Test end-to-end: Voice Call → OpenAI → Database → Dashboard → Guest Notification
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:10000';

async function testCompleteFlow() {
  console.log('🧪 [TEST] Starting Complete Flow Test...\n');

  // Test 1: Simulate Vapi webhook with realistic data
  console.log('📞 [TEST 1] Simulating Vapi webhook call...');
  
  const webhookData = {
    type: 'end-of-call-report',
    call: {
      id: 'test-call-' + Date.now(),
    },
    message: {
      messages: [
        {
          role: 'user',
          content: 'Hello, this is Tony from room 200. I would like to order 2 beef burgers and 1 orange juice for dinner. Please deliver within 30 minutes.'
        },
        {
          role: 'assistant', 
          content: 'Sure Tony! I have 2 beef burgers and 1 orange juice for room 200. Delivery within 30 minutes. Anything else?'
        },
        {
          role: 'user',
          content: 'No, that\'s all. Thank you!'
        }
      ]
    }
  };

  try {
    const webhookResponse = await fetch(`${BASE_URL}/api/webhooks/vapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (webhookResponse.ok) {
      console.log('✅ [TEST 1] Webhook call successful');
      
      // Wait for processing
      console.log('⏳ Waiting 3 seconds for OpenAI processing...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } else {
      console.log('❌ [TEST 1] Webhook call failed:', webhookResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ [TEST 1] Webhook error:', error.message);
    return;
  }

  // Test 2: Check if requests appeared in database
  console.log('\n📊 [TEST 2] Checking requests in database...');
  
  try {
    const requestsResponse = await fetch(`${BASE_URL}/api/staff/requests`, {
      headers: {
        'Authorization': 'Bearer test-token', // Mock token
      }
    });

    if (requestsResponse.ok) {
      const requests = await requestsResponse.json();
      console.log(`✅ [TEST 2] Found ${requests.length} requests in database`);
      
      if (requests.length > 0) {
        const latestRequest = requests[0];
        console.log('📝 Latest request:', {
          id: latestRequest.id,
          roomNumber: latestRequest.roomNumber,
          customerName: latestRequest.customerName,
          requestContent: latestRequest.requestContent,
          status: latestRequest.status
        });

        // Test 3: Update request status (simulate front desk action)
        console.log('\n👥 [TEST 3] Simulating front desk status update...');
        
        const statusUpdateResponse = await fetch(`${BASE_URL}/api/staff/requests/${latestRequest.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            status: 'Đang thực hiện',
            assignedTo: 'kitchen-staff'
          })
        });

        if (statusUpdateResponse.ok) {
          console.log('✅ [TEST 3] Status update successful');
          console.log('📡 WebSocket events should be emitted for:');
          console.log('  - Dashboard real-time update');  
          console.log('  - Guest notification');
        } else {
          console.log('❌ [TEST 3] Status update failed:', statusUpdateResponse.status);
        }
      }
    } else {
      console.log('❌ [TEST 2] Failed to fetch requests:', requestsResponse.status);
    }
  } catch (error) {
    console.log('❌ [TEST 2] Database check error:', error.message);
  }

  console.log('\n🎯 [SUMMARY] Complete Flow Test Finished');
  console.log('Expected Flow:');
  console.log('1. ✅ Vapi webhook → OpenAI summary extraction');
  console.log('2. ✅ ServiceRequests saved to database');
  console.log('3. ✅ WebSocket emit for new requests');
  console.log('4. ✅ Dashboard receives real-time updates'); 
  console.log('5. ✅ Front desk updates status');
  console.log('6. ✅ Guest receives notification');
  console.log('\n🔍 Check browser console and server logs for WebSocket events!');
}

// Auto-run if called directly
if (require.main === module) {
  testCompleteFlow().catch(console.error);
}

module.exports = { testCompleteFlow };