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
        className={`${className} relative`}
        style={{
          position: 'relative',
          zIndex: 30,
          marginRight: '40px', // Tách xa hơn khỏi Siri Button
          marginLeft: '0px',   // Sát bên trái
        }}
      >
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