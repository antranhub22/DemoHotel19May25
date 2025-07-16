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
      <div ref={ref} className={`${className}`}>
        <RealtimeConversationPopup
          isOpen={showConversation}
          onClose={onClose}
          isRight={false}
        />
      </div>
    );
  }
);

ConversationSection.displayName = 'ConversationSection'; 