// ============================================
// MONITORING REMINDER SYSTEM v2.0
// ============================================
// Shows monitoring status and reminders during app startup
// Helps ensure monitoring is not forgotten after deployment

import { logger } from "@shared/utils/logger";

export function showMonitoringReminder(): void {
  // Check if we're in a production-like environment
  const isProduction = process.env.NODE_ENV === "production";
  const isDeployment =
    process.env.RENDER || process.env.VERCEL || process.env.HEROKU;

  if (isProduction || isDeployment) {
    // In production, show a subtle reminder
    logger.info(
      "📊 Enhanced Logging & Metrics v2.0 status check...",
      "MonitoringReminder",
    );

    setTimeout(() => {
      checkAndShowReminder();
    }, 3000); // Show after app startup
  } else {
    // In development, show immediate reminder
    setTimeout(() => {
      checkAndShowReminder();
    }, 1000);
  }
}

function checkAndShowReminder(): void {
  try {
    const fs = require("fs");
    const path = require("path");

    // Check monitoring status
    const sharedIndexPath = path.join(__dirname, "../shared/index.ts");
    const content = fs.readFileSync(sharedIndexPath, "utf8");

    const isMonitoringDisabled = content.includes(
      "// ✅ TEMPORARILY DISABLED: Auto-initialization for deployment safety",
    );

    if (isMonitoringDisabled) {
      showDisabledReminder();
    } else {
      showEnabledStatus();
    }
  } catch (error) {
    logger.warn(
      "Could not check monitoring status",
      "MonitoringReminder",
      error,
    );
  }
}

function showDisabledReminder(): void {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // Subtle production reminder
    logger.info(
      "⚠️  Enhanced Logging & Metrics v2.0 is currently disabled",
      "MonitoringReminder",
    );
    logger.info(
      "📋 Enable with: npm run enable-monitoring",
      "MonitoringReminder",
    );
  } else {
    // Detailed development reminder
    console.log("\n" + "=".repeat(60));
    console.log("📊 MONITORING SYSTEM REMINDER");
    console.log("=".repeat(60));
    console.log("⚠️  Enhanced Logging & Metrics v2.0 is currently DISABLED");
    console.log("✅ Application is running safely without monitoring");
    console.log("");
    console.log("🔧 TO ENABLE MONITORING:");
    console.log("   npm run enable-monitoring");
    console.log("   npm run build");
    console.log("   npm start");
    console.log("");
    console.log("📊 TO CHECK STATUS:");
    console.log("   npm run check-monitoring");
    console.log("   npm run remind-monitoring");
    console.log("");
    console.log("📖 DOCUMENTATION:");
    console.log("   MONITORING_RE_ENABLE_GUIDE.md");
    console.log("=".repeat(60) + "\n");
  }

  // Schedule periodic reminders (every 30 minutes in development)
  if (!isProduction) {
    setInterval(
      () => {
        logger.info(
          "💡 Reminder: Enhanced Logging & Metrics v2.0 is disabled. Enable with: npm run enable-monitoring",
          "MonitoringReminder",
        );
      },
      30 * 60 * 1000,
    ); // 30 minutes
  }
}

function showEnabledStatus(): void {
  logger.success(
    "📊 Enhanced Logging & Metrics v2.0 is ENABLED and running",
    "MonitoringReminder",
  );
  logger.info(
    "🔍 Monitoring endpoints available at /api/monitoring/*",
    "MonitoringReminder",
  );

  // Test if monitoring is actually responding
  setTimeout(() => {
    testMonitoringEndpoints();
  }, 5000);
}

function testMonitoringEndpoints(): void {
  try {
    const http = require("http");
    const port = process.env.PORT || 10000;

    // Test monitoring status endpoint
    const options = {
      hostname: "localhost",
      port: port,
      path: "/api/monitoring/status",
      method: "GET",
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        logger.success(
          "✅ Monitoring endpoints are responding correctly",
          "MonitoringReminder",
        );
      } else {
        logger.warn(
          `⚠️  Monitoring endpoint returned status: ${res.statusCode}`,
          "MonitoringReminder",
        );
      }
    });

    req.on("error", (_error) => {
      logger.debug(
        "Monitoring endpoint test failed (app may still be starting)",
        "MonitoringReminder",
      );
    });

    req.on("timeout", () => {
      logger.debug(
        "Monitoring endpoint test timeout (app may still be starting)",
        "MonitoringReminder",
      );
      req.destroy();
    });

    req.end();
  } catch {
    // Silently ignore test errors
  }
}

// Export for use in main app startup
export function initializeMonitoringReminder(): void {
  // Show initial reminder
  showMonitoringReminder();

  // Set up reminder for long-running processes
  const reminderInterval =
    process.env.NODE_ENV === "production" ? 6 * 60 * 60 * 1000 : 60 * 60 * 1000; // 6 hours prod, 1 hour dev

  setInterval(() => {
    if (process.env.SHOW_MONITORING_REMINDERS !== "false") {
      checkAndShowReminder();
    }
  }, reminderInterval);
}

// Environment-based reminder settings
export function configureReminders(): void {
  // Allow disabling reminders via environment variable
  if (process.env.DISABLE_MONITORING_REMINDERS === "true") {
    logger.debug(
      "Monitoring reminders disabled via environment variable",
      "MonitoringReminder",
    );
    return;
  }

  // Show startup message about reminder system
  logger.info("📋 Monitoring reminder system active", "MonitoringReminder");
  logger.info(
    "💡 Disable with: DISABLE_MONITORING_REMINDERS=true",
    "MonitoringReminder",
  );
}
