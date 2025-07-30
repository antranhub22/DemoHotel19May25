import { useAssistant } from '@/context';
import { logger } from '@shared/utils/logger';
import React from 'react';
// Remove i18n for now - use static text

// Main Summary Popup Component - Uses OpenAI-only summary system
export const SummaryPopupContent: React.FC = () => {
  const { serviceRequests, language, callDetails } = useAssistant();

  // OpenAI-Only Summary Logic: Only use OpenAI serviceRequests
  const getSummaryData = () => {
    console.log('🔍 [DEBUG] SummaryPopupContent.getSummaryData called:', {
      hasServiceRequests: !!serviceRequests,
      serviceRequestsCount: serviceRequests?.length || 0,
      hasCallDetails: !!callDetails,
      language,
    });

    // OpenAI serviceRequests (enhanced processing)
    if (serviceRequests && serviceRequests.length > 0) {
      const roomNumber = serviceRequests[0]?.details?.roomNumber || 'Unknown';

      console.log('📋 [DEBUG] Found service requests:', {
        count: serviceRequests.length,
        roomNumber,
        requests: serviceRequests.map(req => ({
          serviceType: req.serviceType,
          requestText: req.requestText?.substring(0, 50) + '...',
        })),
      });

      return {
        source: 'OpenAI Analysis',
        roomNumber,
        content: serviceRequests
          .map(req => `${req.serviceType}: ${req.requestText}`)
          .join('\n'),
        items: serviceRequests.map(req => ({
          name: req.serviceType,
          description: req.requestText,
          quantity: 1,
          price: 10,
        })),
        timestamp: new Date(),
        hasData: true,
      };
    }

    console.log('⚠️ [DEBUG] No service requests found, using fallback');

    // Fallback: No summary available
    return {
      source: 'No data',
      roomNumber: callDetails?.roomNumber || 'Unknown',
      content: 'Call summary not available yet',
      items: [],
      timestamp: new Date(),
      hasData: false,
    };
  };

  const summary = getSummaryData();

  const formatTimestamp = (date: Date) => {
    try {
      return date.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      logger.warn(
        '[SummaryPopupContent] Date formatting error:',
        'Component',
        error
      );
      return date.toString();
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        minHeight: '400px',
        maxHeight: '80vh',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '20px',
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '16px',
        }}
      >
        <h3
          style={{
            color: '#1F2937',
            marginBottom: '8px',
            fontSize: '20px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📋 Call Summary
          <span
            style={{
              fontSize: '12px',
              color: '#6B7280',
              background: '#F3F4F6',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: '400',
            }}
          >
            {summary.source}
          </span>
        </h3>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: '0' }}>
          {formatTimestamp(summary.timestamp)} • Room: {summary.roomNumber}
        </p>
      </div>

      {/* Summary Content */}
      <div style={{ marginBottom: '20px' }}>
        <h4
          style={{
            color: '#374151',
            fontSize: '16px',
            marginBottom: '12px',
            fontWeight: '500',
          }}
        >
          Conversation Summary
        </h4>

        {summary.hasData ? (
          <div
            style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#374151',
              whiteSpace: 'pre-wrap',
            }}
          >
            {summary.content}
          </div>
        ) : (
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              color: '#92400E',
              textAlign: 'center',
            }}
          >
            ⏳ Call summary is being generated...
          </div>
        )}
      </div>

      {/* Service Requests */}
      {summary.items && summary.items.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4
            style={{
              color: '#374151',
              fontSize: '16px',
              marginBottom: '12px',
              fontWeight: '500',
            }}
          >
            🛎️ Service Requests
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {summary.items.map((item, index) => (
              <div
                key={index}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: '500',
                      color: '#1F2937',
                      marginBottom: '4px',
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    {item.description}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#374151',
                    fontWeight: '500',
                    marginLeft: '12px',
                  }}
                >
                  Qty: {item.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div
        style={{
          borderTop: '1px solid #E5E7EB',
          paddingTop: '16px',
          fontSize: '12px',
          color: '#6B7280',
          textAlign: 'center',
        }}
      >
        {summary.hasData ? (
          <>
            ✅ Summary generated successfully • Review and send to front desk if
            needed
          </>
        ) : (
          <>⏳ Processing call data • Summary will appear automatically</>
        )}
      </div>
    </div>
  );
};
