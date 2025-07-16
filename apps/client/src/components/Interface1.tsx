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

        {/* Main Content */}
        <div 
          className="flex flex-col items-center justify-center h-full"
          style={{ 
            padding: designSystem.spacing.md,
            paddingTop: 'calc(64px + 2rem)', // Add extra padding for header
            minHeight: '100vh' // Ensure full height
          }}
        >
          {/* Title */}
          <div 
            className="text-center"
            style={{ 
              marginBottom: designSystem.spacing.xl,
              position: 'relative', // Add relative positioning
              zIndex: 10 // Ensure text is above other elements
            }}
          >
            <h1 
              className="font-bold text-white"
              style={{ 
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                textShadow: designSystem.shadows.large,
                marginBottom: designSystem.spacing.md,
                lineHeight: '1.1'
              }}
            >
              {t('speak_multiple_languages', language)}
            </h1>
            <p 
              className="text-white/90"
              style={{ 
                fontSize: '1.25rem',
                textShadow: designSystem.shadows.subtle,
                marginBottom: designSystem.spacing.xl
              }}
            >
              {t('tap_to_speak', language)}
            </p>
          </div>

          {/* Voice Assistant Button */}
          <div style={{ marginBottom: designSystem.spacing['2xl'] }}>
            <div 
              style={{ 
                borderRadius: '50%',
                boxShadow: designSystem.shadows.large,
                background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)'
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

          {/* Service Categories Grid */}
          <div 
            className="grid w-full max-w-7xl"
            style={{ 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: designSystem.spacing.md,
              marginBottom: designSystem.spacing.xl
            }}
          >
            {/* Local Tourism Info */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: designSystem.spacing.md,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => handleIconClick('tourism')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: designSystem.spacing.sm }}>🏖️</div>
              <h3 className="text-white font-semibold" style={{ fontSize: '14px' }}>{t('local_tourism_info', language)}</h3>
              {activeTooltip === 'tourism' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card
                  }}
                >
                  {t('tourism_tooltip', language)}
                </div>
              )}
            </div>

            {/* Room Service */}
            <div 
              className="text-center hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                background: designSystem.colors.surface,
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: designSystem.spacing.md,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => handleIconClick('room_service')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: designSystem.spacing.sm }}>🍽️</div>
              <h3 className="text-white font-semibold" style={{ fontSize: '14px' }}>{t('room_service', language)}</h3>
              {activeTooltip === 'room_service' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card
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
                padding: designSystem.spacing.md,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => handleIconClick('housekeeping')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: designSystem.spacing.sm }}>🧹</div>
              <h3 className="text-white font-semibold" style={{ fontSize: '14px' }}>{t('housekeeping', language)}</h3>
              {activeTooltip === 'housekeeping' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card
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
                padding: designSystem.spacing.md,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => handleIconClick('feedback')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: designSystem.spacing.sm }}>💬</div>
              <h3 className="text-white font-semibold" style={{ fontSize: '14px' }}>{t('guest_feedback', language)}</h3>
              {activeTooltip === 'feedback' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card
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
                padding: designSystem.spacing.md,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => handleIconClick('souvenir')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: designSystem.spacing.sm }}>🎁</div>
              <h3 className="text-white font-semibold" style={{ fontSize: '14px' }}>{t('local_souvenir', language)}</h3>
              {activeTooltip === 'souvenir' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card
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
                padding: designSystem.spacing.md,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => handleIconClick('tours')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: designSystem.spacing.sm }}>🚌</div>
              <h3 className="text-white font-semibold" style={{ fontSize: '14px' }}>{t('tours', language)}</h3>
              {activeTooltip === 'tours' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card
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
                padding: designSystem.spacing.md,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => handleIconClick('bus_tickets')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: designSystem.spacing.sm }}>🎫</div>
              <h3 className="text-white font-semibold" style={{ fontSize: '14px' }}>{t('bus_tickets', language)}</h3>
              {activeTooltip === 'bus_tickets' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card
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
                padding: designSystem.spacing.md,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => handleIconClick('vehicle_rental')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: designSystem.spacing.sm }}>🏍️</div>
              <h3 className="text-white font-semibold" style={{ fontSize: '14px' }}>{t('vehicle_rental', language)}</h3>
              {activeTooltip === 'vehicle_rental' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card
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
                padding: designSystem.spacing.md,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => handleIconClick('currency_exchange')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: designSystem.spacing.sm }}>💱</div>
              <h3 className="text-white font-semibold" style={{ fontSize: '14px' }}>{t('currency_exchange', language)}</h3>
              {activeTooltip === 'currency_exchange' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card
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
                padding: designSystem.spacing.md,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => handleIconClick('laundry')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: designSystem.spacing.sm }}>👕</div>
              <h3 className="text-white font-semibold" style={{ fontSize: '14px' }}>{t('laundry_service', language)}</h3>
              {activeTooltip === 'laundry' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card
                  }}
                >
                  {t('laundry_tooltip', language)}
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
                padding: designSystem.spacing.md,
                boxShadow: designSystem.shadows.card,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => handleIconClick('homestay')}
              onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: designSystem.spacing.sm }}>🏠</div>
              <h3 className="text-white font-semibold" style={{ fontSize: '14px' }}>{t('homestay', language)}</h3>
              {activeTooltip === 'homestay' && (
                <div 
                  className="absolute z-50 p-3 text-white text-xs rounded-lg max-w-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    marginTop: designSystem.spacing.xs,
                    boxShadow: designSystem.shadows.card
                  }}
                >
                  {t('homestay_tooltip', language)}
                </div>
              )}
            </div>
          </div>

          {/* Language Selection Buttons */}
          <div 
            className="flex flex-wrap justify-center"
            style={{ gap: designSystem.spacing.sm }}
          >
            {['en', 'fr', 'zh', 'ru', 'ko', 'vi'].map(lang => (
              <button
                key={lang}
                onClick={() => handleCall(lang as 'en' | 'fr' | 'zh' | 'ru' | 'ko' | 'vi')}
                className="text-white font-semibold hover:scale-105 transition-all duration-200"
                style={{
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                  background: designSystem.colors.surface,
                  backdropFilter: 'blur(12px)',
                  borderRadius: '24px',
                  boxShadow: designSystem.shadows.button,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = designSystem.colors.surfaceHover}
                onMouseLeave={(e) => e.currentTarget.style.background = designSystem.colors.surface}
              >
                {lang === 'en' && '🇬🇧 English'}
                {lang === 'fr' && '🇫🇷 Français'}
                {lang === 'zh' && '🇨🇳 中文'}
                {lang === 'ru' && '🇷🇺 Русский'}
                {lang === 'ko' && '🇰🇷 한국어'}
                {lang === 'vi' && '🇻🇳 Tiếng Việt'}
              </button>
            ))}
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
  );
};

export default Interface1;
