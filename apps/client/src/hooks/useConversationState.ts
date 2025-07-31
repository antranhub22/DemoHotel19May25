/// <reference types="vite/client" />

// Type declaration for import.meta

import { INTERFACE_CONSTANTS } from '@/constants/interface1Constants';
import { useAssistant } from '@/context';
import { Language } from '@/types/interface1.types';
import { logger } from '@shared/utils/logger';
import { RefObject, useCallback, useEffect, useState } from 'react';

interface UseConversationStateProps {
  conversationRef: RefObject<HTMLDivElement>;
}

interface UseConversationStateReturn {
  isCallStarted: boolean;
  showConversation: boolean;
  handleCallStart: (
    lang: Language
  ) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => Promise<void>;
  // ✅ REMOVED: handleCancel is no longer needed - auto-trigger only
  // 🔧 REMOVE: handleConfirm is now in useConfirmHandler
}

export const useConversationState = ({
  conversationRef,
}: UseConversationStateProps): UseConversationStateReturn => {
  // Use AssistantContext for real vapi integration
  const {
    startCall,
    endCall,
    callDuration,
    // setCurrentInterface, // ✅ REMOVED: Interface switching (focus Interface1 only)
    transcripts,
    setLanguage,
    addTranscript, // ✅ ADD: Import addTranscript for mock generation
    // ✅ NEW: Import enhancedEndCall for summary processing
  } = useAssistant();

  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [manualCallStarted, setManualCallStarted] = useState(false); // Track manual start

  // ✅ FIXED: Auto-sync isCallStarted with call duration and conversation state
  useEffect(() => {
    const isActive = callDuration > 0;

    logger.debug(
      '🔄 [useConversationState] Syncing call states:',
      'Component',
      {
        callDuration,
        isActive,
        isCallStarted,
        manualCallStarted,
        transcriptsCount: transcripts.length,
      }
    );

    // Auto-sync isCallStarted with actual call state
    if (isActive && !isCallStarted && !manualCallStarted) {
      // There's an active call but UI shows inactive - sync to active
      logger.debug(
        '✅ [useConversationState] Active call detected - syncing isCallStarted = true',
        'Component'
      );
      setIsCallStarted(true);
    } else if (!isActive && isCallStarted && !manualCallStarted) {
      // Call ended but UI still shows active - sync to inactive
      logger.debug(
        '❌ [useConversationState] Call ended - syncing isCallStarted = false',
        'Component'
      );
      setIsCallStarted(false);
    } else if (!manualCallStarted) {
      // No manual start and no active call - set to false
      logger.debug(
        '❌ [useConversationState] No active call and no manual start - syncing isCallStarted = false',
        'Component'
      );
      setIsCallStarted(false);
    } else {
      // Manual start in progress - don't override, let it stay true
      logger.debug(
        '⏳ [useConversationState] Manual call start in progress - keeping isCallStarted = true',
        'Component'
      );
    }
  }, [callDuration, isCallStarted, manualCallStarted, transcripts.length]); // Fixed: Added transcripts.length

  // ✅ FIXED: Separate useEffect for showConversation to prevent flickering
  useEffect(() => {
    const isActive = callDuration > 0;
    const shouldShowConversation =
      isActive || transcripts.length > 0 || manualCallStarted;

    // ✅ ENHANCED DEBUG: More detailed logging
    console.log(
      '🔄 [useConversationState] Evaluating showConversation (DETAILED):',
      {
        callDuration,
        isActive,
        transcriptsCount: transcripts.length,
        transcriptsData: transcripts.map(t => ({
          id: t.id,
          role: t.role,
          content: t.content?.substring(0, 30),
        })),
        manualCallStarted,
        currentShowConversation: showConversation,
        shouldShowConversation,
        willUpdate: showConversation !== shouldShowConversation,
      }
    );

    logger.debug(
      '🔄 [useConversationState] Evaluating showConversation:',
      'Component',
      {
        isActive,
        transcriptsCount: transcripts.length,
        manualCallStarted,
        currentShowConversation: showConversation,
        shouldShowConversation,
      }
    );

    // ✅ OPTIMIZATION: Only update if value actually changes
    if (showConversation !== shouldShowConversation) {
      console.log(
        `🔄 [useConversationState] Updating showConversation: ${showConversation} → ${shouldShowConversation}`
      );

      logger.debug(
        `🔄 [useConversationState] Updating showConversation: ${showConversation} → ${shouldShowConversation}`,
        'Component'
      );
      setShowConversation(shouldShowConversation);
    } else {
      console.log(
        '✅ [useConversationState] showConversation unchanged - no re-render'
      );

      logger.debug(
        '✅ [useConversationState] showConversation unchanged - no re-render',
        'Component'
      );
    }
  }, [transcripts.length, manualCallStarted, callDuration]); // 🔧 FIX: Removed showConversation to prevent infinite loop

  // Auto scroll to conversation when it appears
  useEffect(() => {
    if (showConversation && conversationRef.current) {
      setTimeout(() => {
        conversationRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }, INTERFACE_CONSTANTS.AUTO_SCROLL_DELAY);
    }
  }, [showConversation]); // Fixed: Removed conversationRef from dependencies as it's a ref

  const handleCallStart = useCallback(
    async (lang: Language): Promise<{ success: boolean; error?: string }> => {
      logger.debug(
        '🎤 [useConversationState] Starting call with language:',
        'Component',
        lang
      );
      logger.debug(
        '🎤 [useConversationState] Current state before call:',
        'Component',
        {
          isCallStarted,
          manualCallStarted,
          callDuration,
          transcriptsCount: transcripts.length,
        }
      );

      // Check if we should force VAPI calls in development
      const forceVapiInDev = import.meta.env.VITE_FORCE_VAPI_IN_DEV === 'true';
      const hasVapiCredentials =
        import.meta.env.VITE_VAPI_PUBLIC_KEY &&
        import.meta.env.VITE_VAPI_ASSISTANT_ID;

      logger.debug(
        '🔍 [useConversationState] Environment check:',
        'Component',
        {
          isDevelopment: import.meta.env.DEV,
          forceVapiInDev,
          hasVapiCredentials: !!hasVapiCredentials,
          publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY
            ? 'EXISTS'
            : 'MISSING',
          assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID
            ? 'EXISTS'
            : 'MISSING',
          // Also check individual language keys
          publicKey_VI: import.meta.env.VITE_VAPI_PUBLIC_KEY_VI
            ? 'EXISTS'
            : 'MISSING',
          assistantId_VI: import.meta.env.VITE_VAPI_ASSISTANT_ID_VI
            ? 'EXISTS'
            : 'MISSING',
        }
      );

      // DEV MODE: Check if we have ANY VAPI credentials (including language-specific ones)
      const hasAnyVapiCredentials =
        import.meta.env.VITE_VAPI_PUBLIC_KEY ||
        import.meta.env.VITE_VAPI_PUBLIC_KEY_VI ||
        import.meta.env.VITE_VAPI_PUBLIC_KEY_FR ||
        import.meta.env.VITE_VAPI_PUBLIC_KEY_ZH ||
        import.meta.env.VITE_VAPI_PUBLIC_KEY_RU ||
        import.meta.env.VITE_VAPI_PUBLIC_KEY_KO;

      logger.debug(
        '🔍 [useConversationState] hasAnyVapiCredentials:',
        'Component',
        !!hasAnyVapiCredentials
      );

      // DEV MODE: Skip actual API calls UNLESS forced or credentials available
      const isDevelopment =
        import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';

      // ✅ IMPROVED: Better error handling for call start
      try {
        if (isDevelopment && !forceVapiInDev && !hasAnyVapiCredentials) {
          logger.debug(
            '🚧 [DEV MODE] Using simulated call start with mock transcripts',
            'Component'
          );
          setIsCallStarted(true);
          setManualCallStarted(true);
          setLanguage(lang);

          // ✅ NEW: Generate mock transcript conversation for UI testing
          const mockCallId = `dev-call-${Date.now()}`;
          logger.debug(
            '📝 [DEV MODE] Generating mock transcripts for conversation testing',
            'Component',
            { mockCallId }
          );

          // Mock conversation sequence with realistic timing
          const mockConversation = [
            {
              role: 'user',
              content: 'Xin chào, tôi muốn đặt room service',
              delay: 1000,
            },
            {
              role: 'assistant',
              content:
                'Chào bạn! Tôi có thể giúp bạn đặt room service. Bạn muốn đặt gì ạ?',
              delay: 2000,
            },
            {
              role: 'user',
              content: 'Tôi muốn đặt một ly cà phê và bánh mì sandwich',
              delay: 3000,
            },
            {
              role: 'assistant',
              content:
                'Được rồi ạ! Tôi sẽ đặt cho bạn 1 ly cà phê và 1 bánh mì sandwich. Bạn ở phòng số mấy ạ?',
              delay: 4000,
            },
            { role: 'user', content: 'Phòng 205', delay: 5000 },
            {
              role: 'assistant',
              content:
                'Perfect! Tôi đã ghi nhận đơn hàng cho phòng 205: 1 ly cà phê và 1 bánh mì sandwich. Đơn hàng sẽ được giao trong 15-20 phút. Bạn có cần gì thêm không ạ?',
              delay: 6000,
            },
          ];

          // Generate mock transcripts with realistic timing
          mockConversation.forEach((msg, index) => {
            setTimeout(() => {
              logger.debug(
                `📝 [DEV MODE] Adding mock transcript ${index + 1}/${mockConversation.length}:`,
                'Component',
                {
                  role: msg.role,
                  content: msg.content.substring(0, 30) + '...',
                }
              );

              addTranscript({
                callId: mockCallId,
                content: msg.content,
                role: msg.role as 'user' | 'assistant',
                tenantId: 'tenant-default',
              });
            }, msg.delay);
          });

          logger.debug(
            '✅ [DEV MODE] Mock call started successfully with transcript generation',
            'Component'
          );
          return { success: true };
        }

        // PRODUCTION MODE or forced VAPI in development
        logger.debug(
          '🚀 [PRODUCTION MODE] Using real VAPI call start',
          'Component'
        );

        // ✅ NEW: Enhanced debug logging before calling startCall
        console.log(
          '🔥 [DEBUG] useConversationState about to call startCall:',
          {
            language: lang,
            timestamp: new Date().toISOString(),
            startCallFunction: !!startCall,
            startCallType: typeof startCall,
            forceVapiInDev,
            hasAnyVapiCredentials: !!hasAnyVapiCredentials,
            isDevelopment,
          }
        );

        setIsCallStarted(true);
        setManualCallStarted(true);

        // ✅ FIXED: Pass language directly to startCall to ensure correct assistant is used
        logger.debug(
          '🌍 [useConversationState] Starting call with specific language:',
          'Component',
          lang
        );

        // ✅ NEW: Detailed debug before startCall
        console.log('🎯 [DEBUG] Calling startCall function:', {
          language: lang,
          timestamp: new Date().toISOString(),
        });

        await startCall(lang); // Pass language directly instead of relying on context

        // ✅ NEW: Debug after successful startCall
        console.log('🎉 [DEBUG] startCall completed successfully:', {
          language: lang,
          timestamp: new Date().toISOString(),
        });

        // ✅ IMPROVED: Update context language after successful call start
        setLanguage(lang);

        logger.debug(
          '✅ [useConversationState] Real call started successfully',
          'Component'
        );
        return { success: true };
      } catch (error) {
        // ✅ NEW: Enhanced error debugging
        console.error(
          '💥 [DEBUG] Error in useConversationState.handleCallStart:',
          {
            error,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : 'No stack',
            timestamp: new Date().toISOString(),
            language: lang,
            isDevelopment,
            forceVapiInDev,
            hasAnyVapiCredentials: !!hasAnyVapiCredentials,
          }
        );

        logger.error(
          '❌ [useConversationState] Error starting call:',
          'Component',
          error
        );

        // ✅ IMPROVED: Reset state on error
        setIsCallStarted(false);
        setManualCallStarted(false);

        // ✅ IMPROVED: Better error message handling
        const errorMessage =
          error instanceof Error
            ? (error as any)?.message || String(error)
            : 'Unknown error occurred';

        // ✅ IMPROVED: Categorize and handle different error types
        if (errorMessage.includes('webCallUrl')) {
          return {
            success: false,
            error:
              'Voice call initialization failed. Please check your internet connection and try again.',
          };
        } else if (errorMessage.includes('assistant')) {
          return {
            success: false,
            error:
              'Voice assistant configuration issue. Please contact support.',
          };
        } else if (
          errorMessage.includes('network') ||
          errorMessage.includes('fetch')
        ) {
          return {
            success: false,
            error:
              'Network error. Please check your internet connection and try again.',
          };
        } else if (
          errorMessage.includes('permissions') ||
          errorMessage.includes('microphone')
        ) {
          return {
            success: false,
            error:
              'Microphone access required. Please enable microphone permissions and try again.',
          };
        } else {
          return {
            success: false,
            error: `Failed to start voice call: ${errorMessage}`,
          };
        }
      }
    },
    [
      isCallStarted,
      manualCallStarted,
      callDuration,
      transcripts,
      startCall,
      setLanguage,
      // ✅ REMOVED: addTranscript - has stable reference and causes circular dependency
    ]
  );

  const handleCallEnd = useCallback(async () => {
    logger.debug('🛑 [useConversationState] Ending call', 'Component');
    logger.debug(
      '🔍 [useConversationState] Current isCallStarted state:',
      'Component',
      isCallStarted
    );

    // ✅ MERGED: Use single endCall() function with full functionality
    console.log(
      '📞 [DEBUG] useConversationState.handleCallEnd - Calling merged endCall()'
    );
    logger.debug(
      '📞 [useConversationState] Calling merged endCall() with summary processing...',
      'Component'
    );

    try {
      await endCall(); // ← Now includes summary processing
      console.log(
        '✅ [DEBUG] useConversationState.handleCallEnd - endCall() completed successfully'
      );
      logger.debug(
        '✅ [useConversationState] endCall() completed - VAPI stopped + summary processed',
        'Component'
      );
    } catch (endCallError) {
      console.error(
        '❌ [DEBUG] useConversationState.handleCallEnd - Error in endCall():',
        endCallError
      );
      logger.error(
        '❌ [useConversationState] Error in endCall():',
        'Component',
        endCallError
      );
      // Continue with state cleanup even if endCall fails
    }

    // ✅ FIX: ALWAYS update UI state
    logger.debug(
      '📞 [useConversationState] Step 2: Updating UI state...',
      'Component'
    );
    setIsCallStarted(false);
    setManualCallStarted(false);
    logger.debug('✅ [useConversationState] UI state updated', 'Component');

    // ✅ IMPROVED: Development mode logic AFTER call ending
    logger.debug(
      '🔍 [useConversationState] Step 3: Checking development mode...',
      'Component'
    );
    const forceVapiInDev = import.meta.env.VITE_FORCE_VAPI_IN_DEV === 'true';
    const hasVapiCredentials =
      import.meta.env.VITE_VAPI_PUBLIC_KEY &&
      import.meta.env.VITE_VAPI_ASSISTANT_ID;
    const isDevelopment =
      import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';

    if (isDevelopment && !forceVapiInDev && !hasVapiCredentials) {
      logger.debug(
        '🚧 [DEV MODE] Using simulated call end - limited API calls',
        'Component'
      );
      logger.debug(
        '📝 [DEV MODE] Call ended successfully with mock data',
        'Component'
      );
      logger.debug(
        '📝 [DEV MODE] Staying in Interface1 - No interface switching',
        'Component'
      );
      return; // Early return for development simulation
    }

    // Production mode or forced VAPI in development
    if (isDevelopment && (forceVapiInDev || hasVapiCredentials)) {
      logger.debug(
        '🔥 [DEV MODE] Using real VAPI call end - full API integration',
        'Component'
      );
    } else {
      logger.debug('🚀 [PRODUCTION MODE] Real call end completed', 'Component');
    }

    logger.debug(
      '📝 [useConversationState] Staying in Interface1 - No interface switching',
      'Component'
    );
  }, [endCall, isCallStarted]);

  // ✅ REMOVED: handleCancel is no longer needed - auto-trigger only

  return {
    isCallStarted,
    showConversation,
    handleCallStart,
    handleCallEnd,
    // ✅ REMOVED: handleCancel is no longer needed
  };
};
