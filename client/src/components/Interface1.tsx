// Interface1 component - Multi-tenant version v2.0.0
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import hotelImage from '../assets/hotel-exterior.jpeg';
import { t } from '../i18n';
import { ActiveOrder } from '@/types';
import { initVapi, getVapiInstance } from '@/lib/vapiClient';
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
  // --- HOOKS DECLARATIONS ---
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
    if (!hotelConfig) {
      console.error('Hotel configuration not loaded');
      return;
    }

    console.log('[DEBUG] Starting call with language:', lang);
    console.log('[DEBUG] Hotel config:', hotelConfig);

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
    
    console.log('[DEBUG] Vapi configuration:', { publicKey, assistantId, lang });
    
    if (!publicKey || !assistantId) {
      console.error('Vapi configuration not available for language:', lang);
      return;
    }
    
    try {
      console.log('[DEBUG] Initializing Vapi with public key:', publicKey);
      const vapi = await initVapi(publicKey);
      if (vapi && assistantId) {
        console.log('[DEBUG] Starting Vapi call with assistant ID:', assistantId);
        await vapi.start(assistantId);
        setIsCallStarted(true);
        setShowConversation(true);
        console.log('[DEBUG] Vapi call started successfully');
      }
    } catch (error) {
      console.error('[DEBUG] Error starting Vapi call:', error);
    }
  }, [hotelConfig, setEmailSentForCurrentSession, setCallDetails, setTranscripts, setModelOutput, setCallDuration]);

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
      {/* Your existing JSX */}
    </div>
  );
};

export default Interface1;
