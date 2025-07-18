import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAssistant } from '@/context/AssistantContext';
import { PopupProvider } from '@/context/PopupContext';
import { PopupManager } from '@/components/popup-system/PopupManager';
import WelcomePopup from '@/components/WelcomePopup';
import { Interface1 } from '@/components/Interface1';
import Interface2 from '@/components/Interface2';
import Interface3 from '@/components/Interface3';
import Interface4 from '@/components/Interface4';
import type { Language } from '@/types/interface1.types';

const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentInterface, setCurrentInterface, language, setLanguage } = useAssistant();
  
  // Language selection state
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  // Interface states
  const [interfaceStates, setInterfaceStates] = useState({
    interface1: false,
    interface2: false,
    interface3: false,
    interface3vi: false,
    interface3fr: false,
    interface4: false
  });

  // First time user
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if user is first-time visitor
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  // Update interface states based on currentInterface
  useEffect(() => {
    setInterfaceStates({
      interface1: currentInterface === 'interface1',
      interface2: currentInterface === 'interface2',
      interface3: currentInterface === 'interface3',
      interface3vi: currentInterface === 'interface3vi',
      interface3fr: currentInterface === 'interface3fr',
      interface4: currentInterface === 'interface4'
    });
  }, [currentInterface]);

  // Language options for the dropdown
  const languageOptions = [
    { value: 'en', label: '🇺🇸 English', flag: '🇺🇸' },
    { value: 'vi', label: '🇻🇳 Tiếng Việt', flag: '🇻🇳' },
    { value: 'fr', label: '🇫🇷 Français', flag: '🇫🇷' },
    { value: 'zh', label: '🇨🇳 中文', flag: '🇨🇳' },
    { value: 'ru', label: '🇷🇺 Русский', flag: '🇷🇺' },
    { value: 'ko', label: '🇰🇷 한국어', flag: '🇰🇷' }
  ];

  const handleLanguageChange = (newLanguage: string) => {
    const lang = newLanguage as Language;
    setSelectedLanguage(lang);
    setLanguage(lang);
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    navigate('/staff/login');
  };

  // Close welcome popup
  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  // Determine if we're on mobile for conditional PopupManager
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <PopupProvider>
    <div className="relative w-full h-full">
      {/* Welcome Popup */}
      {showWelcome && (
        <WelcomePopup onClose={handleCloseWelcome} />
      )}

      {/* Header Bar */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-white/10 backdrop-blur-md border-b border-white/20"
        style={{ height: '42px' }}
      >
        {/* Left: Hotel Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/public/assets/references/images/minhon-logo.jpg" 
            alt="Mi Nhon Hotel" 
            className="w-10 h-10 rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="hidden sm:inline text-white font-semibold">Mi Nhon Hotel</span>
        </div>
        
        {/* Center: Interface Info (Optional) */}
        <div className="hidden md:flex items-center text-white/80 text-sm">
          Voice Assistant
        </div>
        
        {/* Right: Language & Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none bg-white/20 text-white text-sm px-3 py-1.5 pr-8 rounded-full border border-white/30 focus:outline-none focus:ring-1 focus:ring-white/50 backdrop-blur-sm"
              style={{ minWidth: '100px' }}
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value} className="text-black">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Additional Controls */}
          <button 
            onClick={() => setCurrentInterface('interface1')}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors text-sm"
          >
            🏠 Steps
          </button>
          
          <button 
            onClick={() => navigate('/call-history')}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors text-sm"
          >
            📞 Call History
          </button>

          {/* Staff logout if on staff page */}
          {location.pathname.includes('/staff') && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors text-sm"
            >
              🚪 Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Interface Container */}
      <div 
        className="relative w-full h-full" 
        id="interfaceContainer"
        style={{
          marginTop: '42px', // Add margin to account for fixed header
          minHeight: 'calc(100vh - 42px)' // Adjust height to account for header
        }}
      >
        <Interface1 isActive={interfaceStates.interface1} />
        <Interface2 isActive={interfaceStates.interface2} />
        <Interface3 isActive={interfaceStates.interface3 || interfaceStates.interface3vi || interfaceStates.interface3fr} />
        <Interface4 isActive={interfaceStates.interface4} />
      </div>

      {/* iOS-style Popup System - Only on mobile OR for non-summary popups */}
      <PopupManager 
        position="bottom"
        maxVisible={4}
        autoCloseDelay={10000} // Auto-close low priority popups after 10s
        isMobile={isMobile} // Pass mobile state to filter popups
      />
    </div>
    </PopupProvider>
  );
};

export default VoiceAssistant;
