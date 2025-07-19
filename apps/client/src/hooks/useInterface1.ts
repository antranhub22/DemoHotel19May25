import { Language } from '@/types/interface1.types';

// Legacy implementation (current working version)
import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { useConversationState } from '@/hooks/useConversationState';
import { useCancelHandler } from '@/hooks/useCancelHandler';
import { useConfirmHandler } from '@/hooks/useConfirmHandler';
import { useState, useEffect, useCallback, useRef, createElement } from 'react';
import { usePopup } from '@/components/popup-system';
import { usePopupContext } from '@/context/PopupContext';

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
  
  // ✅ NEW: Summary popup state
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
 * useInterface1 - Main Hook with Feature Flag
 * 
 * Supports both legacy and refactored implementations:
 * - Legacy: Current working implementation (354 lines monolithic)
 * - Refactored: New modular hooks architecture (5 smaller hooks)
 * 
 * Switch via environment variable: VITE_USE_REFACTORED_INTERFACE1=true
 */
export const useInterface1 = ({ isActive }: UseInterface1Props): UseInterface1Return => {
  // ✅ Single stable implementation
  console.log('✅ [useInterface1] Using single stable implementation');
  return useInterface1Legacy({ isActive });
};

/**
 * Legacy Implementation - Current Working Version
 * Preserved exactly as-is for safety and fallback
 */
