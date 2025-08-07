import * as React from "react";
import type { Room } from "../types/common.types";
import { useAssistant } from "@/context";
import { useSendToFrontDeskHandler } from "@/hooks/useSendToFrontDeskHandler";
import { useSummaryProgression } from "@/hooks/useSummaryProgression";
import logger from "@shared/utils/logger";
import { useEffect } from "react";
import { SummaryProgression } from "./SummaryProgression";

// Main Summary Popup Component - Uses OpenAI-only summary system
export interface SummaryPopupContentProps {
  className?: string;
  children?: React.ReactNode;
  // TODO: Add specific props for SummaryPopupContent
}

const SummaryPopupContent: React.FC<SummaryPopupContentProps> = () => {
  const { serviceRequests, language, callDetails } = useAssistant();
  const { progression, startProcessing, complete } = useSummaryProgression();

  // ✅ NEW: Add Send to FrontDesk functionality
  const { handleSendToFrontDesk, isSubmitting } = useSendToFrontDeskHandler({
    onSuccess: () => {
      alert("✅ Request sent to Front Desk successfully!");
    },
    onError: (error) => {
      alert(`❌ ${error}`);
    },
  });

  // OpenAI-Only Summary Logic: Only use OpenAI serviceRequests
  const getSummaryData = () => {
    console.log("🔍 [DEBUG] SummaryPopupContent.getSummaryData called:", {
      hasServiceRequests: !!serviceRequests,
      serviceRequestsCount: serviceRequests?.length || 0,
      hasCallDetails: !!callDetails,
      language,
    });

    // OpenAI serviceRequests (enhanced processing)
    if (serviceRequests && serviceRequests.length > 0) {
      const roomNumber = serviceRequests[0]?.details?.roomNumber || "Unknown";

      console.log("📋 [DEBUG] Found service requests:", {
        count: serviceRequests.length,
        roomNumber,
        requests: serviceRequests.map((req) => ({
          serviceType: req.serviceType,
          requestText: req.requestText?.substring(0, 50) + "...",
        })),
      });

      return {
        source: "OpenAI Analysis",
        roomNumber,
        content: serviceRequests
          .map((req) => `${req.serviceType}: ${req.requestText}`)
          .join("\n"),
        items: serviceRequests.map((req) => ({
          name: req.serviceType,
          description: req.requestText,
          quantity: 1,
          price: 10,
        })),
        timestamp: new Date(),
        hasData: true,
      };
    }

    console.log("⚠️ [DEBUG] No service requests found, using fallback");

    // Fallback: No summary available
    return {
      source: "No data",
      roomNumber: callDetails?.roomNumber || "Unknown",
      content: "Call summary not available yet",
      items: [],
      timestamp: new Date(),
      hasData: false,
    };
  };

  // Auto-start processing when popup opens
  useEffect(() => {
    if (progression.status === "idle") {
      console.log("🚀 [DEBUG] Starting summary processing...");
      startProcessing();
    }
  }, [progression.status, startProcessing]);

  // Auto-complete when data is available OR after timeout
  useEffect(() => {
    if (progression.status === "processing") {
      // Complete immediately if we have data
      if (serviceRequests?.length > 0) {
        console.log("✅ [DEBUG] Completing with service requests data");
        complete();
        return;
      }

      // ✅ FIX: Timeout fallback - complete after 10 seconds even without data
      const timeout = setTimeout(() => {
        console.log("⏰ [DEBUG] Completing with fallback data after timeout");
        complete();
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [progression.status, serviceRequests, complete]);

  const summary = getSummaryData();

  const formatTimestamp = (date: Date) => {
    try {
      return date.toLocaleString(language === "vi" ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      logger.warn(
        "[SummaryPopupContent] Date formatting error:",
        "Component",
        error,
      );
      return date.toString();
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "400px",
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "20px",
          borderBottom: "1px solid #E5E7EB",
          paddingBottom: "16px",
        }}
      >
        <h3
          style={{
            color: "#1F2937",
            marginBottom: "8px",
            fontSize: "20px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📋 Call Summary
          <span
            style={{
              fontSize: "12px",
              color: "#6B7280",
              background: "#F3F4F6",
              padding: "2px 8px",
              borderRadius: "12px",
              fontWeight: "400",
            }}
          >
            {summary.source}
          </span>
        </h3>
        <p style={{ color: "#6B7280", fontSize: "14px", margin: "0" }}>
          {formatTimestamp(summary.timestamp)} • Room: {summary.roomNumber}
        </p>
      </div>

      {/* Summary Progression */}
      {progression.status !== "completed" && (
        <div style={{ marginBottom: "20px" }}>
          <SummaryProgression
            status={progression.status}
            progress={progression.progress}
            currentStep={progression.currentStep}
            totalSteps={progression.totalSteps}
            currentStepIndex={progression.currentStepIndex}
            estimatedTime={progression.estimatedTime}
            errorMessage={progression.errorMessage}
          />
        </div>
      )}

      {/* Summary Content */}
      <div style={{ marginBottom: "20px" }}>
        <h4
          style={{
            color: "#374151",
            fontSize: "16px",
            marginBottom: "12px",
            fontWeight: "500",
          }}
        >
          Conversation Summary
        </h4>

        {summary.hasData ? (
          <div
            style={{
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "16px",
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#374151",
              whiteSpace: "pre-wrap",
            }}
          >
            {summary.content}
          </div>
        ) : (
          <div
            style={{
              background: "#FEF3C7",
              border: "1px solid #F59E0B",
              borderRadius: "8px",
              padding: "16px",
              fontSize: "14px",
              color: "#92400E",
              textAlign: "center",
            }}
          >
            ⏳ Call summary is being generated...
          </div>
        )}
      </div>

      {/* Service Requests */}
      {summary.items && summary.items.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h4
            style={{
              color: "#374151",
              fontSize: "16px",
              marginBottom: "12px",
              fontWeight: "500",
            }}
          >
            🛎️ Service Requests
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {summary.items.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  padding: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "500",
                      color: "#1F2937",
                      marginBottom: "4px",
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6B7280" }}>
                    {item.description}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    fontWeight: "500",
                    marginLeft: "12px",
                  }}
                >
                  Qty: {item.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ NEW: Action Buttons Section */}
      {summary.hasData && (
        <div
          style={{
            borderTop: "1px solid #E5E7EB",
            paddingTop: "16px",
          }}
        >
          {/* Status Message */}
          <div
            style={{
              fontSize: "12px",
              color: "#6B7280",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            ✅ Summary generated successfully
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              onClick={() => window.location.reload()}
            >
              Cancel
            </button>
            <button
              onClick={handleSendToFrontDesk}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </>
              ) : (
                "Send to FrontDesk"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Processing State */}
      {!summary.hasData && (
        <div
          style={{
            borderTop: "1px solid #E5E7EB",
            paddingTop: "16px",
            fontSize: "12px",
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          ⏳ Processing call data • Summary will appear automatically
        </div>
      )}
    </div>
  );
};

export { SummaryPopupContent };
