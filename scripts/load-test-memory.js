/**
 * 🚀 PHASE 4.1: Load Testing Script - Memory Stability Validation
 * Tests memory fixes under sustained load for 30 minutes
 */

const http = require("http");
const https = require("https");
const { performance } = require("perf_hooks");

class LoadTester {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || "http://localhost:3000";
    this.duration = options.duration || 30 * 60 * 1000; // 30 minutes
    this.concurrency = options.concurrency || 10;
    this.requestInterval = options.requestInterval || 1000; // 1 second

    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      memorySnapshots: [],
      errors: [],
      startTime: null,
      endTime: null,
    };

    this.isRunning = false;
    this.workers = [];
  }

  /**
   * Start load testing
   */
  async start() {
    console.log("🚀 Starting Memory Stability Load Test");
    console.log(`📊 Duration: ${this.duration / 1000 / 60} minutes`);
    console.log(`🔗 Target: ${this.baseUrl}`);
    console.log(`⚡ Concurrency: ${this.concurrency} workers`);
    console.log(`⏱️  Request interval: ${this.requestInterval}ms`);
    console.log("=====================================\n");

    this.stats.startTime = Date.now();
    this.isRunning = true;

    // Start memory monitoring
    this.startMemoryMonitoring();

    // Start concurrent workers
    for (let i = 0; i < this.concurrency; i++) {
      this.workers.push(this.startWorker(i));
    }

    // Set timeout for test duration
    setTimeout(() => {
      this.stop();
    }, this.duration);

    // Wait for all workers to complete
    await Promise.all(this.workers);

    return this.generateReport();
  }

  /**
   * Stop load testing
   */
  stop() {
    if (!this.isRunning) return;

    console.log("\n🛑 Stopping load test...");
    this.isRunning = false;
    this.stats.endTime = Date.now();
  }

  /**
   * Start a worker that makes continuous requests
   */
  async startWorker(workerId) {
    console.log(`👷 Worker ${workerId} started`);

    while (this.isRunning) {
      try {
        await this.makeRequest(workerId);
        await this.sleep(this.requestInterval);
      } catch (error) {
        this.stats.errors.push({
          workerId,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        this.stats.failedRequests++;
      }
    }

    console.log(`👷 Worker ${workerId} stopped`);
  }

  /**
   * Make HTTP request to test endpoints
   */
  async makeRequest(workerId) {
    const endpoints = [
      "/api/health",
      "/api/memory/status",
      "/api/external-memory/status",
      "/api/monitoring/dashboard",
      "/", // Main page
    ];

    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const startTime = performance.now();

    return new Promise((resolve, reject) => {
      const requestModule = this.baseUrl.startsWith("https") ? https : http;
      const url = `${this.baseUrl}${endpoint}`;

      const req = requestModule.get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          const responseTime = performance.now() - startTime;

          if (res.statusCode >= 200 && res.statusCode < 300) {
            this.stats.successfulRequests++;
            this.updateAverageResponseTime(responseTime);
          } else {
            this.stats.failedRequests++;
            this.stats.errors.push({
              workerId,
              endpoint,
              statusCode: res.statusCode,
              timestamp: new Date().toISOString(),
            });
          }

          this.stats.totalRequests++;
          resolve();
        });
      });

      req.on("error", (error) => {
        this.stats.failedRequests++;
        this.stats.totalRequests++;
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });
    });
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    console.log("📊 Memory monitoring started\n");

    const takeMemorySnapshot = () => {
      if (!this.isRunning) return;

      // Get server memory via API
      this.getServerMemory()
        .then((serverMemory) => {
          const snapshot = {
            timestamp: new Date().toISOString(),
            runtime: Math.round((Date.now() - this.stats.startTime) / 1000),
            server: serverMemory,
            client: {
              rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
              heapUsed: Math.round(
                process.memoryUsage().heapUsed / 1024 / 1024,
              ),
            },
            stats: {
              totalRequests: this.stats.totalRequests,
              successRate:
                this.stats.totalRequests > 0
                  ? Math.round(
                      (this.stats.successfulRequests /
                        this.stats.totalRequests) *
                        100,
                    )
                  : 0,
            },
          };

          this.stats.memorySnapshots.push(snapshot);

          // Log progress every 5 minutes
          if (snapshot.runtime % 300 === 0 || snapshot.runtime < 60) {
            console.log(
              `⏰ Runtime: ${Math.round(snapshot.runtime / 60)}min | ` +
                `Server RSS: ${serverMemory?.rss || "N/A"}MB | ` +
                `Requests: ${this.stats.totalRequests} | ` +
                `Success: ${snapshot.stats.successRate}%`,
            );
          }

          // Schedule next snapshot
          if (this.isRunning) {
            setTimeout(takeMemorySnapshot, 30000); // Every 30 seconds
          }
        })
        .catch((error) => {
          console.warn("Failed to get server memory:", error.message);
          if (this.isRunning) {
            setTimeout(takeMemorySnapshot, 30000);
          }
        });
    };

    // Take first snapshot immediately
    takeMemorySnapshot();
  }

  /**
   * Get server memory usage via API
   */
  async getServerMemory() {
    return new Promise((resolve, reject) => {
      const requestModule = this.baseUrl.startsWith("https") ? https : http;
      const url = `${this.baseUrl}/api/memory/status`;

      const req = requestModule.get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            if (response.success && response.data.currentUsage) {
              resolve({
                rss: Math.round(response.data.currentUsage.rss / 1024 / 1024),
                heap: Math.round(
                  response.data.currentUsage.heapUsed / 1024 / 1024,
                ),
                external: Math.round(
                  response.data.currentUsage.external / 1024 / 1024,
                ),
              });
            } else {
              reject(new Error("Invalid memory API response"));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on("error", reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error("Memory API timeout"));
      });
    });
  }

  /**
   * Update average response time
   */
  updateAverageResponseTime(responseTime) {
    const total =
      this.stats.averageResponseTime * (this.stats.successfulRequests - 1);
    this.stats.averageResponseTime =
      (total + responseTime) / this.stats.successfulRequests;
  }

  /**
   * Generate test report
   */
  generateReport() {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    const successRate =
      this.stats.totalRequests > 0
        ? (this.stats.successfulRequests / this.stats.totalRequests) * 100
        : 0;

    // Analyze memory trend
    const memoryAnalysis = this.analyzeMemoryTrend();

    const report = {
      summary: {
        duration: `${Math.round(duration)}s (${Math.round(duration / 60)}min)`,
        totalRequests: this.stats.totalRequests,
        successfulRequests: this.stats.successfulRequests,
        failedRequests: this.stats.failedRequests,
        successRate: `${successRate.toFixed(1)}%`,
        averageResponseTime: `${this.stats.averageResponseTime.toFixed(2)}ms`,
        requestsPerSecond: (this.stats.totalRequests / duration).toFixed(2),
      },
      memory: memoryAnalysis,
      errors: this.stats.errors.slice(-10), // Last 10 errors
    };

    // Print detailed report
    console.log("\n=====================================");
    console.log("📊 LOAD TEST COMPLETED - FINAL REPORT");
    console.log("=====================================\n");

    console.log("🎯 TEST SUMMARY:");
    console.log(`  Duration: ${report.summary.duration}`);
    console.log(`  Total Requests: ${report.summary.totalRequests}`);
    console.log(`  Success Rate: ${report.summary.successRate}`);
    console.log(`  Avg Response Time: ${report.summary.averageResponseTime}`);
    console.log(`  Requests/sec: ${report.summary.requestsPerSecond}\n`);

    console.log("💾 MEMORY ANALYSIS:");
    console.log(`  Memory Trend: ${memoryAnalysis.trend.toUpperCase()}`);
    console.log(`  Growth Rate: ${memoryAnalysis.growthRate}MB/min`);
    console.log(`  Peak RSS: ${memoryAnalysis.peakRSS}MB`);
    console.log(`  Final RSS: ${memoryAnalysis.finalRSS}MB`);
    console.log(`  Memory Stability: ${memoryAnalysis.stability}\n`);

    console.log("🎯 MEMORY LEAK TEST RESULT:");
    if (memoryAnalysis.growthRate < 0.5) {
      console.log("  ✅ PASSED - Memory usage is stable (<0.5MB/min growth)");
    } else if (memoryAnalysis.growthRate < 2.0) {
      console.log("  ⚠️  WARNING - Some memory growth detected (0.5-2MB/min)");
    } else {
      console.log(
        "  ❌ FAILED - Significant memory growth detected (>2MB/min)",
      );
    }

    if (this.stats.errors.length > 0) {
      console.log("\n⚠️ RECENT ERRORS:");
      this.stats.errors.slice(-5).forEach((error) => {
        console.log(
          `  ${error.timestamp}: ${error.error || `HTTP ${error.statusCode} on ${error.endpoint}`}`,
        );
      });
    }

    console.log("\n=====================================\n");

    return report;
  }

  /**
   * Analyze memory trend from snapshots
   */
  analyzeMemoryTrend() {
    if (this.stats.memorySnapshots.length < 2) {
      return {
        trend: "insufficient_data",
        growthRate: 0,
        peakRSS: 0,
        finalRSS: 0,
        stability: "unknown",
      };
    }

    const snapshots = this.stats.memorySnapshots;
    const firstSnapshot = snapshots[0];
    const lastSnapshot = snapshots[snapshots.length - 1];

    // Calculate growth rate (RSS is primary metric for external memory leaks)
    const rssGrowth =
      (lastSnapshot.server?.rss || 0) - (firstSnapshot.server?.rss || 0);
    const timeMinutes = (lastSnapshot.runtime - firstSnapshot.runtime) / 60;
    const growthRate = timeMinutes > 0 ? rssGrowth / timeMinutes : 0;

    // Find peak RSS
    const peakRSS = Math.max(...snapshots.map((s) => s.server?.rss || 0));
    const finalRSS = lastSnapshot.server?.rss || 0;

    // Determine trend
    let trend = "stable";
    if (growthRate > 0.5) {
      trend = "increasing";
    } else if (growthRate < -0.5) {
      trend = "decreasing";
    }

    // Determine stability
    let stability = "excellent";
    if (growthRate > 2.0) {
      stability = "poor";
    } else if (growthRate > 1.0) {
      stability = "moderate";
    } else if (growthRate > 0.5) {
      stability = "good";
    }

    return {
      trend,
      growthRate: growthRate.toFixed(2),
      peakRSS,
      finalRSS,
      stability,
    };
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Run load test if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace("--", "");
    const value = args[i + 1];

    if (key && value) {
      if (key === "duration") {
        options.duration = parseInt(value) * 60 * 1000; // Convert minutes to ms
      } else if (key === "concurrency") {
        options.concurrency = parseInt(value);
      } else if (key === "url") {
        options.baseUrl = value;
      } else if (key === "interval") {
        options.requestInterval = parseInt(value);
      }
    }
  }

  const tester = new LoadTester(options);

  tester
    .start()
    .then((report) => {
      process.exit(report.memory.growthRate > 2.0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("❌ Load test failed:", error);
      process.exit(1);
    });
}

module.exports = LoadTester;
