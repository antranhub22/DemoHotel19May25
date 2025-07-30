import { usePopup } from '@/components/features/popup-system';
import { logger } from '@shared/utils/logger';
import { createElement, useCallback, useRef } from 'react';

interface UseConfirmHandlerProps {
  endCall: () => void; // ✅ FIXED: Use direct endCall function
  transcripts: any[];
  callSummary: any;
  serviceRequests: any[];
}

interface UseConfirmHandlerReturn {
  handleConfirm: () => void;
  // ✅ NEW: Auto-trigger summary when call ends
  autoTriggerSummary: () => void;
}

/**
 * ✅ REFACTORED: Simplified confirm handler that auto-triggers summary
 *
 * Flow:
 * 1. User taps Siri button to end call
 * 2. handleCallEnd() calls endCall()
 * 3. endCall() triggers call end listeners
 * 4. autoShowSummary() shows summary popup
 * 5. No need for Confirm button anymore
 */
export const useConfirmHandler = ({
  transcripts,
  serviceRequests,
}: UseConfirmHandlerProps): UseConfirmHandlerReturn => {
  const isMountedRef = useRef(true);
  const { showSummary } = usePopup();

  // ✅ NEW: Auto-trigger summary when call ends
  const autoTriggerSummary = useCallback(() => {
    console.log('🚀 [DEBUG] Auto-triggering summary after call end');
    logger.debug(
      '🚀 [useConfirmHandler] Auto-triggering summary after call end',
      'Component'
    );

    // ✅ IMPROVED: Show summary immediately without loading popup
    try {
      const summaryElement = createElement(
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
            '📋 Call Summary'
          ),

          createElement(
            'div',
            {
              key: 'icon',
              style: { fontSize: '48px', marginBottom: '16px' },
            },
            '✅'
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
            'Your call has been completed successfully!'
          ),

          // Show transcript count if available
          transcripts.length > 0 &&
            createElement(
              'div',
              {
                key: 'transcript-info',
                style: {
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '6px',
                  fontSize: '14px',
                },
              },
              [
                createElement(
                  'div',
                  {
                    key: 'transcript-title',
                    style: {
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#1e40af',
                    },
                  },
                  'Conversation Summary:'
                ),
                createElement(
                  'div',
                  {
                    key: 'transcript-count',
                    style: { color: '#374151' },
                  },
                  `${transcripts.length} messages recorded`
                ),
              ]
            ),

          // Show service requests if available
          serviceRequests?.length > 0 &&
            createElement(
              'div',
              {
                key: 'requests',
                style: {
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '6px',
                  fontSize: '14px',
                },
              },
              [
                createElement(
                  'div',
                  {
                    key: 'req-title',
                    style: {
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#15803d',
                    },
                  },
                  'Service Requests:'
                ),
                createElement(
                  'ul',
                  {
                    key: 'req-list',
                    style: {
                      listStyle: 'disc',
                      marginLeft: '20px',
                      color: '#374151',
                    },
                  },
                  serviceRequests.slice(0, 3).map((req, idx) =>
                    createElement(
                      'li',
                      {
                        key: idx,
                        style: { marginBottom: '4px' },
                      },
                      `${req.serviceType || 'Request'}: ${(req.requestText || req.description || 'Service request').substring(0, 50)}...`
                    )
                  )
                ),
              ]
            ),

          createElement(
            'p',
            {
              key: 'note',
              style: {
                fontSize: '14px',
                color: '#666',
                marginBottom: '16px',
              },
            },
            'Thank you for using our voice assistant service.'
          ),

          createElement(
            'div',
            {
              key: 'contact',
              style: {
                fontSize: '12px',
                color: '#999',
                borderTop: '1px solid #eee',
                paddingTop: '12px',
                marginTop: '16px',
              },
            },
            'For immediate assistance, please contact the front desk.'
          ),
        ]
      );

      console.log('📋 [DEBUG] About to show summary popup');
      showSummary(summaryElement, {
        title: 'Call Complete',
        priority: 'high' as const,
      });

      console.log('✅ [DEBUG] Summary popup shown successfully');
      logger.debug(
        '✅ [useConfirmHandler] Summary popup shown successfully',
        'Component'
      );
    } catch (error) {
      logger.error(
        '❌ [useConfirmHandler] Error showing summary:',
        'Component',
        error
      );
      // Final fallback - simple logger
      if (isMountedRef.current) {
        logger.success(
          'Call completed successfully! Thank you for using our service.',
          'Component'
        );
      }
    }
  }, [showSummary, transcripts, serviceRequests]);

  // ✅ SIMPLIFIED: handleConfirm now just calls autoTriggerSummary
  const handleConfirm = useCallback(() => {
    logger.debug(
      '✅ [useConfirmHandler] Confirm button clicked (legacy support)',
      'Component'
    );
    autoTriggerSummary();
  }, [autoTriggerSummary]);

  // Cleanup on unmount
  useCallback(() => {
    isMountedRef.current = false;
  }, []);

  return {
    handleConfirm,
    autoTriggerSummary, // ✅ NEW: Export for use in call end listeners
  };
};
