// 🎯 SIMPLIFIED VAPI CONTEXT - Using Official Pattern
// Replaces complex VapiContext with simple, official implementation
// ✅ UPDATED: Now uses vapiOfficial.ts instead of deprecated vapiSimple.ts

import { useTenantDetection } from "@/context/AuthContext";
import { HotelConfiguration } from "@/hooks/useHotelConfiguration";
import {
  CallOptions,
  VapiOfficial,
  VapiOfficialConfig,
} from "@/lib/vapiOfficial";
import { CallDetails, Language } from "@/types";
import logger from "@shared/utils/logger";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranscript } from "./TranscriptContext";

export interface VapiContextType {
  // Call state
  isCallActive: boolean;
  micLevel: number;
  callDetails: CallDetails | null;
  currentLanguage: string; // Add current language tracking

  // Actions
  startCall: (language?: string, assistantId?: string) => Promise<void>;
  endCall: () => Promise<void>;
  setCallDetails: (details: CallDetails | null) => void;
  reinitializeForLanguage: (language: string) => void; // Add language reinitialization

  // ✅ NEW: Callback for external call end handling
  setCallEndCallback: (callback: () => void) => void;

  // ✅ REMOVED: Call summary handling - now using OpenAI only
  // setCallSummaryCallback: (callback: (summary: any) => void) => void;
}

const VapiContext = createContext<VapiContextType | undefined>(undefined);

export const useVapi = (): VapiContextType => {
  const context = useContext(VapiContext);
  if (!context) {
    throw new Error("useVapi must be used within a VapiProvider");
  }
  return context;
};

interface VapiProviderProps {
  children: React.ReactNode;
  hotelConfig?: HotelConfiguration | null;
}

