/**
 * 🧪 TEST SUMMARY ROUTES LOGIC
 * Test the new summary endpoints to ensure they work correctly
 */

const { PrismaClient } = require('./generated/prisma');

async function testSummaryLogic() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 Testing Summary API Logic...\n');

    // 1. Check recent summaries exist
    console.log('1️⃣ Checking database for recent summaries...');
    const recentSummaries = await prisma.call_summaries.findMany({
      take: 3,
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        call_id: true,
        content: true,
        timestamp: true,
        room_number: true,
        duration: true,
      },
    });

    console.log(`   ✅ Found ${recentSummaries.length} recent summaries`);

    if (recentSummaries.length > 0) {
      const testCallId = recentSummaries[0].call_id;
      console.log(`   🎯 Using call ID for testing: ${testCallId}`);

      // 2. Test call-specific summary logic
      console.log('\n2️⃣ Testing call-specific summary logic...');
      const callSummaries = await prisma.call_summaries.findMany({
        where: { call_id: testCallId },
        orderBy: { timestamp: 'desc' },
      });

      console.log(
        `   📊 Call ${testCallId} has ${callSummaries.length} summaries`
      );

      if (callSummaries.length > 0) {
        const summary = callSummaries[0];
        console.log('   📝 Summary structure:');
        console.log(`      ID: ${summary.id}`);
        console.log(`      Call ID: ${summary.call_id}`);
        console.log(`      Room: ${summary.room_number || 'N/A'}`);
        console.log(`      Duration: ${summary.duration || 'N/A'}`);
        console.log(
          `      Content: ${(summary.content || '').substring(0, 100)}...`
        );

        // Test expected API response format
        console.log('\n   🔄 Expected API response format:');
        const expectedResponse = {
          id: summary.id,
          callId: summary.call_id,
          content: summary.content,
          timestamp: summary.timestamp,
          roomNumber: summary.room_number,
          duration: summary.duration,
        };
        console.log('   ', JSON.stringify(expectedResponse, null, 2));
      }

      // 3. Test recent summaries logic
      console.log('\n3️⃣ Testing recent summaries (last 24 hours)...');
      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - 24);

      const last24Hours = await prisma.call_summaries.findMany({
        where: {
          timestamp: {
            gte: hoursAgo,
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 5,
      });

      console.log(
        `   ✅ Found ${last24Hours.length} summaries in last 24 hours`
      );

      if (last24Hours.length > 0) {
        console.log('   📋 Recent summaries structure:');
        const transformedSummaries = last24Hours.map(summary => ({
          id: summary.id,
          callId: summary.call_id,
          content: summary.content,
          timestamp: summary.timestamp,
          roomNumber: summary.room_number,
          duration: summary.duration,
        }));

        console.log(
          `   🔄 Expected response: { summaries: [...${transformedSummaries.length} items], count: ${transformedSummaries.length}, timeframe: 24 }`
        );
      }
    } else {
      console.log(
        '   ❌ No summaries found in database - API will return empty results'
      );
    }

    console.log('\n🎉 Summary API logic test completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Start server: npm run dev');
    console.log('   2. Test endpoints:');
    console.log('      - GET /api/summaries/recent/24');
    console.log('      - GET /api/summaries/{callId}');
    console.log('   3. Check frontend CallHistory and CallDetails pages');
  } catch (error) {
    console.error('❌ Error testing summary logic:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSummaryLogic();
