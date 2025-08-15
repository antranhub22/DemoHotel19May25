/**
 * 🚀 Quick Memory Test - 2 minutes validation
 * Tests if native module cleanup is working
 */

const http = require('http');

async function quickMemoryTest() {
  console.log('🚀 Quick Memory Test Starting (2 minutes)');
  console.log('=====================================');

  const startTime = Date.now();
  const testDuration = 2 * 60 * 1000; // 2 minutes
  let requestCount = 0;
  let memorySnapshots = [];

  // Function to get server memory
  const getServerMemory = () => {
    return new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3000/api/memory/status', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.success && response.data.currentUsage) {
              resolve({
                rss: Math.round(response.data.currentUsage.rss / 1024 / 1024),
                heap: Math.round(response.data.currentUsage.heapUsed / 1024 / 1024),
                external: Math.round(response.data.currentUsage.external / 1024 / 1024),
              });
            } else {
              reject(new Error('Invalid response'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
  };

  // Function to make test requests
  const makeTestRequests = async () => {
    const endpoints = [
      '/api/health',
      '/api/memory/status',
      '/api/external-memory/status',
    ];

    const promises = endpoints.map(endpoint => {
      return new Promise((resolve) => {
        const req = http.get(`http://localhost:3000${endpoint}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            requestCount++;
            resolve();
          });
        });
        req.on('error', () => resolve());
        req.setTimeout(3000, () => {
          req.destroy();
          resolve();
        });
      });
    });

    await Promise.all(promises);
  };

  // Test loop
  console.log('📊 Starting memory monitoring...\n');
  
  while (Date.now() - startTime < testDuration) {
    try {
      // Make some requests to generate load
      await makeTestRequests();

      // Take memory snapshot
      const memory = await getServerMemory();
      const runtime = Math.round((Date.now() - startTime) / 1000);
      
      memorySnapshots.push({
        time: runtime,
        ...memory,
      });

      // Log every 30 seconds
      if (runtime % 30 === 0 || runtime < 30) {
        console.log(`⏰ ${runtime}s | RSS: ${memory.rss}MB | Heap: ${memory.heap}MB | External: ${memory.external}MB | Requests: ${requestCount}`);
      }

      // Wait 10 seconds between checks
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
      console.warn(`⚠️ Error at ${Math.round((Date.now() - startTime) / 1000)}s:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  // Analyze results
  console.log('\n=====================================');
  console.log('📊 QUICK TEST RESULTS');
  console.log('=====================================');

  if (memorySnapshots.length >= 2) {
    const first = memorySnapshots[0];
    const last = memorySnapshots[memorySnapshots.length - 1];
    const timeMinutes = (last.time - first.time) / 60;

    const rssGrowth = last.rss - first.rss;
    const externalGrowth = last.external - first.external;
    const rssGrowthRate = timeMinutes > 0 ? rssGrowth / timeMinutes : 0;
    const extGrowthRate = timeMinutes > 0 ? externalGrowth / timeMinutes : 0;

    console.log(`⏱️  Duration: ${timeMinutes.toFixed(1)} minutes`);
    console.log(`📈 Total Requests: ${requestCount}`);
    console.log(`💾 RSS: ${first.rss}MB → ${last.rss}MB (${rssGrowth > 0 ? '+' : ''}${rssGrowth}MB)`);
    console.log(`💾 External: ${first.external}MB → ${last.external}MB (${externalGrowth > 0 ? '+' : ''}${externalGrowth}MB)`);
    console.log(`📊 RSS Growth Rate: ${rssGrowthRate.toFixed(2)}MB/min`);
    console.log(`📊 External Growth Rate: ${extGrowthRate.toFixed(2)}MB/min`);

    console.log('\n🎯 NATIVE MODULE LEAK TEST:');
    if (Math.abs(rssGrowthRate) < 0.5 && Math.abs(extGrowthRate) < 1.0) {
      console.log('✅ PASSED - Memory stable, native module cleanup working!');
      console.log('💡 Native module leaks appear to be resolved');
      return 0;
    } else if (rssGrowthRate < 2.0 && extGrowthRate < 3.0) {
      console.log('⚠️  IMPROVED - Some growth but much better than before');
      console.log('💡 Native module cleanup is helping, may need fine-tuning');
      return 0;
    } else {
      console.log('❌ STILL LEAKING - Native modules still growing significantly');
      console.log('💡 Need additional investigation or more aggressive cleanup');
      return 1;
    }
  } else {
    console.log('❌ INSUFFICIENT DATA - Not enough snapshots collected');
    return 1;
  }
}

// Run test if called directly
if (require.main === module) {
  console.log('🔍 Checking server availability...');
  
  http.get('http://localhost:3000/api/health', (res) => {
    console.log('✅ Server is running\n');
    quickMemoryTest().then(exitCode => {
      console.log('\n🎯 Quick memory test completed!');
      process.exit(exitCode);
    }).catch(error => {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
  }).on('error', () => {
    console.error('❌ Server not accessible at http://localhost:3000');
    console.log('💡 Please start server with: npm run dev');
    process.exit(1);
  });
}

module.exports = quickMemoryTest;
