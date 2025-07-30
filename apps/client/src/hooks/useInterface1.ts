/// <reference types="vite/client" />

// Type declaration for import.meta

import { usePopup } from '@/components/features/popup-system/PopupManager';
import { useAssistant } from '@/context';
import { usePopupContext } from '@/context/PopupContext';
import { useCancelHandler } from '@/hooks/useCancelHandler';
import { useConfirmHandler } from '@/hooks/useConfirmHandler';
import { useConversationState } from '@/hooks/useConversationState';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { logger } from '@shared/utils/logger';
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface UseInterface1Props {
  isActive: boolean;
}

interface UseInterface1Return {
  // Loading & Error states
  isLoading: boolean;
  error: string | null;
  hotelConfig: any;

  // Assistant integration
  micLevel: number;

  // Scroll behavior
  showScrollButton: boolean;
  scrollToTop: () => void;
  scrollToSection: (section: 'hero' | 'services' | 'conversation') => void;
  heroSectionRef: React.RefObject<HTMLDivElement>;
  serviceGridRef: React.RefObject<HTMLDivElement>;
  conversationRef: React.RefObject<HTMLDivElement>;
  rightPanelRef: React.RefObject<HTMLDivElement>;

  // Conversation state
  isCallStarted: boolean;
  showConversation: boolean;
  handleCallStart: (lang: any) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => void;
  handleCancel: () => void;
  // ✅ REMOVED: handleConfirm is no longer needed - auto-trigger only

  // Summary popup state
  showingSummary: boolean;

  // Right panel state
  showRightPanel: boolean;
  handleRightPanelToggle: () => void;
  handleRightPanelClose: () => void;

  // Popup system demo functions
  handleShowConversationPopup: () => void;
  handleShowNotificationDemo: () => void;
  handleShowSummaryDemo: () => void;
}

/**
 * useInterface1 - Optimized Interface1 Hook
 *
 * Performance optimizations:
 * - Removed disabled code and unnecessary effects
 * - Memoized expensive computations
 * - Reduced debug logging for production
 * - Simplified hook dependencies
 */
