#!/usr/bin/env node

/**
 * Test script for transcript saving integration
 */

const API_BASE = 'http://localhost:10000';

async function testTranscriptSaving() {
  console.log('🧪 Testing Transcript Saving Integration...\n');

  // Test data
  const testTranscript = {
    callId: `test-call-${Date.now()}`,
    role: 'user',
    content:
      'Hello, this is a test message from the transcript integration test.',
    tenantId: 'test-tenant',
  };

  try {
    // 1. Test saving transcript
    console.log('1️⃣ Testing POST /api/transcripts...');
    const saveResponse = await fetch(`${API_BASE}/api/transcripts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTranscript),
    });

    if (!saveResponse.ok) {
      throw new Error(
        `Save failed: ${saveResponse.status} ${saveResponse.statusText}`
      );
    }

    const saveData = await saveResponse.json();
    console.log('✅ Transcript saved successfully:', saveData);

    // 2. Test retrieving transcripts
    console.log('\n2️⃣ Testing GET /api/transcripts/:callId...');
    const getResponse = await fetch(
      `${API_BASE}/api/transcripts/${testTranscript.callId}`
    );

    if (!getResponse.ok) {
      throw new Error(
        `Get failed: ${getResponse.status} ${getResponse.statusText}`
      );
    }

    const transcripts = await getResponse.json();
    console.log('✅ Transcripts retrieved successfully:', transcripts);

    // 3. Verify data integrity
    console.log('\n3️⃣ Verifying data integrity...');
    if (transcripts.length > 0) {
      const savedTranscript = transcripts[0];
      if (
        savedTranscript.content === testTranscript.content &&
        savedTranscript.role === testTranscript.role
      ) {
        console.log('✅ Data integrity verified - content and role match');
      } else {
        console.log('❌ Data integrity failed - content or role mismatch');
      }
    } else {
      console.log('❌ No transcripts found for the test call');
    }

    console.log('\n🎉 Transcript integration test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(
      '🔍 Make sure the development server is running on port 3000'
    );
  }
}

// Run the test
testTranscriptSaving();
