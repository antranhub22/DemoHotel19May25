// Interface1 component - Multi-tenant version v2.0.0 - Enhanced Design System
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import hotelImage from '@/assets/hotel-exterior.jpeg';
import styles from './Interface1.module.css';
import { t } from '@/i18n';
import { ActiveOrder } from '@/types';
import { initVapi, getVapiInstance, resetVapi } from '@/lib/vapiClient';
import { FaGlobeAsia, FaBed, FaUtensils, FaConciergeBell, FaSwimmingPool, FaSpa, FaGlassMartini, FaTaxi, FaMapMarkedAlt, FaPhoneAlt } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import SiriCallButton from './SiriCallButton';
import RealtimeConversationPopup from './RealtimeConversationPopup';
import { Button } from '@/components/ui/button';
import ReferencePopup from './ReferencePopup';
import Interface3 from './Interface3';
import { parseSummaryToOrderDetails } from '@/lib/summaryParser';
import { useHotelConfiguration, getVapiPublicKeyByLanguage, getVapiAssistantIdByLanguage } from '@/hooks/useHotelConfiguration';

// Service Categories Definition
const serviceCategories = [
  { name: 'Room Service', icon: <FaBed /> },
  { name: 'Restaurant', icon: <FaUtensils /> },
  { name: 'Concierge', icon: <FaConciergeBell /> },
  { name: 'Pool & Gym', icon: <FaSwimmingPool /> },
  { name: 'Spa & Wellness', icon: <FaSpa /> },
  { name: 'Bar & Lounge', icon: <FaGlassMartini /> },
  { name: 'Transportation', icon: <FaTaxi /> },
  { name: 'Local Guide', icon: <FaMapMarkedAlt /> },
  { name: 'Reception', icon: <FaPhoneAlt /> },
  { name: 'Guest Services', icon: <FaConciergeBell /> }
];

interface Interface1Props {
  isActive?: boolean;
}

