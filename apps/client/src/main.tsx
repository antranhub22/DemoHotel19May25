/// <reference types="vite/client" />

// Type declaration for import.meta

import App from "@/App.tsx";
import "./index.css";
/* eslint-disable no-console */
// Production debug and troubleshooting require console access

// ✅ PRODUCTION DEBUG: Enhanced environment validation
if (import.meta.env.PROD) {
  // Production mode logging disabled

  // Validate critical environment variables
  const criticalEnvs = {
    VITE_VAPI_PUBLIC_KEY: import.meta.env.VITE_VAPI_PUBLIC_KEY,
    VITE_VAPI_ASSISTANT_ID: import.meta.env.VITE_VAPI_ASSISTANT_ID,
    VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  };

  const multiLangEnvs = {
    VITE_VAPI_PUBLIC_KEY_VI: import.meta.env.VITE_VAPI_PUBLIC_KEY_VI,
    VITE_VAPI_ASSISTANT_ID_VI: import.meta.env.VITE_VAPI_ASSISTANT_ID_VI,
    VITE_VAPI_PUBLIC_KEY_FR: import.meta.env.VITE_VAPI_PUBLIC_KEY_FR,
    VITE_VAPI_ASSISTANT_ID_FR: import.meta.env.VITE_VAPI_ASSISTANT_ID_FR,
  };

  // Check critical variables
  const missingCritical = Object.entries(criticalEnvs)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingCritical.length > 0) {
    // Missing critical environment variables - check Render configuration
  } else {
    // All critical environment variables configured
  }

  // Check multi-language support
  const availableLanguages = Object.entries(multiLangEnvs)
    .filter(([_, value]) => !!value)
    .map(([key]) => key.split("_").pop()?.toLowerCase())
    .filter((lang, index, arr) => arr.indexOf(lang) === index);

  console.log("🌍 Available languages:", ["en", ...availableLanguages]);

  // Validate key formats
  Object.entries({ ...criticalEnvs, ...multiLangEnvs }).forEach(
    ([key, value]) => {
      if (value) {
        if (key.includes("OPENAI") && !value.startsWith("sk-")) {
          console.error(
            `🚨 Invalid format for ${key}: should start with 'sk-'`,
          );
        }
      }
    },
  );
}

// ✅ DEVELOPMENT DEBUG: Enhanced development info
if (import.meta.env.DEV) {
  console.log("🔧 Development Mode - Enhanced Debugging Enabled");

  // Make debug functions available globally
  (window as any).debugVapi = {
    checkEnv: () => {
      const envs = {
        base: {
          publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY,
          assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID,
        },
        vi: {
          publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY_VI,
          assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID_VI,
        },
        fr: {
          publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY_FR,
          assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID_FR,
        },
      };

      console.table(
        Object.entries(envs).map(([lang, config]) => ({
          Language: lang,
          "Public Key": config.publicKey ? "✅ Set" : "❌ Missing",
          "Assistant ID": config.assistantId ? "✅ Set" : "❌ Missing",
        })),
      );
    },

    testVapi: async () => {
      try {
        const { VapiProxyClient } = await import("./lib/vapiProxyClient");
        const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;

        if (!publicKey) {
          console.error("❌ No public key available for testing");
          return;
        }

        console.log("🔄 Testing Vapi proxy client...");
        const vapiClient = new VapiProxyClient();

        if (vapiClient) {
          console.log("✅ Vapi proxy client initialized successfully");
          console.log("🔍 Vapi proxy client:", vapiClient);
        } else {
          console.error("❌ Vapi proxy client initialization returned null");
        }
      } catch (error) {
        console.error("❌ Vapi test failed:", error);
      }
    },

    help: () => {
      console.log("🔧 Debug Commands:");
      console.log("- debugVapi.checkEnv() - Check environment variables");
      console.log("- debugVapi.testVapi() - Test Vapi initialization");
      console.log("- debugVapi.help() - Show this help");
    },
  };

  console.log("💡 Use debugVapi.help() for available debug commands");
}

