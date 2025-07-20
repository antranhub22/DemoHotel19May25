import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { useConversationState } from '@/hooks/useConversationState';
import { useCancelHandler } from '@/hooks/useCancelHandler';
import { useConfirmHandler } from '@/hooks/useConfirmHandler';
import { usePopupContext } from '@/context/PopupContext';
import { useState, useEffect, useCallback, useRef, createElement } from 'react';
import { usePopup } from '@/components/popup-system';
import { Language } from '@/types/interface1.types';

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
  
  // ✅ Summary popup state
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
 * useInterface1 - Unified Interface1 Hook
 * 
 * Single source of truth for Interface1 functionality:
 * - Uses dedicated button handlers (useCancelHandler, useConfirmHandler)
 * - Integrates all behavior hooks (scroll, conversation, popup)
 * - Provides comprehensive error handling and state management
 */
export const useInterface1 = ({ isActive }: UseInterface1Props): UseInterface1Return => {
  // Core dependencies
  const { micLevel, transcripts, callSummary, serviceRequests, language, endCall, addCallEndListener } = useAssistant();
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
  
  // ✅ Dedicated button handlers - Single Source of Truth
  const { handleCancel } = useCancelHandler({
    conversationState,
    conversationPopupId,
    setConversationPopupId,
    setShowRightPanel,
    transcripts
  });

  const { handleConfirm } = useConfirmHandler({
    endCall,
    transcripts,
    callSummary,
    serviceRequests
  });

  // ✅ Track summary popup state
  const { popups } = usePopupContext();
  const [showingSummary, setShowingSummary] = useState(false);

  // ✅ Monitor summary popups
  useEffect(() => {
    const summaryPopup = popups.find(popup => popup.type === 'summary');
    setShowingSummary(!!summaryPopup);
  }, [popups]);

  // ✅ AUTO-SUMMARY: Show summary popup when call ends - STABILIZED
  const autoShowSummary = useCallback(() => {
    console.log('🔮 [useInterface1] Auto-showing Summary Popup after call end...');
    
    try {
      showSummary(undefined, {
        title: 'Call Summary',
        priority: 'high'
      });
      
      console.log('✅ [useInterface1] Summary Popup auto-shown successfully');
    } catch (error) {
      console.error('❌ [useInterface1] Error auto-showing summary popup:', error);
      setTimeout(() => {
        alert('Call completed! Please check your conversation summary.');
      }, 500);
    }
  }, [showSummary]);

  // ✅ AUTO-SUMMARY: Register listener for call end events - STABILIZED
  useEffect(() => {
    console.log('📞 [useInterface1] Registering auto-summary listener...');
    
    const unregister = addCallEndListener(autoShowSummary);
    console.log('✅ [useInterface1] Auto-summary listener registered');
    
    return () => {
      console.log('🧹 [useInterface1] Unregistering auto-summary listener...');
      unregister();
    };
  }, [addCallEndListener, autoShowSummary]);
  
  // ✅ DISABLED: Auto-popup effects - using unified ChatPopup instead
  // All conversation popup management moved to ChatPopup component with layout prop
  useEffect(() => {
    // DISABLED: No auto-popup creation
    // Conversation display handled by ChatPopup component in Interface1
    // with layout="grid" for desktop and layout="overlay" for mobile
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
  }, []);

  // Effect to restart call when language changes during active call
  useEffect(() => {
    // TEMPORARILY DISABLED - causing issues
    console.log('🚫 [useInterface1] Language change restart logic temporarily disabled for debugging');
    return;
    
    // Skip the initial mount and only react to actual language changes
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (conversationState.isCallStarted && conversationPopupId) {
      console.log('🔄 [useInterface1] Language changed during active call to:', language);
      console.log('🔄 [useInterface1] Will restart call with new language assistant');
      
      // Restart the call with new language  
      setTimeout(async () => {
        try {
          console.log('🛑 [useInterface1] Stopping current call for language switch...');
          await conversationState.handleCallEnd();
          
          // Brief pause then restart
          setTimeout(async () => {
            console.log('🎤 [useInterface1] Restarting call with new language:', language);
            await conversationState.handleCallStart(language);
          }, 1000);
        } catch (error) {
          console.error('❌ [useInterface1] Error restarting call with new language:', error);
        }
      }, 300);
    }
  }, [language, conversationState.isCallStarted, conversationPopupId, conversationState.handleCallEnd, conversationState.handleCallStart]); // Include necessary dependencies
  
  const handleRightPanelToggle = useCallback(() => {
    setShowRightPanel(prev => !prev);
  }, []);
  
  const handleRightPanelClose = useCallback(() => {
    setShowRightPanel(false);
  }, []);

  // Demo popup functions - conversation disabled, others active - STABILIZED
  const handleShowConversationPopup = useCallback(() => {
    console.log('Conversation demo disabled - using unified ChatPopup instead');
    // No longer create conversation popup - handled by ChatPopup component
  }, []);

  const handleShowNotificationDemo = useCallback(() => {
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
  }, [showNotification]);

  const handleShowSummaryDemo = useCallback(() => {
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
  }, [showSummary]);

  // Update badge count when transcripts change
  useEffect(() => {
    if (conversationPopupId && transcripts.length > 0) {
      // TODO: Update popup badge count
      console.log(`📊 [useInterface1] Transcripts updated: ${transcripts.length} messages`);
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
    handleCancel, // ✅ From useCancelHandler
    handleConfirm, // ✅ From useConfirmHandler
    
    // ✅ Summary popup state
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