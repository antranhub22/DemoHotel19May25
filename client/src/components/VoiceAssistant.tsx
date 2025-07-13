import { useState, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import Interface1 from './Interface1';
import Interface2 from './Interface2';
import Interface3 from './Interface3';
import Interface4 from './Interface4';
import { useWebSocket } from '@/hooks/useWebSocket';
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
  const { currentInterface, language, setLanguage, hotelConfig, setHotelConfig } = useAssistant();
  const [showInfographic, setShowInfographic] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  
  // Load hotel configuration
  const { config, isLoading, error, isMiNhon } = useHotelConfiguration();
  
  // Debug logging for currentInterface changes
  useEffect(() => {
    console.log('🔄 Current interface changed to:', currentInterface);
  }, [currentInterface]);
  
  // Update hotel configuration in context when it changes
  useEffect(() => {
    if (config && config !== hotelConfig) {
      console.log('🏨 Hotel configuration loaded:', config);
      setHotelConfig(config);
    }
  }, [config, hotelConfig, setHotelConfig]);
  
  // Initialize WebSocket connection
  // useWebSocket(); // This line is removed as per the edit hint.

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      setShowWelcomePopup(true);
      localStorage.setItem('hasSeenWelcomePopup', 'true');
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  console.log('🎯 VoiceAssistant render - currentInterface:', currentInterface);

  // Debug log interface states
  const interfaceStates = {
    interface1: currentInterface === 'interface1',
    interface2: currentInterface === 'interface2',
    interface3: currentInterface === 'interface3',
    interface3vi: currentInterface === 'interface3vi',
    interface3fr: currentInterface === 'interface3fr',
    interface4: currentInterface === 'interface4'
  };
  console.log('🔍 Interface rendering states:', interfaceStates);

  // Additional debug for Interface4
  useEffect(() => {
    if (currentInterface === 'interface4') {
      console.log('🎯 Interface4 is now active - VoiceAssistant level');
    } else if (currentInterface === 'interface1') {
      console.log('🏠 Interface1 is now active - VoiceAssistant level');
    }
  }, [currentInterface]);

  // Show loading state while configuration is loading
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

  // Show error state if configuration failed to load
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

  // Filter available languages based on hotel configuration
  const availableLanguages = config.supportedLanguages || ['en'];
  const filteredLanguages = availableLanguages.filter(lang => 
    ['en', 'fr', 'zh', 'ru', 'ko', 'vi'].includes(lang)
  );

  console.log('[DEBUG] VoiceAssistant render:', { isLoading, config, hotelConfig });
  return (
    <div className="relative h-screen overflow-hidden font-sans text-gray-800 bg-neutral-50" id="app">
      {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
      
      {/* Configuration Error Banner */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header Bar */}
      <header className="w-full bg-primary text-white p-4 shadow-md" style={{ backgroundColor: config?.branding?.colors?.primary || '#1e40af' }}>
        <div className="container mx-auto flex items-center justify-between px-2">
          {/* Left: Logo and Hotel Name */}
          <div className="flex items-center justify-start ml-1 sm:ml-4 mr-2 sm:mr-6 gap-3 min-w-fit">
            <img 
              src={config.branding.logo} 
              alt={`${config.hotelName} Logo`} 
              className="h-10 sm:h-14 w-auto rounded-lg shadow-md bg-white/80 p-1"
              onError={(e) => {
                // Fallback to Mi Nhon logo if hotel logo fails to load
                e.currentTarget.src = '/assets/references/images/minhon-logo.jpg';
              }}
            />
            <span 
              className="font-poppins font-bold text-xl sm:text-2xl lg:text-3xl whitespace-nowrap" 
              style={{ color: config.branding.colors.secondary, textShadow: '0px 1px 2px rgba(0,0,0,0.18)' }}
            >
              {config.headerText}
            </span>
          </div>
          {/* Center: Empty space */}
          <div className="flex-1"></div>
          {/* Right: Call History, Refresh, Language, and Infographic */}
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            {/* <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-2 py-1 rounded bg-primary-dark text-white text-xs sm:text-sm hover:bg-primary-darker transition-colors"
              title="Refresh"
            >
              <span className="material-icons text-sm sm:text-base mr-1">refresh</span>
              <span className="hidden sm:inline">Refresh</span>
            </button> */}

            {/* Language Dropdown - Show only if multi-language is enabled */}
            {config.features.multiLanguage && (
              <div className="flex items-center px-2 py-1 rounded bg-primary-dark text-white text-xs sm:text-sm">
                <FaGlobeAsia className="text-[#F9BF3B] text-sm sm:text-base mr-1.5" />
                <div className="relative">
                  <select
                    value={language}
                    onChange={e => handleLanguageChange(e.target.value as Language)}
                    className="appearance-none bg-transparent focus:outline-none transition-all duration-200 pr-6"
                    style={{
                      fontWeight: 600,
                      color: '#fff',
                      textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {filteredLanguages.map(lang => {
                      const languageOptions = {
                        'en': '🇬🇧 EN',
                        'fr': '🇫🇷 FR', 
                        'zh': '🇨🇳 ZH',
                        'ru': '🇷🇺 RU',
                        'ko': '🇰🇷 KO',
                        'vi': '🇻🇳 VI'
                      };
                      return (
                        <option key={lang} value={lang}>
                          {languageOptions[lang as keyof typeof languageOptions]}
                        </option>
                      );
                    })}
                  </select>
                  <FiChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-[#F9BF3B] pointer-events-none text-sm" />
                </div>
              </div>
            )}

            {/* Infographic Button */}
            <button
              onClick={() => setShowInfographic(true)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-primary-dark text-white text-xs sm:text-sm hover:bg-primary-darker transition-colors"
              title="View Steps"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Steps</span>
            </button>

            {/* Call History - Show only if feature is enabled */}
            {config.features.callHistory && (
              <Link href="/call-history" className="flex items-center gap-1 px-2 py-1 rounded bg-primary-dark text-white text-xs sm:text-sm hover:bg-primary-darker transition-colors">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Call History</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Infographic Popup */}
      {showInfographic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
            <button
              onClick={() => setShowInfographic(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mt-4">
              <InfographicSteps 
                horizontal={false}
                compact={false}
                currentStep={
                  currentInterface === 'interface3' ? 3 :
                  currentInterface === 'interface2' ? 2 : 1
                }
                language={language}
              />
            </div>
          </div>
        </div>
      )}

      {/* Interface Layers Container */}
      <div className="relative w-full h-full" id="interfaceContainer">
        <Interface1 isActive={currentInterface === 'interface1'} />
        <Interface2 isActive={currentInterface === 'interface2'} />
        <Interface3 isActive={currentInterface === 'interface3'} />
        <Interface4 isActive={currentInterface === 'interface4'} />
      </div>
    </div>
  );
};

export default VoiceAssistant;
