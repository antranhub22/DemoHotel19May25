// ============================================
// PRODUCTION SUMMARY POPUP FIXES
// ============================================

// ✅ FIX: Enhanced summary popup trigger with error handling
export const useConfirmHandler = () => {
  const autoTriggerSummary = useCallback(async () => {
    try {
      console.log('📋 [DEBUG] Auto-triggering summary popup...');

      // ✅ FIX: Check if call data exists
      if (!serviceRequests || serviceRequests.length === 0) {
        console.log(
          '⚠️ [DEBUG] No service requests found, showing fallback summary'
        );
        showSummary('Call completed successfully!', {
          title: 'Call Complete',
          priority: 'medium',
        });
        return;
      }

      // ✅ FIX: Enhanced summary creation with error handling
      const summaryData = {
        roomNumber: serviceRequests[0]?.details?.roomNumber || 'Unknown',
        requests: serviceRequests.map(req => ({
          service: req.serviceType,
          details: req.requestText,
        })),
        timestamp: new Date(),
      };

      console.log('📋 [DEBUG] Creating summary with data:', summaryData);

      const summaryElement = React.createElement(
        'div',
        {
          style: {
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '16px',
          },
        },
        [
          React.createElement('h3', { key: 'title' }, '📋 Call Summary'),
          React.createElement(
            'p',
            { key: 'room' },
            `Room: ${summaryData.roomNumber}`
          ),
          React.createElement(
            'p',
            { key: 'time' },
            `Time: ${summaryData.timestamp.toLocaleTimeString()}`
          ),
          ...summaryData.requests.map((req, index) =>
            React.createElement('div', { key: `req-${index}` }, [
              React.createElement('strong', { key: 'service' }, req.service),
              React.createElement(
                'span',
                { key: 'details' },
                `: ${req.details}`
              ),
            ])
          ),
        ]
      );

      const popupId = showSummary(summaryElement, {
        title: 'Call Complete',
        priority: 'high',
      });

      console.log(
        '✅ [DEBUG] Summary popup created successfully, ID:',
        popupId
      );
    } catch (error) {
      console.error('❌ [DEBUG] Failed to trigger summary popup:', error);

      // ✅ FIX: Fallback summary on error
      showSummary('Call completed. Please check with staff for details.', {
        title: 'Call Complete',
        priority: 'medium',
      });
    }
  }, [showSummary, serviceRequests]);

  return { autoTriggerSummary };
};

// ✅ FIX: Enhanced popup manager with production checks
export const usePopup = () => {
  const showSummary = useCallback(
    (content, options = {}) => {
      try {
        console.log('📋 [DEBUG] showSummary called with options:', options);

        // ✅ FIX: Production environment checks
        if (process.env.NODE_ENV === 'production') {
          console.log('🏭 [DEBUG] Running in production mode');

          // Add production-specific logging
          if (typeof window !== 'undefined') {
            console.log('🌐 [DEBUG] Browser environment detected');
          }
        }

        const popupId = addPopup({
          type: 'summary',
          title: options.title || 'Call Summary',
          content,
          priority: options.priority || 'medium',
          isActive: true,
        });

        console.log('✅ [DEBUG] Summary popup created, ID:', popupId);
        return popupId;
      } catch (error) {
        console.error('❌ [DEBUG] Failed to create summary popup:', error);
        return '';
      }
    },
    [addPopup]
  );

  return { showSummary };
};
