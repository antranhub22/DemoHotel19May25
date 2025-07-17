// Interface1 component - Multi-tenant version v2.0.0 - Enhanced Design System

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
      {/* Hero Section with 3-Container Layout */}
      <div ref={heroSectionRef} className="relative">
        <InterfaceHeader />
        
        {/* 3-Container Layout: Desktop = horizontal, Mobile = vertical */}
        <div className="relative min-h-[400px] px-4">
          
          {/* Container Chính - Siri Button - Trung tâm hoàn toàn màn hình */}
          <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
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
          
          {/* Container Phải - Right Panel - Floating Overlay */}
          <div className="absolute top-8 right-4 hidden md:block w-80 z-20">
            <RightPanelSection
              ref={rightPanelRef}
              showPanel={showRightPanel}
              onClose={handleRightPanelClose}
              className="w-full max-w-sm z-30"
            />
            {/* Test Popup Buttons */}
            {!showRightPanel && (
              <div className="w-full space-y-4">
                {/* Test Popup System */}
                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50/90 backdrop-blur-sm">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3">🧪 Test Popup System</h4>
                  <div className="space-y-2">
                    <button
                      onClick={handleShowConversationPopup}
                      className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                    >
                      🔴 Show Conversation
                    </button>
                    <button
                      onClick={handleShowNotificationDemo}
                      className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium transition-colors"
                    >
                      📢 Show Notification
                    </button>
                    <button
                      onClick={handleShowSummaryDemo}
                      className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
                    >
                      📋 Show Summary
                    </button>
                  </div>
                </div>
                
                {/* Original Right Panel Toggle */}
                <div 
                  className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm cursor-pointer hover:border-gray-400 hover:bg-gray-50/90 transition-colors backdrop-blur-sm"
                  onClick={handleRightPanelToggle}
                >
                  Click to open Right Panel
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Service Categories Section */}
      <ServiceGridContainer ref={serviceGridRef} />

      {/* Scroll Controls */}
      <ScrollToTopButton
        show={showScrollButton}
        onScrollToTop={scrollToTop}
        onScrollToServices={() => scrollToSection('services')}
      />
      
      {/* Realtime Conversation now handled by PopupManager */}
    </InterfaceContainer>
  );
};
