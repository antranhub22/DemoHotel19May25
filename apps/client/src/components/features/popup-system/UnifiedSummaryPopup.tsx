import { usePopupContext } from "@/context/PopupContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSummaryManager } from "@/hooks/useSummaryManager";
import logger from "@shared/utils/logger";
import React from "react";
import { DebugLog } from "../debug/DebugWrapper";
import { SummaryProgression } from "./SummaryProgression";

export interface UnifiedSummaryPopupProps {
  className?: string;
}

/**
 * UNIFIED SUMMARY POPUP COMPONENT
 *
 * Replaces:
 * - MobileSummaryPopup
 * - DesktopSummaryPopup
 * - SummaryPopupContent (logic parts)
 *
 * Responsive design that adapts to device type
 */
export const UnifiedSummaryPopup: React.FC<UnifiedSummaryPopupProps> = ({
  className,
}) => {
  const { popups } = usePopupContext();
  const isMobile = useIsMobile();
  const {
    state,
    hideSummary,
    summaryData,
    progressionState,
    handleSendToFrontDesk,
    isSubmitting,
  } = useSummaryManager();

  // Find active summary popup
  const summaryPopup = popups.find((popup) => popup.type === "summary");
  const shouldShow = !!summaryPopup && state.isVisible;

  // Format timestamp with locale support
  const formatTimestamp = (date: Date) => {
    try {
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      logger.warn(
        "[UnifiedSummaryPopup] Date formatting error",
        "Component",
        error,
      );
      return date.toString();
    }
  };

  if (!shouldShow) {
    return null;
  }

  // ✅ RESPONSIVE: Layout classes based on device type
  const layoutClasses = isMobile
    ? {
        container:
          "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
        content:
          "bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto",
        header: "flex items-center justify-between mb-4",
        title: "text-xl font-semibold",
        closeButton: "text-gray-500 hover:text-gray-700",
      }
    : {
        container:
          "bg-white rounded-lg p-6 max-w-md w-full border border-gray-200 shadow-lg",
        content: "",
        header: "flex items-center justify-between mb-4",
        title: "text-xl font-semibold",
        closeButton: "text-gray-500 hover:text-gray-700",
      };

  // ✅ UNIFIED: Summary content component
  const SummaryContent = () => (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          📋 Call Summary
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {summaryData.source}
          </span>
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {formatTimestamp(summaryData.timestamp)} • Room:{" "}
          {summaryData.roomNumber}
        </p>
      </div>

      {/* Progress Section */}
      {progressionState.status !== "completed" && (
        <div className="mb-4">
          <SummaryProgression
            status={progressionState.status}
            progress={progressionState.progress}
            currentStep={progressionState.currentStep}
            totalSteps={progressionState.totalSteps}
            currentStepIndex={progressionState.currentStepIndex}
            estimatedTime={progressionState.estimatedTime}
            errorMessage={progressionState.errorMessage}
          />
        </div>
      )}

      {/* Content Section */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">
            Conversation Summary
          </h4>
          {summaryData.hasData ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
              {summaryData.content}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 text-center">
              ⏳ Call summary is being generated...
            </div>
          )}
        </div>

        {/* Service Requests */}
        {summaryData.items && summaryData.items.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
              🛎️ Service Requests
            </h4>
            <div className="space-y-2">
              {summaryData.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium ml-3">
                    Qty: {item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {summaryData.hasData && (
          <div className="border-t border-gray-200 pt-4">
            <div className="text-xs text-gray-500 text-center mb-3">
              ✅ Summary generated successfully
            </div>
            <div className="flex gap-3">
              <button
                onClick={hideSummary}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
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
        {!summaryData.hasData && (
          <div className="border-t border-gray-200 pt-4 text-xs text-gray-500 text-center">
            ⏳ Processing call data • Summary will appear automatically
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            ❌ {state.error}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <DebugLog
        message="UnifiedSummaryPopup render state"
        data={{
          isMobile,
          shouldShow,
          summaryPopupFound: !!summaryPopup,
          summaryPopupId: summaryPopup?.id,
          stateVisible: state.isVisible,
          stateProcessing: state.isProcessing,
          stateHasData: state.hasData,
          progressionStatus: progressionState.status,
        }}
      />

      {isMobile ? (
        // Mobile: Full-screen modal
        <div className={layoutClasses.container}>
          <div className={layoutClasses.content}>
            <div className={layoutClasses.header}>
              <h2 className={layoutClasses.title}>📋 Call Summary</h2>
              <button
                onClick={hideSummary}
                className={layoutClasses.closeButton}
              >
                ✕
              </button>
            </div>
            <SummaryContent />
          </div>
        </div>
      ) : (
        // Desktop: Grid positioned card
        <div className={`${layoutClasses.container} ${className || ""}`}>
          <div className={layoutClasses.header}>
            <h2 className={layoutClasses.title}>📋 Call Summary</h2>
            <button onClick={hideSummary} className={layoutClasses.closeButton}>
              ✕
            </button>
          </div>
          <SummaryContent />
        </div>
      )}
    </>
  );
};
