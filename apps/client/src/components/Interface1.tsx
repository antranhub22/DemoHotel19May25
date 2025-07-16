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
    isCallStarted,
    showConversation,
    handleCallStart,
    handleCallEnd,
    handleCancel,
    handleConfirm
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
        <div className="flex flex-col md:flex-row min-h-[400px] px-4 gap-4">
          
          {/* Container Trái - Conversation Section */}
          <div className="flex-1 order-2 md:order-1 flex justify-center items-center pt-8">
            <ConversationSection
              ref={conversationRef}
              showConversation={showConversation}
              onClose={handleCallEnd}
              className="w-[85%] z-20"
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
          
          {/* Container Phải - Trống tạm thời */}
          <div className="flex-1 order-3 hidden md:flex justify-center items-center pt-8">
            {/* Để trống tạm thời - có thể thêm features sau */}
            <div className="w-[85%] h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Future Features
            </div>
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
