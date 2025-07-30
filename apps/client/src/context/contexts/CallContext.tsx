import { logger } from '@shared/utils/logger';
import React, { createContext, useCallback, useContext, useState } from 'react';

export interface CallContextType {
  // Call state
  callDuration: number;
  setCallDuration: (duration: number) => void;
  isMuted: boolean;
  toggleMute: () => void;

  // Call actions
  startCall: (language?: string) => Promise<void>; // ✅ FIXED: Add optional language parameter
  endCall: () => void;

  // Call status
  isCallActive: boolean;
  isEndingCall: boolean;

  // Call end listeners
  addCallEndListener: (listener: () => void) => () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
  logger.debug('[CallProvider] Initializing...', 'Component');

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);
  const [callEndListeners, setCallEndListeners] = useState<(() => void)[]>([]);

  // Refs for cleanup

  // Add call end listener
  const addCallEndListener = useCallback((listener: () => void) => {
    setCallEndListeners(prev => [...prev, listener]);
    return () => {
      setCallEndListeners(prev => prev.filter(l => l !== listener));
    };
  }, []);

  // Toggle mute state
  const toggleMute = useCallback(() => {
    // Will be integrated with VapiContext later
    setIsMuted(!isMuted);
    logger.debug('[CallContext] Mute toggled:', 'Component', !isMuted);
  }, [isMuted]);

  // Start call function (basic implementation)
  const startCall = useCallback(async (language?: string) => {
    try {
      logger.debug('[CallContext] Starting call...', 'Component', {
        language: language || 'default',
      });

      setIsCallActive(true);
      setCallDuration(0);

      // Start call timer
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      setCallTimer(timer);

      logger.debug('[CallContext] Call started successfully', 'Component');
    } catch (error) {
      logger.error('[CallContext] Error starting call:', 'Component', error);
      throw error;
    }
  }, []);

  // End call function
  const endCall = useCallback(() => {
    console.log('📞 [DEBUG] CallContext.endCall() called');
    logger.debug('[CallContext] Ending call...', 'Component');

    setIsEndingCall(true);
    setIsCallActive(false);

    // Stop timer
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }

    // Trigger call end listeners
    console.log(
      `📞 [DEBUG] Triggering ${callEndListeners.length} call end listeners`
    );
    callEndListeners.forEach((listener, index) => {
      try {
        console.log(`📞 [DEBUG] Executing listener ${index + 1}`);
        listener();
        console.log(`✅ [DEBUG] Listener ${index + 1} executed successfully`);
      } catch (error) {
        console.error(`❌ [DEBUG] Error in listener ${index + 1}:`, error);
        logger.error(
          '[CallContext] Error in call end listener:',
          'Component',
          error
        );
      }
    });

    // Reset ending flag after delay
    setTimeout(() => {
      setIsEndingCall(false);
    }, 2000);

    logger.debug('[CallContext] Call ended', 'Component');
  }, [callTimer, callEndListeners]);

  const value: CallContextType = {
    callDuration,
    setCallDuration,
    isMuted,
    toggleMute,
    startCall,
    endCall,
    isCallActive,
    isEndingCall,
    addCallEndListener,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}
