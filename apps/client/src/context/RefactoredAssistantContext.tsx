/// <reference types="vite/client" />

// Type declaration for import.meta
declare global {
  interface Window {
    triggerSummaryPopup?: () => void;
    storeCallId?: (callId: string) => void;
  }
}

import type { ServiceRequest } from '../types/common.types';
import type { Language } from '@shared/types';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from "react";

// Import types
import { CallProvider, useCall } from "@/context/contexts/CallContext";

// Import all new focused contexts
import {
  LanguageProvider,
  useLanguage,
} from "@/context/contexts/LanguageContext";
import {
  OrderProvider,
  RecentRequest,
  useOrder,
} from "@/context/contexts/OrderContext";
import { useVapi, VapiProvider } from "@/context/contexts/VapiContextSimple";
import { HotelConfiguration } from "@/hooks/useHotelConfiguration";
import {
  ActiveOrder,
  CallDetails,
  CallSummary,
  Order,
  OrderSummary,
  ServiceRequest,
  Transcript,
} from "@/types";
import logger from '@shared/utils/logger';
import { useAuth } from './AuthContext.tsx';
import {
  TranscriptProvider,
  useTranscript,
} from './contexts/TranscriptContext.tsx';
// Define Language type
export type Language = "en" | "fr" | "zh" | "ru" | "ko" | "vi";

