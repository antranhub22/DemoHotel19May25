import { usePopupContext } from "@/context/PopupContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSummaryManager } from "@/hooks/useSummaryManager";
import logger from "@shared/utils/logger";
import React, { useState, useEffect } from "react";
import { DebugLog } from "../debug/DebugWrapper";
import { SummaryProgression } from "./SummaryProgression";

export interface UnifiedSummaryPopupProps {
  className?: string;
}

/**
 * UNIFIED SUMMARY POPUP COMPONENT
 *
 * Replaces legacy summary components with unified responsive design
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
    updateSummaryContent,
    updateServiceItems,
  } = useSummaryManager();

  // ✅ NEW: Order modification state
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedText, setModifiedText] = useState("");
  const [modifiedItems, setModifiedItems] = useState<any[]>([]);

  // Initialize modification data when summary data changes
  useEffect(() => {
    if (summaryData.hasData && !isModifying) {
      setModifiedText(summaryData.content || "");
      setModifiedItems(summaryData.items || []);
    }
  }, [
    summaryData.hasData,
    summaryData.content,
    summaryData.items,
    isModifying,
  ]);

  // ✅ NEW: Modification handlers
  const handleStartModification = () => {
    setIsModifying(true);
    logger.debug("📝 Started order modification", "UnifiedSummaryPopup");
  };

  const handleCancelModification = () => {
    setIsModifying(false);
    setModifiedText(summaryData.content || "");
    setModifiedItems(summaryData.items || []);
    logger.debug("❌ Cancelled order modification", "UnifiedSummaryPopup");
  };

  const handleSaveModification = () => {
    // ✅ Apply modifications to summary data via useSummaryManager
    updateSummaryContent(modifiedText);
    updateServiceItems(modifiedItems);
    setIsModifying(false);

    logger.debug("✅ Saved order modifications", "UnifiedSummaryPopup", {
      modifiedText: modifiedText.length,
      modifiedItems: modifiedItems.length,
    });
  };

  const handleItemQuantityChange = (index: number, newQuantity: number) => {
    const updated = [...modifiedItems];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        quantity: Math.max(1, newQuantity),
      };
      setModifiedItems(updated);
    }
  };

  const handleRemoveItem = (index: number) => {
    const updated = modifiedItems.filter((_, i) => i !== index);
    setModifiedItems(updated);
  };

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
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Conversation Summary</h4>
            {summaryData.hasData && !isModifying && (
              <button
                onClick={handleStartModification}
                className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
              >
                ✏️ Edit
              </button>
            )}
          </div>
          {summaryData.hasData ? (
            isModifying ? (
              <div className="space-y-3">
                <textarea
                  value={modifiedText}
                  onChange={(e) => setModifiedText(e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Edit your order details..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveModification}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors"
                  >
                    ✅ Save
                  </button>
                  <button
                    onClick={handleCancelModification}
                    className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-md transition-colors"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                {summaryData.content}
              </div>
            )
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 text-center">
              ⏳ Call summary is being generated...
            </div>
          )}
        </div>

        {/* Service Requests */}
        {(summaryData.items && summaryData.items.length > 0) ||
          (modifiedItems.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                🛎️ Service Requests
                {isModifying && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    Editing Mode
                  </span>
                )}
              </h4>
              <div className="space-y-2">
                {(isModifying ? modifiedItems : summaryData.items).map(
                  (item: any, index: number) => (
                    <div
                      key={index}
                      className={`bg-white border border-gray-200 rounded-lg p-3 ${
                        isModifying ? "border-blue-200 bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.description}
                          </div>
                        </div>

                        {isModifying ? (
                          <div className="flex items-center gap-2 ml-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  handleItemQuantityChange(
                                    index,
                                    item.quantity - 1,
                                  )
                                }
                                className="w-6 h-6 text-xs bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="text-sm text-gray-600 font-medium min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleItemQuantityChange(
                                    index,
                                    item.quantity + 1,
                                  )
                                }
                                className="w-6 h-6 text-xs bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="w-6 h-6 text-xs bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center"
                              title="Remove item"
                            >
                              🗑️
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600 font-medium ml-3">
                            Qty: {item.quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}

        {/* Action Buttons */}
        {summaryData.hasData && !isModifying && (
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

        {/* Modification Mode Notice */}
        {isModifying && (
          <div className="border-t border-blue-200 pt-4">
            <div className="text-xs text-blue-600 text-center mb-3 bg-blue-50 p-2 rounded-lg">
              📝 Editing mode active - Save or cancel changes to continue
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
