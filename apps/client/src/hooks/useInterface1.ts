import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { useConversationState } from '@/hooks/useConversationState';
import { useState, createElement, useEffect } from 'react';
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
  
  // Right panel state
  showRightPanel: boolean;
  handleRightPanelToggle: () => void;
  handleRightPanelClose: () => void;
  
  // Popup system demo functions
  handleShowConversationPopup: () => void;
  handleShowNotificationDemo: () => void;
}

export const useInterface1 = ({ isActive }: UseInterface1Props): UseInterface1Return => {
  // Core dependencies
  const { micLevel, transcripts } = useAssistant();
  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();
  
  // Popup system
  const { showConversation, showNotification, showAlert, removePopup } = usePopup();
  
  // Behavior hooks
  const scrollBehavior = useScrollBehavior({ isActive });
  const conversationState = useConversationState({ 
    conversationRef: scrollBehavior.conversationRef 
  });
  
  // Right panel state
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [conversationPopupId, setConversationPopupId] = useState<string | null>(null);
  
  const handleRightPanelToggle = () => {
    setShowRightPanel(!showRightPanel);
  };
  
  const handleRightPanelClose = () => {
    setShowRightPanel(false);
  };

  // Demo popup functions
  const handleShowConversationPopup = () => {
    import('../components/popup-system/DemoPopupContent').then((module) => {
      const { ConversationDemoContent } = module;
      showConversation(
        createElement(ConversationDemoContent),
        { 
          title: 'Voice Assistant Demo',
          priority: 'high' as const,
          badge: 1 
        }
      );
    }).catch(() => {
      // Fallback
      showConversation(
        createElement('div', { style: { padding: '16px' } }, [
          createElement('h3', { key: 'title' }, 'Realtime Conversation Demo'),
          createElement('p', { key: 'content' }, 'This is the new iOS-style popup system!')
        ]),
        { 
          title: 'Voice Assistant Demo',
          priority: 'high' as const,
          badge: 1 
        }
      );
    });
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

  // Auto-show conversation popup when call starts
  useEffect(() => {
    if (conversationState.isCallStarted && !conversationPopupId) {
      console.log('🎤 [useInterface1] Call started, showing conversation popup');
      
      // Import và render RealtimeConversationPopup content
      import('../components/RealtimeConversationPopup').then((module) => {
        const RealtimeConversationPopup = module.default;
        
        const popupId = showConversation(
          createElement(RealtimeConversationPopup, {
            isOpen: true,
            onClose: () => {
              if (conversationPopupId) {
                removePopup(conversationPopupId);
                setConversationPopupId(null);
              }
            },
            isRight: false
          }),
          { 
            title: 'Realtime Conversation',
            priority: 'high' as const,
            badge: transcripts.length > 0 ? transcripts.length : undefined
          }
        );
        
        setConversationPopupId(popupId);
      }).catch(error => {
        console.error('Failed to load RealtimeConversationPopup:', error);
        
        // Fallback to simple content
        const popupId = showConversation(
          createElement('div', { style: { padding: '16px' } }, [
            createElement('h3', { key: 'title' }, 'Realtime Conversation'),
            createElement('p', { key: 'content' }, `Active call - ${transcripts.length} messages`)
          ]),
          { 
            title: 'Voice Assistant Active',
            priority: 'high' as const,
            badge: transcripts.length > 0 ? transcripts.length : undefined
          }
        );
        
        setConversationPopupId(popupId);
      });
    }
    
    // Auto-close conversation popup when call ends
    if (!conversationState.isCallStarted && conversationPopupId) {
      console.log('🛑 [useInterface1] Call ended, removing conversation popup');
      removePopup(conversationPopupId);
      setConversationPopupId(null);
    }
  }, [conversationState.isCallStarted, conversationPopupId, showConversation, removePopup, transcripts.length]);

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
    
    // Conversation state (spread)
    ...conversationState,
    
    // Right panel state
    showRightPanel,
    handleRightPanelToggle,
    handleRightPanelClose,
    
    // Popup system demo functions
    handleShowConversationPopup,
    handleShowNotificationDemo
  };
}; 