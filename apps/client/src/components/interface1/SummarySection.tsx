import { forwardRef } from 'react';
import SummaryPopup from '../SummaryPopup';

interface SummarySectionProps {
  showSummary: boolean;
  onClose: () => void;
  className?: string;
  isOverlay?: boolean; // Desktop = false, Mobile = true
}

export const SummarySection = forwardRef<HTMLDivElement, SummarySectionProps>(
  ({ showSummary, onClose, className = "", isOverlay = true }, ref) => {
    if (!showSummary) return null;

    // Desktop: Relative positioned in grid column
    if (!isOverlay) {
      return (
        <div 
          ref={ref} 
          className={`${className} relative`}
        >
          <SummaryPopup
            isOpen={showSummary}
            onClose={onClose}
            layout="grid" // Desktop: grid layout styling
          />
        </div>
      );
    }

    // Mobile: Fixed overlay positioned below Siri Button (stacked on top of Chat)
    return (
      <div 
        ref={ref} 
        className={`${className}`}
        style={{
          position: 'fixed',
          bottom: '40px', // Same as ChatSection
          left: 0,
          right: 0,
          zIndex: 40, // Higher than ChatPopup for stacking (iPhone-style)
          pointerEvents: 'none', // Cho phép click through container
        }}
      >
        <div style={{ pointerEvents: 'auto' }}> {/* Chỉ popup mới có thể interact */}
        <SummaryPopup
          isOpen={showSummary}
          onClose={onClose}
          layout="overlay" // Mobile: overlay layout styling
          zIndex={40} // Explicitly set zIndex for stacking
        />
        </div>
      </div>
    );
  }
); 