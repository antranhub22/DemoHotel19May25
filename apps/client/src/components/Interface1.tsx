// Interface1 component - Multi-tenant version v2.0.0 - Enhanced Design System

// React Context & Configuration
import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';

// Custom Hooks
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { useConversationState } from '@/hooks/useConversationState';

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
  const { micLevel } = useAssistant();
  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();
  
  // Custom hooks for behavior management
  const {
    showScrollButton,
    scrollToTop,
    scrollToSection,
    heroSectionRef,
    serviceGridRef,
    conversationRef
  } = useScrollBehavior({ isActive });
  
  const {
    isCallStarted,
    showConversation,
    handleCallStart,
    handleCallEnd
  } = useConversationState({ conversationRef });

  // Early returns
  if (configLoading || !hotelConfig) {
    return <LoadingState />;
  }

  if (configError) {
    return <ErrorState error={configError} />;
  }

  return (
    <InterfaceContainer>
      {/* Hero Section */}
      <div ref={heroSectionRef}>
        <InterfaceHeader />
        <SiriButtonContainer
          isCallStarted={isCallStarted}
          micLevel={micLevel}
          onCallStart={async (lang) => {
            await handleCallStart(lang);
          }}
          onCallEnd={handleCallEnd}
        />
      </div>

      {/* Service Categories Section */}
      <ServiceGridContainer ref={serviceGridRef} />

      {/* Conversation Section */}
      <ConversationSection
        ref={conversationRef}
        showConversation={showConversation}
        onClose={handleCallEnd}
      />

      {/* Scroll Controls */}
      <ScrollToTopButton
        show={showScrollButton}
        onScrollToTop={scrollToTop}
        onScrollToServices={() => scrollToSection('services')}
      />
    </InterfaceContainer>
  );
};
