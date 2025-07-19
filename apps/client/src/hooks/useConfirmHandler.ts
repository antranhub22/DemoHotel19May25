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
      console.log('🔄 [useConfirmHandler] Step 2: Setting up summary popup generation...');
      
      // 🆕 CREATE SUMMARY POPUP after call ends and summary is generated
      console.log('✅ [useConfirmHandler] Call ended, waiting for summary generation...');
      
      // Wait for summary to be generated, then show popup
      setTimeout(() => {
        console.log('⏰ [useConfirmHandler] Step 3: First timeout reached, checking summary...');
        console.log('🔍 [useConfirmHandler] callSummary:', callSummary);
        console.log('🔍 [useConfirmHandler] callSummary.content:', callSummary?.content);
        
        if (callSummary && callSummary.content && callSummary.content !== "Generating AI summary of your conversation...") {
          console.log('📋 [useConfirmHandler] Step 4a: Summary ready, showing popup with content:', callSummary.content.substring(0, 50) + '...');
          
          try {
            // Import and show summary popup
            console.log('📦 [useConfirmHandler] Step 5a: Importing DemoPopupContent module...');
            import('../components/popup-system/DemoPopupContent').then((module) => {
              console.log('✅ [useConfirmHandler] Step 6a: Module imported successfully:', module);
              console.log('🔍 [useConfirmHandler] SummaryPopupContent available:', !!module.SummaryPopupContent);
              
              const { SummaryPopupContent } = module;
              console.log('🎨 [useConfirmHandler] Step 7a: Creating popup element...');
              
              const summaryElement = createElement(SummaryPopupContent);
              console.log('✅ [useConfirmHandler] Step 8a: Element created:', summaryElement);
              
              console.log('🚀 [useConfirmHandler] Step 9a: Calling showSummary...');
              showSummary(
                summaryElement,
                { 
                  title: 'Call Summary',
                  priority: 'high' as const
                }
              );
              console.log('✅ [useConfirmHandler] Step 10a: showSummary completed successfully');
            }).catch((importError) => {
              console.error('❌ [useConfirmHandler] Step 6a ERROR: Failed to import DemoPopupContent:', importError);
              console.log('🔄 [useConfirmHandler] Step 6a: Falling back to simple summary popup...');
              
              try {
                // Fallback to simple summary popup
                console.log('🎨 [useConfirmHandler] Step 7b: Creating fallback popup element...');
                const fallbackElement = createElement('div', { style: { padding: '20px', maxWidth: '500px' } }, [
                  createElement('h3', { key: 'title', style: { marginBottom: '16px', color: '#333' } }, '📋 Call Summary'),
                  createElement('div', { key: 'content', style: { marginBottom: '16px', lineHeight: '1.5' } }, callSummary.content),
                  createElement('div', { key: 'time', style: { fontSize: '12px', color: '#666' } }, 
                    'Generated at ' + callSummary.timestamp.toLocaleTimeString()),
                  serviceRequests && serviceRequests.length > 0 && createElement('div', { key: 'requests' }, [
                    createElement('h4', { key: 'req-title', style: { marginTop: '16px', marginBottom: '8px' } }, 'Service Requests:'),
                    createElement('ul', { key: 'req-list', style: { listStyle: 'disc', marginLeft: '20px' } }, 
                      serviceRequests.map((req, idx) => 
                        createElement('li', { key: idx }, `${req.serviceType}: ${req.requestText}`)
                      )
                    )
                  ])
                ]);
                
                console.log('✅ [useConfirmHandler] Step 8b: Fallback element created');
                console.log('🚀 [useConfirmHandler] Step 9b: Calling showSummary with fallback...');
                
                showSummary(
                  fallbackElement,
                  { 
                    title: 'Call Summary',
                    priority: 'high' as const
                  }
                );
                console.log('✅ [useConfirmHandler] Step 10b: Fallback showSummary completed');
              } catch (fallbackError) {
                console.error('❌ [useConfirmHandler] Step 7b ERROR: Fallback popup creation failed:', fallbackError);
              }
            });
          } catch (outerError) {
            console.error('❌ [useConfirmHandler] Step 5a ERROR: Outer try-catch error:', outerError);
          }
        } else {
          // Summary not ready yet, wait a bit more
          console.log('⏳ [useConfirmHandler] Step 4b: Summary not ready, waiting more...');
          console.log('🔍 [useConfirmHandler] Current callSummary state:', {
            exists: !!callSummary,
            hasContent: !!(callSummary?.content),
            content: callSummary?.content,
            isGenerating: callSummary?.content === "Generating AI summary of your conversation..."
          });
          
          setTimeout(() => {
            console.log('⏰ [useConfirmHandler] Step 5b: Second timeout reached, checking summary again...');
            console.log('🔍 [useConfirmHandler] Updated callSummary:', callSummary);
            
            if (callSummary && callSummary.content && callSummary.content !== "Generating AI summary of your conversation...") {
              console.log('📋 [useConfirmHandler] Step 6b: Delayed summary ready, showing popup');
              
              try {
                const delayedElement = createElement('div', { style: { padding: '20px', maxWidth: '500px' } }, [
                  createElement('h3', { key: 'title', style: { marginBottom: '16px', color: '#333' } }, '📋 Call Summary'),
                  createElement('div', { key: 'content', style: { marginBottom: '16px', lineHeight: '1.5' } }, callSummary.content),
                  createElement('div', { key: 'time', style: { fontSize: '12px', color: '#666' } }, 
                    'Generated at ' + callSummary.timestamp.toLocaleTimeString())
                ]);
                
                showSummary(
                  delayedElement,
                  { 
                    title: 'Call Summary',
                    priority: 'high' as const
                  }
                );
                console.log('✅ [useConfirmHandler] Step 7b: Delayed summary popup shown');
              } catch (delayedError) {
                console.error('❌ [useConfirmHandler] Step 6b ERROR: Delayed popup creation failed:', delayedError);
              }
            } else {
              console.log('❌ [useConfirmHandler] Step 6b: Summary still not available, showing fallback message');
              
              try {
                const noSummaryElement = createElement('div', { style: { padding: '20px', textAlign: 'center' } }, [
                  createElement('h3', { key: 'title', style: { marginBottom: '16px', color: '#333' } }, '📋 Call Summary'),
                  createElement('p', { key: 'message' }, 'Summary is being generated. Please check the conversation tab for details.')
                ]);
                
                showSummary(
                  noSummaryElement,
                  { 
                    title: 'Call Summary',
                    priority: 'medium' as const
                  }
                );
                console.log('✅ [useConfirmHandler] Step 7b: No summary fallback shown');
              } catch (noSummaryError) {
                console.error('❌ [useConfirmHandler] Step 6b ERROR: No summary popup creation failed:', noSummaryError);
              }
            }
          }, 2000);
        }
      }, 1500); // Initial delay to allow summary generation
      
      console.log('✅ [useConfirmHandler] Confirm completed - Summary popup will be shown when ready');
      
    } catch (error) {
      console.error('❌ [useConfirmHandler] CRITICAL ERROR in handleConfirm:', error);
      console.error('❌ [useConfirmHandler] Error name:', error.name);
      console.error('❌ [useConfirmHandler] Error message:', error.message);
      console.error('❌ [useConfirmHandler] Error stack:', error.stack);
      
      // Re-throw the error so we can see it in the error boundary
      throw error;
    }
  }, [conversationState, transcripts.length, callSummary, serviceRequests, showSummary]);

  return {
    handleConfirm
  };
}; 