/// <reference types="vite/client" />

// Type declaration for import.meta

import { usePopup } from '@/components/features/popup-system/PopupManager';
import { useAssistant } from '@/context';
import { usePopupContext } from '@/context/PopupContext';
// ✅ REMOVED: useCancelHandler import - no longer needed
import { useConfirmHandler } from '@/hooks/useConfirmHandler';
import { useConversationState } from '@/hooks/useConversationState';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { logger } from '@shared/utils/logger';
import { createElement, useCallback, useEffect, useState } from 'react';

// ✅ TypeScript declaration for global updateSummaryPopup function
declare global {
  interface Window {
    updateSummaryPopup?: (summary: string, serviceRequests: any[]) => void;
  }
}

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
  // ✅ REMOVED: handleCancel is no longer needed - auto-trigger only
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
  const { micLevel, addCallEndListener } = useAssistant();
  const {
    config: hotelConfig,
    isLoading: configLoading,
    error: configError,
  } = useHotelConfiguration();

  // Popup system hooks - optimized imports
  const { showNotification } = usePopup();
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

  // ✅ REMOVED: handleCancel is no longer needed
  const { autoTriggerSummary, updateSummaryPopup } = useConfirmHandler();

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

  // ✅ SIMPLIFIED: Clean auto-show summary - no complex validation
  const autoShowSummary = useCallback(() => {
    console.log('📞 [DEBUG] Call ended - triggering summary popup');

    // ✅ SIMPLE: Just trigger the popup, no validation needed
    autoTriggerSummary();

    console.log('✅ [DEBUG] Summary popup triggered successfully');
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

  // ✅ NEW: Connect updateSummaryPopup to global window for WebSocket access
  useEffect(() => {
    console.log('🔗 [DEBUG] Connecting updateSummaryPopup to window');
    window.updateSummaryPopup = updateSummaryPopup;

    return () => {
      console.log('🔗 [DEBUG] Cleaning up updateSummaryPopup from window');
      delete window.updateSummaryPopup;
    };
  }, [updateSummaryPopup]);

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
    // ✅ DISABLED: Demo summary popup - use webhook flow instead
    console.log('🚫 [DEBUG] Demo summary popup disabled - use webhook flow');
    console.log(
      '📋 [INFO] Summary popup will be triggered automatically when call ends'
    );
    console.log(
      '📋 [INFO] Full transcript will be processed by OpenAI via webhook'
    );
  }, []);

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
    // ✅ REMOVED: handleCancel is no longer needed
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
