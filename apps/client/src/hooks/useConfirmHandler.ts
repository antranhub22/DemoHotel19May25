import { usePopup } from '@/components/features/popup-system';
import { useAssistant } from '@/context';
import { logger } from '@shared/utils/logger';
import { createElement, useCallback, useEffect, useRef } from 'react';

interface UseConfirmHandlerProps {
  endCall: () => void; // ✅ FIXED: Use direct endCall function
  transcripts: any[];
  callSummary: any;
  serviceRequests: any[];
}

interface UseConfirmHandlerReturn {
  // ✅ NEW: Auto-trigger summary when call ends
  autoTriggerSummary: () => void;
  // ✅ NEW: Test function to force reset auto-trigger state
  forceResetAutoTrigger: () => void;
}

/**
 * ✅ REFACTORED: Auto-trigger summary handler with OpenAI transcript analysis
 *
 * Flow:
 * 1. User taps Siri button to end call
 * 2. handleCallEnd() calls endCall()
 * 3. endCall() triggers call end listeners
 * 4. autoTriggerSummary() processes transcript with OpenAI
 * 5. Shows summary popup with analyzed data
 */
export const useConfirmHandler = ({
  transcripts,
  serviceRequests,
}: UseConfirmHandlerProps): UseConfirmHandlerReturn => {
  const isMountedRef = useRef(true);
  const { showSummary, removePopup } = usePopup();
  const { setServiceRequests, setCallSummary } = useAssistant();
  const isTriggeringRef = useRef(false); // ✅ NEW: Prevent multiple calls
  const summaryPopupIdRef = useRef<string | null>(null); // ✅ NEW: Track summary popup ID

  // ✅ NEW: Cleanup function to remove existing summary popups
  const cleanupSummaryPopups = useCallback(() => {
    if (summaryPopupIdRef.current) {
      console.log(
        '🧹 [DEBUG] Cleaning up existing summary popup:',
        summaryPopupIdRef.current
      );
      removePopup(summaryPopupIdRef.current);
      summaryPopupIdRef.current = null;
    }
  }, [removePopup]);

  // ✅ NEW: Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanupSummaryPopups();
    };
  }, [cleanupSummaryPopups]);

  // ✅ NEW: Process transcript with OpenAI to generate summary and service requests
  const processTranscriptWithOpenAI = useCallback(async () => {
    if (transcripts.length === 0) {
      console.log('📝 [DEBUG] No transcripts to process');
      return { summary: null, serviceRequests: [] };
    }

    try {
      console.log('🤖 [DEBUG] Processing transcript with OpenAI...');

      // Convert transcripts to conversation format
      const conversationText = transcripts
        .map(
          t =>
            `${t.role === 'assistant' ? 'Hotel Assistant' : 'Guest'}: ${t.content}`
        )
        .join('\n');

      // Call OpenAI to generate summary
      const summaryResponse = await fetch('/api/openai/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcripts: transcripts.map(t => ({
            role: t.role,
            content: t.content,
          })),
          language: 'en', // Default to English, can be made dynamic
        }),
      });

      if (!summaryResponse.ok) {
        throw new Error(
          `OpenAI summary request failed: ${summaryResponse.status}`
        );
      }

      const summaryData = await summaryResponse.json();
      const summary = summaryData.summary;

      // Call OpenAI to extract service requests from summary
      const serviceRequestsResponse = await fetch(
        '/api/openai/service-requests',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary,
          }),
        }
      );

      if (!serviceRequestsResponse.ok) {
        throw new Error(
          `OpenAI service requests request failed: ${serviceRequestsResponse.status}`
        );
      }

      const serviceRequestsData = await serviceRequestsResponse.json();
      const serviceRequests = serviceRequestsData.requests || [];

      console.log('✅ [DEBUG] OpenAI processing completed:', {
        summaryLength: summary?.length || 0,
        serviceRequestsCount: serviceRequests.length,
      });

      return { summary, serviceRequests };
    } catch (error) {
      console.error('❌ [DEBUG] OpenAI processing failed:', error);
      logger.error(
        '[useConfirmHandler] OpenAI processing failed:',
        'Component',
        error
      );
      return { summary: null, serviceRequests: [] };
    }
  }, [transcripts]);

  // ✅ NEW: Auto-trigger summary when call ends
  const autoTriggerSummary = useCallback(async () => {
    // ✅ DEBUG: Track trigger state
    console.log(
      '🔍 [DEBUG] autoTriggerSummary called - isTriggeringRef.current:',
      isTriggeringRef.current
    );

    // ✅ FIX: Prevent multiple calls
    if (isTriggeringRef.current) {
      console.log('🚫 [DEBUG] Auto-trigger already in progress, skipping...');
      console.log(
        '🚫 [DEBUG] isTriggeringRef.current =',
        isTriggeringRef.current
      );
      console.log('🚫 [DEBUG] Call stack:', new Error().stack);
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
      // ✅ NEW: Process transcript with OpenAI
      const { summary, serviceRequests } = await processTranscriptWithOpenAI();

      // ✅ NEW: Update assistant context with processed data
      if (summary) {
        setCallSummary({
          callId: `call-${Date.now()}`,
          tenantId: 'default',
          content: summary,
          timestamp: new Date(),
        });
      }

      if (serviceRequests.length > 0) {
        setServiceRequests(serviceRequests);
      }

      // ✅ IMPROVED: Show summary with processed data
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
                  backgroundColor: '#f0df4',
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

      // ✅ FIX: Remove delay to prevent race condition
      if (!isMountedRef.current) {
        console.log('🚫 [DEBUG] Component unmounted, skipping summary popup');
        isTriggeringRef.current = false; // ✅ FIX: Reset immediately
        console.log(
          '🔍 [DEBUG] Reset isTriggeringRef.current = false (unmounted)'
        );
        return;
      }

      const popupId = showSummary(summaryElement, {
        title: 'Call Complete',
        priority: 'medium' as const, // ✅ FIX: Change from 'high' to 'medium' to prevent auto-removal
      });

      // ✅ NEW: Track the popup ID for cleanup
      summaryPopupIdRef.current = popupId;

      console.log('✅ [DEBUG] Summary popup shown successfully, ID:', popupId);

      console.log('✅ [DEBUG] Summary popup trigger completed');
      logger.debug(
        '✅ [useConfirmHandler] Summary popup shown successfully',
        'Component'
      );

      // ✅ FIX: Reset trigger flag immediately after success
      isTriggeringRef.current = false;
      console.log('🔍 [DEBUG] Reset isTriggeringRef.current = false (success)');
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
      // ✅ FIX: Reset trigger flag on error
      isTriggeringRef.current = false;
      console.log('🔍 [DEBUG] Reset isTriggeringRef.current = false (error)');
    }
  }, [
    showSummary,
    transcripts,
    serviceRequests,
    cleanupSummaryPopups,
    processTranscriptWithOpenAI,
    setServiceRequests,
    setCallSummary,
  ]);

  // ✅ NEW: Test function to force reset auto-trigger state
  const forceResetAutoTrigger = useCallback(() => {
    console.log('🔄 [DEBUG] Force resetting auto-trigger state');
    console.log(
      '🔄 [DEBUG] Before reset - isTriggeringRef.current:',
      isTriggeringRef.current
    );

    // Reset trigger state
    isTriggeringRef.current = false;

    console.log(
      '🔄 [DEBUG] After reset - isTriggeringRef.current:',
      isTriggeringRef.current
    );
    console.log('✅ [DEBUG] Auto-trigger state reset completed');
  }, []);

  return {
    autoTriggerSummary, // ✅ NEW: Export for use in call end listeners
    forceResetAutoTrigger, // ✅ NEW: Export for testing
  };
};