// ✅ PRODUCTION DEBUG: Make Vapi debug available in production for troubleshooting
if (import.meta.env.PROD) {
  // Add a global function for users to export debug logs
  (window as any).exportVapiLogs = () => {
    try {
      // Access the vapiDebug global if available
      if ((window as any).vapiDebug) {
        const logs = (window as any).vapiDebug.exportLogs();

        // Create downloadable file
        const blob = new Blob([logs], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vapi-debug-logs-${new Date().toISOString().split("T")[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("📄 Debug logs exported successfully!");
        console.log("💡 Please send this file to support for troubleshooting");
      } else {
        console.error("❌ Vapi debug system not available");
        console.log("💡 Try refreshing the page and reproduce the issue first");
      }
    } catch (error) {
      console.error("❌ Failed to export logs:", error);
    }
  };

  // Make debug commands available in production for troubleshooting
  (window as any).vapiTroubleshoot = {
    exportLogs: () => (window as any).exportVapiLogs(),

    checkStatus: () => {
      console.log("🔍 Vapi Status Check:");

      const envCheck = {
        "Public Key": !!import.meta.env.VITE_VAPI_PUBLIC_KEY,
        "Assistant ID": !!import.meta.env.VITE_VAPI_ASSISTANT_ID,
        "OpenAI Key": !!import.meta.env.VITE_OPENAI_API_KEY,
      };

      console.table(envCheck);

      if ((window as any).vapiDebug) {
        const recentLogs = (window as any).vapiDebug.getLogs().slice(-10);
        console.log("📋 Recent Debug Logs (last 10):");
        recentLogs.forEach((log: any) => {
          const emoji =
            log.level === "error" ? "🚨" : log.level === "info" ? "📋" : "🔍";
          console.log(
            `${emoji} [${log.timestamp.split("T")[1].split(".")[0]}] ${log.message}`,
          );
        });
      }
    },

    help: () => {
      console.log("🆘 Vapi Troubleshooting Commands:");
      console.log(
        "- vapiTroubleshoot.exportLogs() - Download debug logs for support",
      );
      console.log(
        "- vapiTroubleshoot.checkStatus() - Check current Vapi status",
      );
      console.log("- vapiTroubleshoot.help() - Show this help");
      console.log("");
      console.log("🔧 If you encounter issues:");
      console.log("1. Run: vapiTroubleshoot.checkStatus()");
      console.log("2. Try to reproduce the issue");
      console.log("3. Run: vapiTroubleshoot.exportLogs()");
      console.log("4. Send the downloaded file to support");
    },
  };

  // Show help on first load in production
  setTimeout(() => {
    console.log("");
    console.log("🆘 Need help with voice assistant issues?");
    console.log("💡 Run: vapiTroubleshoot.help()");
  }, 2000);
}

// ✅ GLOBAL ERROR HANDLING: Catch unhandled errors
window.addEventListener("error", (event) => {
  if (
    event.error?.message?.includes("vapi") ||
    event.error?.message?.includes("Vapi")
  ) {
    console.error("🚨 Global Vapi Error:", event.error);

    if (import.meta.env.PROD) {
      // In production, try to provide helpful guidance
      console.log("🔧 Troubleshooting suggestions:");
      console.log("1. Check your internet connection");
      console.log("2. Refresh the page");
      console.log("3. Clear browser cache");
      console.log("4. Contact support if issue persists");
    }
  }
});

window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason?.message?.includes("vapi") ||
    event.reason?.message?.includes("Vapi")
  ) {
    console.error("🚨 Unhandled Vapi Promise Rejection:", event.reason);

    if (import.meta.env.PROD) {
      console.log(
        "🔧 Voice assistant encountered an issue. Please refresh and try again.",
      );
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  // ✅ TEMPORARY FIX: Disable StrictMode for WebSocket debugging
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>
);
