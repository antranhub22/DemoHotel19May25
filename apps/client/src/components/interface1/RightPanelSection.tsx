import { forwardRef } from 'react';
import RightPanelPopup from '../RightPanelPopup';

interface RightPanelSectionProps {
  showPanel: boolean;
  onClose: () => void;
  className?: string;
}

export const RightPanelSection = forwardRef<HTMLDivElement, RightPanelSectionProps>(
  ({ showPanel, onClose, className = "" }, ref) => {
    if (!showPanel) return null;

    return (
      <div 
        ref={ref} 
        className={`${className} relative`}
        style={{
          position: 'relative',
          zIndex: 30,
          marginLeft: '40px',  // Tách xa hơn khỏi Siri Button
          marginRight: '0px',  // Sát bên phải
        }}
      >
        <RightPanelPopup
          isOpen={showPanel}
          onClose={onClose}
        />
      </div>
    );
  }
);

RightPanelSection.displayName = 'RightPanelSection'; 