export const VapiProvider: React.FC<VapiProviderProps> = ({ children }) => {
  // DEV/runtime toggle for noisy logs to reduce latency in production
  const debugEnabled = (() => {
    try {
      return (
        import.meta.env.DEV ||
        (typeof window !== "undefined" &&
          localStorage.getItem("DEBUG_VOICE") === "true")
      );
    } catch {
      return false;
    }
  })();
  const debugLog = (...args: any[]) => {
    if (debugEnabled) {
      console.log(...args);
    }
  };
  // State management
  const [isCallActive, setIsCallActive] = useState(false);
  const [callEndCallback, setCallEndCallback] = useState<(() => void) | null>(
    null,
  );
  // ✅ REMOVED: Call summary callback - now using OpenAI only
  // const [callSummaryCallback, setCallSummaryCallback] = useState<((summary: any) => void) | null>(
  //   null
  // );
  const [micLevel, setMicLevel] = useState(0);
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);

  // ✅ NEW: Track if we had an active call (to detect genuine call ends)

  // Refs
  const vapiClientRef = useRef<VapiOfficial | null>(null);
  const hadActiveCallRef = useRef<number>(0); // Store call start timestamp

  // Context dependencies
  const { addTranscript } = useTranscript();
  const tenantInfo = useTenantDetection();

  // Get tenant ID function
  const getTenantId = (): string => {
    if (tenantInfo?.subdomain) {
      return `tenant-${tenantInfo.subdomain}`;
    }
    if (tenantInfo?.customDomain) {
      return `tenant-${tenantInfo.customDomain.replace(/\./g, "-")}`;
    }
    return "tenant-default";
  };

  // Resolve Vapi credentials for a language from server API, with env fallback
  const resolveVapiCredentials = async (
    language: string,
  ): Promise<{ publicKey: string; assistantId: string }> => {
    // 1) Try server endpoint which already maps per-language env vars
    try {
      const res = await fetch(`/api/vapi/config/${language}`);
      if (res.ok) {
        const json = await res.json();
        const data = json?.data || {};
        if (data?.publicKey && data?.assistantId) {
          return { publicKey: data.publicKey, assistantId: data.assistantId };
        }
      }
    } catch {
      // Ignore and fallback to env below
    }

    // 2) Fallback to build-time envs per language, then default EN
    const upper = language.toUpperCase();
    const publicKeyLang =
      (import.meta.env as any)[`VITE_VAPI_PUBLIC_KEY_${upper}`] ||
      import.meta.env.VITE_VAPI_PUBLIC_KEY ||
      "";
    const assistantIdLang =
      (import.meta.env as any)[`VITE_VAPI_ASSISTANT_ID_${upper}`] ||
      import.meta.env.VITE_VAPI_ASSISTANT_ID ||
      "";

    return { publicKey: publicKeyLang, assistantId: assistantIdLang };
  };

  // ✅ UPDATED: Using VapiOfficial instead of deprecated VapiSimple
  const initializeVapi = (
    language: string,
    creds: { publicKey: string; assistantId: string },
  ): VapiOfficial => {
    const { publicKey, assistantId } = creds;

    if (!publicKey || !assistantId) {
      throw new Error(
        `Missing Vapi credentials for language ${language}: publicKey=${!!publicKey}, assistantId=${!!assistantId}`,
      );
    }

    logger.debug(
      "🔧 [VapiProvider] Initializing VapiOfficial:",
      "VapiProvider",
      {
        language,
        publicKey: publicKey.substring(0, 10) + "...",
        assistantId: assistantId.substring(0, 15) + "...",
      },
    );

    // ✅ UPDATED: Create VapiOfficial config with error handling
    const config: VapiOfficialConfig = {
      publicKey,
      assistantId,
      onCallStart: () => {
        logger.debug("📞 [VapiProvider] Call started", "VapiProvider");
        setIsCallActive(true);
        hadActiveCallRef.current = Date.now(); // ✅ Track WHEN call started (timestamp)
        setMicLevel(0);
        // ✅ NEW: Use temporary call ID, will be updated when Vapi provides real callId
        const tempCallId = `temp-call-${Date.now()}`;
        setCurrentCallId(tempCallId);
        logger.debug(
          "🆔 [VapiProvider] Call started with temporary call ID:",
          "VapiProvider",
          tempCallId,
        );
      },
      onCallEnd: () => {
        debugLog(
          "📞 [DEBUG] VapiProvider onCallEnd triggered, checking call history...",
        );
        logger.debug("📞 [VapiProvider] Call ended", "VapiProvider");

        // ✅ FIX: Check if we ever had an active call AND minimum duration
        const callStartTime = hadActiveCallRef.current;
        const callDuration = callStartTime ? Date.now() - callStartTime : 0;
        const minCallDuration = 2000; // 2 seconds minimum

        debugLog("📞 [DEBUG] VapiProvider call timing:", {
          callStartTime,
          callDuration,
          minCallDuration,
          hasCallHistory: !!callStartTime,
        });

        if (!callStartTime) {
          debugLog(
            "📞 [DEBUG] VapiProvider: No call history found, skipping onCallEnd processing",
          );
          return;
        }

        if (callDuration < minCallDuration) {
          debugLog(
            "📞 [DEBUG] VapiProvider: Call too short (race condition), skipping onCallEnd processing",
          );
          return;
        }

        // ✅ NEW: Check Vapi SDK state directly instead of using delay
        debugLog(
          "📞 [DEBUG] VapiProvider: Checking Vapi SDK internal state...",
        );

        // Use Vapi SDK's own state instead of our context state to avoid race conditions
        const vapiSdkActive = vapi?.isCallActive?.() || false;

        // ✅ ENHANCED DEBUG: More detailed state info
        debugLog("📞 [DEBUG] VapiProvider DETAILED state:", {
          vapiSdkActive,
          contextActive: isCallActive,
          hadActiveCallRef: hadActiveCallRef.current,
          vapiExists: !!vapi,
          isCallActiveMethod: typeof vapi?.isCallActive,
          timestamp: new Date().toISOString(),
        });

        if (!vapiSdkActive) {
          debugLog(
            "📞 [DEBUG] VapiProvider: Vapi SDK confirms call ended, processing...",
          );

          // ✅ FIX: Trigger external callback BEFORE state changes to prevent race condition
          if (callEndCallback) {
            debugLog("📞 [DEBUG] VapiProvider calling external callback");
            callEndCallback();
          } else {
            debugLog(
              "📞 [DEBUG] VapiProvider no external callback available - using direct trigger",
            );

            // ✅ NEW: Direct trigger Summary Popup when no external callback
            try {
              if (window.triggerSummaryPopup) {
                debugLog(
                  "📞 [DEBUG] VapiProvider directly triggering Summary Popup",
                );
                window.triggerSummaryPopup();
              } else {
                debugLog("📞 [DEBUG] window.triggerSummaryPopup not available");
              }
            } catch (popupError) {
              logger.warn(
                "⚠️ [VapiProvider] Failed to trigger summary popup directly",
                "VapiProvider",
                popupError,
              );
            }
          }

          // Update state after callback
          setIsCallActive(false);
          setMicLevel(0);
          hadActiveCallRef.current = 0; // ✅ Reset call history after processing
        } else {
          debugLog(
            "📞 [DEBUG] VapiProvider: Vapi SDK still active, ignoring onCallEnd (race condition)",
          );
        }

        // Keep call ID for a bit to allow final transcripts, then reset
        setTimeout(() => {
          logger.debug(
            "🆔 [VapiProvider] Resetting call ID after call end",
            "VapiProvider",
          );
          setCurrentCallId(null);
        }, 2000); // 2 second delay to allow final transcripts
      },
      onMessage: (message) => {
        if (message.type === "transcript") {
          // ✅ FIX: Use consistent call ID throughout the call session
          const callId = currentCallId || `temp-call-${Date.now()}`;

          // ✅ NEW: Update callId if Vapi provides real callId
          if (message.call?.id && message.call.id !== currentCallId) {
            setCurrentCallId(message.call.id);
            logger.debug(
              "🆔 [VapiProvider] Updated with real Vapi call ID:",
              "VapiProvider",
              message.call.id,
            );
          }

          // ✅ DEBUG: Enhanced logging for transcript handling
          debugLog("📝 [VapiProvider] Received transcript message:", {
            type: message.type,
            role: message.role,
            transcript: message.transcript?.substring(0, 50) + "...",
            callId,
            timestamp: new Date().toISOString(),
          });

          // Update call details with transcript
          setCallDetails(
            (prev) =>
              ({
                id: callId, // ✅ FIXED: Use consistent call ID
                roomNumber: prev?.roomNumber || "Unknown",
                duration: prev?.duration || "0:00",
                category: prev?.category || "voice-assistant",
                language: language as Language,
                transcript: message.transcript,
                role: message.role,
              }) as CallDetails,
          );

          logger.debug(
            "📝 [VapiProvider] Adding transcript with consistent call ID:",
            "VapiProvider",
            {
              callId,
              role: message.role,
              content: message.transcript.substring(0, 50) + "...",
              tenantId: getTenantId(),
            },
          );

          // ✅ FIX: Use consistent call ID and proper tenant ID
          debugLog("📝 [VapiProvider] About to call addTranscript:", {
            callId,
            content: message.transcript?.substring(0, 50) + "...",
            role: message.role,
            tenantId: getTenantId(),
          });

          addTranscript({
            callId: callId, // ✅ FIXED: Use consistent call ID
            content: message.transcript,
            role: message.role as "user" | "assistant",
            tenantId: getTenantId(), // ✅ FIXED: Use dynamic tenant ID
          });

          debugLog("✅ [VapiProvider] addTranscript called successfully");
        }

        if (message.type === "function-call") {
          // Handle function calls (room service, etc.)
          logger.debug("🔧 Function call", "VapiProvider", message);
        }

        // ✅ REMOVED: Call summary handling - now using OpenAI only
        // if (message.type === 'call-summary' || message.type === 'summary' || message.type === 'end-of-call-report') {
        //   logger.debug('📋 Call Summary received', 'VapiProvider', message);

        //   // Extract call summary data
        //   const callSummaryData = {
        //     callId: currentCallId || `call-${Date.now()}`,
        //     content: message.summary || message.content || message.data?.summary,
        //     timestamp: new Date(),
        //     source: 'Vapi.ai Web SDK',
        //   };

        //   // Trigger call summary callback
        //   if (callSummaryCallback) {
        //
        //     callSummaryCallback(callSummaryData);
        //   } else {
        //
        //   }

        //   // Also update assistant context directly
        //   if (callSummaryData.content) {
        //
        //     // TODO: Update assistant context with call summary
        //   }
        // }
      },
      onError: (error) => {
        logger.error("❌ Vapi error", "VapiProvider", error);
        setIsCallActive(false);
        setMicLevel(0);
        // Reset call ID on error
        setCurrentCallId(null);
      },
      onSpeechStart: () => {
        logger.debug("🗣️ Speech started", "VapiProvider");
        setMicLevel(0.8); // Simulate mic level
      },
      onSpeechEnd: () => {
        logger.debug("🔇 Speech ended", "VapiProvider");
        setMicLevel(0);
      },
    };

    // ✅ UPDATED: Create VapiOfficial instance
    const vapi = new VapiOfficial(config);

    vapiClientRef.current = vapi;
    setCurrentLanguage(language);
    return vapi;
  };

  // Start call function
  const startCall = async (
    language: string = "en",
    assistantId?: string,
  ): Promise<void> => {
    try {
      // ✅ NEW: Enhanced debug logging for VapiContextSimple
      debugLog("🎨 [DEBUG] VapiContextSimple.startCall called:", {
        language,
        assistantId,
        timestamp: new Date().toISOString(),
        isCallActive,
        currentLanguage,
        vapiClientExists: !!vapiClientRef.current,
      });

      // Update current language
      setCurrentLanguage(language);

      // End any existing call first
      if (vapiClientRef.current && isCallActive) {
        debugLog("🔄 [DEBUG] Ending existing call before starting new one");
        await vapiClientRef.current.endCall();
        vapiClientRef.current.destroy();
      }

      // ✅ NEW: Debug before initializing client
      debugLog("🚀 [DEBUG] Initializing new Vapi client:", {
        language,
        timestamp: new Date().toISOString(),
      });

      // Initialize new client
      const creds = await resolveVapiCredentials(language);
      vapiClientRef.current = initializeVapi(language, creds);

      if (!vapiClientRef.current) {
        throw new Error("Failed to initialize Vapi client");
      }

      // ✅ NEW: Debug after client initialization
      debugLog("✅ [DEBUG] Vapi client initialized successfully:", {
        language,
        clientExists: !!vapiClientRef.current,
        timestamp: new Date().toISOString(),
      });

      // ✅ UPDATED: Use CallOptions interface from vapiOfficial
      const options: CallOptions = {
        // ✅ FIXED: Remove timeout to prevent premature call end
        // timeout: 5 * 60 * 1000, // 5 minutes timeout
        metadata: {
          language,
          timestamp: new Date().toISOString(),
          source: "hotel-voice-assistant",
        },
      };

      // Only add assistantId if explicitly provided
      if (assistantId) {
        options.assistantId = assistantId;
      }

      debugLog("🚀 [DEBUG] Starting call with options:", {
        options: {
          ...options,
          assistantId: options.assistantId?.substring(0, 15) + "...",
        },
        timestamp: new Date().toISOString(),
      });

      // ✅ UPDATED: Start call using VapiOfficial
      await vapiClientRef.current.startCall(options);

      debugLog("✅ [DEBUG] Call started successfully");
    } catch (error) {
      console.error("❌ [DEBUG] Error starting call:", error);
      logger.error("❌ Failed to start call", "VapiProvider", error);
      throw error;
    }
  };

  // End call function
  const endCall = async (): Promise<void> => {
    try {
      if (vapiClientRef.current) {
        debugLog("🛑 [DEBUG] Ending call via VapiOfficial");
        await vapiClientRef.current.endCall();
        debugLog("✅ [DEBUG] Call ended successfully");
      }
    } catch (error) {
      console.error("❌ [DEBUG] Error ending call:", error);
      logger.error("❌ Failed to end call", "VapiProvider", error);
      throw error;
    }
  };

  // Reinitialize for language change
  const reinitializeForLanguage = async (language: string): Promise<void> => {
    if (isCallActive) {
      logger.warn("⚠️ Cannot reinitialize during active call", "VapiProvider");
      return;
    }

    try {
      // Destroy current instance
      if (vapiClientRef.current) {
        vapiClientRef.current.destroy();
      }

      // Initialize for new language
      const creds = await resolveVapiCredentials(language);
      vapiClientRef.current = initializeVapi(language, creds);
      setCurrentLanguage(language);

      logger.debug("🔄 Reinitialized for language:", "VapiProvider", language);
    } catch (error) {
      logger.error(
        "❌ Failed to reinitialize for language:",
        "VapiProvider",
        error,
      );
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (!vapiClientRef.current) {
      // Wrap in void IIFE to avoid linter complaining about top-level await inside effect
      void (async () => {
        try {
          const creds = await resolveVapiCredentials(currentLanguage);
          vapiClientRef.current = initializeVapi(currentLanguage, creds);
        } catch (error) {
          logger.error(
            "❌ Failed to initialize Vapi on mount:",
            "VapiProvider",
            error,
          );
        }
      })();
    }

    // Cleanup on unmount
    return () => {
      if (vapiClientRef.current) {
        vapiClientRef.current.destroy();
        vapiClientRef.current = null;
      }
    };
  }, []);

  const value: VapiContextType = {
    isCallActive,
    micLevel,
    callDetails,
    currentLanguage,
    startCall,
    endCall,
    setCallDetails,
    reinitializeForLanguage,
    setCallEndCallback,
    // ✅ REMOVED: setCallSummaryCallback - now using OpenAI only
  };

  return <VapiContext.Provider value={value}>{children}</VapiContext.Provider>;
};

// Removed duplicate interface declaration
