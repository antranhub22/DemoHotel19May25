// ⚠️ DEPRECATED: ConversationSection has been replaced by unified ChatPopup component
// This file is kept for reference but should not be used in new code
// Use ChatPopup with layout="overlay" for mobile and layout="grid" for desktop instead

import { forwardRef } from 'react';
import RealtimeConversationPopup from '../RealtimeConversationPopup';

interface ConversationSectionProps {
  showConversation: boolean;
  onClose: () => void;
  className?: string;
  isOverlay?: boolean; // Desktop = false, Mobile = true
}

export const ConversationSection = forwardRef<HTMLDivElement, ConversationSectionProps>(
  ({ showConversation, onClose, className = "", isOverlay = true }, ref) => {
    if (!showConversation) return null;

    // Desktop: Relative positioned in grid column
    if (!isOverlay) {
      return (
        <div 
          ref={ref} 
          className={`${className} relative`}
        >
          <RealtimeConversationPopup
            isOpen={showConversation}
            onClose={onClose}
            isRight={false}
            layout="grid" // Desktop: grid layout styling
          />
        </div>
      );
    }

    // Mobile: Fixed overlay positioned below Siri Button
    return (
      <div 
        ref={ref} 
        className={`${className}`}
        style={{
          position: 'fixed',
          bottom: '40px', // Minimal space for closest popup positioning
          left: 0,
          right: 0,
          zIndex: 10, // Lower than SiriButton canvas
          pointerEvents: 'none', // Cho phép click through container
        }}
      >
        <div style={{ pointerEvents: 'auto' }}> {/* Chỉ popup mới có thể interact */}
        <RealtimeConversationPopup
          isOpen={showConversation}
          onClose={onClose}
          isRight={false}
          layout="overlay" // Mobile: overlay layout styling
        />
        </div>
      </div>
    );
  }
);

ConversationSection.displayName = 'ConversationSection'; 