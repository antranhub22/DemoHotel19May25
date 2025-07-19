import { Language } from '@/types/interface1.types';

// Legacy implementation (current working version)
import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { useConversationState } from '@/hooks/useConversationState';
import { useState, useEffect, useCallback, useRef, createElement } from 'react';
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
  const { micLevel, transcripts, callSummary, serviceRequests, language } = useAssistant();
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

  // Add specific handlers for SiriButtonContainer Cancel/Confirm
  const handleCancel = useCallback(() => {
    console.log('❌ [useInterface1Legacy] Cancel button clicked - Returning to Interface1 initial state');
    console.log('📊 [useInterface1Legacy] Current state:', { 
      isCallStarted: conversationState.isCallStarted,
      conversationPopupId,
      transcriptsCount: transcripts.length 
    });
    
    try {
      // STEP 1: Clear any active popups first
      if (conversationPopupId) {
        try {
          console.log('🗑️ [useInterface1Legacy] Removing conversation popup:', conversationPopupId);
          removePopup(conversationPopupId);
          setConversationPopupId(null);
          console.log('✅ [useInterface1Legacy] Popup removed successfully');
        } catch (popupError) {
          console.error('⚠️ [useInterface1Legacy] Failed to remove popup but continuing:', popupError);
          setConversationPopupId(null);
        }
      }
      
      // STEP 2: Reset conversation state with error isolation
      try {
        conversationState.handleCancel();
        console.log('✅ [useInterface1Legacy] conversationState.handleCancel() completed');
      } catch (stateError) {
        console.error('⚠️ [useInterface1Legacy] conversationState.handleCancel() failed:', stateError);
        // Continue - the popup cleanup is more important for UI consistency
      }
      
      // STEP 3: Close right panel if open
      try {
        setShowRightPanel(false);
        console.log('✅ [useInterface1Legacy] Right panel closed');
      } catch (panelError) {
        console.error('⚠️ [useInterface1Legacy] Failed to close right panel:', panelError);
      }
      
      // STEP 4: Force scroll to top (return to initial view)
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('✅ [useInterface1Legacy] Scrolled to top');
      } catch (scrollError) {
        console.error('⚠️ [useInterface1Legacy] Failed to scroll to top:', scrollError);
      }
      
      console.log('✅ [useInterface1Legacy] Cancel completed - Interface1 returned to initial state');
    } catch (error) {
      console.error('❌ [useInterface1Legacy] Critical error in handleCancel:', error);
      
      // EMERGENCY CLEANUP - ensure UI is always in clean state
      try {
        // Force clear all popups
        if (conversationPopupId) {
          removePopup(conversationPopupId);
          setConversationPopupId(null);
        }
        
        // Force close right panel
        setShowRightPanel(false);
        
        // Force scroll to top
        window.scrollTo({ top: 0, behavior: 'auto' });
        
        console.log('🚨 [useInterface1Legacy] Emergency cleanup completed');
      } catch (emergencyError) {
        console.error('🚨 [useInterface1Legacy] Emergency cleanup failed:', emergencyError);
      }
      
      // Prevent error propagation to avoid crash
      console.log('🔄 [useInterface1Legacy] Cancel operation completed despite errors - UI restored');
    }
  }, [conversationState, conversationPopupId, removePopup, transcripts.length, setShowRightPanel]);

  const handleConfirm = useCallback(() => {
    console.log('✅ [useInterface1Legacy] Confirm button clicked in SiriButtonContainer');
    console.log('📊 [useInterface1Legacy] Current state:', { 
      isCallStarted: conversationState.isCallStarted,
      transcriptsCount: transcripts.length,
      hasCallSummary: !!callSummary,
      hasServiceRequests: serviceRequests?.length > 0
    });
    
    try {
      // Use conversation state handler to end call properly
      conversationState.handleConfirm();
      
      // 🆕 CREATE SUMMARY POPUP after call ends and summary is generated
      console.log('✅ [useInterface1Legacy] Call ended, waiting for summary generation...');
      
      // Wait for summary to be generated, then show popup
      setTimeout(() => {
        if (callSummary && callSummary.content && callSummary.content !== "Generating AI summary of your conversation...") {
          console.log('📋 [useInterface1Legacy] Showing Summary popup with content:', callSummary.content.substring(0, 50) + '...');
          
          // Import and show summary popup
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
            // Fallback to simple summary popup
            showSummary(
              createElement('div', { style: { padding: '20px', maxWidth: '500px' } }, [
                createElement('h3', { key: 'title', style: { marginBottom: '16px', color: '#333' } }, '📋 Call Summary'),
                createElement('div', { key: 'content', style: { marginBottom: '16px', lineHeight: '1.5' } }, callSummary.content),
                createElement('div', { key: 'time', style: { fontSize: '12px', color: '#666' } }, 
                  'Generated at ' + callSummary.timestamp.toLocaleTimeString()),
                serviceRequests && serviceRequests.length > 0 && createElement('div', { key: 'requests' }, [
                  createElement('h4', { key: 'req-title', style: { marginTop: '16px', marginBottom: '8px' } }, 'Service Requests:'),
                  createElement('ul', { key: 'req-list', style: { listStyle: 'disc', marginLeft: '20px' } }, 
                    serviceRequests.map((req, idx) => 
                      createElement('li', { key: idx }, `${req.serviceType}: ${req.requestText}`)
                    )
                  )
                ])
              ]),
              { 
                title: 'Call Summary',
                priority: 'high' as const
              }
            );
          });
        } else {
          // Summary not ready yet, wait a bit more
          console.log('⏳ [useInterface1Legacy] Summary not ready, waiting more...');
          setTimeout(() => {
            if (callSummary && callSummary.content && callSummary.content !== "Generating AI summary of your conversation...") {
              console.log('📋 [useInterface1Legacy] Showing delayed Summary popup');
              showSummary(
                createElement('div', { style: { padding: '20px', maxWidth: '500px' } }, [
                  createElement('h3', { key: 'title', style: { marginBottom: '16px', color: '#333' } }, '📋 Call Summary'),
                  createElement('div', { key: 'content', style: { marginBottom: '16px', lineHeight: '1.5' } }, callSummary.content),
                  createElement('div', { key: 'time', style: { fontSize: '12px', color: '#666' } }, 
                    'Generated at ' + callSummary.timestamp.toLocaleTimeString())
                ]),
                { 
                  title: 'Call Summary',
                  priority: 'high' as const
                }
              );
            } else {
              console.log('❌ [useInterface1Legacy] Summary still not available, showing fallback');
              showSummary(
                createElement('div', { style: { padding: '20px', textAlign: 'center' } }, [
                  createElement('h3', { key: 'title', style: { marginBottom: '16px', color: '#333' } }, '📋 Call Summary'),
                  createElement('p', { key: 'message' }, 'Summary is being generated. Please check the conversation tab for details.')
                ]),
                { 
                  title: 'Call Summary',
                  priority: 'medium' as const
                }
              );
            }
          }, 2000);
        }
      }, 1500); // Initial delay to allow summary generation
      
      console.log('✅ [useInterface1Legacy] Confirm completed - Summary popup will be shown when ready');
      
    } catch (error) {
      console.error('❌ [useInterface1Legacy] Error in handleConfirm:', error);
    }
  }, [conversationState, transcripts.length, callSummary, serviceRequests, showSummary]);

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