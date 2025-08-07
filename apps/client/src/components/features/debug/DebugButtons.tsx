import { createElement } from "react";
import { usePopup } from "../popup-system/PopupManager";
import { DebugWrapper } from "./DebugWrapper";
import { useIsMobile } from "@/hooks/useIsMobile";

// Debug Buttons Component - Extracted from Interface1.tsx
export const DebugButtons = () => {
  const {
    showSummary,
    emergencyCleanup,
    resetSummarySystem,
    forceShowSummary,
  } = usePopup();

  const isMobile = useIsMobile();

  // Test Summary Popup Button
  const handleTestSummary = () => {
    console.log("🧪 Test Summary button clicked!");
    const testSummaryElement = createElement(
      "div",
      {
        style: {
          padding: "20px",
          textAlign: "center",
          maxWidth: "400px",
        },
      },
      [
        createElement(
          "h3",
          {
            key: "title",
            style: {
              marginBottom: "16px",
              color: "#333",
              fontSize: "18px",
              fontWeight: "600",
            },
          },
          "🧪 Test Summary",
        ),
        createElement(
          "p",
          {
            key: "message",
            style: {
              marginBottom: "16px",
              lineHeight: "1.5",
              color: "#333",
              fontSize: "16px",
            },
          },
          "This is a test summary popup!",
        ),
      ],
    );
    showSummary(testSummaryElement, {
      title: "Test Summary",
      priority: "medium" as const,
    });
  };

  // Emergency Cleanup Button
  const handleEmergencyCleanup = () => {
    console.log("🚨 Emergency cleanup button clicked!");

    // First reset summary system
    resetSummarySystem();

    // Then emergency cleanup if needed
    setTimeout(() => {
      emergencyCleanup();
    }, 100);

    alert("🧹 Emergency cleanup completed! Check console for details.");
  };

  // Force Display Summary Button
  const handleForceSummary = () => {
    console.log("🚀 Force display summary button clicked!");

    // Force display summary popup
    forceShowSummary();

    alert("🚀 Force summary popup triggered! Check console for details.");
  };

  return (
    <DebugWrapper>
      <>
        {/* Test Summary Popup Button */}
        <div
          className={`fixed z-[9999] ${isMobile ? "bottom-20 right-4" : "bottom-4 right-4"}`}
          style={{
            position: "fixed",
            bottom: isMobile ? "80px" : "16px",
            right: "16px",
            zIndex: 9999,
            backgroundColor: "#10b981",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            outline: "none",
          }}
        >
          <button
            onClick={handleTestSummary}
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "none",
              outline: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            🧪 Test Summary
          </button>
        </div>

        {/* Emergency Cleanup Button */}
        <div
          className={`fixed z-[9999] ${isMobile ? "bottom-20 right-20" : "bottom-4 right-32"}`}
          style={{
            position: "fixed",
            bottom: isMobile ? "80px" : "16px",
            right: isMobile ? "80px" : "128px",
            zIndex: 9999,
            backgroundColor: "#ef4444",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            outline: "none",
          }}
        >
          <button
            onClick={handleEmergencyCleanup}
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "none",
              outline: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            🚨 Cleanup
          </button>
        </div>

        {/* Force Display Summary Button */}
        <div
          className={`fixed z-[9999] ${isMobile ? "bottom-20 right-36" : "bottom-4 right-48"}`}
          style={{
            position: "fixed",
            bottom: isMobile ? "80px" : "16px",
            right: isMobile ? "144px" : "192px",
            zIndex: 9999,
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            outline: "none",
          }}
        >
          <button
            onClick={handleForceSummary}
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "none",
              outline: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            🚀 Force Summary
          </button>
        </div>
      </>
    </DebugWrapper>
  );
};