// Combined interface that exposes all context functionality
export interface RefactoredAssistantContextType {
  // From CallContext
  callDuration: number;
  setCallDuration: (duration: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  startCall: (language?: string) => Promise<void>; // ✅ FIXED: Add optional language parameter
  endCall: () => void;
  isCallActive: boolean;
  isEndingCall: boolean;
  addCallEndListener: (listener: () => void) => () => void;

  // From TranscriptContext
  transcripts: Transcript[];
  setTranscripts: (transcripts: Transcript[]) => void;
  addTranscript: (transcript: Omit<Transcript, "id" | "timestamp">) => void;
  modelOutput: string[];
  setModelOutput: (output: string[]) => void;
  addModelOutput: (output: string) => void;
  clearTranscripts: () => void;
  clearModelOutput: () => void;

  // From LanguageContext
  language: Language;
  setLanguage: (lang: Language) => void;
  vietnameseSummary: string | null;
  setVietnameseSummary: (summary: string) => void;
  translateToVietnamese: (text: string) => Promise<string>;

  // From OrderContext
  order: Order | null;
  setOrder: (order: Order | null) => void;
  orderSummary: OrderSummary | null;
  setOrderSummary: (summary: OrderSummary | null) => void;
  callSummary: CallSummary | null;
  setCallSummary: (summary: CallSummary | null) => void;
  serviceRequests: ServiceRequest[];
  setServiceRequests: (requests: ServiceRequest[]) => void;
  activeOrders: ActiveOrder[];
  setActiveOrders: React.Dispatch<React.SetStateAction<ActiveOrder[]>>;
  addActiveOrder: (order: ActiveOrder) => void;
  // ✅ NEW: Recent request for post-submit display
  recentRequest: RecentRequest | null;
  setRecentRequest: (request: RecentRequest | null) => void;
  emailSentForCurrentSession: boolean;
  setEmailSentForCurrentSession: (sent: boolean) => void;
  requestReceivedAt: Date | null;
  setRequestReceivedAt: (date: Date | null) => void;

  // From AuthContext (simplified)
  tenantId: string | null;

  // From VapiContext
  micLevel: number;
  callDetails: CallDetails | null;
  setCallDetails: (details: CallDetails | null) => void;
  initializeVapi: (
    language: string,
    hotelConfig?: HotelConfiguration | null,
  ) => Promise<void>;
  startVapiCall: (assistantId: string) => Promise<any>;
  endVapiCall: () => void;
  resetVapi: () => Promise<void>;
}

const RefactoredAssistantContext = createContext<
  RefactoredAssistantContextType | undefined
>(undefined);

// Wrapper hook that combines all context values
function useRefactoredAssistantProvider(): RefactoredAssistantContextType {
  const call = useCall();
  const transcript = useTranscript();
  const language = useLanguage();
  const order = useOrder();
  const { user } = useAuth();
  const vapi = useVapi();

  // ✅ DISABLED AGAIN: VapiProvider callback (causes premature Summary)
  // Need alternative approach to trigger Summary Popup
  /*
  useEffect(() => {
    console.log('📞 [DEBUG] Setting up VapiProvider callback with protection');
    vapi.setCallEndCallback(() => {
      console.log(
        '📞 [DEBUG] VapiProvider callback triggered, checking call state...'
      );

      // Check if call was actually active (simple check)
      if (call.isCallActive || vapi.isCallActive) {
        console.log(
          '📞 [DEBUG] Call confirmed active, triggering CallContext.endCall()'
        );
        call.endCall();
      } else {
        console.log(
          '📞 [DEBUG] No active call detected, skipping CallContext.endCall()'
        );
      }
    });

    // ✅ FIX: Cleanup callback on unmount
    return () => {
      console.log('📞 [DEBUG] Cleaning up VapiProvider callback');
      vapi.setCallEndCallback(() => {}); // Clear callback
    };
  }, [vapi, call]);
  */

  // ✅ NOTE: endCall registration moved after endCall definition

  // ✅ NEW: Listen for language changes and reinitialize Vapi
  useEffect(() => {
    logger.debug(
      "[RefactoredAssistant] Language changed, reinitializing Vapi...",
      "Component",
      {
        newLanguage: language.language,
        currentVapiLanguage: vapi.currentLanguage,
      },
    );

    // Reinitialize Vapi for the new language (only if language actually changed)
    if (language.language !== vapi.currentLanguage) {
      vapi.reinitializeForLanguage(language.language);

      logger.debug(
        "[RefactoredAssistant] Vapi reinitialized for language:",
        "Component",
        language.language,
      );
    }
  }, [language.language, vapi]); // Depend on language changes

  // Enhanced startCall that integrates with VapiContext
  const enhancedStartCall = useCallback(
    async (targetLanguage?: string) => {
      try {
        // ✅ FIXED: Use provided language or fallback to context language
        const languageToUse = targetLanguage || language.language;

        // ✅ NEW: Enhanced debug logging
        console.log(
          "🎪 [DEBUG] RefactoredAssistant.enhancedStartCall called:",
          {
            targetLanguage,
            contextLanguage: language.language,
            languageToUse,
            timestamp: new Date().toISOString(),
            vapiAvailable: !!vapi,
            vapiStartCallAvailable: !!(vapi && vapi.startCall),
          },
        );

        logger.debug(
          "[RefactoredAssistant] Starting enhanced call...",
          "Component",
          {
            targetLanguage,
            contextLanguage: language.language,
            languageToUse,
          },
        );

        // ✅ FIXED: Clear previous data BEFORE starting new call to prevent race condition
        transcript.clearTranscripts();
        transcript.clearModelOutput();
        order.setEmailSentForCurrentSession(false);

        // Note: VapiContextSimple handles initialization automatically

        // ✅ NEW: Debug before vapi.startCall
        console.log("🎯 [DEBUG] About to call vapi.startCall:", {
          languageToUse,
          timestamp: new Date().toISOString(),
        });

        // Start call with language (VapiContextSimple handles assistant ID selection)
        await vapi.startCall(languageToUse);

        // ✅ NEW: Debug after vapi.startCall success
        console.log("🎉 [DEBUG] vapi.startCall completed successfully:", {
          languageToUse,
          timestamp: new Date().toISOString(),
        });

        // Start call timer
        await call.startCall();

        // ✅ FIXED: Update language context if different language was used
        if (targetLanguage && targetLanguage !== language.language) {
          logger.debug(
            "[RefactoredAssistant] Updating language context to match call",
            "Component",
            { from: language.language, to: targetLanguage },
          );
          language.setLanguage(targetLanguage as any);
        }

        logger.debug(
          "[RefactoredAssistant] Enhanced call started successfully",
          "Component",
        );
      } catch (error) {
        // ✅ NEW: Enhanced error debugging for RefactoredAssistant
        console.error(
          "💥 [DEBUG] Error in RefactoredAssistant.enhancedStartCall:",
          {
            error,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : "No stack",
            timestamp: new Date().toISOString(),
            targetLanguage,
            languageToUse: targetLanguage || language.language,
            vapiAvailable: !!vapi,
            vapiStartCallAvailable: !!(vapi && vapi.startCall),
          },
        );

        logger.error(
          "[RefactoredAssistant] Error starting enhanced call:",
          "Component",
          error,
        );
        throw error;
      }
    },
    [call, vapi, language, transcript, order],
  );

  // ✅ MERGED: Single endCall function with full functionality
  const endCall = useCallback(async () => {
    console.log("📞 [DEBUG] RefactoredAssistant.endCall called");

    // ✅ GUARD: Only proceed if there was actually an active call
    if (!call.isCallActive && !vapi.isCallActive) {
      console.log(
        "⚠️ [DEBUG] No active call found, skipping endCall processing",
      );
      return;
    }

    // Debug logging for endCall function
    console.log("🎯 [DEBUG] EndCall function triggered with active call");
    logger.debug(
      "[RefactoredAssistant] Ending call with summary processing...",
      "Component",
    );

    try {
      // Step 1: Stop Vapi first
      console.log("📞 [DEBUG] Calling vapi.endCall()");
      await vapi.endCall();
      console.log("✅ [DEBUG] vapi.endCall() completed");

      // Step 2: End call timer and trigger listeners
      console.log("📞 [DEBUG] Calling call.endCall()");
      call.endCall();
      console.log("✅ [DEBUG] call.endCall() completed");

      // Step 3: Process summary if we have any transcripts (reduced from 2 to 1)
      console.log("🔍 [DEBUG] Checking transcript state:", {
        hasTranscript: !!transcript,
        transcriptLength: transcript?.transcripts?.length || 0,
        transcripts: transcript?.transcripts || "undefined",
        fullTranscriptObject: transcript,
      });

      if (transcript.transcripts.length >= 1) {
        console.log(
          "📞 [DEBUG] Processing call summary with transcripts:",
          transcript.transcripts.length,
        );

        // ✅ INTEGRATED: Trigger summary processing
        logger.debug(
          "[RefactoredAssistant] Processing call summary...",
          "Component",
        );

        // ✅ NEW: Set call summary data for popup system
        // ✅ FIXED: Use Vapi callId if available, otherwise use temporary
        const vapiCallId = vapi.callDetails?.id || `temp-call-${Date.now()}`;
        order.setCallSummary({
          callId: vapiCallId,
          tenantId: user?.tenantId || "default",
          content: "", // Will be filled by WebSocket
          timestamp: new Date(),
        });

        // ✅ NEW: Store callId globally for WebSocket integration
        if (window.storeCallId) {
          window.storeCallId(vapiCallId);
        }

        // ✅ NEW: Trigger summary popup via global function
        if (window.triggerSummaryPopup) {
          window.triggerSummaryPopup();
        }

        console.log("✅ [DEBUG] Summary processing triggered");
      } else {
        console.log(
          "📞 [DEBUG] No transcripts to process:",
          transcript.transcripts.length,
        );

        // ✅ RE-ENABLED FALLBACK: Trigger Summary Popup even without transcripts
        // Race condition issue was fixed, safe to re-enable
        console.log(
          "🔄 [DEBUG] FALLBACK: Triggering Summary Popup without transcripts",
        );

        const vapiCallId = vapi.callDetails?.id || `temp-call-${Date.now()}`;
        order.setCallSummary({
          callId: vapiCallId,
          tenantId: user?.tenantId || "default",
          content: "Processing call summary...", // Placeholder content
          timestamp: new Date(),
        });

        // Store callId globally for WebSocket integration
        if (window.storeCallId) {
          window.storeCallId(vapiCallId);
        }

        // Trigger summary popup via global function
        if (window.triggerSummaryPopup) {
          console.log(
            "🎯 [DEBUG] FALLBACK: Calling window.triggerSummaryPopup()",
          );
          window.triggerSummaryPopup();
          console.log(
            "✅ [DEBUG] FALLBACK: window.triggerSummaryPopup() called successfully",
          );
        } else {
          console.error("❌ [DEBUG] window.triggerSummaryPopup not available!");
        }

        console.log("✅ [DEBUG] FALLBACK Summary processing triggered");
      }

      console.log("✅ [DEBUG] RefactoredAssistant.endCall completed");
      logger.debug(
        "[RefactoredAssistant] Call ended with summary processing",
        "Component",
      );
    } catch (error) {
      console.error("❌ [DEBUG] Error in endCall:", error);
      logger.error(
        "[RefactoredAssistant] Error ending call:",
        "Component",
        error,
      );
    }
  }, [call, vapi, transcript, order]);

  // ✅ RE-ENABLED: Register RefactoredAssistant.endCall as call end listener
  // Call loop issue was fixed by disabling the problematic VapiProvider callback
  useEffect(() => {
    console.log(
      "📞 [DEBUG] Registering RefactoredAssistant.endCall as call end listener",
    );
    const unregister = call.addCallEndListener(endCall);
    console.log(
      "✅ [DEBUG] RefactoredAssistant.endCall registered successfully",
    );

    return () => {
      console.log(
        "📞 [DEBUG] Unregistering RefactoredAssistant.endCall listener",
      );
      unregister();
    };
  }, [call, endCall]);

  // Enhanced toggleMute that integrates both contexts
  const enhancedToggleMute = useCallback(() => {
    call.toggleMute();
    // Note: setMuted functionality removed from VapiContext
  }, [call, vapi]);

  return {
    // Call functionality (enhanced)
    ...call,
    startCall: enhancedStartCall,
    endCall: endCall,
    toggleMute: enhancedToggleMute,

    // All other contexts
    ...transcript,
    ...language,
    ...order,
    ...vapi,

    // From AuthContext
    tenantId: user?.tenantId || null,

    // Additional Vapi methods for compatibility
    initializeVapi: async (
      _language: string,
      _hotelConfig?: HotelConfiguration | null,
    ) => {
      // VapiContextSimple handles initialization automatically
      return Promise.resolve();
    },
    startVapiCall: async (assistantId: string) => {
      return vapi.startCall(language.language, assistantId);
    },
    endVapiCall: () => {
      return vapi.endCall();
    },
    resetVapi: async () => {
      // Reset functionality if needed
      return Promise.resolve();
    },
  };
}

// Internal provider component
function RefactoredAssistantProviderInternal({
  children,
}: {
  children: ReactNode;
}) {
  const value = useRefactoredAssistantProvider();

  return (
    <RefactoredAssistantContext.Provider value={value}>
      {children}
    </RefactoredAssistantContext.Provider>
  );
}

// Main provider with all nested context providers
export function RefactoredAssistantProvider({
  children,
}: {
  children: ReactNode;
}) {
  logger.debug(
    "[RefactoredAssistantProvider] Initializing with nested providers...",
    "Component",
  );

  return (
    <LanguageProvider>
      <TranscriptProvider>
        <VapiProvider>
          <CallProvider>
            <OrderProvider>
              <RefactoredAssistantProviderInternal>
                {children}
              </RefactoredAssistantProviderInternal>
            </OrderProvider>
          </CallProvider>
        </VapiProvider>
      </TranscriptProvider>
    </LanguageProvider>
  );
}

// Hook to use the refactored assistant context
export function useRefactoredAssistant() {
  const context = useContext(RefactoredAssistantContext);
  if (context === undefined) {
    throw new Error(
      "useRefactoredAssistant must be used within a RefactoredAssistantProvider",
    );
  }
  return context;
}

// Compatibility hook that mirrors the original useAssistant interface
export function useAssistantCompat() {
  return useRefactoredAssistant();
}
