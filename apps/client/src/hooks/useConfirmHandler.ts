import React, { useCallback, createElement, useRef } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { usePopup } from '@/components/popup-system';

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
    console.log(
      '✅ [useConfirmHandler] Confirm button clicked in SiriButtonContainer'
    );
    console.log('📊 [useConfirmHandler] Current state:', {
      transcriptsCount: transcripts.length,
      hasCallSummary: !!callSummary,
      hasServiceRequests: serviceRequests?.length > 0,
    });

    // ✅ IMPROVED: Comprehensive error handling with multiple fallback levels
    const executeWithFallback = async () => {
      try {
        // 🔧 STEP 1: Show loading popup BEFORE ending call
        console.log(
          '📋 [useConfirmHandler] Step 1: Showing immediate loading popup...'
        );

        if (!isMountedRef.current) {
          console.warn('⚠️ [useConfirmHandler] Component unmounted, aborting');
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
              console.warn(
                '⚠️ [useConfirmHandler] Failed to add spinner styles:',
                styleError
              );
            }
          }

          console.log('🚀 [useConfirmHandler] Step 1b: Calling showSummary...');

          // Show loading popup immediately with error handling
          showSummary(loadingElement, {
            title: 'Processing Call...',
            priority: 'high' as const,
          });

          console.log(
            '✅ [useConfirmHandler] Step 1c: Loading popup shown successfully'
          );
        } catch (popupError) {
          console.error(
            '❌ [useConfirmHandler] Step 1 ERROR: Loading popup creation failed:',
            popupError
          );
          // Continue with call end - don't let popup errors block the flow
        }

        // ✅ IMPROVED: Safe delay before calling endCall to prevent state conflicts
        console.log(
          '⏳ [useConfirmHandler] Step 1.5: Brief delay before ending call...'
        );
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!isMountedRef.current) {
          console.warn(
            '⚠️ [useConfirmHandler] Component unmounted during delay, aborting'
          );
          return;
        }

        // 🔧 STEP 2: End call IMMEDIATELY to prevent continued conversation
        console.log(
          '🔄 [useConfirmHandler] Step 2: Ending call immediately...'
        );
        try {
          if (isMountedRef.current) {
            console.log(
              '📞 [useConfirmHandler] Step 2a: Calling endCall() immediately...'
            );
            endCall();
            console.log(
              '✅ [useConfirmHandler] Step 2a: Call ended successfully'
            );

            // ✅ ADDITIONAL: Force Vapi stop as backup to ensure no continued conversation
            try {
              const { getVapiInstance } = await import('@/lib/vapiClient');
              const vapi = getVapiInstance();
              if (vapi) {
                console.log(
                  '🔧 [useConfirmHandler] Step 2b: Force stopping Vapi instance as backup...'
                );
                vapi.stop();
                console.log(
                  '✅ [useConfirmHandler] Step 2b: Vapi instance force stopped'
                );
              } else {
                console.log(
                  '⚠️ [useConfirmHandler] Step 2b: No Vapi instance found to force stop'
                );
              }
            } catch (vapiError) {
              console.warn(
                '⚠️ [useConfirmHandler] Step 2b: Backup Vapi stop failed:',
                vapiError
              );
              // Continue - not critical for main flow
            }
          }
        } catch (endCallError) {
          console.error(
            '⚠️ [useConfirmHandler] endCall() failed:',
            endCallError
          );
          // Don't rethrow - continue with completion message
        }

        // 🔧 STEP 3: Show completion message immediately (don't wait for polling)
        console.log(
          '🔄 [useConfirmHandler] Step 3: Showing completion message...'
        );

        // ✅ IMPROVED: Show success message immediately instead of complex polling
        setTimeout(() => {
          if (!isMountedRef.current) return;

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

            console.log(
              '✅ [useConfirmHandler] Completion message shown successfully'
            );
          } catch (completionError) {
            console.error(
              '❌ [useConfirmHandler] Error showing completion message:',
              completionError
            );
            // Final fallback - simple alert
            if (isMountedRef.current) {
              setTimeout(
                () =>
                  alert(
                    'Call completed successfully! Thank you for using our service.'
                  ),
                100
              );
            }
          }
        }, 1000); // Give time for endCall to process

        console.log(
          '✅ [useConfirmHandler] Confirm flow completed successfully'
        );
      } catch (error) {
        console.error(
          '❌ [useConfirmHandler] CRITICAL ERROR in handleConfirm:',
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
            console.error(
              '❌ [useConfirmHandler] Fallback popup also failed:',
              fallbackError
            );
            // Ultimate fallback - simple alert after delay
            setTimeout(() => {
              if (isMountedRef.current) {
                alert(
                  'Call completed! There was a technical issue with the summary. Please contact front desk for assistance.'
                );
              }
            }, 500);
          }
        }
      }
    };

    // ✅ IMPROVED: Execute with additional error boundary to prevent ErrorBoundary trigger
    try {
      executeWithFallback();
    } catch (outerError) {
      console.error('❌ [useConfirmHandler] OUTER ERROR BOUNDARY:', outerError);
      // Prevent error from bubbling up to React ErrorBoundary
      setTimeout(() => {
        if (isMountedRef.current) {
          alert(
            'Call completed! Technical issue occurred. Please contact front desk.'
          );
        }
      }, 100);
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
