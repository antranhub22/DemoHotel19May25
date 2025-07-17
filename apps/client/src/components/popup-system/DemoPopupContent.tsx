import React from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { extractRoomNumber, parseSummaryToOrderDetails } from '@/lib/summaryParser';
import { t } from '@/i18n';

export const ConversationDemoContent: React.FC = () => {
  return (
    <div style={{ padding: '16px', minHeight: '200px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ color: '#1F2937', marginBottom: '8px', fontSize: '18px' }}>
          🎤 Realtime Conversation
        </h3>
        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.5' }}>
          This is the new iOS-style popup system! Voice conversation content will appear here when a call is active.
        </p>
      </div>
      
      <div style={{ 
        background: '#F3F4F6', 
        borderRadius: '8px', 
        padding: '12px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            U
          </div>
          <span style={{ fontSize: '14px', color: '#374151' }}>Guest</span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
          "Hi, I need room service please"
        </p>
      </div>

      <div style={{ 
        background: '#ECFDF5', 
        borderRadius: '8px', 
        padding: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            A
          </div>
          <span style={{ fontSize: '14px', color: '#374151' }}>Assistant</span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
          "Of course! I'd be happy to help you with room service. What would you like to order?"
        </p>
      </div>
    </div>
  );
};

export const NotificationDemoContent: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ color: '#1F2937', marginBottom: '8px', fontSize: '16px' }}>
          🏊‍♂️ Pool Maintenance Notice
        </h4>
        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
          The hotel pool will be temporarily closed for routine maintenance from 2:00 PM to 4:00 PM today.
        </p>
      </div>
      
      <div style={{
        background: '#FEF3C7',
        border: '1px solid #F59E0B',
        borderRadius: '6px',
        padding: '8px 12px'
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: '13px', 
          color: '#92400E',
          fontWeight: '500'
        }}>
          ⚠️ We apologize for any inconvenience caused.
        </p>
      </div>
    </div>
  );
};

export const AlertDemoContent: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '16px'
        }}>
          ⚠️
        </div>
        <div>
          <h4 style={{ color: '#1F2937', margin: 0, fontSize: '16px' }}>
            System Alert
          </h4>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '13px' }}>
            High Priority
          </p>
        </div>
      </div>
      
      <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>
        Connection to voice service temporarily unstable. Please try again in a few moments.
      </p>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={{
          background: '#EF4444',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Retry
        </button>
        <button style={{
          background: '#F3F4F6',
          color: '#374151',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}; 

// Main Summary Popup Component - Uses dual summary system
export const SummaryPopupContent: React.FC = () => {
  const { callSummary, serviceRequests, language, callDetails } = useAssistant();
  
  // Dual Summary Logic: Vapi.ai (primary) + OpenAI (fallback)
  const getSummaryData = () => {
    // Priority 1: Vapi.ai callSummary (real-time, voice-optimized)
    if (callSummary && callSummary.content) {
      const roomNumber = extractRoomNumber(callSummary.content);
      const orderDetails = parseSummaryToOrderDetails(callSummary.content);
      
      return {
        source: 'Vapi.ai',
        roomNumber: roomNumber || 'Unknown',
        content: callSummary.content,
        items: orderDetails.items || [],
        timestamp: callSummary.timestamp,
        hasData: true
      };
    }
    
    // Priority 2: OpenAI serviceRequests (enhanced processing)
    if (serviceRequests && serviceRequests.length > 0) {
      const roomNumber = serviceRequests[0]?.details?.roomNumber || 'Unknown';
      
      return {
        source: 'OpenAI Enhanced',
        roomNumber,
        content: serviceRequests.map(req => 
          `${req.serviceType}: ${req.requestText}`
        ).join('\n'),
        items: serviceRequests.map(req => ({
          name: req.serviceType,
          description: req.requestText,
          quantity: 1,
          price: 10
        })),
        timestamp: new Date(),
        hasData: true
      };
    }
    
    // Fallback: No summary available
    return {
      source: 'No data',
      roomNumber: callDetails?.roomNumber || 'Unknown',
      content: 'Call summary not available yet',
      items: [],
      timestamp: new Date(),
      hasData: false
    };
  };
  
  const summary = getSummaryData();
  
  return (
    <div className="space-y-3">
      {/* Header with source indicator */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-green-700">📋 {t('summary', language)}</span>
        <span className="text-gray-500 text-[10px]">{summary.source}</span>
      </div>
      
      {summary.hasData ? (
        <>
          {/* Room & Basic Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium text-gray-600">Room:</span>
              <span className="ml-1 font-semibold text-blue-800">{summary.roomNumber}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Items:</span>
              <span className="ml-1 font-semibold text-green-700">{summary.items.length}</span>
            </div>
          </div>
          
          {/* Quick Requests List */}
          {summary.items.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-gray-600">Requests:</div>
              <div className="space-y-1 max-h-16 overflow-y-auto">
                {summary.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[10px]">
                    <span className="w-1 h-1 bg-green-500 rounded-full flex-shrink-0"></span>
                    <span className="text-gray-700 truncate">{item.name}</span>
                  </div>
                ))}
                {summary.items.length > 3 && (
                  <div className="text-[10px] text-gray-500 italic">
                    +{summary.items.length - 3} more items...
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Timestamp */}
          <div className="text-[10px] text-gray-400 text-right">
            {summary.timestamp.toLocaleTimeString()}
          </div>
        </>
      ) : (
        /* No Data State */
        <div className="text-center py-2 text-gray-500">
          <div className="text-xs">⏳ Processing call summary...</div>
          <div className="text-[10px] mt-1">Please wait a moment</div>
        </div>
      )}
    </div>
  );
}; 