const Interface1: React.FC<Interface1Props> = ({ isActive = true }) => {
  // --- ALL HOOKS MUST BE DECLARED FIRST ---
  const { 
    setCurrentInterface, 
    setTranscripts, 
    setModelOutput, 
    setCallDetails, 
    setCallDuration, 
    setEmailSentForCurrentSession,
    language,
    setLanguage
  } = useAssistant();

  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();

  // Local state hooks
  const [isMuted, setIsMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [showOrderCard, setShowOrderCard] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  // Add scroll to top button visibility state
  const [showScrollButton, setShowScrollButton] = useState(false);

  // --- MEMOIZED VALUES ---
  // Removed unused time memo
  // const currentTime = useMemo(() => new Date(), []);

  // Enhanced Design System Constants
  const designSystem = {
    colors: {
      primary: '#1B4E8B',      // Restored to original blue-purple
      secondary: '#3B82F6',    // Restored to original complementary blue
      accent: '#8B5CF6',       // Restored to original purple accent
      surface: 'rgba(255, 255, 255, 0.1)',
      surfaceHover: 'rgba(255, 255, 255, 0.2)',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.9)'
    },
    fonts: {
      primary: "'Inter', 'Poppins', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    spacing: {
      xs: '8px',    // 8px grid base
      sm: '16px',   // 2 * 8px
      md: '24px',   // 3 * 8px
      lg: '32px',   // 4 * 8px
      xl: '40px',   // 5 * 8px
      '2xl': '48px' // 6 * 8px
    },
    shadows: {
      subtle: '0 2px 8px rgba(0, 0, 0, 0.1)',
      card: '0 4px 16px rgba(0, 0, 0, 0.15)',
      button: '0 2px 12px rgba(27, 78, 139, 0.3)',
      large: '0 8px 32px rgba(0, 0, 0, 0.2)'
    }
  };

  // --- CALLBACKS ---
  const handleCall = useCallback(async (lang: 'en' | 'fr' | 'zh' | 'ru' | 'ko' | 'vi') => {
    console.log('[Interface1] handleCall called with language:', lang);
    
    if (!hotelConfig) {
      console.error('[Interface1] Hotel configuration not loaded');
      return;
    }

    console.log('[Interface1] Starting call with language:', lang);
    console.log('[Interface1] Hotel config:', hotelConfig);

    setEmailSentForCurrentSession(false);
    setCallDetails({
      id: `call-${Date.now()}`,
      roomNumber: '',
      duration: '',
      category: '',
      language: 'en'
    });
    setTranscripts([]);
    setModelOutput([]);
    setCallDuration(0);
    
    const publicKey = getVapiPublicKeyByLanguage(lang, hotelConfig);
    const assistantId = getVapiAssistantIdByLanguage(lang, hotelConfig);
    
    console.log('[Interface1] Vapi configuration:', { publicKey, assistantId, lang });
    
    // Development mode: Skip Vapi validation and directly switch interface for testing
    const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
    if ((!publicKey || !assistantId) && isDevelopment) {
      console.warn('[Interface1] DEVELOPMENT MODE: Vapi keys missing, skipping call but switching interface for testing');
      setIsCallStarted(true);
      setShowConversation(true);
      setCurrentInterface('interface2');
      return;
    }
    
    if (!publicKey || !assistantId) {
      console.error('[Interface1] Vapi configuration not available for language:', lang);
      alert(`Vapi configuration not available for language: ${lang}`);
      return;
    }
    
    try {
      console.log('[Interface1] Initializing Vapi with public key:', publicKey);
      setLanguage(lang); // Set language before starting call
      
      const vapi = await initVapi(publicKey);
      if (vapi && assistantId) {
        console.log('[Interface1] Starting Vapi call with assistant ID:', assistantId);
        
        // Set call started state immediately
        setIsCallStarted(true);
        setShowConversation(true);
        
        await vapi.start(assistantId);
        console.log('[Interface1] Vapi call started successfully');
        
        // Chuyển sang Interface2 ngay sau khi call thành công
        console.log('[Interface1] 🔄 CALLING setCurrentInterface("interface2")');
        setCurrentInterface('interface2');
        console.log('[Interface1] ✅ setCurrentInterface("interface2") called');
        
        // Force re-render để đảm bảo chuyển interface
        setTimeout(() => {
          console.log('[Interface1] 🔄 DELAYED setCurrentInterface("interface2") as fallback');
          setCurrentInterface('interface2');
        }, 100);
      } else {
        console.error('[Interface1] Failed to get Vapi instance or assistant ID');
        setIsCallStarted(false);
        setShowConversation(false);
      }
    } catch (error) {
      console.error('[Interface1] Error starting Vapi call:', error);
      setIsCallStarted(false);
      setShowConversation(false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error starting call: ${errorMessage}`);
    }
  }, [hotelConfig, setEmailSentForCurrentSession, setCallDetails, setTranscripts, setModelOutput, setCallDuration, setLanguage, setCurrentInterface]);

  const handleIconClick = useCallback((iconName: string) => {
    setActiveTooltip(activeTooltip === iconName ? null : iconName);
    
    if (activeTooltip !== iconName) {
      setTimeout(() => {
        setActiveTooltip(currentTooltip => currentTooltip === iconName ? null : currentTooltip);
      }, 3000);
    }
  }, [activeTooltip]);

  // --- EFFECTS ---
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isActive) {
      console.log('Interface1 is active, starting local timer');
      setLocalDuration(0);
      timer = setInterval(() => {
        setLocalDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) {
        console.log('Cleaning up local timer in Interface1');
        clearInterval(timer);
      }
    };
  }, [isActive]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.pageYOffset > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- EARLY RETURNS AFTER ALL HOOKS ---
  // Loading state
  if (configLoading || !hotelConfig) {
    return (
      <div 
        className="absolute w-full min-h-screen h-full flex items-center justify-center z-10"
        style={{ 
          background: `linear-gradient(135deg, ${designSystem.colors.primary}, ${designSystem.colors.secondary})`,
          fontFamily: designSystem.fonts.primary
        }}
      >
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl" style={{ boxShadow: designSystem.shadows.card }}>
          <div 
            className="animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto mb-6"
            style={{ width: '64px', height: '64px' }}
          ></div>
          <p className="text-white text-lg font-medium">Loading hotel configuration...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (configError) {
    return (
      <div 
        className="absolute w-full min-h-screen h-full flex items-center justify-center z-10"
        style={{ 
          background: `linear-gradient(135deg, ${designSystem.colors.primary}, #EF4444)`,
          fontFamily: designSystem.fonts.primary
        }}
      >
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl" style={{ boxShadow: designSystem.shadows.card }}>
          <div className="text-white text-xl font-semibold mb-4">Failed to load hotel configuration</div>
          <p className="text-white/80">{configError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute w-full h-full transition-opacity duration-300 ${isActive ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
      {/* Main Interface Content */}
      <div 
        className={`relative w-full h-full overflow-y-auto overflow-x-hidden ${styles.scrollbarThin}`}
        style={{
          backgroundImage: `linear-gradient(135deg, ${designSystem.colors.primary}DD, ${designSystem.colors.secondary}AA), url(${hotelImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          fontFamily: designSystem.fonts.primary,
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth'
        }}
      >
        {/* Header with time and date - Fixed position on mobile */}
        {/* Removed time and date display
        <div 
          className="sticky top-0 left-0 right-0 flex justify-between items-center text-white z-20 bg-gradient-to-b from-black/50 to-transparent md:absolute md:bg-none"
          style={{ 
            padding: `${designSystem.spacing.md} ${designSystem.spacing.md}`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div className="text-left">
            <div 
              className="font-bold"
              style={{ 
                fontSize: '24px',
                textShadow: designSystem.shadows.subtle,
                marginBottom: designSystem.spacing.xs
              }}
            >
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </div>
            <div 
              className="opacity-90"
              style={{ 
                fontSize: '16px',
                textShadow: designSystem.shadows.subtle
              }}
            >
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
        */}

        {/* Main content area - Scrollable container */}
        <div className="flex flex-col items-center justify-start w-full min-h-screen pb-20 md:justify-center md:pb-0">
          <h1 
            className="text-4xl md:text-5xl font-bold text-white text-center mb-4 hidden md:block"
            style={{ 
              fontFamily: designSystem.fonts.primary,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              marginTop: '2rem',
              lineHeight: '1.4',
              maxWidth: '800px',
              margin: '2rem auto'
            }}
          >
            Speak Multiple Languages<br/>With Our AI Voice Assistant
          </h1>

          {/* Siri Button Container */}
          <div 
            className="flex flex-col items-center mt-32 md:mt-4"
            style={{ 
              marginBottom: designSystem.spacing.xl,
              width: '357.5px',
              height: '357.5px',
              position: 'relative',
              zIndex: 10
            }}
          >
            <div 
              style={{ 
                borderRadius: '50%',
                boxShadow: designSystem.shadows.large,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <SiriCallButton
                containerId="main-siri-button"
                isListening={isCallStarted}
                volumeLevel={micLevel}
                onCallStart={() => handleCall(language)}
                onCallEnd={() => {
                  setIsCallStarted(false);
                  setShowConversation(false);
                }}
              />
            </div>
            {/* Tap To Speak text - Only visible on mobile */}
            <div
              className="block md:hidden"
              style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: '500',
                marginTop: '1rem',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              Tap To Speak
            </div>
          </div>

          {/* Language Selector - Hidden on mobile */}
          <div 
            className="hidden md:flex items-center justify-center gap-4 mb-8"
            style={{
              padding: `${designSystem.spacing.md} ${designSystem.spacing.lg}`,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
              boxShadow: designSystem.shadows.subtle,
              marginBottom: designSystem.spacing.xl
            }}
          >
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${language === 'en' ? 'bg-white text-primary' : 'text-white hover:bg-white/10'}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${language === 'vi' ? 'bg-white text-primary' : 'text-white hover:bg-white/10'}`}
              onClick={() => setLanguage('vi')}
            >
              Tiếng Việt
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${language === 'fr' ? 'bg-white text-primary' : 'text-white hover:bg-white/10'}`}
              onClick={() => setLanguage('fr')}
            >
              Français
            </button>
          </div>

          {/* Service Categories Grid - Hidden on mobile */}
          <div 
            className="hidden md:grid w-full max-w-7xl mx-auto"
            style={{ 
              gridTemplateColumns: 'repeat(5, minmax(280px, 1fr))',
              gridTemplateRows: 'repeat(2, 180px)',
              gap: '24px',
              padding: '32px 24px',
              transformOrigin: 'top center',
              marginTop: '2rem',
              position: 'relative',
              left: '50%',
              transform: 'translateX(-50%) scale(0.65)',
              width: '180%',
              maxWidth: 'none',
              placeItems: 'center'
            }}
          >
            {serviceCategories.map((category, index) => (
              <div
                key={index}
                className="relative group"
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}
              >
                {/* Icon Container */}
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '12px',
                  transition: 'transform 0.3s ease',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {category.icon}
                </div>
                
                {/* Text Container */}
                <div style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: 'white',
                  textAlign: 'center',
                  lineHeight: '1.4',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 8px'
                }}>
                  {category.name}
                </div>
              </div>
            ))}
          </div>

          {/* Conversation Popup */}
          {showConversation && (
            <RealtimeConversationPopup
              isOpen={showConversation}
              onClose={() => setShowConversation(false)}
              isRight={true}
            />
          )}
        </div>

        {/* Scroll to top button - Only visible when scrolled */}
        {showScrollButton && (
          <button
            className={`fixed bottom-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-full shadow-lg transition-opacity duration-300 hover:bg-white/20 md:hidden ${styles.scrollToTopButton}`}
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }}
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
