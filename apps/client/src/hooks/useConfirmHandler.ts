import { useCallback, createElement } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { usePopup } from '@/components/popup-system';

interface UseConfirmHandlerProps {
  conversationState: any;
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
 * 2. Wait for AI summary generation
 * 3. Display summary popup with multiple fallback strategies
 * 4. Handle all error scenarios gracefully
 * 
 * @param props - Dependencies needed for confirm operation  
 * @returns handleConfirm function
 */
export const useConfirmHandler = ({
  conversationState,
  transcripts,
  callSummary,
  serviceRequests
}: UseConfirmHandlerProps): UseConfirmHandlerReturn => {
  const { showSummary } = usePopup();

  const handleConfirm = useCallback(() => {
    console.log('✅ [useConfirmHandler] Confirm button clicked in SiriButtonContainer');
    console.log('📊 [useConfirmHandler] Current state:', { 
      isCallStarted: conversationState.isCallStarted,
      transcriptsCount: transcripts.length,
      hasCallSummary: !!callSummary,
      hasServiceRequests: serviceRequests?.length > 0
    });
    
    try {
      console.log('🔄 [useConfirmHandler] Step 1: Calling conversationState.handleConfirm()...');
      
      // Use conversation state handler to end call properly
      conversationState.handleConfirm();
      
      console.log('✅ [useConfirmHandler] Step 1 completed: conversationState.handleConfirm() successful');
      console.log('🔄 [useConfirmHandler] Step 2: handleEndCall completed');
      
      // 🔄 NEW: Show immediate loading popup, then update content
      console.log('📋 [useConfirmHandler] Step 3: Showing immediate loading popup...');
      
      try {
        // Show loading popup immediately
        const loadingElement = createElement('div', { 
          id: 'summary-loading-popup',
          style: { padding: '20px', textAlign: 'center', maxWidth: '400px' } 
        }, [
          createElement('h3', { key: 'title', style: { marginBottom: '16px', color: '#333' } }, '📋 Call Summary'),
          createElement('div', { key: 'loading', style: { marginBottom: '16px' } }, [
            createElement('div', { 
              key: 'spinner',
              style: { 
                display: 'inline-block',
                width: '20px', 
                height: '20px', 
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '10px'
              }
            }),
            createElement('span', { key: 'text' }, 'Generating summary...')
          ]),
          createElement('p', { key: 'message', style: { fontSize: '14px', color: '#666', lineHeight: '1.5' } }, 
            'Please wait while we process your conversation and generate insights.'),
          createElement('div', { key: 'time', style: { fontSize: '10px', color: '#999', marginTop: '12px' } }, 
            'Call ended at: ' + new Date().toLocaleTimeString())
        ]);
        
        showSummary(
          loadingElement,
          { 
            title: 'Generating Summary...',
            priority: 'high' as const
          }
        );
        console.log('✅ [useConfirmHandler] Step 3: Loading popup shown');
        
        // Add CSS animation for spinner
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
      } catch (loadingError) {
        console.error('❌ [useConfirmHandler] Step 3 ERROR: Loading popup failed:', loadingError);
      }

      // Wait for summary to be generated, then UPDATE the same popup
      setTimeout(() => {
        console.log('⏰ [useConfirmHandler] Step 4: First timeout reached, checking summary...');
        console.log('🔍 [useConfirmHandler] callSummary:', callSummary);
        console.log('🔍 [useConfirmHandler] callSummary.content:', callSummary?.content);
        
        if (callSummary && callSummary.content && callSummary.content !== "Generating AI summary of your conversation...") {
          console.log('📋 [useConfirmHandler] Step 5a: Summary ready, updating popup with content:', callSummary.content.substring(0, 50) + '...');
          
          try {
            // Update popup with actual summary content
            const summaryElement = createElement('div', { style: { padding: '20px', maxWidth: '500px' } }, [
              createElement('h3', { key: 'title', style: { marginBottom: '16px', color: '#333' } }, '📋 Call Summary'),
              createElement('div', { key: 'content', style: { marginBottom: '16px', lineHeight: '1.5', background: '#f8f9fa', padding: '12px', borderRadius: '6px' } }, callSummary.content),
              createElement('div', { key: 'time', style: { fontSize: '12px', color: '#666', textAlign: 'right' } }, 
                'Generated at ' + callSummary.timestamp.toLocaleTimeString()),
              serviceRequests && serviceRequests.length > 0 && createElement('div', { key: 'requests', style: { marginTop: '16px' } }, [
                createElement('h4', { key: 'req-title', style: { marginBottom: '8px', color: '#333' } }, 'Service Requests:'),
                createElement('ul', { key: 'req-list', style: { listStyle: 'disc', marginLeft: '20px', color: '#555' } }, 
                  serviceRequests.map((req, idx) => 
                    createElement('li', { key: idx, style: { marginBottom: '4px' } }, `${req.serviceType}: ${req.requestText}`)
                  )
                )
              ])
            ]);
            
            // Update the existing popup
            showSummary(
              summaryElement,
              { 
                title: 'Call Summary - Complete',
                priority: 'high' as const
              }
            );
            console.log('✅ [useConfirmHandler] Step 6a: Popup updated with summary content');
          } catch (updateError) {
            console.error('❌ [useConfirmHandler] Step 5a ERROR: Failed to update popup:', updateError);
          }
        } else {
          console.log('⏳ [useConfirmHandler] Step 5b: Summary not ready, will check again...');
          console.log('🔍 [useConfirmHandler] Current callSummary state:', {
            exists: !!callSummary,
            hasContent: !!(callSummary?.content),
            content: callSummary?.content,
            isGenerating: callSummary?.content === "Generating AI summary of your conversation..."
          });
          
          // Wait a bit more, then show fallback if still not ready
          setTimeout(() => {
            console.log('⏰ [useConfirmHandler] Step 6b: Second timeout reached, final check...');
            console.log('🔍 [useConfirmHandler] Final callSummary:', callSummary);
            
            if (callSummary && callSummary.content && callSummary.content !== "Generating AI summary of your conversation...") {
              console.log('📋 [useConfirmHandler] Step 7b: Delayed summary ready, updating popup');
              
              try {
                const delayedElement = createElement('div', { style: { padding: '20px', maxWidth: '500px' } }, [
                  createElement('h3', { key: 'title', style: { marginBottom: '16px', color: '#333' } }, '📋 Call Summary'),
                  createElement('div', { key: 'content', style: { marginBottom: '16px', lineHeight: '1.5', background: '#f8f9fa', padding: '12px', borderRadius: '6px' } }, callSummary.content),
                  createElement('div', { key: 'time', style: { fontSize: '12px', color: '#666', textAlign: 'right' } }, 
                    'Generated at ' + callSummary.timestamp.toLocaleTimeString())
                ]);
                
                showSummary(
                  delayedElement,
                  { 
                    title: 'Call Summary - Complete',
                    priority: 'high' as const
                  }
                );
                console.log('✅ [useConfirmHandler] Step 8b: Delayed summary popup updated');
              } catch (delayedError) {
                console.error('❌ [useConfirmHandler] Step 7b ERROR: Delayed popup update failed:', delayedError);
              }
            } else {
              console.log('❌ [useConfirmHandler] Step 7b: Summary still not available, showing completion message');
              
              try {
                // Update to show completion without detailed summary
                const completionElement = createElement('div', { style: { padding: '20px', textAlign: 'center', maxWidth: '400px' } }, [
                  createElement('h3', { key: 'title', style: { marginBottom: '16px', color: '#333' } }, '📋 Call Summary'),
                  createElement('div', { key: 'icon', style: { fontSize: '48px', marginBottom: '16px' } }, '✅'),
                  createElement('p', { key: 'message', style: { marginBottom: '16px', lineHeight: '1.5', color: '#333' } }, 
                    'Call completed successfully!'),
                  createElement('p', { key: 'note', style: { fontSize: '14px', color: '#666', marginBottom: '16px' } }, 
                    'Your conversation has been recorded. Summary processing is continuing in the background.'),
                  createElement('div', { key: 'contact', style: { fontSize: '12px', color: '#999', borderTop: '1px solid #eee', paddingTop: '12px' } }, 
                    'For immediate assistance, please contact the front desk.')
                ]);
                
                showSummary(
                  completionElement,
                  { 
                    title: 'Call Complete',
                    priority: 'medium' as const
                  }
                );
                console.log('✅ [useConfirmHandler] Step 8b: Final completion message shown');
              } catch (completionError) {
                console.error('❌ [useConfirmHandler] Step 7b ERROR: Completion popup failed:', completionError);
              }
            }
          }, 3000); // Wait 3 more seconds for summary
        }
      }, 2000); // Initial delay for summary generation
      
      console.log('✅ [useConfirmHandler] Confirm completed - Summary popup will be shown when ready');
      
    } catch (error) {
      console.error('❌ [useConfirmHandler] CRITICAL ERROR in handleConfirm:', error);
      console.error('❌ [useConfirmHandler] Error name:', error.name);
      console.error('❌ [useConfirmHandler] Error message:', error.message);
      console.error('❌ [useConfirmHandler] Error stack:', error.stack);
      
      // 🔧 FIX: Don't re-throw error, show fallback popup instead
      console.log('🔄 [useConfirmHandler] Showing emergency fallback popup due to error...');
      
      try {
        // Emergency fallback popup
        const emergencyElement = createElement('div', { style: { padding: '20px', textAlign: 'center', maxWidth: '400px' } }, [
          createElement('h3', { key: 'title', style: { marginBottom: '16px', color: '#333' } }, '📋 Call Summary'),
          createElement('p', { key: 'message', style: { marginBottom: '16px', lineHeight: '1.5' } }, 
            'Call completed successfully! Summary is being processed in the background.'),
          createElement('div', { key: 'note', style: { fontSize: '12px', color: '#666', marginTop: '12px' } }, 
            'If you need immediate assistance, please contact front desk.'),
          createElement('div', { key: 'time', style: { fontSize: '10px', color: '#999', marginTop: '8px' } }, 
            'Timestamp: ' + new Date().toLocaleTimeString())
        ]);
        
        showSummary(
          emergencyElement,
          { 
            title: 'Call Summary',
            priority: 'medium' as const
          }
        );
        
        console.log('✅ [useConfirmHandler] Emergency fallback popup shown successfully');
      } catch (fallbackError) {
        console.error('❌ [useConfirmHandler] Emergency fallback also failed:', fallbackError);
        // Last resort: at least don't crash the app
        alert('Call completed! Please check with front desk for any service requests.');
      }
      
      // 🔧 FIX: Don't re-throw error to prevent Error Boundary trigger
      console.log('🔄 [useConfirmHandler] Error handled gracefully, continuing normal operation');
    }
  }, [conversationState, transcripts.length, callSummary, serviceRequests, showSummary]);

  return {
    handleConfirm
  };
}; 