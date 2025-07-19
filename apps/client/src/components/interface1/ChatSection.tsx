import { forwardRef } from 'react';
import ChatPopup from '../ChatPopup';

interface ChatSectionProps {
  showChat: boolean;
  onClose: () => void;
  className?: string;
  isOverlay?: boolean; // Desktop = false, Mobile = true
}

export const ChatSection = forwardRef<HTMLDivElement, ChatSectionProps>(
  ({ showChat, onClose, className = "", isOverlay = true }, ref) => {
    if (!showChat) return null;

    // Desktop: Relative positioned in grid column
    if (!isOverlay) {
      return (
        <div 
          ref={ref} 
          className={`${className} relative`}
        >
          <ChatPopup
            isOpen={showChat}
            onClose={onClose}
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
          zIndex: 30, // Lower than SummaryPopup for stacking
          pointerEvents: 'none', // Cho phép click through container
        }}
      >
        <div style={{ pointerEvents: 'auto' }}> {/* Chỉ popup mới có thể interact */}
        <ChatPopup
          isOpen={showChat}
          onClose={onClose}
          layout="overlay" // Mobile: overlay layout styling
        />
        </div>
      </div>
    );
  }
); 