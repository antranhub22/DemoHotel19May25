/**
 * Summary Popup Debug Script
 * Copy and paste this into browser console when on localhost:3000
 *
 * Sử dụng:
 * 1. Mở localhost:3000 trong browser
 * 2. Mở Developer Tools (F12)
 * 3. Paste script này vào Console và nhấn Enter
 * 4. Chạy các lệnh test
 */

console.log("🧪 Loading Summary Popup Debug Script...");

// Global debug object
window.summaryDebug = {
  // Test 1: Check if global functions exist
  checkGlobalFunctions() {
    console.log("📋 Checking global functions...");

    const functions = [
      "triggerSummaryPopup",
      "updateSummaryPopup",
      "storeCallId",
      "resetSummarySystem",
    ];

    functions.forEach((funcName) => {
      if (typeof window[funcName] === "function") {
        console.log(`✅ window.${funcName}: EXISTS`);
      } else {
        console.log(`❌ window.${funcName}: MISSING`);
      }
    });

    // Check other objects
    if (window.unifiedPopupSystem) {
      console.log("✅ window.unifiedPopupSystem: EXISTS");
    } else {
      console.log("❌ window.unifiedPopupSystem: MISSING");
    }
  },

  // Test 2: Force trigger summary popup
  triggerSummary() {
    console.log("🎯 Attempting to trigger summary popup...");

    try {
      if (typeof window.triggerSummaryPopup === "function") {
        console.log("📞 Calling window.triggerSummaryPopup()");
        window.triggerSummaryPopup();
        console.log("✅ Summary popup triggered successfully!");
        return true;
      } else {
        console.error("❌ window.triggerSummaryPopup is not available");
        return false;
      }
    } catch (error) {
      console.error("❌ Error triggering summary popup:", error);
      return false;
    }
  },

  // Test 3: Simulate complete call end process
  simulateCallEnd() {
    console.log("📞 Simulating complete call end process...");

    const callId = `debug-call-${Date.now()}`;
    console.log(`📋 Using call ID: ${callId}`);

    // Step 1: Store call ID
    if (window.storeCallId) {
      try {
        window.storeCallId(callId);
        console.log("✅ Call ID stored successfully");
      } catch (error) {
        console.error("❌ Error storing call ID:", error);
      }
    } else {
      console.log("⚠️ window.storeCallId not available");
    }

    // Step 2: Wait and trigger summary
    console.log("⏳ Waiting 2 seconds before triggering summary...");
    setTimeout(() => {
      this.triggerSummary();
    }, 2000);
  },

  // Test 4: Check DOM for popup elements
  checkDOM() {
    console.log("🔍 Checking DOM for popup elements...");

    // Check for popup containers
    const popupSelectors = [
      '[class*="popup"]',
      '[id*="popup"]',
      '[class*="summary"]',
      '[id*="summary"]',
      '[data-testid*="popup"]',
      '[data-testid*="summary"]',
    ];

    popupSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      console.log(`${selector}: ${elements.length} elements found`);
      if (elements.length > 0) {
        elements.forEach((el, index) => {
          console.log(`  - Element ${index}:`, el);
        });
      }
    });

    // Check React root
    const reactRoot = document.getElementById("root");
    if (reactRoot) {
      console.log("✅ React root found:", reactRoot);
      console.log(`📊 React root has ${reactRoot.children.length} children`);
    } else {
      console.log("❌ React root not found!");
    }
  },

  // Test 5: Try to create popup manually using different methods
  createTestPopup() {
    console.log("🎭 Creating test popup manually...");

    // Method 1: Use unifiedPopupSystem if available
    if (window.unifiedPopupSystem && window.unifiedPopupSystem.addPopup) {
      try {
        const popupId = window.unifiedPopupSystem.addPopup({
          type: "summary",
          title: "Debug Test Summary",
          content: "This is a test summary popup created by debug script",
          priority: "medium",
        });
        console.log(
          "✅ Test popup created using unifiedPopupSystem, ID:",
          popupId,
        );
        return popupId;
      } catch (error) {
        console.error(
          "❌ Error creating popup with unifiedPopupSystem:",
          error,
        );
      }
    }

    // Method 2: Try direct DOM manipulation
    try {
      const popup = document.createElement("div");
      popup.id = "debug-test-popup";
      popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #5DB6B9;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 400px;
                font-family: Arial, sans-serif;
            `;
      popup.innerHTML = `
                <h3 style="margin: 0 0 15px 0; color: #5DB6B9;">🧪 Debug Test Summary</h3>
                <p style="margin: 0 0 15px 0;">This is a test summary popup created by the debug script.</p>
                <button onclick="document.getElementById('debug-test-popup').remove()" 
                        style="background: #5DB6B9; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            `;

      document.body.appendChild(popup);
      console.log("✅ Test popup created using DOM manipulation");

      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (document.getElementById("debug-test-popup")) {
          document.getElementById("debug-test-popup").remove();
          console.log("🗑️ Test popup auto-removed");
        }
      }, 10000);

      return "debug-test-popup";
    } catch (error) {
      console.error("❌ Error creating popup with DOM manipulation:", error);
    }

    return null;
  },

  // Test 6: Monitor for summary-related events
  monitorEvents() {
    console.log("👂 Starting event monitoring...");

    // Listen for custom events that might be fired
    const eventTypes = [
      "summary-triggered",
      "summary-shown",
      "summary-hidden",
      "call-ended",
      "popup-created",
      "popup-shown",
    ];

    eventTypes.forEach((eventType) => {
      window.addEventListener(eventType, (event) => {
        console.log(`🎪 Event detected: ${eventType}`, event);
      });
    });

    // Monitor DOM mutations for popup creation
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            const element = node;
            if (
              element.className &&
              (element.className.includes("popup") ||
                element.className.includes("summary") ||
                (element.id &&
                  (element.id.includes("popup") ||
                    element.id.includes("summary"))))
            ) {
              console.log("🆕 Popup-related element added to DOM:", element);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("✅ Event monitoring started");

    // Stop monitoring after 60 seconds
    setTimeout(() => {
      observer.disconnect();
      console.log("⏹️ Event monitoring stopped");
    }, 60000);
  },

  // Run all tests
  runAllTests() {
    console.log("🚀 Running all summary popup tests...");
    console.log("=====================================");

    this.checkGlobalFunctions();
    console.log("");

    this.checkDOM();
    console.log("");

    this.createTestPopup();
    console.log("");

    console.log("⏳ Starting event monitoring (60 seconds)...");
    this.monitorEvents();
    console.log("");

    console.log("🎯 Now attempting to trigger actual summary...");
    setTimeout(() => {
      this.simulateCallEnd();
    }, 2000);

    console.log("=====================================");
    console.log("✅ All tests initiated");
    console.log("💡 Watch console for results...");
  },

  // Helper: Show current state
  showState() {
    console.log("📊 Current Summary System State:");
    console.log("================================");
    console.log("Functions available:");
    console.log("  triggerSummaryPopup:", typeof window.triggerSummaryPopup);
    console.log("  updateSummaryPopup:", typeof window.updateSummaryPopup);
    console.log("  storeCallId:", typeof window.storeCallId);
    console.log("  resetSummarySystem:", typeof window.resetSummarySystem);
    console.log("");
    console.log("Objects available:");
    console.log("  unifiedPopupSystem:", !!window.unifiedPopupSystem);
    console.log("  currentCallId:", window.currentCallId);
    console.log("");
    console.log("DOM state:");
    console.log("  React root exists:", !!document.getElementById("root"));
    console.log(
      "  Popup elements:",
      document.querySelectorAll('[class*="popup"], [id*="popup"]').length,
    );
    console.log(
      "  Summary elements:",
      document.querySelectorAll('[class*="summary"], [id*="summary"]').length,
    );
    console.log("================================");
  },
};

// Quick access functions
window.testSummary = () => window.summaryDebug.triggerSummary();
window.checkSummary = () => window.summaryDebug.showState();
window.runSummaryTests = () => window.summaryDebug.runAllTests();

console.log("✅ Summary Debug Script loaded!");
console.log("");
console.log("🎯 Quick commands:");
console.log("  testSummary() - Trigger summary popup");
console.log("  checkSummary() - Show current state");
console.log("  runSummaryTests() - Run all tests");
console.log("");
console.log("📋 Full commands:");
console.log("  summaryDebug.checkGlobalFunctions()");
console.log("  summaryDebug.triggerSummary()");
console.log("  summaryDebug.simulateCallEnd()");
console.log("  summaryDebug.checkDOM()");
console.log("  summaryDebug.createTestPopup()");
console.log("  summaryDebug.monitorEvents()");
console.log("  summaryDebug.runAllTests()");
console.log("  summaryDebug.showState()");
console.log("");
console.log("🚀 Starting basic check...");
window.summaryDebug.showState();
