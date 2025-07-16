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
      {/* Hero Section with Siri Button and Conversation */}
      <div ref={heroSectionRef} className="relative">
        <InterfaceHeader />
        
        {/* Main content area with Siri Button centered and Conversation responsive */}
        <div className="relative flex items-start justify-center min-h-[400px] px-4">
          {/* Conversation Section - positioned responsively */}
          <ConversationSection
            ref={conversationRef}
            showConversation={showConversation}
            onClose={handleCallEnd}
            className="absolute md:left-4 md:top-0 top-full left-1/2 md:transform-none transform -translate-x-1/2 z-20"
          />
          
          {/* Siri Button Container - centered */}
          <div className="flex flex-col items-center">
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
