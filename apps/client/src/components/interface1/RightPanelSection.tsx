import { useEffect, useState, forwardRef } from 'react';
import RightPanelPopup from '../RightPanelPopup';
import { usePopupContext } from '@/context/PopupContext';

interface RightPanelSectionProps {
  showPanel: boolean;
  onClose: () => void;
  className?: string;
}

export const RightPanelSection = forwardRef<
  HTMLDivElement,
  RightPanelSectionProps
>(({ showPanel, onClose, className = '' }, ref) => {
  const { popups } = usePopupContext();
  const [showSummary, setShowSummary] = useState(false);

  // Listen for summary popups and show them in this desktop panel
  useEffect(() => {
    const summaryPopup = popups.find(popup => popup.type === 'summary');
    setShowSummary(!!summaryPopup);

    // no cleanup needed
  }, [popups]);

  // Show panel if either manually opened OR if there's a summary to display
  const shouldShowPanel = showPanel || showSummary;

  if (!shouldShowPanel) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={`${className} relative`}
      style={{
        position: 'relative',
        zIndex: 30,
        marginLeft: '40px', // Tách xa hơn khỏi Siri Button
        marginRight: '0px', // Sát bên phải
      }}
    >
      <RightPanelPopup
        isOpen={shouldShowPanel}
        onClose={onClose}
        showSummary={showSummary}
      />
    </div>
  );
});

RightPanelSection.displayName = 'RightPanelSection';
