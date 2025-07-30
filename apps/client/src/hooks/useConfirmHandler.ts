import { usePopup } from '@/components/features/popup-system';
import { useAssistant } from '@/context';
import { logger } from '@shared/utils/logger';
import { createElement, useCallback, useEffect, useRef } from 'react';

interface UseConfirmHandlerReturn {
  // ✅ UPDATED: Auto-trigger summary when call ends - now waits for webhook
  autoTriggerSummary: () => void;
  // ✅ NEW: Test function to force reset auto-trigger state
  forceResetAutoTrigger: () => void;
}

export const useConfirmHandler = (): UseConfirmHandlerReturn => {
  const isMountedRef = useRef(true);
  const { showSummary, removePopup } = usePopup();
  const { setServiceRequests, setCallSummary } = useAssistant();
  const isTriggeringRef = useRef(false);
  const summaryPopupIdRef = useRef<string | null>(null);

  // ✅ CLEANUP: Remove summary popups on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (summaryPopupIdRef.current) {
        removePopup(summaryPopupIdRef.current);
      }
    };
  }, [removePopup]);

  // ✅ HELPER: Cleanup existing summary popups
  const cleanupSummaryPopups = useCallback(() => {
    // Remove any existing summary popups
    const existingPopups = document.querySelectorAll(
      '[data-popup-type="summary"]'
    );
    existingPopups.forEach(popup => {
      const popupId = popup.getAttribute('data-popup-id');
      if (popupId) {
        removePopup(popupId);
      }
    });
  }, [removePopup]);

  // ✅ UPDATED: Auto-trigger summary when call ends - now waits for webhook
  const autoTriggerSummary = useCallback(async () => {
    // ✅ DEBUG: Track trigger state
    console.log(
      '🔍 [DEBUG] autoTriggerSummary called - isTriggeringRef.current:',
      isTriggeringRef.current
    );

    // ✅ FIX: Prevent multiple calls
    if (isTriggeringRef.current) {
      console.log('🚫 [DEBUG] Auto-trigger already in progress, skipping...');
      return;
    }

    // ✅ NEW: Cleanup existing summary popups first
    cleanupSummaryPopups();

    isTriggeringRef.current = true;
    console.log('🔍 [DEBUG] Set isTriggeringRef.current = true');

    console.log(
      '🚀 [DEBUG] Auto-triggering summary after call end - CALL ID:',
      Date.now()
    );
    logger.debug(
      '🚀 [useConfirmHandler] Auto-triggering summary after call end',
      'Component'
    );

    try {
      // ✅ NEW: Wait for webhook instead of processing real-time transcripts
      console.log(
        '🔍 [DEBUG] Waiting for webhook to process full transcript...'
      );

      // Show a temporary message while waiting for webhook
      const waitingElement = createElement(
        'div',
        {
          style: {
            padding: '20px',
            textAlign: 'center',
            maxWidth: '400px',
          },
        },
        [
          createElement(
            'h3',
            {
              key: 'title',
              style: {
                marginBottom: '16px',
                color: '#333',
                fontSize: '18px',
                fontWeight: '600',
              },
            },
            '⏳ Processing...'
          ),

          createElement(
            'div',
            {
              key: 'icon',
              style: { fontSize: '48px', marginBottom: '16px' },
            },
            '🔄'
          ),

          createElement(
            'p',
            {
              key: 'message',
              style: {
                marginBottom: '16px',
                lineHeight: '1.5',
                color: '#333',
                fontSize: '16px',
              },
            },
            'Please wait while we analyze your conversation...'
          ),

          createElement(
            'div',
            {
              key: 'info',
              style: {
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#666',
              },
            },
            'This may take a few seconds while we process your full conversation transcript.'
          ),
        ]
      );

      const popupId = showSummary(waitingElement, {
        title: 'Call Complete',
        priority: 'medium',
      });

      summaryPopupIdRef.current = popupId;
      console.log('🔍 [DEBUG] Waiting popup shown, ID:', popupId);

      // Reset trigger flag after a delay to allow webhook processing
      setTimeout(() => {
        isTriggeringRef.current = false;
        console.log(
          '🔍 [DEBUG] Reset isTriggeringRef.current = false (waiting for webhook)'
        );
      }, 15000); // 15 seconds for OpenAI processing
    } catch (error) {
      console.error('❌ [DEBUG] autoTriggerSummary error:', error);
      logger.error(
        '[useConfirmHandler] autoTriggerSummary failed:',
        'Component',
        error
      );

      // ✅ NEW: Reset trigger flag on error
      isTriggeringRef.current = false;
      console.log('🔍 [DEBUG] Reset isTriggeringRef.current = false (error)');

      // ✅ NEW: Show error popup to user
      const errorElement = createElement(
        'div',
        {
          style: {
            padding: '20px',
            textAlign: 'center',
            maxWidth: '400px',
          },
        },
        [
          createElement(
            'h3',
            {
              key: 'title',
              style: {
                marginBottom: '16px',
                color: '#d32f2f',
                fontSize: '18px',
                fontWeight: '600',
              },
            },
            '❌ Error'
          ),

          createElement(
            'div',
            {
              key: 'icon',
              style: { fontSize: '48px', marginBottom: '16px' },
            },
            '⚠️'
          ),

          createElement(
            'p',
            {
              key: 'message',
              style: {
                marginBottom: '16px',
                lineHeight: '1.5',
                color: '#333',
                fontSize: '16px',
              },
            },
            'Failed to generate call summary. Please try again.'
          ),

          createElement(
            'div',
            {
              key: 'info',
              style: {
                padding: '12px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#856404',
              },
            },
            'The system will retry automatically when you end your next call.'
          ),
        ]
      );

      showSummary(errorElement, {
        title: 'Error',
        priority: 'high',
      });
    }
  }, [showSummary, cleanupSummaryPopups]);

  // ✅ HELPER: Force reset auto-trigger state (for testing)
  const forceResetAutoTrigger = useCallback(() => {
    console.log('🔧 [DEBUG] Force reset auto-trigger state');
    isTriggeringRef.current = false;
    if (summaryPopupIdRef.current) {
      removePopup(summaryPopupIdRef.current);
      summaryPopupIdRef.current = null;
    }
  }, [removePopup]);

  return { autoTriggerSummary, forceResetAutoTrigger };
};
