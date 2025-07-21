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
  console.log('[DEBUG] AssistantProvider render');
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
      console.error('Failed to parse activeOrders from localStorage', err);
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
        console.log(
          '🌍 [AssistantContext] Loading saved language:',
          savedLanguage
        );
        return savedLanguage;
      }
    }
    console.log('🌍 [AssistantContext] Using default language: en');
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
    console.log('🌍 [AssistantContext] setLanguage called with:', lang);
    setLanguageState(lang);
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', lang);
      console.log(
        '🌍 [AssistantContext] Language saved to localStorage:',
        lang
      );
    }
  }, []);

  // ✅ REMOVED: Interface switching debug functions (focus Interface1 only)

  const debugSetOrder = (newOrder: Order | null) => {
    console.log('🗑️ AssistantContext: setOrder called with:', newOrder);
    console.log('🗑️ Previous order:', order);
    setOrder(newOrder);
    console.log('✅ AssistantContext: setOrder completed');
  };

  // Persist activeOrders to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('activeOrders', JSON.stringify(activeOrders));
    } catch {
      console.error('Failed to persist activeOrders to localStorage');
    }
  }, [activeOrders]);

  // ✅ REMOVED: Interface switching debug logic (focus Interface1 only)
  // useEffect(() => {
  //   console.log('[DEBUG] AssistantProvider useEffect - currentInterface changed to:', currentInterface);
  // }, [currentInterface]);

  // Debug: Track order changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - order changed to:', order);
    // console.log('[DEBUG] AssistantProvider - order reference:', order?.reference);
    // console.log('[DEBUG] AssistantProvider - timestamp:', new Date().toISOString());
  }, [order]);

  // Debug: Track activeOrders changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - activeOrders changed:', activeOrders.length);
    // console.log('[DEBUG] AssistantProvider - activeOrders:', activeOrders);
  }, [activeOrders]);

  // Debug: Track hotelConfig changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - hotelConfig changed:', hotelConfig ? 'loaded' : 'null');
  }, [hotelConfig]);

  // Debug: Track language changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - language changed to:', language);
  }, [language]);

  // Debug: Track callDetails changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - callDetails changed:', callDetails ? 'active' : 'null');
  }, [callDetails]);

  // Debug: Track transcripts changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - transcripts count:', transcripts.length);
  }, [transcripts]);

  // Debug: Track orderSummary changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - orderSummary changed:', orderSummary ? 'has summary' : 'null');
  }, [orderSummary]);

  // Debug: Track callSummary changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - callSummary changed:', callSummary ? 'has summary' : 'null');
  }, [callSummary]);

  // Debug: Track serviceRequests changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - serviceRequests count:', serviceRequests.length);
  }, [serviceRequests]);

  // Debug: Track modelOutput changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - modelOutput count:', modelOutput.length);
  }, [modelOutput]);

  // Debug: Track micLevel changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - micLevel:', micLevel);
  }, [micLevel]);

  // Debug: Track isMuted changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - isMuted:', isMuted);
  }, [isMuted]);

  // Debug: Track callDuration changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - callDuration:', callDuration);
  }, [callDuration]);

  // Debug: Track emailSentForCurrentSession changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - emailSentForCurrentSession:', emailSentForCurrentSession);
  }, [emailSentForCurrentSession]);

  // Debug: Track requestReceivedAt changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - requestReceivedAt:', requestReceivedAt);
  }, [requestReceivedAt]);

  // Debug: Track vietnameseSummary changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - vietnameseSummary:', vietnameseSummary ? 'has summary' : 'null');
  }, [vietnameseSummary]);

  // Debug: Track tenantId changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - tenantId:', tenantId);
  }, [tenantId]);

  // Debug: Track tenantConfig changes
  useEffect(() => {
    // console.log('[DEBUG] AssistantProvider useEffect - tenantConfig:', tenantConfig ? 'loaded' : 'null');
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
          console.log('Transcript saved to database:', data);
        } catch (error) {
          console.error('Error saving transcript to server:', error);
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
      console.log(
        '🛑 [setupVapi] Skipping Vapi initialization - call is ending'
      );
      return;
    }

    const setupVapi = async () => {
      try {
        console.log('🔧 [setupVapi] Language changed to:', language);
        console.log('🔧 [setupVapi] Hotel config available:', !!hotelConfig);

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

        console.log(
          '🔑 [setupVapi] Selected publicKey for language',
          language,
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
            console.warn('Error handling volume-level:', error);
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
                console.warn('Failed to send transcript to WebSocket:', error);
              };
            }
          } catch (error) {
            console.warn('Error sending transcript to WebSocket:', error);
          }
        };

        // Message handler for transcripts and reports
        const handleMessage = async (message: any) => {
          console.log('Raw message received:', message);
          console.log('Message type:', message.type);
          console.log('Message role:', message.role);
          console.log('Message content structure:', {
            content: message.content,
            text: message.text,
            transcript: message.transcript,
          });

          // For model output - handle this first
          if (message.type === 'model-output') {
            console.log('Model output detected - Full message:', message);

            // Try to get content from any available field
            const outputContent =
              message.content ||
              message.text ||
              message.transcript ||
              message.output;
            if (outputContent) {
              console.log(
                'Adding model output to conversation:',
                outputContent
              );

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
              console.log(
                'Adding new transcript for model output:',
                newTranscript
              );
              setTranscripts(prev => {
                const updated = [...prev, newTranscript];
                console.log('Updated transcripts array:', updated);
                return updated;
              });

              // Bridge to WebSocket
              sendTranscriptToWebSocket(newTranscript);
            } else {
              console.warn(
                'Model output message received but no content found:',
                message
              );
            }
          }

          // Handle ALL transcript messages (both user and assistant)
          if (message.type === 'transcript') {
            console.log('Adding transcript:', message);
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
            console.warn('Error handling Vapi message:', error);
          }
        });

        // ✅ NEW: Trigger call end listeners when call ends
        vapi.on('call-end', () => {
          console.log('📞 [AssistantContext] Vapi call-end event received');
          console.log('📊 [AssistantContext] Call-end context:', {
            transcriptsCount: transcripts.length,
            hasCallSummary: !!callSummary,
            hasServiceRequests: serviceRequests?.length > 0,
            callDuration,
            isEndingCall,
          });

          try {
            // Brief delay to allow final state updates
            setTimeout(() => {
              console.log(
                '🔔 [AssistantContext] Triggering call end listeners...'
              );

              // Trigger all registered call end listeners
              callEndListeners.forEach(listener => {
                try {
                  listener();
                } catch (error) {
                  console.error(
                    '❌ [AssistantContext] Error in call end listener:',
                    error
                  );
                }
              });

              console.log(
                '✅ [AssistantContext] Call end listeners triggered successfully'
              );
            }, 1000); // 1 second delay to allow state updates
          } catch (error) {
            console.error(
              '❌ [AssistantContext] Error triggering call end listeners:',
              error
            );
          }
        });
      } catch (error) {
        console.error('Error setting up Vapi:', error);
      }
    };

    setupVapi();

    return () => {
      isMountedRef.current = false;
      const vapi = getVapiInstance();
      if (vapi) {
        console.log(
          '🧹 [setupVapi] Cleanup: Stopping Vapi due to dependency change'
        );
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
        console.error('❌ [startCall] Vapi instance not initialized');
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

      console.log(
        '🤖 [startCall] Selected assistantId for language',
        language,
        ':',
        assistantId ? `${assistantId.substring(0, 10)}...` : 'undefined'
      );

      if (!assistantId) {
        console.error(
          '❌ [startCall] Assistant ID not configured for language:',
          language
        );
        throw new Error(
          `Voice assistant not configured for ${language}. Please contact support.`
        );
      }

      // ✅ IMPROVED: Enhanced call starting with better error handling
      console.log('🚀 [startCall] Starting Vapi call...');
      const call = await vapi.start(assistantId);

      // ✅ IMPROVED: Validate call object
      if (!call) {
        console.error('❌ [startCall] Vapi.start() returned null/undefined');
        throw new Error(
          'Failed to start voice call. Please check your internet connection and try again.'
        );
      }

      console.log('✅ [startCall] Call started successfully:', call);

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
      console.error('❌ [startCall] Error starting call:', error);

      // ✅ IMPROVED: Better error handling and user feedback
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      // Log detailed error for debugging
      console.error('❌ [startCall] Detailed error:', {
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
    console.log('🛑 [AssistantContext] endCall() called');
    console.log('🔍 [AssistantContext] Current state before endCall:', {
      callDuration,
      transcriptsCount: transcripts.length,
      hasCallDetails: !!callDetails,
      hasCallTimer: !!callTimer,
      language,
      tenantId,
      isEndingCall,
    });

    // ✅ NEW: Set ending flag to prevent reinitialization
    console.log(
      '🚫 [AssistantContext] Step 0: Setting isEndingCall flag to prevent Vapi reinitialization...'
    );
    setIsEndingCall(true);

    try {
      console.log('🔄 [AssistantContext] Step 1: Stopping VAPI IMMEDIATELY...');

      // Stop VAPI with enhanced error handling
      try {
        const vapi = getVapiInstance();
        if (vapi) {
          console.log(
            '📞 [AssistantContext] Step 1a: VAPI instance found, calling stop()...'
          );

          // ✅ NEW: Force stop all Vapi activities
          vapi.stop();

          // ✅ NEW: Additional cleanup if available
          if (typeof vapi.cleanup === 'function') {
            console.log(
              '🧹 [AssistantContext] Step 1b: Calling vapi.cleanup()...'
            );
            vapi.cleanup();
          }

          // ✅ NEW: Force disconnect if available
          if (typeof vapi.disconnect === 'function') {
            console.log(
              '🔌 [AssistantContext] Step 1c: Calling vapi.disconnect()...'
            );
            vapi.disconnect();
          }

          console.log(
            '✅ [AssistantContext] Step 1: VAPI fully stopped and cleaned up'
          );
        } else {
          console.log(
            '⚠️ [AssistantContext] Step 1a: No VAPI instance to stop'
          );
        }
      } catch (vapiError) {
        console.error(
          '❌ [AssistantContext] Step 1 ERROR: Error stopping VAPI:',
          vapiError
        );
        console.log(
          '🔄 [AssistantContext] Continuing with cleanup despite VAPI error...'
        );
        // Continue with cleanup even if VAPI stop fails
      }

      console.log('🔄 [AssistantContext] Step 2: Batch state updates...');

      // Batch state updates with error handling
      try {
        console.log(
          '🔄 [AssistantContext] Step 2a: Formatting call duration...'
        );

        // Format call duration for API first
        const formattedDuration = callDuration
          ? `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`
          : '0:00';

        console.log(
          '✅ [AssistantContext] Step 2a: Duration formatted:',
          formattedDuration
        );
        console.log('🔄 [AssistantContext] Step 2b: Updating states...');

        const updates = () => {
          console.log('🔄 [AssistantContext] Step 2b-1: Stopping timer...');

          // Stop the timer
          if (callTimer) {
            clearInterval(callTimer);
            setCallTimer(null);
            console.log('✅ [AssistantContext] Timer stopped and cleared');
          } else {
            console.log('⚠️ [AssistantContext] No timer to stop');
          }

          console.log(
            '🔄 [AssistantContext] Step 2b-2: Setting initial order summary...'
          );

          // Initialize with default values
          setOrderSummary(initialOrderSummary);

          console.log('✅ [AssistantContext] Step 2b: State cleanup completed');
        };

        updates();

        console.log(
          '🔄 [AssistantContext] Step 3: Processing summary generation...'
        );

        // Process summary generation if we have transcript data
        try {
          const transcriptData = transcripts.map((message: Transcript) => ({
            role: message.role,
            content: message.content,
          }));

          console.log('🔍 [AssistantContext] Transcript data prepared:', {
            count: transcriptData.length,
            firstFew: transcriptData.slice(0, 2),
          });

          // Check if we have enough transcript data
          if (transcriptData.length >= 2) {
            console.log(
              '📝 [AssistantContext] Step 3a: Sufficient transcript data, processing call summary...'
            );

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
            console.log('✅ [AssistantContext] Loading summary state set');

            console.log(
              '🔄 [AssistantContext] Step 3b: Sending transcript data to server for OpenAI processing...'
            );

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
                console.log(
                  '📡 [AssistantContext] Store-summary API response received:',
                  response.status
                );

                if (!response.ok) {
                  throw new Error(
                    `Network response was not ok: ${response.status}`
                  );
                }
                return response.json();
              })
              .then(data => {
                console.log(
                  '✅ [AssistantContext] Store-summary API data received:',
                  data
                );

                if (data.success && data.summary && data.summary.content) {
                  console.log(
                    '📋 [AssistantContext] Valid summary received, updating state...'
                  );

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
                  console.log(
                    '✅ [AssistantContext] Summary state updated successfully'
                  );

                  if (
                    data.serviceRequests &&
                    Array.isArray(data.serviceRequests) &&
                    data.serviceRequests.length > 0
                  ) {
                    console.log(
                      '📝 [AssistantContext] Service requests received:',
                      data.serviceRequests.length
                    );
                    setServiceRequests(data.serviceRequests);
                  } else {
                    console.log(
                      '⚠️ [AssistantContext] No service requests in response'
                    );
                  }
                } else {
                  console.log(
                    '⚠️ [AssistantContext] Invalid summary data received:',
                    data
                  );
                }
              })
              .catch(summaryError => {
                console.error(
                  '❌ [AssistantContext] Error processing summary:',
                  summaryError
                );
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
                console.log('✅ [AssistantContext] Error summary state set');
              });
          } else {
            console.log(
              '⚠️ [AssistantContext] Step 3a: Not enough transcript data for summary'
            );
            console.log(
              '🔍 [AssistantContext] Transcript data count:',
              transcriptData.length
            );

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
            console.log(
              '✅ [AssistantContext] No transcript summary state set'
            );
          }
        } catch (summaryError) {
          console.error(
            '❌ [AssistantContext] Step 3 ERROR: Error in summary processing:',
            summaryError
          );
          // Don't let summary errors crash the endCall
        }
      } catch (cleanupError) {
        console.error(
          '❌ [AssistantContext] Step 2 ERROR: Error during state cleanup:',
          cleanupError
        );

        console.log(
          '🔄 [AssistantContext] Attempting force cleanup of critical states...'
        );

        // Force cleanup critical states
        try {
          if (callTimer) {
            clearInterval(callTimer);
            setCallTimer(null);
            console.log('✅ [AssistantContext] Force timer cleanup completed');
          }
        } catch (timerError) {
          console.error(
            '❌ [AssistantContext] Failed to clear timer:',
            timerError
          );
        }
      }

      console.log('✅ [AssistantContext] endCall() completed successfully');
    } catch (error) {
      console.error(
        '❌ [AssistantContext] CRITICAL ERROR in endCall():',
        error
      );
      console.error('❌ [AssistantContext] Error name:', error.name);
      console.error('❌ [AssistantContext] Error message:', error.message);
      console.error('❌ [AssistantContext] Error stack:', error.stack);

      console.log('🔄 [AssistantContext] Attempting emergency cleanup...');

      // Emergency cleanup
      try {
        if (callTimer) {
          clearInterval(callTimer);
          setCallTimer(null);
          console.log(
            '✅ [AssistantContext] Emergency timer cleanup completed'
          );
        }
      } catch (emergencyError) {
        console.error(
          '🚨 [AssistantContext] Emergency cleanup failed:',
          emergencyError
        );
      }

      // Don't re-throw error to prevent Error Boundary trigger
      console.log(
        '🔄 [AssistantContext] endCall() error handled gracefully, continuing normal operation'
      );
    } finally {
      // ✅ NEW: Reset ending flag after a delay to allow cleanup
      setTimeout(() => {
        console.log('🔄 [AssistantContext] Resetting isEndingCall flag...');
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
      console.log('Requesting Vietnamese translation for summary...');
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
      console.error('Error translating to Vietnamese:', error);
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
            console.warn(
              '⚠️ [AssistantContext] Auth failed - token may be invalid or missing'
            );
          }
          return;
        }
        const data = await res.json();
        console.log('[AssistantContext] Fetched orders from API:', data);
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
    console.warn(
      'useAssistant used outside AssistantProvider - returning safe defaults'
    );
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
