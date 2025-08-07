import type { Room } from '../types/common.types';
import React from 'react';

// ===============================================
// 🎪 DEMO POPUP CONTENT COMPONENTS
// ===============================================
// This file contains DEMO UI components for testing and demonstration.
// Production components are in separate files (e.g., SummaryPopupContent.tsx)

export 
interface ConversationDemoContentProps {
  className?: string;
  children?: React.ReactNode;
  // TODO: Add specific props for ConversationDemoContent
}

const ConversationDemoContent: React.FC<ConversationDemoContentProps> = () => {
  return (
    <div style={{ padding: '16px', minHeight: '200px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ color: '#1F2937', marginBottom: '8px', fontSize: '18px' }}>
          🎤 Realtime Conversation
        </h3>
        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.5' }}>
          This is the new iOS-style popup system! Voice conversation content
          will appear here when a call is active.
        </p>
      </div>

      <div
        style={{
          background: '#F3F4F6',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            U
          </div>
          <span style={{ fontSize: '14px', color: '#374151' }}>Guest</span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
          "Hi, I need room service please"
        </p>
      </div>

      <div
        style={{
          background: '#ECFDF5',
          borderRadius: '8px',
          padding: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            A
          </div>
          <span style={{ fontSize: '14px', color: '#374151' }}>Assistant</span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
          "Of course! I'd be happy to help you with room service. What would you
          like to order?"
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
        <p
          style={{
            color: '#6B7280',
            fontSize: '14px',
            lineHeight: '1.5',
            margin: 0,
          }}
        >
          The hotel pool will be temporarily closed for routine maintenance from
          2:00 PM to 4:00 PM today.
        </p>
      </div>

      <div
        style={{
          background: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '6px',
          padding: '8px 12px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#92400E',
            fontWeight: '500',
          }}
        >
          ⚠️ We apologize for any inconvenience caused.
        </p>
      </div>
    </div>
  );
};

export const AlertDemoContent: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
          }}
        >
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

      <p
        style={{
          color: '#374151',
          fontSize: '14px',
          lineHeight: '1.5',
          marginBottom: '12px',
        }}
      >
        Connection to voice service temporarily unstable. Please try again in a
        few moments.
      </p>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          style={{
            background: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
        <button
          style={{
            background: '#F3F4F6',
            color: '#374151',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export const StaffDemoContent: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ color: '#1F2937', marginBottom: '8px', fontSize: '16px' }}>
          👨‍💼 Staff Message
        </h4>
        <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.5' }}>
          From: Hotel Manager
        </p>
      </div>

      <div
        style={{
          background: '#F0F9FF',
          border: '1px solid #0EA5E9',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', color: '#0F172A' }}>
          "Good morning team! Please ensure all rooms are prepared for today's
          VIP guests. Special attention to amenities and welcome packages."
        </p>
      </div>

      <div style={{ fontSize: '12px', color: '#6B7280', textAlign: 'right' }}>
        5 minutes ago
      </div>
    </div>
  );
};

export const OrderDemoContent: React.FC = () => {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ color: '#1F2937', marginBottom: '8px', fontSize: '16px' }}>
          🛎️ Room Service Order
        </h4>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>
          Room 205 • Order #RS-001
        </p>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#F9FAFB',
            borderRadius: '6px',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '14px', color: '#374151' }}>
            Club Sandwich
          </span>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>x1</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#F9FAFB',
            borderRadius: '6px',
          }}
        >
          <span style={{ fontSize: '14px', color: '#374151' }}>
            Fresh Orange Juice
          </span>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>x1</span>
        </div>
      </div>

      <div
        style={{
          background: '#10B981',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: '500',
        }}
      >
        ✓ Ready for delivery
      </div>
    </div>
  );
};

// ===============================================
// 📝 DEMO COMPONENTS SUMMARY
// ===============================================
// Available demo components:
// • ConversationDemoContent - Sample voice conversation
// • NotificationDemoContent - Hotel notification example
// • AlertDemoContent - System alert example
// • StaffDemoContent - Staff message example
// • OrderDemoContent - Room service order example
//
// 🎯 PURPOSE: UI/UX demonstration and testing
// 🚀 PRODUCTION: Use dedicated files (SummaryPopupContent.tsx, etc.)
