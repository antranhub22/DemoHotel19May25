import React from 'react';

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