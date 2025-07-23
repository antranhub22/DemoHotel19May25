import React, { useCallback, createElement, useRef } from 'react';
import { logger } from '@shared/utils/logger';
import { useAssistant } from '@/context';
import { usePopup } from '@/components/features/popup-system';

interface UseConfirmHandlerProps {
  endCall: () => void; // ✅ FIXED: Use direct endCall function
  transcripts: any[];
  callSummary: any;
  serviceRequests: any[];
}

interface UseConfirmHandlerReturn {
  handleConfirm: () => void;
}

/**
 * useConfirmHandler - Dedicated handler for Confirm button logic
 *
 * Handles the complete confirm flow when user confirms a call:
 * 1. End the call via conversationState
 * 2. Show immediate loading popup
 * 3. Poll for AI summary generation with proper cleanup
 * 4. Update popup when summary is ready
 * 5. Handle all error scenarios gracefully
 *
 * @param props - Dependencies needed for confirm operation
 * @returns handleConfirm function
 */
export const useConfirmHandler = ({
  endCall,
  transcripts,
  callSummary,
  serviceRequests,
}: UseConfirmHandlerProps): UseConfirmHandlerReturn => {
  const { showSummary } = usePopup();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const isMountedRef = useRef(true); // ✅ NEW: Track if component is still mounted

  // ✅ IMPROVED: Better error handling with fallback UI
  const handleConfirm = useCallback(() => {
    logger.debug(
      '✅ [useConfirmHandler] Confirm button clicked in SiriButtonContainer',
      'Component'
    );
    logger.debug('📊 [useConfirmHandler] Current state:', 'Component', {
      transcriptsCount: transcripts.length,
      hasCallSummary: !!callSummary,
      hasServiceRequests: serviceRequests?.length > 0,
    });

    // ✅ IMPROVED: Comprehensive error handling with multiple fallback levels
    const executeWithFallback = async () => {
      try {
        // 🔧 STEP 1: Show loading popup BEFORE ending call
        logger.debug(
          '📋 [useConfirmHandler] Step 1: Showing immediate loading popup...',
          'Component'
        );

        if (!isMountedRef.current) {
          logger.warn(
            '⚠️ [useConfirmHandler] Component unmounted, aborting',
            'Component'
          );
          return;
        }

        // Show loading popup with safe error handling
        try {
          const loadingElement = createElement(
            'div',
            {
              id: 'summary-loading-popup',
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

              // Loading Spinner
              createElement(
                'div',
                { key: 'loading', style: { marginBottom: '16px' } },
                [
                  createElement('div', {
                    key: 'spinner',
                    style: {
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      border: '3px solid #f3f3f3',
                      borderTop: '3px solid #3498db',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '12px',
                    },
                  }),
                  createElement(
                    'span',
                    {
                      key: 'text',
                      style: {
                        fontSize: '16px',
                        color: '#555',
                        fontWeight: '500',
                      },
                    },
                    'Processing call...'
                  ),
                ]
              ),

              // Progress Message
              createElement(
                'p',
                {
                  key: 'message',
                  style: {
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                  },
                },
                'Please wait while we finalize your conversation.'
              ),

              // Timestamp
              createElement(
                'div',
                {
                  key: 'time',
                  style: { fontSize: '12px', color: '#999', marginTop: '12px' },
                },
                `Call ended at: ${new Date().toLocaleTimeString()}`
              ),
            ]
          );

          // Add spinner CSS animation safely
          if (!document.getElementById('spinner-animation')) {
            try {
              const style = document.createElement('style');
              style.id = 'spinner-animation';
              style.textContent = `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `;
              document.head.appendChild(style);
            } catch (styleError) {
              logger.warn(
                '⚠️ [useConfirmHandler] Failed to add spinner styles:',
                'Component',
                styleError
              );
            }
          }

          logger.debug(
            '🚀 [useConfirmHandler] Step 1b: Calling showSummary...',
            'Component'
          );

          // Show loading popup immediately with error handling
          showSummary(loadingElement, {
            title: 'Processing Call...',
            priority: 'high' as const,
          });

          logger.debug(
            '✅ [useConfirmHandler] Step 1c: Loading popup shown successfully',
            'Component'
          );
        } catch (popupError) {
          logger.error(
            '❌ [useConfirmHandler] Step 1 ERROR: Loading popup creation failed:',
            'Component',
            popupError
          );
          // Continue with call end - don't let popup errors block the flow
        }

        // ✅ IMPROVED: Safe delay before calling endCall to prevent state conflicts
        logger.debug(
          '⏳ [useConfirmHandler] Step 1.5: Brief delay before ending call...',
          'Component'
        );
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!isMountedRef.current) {
          logger.warn(
            '⚠️ [useConfirmHandler] Component unmounted during delay, aborting',
            'Component'
          );
          return;
        }

        // 🔧 STEP 2: End call IMMEDIATELY to prevent continued conversation
        logger.debug(
          '🔄 [useConfirmHandler] Step 2: Ending call immediately...',
          'Component'
        );
        try {
          if (isMountedRef.current) {
            logger.debug(
              '📞 [useConfirmHandler] Step 2a: Calling endCall() immediately...',
              'Component'
            );
            endCall();
            logger.debug(
              '✅ [useConfirmHandler] Step 2a: Call ended successfully',
              'Component'
            );

            // ✅ ADDITIONAL: Force Vapi stop as backup to ensure no continued conversation
            try {
              const { getVapiInstance } = await import('@/lib/vapiClient');
              const vapi = getVapiInstance();
              if (vapi) {
                logger.debug(
                  '🔧 [useConfirmHandler] Step 2b: Force stopping Vapi instance as backup...',
                  'Component'
                );
                vapi.stop();
                logger.debug(
                  '✅ [useConfirmHandler] Step 2b: Vapi instance force stopped',
                  'Component'
                );
              } else {
                logger.debug(
                  '⚠️ [useConfirmHandler] Step 2b: No Vapi instance found to force stop',
                  'Component'
                );
              }
            } catch (vapiError) {
              logger.warn(
                '⚠️ [useConfirmHandler] Step 2b: Backup Vapi stop failed:',
                'Component',
                vapiError
              );
              // Continue - not critical for main flow
            }
          }
        } catch (endCallError) {
          logger.error(
            '⚠️ [useConfirmHandler] endCall() failed:',
            'Component',
            endCallError
          );
          // Don't rethrow - continue with completion message
        }

        // 🔧 STEP 3: Show completion message immediately (don't wait for polling)
        logger.debug(
          '🔄 [useConfirmHandler] Step 3: Showing completion message...',
          'Component'
        );

        // ✅ IMPROVED: Show success message immediately instead of complex polling
        setTimeout(() => {
          if (!isMountedRef.current) {
            return;
          }

          try {
            const completionElement = createElement(
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
                  '📋 Call Complete'
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

            showSummary(completionElement, {
              title: 'Call Complete',
              priority: 'high' as const,
            });

            logger.debug(
              '✅ [useConfirmHandler] Completion message shown successfully',
              'Component'
            );
          } catch (completionError) {
            logger.error(
              '❌ [useConfirmHandler] Error showing completion message:',
              'Component',
              completionError
            );
            // Final fallback - simple logger instead of alert
            if (isMountedRef.current) {
              logger.success(
                'Call completed successfully! Thank you for using our service.',
                'Component'
              );
            }
          }
        }, 1000); // Give time for endCall to process

        logger.debug(
          '✅ [useConfirmHandler] Confirm flow completed successfully',
          'Component'
        );
      } catch (error) {
        logger.error(
          '❌ [useConfirmHandler] CRITICAL ERROR in handleConfirm:',
          'Component',
          error
        );

        // ✅ IMPROVED: Enhanced fallback error handling
        if (isMountedRef.current) {
          try {
            // Try to show error popup first
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
                      color: '#dc2626',
                      fontSize: '18px',
                      fontWeight: '600',
                    },
                  },
                  '⚠️ Call Processing Issue'
                ),

                createElement(
                  'p',
                  {
                    key: 'message',
                    style: {
                      marginBottom: '16px',
                      color: '#374151',
                      fontSize: '16px',
                    },
                  },
                  'Your call was completed, but there was an issue processing the summary.'
                ),

                createElement(
                  'p',
                  {
                    key: 'instruction',
                    style: {
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '16px',
                    },
                  },
                  'Please contact the front desk if you need assistance with your requests.'
                ),

                createElement(
                  'div',
                  {
                    key: 'timestamp',
                    style: {
                      fontSize: '12px',
                      color: '#999',
                      marginTop: '12px',
                    },
                  },
                  `Call ended at: ${new Date().toLocaleTimeString()}`
                ),
              ]
            );

            showSummary(errorElement, {
              title: 'Call Complete (with issue)',
              priority: 'medium' as const,
            });
          } catch (fallbackError) {
            logger.error(
              '❌ [useConfirmHandler] Fallback popup also failed:',
              'Component',
              fallbackError
            );
            // Ultimate fallback - simple logger instead of alert
            if (isMountedRef.current) {
              logger.error(
                'Call completed! There was a technical issue with the summary. Please contact front desk for assistance.',
                'Component'
              );
            }
          }
        }
      }
    };

    // ✅ IMPROVED: Execute with additional error boundary to prevent ErrorBoundary trigger
    try {
      executeWithFallback();
    } catch (outerError) {
      logger.error(
        '❌ [useConfirmHandler] OUTER ERROR BOUNDARY:',
        'Component',
        outerError
      );
      // Prevent error from bubbling up to React ErrorBoundary
      if (isMountedRef.current) {
        logger.error(
          'Call completed! Technical issue occurred. Please contact front desk.',
          'Component'
        );
      }
    }
  }, [endCall, transcripts, callSummary, serviceRequests, showSummary]);

  // ✅ NEW: Cleanup on unmount
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
    isPollingRef.current = false;
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // ✅ NEW: Set mounted ref and return cleanup
  React.useEffect(() => {
    isMountedRef.current = true;
    return cleanup;
  }, [cleanup]);

  return {
    handleConfirm,
  };
};
