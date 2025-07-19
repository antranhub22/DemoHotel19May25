import { useCallback } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { usePopup } from '@/components/popup-system';

interface UseCancelHandlerProps {
  conversationState: any;
  conversationPopupId: string | null;
  setConversationPopupId: (id: string | null) => void;
  setShowRightPanel: (show: boolean) => void;
  transcripts: any[];
}

interface UseCancelHandlerReturn {
  handleCancel: () => void;
}

/**
 * useCancelHandler - Dedicated handler for Cancel button logic
 * 
 * Handles the complete reset flow when user cancels a call:
 * 1. Clear all active popups
 * 2. Reset conversation state 
 * 3. Close right panel
 * 4. Scroll to top (return to initial view)
 * 
 * @param props - Dependencies needed for cancel operation
 * @returns handleCancel function
 */
export const useCancelHandler = ({
  conversationState,
  conversationPopupId,
  setConversationPopupId,
  setShowRightPanel,
  transcripts
}: UseCancelHandlerProps): UseCancelHandlerReturn => {
  const { removePopup } = usePopup();

  const handleCancel = useCallback(() => {
    console.log('❌ [useCancelHandler] Cancel button clicked - Returning to Interface1 initial state');
    console.log('📊 [useCancelHandler] Current state:', { 
      isCallStarted: conversationState.isCallStarted,
      conversationPopupId,
      transcriptsCount: transcripts.length 
    });
    
    try {
      // STEP 1: Clear any active popups first
      if (conversationPopupId) {
        try {
          console.log('🗑️ [useCancelHandler] Removing conversation popup:', conversationPopupId);
          removePopup(conversationPopupId);
          setConversationPopupId(null);
          console.log('✅ [useCancelHandler] Popup removed successfully');
        } catch (popupError) {
          console.error('⚠️ [useCancelHandler] Failed to remove popup but continuing:', popupError);
          setConversationPopupId(null);
        }
      }
      
      // STEP 2: Reset conversation state with error isolation
      try {
        conversationState.handleCancel();
        console.log('✅ [useCancelHandler] conversationState.handleCancel() completed');
      } catch (stateError) {
        console.error('⚠️ [useCancelHandler] conversationState.handleCancel() failed:', stateError);
        // Continue - the popup cleanup is more important for UI consistency
      }
      
      // STEP 3: Close right panel if open
      try {
        setShowRightPanel(false);
        console.log('✅ [useCancelHandler] Right panel closed');
      } catch (panelError) {
        console.error('⚠️ [useCancelHandler] Failed to close right panel:', panelError);
      }
      
      // STEP 4: Force scroll to top (return to initial view)
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('✅ [useCancelHandler] Scrolled to top');
      } catch (scrollError) {
        console.error('⚠️ [useCancelHandler] Failed to scroll to top:', scrollError);
      }
      
      console.log('✅ [useCancelHandler] Cancel completed - Interface1 returned to initial state');
    } catch (error) {
      console.error('❌ [useCancelHandler] Critical error in handleCancel:', error);
      
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
        
        console.log('🚨 [useCancelHandler] Emergency cleanup completed');
      } catch (emergencyError) {
        console.error('🚨 [useCancelHandler] Emergency cleanup failed:', emergencyError);
      }
      
      // Prevent error propagation to avoid crash
      console.log('🔄 [useCancelHandler] Cancel operation completed despite errors - UI restored');
    }
  }, [conversationState, conversationPopupId, removePopup, transcripts.length, setShowRightPanel, setConversationPopupId]);

  return {
    handleCancel
  };
}; 