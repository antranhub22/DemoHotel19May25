import { useState, useEffect, useMemo } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import Interface1 from './Interface1';
import Interface2 from './Interface2';
import Interface3 from './Interface3';
import Interface4 from './Interface4';
import { Link } from 'wouter';
import { History, Info, X, AlertCircle } from 'lucide-react';
import InfographicSteps from './InfographicSteps';
import { FaGlobeAsia } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import { t } from '@/i18n';
import { Language } from '@/types';
import WelcomePopup from './WelcomePopup';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';

const VoiceAssistant: React.FC = () => {
  // Hooks declarations
  const { currentInterface, language, setLanguage, hotelConfig, setHotelConfig } = useAssistant();
  const { config, isLoading, error } = useHotelConfiguration();
  const [showInfographic, setShowInfographic] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Memoize interface states to prevent unnecessary recalculations
  const interfaceStates = useMemo(() => ({
    interface1: currentInterface === 'interface1',
    interface2: currentInterface === 'interface2',
    interface3: currentInterface === 'interface3',
    interface3vi: currentInterface === 'interface3vi',
    interface3fr: currentInterface === 'interface3fr',
    interface4: currentInterface === 'interface4'
  }), [currentInterface]);

  // Effects
  useEffect(() => {
    console.log('🔄 Current interface changed to:', currentInterface);
  }, [currentInterface]);

  useEffect(() => {
    if (config && config !== hotelConfig) {
      console.log('🏨 Hotel configuration loaded:', config);
      setHotelConfig(config);
    }
  }, [config, hotelConfig, setHotelConfig]);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      setShowWelcomePopup(true);
      localStorage.setItem('hasSeenWelcomePopup', 'true');
    }
  }, []);

  // Handlers
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  // Loading state
  if (isLoading || !config) {
    return (
      <div className="relative h-screen overflow-hidden font-sans text-gray-800 bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading hotel configuration...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !config) {
    return (
      <div className="relative h-screen overflow-hidden font-sans text-gray-800 bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold mb-2">Configuration Error</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Filter available languages
  const availableLanguages = config.supportedLanguages || ['en'];
  const filteredLanguages = availableLanguages.filter(lang => 
    ['en', 'fr', 'zh', 'ru', 'ko', 'vi'].includes(lang)
  );

  console.log('[DEBUG] VoiceAssistant render:', { isLoading, config, hotelConfig });

  return (
    <div className="relative h-screen overflow-hidden font-sans text-gray-800 bg-neutral-50" id="app">
      {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
      
      {/* Interface Layers Container */}
      <div className="relative w-full h-full" id="interfaceContainer">
        <Interface1 isActive={interfaceStates.interface1} />
        <Interface2 isActive={interfaceStates.interface2} />
        <Interface3 isActive={interfaceStates.interface3} />
        <Interface4 isActive={interfaceStates.interface4} />
      </div>
    </div>
  );
};

export default VoiceAssistant;
