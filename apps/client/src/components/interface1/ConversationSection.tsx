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
      <div ref={ref} className={`w-full ${className}`}>
        <RealtimeConversationPopup
          isOpen={showConversation}
          onClose={onClose}
          isRight={true}
        />
      </div>
    );
  }
);

ConversationSection.displayName = 'ConversationSection'; 