// Interface1 component - Multi-tenant version v2.0.0 - Single Implementation

// Custom Hook
import { useInterface1 } from '@/hooks/useInterface1';

// UI Components - States
import { LoadingState } from './interface1/LoadingState';
import { ErrorState } from './interface1/ErrorState';

// UI Components - Layout
import { InterfaceContainer } from './interface1/InterfaceContainer';
import { InterfaceHeader } from './interface1/InterfaceHeader';
import { ServiceGridContainer } from './interface1/ServiceGridContainer';
import { ConversationSection } from './interface1/ConversationSection';
import { RightPanelSection } from './interface1/RightPanelSection';
import { ChatSection } from './interface1/ChatSection';
import { SummarySection } from './interface1/SummarySection';
import { ScrollToTopButton } from './interface1/ScrollToTopButton';

// UI Components - Interactive
import { SiriButtonContainer } from './siri/SiriButtonContainer';


interface Interface1Props {
  isActive: boolean;
}

export const Interface1 = ({ isActive }: Interface1Props): JSX.Element => {
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
    showRightPanel,
    handleRightPanelToggle,
    handleRightPanelClose,
    // ✅ NEW: Chat & Summary popup states
    showChatPopup,
    showSummaryPopup,
    handleChatPopupClose,
    handleSummaryPopupClose,
    chatRef,
    summaryRef,
    handleShowConversationPopup,
    handleShowNotificationDemo,
    handleShowSummaryDemo
  } = useInterface1({ isActive });

  // Early returns
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <InterfaceContainer>

      
      {/* Hero Section with 4-Position Layout */}
      <div ref={heroSectionRef} className="relative">
        <InterfaceHeader />
        
        {/* 4-Position Layout: Desktop = 3-column + center bottom, Mobile = overlay */}
        <div className="relative min-h-[400px] px-4">
          
          {/* Desktop: 4-Position Grid Layout */}
          <div className="hidden md:block">
            {/* Row 1: 3-Column Layout - Chat | Siri | Summary */}
            <div className="grid grid-cols-3 gap-8 items-center justify-items-center min-h-[400px] mb-8">
              
              {/* Column 1: Chat Popup (Left) */}
              <div className="w-full max-w-sm">
                <ChatSection
                  ref={chatRef}
                  showChat={showChatPopup}
                  onClose={handleChatPopupClose}
                  className="relative z-30"
                  isOverlay={false} // Desktop: relative position in grid
                />
              </div>
              
              {/* Column 2: Siri Button (Center) - Improved sizing and positioning */}
              <div className="flex flex-col items-center justify-center w-full max-w-md">
                <div className="flex items-center justify-center p-4">
                  <SiriButtonContainer
                    isCallStarted={isCallStarted}
                    micLevel={micLevel}
                    onCallStart={async (lang) => {
                      await handleCallStart(lang);
                    }}
                    onCallEnd={handleCallEnd}
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                  />
                </div>
              </div>
              
              {/* Column 3: Summary Popup (Right) */}
              <div className="w-full max-w-sm">
                <SummarySection
                  ref={summaryRef}
                  showSummary={showSummaryPopup}
                  onClose={handleSummaryPopupClose}
                  className="relative z-40"
                  isOverlay={false} // Desktop: relative position in grid
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
                  onCallStart={async (lang) => {
                    await handleCallStart(lang);
                  }}
                  onCallEnd={handleCallEnd}
                  onCancel={handleCancel}
                  onConfirm={handleConfirm}
                />
              </div>
            </div>
            
            {/* Mobile: Chat popup (overlay - base layer) */}
            <ChatSection
              ref={chatRef}
              showChat={showChatPopup}
              onClose={handleChatPopupClose}
              className=""
              isOverlay={true} // Mobile: fixed overlay position
            />
            
            {/* Mobile: Summary popup (overlay - stacked on top, iPhone-style) */}
            <SummarySection
              ref={summaryRef}
              showSummary={showSummaryPopup}
              onClose={handleSummaryPopupClose}
              className=""
              isOverlay={true} // Mobile: fixed overlay position with higher zIndex
            />
          </div>
          
        </div>
      </div>

      {/* Service Categories Section - Add margin to prevent overlap */}
      <div className="mt-16 relative z-10">
        <ServiceGridContainer ref={serviceGridRef} />
      </div>

      {/* Scroll Controls */}
      <ScrollToTopButton
        show={showScrollButton}
        onScrollToTop={scrollToTop}
        onScrollToServices={() => scrollToSection('services')}
      />
      
      {/* Realtime Conversation now handled by ConversationSection */}
    </InterfaceContainer>
  );
};