const useInterface1Legacy = ({ isActive }: UseInterface1Props): UseInterface1Return => {
  // Core dependencies
  const { micLevel, transcripts, callSummary, serviceRequests, language, endCall } = useAssistant();
  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();
  
  // Popup system hooks - keep all for demo functions, just disable auto-conversation
  const { showConversation, showNotification, showSummary, removePopup } = usePopup();
  const [conversationPopupId, setConversationPopupId] = useState<string | null>(null);
  
  // Behavior hooks
  const scrollBehavior = useScrollBehavior({ isActive });
  const conversationState = useConversationState({ 
    conversationRef: scrollBehavior.conversationRef 
  });
  
  // Right panel state
  const [showRightPanel, setShowRightPanel] = useState(false);
  const isInitialMount = useRef(true);
  
  // DISABLED: Auto-popup effects - using ConversationSection instead
  // All conversation popup management moved to ConversationSection component
  
  // Effect to restart call when language changes during active call
  useEffect(() => {
    // TEMPORARILY DISABLED - causing issues
    console.log('🚫 [useInterface1Legacy] Language change restart logic temporarily disabled for debugging');
    return;
    
    // Skip the initial mount and only react to actual language changes
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (conversationState.isCallStarted && conversationPopupId) {
      console.log('🔄 [useInterface1Legacy] Language changed during active call to:', language);
      console.log('🔄 [useInterface1Legacy] Will restart call with new language assistant');
      
      // Restart the call with new language  
      setTimeout(async () => {
        try {
          console.log('🛑 [useInterface1Legacy] Stopping current call for language switch...');
          await conversationState.handleCallEnd();
          
          // Brief pause then restart
          setTimeout(async () => {
            console.log('🎤 [useInterface1Legacy] Restarting call with new language:', language);
            await conversationState.handleCallStart(language);
          }, 1000);
        } catch (error) {
          console.error('❌ [useInterface1Legacy] Error restarting call with new language:', error);
        }
      }, 300);
    }
  }, [language, conversationState.isCallStarted, conversationPopupId, conversationState.handleCallEnd, conversationState.handleCallStart]); // Include necessary dependencies
  
  const handleRightPanelToggle = () => {
    setShowRightPanel(!showRightPanel);
  };
  
  const handleRightPanelClose = () => {
    setShowRightPanel(false);
  };

  // Demo popup functions - conversation disabled, others active
  const handleShowConversationPopup = () => {
    console.log('Conversation demo disabled - using ConversationSection instead');
    // No longer create conversation popup - handled by ConversationSection component
  };

  const handleShowNotificationDemo = () => {
    import('../components/popup-system/DemoPopupContent').then((module) => {
      const { NotificationDemoContent } = module;
      showNotification(
        createElement(NotificationDemoContent),
        { 
          title: 'Pool Maintenance',
          priority: 'medium' as const,
          badge: 1 
        }
      );
    }).catch(() => {
      // Fallback
      showNotification(
        createElement('div', { style: { padding: '16px' } }, [
          createElement('h4', { key: 'title' }, 'Hotel Notification'),
          createElement('p', { key: 'content' }, 'Pool maintenance from 2-4 PM today.')
        ]),
        { 
          title: 'Pool Maintenance',
          priority: 'medium' as const,
          badge: 1 
        }
      );
    });
  };

  const handleShowSummaryDemo = () => {
    import('../components/popup-system/DemoPopupContent').then((module) => {
      const { SummaryPopupContent } = module;
      showSummary(
        createElement(SummaryPopupContent),
        { 
          title: 'Call Summary',
          priority: 'high' as const
        }
      );
    }).catch(() => {
      // Fallback
      showSummary(
        createElement('div', { style: { padding: '16px', fontSize: '12px' } }, [
          createElement('div', { key: 'title', style: { fontWeight: 'bold', marginBottom: '8px' } }, '📋 Call Summary'),
          createElement('div', { key: 'room' }, 'Room: 101'),
          createElement('div', { key: 'items' }, 'Items: 3 requests'),
          createElement('div', { key: 'time', style: { fontSize: '10px', color: '#666', marginTop: '8px' } }, 'Generated at ' + new Date().toLocaleTimeString())
        ]),
        { 
          title: 'Call Summary',
          priority: 'high' as const
        }
      );
    });
  };

  // Get handlers from separate hook modules
  const { handleCancel } = useCancelHandler({
    conversationState,
    conversationPopupId,
    setConversationPopupId,
    setShowRightPanel,
    transcripts
  });

  const { handleConfirm } = useConfirmHandler({
    endCall, // ✅ FIXED: Use AssistantContext.endCall directly
    transcripts,
    callSummary,
    serviceRequests
  });

  // ✅ FIXED: Track summary popup state - Direct approach
  const { popups } = usePopupContext();
  const [showingSummary, setShowingSummary] = useState(false);

  // ✅ FIXED: Monitor both popup system AND right panel for summary display
  useEffect(() => {
    const summaryPopup = popups.find(popup => popup.type === 'summary');
    setShowingSummary(!!summaryPopup || showRightPanel);
    console.log('🔍 [useInterface1] Summary visibility check:', {
      summaryPopup: !!summaryPopup,
      showRightPanel,
      finalShowingSummary: !!summaryPopup || showRightPanel
    });
  }, [popups, showRightPanel]);

  // ✅ NEW: Listen for custom summary events
  useEffect(() => {
    const handleSummaryStarted = () => {
      console.log('📡 [useInterface1] Summary started event received - hiding Cancel/Confirm buttons');
      setShowingSummary(true);
    };

    const handleSummaryEnded = () => {
      console.log('📡 [useInterface1] Summary ended event received - showing Cancel/Confirm buttons');
      setShowingSummary(false);
    };

    window.addEventListener('summaryStarted', handleSummaryStarted);
    window.addEventListener('summaryEnded', handleSummaryEnded);
    
    return () => {
      window.removeEventListener('summaryStarted', handleSummaryStarted);
      window.removeEventListener('summaryEnded', handleSummaryEnded);
    };
  }, []);

  // Update badge count when transcripts change
  useEffect(() => {
    if (conversationPopupId && transcripts.length > 0) {
      // TODO: Update popup badge count
      console.log(`📊 [useInterface1Legacy] Transcripts updated: ${transcripts.length} messages`);
    }
  }, [transcripts.length, conversationPopupId]);

  return {
    // Loading & Error states
    isLoading: configLoading || !hotelConfig,
    error: configError,
    hotelConfig,
    
    // Assistant integration
    micLevel,
    
    // Scroll behavior (spread)
    ...scrollBehavior,
    
    // Conversation state - BE EXPLICIT
    isCallStarted: conversationState.isCallStarted,
    showConversation: conversationState.showConversation,
    handleCallStart: conversationState.handleCallStart,
    handleCallEnd: conversationState.handleCallEnd,
    handleCancel, // From useCancelHandler
    handleConfirm, // From useConfirmHandler
    
    // ✅ NEW: Summary popup state
    showingSummary,
    
    // Right panel state
    showRightPanel,
    handleRightPanelToggle,
    handleRightPanelClose,
    
    // Popup system demo functions
    handleShowConversationPopup,
    handleShowNotificationDemo,
    handleShowSummaryDemo
  };
}; 