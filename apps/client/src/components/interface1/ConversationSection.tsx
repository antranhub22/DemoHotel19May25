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
          bottom: '160px', // Space from bottom to position below Siri Button Container
          left: 0,
          right: 0,
          zIndex: 40,
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