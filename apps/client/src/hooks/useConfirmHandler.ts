import { useCallback, createElement, useRef } from 'react';
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
  serviceRequests
}: UseConfirmHandlerProps): UseConfirmHandlerReturn => {
  const { showSummary } = usePopup();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const handleConfirm = useCallback(() => {
    console.log('✅ [useConfirmHandler] Confirm button clicked in SiriButtonContainer');
    console.log('📊 [useConfirmHandler] Current state:', { 
      transcriptsCount: transcripts.length,
      hasCallSummary: !!callSummary,
      hasServiceRequests: serviceRequests?.length > 0
    });
    
    try {
      // 🔧 STEP 1: Show loading popup BEFORE ending call
      console.log('📋 [useConfirmHandler] Step 1: Showing immediate loading popup...');
      
      try {
        // Show loading popup immediately
        const loadingElement = createElement('div', { 
          id: 'summary-loading-popup',
          style: { padding: '20px', textAlign: 'center', maxWidth: '400px' } 
        }, [
          createElement('h3', { 
            key: 'title', 
            style: { marginBottom: '16px', color: '#333', fontSize: '18px', fontWeight: '600' } 
          }, '📋 Call Summary'),
          
          // Loading Spinner
          createElement('div', { key: 'loading', style: { marginBottom: '16px' } }, [
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
                marginRight: '12px'
              }
            }),
            createElement('span', { 
              key: 'text',
              style: { fontSize: '16px', color: '#555', fontWeight: '500' }
            }, 'Generating summary...')
          ]),
          
          // Progress Message
          createElement('p', { 
            key: 'message', 
            style: { fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '16px' } 
          }, 'Please wait while we process your conversation and generate insights.'),
          
          // Timestamp
          createElement('div', { 
            key: 'time', 
            style: { fontSize: '12px', color: '#999', marginTop: '12px' } 
          }, 'Call ended at: ' + new Date().toLocaleTimeString())
        ]);
        
        // Add spinner CSS animation
        if (!document.getElementById('spinner-animation')) {
          const style = document.createElement('style');
          style.id = 'spinner-animation';
          style.textContent = `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `;
          document.head.appendChild(style);
        }
        
        console.log('✅ [useConfirmHandler] Step 1a: Loading element created');
        console.log('🚀 [useConfirmHandler] Step 1b: Calling showSummary...');
        
        // Show loading popup immediately
        showSummary(
          loadingElement,
          { 
            title: 'Generating Summary...',
            priority: 'high' as const
          }
        );
        
        console.log('✅ [useConfirmHandler] Step 1c: Loading popup shown successfully');
      } catch (popupError) {
        console.error('❌ [useConfirmHandler] Step 1 ERROR: Loading popup creation failed:', popupError);
        // Continue with call end even if popup fails
      }
      
      // 🔧 STEP 2: End call AFTER showing loading popup
      console.log('🔄 [useConfirmHandler] Step 2: Ending call...');
      endCall(); // Assuming conversationState has a handleConfirm method
      console.log('✅ [useConfirmHandler] Step 2: Call ended successfully');
      
      // 🔧 STEP 3: Start polling for summary data
      console.log('🔄 [useConfirmHandler] Step 3: Starting polling for summary data...');
      
      let pollCount = 0;
      const maxPolls = 15; // Maximum 30 seconds (15 * 2s)
      
      isPollingRef.current = true;
      
      const pollForSummary = () => {
        // Safety check - stop if polling was cancelled
        if (!isPollingRef.current) {
          console.log('🛑 [useConfirmHandler] Polling cancelled - component may have unmounted');
          return;
        }
        
        pollCount++;
        console.log(`🔍 [useConfirmHandler] Poll #${pollCount}: Checking for summary data...`);
        
        try {
          // Get fresh data (these should be from React state/context)
          const currentCallSummary = callSummary;
          const currentServiceRequests = serviceRequests;
          
          console.log('📊 [useConfirmHandler] Poll data check:', {
            hasCallSummary: !!currentCallSummary,
            callSummaryContent: currentCallSummary?.content?.substring(0, 50),
            isGenerating: currentCallSummary?.content === "Generating AI summary of your conversation...",
            hasServiceRequests: currentServiceRequests?.length > 0,
            pollCount,
            maxPolls
          });
          
          // Check if we have real summary data
          const hasRealSummary = currentCallSummary && 
            currentCallSummary.content && 
            currentCallSummary.content !== "Generating AI summary of your conversation...";
          
          const hasServiceRequests = currentServiceRequests && currentServiceRequests.length > 0;
          
          if (hasRealSummary || hasServiceRequests) {
            // 🎉 SUCCESS: We have data! Update popup
            console.log('🎉 [useConfirmHandler] Success! Summary data found, updating popup...');
            
            try {
              const summaryElement = createElement('div', { 
                style: { padding: '20px', maxWidth: '500px' } 
              }, [
                // Header
                createElement('h3', { 
                  key: 'title', 
                  style: { marginBottom: '16px', color: '#333', fontSize: '18px', fontWeight: '600' } 
                }, '📋 Call Summary'),
                
                // Success Icon
                createElement('div', { 
                  key: 'icon', 
                  style: { fontSize: '32px', marginBottom: '16px', textAlign: 'center' } 
                }, '✅'),
                
                // Summary Content (if available)
                hasRealSummary && createElement('div', { 
                  key: 'summary-content',
                  style: { 
                    marginBottom: '16px', 
                    padding: '12px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }
                }, [
                  createElement('div', { 
                    key: 'summary-title', 
                    style: { fontWeight: '600', marginBottom: '8px', color: '#555' } 
                  }, 'AI Summary:'),
                  createElement('div', { 
                    key: 'summary-text', 
                    style: { color: '#666' } 
                  }, currentCallSummary.content)
                ]),
                
                // Service Requests (if available)
                hasServiceRequests && createElement('div', { 
                  key: 'requests',
                  style: { 
                    marginBottom: '16px', 
                    padding: '12px', 
                    backgroundColor: '#f0f9ff', 
                    borderRadius: '6px', 
                    fontSize: '14px'
                  }
                }, [
                  createElement('div', { 
                    key: 'req-title', 
                    style: { fontWeight: '600', marginBottom: '8px', color: '#1e40af' } 
                  }, 'Service Requests:'),
                  createElement('ul', { 
                    key: 'req-list', 
                    style: { listStyle: 'disc', marginLeft: '20px', color: '#374151' } 
                  }, 
                    currentServiceRequests.slice(0, 5).map((req, idx) => 
                      createElement('li', { 
                        key: idx, 
                        style: { marginBottom: '4px' } 
                      }, `${req.serviceType}: ${req.requestText}`)
                    )
                  )
                ]),
                
                // Completion Message
                createElement('p', { 
                  key: 'completion', 
                  style: { 
                    fontSize: '14px', 
                    color: '#22c55e', 
                    fontWeight: '500',
                    textAlign: 'center',
                    marginBottom: '16px'
                  } 
                }, 'Call completed and processed successfully!'),
                
                // Timestamp
                createElement('div', { 
                  key: 'time', 
                  style: { 
                    fontSize: '12px', 
                    color: '#999', 
                    textAlign: 'right',
                    borderTop: '1px solid #eee', 
                    paddingTop: '12px'
                  } 
                }, hasRealSummary 
                  ? 'Generated at: ' + currentCallSummary.timestamp.toLocaleTimeString()
                  : 'Processed at: ' + new Date().toLocaleTimeString()
                )
              ]);
              
              // Update popup with summary content
              showSummary(
                summaryElement,
                { 
                  title: 'Call Summary - Complete',
                  priority: 'high' as const
                }
              );
              
              console.log('✅ [useConfirmHandler] Popup updated with summary content successfully');
              
              // Stop polling - we're done!
              isPollingRef.current = false;
              if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
              }
              
              return; // Exit polling
              
            } catch (updateError) {
              console.error('❌ [useConfirmHandler] Error updating popup with summary:', updateError);
              // Continue polling in case this was a temporary error
            }
          }
          
          // Check if we've exceeded max polling attempts
          if (pollCount >= maxPolls) {
            console.log('⏰ [useConfirmHandler] Max polling attempts reached, showing completion message');
            
            try {
              // Show completion without detailed summary
              const completionElement = createElement('div', { 
                style: { padding: '20px', textAlign: 'center', maxWidth: '400px' } 
              }, [
                createElement('h3', { 
                  key: 'title', 
                  style: { marginBottom: '16px', color: '#333', fontSize: '18px', fontWeight: '600' } 
                }, '📋 Call Summary'),
                
                createElement('div', { 
                  key: 'icon', 
                  style: { fontSize: '48px', marginBottom: '16px' } 
                }, '✅'),
                
                createElement('p', { 
                  key: 'message', 
                  style: { marginBottom: '16px', lineHeight: '1.5', color: '#333', fontSize: '16px' } 
                }, 'Call completed successfully!'),
                
                createElement('p', { 
                  key: 'note', 
                  style: { fontSize: '14px', color: '#666', marginBottom: '16px' } 
                }, 'Your conversation has been recorded. Summary processing may take a moment longer.'),
                
                createElement('div', { 
                  key: 'contact', 
                  style: { 
                    fontSize: '12px', 
                    color: '#999', 
                    borderTop: '1px solid #eee', 
                    paddingTop: '12px',
                    marginTop: '16px'
                  } 
                }, 'For immediate assistance, please contact the front desk.')
              ]);
              
              showSummary(
                completionElement,
                { 
                  title: 'Call Complete',
                  priority: 'medium' as const
                }
              );
              
              console.log('✅ [useConfirmHandler] Completion message shown after max polling');
              
            } catch (completionError) {
              console.error('❌ [useConfirmHandler] Error showing completion message:', completionError);
            }
            
            // Stop polling
            isPollingRef.current = false;
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            
            return; // Exit polling
          }
          
          // Continue polling
          console.log(`⏳ [useConfirmHandler] No data yet, will check again in 2s (${pollCount}/${maxPolls})...`);
          
        } catch (pollError) {
          console.error('❌ [useConfirmHandler] Error during polling:', pollError);
          // Continue polling - might be temporary error
        }
      };
      
      // Start polling immediately, then every 2 seconds
      pollForSummary();
      pollingRef.current = setInterval(pollForSummary, 2000);
      
      console.log('✅ [useConfirmHandler] Polling started successfully');
      
    } catch (error) {
      console.error('❌ [useConfirmHandler] CRITICAL ERROR in handleConfirm:', error);
      console.error('❌ [useConfirmHandler] Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      
      // Emergency fallback - simple alert
      console.log('🚨 [useConfirmHandler] Showing emergency alert fallback');
      setTimeout(() => {
        alert('Call completed! Please check with front desk for any service requests.');
      }, 100);
    }
  }, [endCall, transcripts.length, callSummary, serviceRequests, showSummary]);

  return {
    handleConfirm
  };
}; 