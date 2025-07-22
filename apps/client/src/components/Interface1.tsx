// Interface1 component - Multi-tenant version v2.0.0 - Single Implementation

// React hooks
import { useState, useEffect } from 'react';

// Custom Hook
import { useInterface1 } from '@/hooks/useInterface1';

// Context
import { usePopupContext } from '@/context/PopupContext';

// Utils
import { logger } from '@shared/utils/logger';

// UI Components - States
import { LoadingState } from './interface1/LoadingState';
import { ErrorState } from './interface1/ErrorState';

// UI Components - Layout
import { InterfaceContainer } from './interface1/InterfaceContainer';
import { InterfaceHeader } from './interface1/InterfaceHeader';
import { ServiceGridContainer } from './interface1/ServiceGridContainer';

// UI Components - Popups
import ChatPopup from './ChatPopup';
import SummaryPopup from './SummaryPopup';

// Siri Components
import { SiriButtonContainer } from './siri/SiriButtonContainer';

// Mobile Summary Popup Component - Similar to RightPanelSection logic
const MobileSummaryPopup = () => {
  const { popups, removePopup } = usePopupContext();
  const [showSummary, setShowSummary] = useState(false);

  // Listen for summary popups and show them in mobile center modal
  useEffect(() => {
    const summaryPopup = popups.find(popup => popup.type === 'summary');
    setShowSummary(!!summaryPopup);
  }, [popups]);

  const handleClose = () => {
    // Remove all summary popups
    popups
      .filter(popup => popup.type === 'summary')
      .forEach(popup => removePopup(popup.id));
  };

  return (
    <SummaryPopup
      isOpen={showSummary}
      onClose={handleClose}
      layout="center-modal"
    />
  );
};

interface Interface1Props {
  isActive: boolean;
}

export const Interface1 = ({ isActive }: Interface1Props): JSX.Element => {
  // ✅ HOOKS MUST BE FIRST - NO CONDITIONAL CALLS
  const {
    isLoading,
    error,
    micLevel,
    showScrollButton,
    scrollToTop,
    scrollToSection,
    heroSectionRef,
    serviceGridRef,
    conversationRef,
    rightPanelRef,
    isCallStarted,
    showConversation,
    handleCallStart,
    handleCallEnd,
    handleCancel,
    handleConfirm,
    showingSummary,
    showRightPanel,
    handleRightPanelToggle,
    handleRightPanelClose,
    handleShowConversationPopup,
    handleShowNotificationDemo,
    handleShowSummaryDemo,
  } = useInterface1({ isActive });

  // 🔍 DEBUG: Log popup states
  logger.debug('Interface1 Popup States', 'Interface1', {
    isCallStarted,
    showConversation,
    chatPopupOpen: showConversation && isCallStarted,
    summaryPopupOpen: showConversation && !isCallStarted,
  });

  // ✅ CONDITIONAL RENDERING WITHOUT EARLY RETURNS
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <InterfaceContainer>
      {/* Hero Section with 4-Position Layout */}
      <div ref={heroSectionRef} className="relative" data-testid="interface1-container">
        <InterfaceHeader />

        {/* 4-Position Layout: Desktop = 3-column + center bottom, Mobile = overlay */}
        <div className="relative min-h-[400px] px-4">
          {/* Desktop: 4-Position Grid Layout */}
          <div className="hidden md:block">
            {/* Row 1: 3-Column Layout - Chat Popup | Siri | Summary Popup */}
            <div className="grid grid-cols-3 gap-8 items-center justify-items-center min-h-[400px] mb-8">
              {/* Column 1: Chat Popup (Left) */}
              <div className="w-full max-w-sm">
                <ChatPopup
                  isOpen={showConversation && isCallStarted}
                  onClose={() => {}}
                  layout="grid"
                />
              </div>

              {/* Column 2: Siri Button (Center) - Improved sizing and positioning */}
              <div className="flex flex-col items-center justify-center w-full max-w-md">
                <div className="flex items-center justify-center p-4">
                  <SiriButtonContainer
                    isCallStarted={isCallStarted}
                    micLevel={micLevel}
                    onCallStart={async lang => {
                      await handleCallStart(lang);
                    }}
                    onCallEnd={handleCallEnd}
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                    showingSummary={showingSummary}
                  />
                </div>
              </div>

              {/* Column 3: Summary Popup (Right) */}
              <div className="w-full max-w-sm">
                <SummaryPopup
                  isOpen={showRightPanel}
                  onClose={handleRightPanelClose}
                  layout="grid"
                  className="relative z-30 ml-10"
                />
              </div>
            </div>

            {/* Row 2: Notification (Center, below Siri) */}
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-sm">
                {/* Placeholder for future Notification popup */}
                {/* <NotificationSection /> */}
              </div>
            </div>
          </div>

          {/* Mobile: Original center layout with overlay popups */}
          <div className="block md:hidden">
            <div className="w-full flex flex-col items-center justify-center min-h-[400px] relative z-50">
              <div className="flex flex-col items-center justify-center">
                <SiriButtonContainer
                  isCallStarted={isCallStarted}
                  micLevel={micLevel}
                  onCallStart={async lang => {
                    await handleCallStart(lang);
                  }}
                  onCallEnd={handleCallEnd}
                  onCancel={handleCancel}
                  onConfirm={handleConfirm}
                  showingSummary={showingSummary}
                />
              </div>
            </div>

            {/* Mobile: Chat popup (overlay) - UNIFIED COMPONENT */}
            <ChatPopup
              isOpen={showConversation}
              onClose={() => {}} // Will be handled by popup context
              layout="overlay" // Mobile: overlay positioning
              className="fixed bottom-0 left-0 right-0 z-40"
            />

            {/* Mobile: Summary popup (center modal) - UNIFIED COMPONENT */}
            <MobileSummaryPopup />
          </div>
        </div>
      </div>

      {/* Service Categories Section - Add margin to prevent overlap */}
      <div className="mt-16 relative z-10" data-testid="service-grid">
        <ServiceGridContainer ref={serviceGridRef} />
      </div>

      {/* Scroll Controls */}
      {/* ScrollToTopButton - temporarily disabled
        <ScrollToTopButton
          show={showScrollButton}
          onScrollToTop={scrollToTop}
          onScrollToServices={() => scrollToSection('services')}
        />
        */}
    </InterfaceContainer>
  );
};
