import { useCallback } from 'react';
import { usePopup } from '@/components/features/popup-system';
import { useAssistant } from '@/context';
import { logger } from '@shared/utils/logger';

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
  transcripts,
}: UseCancelHandlerProps): UseCancelHandlerReturn => {
  const { removePopup } = usePopup();

  const handleCancel = useCallback(() => {
    logger.debug(
      '❌ [useCancelHandler] Cancel button clicked - Returning to Interface1 initial state',
      'Component'
    );
    logger.debug('📊 [useCancelHandler] Current state:', 'Component', {
      isCallStarted: conversationState.isCallStarted,
      conversationPopupId,
      transcriptsCount: transcripts.length,
    });

    try {
      // STEP 1: Clear any active popups first
      if (conversationPopupId) {
        try {
          logger.debug(
            '🗑️ [useCancelHandler] Removing conversation popup:',
            'Component',
            conversationPopupId
          );
          removePopup(conversationPopupId);
          setConversationPopupId(null);
          logger.debug(
            '✅ [useCancelHandler] Popup removed successfully',
            'Component'
          );
        } catch (popupError) {
          logger.error(
            '⚠️ [useCancelHandler] Failed to remove popup but continuing:',
            'Component',
            popupError
          );
          setConversationPopupId(null);
        }
      }

      // STEP 2: Reset conversation state with error isolation
      try {
        conversationState.handleCancel();
        logger.debug(
          '✅ [useCancelHandler] conversationState.handleCancel() completed',
          'Component'
        );
      } catch (stateError) {
        logger.error(
          '⚠️ [useCancelHandler] conversationState.handleCancel() failed:',
          'Component',
          stateError
        );
        // Continue - the popup cleanup is more important for UI consistency
      }

      // STEP 3: Close right panel if open
      try {
        setShowRightPanel(false);
        logger.debug('✅ [useCancelHandler] Right panel closed', 'Component');
      } catch (panelError) {
        logger.error(
          '⚠️ [useCancelHandler] Failed to close right panel:',
          'Component',
          panelError
        );
      }

      // STEP 4: Force scroll to top (return to initial view)
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        logger.debug('✅ [useCancelHandler] Scrolled to top', 'Component');
      } catch (scrollError) {
        logger.error(
          '⚠️ [useCancelHandler] Failed to scroll to top:',
          'Component',
          scrollError
        );
      }

      logger.debug(
        '✅ [useCancelHandler] Cancel completed - Interface1 returned to initial state',
        'Component'
      );
    } catch (error) {
      logger.error(
        '❌ [useCancelHandler] Critical error in handleCancel:',
        'Component',
        error
      );

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

        logger.debug(
          '🚨 [useCancelHandler] Emergency cleanup completed',
          'Component'
        );
      } catch (emergencyError) {
        logger.error(
          '🚨 [useCancelHandler] Emergency cleanup failed:',
          'Component',
          emergencyError
        );
      }

      // Prevent error propagation to avoid crash
      logger.debug(
        '🔄 [useCancelHandler] Cancel operation completed despite errors - UI restored',
        'Component'
      );
    }
  }, [
    conversationState,
    conversationPopupId,
    removePopup,
    transcripts.length,
    setShowRightPanel,
    setConversationPopupId,
  ]);

  return {
    handleCancel,
  };
};
