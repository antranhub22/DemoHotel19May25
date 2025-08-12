import { useAssistant } from "@/context";
import { usePopupContext } from "@/context/PopupContext";
import logger from "@shared/utils/logger";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSendToFrontDeskHandler } from "./useSendToFrontDeskHandler";
import { useSummaryProgression } from "./useSummaryProgression";

export interface SummaryManagerState {
  isVisible: boolean;
  isProcessing: boolean;
  hasData: boolean;
  error: string | null;
}

export interface SummaryManagerReturn {
  // State
  state: SummaryManagerState;

  // Core Actions
  showSummary: () => void;
  hideSummary: () => void;
  resetSystem: () => void;

  // Content Access
  summaryData: any;
  progressionState: any;

  // Action Handlers
  handleSendToFrontDesk: () => void;
  isSubmitting: boolean;

  // ✅ NEW: Modification support
  updateSummaryContent: (newContent: string) => void;
  updateServiceItems: (newItems: any[]) => void;
}

/**
 * UNIFIED SUMMARY MANAGER
 *
 * Replaces:
 * - useConfirmHandler
 * - PopupManager.showSummary
 * - Multiple auto-trigger points
 *
 * Single source of truth for all summary operations
 */
export const useSummaryManager = (): SummaryManagerReturn => {
  const {
    serviceRequests,
    language,
    callDetails,
    callSummary,
    translateToVietnamese,
    vietnameseSummary,
    setCallSummary,
    setServiceRequests,
    clearTranscripts,
    clearModelOutput,
    setOrderSummary,
    setEmailSentForCurrentSession,
    setRequestReceivedAt,
    setVietnameseSummary,
    setRecentRequest,
  } = useAssistant();

  const { addPopup, removePopup, clearAllPopups } = usePopupContext();
  const {
    progression,
    startProcessing,
    complete,
    reset: resetProgression,
  } = useSummaryProgression();

  // ✅ UNIFIED: Single state for entire summary system
  const [state, setState] = useState<SummaryManagerState>({
    isVisible: false,
    isProcessing: false,
    hasData: false,
    error: null,
  });

  const activePopupIdRef = useRef<string>("");
  const isInitializedRef = useRef(false);

  // ✅ UNIFIED: Send to FrontDesk with integrated callbacks
  const { handleSendToFrontDesk, isSubmitting } = useSendToFrontDeskHandler({
    onSuccess: () => {
      logger.success(
        "✅ Request sent to Front Desk successfully!",
        "SummaryManager",
      );
      // Auto-hide summary after 2 seconds
      setTimeout(() => {
        resetSystem();
      }, 2000);
    },
    onError: (error) => {
      setState((prev) => ({ ...prev, error }));
      logger.error(`❌ ${error}`, "SummaryManager");
    },
  });

  // ✅ NEW: Modification functions
  const updateSummaryContent = useCallback(
    (newContent: string) => {
      // ✅ FIX: Update existing CallSummary object with new content
      const currentSummary = callSummary;
      if (currentSummary) {
        setCallSummary({
          ...currentSummary,
          content: newContent,
        });
      } else {
        // Create new CallSummary if none exists
        setCallSummary({
          callId: callDetails?.id || `temp-call-${Date.now()}`,
          content: newContent,
          timestamp: new Date(),
          tenantId: "default",
        });
      }
      logger.debug("📝 Summary content updated", "SummaryManager", {
        length: newContent.length,
      });
    },
    [setCallSummary, callSummary, callDetails],
  );

  const updateServiceItems = useCallback(
    (newItems: any[]) => {
      setServiceRequests(newItems);
      logger.debug("🛎️ Service items updated", "SummaryManager", {
        itemCount: newItems.length,
      });
    },
    [setServiceRequests],
  );

  // ✅ UNIFIED: Generate summary data with enhanced logic
  const getSummaryData = useCallback(() => {
    if (serviceRequests && serviceRequests.length > 0) {
      const roomNumber =
        serviceRequests[0]?.details?.roomNumber ||
        callDetails?.roomNumber ||
        "Unknown";

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

    return {
      source: "No data",
      roomNumber: callDetails?.roomNumber || "Unknown",
      content: "Call summary not available yet",
      items: [],
      timestamp: new Date(),
      hasData: false,
    };
  }, [serviceRequests, callDetails]);

  const summaryData = getSummaryData();

  // ✅ UNIFIED: Single auto-complete logic
  useEffect(() => {
    if (state.isProcessing && summaryData.hasData) {
      logger.debug(
        "✅ [SummaryManager] Auto-completing with data",
        "Component",
      );
      complete();
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        hasData: true,
      }));
    }
  }, [state.isProcessing, summaryData.hasData, complete]);

  // ✅ UNIFIED: Smart timeout with environment detection
  useEffect(() => {
    if (state.isProcessing && !summaryData.hasData) {
      const timeoutMs = import.meta.env.DEV ? 15000 : 8000;
      const timeout = setTimeout(() => {
        logger.debug(
          "⏰ [SummaryManager] Completing with fallback after timeout",
          "Component",
        );
        complete();
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          hasData: summaryData.hasData,
        }));
      }, timeoutMs);

      return () => clearTimeout(timeout);
    }
  }, [state.isProcessing, summaryData.hasData, complete]);

  // ✅ UNIFIED: Vietnamese translation with debouncing
  useEffect(() => {
    const translateContent = async () => {
      try {
        if (
          summaryData.hasData &&
          language !== "vi" &&
          !vietnameseSummary &&
          summaryData.content.length > 20
        ) {
          await translateToVietnamese(summaryData.content);
        }
      } catch (error) {
        logger.warn("[SummaryManager] Translation error", "Component", error);
      }
    };

    const timeoutId = setTimeout(translateContent, 500);
    return () => clearTimeout(timeoutId);
  }, [
    summaryData.hasData,
    summaryData.content,
    language,
    vietnameseSummary,
    translateToVietnamese,
  ]);

  // ✅ CORE ACTION: Show Summary
  const showSummary = useCallback(() => {
    try {
      logger.debug("📋 [SummaryManager] Showing summary", "Component");

      // Hide any existing summary
      if (activePopupIdRef.current) {
        removePopup(activePopupIdRef.current);
      }

      // Create new summary popup
      const popupId = addPopup({
        type: "summary",
        title: "Call Summary",
        content: null, // Content will be rendered by UnifiedSummaryComponent
        priority: "medium",
        isActive: false,
      });

      activePopupIdRef.current = popupId;

      setState((prev) => ({
        ...prev,
        isVisible: true,
        isProcessing: true,
        error: null,
      }));

      // Start progression
      startProcessing();

      logger.debug("✅ [SummaryManager] Summary popup created", "Component", {
        popupId,
      });
    } catch (error) {
      logger.error(
        "❌ [SummaryManager] Failed to show summary",
        "Component",
        error,
      );
      setState((prev) => ({ ...prev, error: String(error) }));
    }
  }, [addPopup, removePopup, startProcessing]);

  // ✅ CORE ACTION: Hide Summary
  const hideSummary = useCallback(() => {
    if (activePopupIdRef.current) {
      removePopup(activePopupIdRef.current);
      activePopupIdRef.current = "";
    }

    setState((prev) => ({
      ...prev,
      isVisible: false,
      isProcessing: false,
    }));

    logger.debug("🙈 [SummaryManager] Summary hidden", "Component");
  }, [removePopup]);

  // ✅ CORE ACTION: Reset System
  const resetSystem = useCallback(() => {
    try {
      logger.debug(
        "🔄 [SummaryManager] Resetting entire summary system",
        "Component",
      );

      // Clear popups
      if (activePopupIdRef.current) {
        removePopup(activePopupIdRef.current);
        activePopupIdRef.current = "";
      }
      clearAllPopups();

      // Reset state
      setState({
        isVisible: false,
        isProcessing: false,
        hasData: false,
        error: null,
      });

      // Reset progression
      resetProgression();

      // Clear assistant context
      setCallSummary(null);
      setServiceRequests([]);
      clearTranscripts();
      clearModelOutput();
      setOrderSummary(null);
      setEmailSentForCurrentSession(false);
      setRequestReceivedAt(null);
      setVietnameseSummary(null);

      logger.debug("✅ [SummaryManager] System reset completed", "Component");
    } catch (error) {
      logger.error("❌ [SummaryManager] Reset failed", "Component", error);
    }
  }, [
    removePopup,
    clearAllPopups,
    resetProgression,
    setCallSummary,
    setServiceRequests,
    clearTranscripts,
    clearModelOutput,
    setOrderSummary,
    setEmailSentForCurrentSession,
    setRequestReceivedAt,
    setVietnameseSummary,
  ]);

  // ✅ GLOBAL INTEGRATION: Connect to window for legacy compatibility
  useEffect(() => {
    if (!isInitializedRef.current) {
      logger.debug(
        "🔗 [SummaryManager] Connecting to global window",
        "Component",
      );

      // Replace all legacy global functions
      window.triggerSummaryPopup = showSummary;
      window.updateSummaryPopup = showSummary; // Same function now
      window.resetSummarySystem = resetSystem;
      window.storeCallId = (callId: string) => {
        logger.debug("🔗 [SummaryManager] Storing callId", "Component", {
          callId,
        });
        (window as any).currentCallId = callId;
      };

      isInitializedRef.current = true;
    }

    return () => {
      if (isInitializedRef.current) {
        logger.debug(
          "🔗 [SummaryManager] Cleaning up global window",
          "Component",
        );
        delete window.triggerSummaryPopup;
        delete window.updateSummaryPopup;
        delete window.resetSummarySystem;
        delete (window as any).storeCallId;
        isInitializedRef.current = false;
      }
    };
  }, [showSummary, resetSystem]);

  return {
    state,
    showSummary,
    hideSummary,
    resetSystem,
    summaryData,
    progressionState: progression,
    handleSendToFrontDesk,
    isSubmitting,

    // ✅ NEW: Modification support
    updateSummaryContent,
    updateServiceItems,
  };
};
