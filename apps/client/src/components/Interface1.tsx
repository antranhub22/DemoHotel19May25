// Interface1 component - Multi-tenant version v2.0.0
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
      <div className="absolute w-full min-h-screen h-full flex items-center justify-center z-10 bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading hotel configuration...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (configError) {
    return (
      <div className="absolute w-full min-h-screen h-full flex items-center justify-center z-10 bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Failed to load hotel configuration</div>
          <p className="text-gray-600">{configError}</p>
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
          backgroundImage: `linear-gradient(${hotelConfig?.branding?.colors?.primary || '#1e40af'}CC, ${hotelConfig?.branding?.colors?.secondary || '#d4af37'}99), url(${hotelImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: hotelConfig.branding.fonts.primary + ', SF Pro Text, Roboto, Open Sans, Arial, sans-serif'
        }}
      >
        {/* Header with time and date */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white z-20">
          <div className="text-left">
            <div className="text-lg font-semibold">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </div>
            <div className="text-sm opacity-90">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center h-full p-4">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              {t('speak_multiple_languages', language)}
            </h1>
            <p className="text-xl text-white/90 mb-8" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              {t('tap_to_speak', language)}
            </p>
          </div>

          {/* Voice Assistant Button */}
          <div className="mb-12">
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
            
            {/* Test Button for debugging */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  console.log('[Interface1] Test button clicked!');
                  handleCall(language);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
              >
                Test Call ({language})
              </button>
              <button
                onClick={() => {
                  console.log('[Interface1] FORCE Interface2 clicked!');
                  setCurrentInterface('interface2');
                  console.log('[Interface1] setCurrentInterface("interface2") called directly');
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
              >
                FORCE Interface2
              </button>
              <button
                onClick={() => {
                  console.log('[Interface1] Reset Vapi clicked!');
                  resetVapi();
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Reset Vapi
              </button>
            </div>
          </div>

          {/* Service Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full max-w-6xl">
            {/* Local Tourism Info */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
                 onClick={() => handleIconClick('tourism')}>
              <div className="text-4xl mb-2">🏖️</div>
              <h3 className="text-white font-semibold text-sm">{t('local_tourism_info', language)}</h3>
              {activeTooltip === 'tourism' && (
                <div className="absolute z-50 mt-2 p-2 bg-black/80 text-white text-xs rounded max-w-xs">
                  {t('tourism_tooltip', language)}
                </div>
              )}
            </div>

            {/* Room Service */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
                 onClick={() => handleIconClick('room_service')}>
              <div className="text-4xl mb-2">🍽️</div>
              <h3 className="text-white font-semibold text-sm">{t('room_service', language)}</h3>
              {activeTooltip === 'room_service' && (
                <div className="absolute z-50 mt-2 p-2 bg-black/80 text-white text-xs rounded max-w-xs">
                  {t('room_service_tooltip', language)}
                </div>
              )}
            </div>

            {/* Housekeeping */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
                 onClick={() => handleIconClick('housekeeping')}>
              <div className="text-4xl mb-2">🧹</div>
              <h3 className="text-white font-semibold text-sm">{t('housekeeping', language)}</h3>
              {activeTooltip === 'housekeeping' && (
                <div className="absolute z-50 mt-2 p-2 bg-black/80 text-white text-xs rounded max-w-xs">
                  {t('housekeeping_tooltip', language)}
                </div>
              )}
            </div>

            {/* Guest Feedback */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
                 onClick={() => handleIconClick('feedback')}>
              <div className="text-4xl mb-2">💬</div>
              <h3 className="text-white font-semibold text-sm">{t('guest_feedback', language)}</h3>
              {activeTooltip === 'feedback' && (
                <div className="absolute z-50 mt-2 p-2 bg-black/80 text-white text-xs rounded max-w-xs">
                  {t('feedback_tooltip', language)}
                </div>
              )}
            </div>

            {/* Local Souvenir */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
                 onClick={() => handleIconClick('souvenir')}>
              <div className="text-4xl mb-2">🎁</div>
              <h3 className="text-white font-semibold text-sm">{t('local_souvenir', language)}</h3>
              {activeTooltip === 'souvenir' && (
                <div className="absolute z-50 mt-2 p-2 bg-black/80 text-white text-xs rounded max-w-xs">
                  {t('souvenir_tooltip', language)}
                </div>
              )}
            </div>

            {/* Tours */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
                 onClick={() => handleIconClick('tours')}>
              <div className="text-4xl mb-2">🚌</div>
              <h3 className="text-white font-semibold text-sm">{t('tours', language)}</h3>
              {activeTooltip === 'tours' && (
                <div className="absolute z-50 mt-2 p-2 bg-black/80 text-white text-xs rounded max-w-xs">
                  {t('tours_tooltip', language)}
                </div>
              )}
            </div>

            {/* Bus Tickets */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
                 onClick={() => handleIconClick('bus_tickets')}>
              <div className="text-4xl mb-2">🎫</div>
              <h3 className="text-white font-semibold text-sm">{t('bus_tickets', language)}</h3>
              {activeTooltip === 'bus_tickets' && (
                <div className="absolute z-50 mt-2 p-2 bg-black/80 text-white text-xs rounded max-w-xs">
                  {t('bus_tickets_tooltip', language)}
                </div>
              )}
            </div>

            {/* Vehicle Rental */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
                 onClick={() => handleIconClick('vehicle_rental')}>
              <div className="text-4xl mb-2">🏍️</div>
              <h3 className="text-white font-semibold text-sm">{t('vehicle_rental', language)}</h3>
              {activeTooltip === 'vehicle_rental' && (
                <div className="absolute z-50 mt-2 p-2 bg-black/80 text-white text-xs rounded max-w-xs">
                  {t('vehicle_rental_tooltip', language)}
                </div>
              )}
            </div>

            {/* Currency Exchange */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
                 onClick={() => handleIconClick('currency_exchange')}>
              <div className="text-4xl mb-2">💱</div>
              <h3 className="text-white font-semibold text-sm">{t('currency_exchange', language)}</h3>
              {activeTooltip === 'currency_exchange' && (
                <div className="absolute z-50 mt-2 p-2 bg-black/80 text-white text-xs rounded max-w-xs">
                  {t('currency_exchange_tooltip', language)}
                </div>
              )}
            </div>

            {/* Laundry Service */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
                 onClick={() => handleIconClick('laundry')}>
              <div className="text-4xl mb-2">👕</div>
              <h3 className="text-white font-semibold text-sm">{t('laundry_service', language)}</h3>
              {activeTooltip === 'laundry' && (
                <div className="absolute z-50 mt-2 p-2 bg-black/80 text-white text-xs rounded max-w-xs">
                  {t('laundry_tooltip', language)}
                </div>
              )}
            </div>

            {/* HomeStay */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
                 onClick={() => handleIconClick('homestay')}>
              <div className="text-4xl mb-2">🏠</div>
              <h3 className="text-white font-semibold text-sm">{t('homestay', language)}</h3>
              {activeTooltip === 'homestay' && (
                <div className="absolute z-50 mt-2 p-2 bg-black/80 text-white text-xs rounded max-w-xs">
                  {t('homestay_tooltip', language)}
                </div>
              )}
            </div>
          </div>

          {/* Language Selection Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['en', 'fr', 'zh', 'ru', 'ko', 'vi'].map(lang => (
              <button
                key={lang}
                onClick={() => handleCall(lang as 'en' | 'fr' | 'zh' | 'ru' | 'ko' | 'vi')}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold hover:bg-white/30 transition-all"
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
