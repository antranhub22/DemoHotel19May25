// Interface1 component - Multi-tenant version v2.0.0 - Enhanced Design System
import { useEffect, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { designSystem } from '@/styles/designSystem';
import { LoadingState } from './interface1/LoadingState';
import { ErrorState } from './interface1/ErrorState';
import { ServiceGrid } from './interface1/ServiceGrid';
import { SiriButtonContainer } from './interface1/SiriButtonContainer';
import RealtimeConversationPopup from './RealtimeConversationPopup';
import { ScrollArea } from './ui/scroll-area';

interface Interface1Props {
  isActive: boolean;
}

export const Interface1 = ({ isActive }: Interface1Props): JSX.Element => {
  const { micLevel } = useAssistant();
  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollButton(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll position when interface becomes inactive
  useEffect(() => {
    if (!isActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isActive]);

  // Auto scroll to conversation when it appears
  useEffect(() => {
    if (showConversation) {
      const conversationElement = document.getElementById('conversation-popup');
      if (conversationElement) {
        conversationElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [showConversation]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCall = async (lang: string) => {
    // Call handling logic here
    return { success: true };
  };

  // Early returns
  if (configLoading || !hotelConfig) {
    return <LoadingState />;
  }

  if (configError) {
    return <ErrorState error={configError} />;
  }

  return (
    <ScrollArea 
      className="relative min-h-screen w-full scroll-smooth"
      style={{
        fontFamily: designSystem.fonts.primary,
        minHeight: 'calc(100vh - 64px)',
        marginTop: '64px',
        backgroundColor: '#2C3E50',
      }}
    >
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12">
          {/* Title - Hidden on mobile */}
          <h1 
            className="hidden md:block text-4xl md:text-5xl font-bold text-center text-white mb-8"
            style={{ 
              textShadow: designSystem.shadows.subtle,
              maxWidth: '800px',
              lineHeight: 1.2
            }}
          >
            Speak in Multiple Languages
          </h1>

          {/* Siri Button */}
          <SiriButtonContainer
            isCallStarted={isCallStarted}
            micLevel={micLevel}
            onCallStart={(lang) => {
              handleCall(lang).then(result => {
                if (result.success) {
                  setIsCallStarted(true);
                  setShowConversation(true);
                }
              });
            }}
            onCallEnd={() => {
              setIsCallStarted(false);
              setShowConversation(false);
            }}
          />

          {/* Service Categories Grid with ScrollArea */}
          <ScrollArea className="w-full max-h-[60vh] md:max-h-[70vh] px-4">
            <ServiceGrid />
          </ScrollArea>

          {/* Conversation Popup */}
          {showConversation && (
            <div id="conversation-popup" className="w-full">
              <RealtimeConversationPopup
                isOpen={showConversation}
                onClose={() => setShowConversation(false)}
                isRight={true}
              />
            </div>
          )}
        </div>

        {/* Scroll to top button - Visible on all screen sizes when scrolled */}
        {showScrollButton && (
          <button
            className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-white/20 z-50"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <svg 
              className="w-6 h-6 text-white"
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>
          </button>
        )}
      </div>
    </ScrollArea>
  );
};
