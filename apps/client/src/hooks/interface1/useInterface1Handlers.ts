import { useCallback } from 'react';
import { useConversationState } from '@/hooks/useConversationState';
import { usePopup } from '@/components/popup-system';
import { Language } from '@/types/interface1.types';
import type { Interface1State } from './useInterface1State';
import type { Interface1Layout } from './useInterface1Layout';

/**
 * Hook quản lý event handlers cho Interface1
 * Bao gồm: call handlers, UI handlers, conversation state
 */
export interface Interface1Handlers {
  // Conversation state
  isCallStarted: boolean;
  showConversation: boolean;
  
  // Call handlers
  handleCallStart: (lang: Language) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => void;
  handleCancel: () => void;
  handleConfirm: () => void;
  
  // UI handlers
  handleRightPanelToggle: () => void;
  handleRightPanelClose: () => void;
}

export const useInterface1Handlers = (
  state: Interface1State, 
  layout: Interface1Layout
): Interface1Handlers => {
  // Conversation state management
  const conversationState = useConversationState({ 
    conversationRef: layout.refs.conversationRef 
  });
  
  // Popup system
  const { removePopup, showSummary } = usePopup();

  // Cancel handler - simplified cleanup logic
  const handleCancel = useCallback(() => {
    console.log('❌ [useInterface1Handlers] Cancel button clicked - Returning to Interface1 initial state');
    
    try {
      // Step 1: Clear any active popups
      if (state.conversationPopupId) {
        console.log('🗑️ [useInterface1Handlers] Removing conversation popup:', state.conversationPopupId);
        removePopup(state.conversationPopupId);
        state.setConversationPopupId(null);
      }
      
      // Step 2: Reset conversation state
      conversationState.handleCancel();
      
      // Step 3: Close right panel
      state.setShowRightPanel(false);
      
      // Step 4: Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      console.log('✅ [useInterface1Handlers] Cancel completed successfully');
    } catch (error) {
      console.error('❌ [useInterface1Handlers] Error in handleCancel:', error);
      // Simplified error recovery - just reset states
      if (state.conversationPopupId) {
        state.setConversationPopupId(null);
      }
      state.setShowRightPanel(false);
    }
  }, [conversationState, state, removePopup]);

  // Confirm handler - simplified summary logic
  const handleConfirm = useCallback(() => {
    console.log('✅ [useInterface1Handlers] Confirm button clicked');
    
    try {
      // Use conversation state handler
      conversationState.handleConfirm();
      
      // Clear conversation popup if active
      if (state.conversationPopupId) {
        console.log('🗑️ [useInterface1Handlers] Removing conversation popup after confirm');
        removePopup(state.conversationPopupId);
        state.setConversationPopupId(null);
      }
      
      // Show summary popup with delay
      setTimeout(() => {
        console.log('📋 [useInterface1Handlers] Auto-showing summary popup after confirm');
        const summaryPopupId = showSummary(undefined, { 
          title: 'Call Summary',
          priority: 'high' as const
        });
        console.log('✅ [useInterface1Handlers] Summary popup created with ID:', summaryPopupId);
      }, 1500);
      
      console.log('✅ [useInterface1Handlers] Confirm completed');
    } catch (error) {
      console.error('❌ [useInterface1Handlers] Error in handleConfirm:', error);
    }
  }, [conversationState, state, removePopup, showSummary]);

  // UI handlers
  const handleRightPanelToggle = useCallback(() => {
    state.setShowRightPanel(!state.showRightPanel);
  }, [state]);

  const handleRightPanelClose = useCallback(() => {
    state.setShowRightPanel(false);
  }, [state]);

  return {
    // Conversation state (from useConversationState)
    isCallStarted: conversationState.isCallStarted,
    showConversation: conversationState.showConversation,
    
    // Call handlers (from useConversationState + custom logic)
    handleCallStart: conversationState.handleCallStart,
    handleCallEnd: conversationState.handleCallEnd,
    handleCancel,
    handleConfirm,
    
    // UI handlers
    handleRightPanelToggle,
    handleRightPanelClose
  };
}; 