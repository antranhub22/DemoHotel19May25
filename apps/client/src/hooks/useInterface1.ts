import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { useConversationState } from '@/hooks/useConversationState';
import { useState, createElement, useEffect, useCallback, useRef } from 'react';
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
  
  // Right panel state
  showRightPanel: boolean;
  handleRightPanelToggle: () => void;
  handleRightPanelClose: () => void;
  
  // Popup system demo functions
  handleShowConversationPopup: () => void;
  handleShowNotificationDemo: () => void;
  handleShowSummaryDemo: () => void;
}

export const useInterface1 = ({ isActive }: UseInterface1Props): UseInterface1Return => {
  // Core dependencies
  const { micLevel, transcripts, callSummary, serviceRequests, language } = useAssistant();
  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();
  
  // Popup system hooks
  const { showConversation, showNotification, showSummary, removePopup } = usePopup();
  
  // Behavior hooks
  const scrollBehavior = useScrollBehavior({ isActive });
  const conversationState = useConversationState({ 
    conversationRef: scrollBehavior.conversationRef 
  });
  
  // Right panel state
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [conversationPopupId, setConversationPopupId] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  
  // Auto-show conversation popup when call starts
  useEffect(() => {
    console.log('🔍 [useInterface1] Popup effect triggered:', {
      isCallStarted: conversationState.isCallStarted,
      conversationPopupId,
      isActive
    });
    
    if (conversationState.isCallStarted && !conversationPopupId && isActive) {
      console.log('✅ [useInterface1] Showing conversation popup...');
      
      import('../components/RealtimeConversationPopup').then((module) => {
        const { default: RealtimeConversationPopup } = module;
        const popupId = showConversation(
          createElement(RealtimeConversationPopup, {
            isOpen: true,
            onClose: () => {
              console.log('🗑️ [useInterface1] Popup onClose triggered');
              setConversationPopupId(null);
            }
          }),
          { 
            title: 'Voice Assistant',
            priority: 'high' as const,
            badge: transcripts.length > 0 ? transcripts.length : undefined
          }
        );
        console.log('📱 [useInterface1] Popup created with ID:', popupId);
        setConversationPopupId(popupId);
      }).catch((error) => {
        console.error('❌ [useInterface1] Failed to load RealtimeConversationPopup:', error);
        // Fallback to basic conversation view
        const popupId = showConversation(
          createElement('div', { 
            style: { 
              padding: '16px', 
              height: '400px',
              overflow: 'auto',
              fontSize: '14px' 
            } 
          }, [
            createElement('h3', { key: 'title', style: { marginBottom: '12px' } }, 'Voice Conversation'),
            createElement('div', { key: 'status' }, `Call Status: ${conversationState.isCallStarted ? 'Active' : 'Inactive'}`),
            ...transcripts.map((transcript, index) => 
              createElement('div', { 
                key: index,
                style: { 
                  margin: '8px 0',
                  padding: '8px',
                  backgroundColor: transcript.role === 'user' ? '#f0f9ff' : '#f9fafb',
                  borderRadius: '6px'
                }
              }, `${transcript.role}: ${transcript.content}`)
            )
          ]),
          { 
            title: 'Voice Assistant',
            priority: 'high' as const,
            badge: transcripts.length > 0 ? transcripts.length : undefined
          }
        );
        console.log('📱 [useInterface1] Fallback popup created with ID:', popupId);
        setConversationPopupId(popupId);
      });
    } else if (!conversationState.isCallStarted && conversationPopupId) {
      // Only remove popup if call actually ended (not if interface changed)
      console.log('🛑 [useInterface1] Call ended, will remove popup after delay to prevent race conditions');
      console.log('🔍 [useInterface1] Interface isActive:', isActive);
      
      // Immediate removal for now - the delay was causing issues
      console.log('🗑️ [useInterface1] Removing conversation popup immediately');
      removePopup(conversationPopupId);
      setConversationPopupId(null);
    }
  }, [conversationState.isCallStarted, conversationPopupId, isActive]); // Simplified dependencies
  
  // Separate effect to update badge count when transcripts change
  useEffect(() => {
    if (conversationPopupId && transcripts.length > 0) {
      console.log('🔢 [useInterface1] Updating popup badge count:', transcripts.length);
      // Note: PopupManager doesn't currently support updating badge count after creation
      // This is a future enhancement - for now we just log the change
    }
  }, [transcripts.length, conversationPopupId]);
  
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

  // Add specific handlers for SiriButtonContainer Cancel/Confirm
  const handleCancel = useCallback(() => {
    console.log('❌ [useInterface1] Cancel button clicked in SiriButtonContainer');
    console.log('📊 [useInterface1] Current state:', { 
      isCallStarted: conversationState.isCallStarted,
      conversationPopupId,
      transcriptsCount: transcripts.length 
    });
    
    try {
      // Clear any active popups first - this should always succeed
      if (conversationPopupId) {
        try {
          console.log('🗑️ [useInterface1] Removing conversation popup:', conversationPopupId);
          removePopup(conversationPopupId);
          setConversationPopupId(null);
          console.log('✅ [useInterface1] Popup removed successfully');
        } catch (popupError) {
          console.error('⚠️ [useInterface1] Failed to remove popup but continuing:', popupError);
          // Force clear the popup ID anyway
          setConversationPopupId(null);
        }
      }
      
      // Use conversation state handler with error isolation
      try {
        conversationState.handleCancel();
        console.log('✅ [useInterface1] conversationState.handleCancel() completed');
      } catch (stateError) {
        console.error('⚠️ [useInterface1] conversationState.handleCancel() failed:', stateError);
        // Continue execution - the important thing is that popup is cleared
      }
      
      console.log('✅ [useInterface1] Cancel completed - staying in Interface1');
    } catch (error) {
      console.error('❌ [useInterface1] Error in handleCancel:', error);
      
      // Emergency cleanup - ensure popup is removed even on error
      if (conversationPopupId) {
        console.log('🚨 [useInterface1] Emergency popup cleanup');
        try {
          removePopup(conversationPopupId);
        } catch (cleanupError) {
          console.error('🚨 [useInterface1] Emergency cleanup failed:', cleanupError);
        }
        setConversationPopupId(null);
      }
      
      // Show user-friendly message instead of crashing
      console.log('🔄 [useInterface1] Cancel operation completed with errors but UI state restored');
    }
  }, [conversationState, conversationPopupId, removePopup, transcripts.length]);

  const handleConfirm = useCallback(() => {
    console.log('✅ [useInterface1] Confirm button clicked in SiriButtonContainer');
    console.log('📊 [useInterface1] Current state:', { 
      isCallStarted: conversationState.isCallStarted,
      transcriptsCount: transcripts.length,
      hasCallSummary: !!callSummary,
      hasServiceRequests: serviceRequests?.length > 0
    });
    
    // DEV MODE: Skip API calls to prevent server overload
    const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
    if (isDevelopment) {
      console.log('🚧 [DEV MODE] Skipping API calls - showing demo summary popup');
      
      // Clear conversation popup if active
      if (conversationPopupId) {
        console.log('🗑️ [useInterface1] Removing conversation popup after confirm');
        removePopup(conversationPopupId);
        setConversationPopupId(null);
      }
      
      // Show demo summary popup immediately
      setTimeout(() => {
        console.log('📋 [DEV MODE] Showing demo summary popup');
        const summaryPopupId = showSummary(undefined, { 
          title: 'Call Summary (Demo)',
          priority: 'high' 
        });
        console.log('✅ [DEV MODE] Demo summary popup created:', summaryPopupId);
      }, 500);
      
      return;
    }
    
    try {
      // Use conversation state handler first
      conversationState.handleConfirm();
      
      // Clear conversation popup if active
      if (conversationPopupId) {
        console.log('🗑️ [useInterface1] Removing conversation popup after confirm');
        removePopup(conversationPopupId);
        setConversationPopupId(null);
      }
      
      // Auto-show summary popup after confirmation with delay for processing
      setTimeout(() => {
        console.log('📋 [useInterface1] Auto-showing summary popup after confirm');
        console.log('📊 [useInterface1] Summary data available:', {
          callSummary: !!callSummary,
          serviceRequests: serviceRequests?.length || 0
        });
        
        const summaryPopupId = showSummary(undefined, { 
          title: 'Call Summary',
          priority: 'high' 
        });
        
        console.log('✅ [useInterface1] Summary popup created with ID:', summaryPopupId);
      }, 1500); // Increased delay for better processing
      
      console.log('✅ [useInterface1] Confirm completed - summary popup will show');
    } catch (error) {
      console.error('❌ [useInterface1] Error in handleConfirm:', error);
    }
  }, [conversationState, conversationPopupId, removePopup, showSummary, transcripts.length, callSummary, serviceRequests]);

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
    
    // Override with Interface1-specific handlers
    handleCancel,
    handleConfirm,
    
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