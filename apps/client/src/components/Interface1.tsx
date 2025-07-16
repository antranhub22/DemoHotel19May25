// Interface1 component - Multi-tenant version v2.0.0 - Enhanced Design System
import React, { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useCallHandler } from '@/hooks/useCallHandler';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { LoadingState } from './interface1/LoadingState';
import { ErrorState } from './interface1/ErrorState';
import { ServiceGrid } from './interface1/ServiceGrid';
import { SiriButtonContainer } from './interface1/SiriButtonContainer';
import RealtimeConversationPopup from './RealtimeConversationPopup';
import { Interface1Props } from '@/types/interface1.types';
import { designSystem } from '@/styles/designSystem';

const Interface1: React.FC<Interface1Props> = ({ isActive = true }) => {
  // Hooks
  const { language } = useAssistant();
  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();
  const { handleCall } = useCallHandler();
  const { showScrollButton, scrollToTop } = useScrollBehavior();

  // Local state
  const [micLevel, setMicLevel] = useState(0);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  // Effects
  useEffect(() => {
    if (showConversation) {
      scrollToTop();
    }
  }, [showConversation]);

  useEffect(() => {
    if (!isActive) {
      scrollToTop();
    }
  }, [isActive]);

  // Early returns
  if (configLoading || !hotelConfig) {
    return <LoadingState />;
  }

  if (configError) {
    return <ErrorState error={configError} />;
  }

  return (
    <div 
      className="relative min-h-screen w-full overflow-x-hidden scroll-smooth"
      style={{
        fontFamily: designSystem.fonts.primary,
        minHeight: 'calc(100vh - 64px)',
        marginTop: '64px',
        overflowX: 'hidden',
        backgroundColor: '#2C3E50',
        scrollBehavior: 'smooth'
      }}
    >
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Main Content */}
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
                } else if (result.error) {
                  alert(result.error);
                }
              });
            }}
            onCallEnd={() => {
              setIsCallStarted(false);
              setShowConversation(false);
            }}
          />

          {/* Service Categories Grid */}
          <ServiceGrid />

          {/* Conversation Popup */}
          {showConversation && (
            <RealtimeConversationPopup
              isOpen={showConversation}
              onClose={() => setShowConversation(false)}
              isRight={true}
            />
          )}
        </div>

        {/* Scroll to top button */}
        {showScrollButton && (
          <button
            className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-full shadow-lg transition-opacity duration-300 hover:bg-white/20 md:hidden"
            onClick={scrollToTop}
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
    </div>
  );
};

export default Interface1;
