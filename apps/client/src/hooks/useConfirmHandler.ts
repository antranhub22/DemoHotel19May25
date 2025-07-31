import { usePopup } from '@/components/features/popup-system';
import { useAssistant } from '@/context';
import React, { useCallback, useEffect, useRef } from 'react';

// ✅ NEW: Type declarations for global window functions
declare global {
  interface Window {
    triggerSummaryPopup?: () => void;
    updateSummaryPopup?: (summary: string, serviceRequests: any[]) => void;
    resetSummarySystem?: () => void;
  }
}

interface UseConfirmHandlerReturn {
  // ✅ SIMPLIFIED: Clean auto-trigger summary function
  autoTriggerSummary: () => void;
  // ✅ UTILITY: Update popup content when WebSocket data arrives
  updateSummaryPopup: (summary: string, serviceRequests: any[]) => void;
  // ✅ NEW: Reset summary system
  resetSummarySystem: () => void;
}

export const useConfirmHandler = (): UseConfirmHandlerReturn => {
  const isMountedRef = useRef(true);
  const { showSummary, removePopup } = usePopup();
  const { setServiceRequests, setCallSummary } = useAssistant();
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

  // ✅ NEW: Reset summary system
  const resetSummarySystem = useCallback(() => {
    console.log('🔄 [DEBUG] Resetting summary system');
    if (summaryPopupIdRef.current) {
      removePopup(summaryPopupIdRef.current);
      summaryPopupIdRef.current = null;
    }
    console.log('✅ [DEBUG] Summary system reset completed');
  }, [removePopup]);

  // ✅ SIMPLIFIED: Auto-trigger summary when call ends - clean logic
  const autoTriggerSummary = useCallback(() => {
    console.log('📞 [DEBUG] Call ended - showing processing popup');

    // ✅ STEP 1: Show "Processing..." popup immediately
    const processingElement = React.createElement(
      'div',
      {
        style: {
          padding: '20px',
          textAlign: 'center',
          maxWidth: '400px',
        },
      },
      [
        React.createElement(
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
          '⏳ Processing Call Summary'
        ),

        React.createElement(
          'div',
          {
            key: 'icon',
            style: { fontSize: '48px', marginBottom: '16px' },
          },
          '🔄'
        ),

        React.createElement(
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
      ]
    );

    const popupId = showSummary(processingElement, {
      title: 'Call Complete',
      priority: 'medium',
    });

    summaryPopupIdRef.current = popupId;
    console.log('✅ [DEBUG] Processing popup shown, ID:', popupId);

    // ✅ STEP 2: WebSocket will update popup content when data arrives
    // No timeout needed - popup will be updated by WebSocket event
  }, [showSummary]);

  // ✅ NEW: Update popup content when WebSocket data arrives
  const updateSummaryPopup = useCallback(
    (summary: string, serviceRequests: any[]) => {
      console.log('🔄 [DEBUG] Updating summary popup with real data');

      if (!summaryPopupIdRef.current) {
        console.log('⚠️ [DEBUG] No summary popup to update');
        return;
      }

      // ✅ STEP 1: Update assistant context first
      setCallSummary({
        callId: `call-${Date.now()}`,
        tenantId: 'default',
        content: summary,
        timestamp: new Date(),
      });

      if (serviceRequests && serviceRequests.length > 0) {
        setServiceRequests(serviceRequests);
      }

      // ✅ STEP 2: Remove old popup and show new one with real data
      if (summaryPopupIdRef.current) {
        removePopup(summaryPopupIdRef.current);
      }

      // ✅ STEP 3: Create new popup with real summary data
      const realSummaryElement = React.createElement(
        'div',
        {
          style: {
            padding: '20px',
            textAlign: 'center',
            maxWidth: '400px',
          },
        },
        [
          React.createElement(
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

          React.createElement(
            'div',
            {
              key: 'icon',
              style: { fontSize: '48px', marginBottom: '16px' },
            },
            '✅'
          ),

          React.createElement(
            'div',
            {
              key: 'summary',
              style: {
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '14px',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
              },
            },
            summary || 'Your call has been processed successfully!'
          ),

          serviceRequests && serviceRequests.length > 0
            ? React.createElement(
                'div',
                {
                  key: 'requests',
                  style: {
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '8px',
                    textAlign: 'left',
                  },
                },
                [
                  React.createElement(
                    'h4',
                    {
                      key: 'requests-title',
                      style: {
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1976d2',
                      },
                    },
                    `🛎️ Service Requests (${serviceRequests.length})`
                  ),
                  ...serviceRequests.map((req, index) =>
                    React.createElement(
                      'div',
                      {
                        key: `request-${index}`,
                        style: {
                          marginBottom: '4px',
                          fontSize: '12px',
                          color: '#424242',
                        },
                      },
                      `• ${req.service}: ${req.details}`
                    )
                  ),
                ]
              )
            : null,
        ]
      );

      const newPopupId = showSummary(realSummaryElement, {
        title: 'Call Complete',
        priority: 'medium',
      });

      summaryPopupIdRef.current = newPopupId;
      console.log('✅ [DEBUG] Real summary popup created, ID:', newPopupId);
    },
    [showSummary, removePopup, setCallSummary, setServiceRequests]
  );

  // ✅ NEW: Connect to global window for RefactoredAssistantContext access
  useEffect(() => {
    console.log('🔗 [DEBUG] Connecting useConfirmHandler to window');
    window.triggerSummaryPopup = autoTriggerSummary;
    window.updateSummaryPopup = updateSummaryPopup;
    window.resetSummarySystem = resetSummarySystem;

    return () => {
      console.log('🔗 [DEBUG] Cleaning up useConfirmHandler from window');
      delete window.triggerSummaryPopup;
      delete window.updateSummaryPopup;
      delete window.resetSummarySystem;
    };
  }, [autoTriggerSummary, updateSummaryPopup, resetSummarySystem]);

  return {
    autoTriggerSummary,
    updateSummaryPopup,
    resetSummarySystem,
  };
};
