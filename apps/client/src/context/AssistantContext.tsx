import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from 'react';
import {
  initVapi,
  getVapiInstance,
  FORCE_BASIC_SUMMARY,
  apiRequest,
  parseSummaryToOrderDetails,
} from '@/lib';
import {
  Transcript,
  OrderSummary,
  CallDetails,
  Order,
  InterfaceLayer,
  CallSummary,
  ServiceRequest,
  ActiveOrder,
} from '@/types';
import ReactDOM from 'react-dom';
import {
  HotelConfiguration,
  getVapiPublicKeyByLanguage,
  getVapiAssistantIdByLanguage,
} from '@/hooks/useHotelConfiguration';
import { resetVapi } from '@/lib/vapiClient';
import { logger } from '@shared/utils/logger';

export type Language = 'en' | 'fr' | 'zh' | 'ru' | 'ko' | 'vi';

export interface AssistantContextType {
  // ✅ REMOVED: Interface switching logic (focus Interface1 only)
  // currentInterface: InterfaceLayer;
  // setCurrentInterface: (layer: InterfaceLayer) => void;
  transcripts: Transcript[];
  setTranscripts: (transcripts: Transcript[]) => void;
  addTranscript: (transcript: Omit<Transcript, 'id' | 'timestamp'>) => void;
  orderSummary: OrderSummary | null;
  setOrderSummary: (summary: OrderSummary) => void;
  callDetails: CallDetails | null;
  setCallDetails: (details: CallDetails) => void;
  order: Order | null;
  setOrder: (order: Order | null) => void;
  callDuration: number;
  setCallDuration: (duration: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  startCall: () => Promise<void>;
  endCall: () => void;
  callSummary: CallSummary | null;
  setCallSummary: (summary: CallSummary) => void;
  serviceRequests: ServiceRequest[];
  setServiceRequests: (requests: ServiceRequest[]) => void;
  vietnameseSummary: string | null;
  setVietnameseSummary: (summary: string) => void;
  translateToVietnamese: (text: string) => Promise<string>;
  emailSentForCurrentSession: boolean;
  setEmailSentForCurrentSession: (sent: boolean) => void;
  requestReceivedAt: Date | null;
  setRequestReceivedAt: (date: Date | null) => void;
  activeOrders: ActiveOrder[];
  addActiveOrder: (order: ActiveOrder) => void;
  setActiveOrders: React.Dispatch<React.SetStateAction<ActiveOrder[]>>;
  micLevel: number;
  modelOutput: string[];
  setModelOutput: (output: string[]) => void;
  addModelOutput: (output: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  hotelConfig: HotelConfiguration | null;
  setHotelConfig: (config: HotelConfiguration | null) => void;
  // Multi-tenant support
  tenantId: string | null;
  setTenantId: (tenantId: string | null) => void;
  tenantConfig: any | null;
  setTenantConfig: (config: any | null) => void;
  // Call end listeners
  addCallEndListener: (listener: () => void) => () => void;
}

const initialOrderSummary: OrderSummary = {
  orderType: 'Room Service',
  deliveryTime: 'asap',
  roomNumber: '',
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  specialInstructions: '',
  items: [
    {
      id: '1',
      name: 'Club Sandwich',
      description: 'Served with french fries and side salad',
      quantity: 1,
      price: 15.0,
    },
    {
      id: '2',
      name: 'Fresh Orange Juice',
      description: 'Large size',
      quantity: 1,
      price: 8.0,
    },
  ],
  totalAmount: 23.0,
};

// Context definition
const AssistantContext = createContext<AssistantContextType | undefined>(
  undefined
);

export function AssistantProvider({ children }: { children: ReactNode }) {
  logger.debug('[DEBUG] AssistantProvider render', 'Component');
  // ✅ REMOVED: Interface switching logic (focus Interface1 only)
  // const [currentInterface, setCurrentInterfaceState] = useState<InterfaceLayer>('interface1');
  // const setCurrentInterface = (layer: InterfaceLayer) => { ... };
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [vietnameseSummary, setVietnameseSummary] = useState<string | null>(
    null
  );
  const [emailSentForCurrentSession, setEmailSentForCurrentSession] =
    useState<boolean>(false);
  const [requestReceivedAt, setRequestReceivedAt] = useState<Date | null>(null);

  // ✅ NEW: Prevent Vapi reinitialization during endCall
  const [isEndingCall, setIsEndingCall] = useState(false);

  // ✅ STABILITY: Add ref to track if component is mounted
  const isMountedRef = useRef(true);

  // ✅ NEW: Call end event handler for external listeners
  const [callEndListeners, setCallEndListeners] = useState<(() => void)[]>([]);

  // ✅ PUBLIC: Method to register call end listeners
  const addCallEndListener = useCallback((listener: () => void) => {
    setCallEndListeners(prev => [...prev, listener]);
    return () => {
      setCallEndListeners(prev => prev.filter(l => l !== listener));
    };
  }, []);

  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('activeOrders');
      if (!stored) return [];
      const parsed = JSON.parse(stored) as (ActiveOrder & {
        requestedAt: string;
      })[];
      // Convert requestedAt string back into Date
      return parsed.map(o => ({
        ...o,
        requestedAt: new Date(o.requestedAt),
      }));
    } catch (err) {
      logger.error('Failed to parse activeOrders from localStorage', 'Component', err);
      return [];
    }
  });
  const [micLevel, setMicLevel] = useState<number>(0);
  const [modelOutput, setModelOutput] = useState<string[]>([]);
  const [language, setLanguageState] = useState<Language>(() => {
    // Load language from localStorage on init
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(
        'selectedLanguage'
      ) as Language;
      if (
        savedLanguage &&
        ['en', 'fr', 'zh', 'ru', 'ko', 'vi'].includes(savedLanguage)
      ) {
        logger.debug('🌍 [AssistantContext] Loading saved language:', 'Component', savedLanguage);
        return savedLanguage;
      }
    }
    logger.debug('🌍 [AssistantContext] Using default language: en', 'Component');
    return 'en';
  });
  const [hotelConfig, setHotelConfig] = useState<HotelConfiguration | null>(
    null
  );
  // Multi-tenant support
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantConfig, setTenantConfig] = useState<any | null>(null);

  // Language setter with persistence
  const setLanguage = React.useCallback((lang: Language) => {
    logger.debug('🌍 [AssistantContext] setLanguage called with:', 'Component', lang);
    setLanguageState(lang);
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', lang);
      logger.debug('🌍 [AssistantContext] Language saved to localStorage:', 'Component', lang);
    }
  }, []);

  // ✅ REMOVED: Interface switching debug functions (focus Interface1 only)

  const debugSetOrder = (newOrder: Order | null) => {
    logger.debug('🗑️ AssistantContext: setOrder called with:', 'Component', newOrder);
    logger.debug('🗑️ Previous order:', 'Component', order);
    setOrder(newOrder);
    logger.debug('✅ AssistantContext: setOrder completed', 'Component');
  };

  // Persist activeOrders to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('activeOrders', JSON.stringify(activeOrders));
    } catch {
      logger.error('Failed to persist activeOrders to localStorage', 'Component');
    }
  }, [activeOrders]);

  // ✅ REMOVED: Interface switching debug logic (focus Interface1 only)
  // useEffect(() => {
  //   logger.debug('[DEBUG] AssistantProvider useEffect - currentInterface changed to:', 'Component', currentInterface);
  // }, [currentInterface]);

  // Debug: Track order changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - order changed to:', 'Component', order);
    // logger.debug('[DEBUG] AssistantProvider - order reference:', 'Component', order?.reference);
    // logger.debug('[DEBUG] AssistantProvider - timestamp:', 'Component', new Date().toISOString());
  }, [order]);

  // Debug: Track activeOrders changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - activeOrders changed:', 'Component', activeOrders.length);
    // logger.debug('[DEBUG] AssistantProvider - activeOrders:', 'Component', activeOrders);
  }, [activeOrders]);

  // Debug: Track hotelConfig changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - hotelConfig changed:', 'Component', hotelConfig ? 'loaded' : 'null');
  }, [hotelConfig]);

  // Debug: Track language changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - language changed to:', 'Component', language);
  }, [language]);

  // Debug: Track callDetails changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - callDetails changed:', 'Component', callDetails ? 'active' : 'null');
  }, [callDetails]);

  // Debug: Track transcripts changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - transcripts count:', 'Component', transcripts.length);
  }, [transcripts]);

  // Debug: Track orderSummary changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - orderSummary changed:', 'Component', orderSummary ? 'has summary' : 'null');
  }, [orderSummary]);

  // Debug: Track callSummary changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - callSummary changed:', 'Component', callSummary ? 'has summary' : 'null');
  }, [callSummary]);

  // Debug: Track serviceRequests changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - serviceRequests count:', 'Component', serviceRequests.length);
  }, [serviceRequests]);

  // Debug: Track modelOutput changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - modelOutput count:', 'Component', modelOutput.length);
  }, [modelOutput]);

  // Debug: Track micLevel changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - micLevel:', 'Component', micLevel);
  }, [micLevel]);

  // Debug: Track isMuted changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - isMuted:', 'Component', isMuted);
  }, [isMuted]);

  // Debug: Track callDuration changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - callDuration:', 'Component', callDuration);
  }, [callDuration]);

  // Debug: Track emailSentForCurrentSession changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - emailSentForCurrentSession:', 'Component', emailSentForCurrentSession);
  }, [emailSentForCurrentSession]);

  // Debug: Track requestReceivedAt changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - requestReceivedAt:', 'Component', requestReceivedAt);
  }, [requestReceivedAt]);

  // Debug: Track vietnameseSummary changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - vietnameseSummary:', 'Component', vietnameseSummary ? 'has summary' : 'null');
  }, [vietnameseSummary]);

  // Debug: Track tenantId changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - tenantId:', 'Component', tenantId);
  }, [tenantId]);

  // Debug: Track tenantConfig changes
  useEffect(() => {
    // logger.debug('[DEBUG] AssistantProvider useEffect - tenantConfig:', 'Component', tenantConfig ? 'loaded' : 'null');
  }, [tenantConfig]);

  const addActiveOrder = (order: ActiveOrder) => {
    setActiveOrders(prev => [
      ...prev,
      {
        ...order,
        status: order.status || 'Đã ghi nhận',
      },
    ]);
  };

  // Add transcript to the list
  const addTranscript = React.useCallback(
    (transcript: Omit<Transcript, 'id' | 'timestamp' | 'callId'>) => {
      const newTranscript: Transcript = {
        ...transcript,
        // ✅ FIX: Remove explicit ID - let database auto-generate
        // id: Date.now() as unknown as number, // REMOVED
        callId: callDetails?.id || `call-${Date.now()}`,
        timestamp: new Date(),
        tenantId: tenantId || 'default',
      };

      // Add to local state immediately
      setTranscripts(prev => [...prev, newTranscript]);

      // Send to server database asynchronously
      const saveToServer = async () => {
        try {
          const response = await fetch('/api/transcripts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              callId: newTranscript.callId,
              role: newTranscript.role,
              content: newTranscript.content,
              tenantId: newTranscript.tenantId,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to save transcript: ${response.status}`);
          }

          const data = await response.json();
          logger.debug('Transcript saved to database:', 'Component', data);
        } catch (error) {
          logger.error('Error saving transcript to server:', 'Component', error);
          // Still keep in local state even if server save fails
        }
      };

      saveToServer();
    },
    [callDetails?.id, tenantId]
  );

  // Initialize Vapi when component mounts
  useEffect(() => {
    // ✅ NEW: Skip initialization if ending call
    if (isEndingCall) {
      logger.debug('🛑 [setupVapi] Skipping Vapi initialization - call is ending', 'Component');
      return;
    }

    const setupVapi = async () => {
      try {
        logger.debug('🔧 [setupVapi] Language changed to:', 'Component', language);
        logger.debug('🔧 [setupVapi] Hotel config available:', 'Component', !!hotelConfig);

        // Use hotel configuration if available, otherwise fallback to environment variables
        const publicKey = hotelConfig
          ? await getVapiPublicKeyByLanguage(language, hotelConfig)
          : language === 'fr'
            ? import.meta.env.VITE_VAPI_PUBLIC_KEY_FR
            : language === 'zh'
              ? import.meta.env.VITE_VAPI_PUBLIC_KEY_ZH
              : language === 'ru'
                ? import.meta.env.VITE_VAPI_PUBLIC_KEY_RU
                : language === 'ko'
                  ? import.meta.env.VITE_VAPI_PUBLIC_KEY_KO
                  : language === 'vi'
                    ? import.meta.env.VITE_VAPI_PUBLIC_KEY_VI
                    : import.meta.env.VITE_VAPI_PUBLIC_KEY;

        logger.debug('🔑 [setupVapi] Selected publicKey for language', 'Component', language,
          ':',
          publicKey ? `${publicKey.substring(0, 10)}...` : 'undefined'
        );

        if (!publicKey) {
          throw new Error('Vapi public key is not configured');
        }

        const vapi = await initVapi(publicKey);

        // Throttle micLevel updates to prevent excessive re-renders
        let lastMicLevelUpdate = 0;
        const MIC_LEVEL_THROTTLE = 100; // Only update every 100ms

        // Setup event listeners after successful initialization
        vapi.on('volume-level', (level: number) => {
          try {
            const now = Date.now();
            if (now - lastMicLevelUpdate > MIC_LEVEL_THROTTLE) {
              setMicLevel(level);
              lastMicLevelUpdate = now;
            }
          } catch (error) {
            logger.warn('Error handling volume-level:', 'Component', error);
          }
        });

        // Bridge function to send transcripts to WebSocket server
        const sendTranscriptToWebSocket = (transcript: Transcript) => {
          try {
            // Send to WebSocket server for compatibility with old TranscriptDisplay system
            if (typeof window !== 'undefined' && window.WebSocket) {
              const wsUrl = `${window.location.origin.replace('http', 'ws')}/ws`;
              const ws = new WebSocket(wsUrl);

              ws.onopen = () => {
                ws.send(
                  JSON.stringify({
                    type: 'transcript',
                    call_id: transcript.callId,
                    role: transcript.role,
                    content: transcript.content,
                    timestamp: transcript.timestamp,
                  })
                );
                ws.close(); // Close after sending
              };

              ws.onerror = error => {
                logger.warn('Failed to send transcript to WebSocket:', 'Component', error);
              };
            }
          } catch (error) {
            logger.warn('Error sending transcript to WebSocket:', 'Component', error);
          }
        };

        // Message handler for transcripts and reports
        const handleMessage = async (message: any) => {
          logger.debug('Raw message received:', 'Component', message);
          logger.debug('Message type:', 'Component', message.type);
          logger.debug('Message role:', 'Component', message.role);
          logger.debug('Message content structure:', 'Component', {
            content: message.content,
            text: message.text,
            transcript: message.transcript,
          });

          // For model output - handle this first
          if (message.type === 'model-output') {
            logger.debug('Model output detected - Full message:', 'Component', message);

            // Try to get content from any available field
            const outputContent =
              message.content ||
              message.text ||
              message.transcript ||
              message.output;
            if (outputContent) {
              logger.debug('Adding model output to conversation:', 'Component', outputContent);

              // Add as transcript with isModelOutput flag
              const newTranscript: Transcript = {
                // ✅ FIX: Remove explicit ID - let database auto-generate
                // id: Date.now() as unknown as number, // REMOVED
                callId: callDetails?.id || `call-${Date.now()}`,
                role: 'assistant',
                content: outputContent,
                timestamp: new Date(),
                isModelOutput: true,
                tenantId: tenantId || 'default',
              };
              logger.debug('Adding new transcript for model output:', 'Component', newTranscript);
              setTranscripts(prev => {
                const updated = [...prev, newTranscript];
                logger.debug('Updated transcripts array:', 'Component', updated);
                return updated;
              });

              // Bridge to WebSocket
              sendTranscriptToWebSocket(newTranscript);
            } else {
              logger.warn('Model output message received but no content found:', 'Component', message);
            }
          }

          // Handle ALL transcript messages (both user and assistant)
          if (message.type === 'transcript') {
            logger.debug('Adding transcript:', 'Component', message);
            const newTranscript: Transcript = {
              // ✅ FIX: Remove explicit ID - let database auto-generate
              // id: Date.now() as unknown as number, // REMOVED
              callId: callDetails?.id || `call-${Date.now()}`,
              role: message.role, // Keep original role (user or assistant)
              content: message.content || message.transcript || '',
              timestamp: new Date(),
              tenantId: tenantId || 'default',
            } as Transcript;
            setTranscripts(prev => [...prev, newTranscript]);

            // Bridge to WebSocket
            sendTranscriptToWebSocket(newTranscript);
          }
        };

        vapi.on('message', (message: any) => {
          try {
            handleMessage(message);
          } catch (error) {
            logger.warn('Error handling Vapi message:', 'Component', error);
          }
        });

        // ✅ NEW: Trigger call end listeners when call ends
        vapi.on('call-end', () => {
          logger.debug('📞 [AssistantContext] Vapi call-end event received', 'Component');
          logger.debug('📊 [AssistantContext] Call-end context:', 'Component', {
            transcriptsCount: transcripts.length,
            hasCallSummary: !!callSummary,
            hasServiceRequests: serviceRequests?.length > 0,
            callDuration,
            isEndingCall,
          });

          try {
            // Brief delay to allow final state updates
            setTimeout(() => {
              logger.debug('🔔 [AssistantContext] Triggering call end listeners...', 'Component');

              // Trigger all registered call end listeners
              callEndListeners.forEach(listener => {
                try {
                  listener();
                } catch (error) {
                  logger.error('❌ [AssistantContext] Error in call end listener:', 'Component', error);
                }
              });

              logger.debug('✅ [AssistantContext] Call end listeners triggered successfully', 'Component');
            }, 1000); // 1 second delay to allow state updates
          } catch (error) {
            logger.error('❌ [AssistantContext] Error triggering call end listeners:', 'Component', error);
          }
        });
      } catch (error) {
        logger.error('Error setting up Vapi:', 'Component', error);
      }
    };

    setupVapi();

    return () => {
      isMountedRef.current = false;
      const vapi = getVapiInstance();
      if (vapi) {
        logger.debug('🧹 [setupVapi] Cleanup: Stopping Vapi due to dependency change', 'Component');
        vapi.stop();
      }
    };
  }, [language, hotelConfig, tenantId, isEndingCall]); // ✅ FIXED: Removed callDetails?.id to prevent restart loop

  // ✅ STABILITY: Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ✅ REMOVED: Interface2 timer logic (focus Interface1 only)
  // useEffect(() => {
  //   if (currentInterface === 'interface2') {
  //     // Timer logic for interface2...
  //   }
  // }, []);

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  // Toggle mute state
  const toggleMute = () => {
    const vapi = getVapiInstance();
    if (vapi) {
      vapi.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  // Start call function
  const startCall = React.useCallback(async () => {
    try {
      // Reset email sent flag for new session
      setEmailSentForCurrentSession(false);

      // Reset call details
      const callId = `call-${Date.now()}`;
      setCallDetails({
        id: callId,
        roomNumber: '',
        duration: '',
        category: '',
        language,
      });

      // Clear previous transcripts and model outputs
      setTranscripts([]);
      setModelOutput([]);

      // Initialize Vapi
      const vapi = getVapiInstance();
      if (!vapi) {
        logger.error('❌ [startCall] Vapi instance not initialized', 'Component');
        throw new Error(
          'Voice assistant not initialized. Please refresh the page and try again.'
        );
      }

      // Use hotel configuration for assistant ID if available
      const assistantId = hotelConfig
        ? await getVapiAssistantIdByLanguage(language, hotelConfig)
        : language === 'fr'
          ? import.meta.env.VITE_VAPI_ASSISTANT_ID_FR
          : language === 'zh'
            ? import.meta.env.VITE_VAPI_ASSISTANT_ID_ZH
            : language === 'ru'
              ? import.meta.env.VITE_VAPI_ASSISTANT_ID_RU
              : language === 'ko'
                ? import.meta.env.VITE_VAPI_ASSISTANT_ID_KO
                : language === 'vi'
                  ? import.meta.env.VITE_VAPI_ASSISTANT_ID_VI
                  : import.meta.env.VITE_VAPI_ASSISTANT_ID;

      logger.debug('🤖 [startCall] Selected assistantId for language', 'Component', language,
        ':',
        assistantId ? `${assistantId.substring(0, 10)}...` : 'undefined'
      );

      if (!assistantId) {
        logger.error('❌ [startCall] Assistant ID not configured for language:', 'Component', language);
        throw new Error(
          `Voice assistant not configured for ${language}. Please contact support.`
        );
      }

      // ✅ IMPROVED: Enhanced call starting with better error handling
      logger.debug('🚀 [startCall] Starting Vapi call...', 'Component');
      const call = await vapi.start(assistantId);

      // ✅ IMPROVED: Validate call object
      if (!call) {
        logger.error('❌ [startCall] Vapi.start() returned null/undefined', 'Component');
        throw new Error(
          'Failed to start voice call. Please check your internet connection and try again.'
        );
      }

      logger.debug('✅ [startCall] Call started successfully:', 'Component', call);

      // Reset call duration to 0
      setCallDuration(0);

      // Start call duration timer
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Store timer ID for cleanup
      setCallTimer(timer);

      // DISABLED: Don't auto-switch to Interface2 to allow popup to show in Interface1
      // Update interface to show call in progress
      // setCurrentInterface('interface2');
    } catch (error) {
      logger.error('❌ [startCall] Error starting call:', 'Component', error);

      // ✅ IMPROVED: Better error handling and user feedback
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      // Log detailed error for debugging
      logger.error('❌ [startCall] Detailed error:', 'Component', {
        error,
        language,
        hasHotelConfig: !!hotelConfig,
        vapiInstance: !!getVapiInstance(),
      });

      // Show user-friendly error message
      // You can replace this with a toast notification or modal
      if (typeof window !== 'undefined') {
        alert(`Failed to start voice call: ${errorMessage}`);
      }

      // Clean up any partial state
      setCallDuration(0);
      if (callTimer) {
        clearInterval(callTimer);
        setCallTimer(null);
      }
    }
  }, [language, hotelConfig, tenantId]);

  // End call function
  const endCall = useCallback(() => {
    logger.debug('🛑 [AssistantContext] endCall() called', 'Component');
    logger.debug('🔍 [AssistantContext] Current state before endCall:', 'Component', {
      callDuration,
      transcriptsCount: transcripts.length,
      hasCallDetails: !!callDetails,
      hasCallTimer: !!callTimer,
      language,
      tenantId,
      isEndingCall,
    });

    // ✅ NEW: Set ending flag to prevent reinitialization
    logger.debug('🚫 [AssistantContext] Step 0: Setting isEndingCall flag to prevent Vapi reinitialization...', 'Component');
    setIsEndingCall(true);

    try {
      logger.debug('🔄 [AssistantContext] Step 1: Stopping VAPI IMMEDIATELY...', 'Component');

      // Stop VAPI with enhanced error handling
      try {
        const vapi = getVapiInstance();
        if (vapi) {
          logger.debug('📞 [AssistantContext] Step 1a: VAPI instance found, calling stop()...', 'Component');

          // ✅ NEW: Force stop all Vapi activities
          vapi.stop();

          // ✅ NEW: Additional cleanup if available
          if (typeof vapi.cleanup === 'function') {
            logger.debug('🧹 [AssistantContext] Step 1b: Calling vapi.cleanup()...', 'Component');
            vapi.cleanup();
          }

          // ✅ NEW: Force disconnect if available
          if (typeof vapi.disconnect === 'function') {
            logger.debug('🔌 [AssistantContext] Step 1c: Calling vapi.disconnect()...', 'Component');
            vapi.disconnect();
          }

          logger.debug('✅ [AssistantContext] Step 1: VAPI fully stopped and cleaned up', 'Component');
        } else {
          logger.debug('⚠️ [AssistantContext] Step 1a: No VAPI instance to stop', 'Component');
        }
      } catch (vapiError) {
        logger.error('❌ [AssistantContext] Step 1 ERROR: Error stopping VAPI:', 'Component', vapiError);
        logger.debug('🔄 [AssistantContext] Continuing with cleanup despite VAPI error...', 'Component');
        // Continue with cleanup even if VAPI stop fails
      }

      logger.debug('🔄 [AssistantContext] Step 2: Batch state updates...', 'Component');

      // Batch state updates with error handling
      try {
        logger.debug('🔄 [AssistantContext] Step 2a: Formatting call duration...', 'Component');

        // Format call duration for API first
        const formattedDuration = callDuration
          ? `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`
          : '0:00';

        logger.debug('✅ [AssistantContext] Step 2a: Duration formatted:', 'Component', formattedDuration);
        logger.debug('🔄 [AssistantContext] Step 2b: Updating states...', 'Component');

        const updates = () => {
          logger.debug('🔄 [AssistantContext] Step 2b-1: Stopping timer...', 'Component');

          // Stop the timer
          if (callTimer) {
            clearInterval(callTimer);
            setCallTimer(null);
            logger.debug('✅ [AssistantContext] Timer stopped and cleared', 'Component');
          } else {
            logger.debug('⚠️ [AssistantContext] No timer to stop', 'Component');
          }

          logger.debug('🔄 [AssistantContext] Step 2b-2: Setting initial order summary...', 'Component');

          // Initialize with default values
          setOrderSummary(initialOrderSummary);

          logger.debug('✅ [AssistantContext] Step 2b: State cleanup completed', 'Component');
        };

        updates();

        logger.debug('🔄 [AssistantContext] Step 3: Processing summary generation...', 'Component');

        // Process summary generation if we have transcript data
        try {
          const transcriptData = transcripts.map((message: Transcript) => ({
            role: message.role,
            content: message.content,
          }));

          logger.debug('🔍 [AssistantContext] Transcript data prepared:', 'Component', {
            count: transcriptData.length,
            firstFew: transcriptData.slice(0, 2),
          });

          // Check if we have enough transcript data
          if (transcriptData.length >= 2) {
            logger.debug('📝 [AssistantContext] Step 3a: Sufficient transcript data, processing call summary...', 'Component');

            // Show loading state for summary
            const loadingSummary: CallSummary = {
              // ✅ FIX: Remove explicit ID - let database auto-generate
              // id: Date.now() as unknown as number, // REMOVED
              callId: callDetails?.id || `call-${Date.now()}`,
              content: 'Generating AI summary of your conversation...',
              timestamp: new Date(),
              tenantId: tenantId || 'default',
            };
            setCallSummary(loadingSummary);
            logger.debug('✅ [AssistantContext] Loading summary state set', 'Component');

            logger.debug('🔄 [AssistantContext] Step 3b: Sending transcript data to server for OpenAI processing...', 'Component');

            // Send transcript data to server for OpenAI processing
            fetch('/api/store-summary', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                summary: '',
                transcripts: transcriptData,
                timestamp: new Date().toISOString(),
                callId: callDetails?.id || `call-${Date.now()}`,
                callDuration: formattedDuration,
                forceBasicSummary: false,
                language,
                tenantId: tenantId || 'default',
              }),
            })
              .then(response => {
                logger.debug('📡 [AssistantContext] Store-summary API response received:', 'Component', response.status);

                if (!response.ok) {
                  throw new Error(
                    `Network response was not ok: ${response.status}`
                  );
                }
                return response.json();
              })
              .then(data => {
                logger.debug('✅ [AssistantContext] Store-summary API data received:', 'Component', data);

                if (data.success && data.summary && data.summary.content) {
                  logger.debug('📋 [AssistantContext] Valid summary received, updating state...', 'Component');

                  const summaryContent = data.summary.content;
                  const aiSummary: CallSummary = {
                    // ✅ FIX: Remove explicit ID - let database auto-generate
                    // id: Date.now() as unknown as number, // REMOVED
                    callId: callDetails?.id || `call-${Date.now()}`,
                    content: summaryContent,
                    timestamp: new Date(data.summary.timestamp || Date.now()),
                    tenantId: tenantId || 'default',
                  };
                  setCallSummary(aiSummary);
                  logger.debug('✅ [AssistantContext] Summary state updated successfully', 'Component');

                  if (
                    data.serviceRequests &&
                    Array.isArray(data.serviceRequests) &&
                    data.serviceRequests.length > 0
                  ) {
                    logger.debug('📝 [AssistantContext] Service requests received:', 'Component', data.serviceRequests.length);
                    setServiceRequests(data.serviceRequests);
                  } else {
                    logger.debug('⚠️ [AssistantContext] No service requests in response', 'Component');
                  }
                } else {
                  logger.debug('⚠️ [AssistantContext] Invalid summary data received:', 'Component', data);
                }
              })
              .catch(summaryError => {
                logger.error('❌ [AssistantContext] Error processing summary:', 'Component', summaryError);
                // Show error state
                const errorSummary: CallSummary = {
                  // ✅ FIX: Remove explicit ID - let database auto-generate
                  // id: Date.now() as unknown as number, // REMOVED
                  callId: callDetails?.id || `call-${Date.now()}`,
                  content:
                    'An error occurred while generating the call summary.',
                  timestamp: new Date(),
                  tenantId: tenantId || 'default',
                };
                setCallSummary(errorSummary);
                logger.debug('✅ [AssistantContext] Error summary state set', 'Component');
              });
          } else {
            logger.debug('⚠️ [AssistantContext] Step 3a: Not enough transcript data for summary', 'Component');
            logger.debug('🔍 [AssistantContext] Transcript data count:', 'Component', transcriptData.length);

            const noTranscriptSummary: CallSummary = {
              // ✅ FIX: Remove explicit ID - let database auto-generate
              // id: Date.now() as unknown as number, // REMOVED
              callId: callDetails?.id || `call-${Date.now()}`,
              content:
                'Call was too short to generate a summary. Please try a more detailed conversation.',
              timestamp: new Date(),
              tenantId: tenantId || 'default',
            };
            setCallSummary(noTranscriptSummary);
            logger.debug('✅ [AssistantContext] No transcript summary state set', 'Component');
          }
        } catch (summaryError) {
          logger.error('❌ [AssistantContext] Step 3 ERROR: Error in summary processing:', 'Component', summaryError);
          // Don't let summary errors crash the endCall
        }
      } catch (cleanupError) {
        logger.error('❌ [AssistantContext] Step 2 ERROR: Error during state cleanup:', 'Component', cleanupError);

        logger.debug('🔄 [AssistantContext] Attempting force cleanup of critical states...', 'Component');

        // Force cleanup critical states
        try {
          if (callTimer) {
            clearInterval(callTimer);
            setCallTimer(null);
            logger.debug('✅ [AssistantContext] Force timer cleanup completed', 'Component');
          }
        } catch (timerError) {
          logger.error('❌ [AssistantContext] Failed to clear timer:', 'Component', timerError);
        }
      }

      logger.debug('✅ [AssistantContext] endCall() completed successfully', 'Component');
    } catch (error) {
      logger.error('❌ [AssistantContext] CRITICAL ERROR in endCall():', 'Component', error);
      logger.error('❌ [AssistantContext] Error name:', 'Component', error.name);
      logger.error('❌ [AssistantContext] Error message:', 'Component', error.message);
      logger.error('❌ [AssistantContext] Error stack:', 'Component', error.stack);

      logger.debug('🔄 [AssistantContext] Attempting emergency cleanup...', 'Component');

      // Emergency cleanup
      try {
        if (callTimer) {
          clearInterval(callTimer);
          setCallTimer(null);
          logger.debug('✅ [AssistantContext] Emergency timer cleanup completed', 'Component');
        }
      } catch (emergencyError) {
        logger.error('🚨 [AssistantContext] Emergency cleanup failed:', 'Component', emergencyError);
      }

      // Don't re-throw error to prevent Error Boundary trigger
      logger.debug('🔄 [AssistantContext] endCall() error handled gracefully, continuing normal operation', 'Component');
    } finally {
      // ✅ NEW: Reset ending flag after a delay to allow cleanup
      setTimeout(() => {
        logger.debug('🔄 [AssistantContext] Resetting isEndingCall flag...', 'Component');
        setIsEndingCall(false);
      }, 2000); // 2 second delay to ensure all cleanup is complete
    }
  }, [
    callTimer,
    callDuration,
    transcripts,
    callDetails?.id,
    tenantId,
    language,
    isEndingCall,
  ]);

  // Function to translate text to Vietnamese
  const translateToVietnamese = async (text: string): Promise<string> => {
    try {
      logger.debug('Requesting Vietnamese translation for summary...', 'Component');
      const response = await fetch('/api/translate-to-vietnamese', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.translatedText) {
        // Save the translated text
        setVietnameseSummary(data.translatedText);
        return data.translatedText;
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      logger.error('Error translating to Vietnamese:', 'Component', error);
      return 'Không thể dịch nội dung này sang tiếng Việt. Vui lòng thử lại sau.';
    }
  };

  const addModelOutput = (output: string) => {
    setModelOutput(prev => [...prev, output]);
  };

  // Polling API để lấy trạng thái order mới nhất mỗi 5 giây
  useEffect(() => {
    let polling: NodeJS.Timeout | null = null;
    const fetchOrders = async () => {
      try {
        // ✅ FIX: Use authenticated fetch with auto-retry
        const { authenticatedFetch } = await import('@/lib/authHelper');

        // Use relative URL to call API from same domain
        const res = await authenticatedFetch(`/api/request`);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            logger.warn('⚠️ [AssistantContext] Auth failed - token may be invalid or missing', 'Component');
          }
          return;
        }
        const data = await res.json();
        logger.debug('[AssistantContext] Fetched orders from API:', 'Component', data);
        // data là mảng order, cần map sang ActiveOrder (chuyển requestedAt sang Date)
        if (Array.isArray(data)) {
          setActiveOrders(
            data.map((o: any) => ({
              reference: o.specialInstructions || o.reference || o.callId || '',
              requestedAt: o.createdAt ? new Date(o.createdAt) : new Date(),
              estimatedTime: o.deliveryTime || '',
              status:
                o.status === 'completed'
                  ? 'Hoàn thiện'
                  : o.status === 'pending'
                    ? 'Đã ghi nhận'
                    : o.status,
              // Các trường khác nếu cần
              ...o,
            }))
          );
        }
      } catch (err) {
        // ignore
      }
    };
    // ✅ SIMPLIFIED: Always poll for orders (focus Interface1 only)
    fetchOrders();
    polling = setInterval(fetchOrders, 5000);

    return () => {
      if (polling) clearInterval(polling);
    };
  }, []); // ✅ REMOVED: currentInterface dependency

  const value: AssistantContextType = {
    transcripts,
    setTranscripts,
    addTranscript,
    orderSummary,
    setOrderSummary,
    callDetails,
    setCallDetails,
    order,
    setOrder: debugSetOrder,
    callDuration,
    setCallDuration,
    isMuted,
    toggleMute,
    startCall,
    endCall,
    callSummary,
    setCallSummary,
    serviceRequests,
    setServiceRequests,
    vietnameseSummary,
    setVietnameseSummary,
    translateToVietnamese,
    emailSentForCurrentSession,
    setEmailSentForCurrentSession,
    requestReceivedAt,
    setRequestReceivedAt,
    activeOrders,
    addActiveOrder,
    setActiveOrders,
    micLevel,
    modelOutput,
    setModelOutput,
    addModelOutput,
    language,
    setLanguage,
    hotelConfig,
    setHotelConfig,
    // Multi-tenant support
    tenantId,
    setTenantId,
    tenantConfig,
    setTenantConfig,
    // Call end listeners
    addCallEndListener,
  };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    logger.warn('useAssistant used outside AssistantProvider - returning safe defaults', 'Component');
    // Return safe defaults instead of throwing
    return {
      transcripts: [],
      setTranscripts: () => {},
      addTranscript: () => {},
      orderSummary: null,
      setOrderSummary: () => {},
      callDetails: null,
      setCallDetails: () => {},
      order: null,
      setOrder: () => {},
      callDuration: 0,
      setCallDuration: () => {},
      isMuted: false,
      toggleMute: () => {},
      startCall: async () => {},
      endCall: () => {},
      callSummary: null,
      setCallSummary: () => {},
      serviceRequests: [],
      setServiceRequests: () => {},
      vietnameseSummary: null,
      setVietnameseSummary: () => {},
      translateToVietnamese: async () => '',
      emailSentForCurrentSession: false,
      setEmailSentForCurrentSession: () => {},
      requestReceivedAt: null,
      setRequestReceivedAt: () => {},
      activeOrders: [],
      addActiveOrder: () => {},
      setActiveOrders: () => {},
      micLevel: 0,
      modelOutput: [],
      setModelOutput: () => {},
      addModelOutput: () => {},
      language: 'en' as Language,
      setLanguage: () => {},
      hotelConfig: null,
      setHotelConfig: () => {},
      tenantId: null,
      setTenantId: () => {},
      tenantConfig: null,
      setTenantConfig: () => {},
      addCallEndListener: () => () => {},
    } as AssistantContextType;
  }
  return context;
}
