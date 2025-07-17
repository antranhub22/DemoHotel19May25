import { forwardRef } from 'react';
import RealtimeConversationPopup from '../RealtimeConversationPopup';

interface ConversationSectionProps {
  showConversation: boolean;
  onClose: () => void;
  className?: string;
}

export const ConversationSection = forwardRef<HTMLDivElement, ConversationSectionProps>(
  ({ showConversation, onClose, className = "" }, ref) => {
    if (!showConversation) return null;

    return (
      <div 
        ref={ref} 
        className={`${className}`}
        style={{
          position: 'fixed',
          bottom: 0,
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
          />
        </div>
      </div>
    );
  }
);

ConversationSection.displayName = 'ConversationSection'; 