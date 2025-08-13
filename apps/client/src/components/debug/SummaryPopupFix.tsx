import { usePopupContext } from "@/context/PopupContext";
import { useSummaryManager } from "@/hooks/useSummaryManager";
import logger from "@shared/utils/logger";
import React, { useEffect, useRef } from "react";

// Extend window interface for global functions
declare global {
  interface Window {
    triggerSummaryPopup?: () => void;
    updateSummaryPopup?: () => void;
    storeCallId?: (callId: string) => void;
    resetSummarySystem?: () => void;
    testSummaryFix?: () => void;
    currentCallId?: string;
  }
}

/**
 * SummaryPopupFix - Emergency fix để đảm bảo Summary popup hoạt động
 * Component này đảm bảo global functions được setup đúng cách
 */
export const SummaryPopupFix: React.FC = () => {
  const summaryManager = useSummaryManager();
  const { addPopup } = usePopupContext();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log("🔧 [SummaryPopupFix] Initializing emergency fix...");

      // ✅ EMERGENCY FIX: Force setup global functions
      try {
        // Primary method: Use summaryManager
        if (summaryManager && summaryManager.showSummary) {
          window.triggerSummaryPopup = summaryManager.showSummary;
          window.resetSummarySystem = summaryManager.resetSystem;
          console.log(
            "✅ [SummaryPopupFix] Global functions set via summaryManager",
          );
        } else {
          console.warn(
            "⚠️ [SummaryPopupFix] summaryManager not available, using fallback",
          );

          // Fallback method: Direct popup creation
          window.triggerSummaryPopup = () => {
            console.log(
              "🎯 [SummaryPopupFix] Fallback triggerSummaryPopup called",
            );

            try {
              const popupId = addPopup({
                type: "summary",
                title: "Call Summary",
                content: React.createElement(
                  "div",
                  {
                    style: { padding: "20px", textAlign: "center" },
                  },
                  [
                    React.createElement(
                      "h3",
                      { key: "title" },
                      "📋 Call Summary",
                    ),
                    React.createElement(
                      "p",
                      { key: "message" },
                      "Your call has been completed successfully!",
                    ),
                    React.createElement(
                      "div",
                      {
                        key: "icon",
                        style: { fontSize: "48px", margin: "16px 0" },
                      },
                      "✅",
                    ),
                  ],
                ),
                priority: "medium",
                isActive: false,
              });

              console.log(
                "✅ [SummaryPopupFix] Fallback popup created:",
                popupId,
              );
            } catch (error) {
              console.error(
                "❌ [SummaryPopupFix] Fallback popup creation failed:",
                error,
              );
            }
          };
        }

        // Setup storeCallId function
        window.storeCallId = (callId: string) => {
          console.log("🔗 [SummaryPopupFix] Storing callId:", callId);
          (window as any).currentCallId = callId;
        };

        // Setup updateSummaryPopup for backward compatibility
        window.updateSummaryPopup = window.triggerSummaryPopup;

        console.log("✅ [SummaryPopupFix] All global functions setup complete");

        // Test the setup
        if (typeof window.triggerSummaryPopup === "function") {
          console.log(
            "✅ [SummaryPopupFix] window.triggerSummaryPopup is ready",
          );
        } else {
          console.error(
            "❌ [SummaryPopupFix] window.triggerSummaryPopup setup failed",
          );
        }

        isInitializedRef.current = true;

        // Expose debug function
        (window as any).testSummaryFix = () => {
          console.log("🧪 [SummaryPopupFix] Running test...");
          if (window.triggerSummaryPopup) {
            window.triggerSummaryPopup();
          } else {
            console.error("❌ window.triggerSummaryPopup not available");
          }
        };

        logger.debug(
          "[SummaryPopupFix] Emergency fix applied successfully",
          "Component",
        );
      } catch (error) {
        console.error("❌ [SummaryPopupFix] Setup failed:", error);
        logger.error(
          "[SummaryPopupFix] Failed to setup global functions",
          "Component",
          error,
        );
      }
    }

    return () => {
      if (isInitializedRef.current) {
        console.log("🧹 [SummaryPopupFix] Cleaning up...");
        delete window.triggerSummaryPopup;
        delete window.updateSummaryPopup;
        delete (window as any).storeCallId;
        delete (window as any).testSummaryFix;
        isInitializedRef.current = false;
      }
    };
  }, [summaryManager, addPopup]);

  // This component doesn't render anything visible
  return null;
};

export default SummaryPopupFix;
