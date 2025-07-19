import { useState, useEffect, RefObject, useCallback } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { INTERFACE_CONSTANTS } from '@/constants/interfaceConstants';
import { Language } from '@/types/interface1.types';

interface UseConversationStateProps {
  conversationRef: RefObject<HTMLDivElement>;
}

interface UseConversationStateReturn {
  isCallStarted: boolean;
  showConversation: boolean;
  handleCallStart: (lang: Language) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => void;
  handleCancel: () => void;
  handleConfirm: () => void;
}

export const useConversationState = ({ 
  conversationRef 
}: UseConversationStateProps): UseConversationStateReturn => {
  // Use AssistantContext for real vapi integration
  const { 
    startCall, 
    endCall, 
    callDuration,
    setCurrentInterface,
    transcripts,
    setLanguage
  } = useAssistant();
  
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [manualCallStarted, setManualCallStarted] = useState(false); // Track manual start

  // Sync with AssistantContext call state using callDuration
  // BUT don't override manual call start until we have confirmation from server
  useEffect(() => {
    const isActive = callDuration > 0;
    console.log('🔄 [useConversationState] callDuration sync:', { callDuration, isActive, manualCallStarted, currentIsCallStarted: isCallStarted });
    
    // Only auto-set isCallStarted if:
    // 1. We have active call duration (real confirmation), OR
    // 2. We don't have manual start (normal auto-sync)
    if (isActive) {
      // Real call is active - sync state
      console.log('✅ [useConversationState] Real call active - syncing isCallStarted = true');
      setIsCallStarted(true);
      setManualCallStarted(false); // Clear manual flag since we have real confirmation
    } else if (!manualCallStarted) {
      // No manual start and no active call - set to false
      console.log('❌ [useConversationState] No active call and no manual start - syncing isCallStarted = false');
      setIsCallStarted(false);
    } else {
      // Manual start in progress - don't override, let it stay true
      console.log('⏳ [useConversationState] Manual call start in progress - keeping isCallStarted = true');
    }
    
    setShowConversation(isActive || transcripts.length > 0 || manualCallStarted);
  }, [callDuration, transcripts.length, manualCallStarted, isCallStarted]);

  // Auto scroll to conversation when it appears
  useEffect(() => {
    if (showConversation && conversationRef.current) {
      setTimeout(() => {
        conversationRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }, INTERFACE_CONSTANTS.AUTO_SCROLL_DELAY);
    }
  }, [showConversation, conversationRef]);

  const handleCallStart = useCallback(async (lang: Language): Promise<{ success: boolean; error?: string }> => {
    console.log('🎤 [useConversationState] Starting call with language:', lang);
    console.log('🎤 [useConversationState] Current state before call:', {
      isCallStarted,
      manualCallStarted,
      callDuration,
      transcriptsCount: transcripts.length
    });
    
    // Check if we should force VAPI calls in development
    const forceVapiInDev = import.meta.env.VITE_FORCE_VAPI_IN_DEV === 'true';
    const hasVapiCredentials = import.meta.env.VITE_VAPI_PUBLIC_KEY && import.meta.env.VITE_VAPI_ASSISTANT_ID;
    
    console.log('🔍 [useConversationState] Environment check:', {
      isDevelopment: import.meta.env.DEV,
      forceVapiInDev,
      hasVapiCredentials: !!hasVapiCredentials,
      publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY ? 'EXISTS' : 'MISSING',
      assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID ? 'EXISTS' : 'MISSING',
      // Also check individual language keys
      publicKey_VI: import.meta.env.VITE_VAPI_PUBLIC_KEY_VI ? 'EXISTS' : 'MISSING',
      assistantId_VI: import.meta.env.VITE_VAPI_ASSISTANT_ID_VI ? 'EXISTS' : 'MISSING'
    });
    
    // DEV MODE: Check if we have ANY VAPI credentials (including language-specific ones)
    const hasAnyVapiCredentials = import.meta.env.VITE_VAPI_PUBLIC_KEY || 
                                  import.meta.env.VITE_VAPI_PUBLIC_KEY_VI ||
                                  import.meta.env.VITE_VAPI_PUBLIC_KEY_FR ||
                                  import.meta.env.VITE_VAPI_PUBLIC_KEY_ZH ||
                                  import.meta.env.VITE_VAPI_PUBLIC_KEY_RU ||
                                  import.meta.env.VITE_VAPI_PUBLIC_KEY_KO;
    
    console.log('🔍 [useConversationState] hasAnyVapiCredentials:', !!hasAnyVapiCredentials);
    
    // DEV MODE: Skip actual API calls UNLESS forced or credentials available
    const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
    if (isDevelopment && !forceVapiInDev && !hasAnyVapiCredentials) {
      console.log('🚧 [DEV MODE] Simulating call start - no API calls (no credentials or force flag)');
      console.log('✅ [useConversationState] Setting isCallStarted = true (DEV MODE)');
      setIsCallStarted(true);
      setManualCallStarted(true); // Set manual flag when simulating
      return { success: true };
    }
    
    // If we have credentials or force flag, proceed with real VAPI call
    if (isDevelopment && (forceVapiInDev || hasAnyVapiCredentials)) {
      console.log('🔥 [DEV MODE] FORCING REAL VAPI CALL - credentials available or forced');
    }
    
    try {
      console.log('📞 [useConversationState] Calling startCall()...');
      console.log('📞 [useConversationState] About to call startCall with all checks passed');
      await startCall();
      console.log('✅ [useConversationState] startCall() successful, setting isCallStarted = true');
      setIsCallStarted(true);
      setManualCallStarted(true); // Set manual flag when real call starts
      
      // DISABLED: Focus on Interface1 development only
      // setCurrentInterface('interface2');
      
      console.log('🎯 [useConversationState] Call start completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [useConversationState] Error in startCall():', error);
      console.error('❌ [useConversationState] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Don't set isCallStarted to false here - let user manually end call
      // This prevents popup from disappearing immediately
      console.log('⚠️ [useConversationState] Call failed but keeping isCallStarted = true for debugging');
      setIsCallStarted(true); // Keep it true so popup stays visible
      setManualCallStarted(true); // Keep manual flag true on failure
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [startCall, isCallStarted, manualCallStarted, callDuration, transcripts.length]);

  const handleCallEnd = useCallback(() => {
    console.log('🛑 [useConversationState] Ending call');
    console.log('🔍 [useConversationState] Current isCallStarted state:', isCallStarted);
    
    // Check if we should force VAPI calls in development
    const forceVapiInDev = import.meta.env.VITE_FORCE_VAPI_IN_DEV === 'true';
    const hasVapiCredentials = import.meta.env.VITE_VAPI_PUBLIC_KEY && import.meta.env.VITE_VAPI_ASSISTANT_ID;
    
    // DEV MODE: Skip API calls UNLESS forced or credentials available
    const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
    if (isDevelopment && !forceVapiInDev && !hasVapiCredentials) {
      console.log('🚧 [DEV MODE] Simulating call end - no API calls');
      console.log('❌ [useConversationState] Setting isCallStarted = false (DEV MODE)');
      setIsCallStarted(false);
      setManualCallStarted(false); // Clear manual flag when simulating
      return;
    }
    
    // If we have credentials or force flag, proceed with real VAPI call end
    if (isDevelopment && (forceVapiInDev || hasVapiCredentials)) {
      console.log('🔥 [DEV MODE] FORCING REAL VAPI CALL END');
    }
    
    console.log('📞 [useConversationState] Calling endCall()...');
    endCall();
    console.log('❌ [useConversationState] Setting isCallStarted = false');
    setIsCallStarted(false);
    setManualCallStarted(false); // Clear manual flag on real end
    
    // DISABLED: Focus on Interface1 development only  
    // setCurrentInterface('interface1');
    console.log('📝 [DEV MODE] Staying in Interface1 - No interface switching');
  }, [endCall]);

  const handleCancel = useCallback(() => {
    console.log('❌ [useConversationState] Canceling call - FULL RESET');
    
    try {
      // Reset local states first to prevent further operations
      setIsCallStarted(false);
      setShowConversation(false);
      setManualCallStarted(false); // Clear manual flag on cancel
      
      // End call with error handling  
      try {
        endCall();
        console.log('✅ [useConversationState] endCall() executed successfully');
      } catch (endCallError) {
        console.error('⚠️ [useConversationState] endCall() failed but continuing with cancel:', endCallError);
        // Don't rethrow - we still want to complete the cancel operation
      }
      
      console.log('✅ [useConversationState] Cancel completed - all states reset');
      console.log('📊 [useConversationState] Final state: isCallStarted=false, showConversation=false');
    } catch (error) {
      console.error('❌ [useConversationState] Error in handleCancel:', error);
      
      // Ensure states are reset even if there's an error
      setIsCallStarted(false);
      setShowConversation(false);
      setManualCallStarted(false);
      
      console.log('🔄 [useConversationState] Forced state reset after error');
    }
  }, [endCall]);

  const handleConfirm = useCallback(() => {
    console.log('✅ [useConversationState] Confirming call - PROCESSING SUMMARY');
    console.log('🔍 [useConversationState] Current state before confirm:', {
      isCallStarted,
      showConversation,
      manualCallStarted,
      transcriptsCount: transcripts.length
    });
    
    try {
      console.log('🔄 [useConversationState] Step 1: Calling endCall()...');
      
      // End call and prepare for summary  
      endCall();
      
      console.log('✅ [useConversationState] Step 1 completed: endCall() successful');
      console.log('🔄 [useConversationState] Step 2: Updating UI states...');
      
      // Update states - DIFFERENT from Cancel
      console.log('🔄 [useConversationState] Step 2a: Setting isCallStarted = false');
      setIsCallStarted(false);
      
      console.log('🔄 [useConversationState] Step 2b: Setting showConversation = false');
      setShowConversation(false); // 🆕 CLOSE conversation popup to show summary popup instead
      
      console.log('🔄 [useConversationState] Step 2c: Setting manualCallStarted = false');
      setManualCallStarted(false); // Clear manual flag on confirmation
      
      console.log('✅ [useConversationState] Step 2 completed: All states updated successfully');
      console.log('✅ [useConversationState] Confirm completed - conversation popup closed, summary popup will be shown');
      console.log('📊 [useConversationState] Final state: isCallStarted=false, showConversation=false (summary popup will show)');
      
    } catch (error) {
      console.error('❌ [useConversationState] CRITICAL ERROR in handleConfirm:', error);
      console.error('❌ [useConversationState] Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      
      console.log('🔄 [useConversationState] Attempting fallback state cleanup...');
      
      try {
        // Fallback - close conversation popup even on error
        console.log('🔄 [useConversationState] Fallback: Setting isCallStarted = false');
        setIsCallStarted(false);
        
        console.log('🔄 [useConversationState] Fallback: Setting showConversation = false');
        setShowConversation(false); // Close conversation popup on error too
        
        console.log('🔄 [useConversationState] Fallback: Setting manualCallStarted = false');
        setManualCallStarted(false); // Clear manual flag on fallback
        
        console.log('✅ [useConversationState] Fallback cleanup completed');
      } catch (fallbackError) {
        console.error('❌ [useConversationState] Fallback cleanup also failed:', fallbackError);
      }
      
      // 🔧 FIX: Don't re-throw error - handle it gracefully
      console.log('✅ [useConversationState] Error handled gracefully - continuing with summary popup');
    }
  }, [endCall]);

  return {
    isCallStarted,
    showConversation,
    handleCallStart,
    handleCallEnd,
    handleCancel,
    handleConfirm
  };
}; 