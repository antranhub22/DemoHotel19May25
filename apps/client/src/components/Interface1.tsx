// Interface1 component - Multi-tenant version v2.0.0 - Enhanced Design System
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import hotelImage from '@/assets/hotel-exterior.jpeg';
import { t } from '@/i18n';
import { ActiveOrder } from '@/types';
import { initVapi, getVapiInstance, resetVapi } from '@/lib/vapiClient';
import { FaGlobeAsia } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import SiriCallButton from './SiriCallButton';
import RealtimeConversationPopup from './RealtimeConversationPopup';
import { Button } from '@/components/ui/button';
import ReferencePopup from './ReferencePopup';
import Interface3 from './Interface3';
import { parseSummaryToOrderDetails } from '@/lib/summaryParser';
import { useHotelConfiguration, getVapiPublicKeyByLanguage, getVapiAssistantIdByLanguage } from '@/hooks/useHotelConfiguration';

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

  // --- MEMOIZED VALUES ---
  const currentTime = useMemo(() => new Date(), []);

  // Enhanced Design System Constants
  const designSystem = {
    colors: {
      primary: '#1B4E8B',      // New modern blue-purple
      secondary: '#3B82F6',    // Complementary blue
      accent: '#8B5CF6',       // Purple accent
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
        className="relative w-full h-full overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${designSystem.colors.primary}DD, ${designSystem.colors.secondary}AA), url(${hotelImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: designSystem.fonts.primary
        }}
      >
        {/* Header with time and date */}
        <div 
          className="absolute left-0 right-0 flex justify-between items-center text-white z-20"
          style={{ top: designSystem.spacing.md, padding: `0 ${designSystem.spacing.md}` }}
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

        {/* Main content area */}
        <div className="flex flex-col items-center justify-center w-full">
          <h1 
            className="text-4xl md:text-5xl font-bold text-white text-center mb-4"
            style={{ 
              fontFamily: designSystem.fonts.primary,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              marginTop: '2rem'
            }}
          >
            Speak Multiple Languages With Our AI Voice Assistant
          </h1>

          {/* Siri Button Container */}
          <div style={{ 
            marginBottom: designSystem.spacing.xl,
            marginTop: '1rem',
            width: '357.5px',
            height: '357.5px',
            position: 'relative',
            zIndex: 10
          }}>
            <div 
              style={{ 
                borderRadius: '50%',
                boxShadow: designSystem.shadows.large,
                background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
          </div>
          
          {/* Service Categories Grid - Adjusted to 2 rows */}
          <div 
            className="grid w-full max-w-7xl mx-auto"
            style={{ 
              gridTemplateColumns: 'repeat(5, minmax(400px, 1fr))', // Increased minimum width from 200px to 400px
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: designSystem.spacing.lg,
              padding: `${designSystem.spacing.xl} ${designSystem.spacing.lg}`,
              transformOrigin: 'center center',
              marginTop: '-1rem',
              paddingBottom: '4rem',
              position: 'relative',
              left: '50%',
              transform: 'translateX(-50%) scale(0.4)', // Keep scale at 0.4
              width: '200%',
              maxWidth: 'none',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto'
            }}
          >
            {/* Service items with adjusted text styling */}
            {/* Local Tourism Info */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px', // Doubled from 200px
                width: '100%' // Take full width of grid cell
              }}
              onClick={() => handleIconClick('tourism')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>🏖️</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Local Tourism Info
              </h3>
              {activeTooltip === 'tourism' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('tourism_tooltip', language)}
                </div>
              )}
            </div>

            {/* Room Service - with same styling pattern */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('room_service')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>🍽️</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Room Service
              </h3>
              {activeTooltip === 'room_service' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('room_service_tooltip', language)}
                </div>
              )}
            </div>

            {/* Housekeeping */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('housekeeping')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>🧹</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Housekeeping
              </h3>
              {activeTooltip === 'housekeeping' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('housekeeping_tooltip', language)}
                </div>
              )}
            </div>

            {/* Guest Feedback */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('feedback')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>📝</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Guest Feedback
              </h3>
              {activeTooltip === 'feedback' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('feedback_tooltip', language)}
                </div>
              )}
            </div>

            {/* Local Souvenir */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('souvenir')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>🎁</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {t('local_souvenir', language)}
              </h3>
              {activeTooltip === 'souvenir' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('souvenir_tooltip', language)}
                </div>
              )}
            </div>

            {/* Tours */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('tours')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>🚌</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {t('tours', language)}
              </h3>
              {activeTooltip === 'tours' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('tours_tooltip', language)}
                </div>
              )}
            </div>

            {/* Bus Tickets */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('bus_tickets')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>🎫</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {t('bus_tickets', language)}
              </h3>
              {activeTooltip === 'bus_tickets' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('bus_tickets_tooltip', language)}
                </div>
              )}
            </div>

            {/* Vehicle Rental */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('vehicle_rental')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>🏍️</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {t('vehicle_rental', language)}
              </h3>
              {activeTooltip === 'vehicle_rental' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('vehicle_rental_tooltip', language)}
                </div>
              )}
            </div>

            {/* Currency Exchange */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('currency_exchange')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>💱</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {t('currency_exchange', language)}
              </h3>
              {activeTooltip === 'currency_exchange' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('currency_exchange_tooltip', language)}
                </div>
              )}
            </div>

            {/* Laundry Service */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('laundry')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>👕</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Laundry Service
              </h3>
              {activeTooltip === 'laundry' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('laundry_tooltip', language)}
                </div>
              )}
            </div>

            {/* Wake-up Call */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('wake_up')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>⏰</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Wake-up Call
              </h3>
              {activeTooltip === 'wake_up' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('wake_up_tooltip', language)}
                </div>
              )}
            </div>

            {/* HomeStay */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('homestay')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>🏠</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Homestay Service
              </h3>
              {activeTooltip === 'homestay' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('homestay_tooltip', language)}
                </div>
              )}
            </div>

            {/* Restaurant */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('restaurant')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>🍴</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Restaurant Service
              </h3>
              {activeTooltip === 'restaurant' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('restaurant_tooltip', language)}
                </div>
              )}
            </div>

            {/* Spa */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('spa')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>💆</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Spa Service
              </h3>
              {activeTooltip === 'spa' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('spa_tooltip', language)}
                </div>
              )}
            </div>

            {/* Transportation */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: `${designSystem.spacing.md} ${designSystem.spacing.sm}`,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px' // Doubled from 200px
              }}
              onClick={() => handleIconClick('transportation')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ 
                fontSize: '4rem', // Increased from 3rem
                marginBottom: designSystem.spacing.md, // Increased spacing
                height: '120px', // Doubled from 60px
                display: 'flex',
                alignItems: 'center'
              }}>🚗</div>
              <h3 
                className="text-white font-semibold px-4" // Increased padding
                style={{ 
                  fontSize: '24px', // Increased from 16px
                  lineHeight: '1.2',
                  wordWrap: 'break-word',
                  width: '100%',
                  height: '60px', // Increased from 40px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Transportation Service
              </h3>
              {activeTooltip === 'transportation' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {t('transportation_tooltip', language)}
                </div>
              )}
            </div>
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
      </div>
    </div>
  );
};

export default Interface1;
