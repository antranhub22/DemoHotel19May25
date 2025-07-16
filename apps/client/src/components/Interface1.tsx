// Interface1 component - Multi-tenant version v2.0.0 - Enhanced Design System
import { useEffect, useState, useRef } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { designSystem } from '@/styles/designSystem';
import { LoadingState } from './interface1/LoadingState';
import { ErrorState } from './interface1/ErrorState';
import { ServiceGrid } from './interface1/ServiceGrid';
import { SiriButtonContainer } from './siri/SiriButtonContainer';
import RealtimeConversationPopup from './RealtimeConversationPopup';
import { ScrollArea } from './ui/scroll-area';
import { Language } from '@/types/interface1.types';

interface Interface1Props {
  isActive: boolean;
}

export const Interface1 = ({ isActive }: Interface1Props): JSX.Element => {
  const { micLevel } = useAssistant();
  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  
  // Refs for scroll targets
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const serviceGridRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Enhanced scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollButton(scrollY > 300);
      
      // Auto-highlight sections based on scroll position
      const heroSection = heroSectionRef.current;
      const serviceSection = serviceGridRef.current;
      
      if (heroSection && serviceSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const serviceRect = serviceSection.getBoundingClientRect();
        
        // If service grid is partially visible, ensure it's fully visible
        if (serviceRect.top < window.innerHeight && serviceRect.bottom > 0) {
          if (serviceRect.top < 0 || serviceRect.bottom > window.innerHeight) {
            // Auto-adjust scroll to show service grid better
            const shouldScrollToService = serviceRect.top < -100;
            if (shouldScrollToService) {
              serviceSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
            }
          }
        }
      }
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  // Throttle function for performance
  const throttle = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    return (...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  };

  // Reset scroll position when interface becomes inactive
  useEffect(() => {
    if (!isActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isActive]);

  // Auto scroll to conversation when it appears
  useEffect(() => {
    if (showConversation && conversationRef.current) {
      setTimeout(() => {
        conversationRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }, 300); // Small delay to ensure DOM is updated
    }
  }, [showConversation]);

  // Scroll functions
  const scrollToSection = (section: 'hero' | 'services' | 'conversation') => {
    const refs = {
      hero: heroSectionRef,
      services: serviceGridRef,
      conversation: conversationRef
    };
    
    const targetRef = refs[section];
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: section === 'hero' ? 'start' : 'center',
        inline: 'nearest'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCall = async (lang: Language): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call handling logic here
      return { success: true };
    } catch (error) {
      console.error('Error in handleCall:', error);
      return { success: false, error: 'Failed to start call' };
    }
  };

  // Early returns
  if (configLoading || !hotelConfig) {
    return <LoadingState />;
  }

  if (configError) {
    return <ErrorState error={configError} />;
  }

  return (
    <div 
      className="relative min-h-screen w-full scroll-smooth overflow-y-auto"
      style={{
        fontFamily: designSystem.fonts.primary,
        backgroundColor: '#2C3E50',
      }}
    >
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12">
          {/* Hero Section */}
          <div ref={heroSectionRef} className="text-center space-y-8">
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
              onCallStart={async (lang) => {
                const result = await handleCall(lang);
                if (result.success) {
                  setIsCallStarted(true);
                  setShowConversation(true);
                }
              }}
              onCallEnd={() => {
                setIsCallStarted(false);
                setShowConversation(false);
              }}
            />
          </div>

          {/* Service Categories Section */}
          <div ref={serviceGridRef} className="w-full max-w-full">
            <ServiceGrid />
          </div>

          {/* Conversation Section */}
          {showConversation && (
            <div ref={conversationRef} className="w-full">
              <RealtimeConversationPopup
                isOpen={showConversation}
                onClose={() => setShowConversation(false)}
                isRight={true}
              />
            </div>
          )}
        </div>

        {/* Enhanced Scroll Controls */}
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
          {/* Scroll to Services button - visible when hero is not visible */}
          {showScrollButton && (
            <button
              className="bg-white/10 backdrop-blur-md p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-white/20"
              onClick={() => scrollToSection('services')}
              aria-label="Scroll to services"
              title="View Services"
            >
              <svg 
                className="w-5 h-5 text-white"
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          )}
          
          {/* Scroll to top button */}
          {showScrollButton && (
            <button
              className="bg-white/10 backdrop-blur-md p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-white/20"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              title="Back to Top"
            >
              <svg 
                className="w-5 h-5 text-white"
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
    </div>
  );
};
