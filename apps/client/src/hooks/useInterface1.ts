import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { useConversationState } from '@/hooks/useConversationState';
import { useCancelHandler } from '@/hooks/useCancelHandler';
import { useConfirmHandler } from '@/hooks/useConfirmHandler';
import { usePopupContext } from '@/context/PopupContext';
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  createElement,
  useMemo,
} from 'react';
import { usePopup } from '@/components/popup-system';

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
  handleConfirm: () => void;

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
  const { showConversation, showNotification, showSummary } = usePopup();
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
    [conversationState, conversationPopupId, transcripts]
  );

  const confirmHandlerConfig = useMemo(
    () => ({
      endCall,
      transcripts,
      callSummary,
      serviceRequests,
    }),
    [endCall, transcripts, callSummary, serviceRequests]
  );

  const { handleCancel } = useCancelHandler(cancelHandlerConfig);
  const { handleConfirm } = useConfirmHandler(confirmHandlerConfig);

  // ✅ OPTIMIZED: Track summary popup state with reduced re-renders
  const { popups } = usePopupContext();
  const [showingSummary, setShowingSummary] = useState(false);

  // ✅ OPTIMIZED: Single effect for summary popup monitoring
  useEffect(() => {
    const summaryPopup = popups.find(popup => popup.type === 'summary');
    const hasSummary = !!summaryPopup;
    if (showingSummary !== hasSummary) {
      setShowingSummary(hasSummary);
    }
  }, [popups, showingSummary]);

  // ✅ OPTIMIZED: Memoized auto-summary callback
  const autoShowSummary = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log(
        '🔮 [useInterface1] Auto-showing Summary Popup after call end...'
      );
    }

    try {
      showSummary(undefined, {
        title: 'Call Summary',
        priority: 'high',
      });

      if (import.meta.env.DEV) {
        console.log('✅ [useInterface1] Summary Popup auto-shown successfully');
      }
    } catch (error) {
      console.error(
        '❌ [useInterface1] Error auto-showing summary popup:',
        error
      );
      setTimeout(() => {
        alert('Call completed! Please check your conversation summary.');
      }, 500);
    }
  }, [showSummary]);

  // ✅ OPTIMIZED: Auto-summary listener registration
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('📞 [useInterface1] Registering auto-summary listener...');
    }

    const unregister = addCallEndListener(autoShowSummary);

    return () => {
      if (import.meta.env.DEV) {
        console.log(
          '🧹 [useInterface1] Unregistering auto-summary listener...'
        );
      }
      unregister();
    };
  }, [addCallEndListener, autoShowSummary]);

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
      console.log(
        'Conversation demo disabled - using unified ChatPopup instead'
      );
    }
  }, []);

  const handleShowNotificationDemo = useCallback(() => {
    import('../components/popup-system/DemoPopupContent')
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
    import('../components/popup-system/DemoPopupContent')
      .then(module => {
        const { SummaryPopupContent } = module;
        showSummary(createElement(SummaryPopupContent), {
          title: 'Call Summary',
          priority: 'high' as const,
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
            priority: 'high' as const,
          }
        );
      });
  }, [showSummary]);

  return {
    // Loading & Error states
    isLoading: configLoading || !hotelConfig,
    error: configError,
    hotelConfig,

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
    handleConfirm,

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
