import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

// Import all new focused contexts
import { useCall, CallProvider } from './contexts/CallContext';
import {
  useTranscript,
  TranscriptProvider,
} from './contexts/TranscriptContext';
import { useLanguage, LanguageProvider } from './contexts/LanguageContext';
import { useOrder, OrderProvider } from './contexts/OrderContext';
import {
  useConfiguration,
  ConfigurationProvider,
} from './contexts/ConfigurationContext';
import { useVapi, VapiProvider } from './contexts/VapiContext';
import { logger } from '@shared/utils/logger';

// Combined interface that exposes all context functionality
export interface RefactoredAssistantContextType {
  // From CallContext
  callDuration: number;
  setCallDuration: (duration: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  startCall: () => Promise<void>;
  endCall: () => void;
  isCallActive: boolean;
  isEndingCall: boolean;
  addCallEndListener: (listener: () => void) => () => void;

  // From TranscriptContext
  transcripts: any[];
  setTranscripts: (transcripts: any[]) => void;
  addTranscript: (transcript: any) => void;
  modelOutput: string[];
  setModelOutput: (output: string[]) => void;
  addModelOutput: (output: string) => void;
  clearTranscripts: () => void;
  clearModelOutput: () => void;

  // From LanguageContext
  language: any;
  setLanguage: (lang: any) => void;
  vietnameseSummary: string | null;
  setVietnameseSummary: (summary: string) => void;
  translateToVietnamese: (text: string) => Promise<string>;

  // From OrderContext
  order: any;
  setOrder: (order: any) => void;
  orderSummary: any;
  setOrderSummary: (summary: any) => void;
  callSummary: any;
  setCallSummary: (summary: any) => void;
  serviceRequests: any[];
  setServiceRequests: (requests: any[]) => void;
  activeOrders: any[];
  setActiveOrders: any;
  addActiveOrder: (order: any) => void;
  emailSentForCurrentSession: boolean;
  setEmailSentForCurrentSession: (sent: boolean) => void;
  requestReceivedAt: Date | null;
  setRequestReceivedAt: (date: Date | null) => void;

  // From ConfigurationContext
  hotelConfig: any;
  setHotelConfig: (config: any) => void;
  tenantId: string | null;
  setTenantId: (tenantId: string | null) => void;
  tenantConfig: any;
  setTenantConfig: (config: any) => void;

  // From VapiContext
  micLevel: number;
  callDetails: any;
  setCallDetails: (details: any) => void;
  initializeVapi: (language: string, hotelConfig?: any) => Promise<void>;
  startVapiCall: (assistantId: string) => Promise<any>;
  stopVapi: () => void;
  setMuted: (muted: boolean) => void;
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
  const configuration = useConfiguration();
  const vapi = useVapi();

  // Enhanced startCall that integrates with VapiContext
  const enhancedStartCall = useCallback(async () => {
    try {
      logger.debug(
        '[RefactoredAssistant] Starting enhanced call...',
        'Component'
      );

      // Initialize Vapi first
      await vapi.initializeVapi(language.language, configuration.hotelConfig);

      // Get assistant ID based on language
      let assistantId: string;
      try {
        // This logic would be moved to a utility function
        assistantId =
          language.language === 'vi'
            ? import.meta.env.VITE_VAPI_ASSISTANT_ID_VI
            : import.meta.env.VITE_VAPI_ASSISTANT_ID;
      } catch (error) {
        assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;
      }

      if (!assistantId) {
        throw new Error(
          `Assistant not configured for language: ${language.language}`
        );
      }

      // Start Vapi call
      const vapiCall = await vapi.startVapiCall(assistantId);

      // Update call details
      const callId = `call-${Date.now()}`;
      vapi.setCallDetails({
        id: callId,
        roomNumber: '',
        duration: '',
        category: '',
        language: language.language,
      });

      // Start call timer
      await call.startCall();

      // Clear previous data
      transcript.clearTranscripts();
      transcript.clearModelOutput();
      order.setEmailSentForCurrentSession(false);

      logger.debug(
        '[RefactoredAssistant] Enhanced call started successfully',
        'Component'
      );
    } catch (error) {
      logger.error(
        '[RefactoredAssistant] Error starting enhanced call:',
        'Component',
        error
      );
      throw error;
    }
  }, [call, vapi, language, configuration, transcript, order]);

  // Enhanced endCall that integrates all contexts
  const enhancedEndCall = useCallback(() => {
    logger.debug('[RefactoredAssistant] Ending enhanced call...', 'Component');

    // Stop Vapi first
    vapi.stopVapi();

    // End call timer
    call.endCall();

    // Process summary if we have transcripts
    if (transcript.transcripts.length >= 2) {
      // This would trigger summary generation
      logger.debug(
        '[RefactoredAssistant] Processing call summary...',
        'Component'
      );
      // Summary processing logic would go here
    }

    logger.debug('[RefactoredAssistant] Enhanced call ended', 'Component');
  }, [call, vapi, transcript]);

  // Enhanced toggleMute that integrates both contexts
  const enhancedToggleMute = useCallback(() => {
    const newMutedState = !call.isMuted;
    call.toggleMute();
    vapi.setMuted(newMutedState);
  }, [call, vapi]);

  return {
    // Call functionality (enhanced)
    ...call,
    startCall: enhancedStartCall,
    endCall: enhancedEndCall,
    toggleMute: enhancedToggleMute,

    // All other contexts
    ...transcript,
    ...language,
    ...order,
    ...configuration,
    ...vapi,
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
    '[RefactoredAssistantProvider] Initializing with nested providers...',
    'Component'
  );

  return (
    <ConfigurationProvider>
      <LanguageProvider>
        <VapiProvider>
          <CallProvider>
            <TranscriptProvider>
              <OrderProvider>
                <RefactoredAssistantProviderInternal>
                  {children}
                </RefactoredAssistantProviderInternal>
              </OrderProvider>
            </TranscriptProvider>
          </CallProvider>
        </VapiProvider>
      </LanguageProvider>
    </ConfigurationProvider>
  );
}

// Hook to use the refactored assistant context
export function useRefactoredAssistant() {
  const context = useContext(RefactoredAssistantContext);
  if (context === undefined) {
    throw new Error(
      'useRefactoredAssistant must be used within a RefactoredAssistantProvider'
    );
  }
  return context;
}

// Compatibility hook that mirrors the original useAssistant interface
export function useAssistantCompat() {
  return useRefactoredAssistant();
}
