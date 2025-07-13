// Interface1 component - Multi-tenant version v2.0.0
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import hotelImage from '../assets/hotel-exterior.jpeg';
import { t } from '../i18n';
import { ActiveOrder, CallDetails } from '@/types';
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
  // --- ALL HOOKS DECLARATIONS FIRST ---
  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();
  
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

  // Local state hooks
  const [isMuted, setIsMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [showOrderCard, setShowOrderCard] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  
  // Memoized values
  const currentTime = useMemo(() => new Date(), []);

  // --- LOADING AND ERROR HANDLING ---
  if (configLoading) {
    return (
      <div className="absolute w-full min-h-screen h-full flex items-center justify-center z-10 bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading hotel configuration...</p>
        </div>
      </div>
    );
  }

  if (configError || !hotelConfig) {
    return (
      <div className="absolute w-full min-h-screen h-full flex items-center justify-center z-10 bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Failed to load hotel configuration</div>
          <p className="text-gray-600">{configError || 'Configuration not available'}</p>
        </div>
      </div>
    );
  }

  // --- EVENT HANDLERS AND CALLBACKS ---
  const handleStartCall = useCallback(async () => {
    try {
      setIsCallStarted(true);
      setCurrentInterface('interface2');
      
      // Reset all states
      setTranscripts([]);
      setModelOutput([]);
      
      // Create new call details
      const newCallDetails: CallDetails = {
        id: `call-${Date.now()}`,
        roomNumber: '',
        duration: '',
        category: '',
        language: language
      };
      
      setCallDetails(newCallDetails);
      setCallDuration(0);
      setEmailSentForCurrentSession(false);
      setShowConversation(true);
      
    } catch (error) {
      console.error('Error starting call:', error);
      setIsCallStarted(false);
      setShowConversation(false);
    }
  }, [language, setCallDetails, setCallDuration, setCurrentInterface, setEmailSentForCurrentSession, setModelOutput, setTranscripts]);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage as any);
    resetVapi();
  }, [setLanguage]);

  // --- EFFECTS ---
  useEffect(() => {
    if (!isActive) {
      setShowOrderCard(false);
      setActiveTooltip(null);
    }
  }, [isActive]);

  useEffect(() => {
    const setupVapi = async () => {
      try {
        const publicKey = getVapiPublicKeyByLanguage(language, hotelConfig);
        if (!publicKey) {
          console.error('No Vapi public key available for language:', language);
          return;
        }
        await initVapi(publicKey);
      } catch (error) {
        console.error('Error initializing Vapi:', error);
      }
    };
    
    if (isActive) {
      setupVapi();
    }
    
    return () => {
      if (isActive) {
        resetVapi();
      }
    };
  }, [isActive, language, hotelConfig]);

  // --- RENDER ---
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 w-full h-full bg-white transition-opacity duration-500">
      {/* Header */}
      <header className="w-full bg-primary text-white p-4 shadow-md" style={{ backgroundColor: hotelConfig.branding.colors.primary }}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={hotelConfig.logoUrl} alt={hotelConfig.hotelName} className="h-8 w-auto" />
            <h1 className="text-xl font-semibold">{hotelConfig.headerText}</h1>
          </div>
          
          {/* Language Selector */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-white hover:bg-white/20"
              onClick={() => setActiveTooltip(activeTooltip === 'language' ? null : 'language')}
            >
              <FaGlobeAsia className="h-5 w-5" />
              <span className="uppercase">{language}</span>
              <FiChevronDown className={`h-4 w-4 transition-transform ${activeTooltip === 'language' ? 'rotate-180' : ''}`} />
            </Button>
            
            {activeTooltip === 'language' && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  {hotelConfig.supportedLanguages.map((lang) => (
                    <button
                      key={lang}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        language === lang ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } hover:bg-gray-100`}
                      onClick={() => {
                        handleLanguageChange(lang);
                        setActiveTooltip(null);
                      }}
                    >
                      {t(`languages.${lang}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('welcome.title')}</h2>
            <p className="text-lg text-gray-600">{t('welcome.description')}</p>
          </div>

          {/* Call Button */}
          <div className="flex justify-center mb-12">
            <SiriCallButton
              containerId="siri-container"
              isListening={isCallStarted}
              volumeLevel={micLevel}
              onCallStart={handleStartCall}
              onCallEnd={() => {
                setIsCallStarted(false);
                setShowConversation(false);
              }}
            />
          </div>

          {/* Service Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelConfig.services.map((service) => (
              <div
                key={service.type}
                className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="text-xl font-semibold mb-2">{t(`services.${service.type}.title`)}</h3>
                <p className="text-gray-600">{t(`services.${service.type}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Conversation Popup */}
      {showConversation && (
        <RealtimeConversationPopup 
          isOpen={showConversation} 
          onClose={() => setShowConversation(false)}
          isRight={true}
        />
      )}

      {/* Reference Popup */}
      <ReferencePopup 
        isOpen={false}
        onClose={() => {}}
      />
    </div>
  );
};

export default Interface1;
