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
  // 🔧 REMOVE: handleConfirm is now in useConfirmHandler
}

export const useConversationState = ({ 
  conversationRef 
}: UseConversationStateProps): UseConversationStateReturn => {
  // Use AssistantContext for real vapi integration
  const { 
    startCall, 
    endCall, 
    callDuration,
    // setCurrentInterface, // ✅ REMOVED: Interface switching (focus Interface1 only)
    transcripts,
    setLanguage
  } = useAssistant();
  
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [manualCallStarted, setManualCallStarted] = useState(false); // Track manual start

  // ✅ FIXED: Auto-sync isCallStarted with call duration and conversation state
  useEffect(() => {
    const isActive = callDuration > 0;
    
    console.log('🔄 [useConversationState] Syncing call states:', {
      callDuration,
      isActive,
      isCallStarted,
      manualCallStarted,
      transcriptsCount: transcripts.length
    });
    
    // Auto-sync isCallStarted with actual call state
    if (isActive && !isCallStarted && !manualCallStarted) {
      // There's an active call but UI shows inactive - sync to active
      console.log('✅ [useConversationState] Active call detected - syncing isCallStarted = true');
      setIsCallStarted(true);
    } else if (!isActive && isCallStarted && !manualCallStarted) {
      // Call ended but UI still shows active - sync to inactive
      console.log('❌ [useConversationState] Call ended - syncing isCallStarted = false');
      setIsCallStarted(false);
    } else if (!manualCallStarted) {
      // No manual start and no active call - set to false
      console.log('❌ [useConversationState] No active call and no manual start - syncing isCallStarted = false');
      setIsCallStarted(false);
    } else {
      // Manual start in progress - don't override, let it stay true
      console.log('⏳ [useConversationState] Manual call start in progress - keeping isCallStarted = true');
    }
  }, [callDuration, isCallStarted, manualCallStarted]); // ✅ REMOVED: transcripts.length
  
  // ✅ FIXED: Separate useEffect for showConversation to prevent flickering
  useEffect(() => {
    const isActive = callDuration > 0;
    const shouldShowConversation = isActive || transcripts.length > 0 || manualCallStarted;
    
    console.log('🔄 [useConversationState] Evaluating showConversation:', {
      isActive,
      transcriptsCount: transcripts.length,
      manualCallStarted,
      currentShowConversation: showConversation,
      shouldShowConversation
    });
    
    // ✅ OPTIMIZATION: Only update if value actually changes
    if (showConversation !== shouldShowConversation) {
      console.log(`🔄 [useConversationState] Updating showConversation: ${showConversation} → ${shouldShowConversation}`);
      setShowConversation(shouldShowConversation);
    } else {
      console.log('✅ [useConversationState] showConversation unchanged - no re-render');
    }
  }, [transcripts.length, manualCallStarted, callDuration]); // ✅ FIXED: Removed showConversation to prevent dependency loop

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
    
    // ✅ IMPROVED: Better error handling for call start
    try {
      if (isDevelopment && !forceVapiInDev && !hasAnyVapiCredentials) {
        console.log('🚧 [DEV MODE] Using simulated call start - limited API calls');
        setIsCallStarted(true);
        setManualCallStarted(true);
        setLanguage(lang);
        console.log('✅ [DEV MODE] Simulated call started successfully');
        return { success: true };
      }
      
      // PRODUCTION MODE or forced VAPI in development
      console.log('🚀 [PRODUCTION MODE] Using real VAPI call start');
      setIsCallStarted(true);
      setManualCallStarted(true);
      
      // ✅ IMPROVED: Enhanced startCall with error handling
      await startCall();
      
      console.log('✅ [useConversationState] Real call started successfully');
      return { success: true };
      
    } catch (error) {
      console.error('❌ [useConversationState] Error starting call:', error);
      
      // ✅ IMPROVED: Reset state on error
      setIsCallStarted(false);
      setManualCallStarted(false);
      
      // ✅ IMPROVED: Better error message handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // ✅ IMPROVED: Categorize and handle different error types
      if (errorMessage.includes('webCallUrl')) {
        return { 
          success: false, 
          error: 'Voice call initialization failed. Please check your internet connection and try again.' 
        };
      } else if (errorMessage.includes('assistant')) {
        return { 
          success: false, 
          error: 'Voice assistant configuration issue. Please contact support.' 
        };
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return { 
          success: false, 
          error: 'Network error. Please check your internet connection and try again.' 
        };
      } else if (errorMessage.includes('permissions') || errorMessage.includes('microphone')) {
        return { 
          success: false, 
          error: 'Microphone access required. Please enable microphone permissions and try again.' 
        };
      } else {
        return { 
          success: false, 
          error: `Failed to start voice call: ${errorMessage}` 
        };
      }
    }
  }, [isCallStarted, manualCallStarted, callDuration, transcripts, startCall, setLanguage]);

  const handleCallEnd = useCallback(() => {
    console.log('🛑 [useConversationState] Ending call');
    console.log('🔍 [useConversationState] Current isCallStarted state:', isCallStarted);
    
    // ✅ FIX: ALWAYS call endCall() first to stop VAPI in all modes
    console.log('📞 [useConversationState] Step 1: Calling endCall() to stop VAPI...');
    try {
      endCall(); // ← This MUST run to stop VAPI instance
      console.log('✅ [useConversationState] endCall() completed - VAPI stopped');
    } catch (endCallError) {
      console.error('❌ [useConversationState] Error in endCall():', endCallError);
      // Continue with state cleanup even if endCall fails
    }
    
    // ✅ FIX: ALWAYS update UI state 
    console.log('📞 [useConversationState] Step 2: Updating UI state...');
    setIsCallStarted(false);
    setManualCallStarted(false);
    console.log('✅ [useConversationState] UI state updated');
    
    // ✅ IMPROVED: Development mode logic AFTER call ending
    console.log('🔍 [useConversationState] Step 3: Checking development mode...');
    const forceVapiInDev = import.meta.env.VITE_FORCE_VAPI_IN_DEV === 'true';
    const hasVapiCredentials = import.meta.env.VITE_VAPI_PUBLIC_KEY && import.meta.env.VITE_VAPI_ASSISTANT_ID;
    const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
    
    if (isDevelopment && !forceVapiInDev && !hasVapiCredentials) {
      console.log('🚧 [DEV MODE] Using simulated call end - limited API calls');
      console.log('📝 [DEV MODE] Call ended successfully with mock data');
      console.log('📝 [DEV MODE] Staying in Interface1 - No interface switching');
      return; // Early return for development simulation
    }
    
    // Production mode or forced VAPI in development
    if (isDevelopment && (forceVapiInDev || hasVapiCredentials)) {
      console.log('🔥 [DEV MODE] Using real VAPI call end - full API integration');
    } else {
      console.log('🚀 [PRODUCTION MODE] Real call end completed');
    }
    
    console.log('📝 [useConversationState] Staying in Interface1 - No interface switching');
  }, [endCall, isCallStarted]);

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

  // 🔧 REMOVE: Old handleConfirm - now in useConfirmHandler

  return {
    isCallStarted,
    showConversation,
    handleCallStart,
    handleCallEnd,
    handleCancel,
    // 🔧 REMOVE: handleConfirm from return
  };
}; 