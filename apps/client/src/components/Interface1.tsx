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
    handleRightPanelClose
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
        <div className="flex flex-col md:flex-row min-h-[400px] px-4 gap-8 md:gap-12">
          
          {/* Container Trái - Conversation Section - Sát bên trái */}
          <div className="flex-1 order-2 md:order-1 flex justify-start items-start pt-8 pl-0 pr-4">
            <ConversationSection
              ref={conversationRef}
              showConversation={showConversation}
              onClose={handleCallEnd}
              className="w-full max-w-sm z-30"
            />
          </div>
          
          {/* Container Giữa - Siri Button - Trung tâm hoàn hảo */}
          <div className="flex-1 order-1 md:order-2 flex flex-col items-center justify-center">
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
          
          {/* Container Phải - Right Panel */}
          <div className="flex-1 order-3 hidden md:flex justify-end items-start pt-8 pr-0 pl-4">
            <RightPanelSection
              ref={rightPanelRef}
              showPanel={showRightPanel}
              onClose={handleRightPanelClose}
              className="w-full max-w-sm z-30"
            />
            {/* Placeholder button to show panel when hidden */}
            {!showRightPanel && (
              <div 
                className="w-full max-w-sm h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                onClick={handleRightPanelToggle}
              >
                Click to open Right Panel
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
    </InterfaceContainer>
  );
};
