import * as React from "react";
// removed unused Room type
import { usePopup } from "@/components/features/popup-system/PopupManager";
import { useAssistant } from "@/context";
import { useCallback, useEffect, useRef } from "react";

interface UseConfirmHandlerReturn {
  // ✅ SIMPLIFIED: Clean auto-trigger summary function
  autoTriggerSummary: () => void;
  // ✅ UTILITY: Update popup content when WebSocket data arrives
  updateSummaryPopup: (summary: string, serviceRequests: any[]) => void;
  // ✅ NEW: Reset summary system
  resetSummarySystem: () => void;
  // ✅ NEW: Store callId for WebSocket integration
  storeCallId: (callId: string) => void;
}

// ✅ FIX: Enhanced summary popup trigger with error handling
export const useConfirmHandler = (): UseConfirmHandlerReturn => {
  const { serviceRequests, setCallSummary, setServiceRequests } =
    useAssistant();
  const { showSummary, removePopup } = usePopup();
  const summaryPopupIdRef = useRef<string>("");

  // ✅ FIX: Enhanced auto-trigger summary function with production checks
  const autoTriggerSummary = useCallback(async () => {
    try {
      // ✅ FIX: Check if call data exists
      if (!serviceRequests || serviceRequests.length === 0) {
        console.log(
          "⚠️ [DEBUG] No service requests found, showing fallback summary",
        );
        showSummary("Call completed successfully!", {
          title: "Call Complete",
          priority: "medium",
        });
        return;
      }

      // ✅ FIX: Enhanced summary creation with error handling
      const summaryData = {
        roomNumber: serviceRequests[0]?.details?.roomNumber || "Unknown",
        requests: serviceRequests.map((req) => ({
          service: req.serviceType,
          details: req.requestText,
        })),
        timestamp: new Date(),
      };

      const summaryElement = React.createElement(
        "div",
        {
          style: {
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            marginBottom: "16px",
          },
        },
        [
          React.createElement("h3", { key: "title" }, "📋 Call Summary"),
          React.createElement(
            "p",
            { key: "room" },
            `Room: ${summaryData.roomNumber}`,
          ),
          React.createElement(
            "p",
            { key: "time" },
            `Time: ${summaryData.timestamp.toLocaleTimeString()}`,
          ),
          ...summaryData.requests.map((req, index) =>
            React.createElement("div", { key: `req-${index}` }, [
              React.createElement("strong", { key: "service" }, req.service),
              React.createElement(
                "span",
                { key: "details" },
                `: ${req.details}`,
              ),
            ]),
          ),
        ],
      );

      const popupId = showSummary(summaryElement, {
        title: "Call Complete",
        priority: "high",
      });

      summaryPopupIdRef.current = popupId;
      console.log(
        "✅ [DEBUG] Summary popup created successfully, ID:",
        popupId,
      );
    } catch (error) {
      console.error("❌ [DEBUG] Failed to trigger summary popup:", error);

      // ✅ FIX: Fallback summary on error
      showSummary("Call completed. Please check with staff for details.", {
        title: "Call Complete",
        priority: "medium",
      });
    }
  }, [showSummary, serviceRequests]);

  // ✅ FIX: Enhanced update summary popup function
  const updateSummaryPopup = useCallback(
    (summary: string) => {
      try {
        // Remove existing summary popup
        if (summaryPopupIdRef.current) {
          removePopup(summaryPopupIdRef.current);
        }

        // Create new summary popup with enhanced content
        const realSummaryElement = React.createElement(
          "div",
          {
            style: {
              padding: "16px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              textAlign: "left",
              fontSize: "14px",
              lineHeight: "1.4",
              whiteSpace: "pre-wrap",
            },
          },
          summary || "Your call has been processed successfully!",
        );

        const newPopupId = showSummary(realSummaryElement, {
          title: "Call Complete",
          priority: "medium",
        });

        summaryPopupIdRef.current = newPopupId;
        console.log(
          "✅ [DEBUG] Updated summary popup created, ID:",
          newPopupId,
        );
      } catch (error) {
        console.error("❌ [DEBUG] Failed to update summary popup:", error);
      }
    },
    [showSummary, removePopup, setCallSummary, setServiceRequests],
  );

  // ✅ FIX: Enhanced reset summary system
  const resetSummarySystem = useCallback(() => {
    try {
      console.log("🔄 [DEBUG] Resetting summary system...");

      // Remove existing summary popup
      if (summaryPopupIdRef.current) {
        removePopup(summaryPopupIdRef.current);
        summaryPopupIdRef.current = "";
      }

      // Clear call summary and service requests
      setCallSummary({
        callId: "",
        tenantId: "",
        content: "",
        timestamp: new Date(),
      });
      setServiceRequests([]);

      console.log("✅ [DEBUG] Summary system reset successfully");
    } catch (error) {
      console.error("❌ [DEBUG] Failed to reset summary system:", error);
    }
  }, [removePopup, setCallSummary, setServiceRequests]);

  // ✅ NEW: Store callId for WebSocket integration
  const storeCallId = useCallback((callId: string) => {
    console.log("🔗 [DEBUG] Storing callId for WebSocket integration:", callId);
    // Store callId globally for WebSocket to use
    (window as any).currentCallId = callId;
  }, []);

  // ✅ FIX: Connect to global window for RefactoredAssistantContext access
  useEffect(() => {
    console.log("🔗 [DEBUG] Connecting useConfirmHandler to window");
    window.triggerSummaryPopup = autoTriggerSummary;
    window.updateSummaryPopup = updateSummaryPopup;
    window.resetSummarySystem = resetSummarySystem;
    window.storeCallId = storeCallId;

    return () => {
      console.log("🔗 [DEBUG] Cleaning up useConfirmHandler from window");
      delete window.triggerSummaryPopup;
      delete window.updateSummaryPopup;
      delete window.resetSummarySystem;
      delete window.storeCallId;
    };
  }, [autoTriggerSummary, updateSummaryPopup, resetSummarySystem, storeCallId]);

  return {
    autoTriggerSummary,
    updateSummaryPopup,
    resetSummarySystem,
    storeCallId,
  };
};