export const useInterface1 = ({
  isActive,
}: UseInterface1Props): UseInterface1Return => {
  // Core dependencies
  const {
    micLevel,
    transcripts,
    callSummary,
    serviceRequests,
    endCall,
    addCallEndListener,
  } = useAssistant();
  const {
    config: hotelConfig,
    isLoading: configLoading,
    error: configError,
  } = useHotelConfiguration();

  // Popup system hooks - optimized imports
  const { showNotification, showSummary } = usePopup();
  const [conversationPopupId, setConversationPopupId] = useState<string | null>(
    null
  );

  // Behavior hooks
  const scrollBehavior = useScrollBehavior({ isActive });
  const conversationState = useConversationState({
    conversationRef: scrollBehavior.conversationRef,
  });

  // Right panel state
  const [showRightPanel, setShowRightPanel] = useState(false);

  // ✅ OPTIMIZED: Memoized button handlers to prevent recreation
  const cancelHandlerConfig = useMemo(
    () => ({
      conversationState,
      conversationPopupId,
      setConversationPopupId,
      setShowRightPanel,
      transcripts,
    }),
    [
      conversationState,
      conversationPopupId,
      setConversationPopupId,
      setShowRightPanel,
      transcripts,
    ]
  ); // Fixed: Added all dependencies

  const confirmHandlerConfig = useMemo(
    () => ({
      endCall,
      transcripts,
      callSummary,
      serviceRequests,
    }),
    [endCall, transcripts, callSummary, serviceRequests]
  ); // Dependencies are correct

  const { handleCancel } = useCancelHandler(cancelHandlerConfig);
  const { autoTriggerSummary } = useConfirmHandler(confirmHandlerConfig);

  // ✅ OPTIMIZED: Track summary popup state with reduced re-renders
  const { popups } = usePopupContext();
  const [showingSummary, setShowingSummary] = useState(false);

  // ✅ OPTIMIZED: Single effect for summary popup monitoring
  useEffect(() => {
    const summaryPopup = popups.find(
      (popup: { type: string }) => popup.type === 'summary'
    );
    const hasSummary = !!summaryPopup;
    if (showingSummary !== hasSummary) {
      setShowingSummary(hasSummary);
    }
  }, [popups, showingSummary]);

  // ✅ REFACTORED: Use autoTriggerSummary from useConfirmHandler instead of autoShowSummary
  const autoShowSummary = useCallback(() => {
    console.log('📞 [DEBUG] autoShowSummary callback triggered');
    if (import.meta.env.DEV) {
      logger.debug(
        'Auto-showing Summary Popup after call end',
        'useInterface1'
      );
    }

    try {
      // ✅ NEW: Use autoTriggerSummary instead of showSummary directly
      console.log('📞 [DEBUG] Calling autoTriggerSummary()');
      autoTriggerSummary();

      console.log('✅ [DEBUG] autoTriggerSummary() completed successfully');
      if (import.meta.env.DEV) {
        logger.success(
          'Summary Popup auto-shown successfully',
          'useInterface1'
        );
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error in autoShowSummary:', error);
      logger.error('Error auto-showing summary popup', 'useInterface1', error);
      setTimeout(() => {
        logger.info(
          'Call completed! Please check your conversation summary.',
          'useInterface1'
        );
      }, 500);
    }
  }, [autoTriggerSummary]);

  // ✅ FIXED: Stable listener registration to prevent re-register
  useEffect(() => {
    console.log(
      '📞 [DEBUG] Registering auto-summary listener - CALL ID:',
      Date.now()
    );
    if (import.meta.env.DEV) {
      logger.debug('Registering auto-summary listener', 'useInterface1');
    }

    const unregister = addCallEndListener(autoShowSummary);
    console.log('✅ [DEBUG] Auto-summary listener registered successfully');

    return () => {
      console.log(
        '📞 [DEBUG] Unregistering auto-summary listener - CALL ID:',
        Date.now()
      );
      if (import.meta.env.DEV) {
        logger.debug('Unregistering auto-summary listener', 'useInterface1');
      }
      unregister();
    };
  }, [addCallEndListener]); // ✅ FIXED: Remove autoShowSummary dependency to prevent re-register

  // ✅ REMOVED: Duplicate listener registration - now handled above

  // ✅ OPTIMIZED: Memoized right panel handlers
  const handleRightPanelToggle = useCallback(() => {
    setShowRightPanel(prev => !prev);
  }, []);

  const handleRightPanelClose = useCallback(() => {
    setShowRightPanel(false);
  }, []);

  // ✅ OPTIMIZED: Memoized demo popup functions with lazy loading
  const handleShowConversationPopup = useCallback(() => {
    if (import.meta.env.DEV) {
      logger.info(
        '🎭 [DEMO] Starting mock conversation to show RealtimeConversationPopup',
        'useInterface1'
      );

      // Trigger mock conversation by calling handleCallStart
      conversationState
        .handleCallStart('vi')
        .then(() => {
          logger.info('✅ [DEMO] Mock conversation started', 'useInterface1');
        })
        .catch(error => {
          logger.error(
            '❌ [DEMO] Failed to start mock conversation:',
            'useInterface1',
            error
          );
        });
    }
  }, [conversationState]);

  const handleShowNotificationDemo = useCallback(() => {
    import('../components/features/popup-system/DemoPopupContent')
      .then(module => {
        const { NotificationDemoContent } = module;
        showNotification(createElement(NotificationDemoContent), {
          title: 'Pool Maintenance',
          priority: 'medium' as const,
          badge: 1,
        });
      })
      .catch(() => {
        // Optimized fallback with minimal DOM creation
        showNotification(
          createElement('div', { style: { padding: '16px' } }, [
            createElement('h4', { key: 'title' }, 'Hotel Notification'),
            createElement(
              'p',
              { key: 'content' },
              'Pool maintenance from 2-4 PM today.'
            ),
          ]),
          {
            title: 'Pool Maintenance',
            priority: 'medium' as const,
            badge: 1,
          }
        );
      });
  }, [showNotification]);

  const handleShowSummaryDemo = useCallback(() => {
    import('../components/features/popup-system/SummaryPopupContent')
      .then(module => {
        const { SummaryPopupContent } = module;
        showSummary(createElement(SummaryPopupContent), {
          title: 'Call Summary',
          priority: 'medium' as const, // ✅ FIX: Change from 'high' to 'medium'
        });
      })
      .catch(() => {
        // Optimized fallback with current time
        const currentTime = new Date().toLocaleTimeString();
        showSummary(
          createElement(
            'div',
            { style: { padding: '16px', fontSize: '12px' } },
            [
              createElement(
                'div',
                {
                  key: 'title',
                  style: { fontWeight: 'bold', marginBottom: '8px' },
                },
                '📋 Call Summary'
              ),
              createElement('div', { key: 'room' }, 'Room: 101'),
              createElement('div', { key: 'items' }, 'Items: 3 requests'),
              createElement(
                'div',
                {
                  key: 'time',
                  style: { fontSize: '10px', color: '#666', marginTop: '8px' },
                },
                `Generated at ${currentTime}`
              ),
            ]
          ),
          {
            title: 'Call Summary',
            priority: 'medium' as const, // ✅ FIX: Change from 'high' to 'medium'
          }
        );
      });
  }, [showSummary]);

  return {
    // Loading & Error states
    isLoading: configLoading,
    error: configError,
    hotelConfig: hotelConfig || null,

    // Assistant integration
    micLevel,

    // Scroll behavior (spread optimized)
    ...scrollBehavior,

    // Conversation state - explicit returns
    isCallStarted: conversationState.isCallStarted,
    showConversation: conversationState.showConversation,
    handleCallStart: conversationState.handleCallStart,
    handleCallEnd: conversationState.handleCallEnd,
    handleCancel,
    // ✅ REMOVED: handleConfirm is no longer needed

    // Summary popup state
    showingSummary,

    // Right panel state
    showRightPanel,
    handleRightPanelToggle,
    handleRightPanelClose,

    // Popup system demo functions
    handleShowConversationPopup,
    handleShowNotificationDemo,
    handleShowSummaryDemo,
  };
};
