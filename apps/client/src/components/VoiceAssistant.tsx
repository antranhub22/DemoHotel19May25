import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PopupProvider, PopupManager } from '@/components/popup-system';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Interface1ErrorFallback } from '@/components/interface1/Interface1ErrorFallback';
import { Interface1 } from '@/components/Interface1';
// ✅ PERFORMANCE: Lazy load Interface2,3,4 to exclude from initial bundle
// import { Interface2 } from '@/components/Interface2';
// import { Interface3 } from '@/components/Interface3';  
// import { Interface4 } from '@/components/Interface4';
import { useAssistant } from '@/context/AssistantContext';
import { useAuth } from '@/context/AuthContext';
import { Language } from '@/types/interface1.types';
import { useIsMobile } from '@/hooks/use-mobile';

const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // ✅ SIMPLIFIED: Remove interface switching, focus only on Interface1
  // const { currentInterface, setCurrentInterface, language, setLanguage } = useAssistant();
  const { language, setLanguage } = useAssistant();
  
  // Language selection state
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  // ✅ REMOVED: No longer needed - using stableInterfaceStates instead

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

  // ✅ STABILIZED: Use useState with initial value instead of useEffect  
  // This prevents unnecessary re-renders and hook count changes
  const [stableInterfaceStates] = useState({
    interface1: true, // Always active
    interface2: false,
    interface3: false,
    interface3vi: false,
    interface3fr: false,
    interface4: false
  });

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

  const { logout } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <PopupProvider>
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50 h-[42px]">
        <div className="flex justify-between items-center px-4 h-full">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-600 text-lg">Mi Nhon Hotel</span>
            <span className="hidden sm:inline text-sm text-gray-500">Voice Assistant</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-sm bg-white/50 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label.split(' ')[1]}
                </option>
              ))}
            </select>

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
      </div>

      {/* Main Interface Container - Interface1 ONLY */}
      <div 
        className="relative w-full h-full" 
        id="interfaceContainer"
        style={{
          marginTop: '42px', // Add margin to account for fixed header
          minHeight: 'calc(100vh - 42px)' // Adjust height to account for header
        }}
      >
        {/* ✅ INTERFACE1 ONLY - Focus Development */}
        <ErrorBoundary
          fallbackComponent={Interface1ErrorFallback}
          onError={(error, errorInfo) => {
            console.error('🚨 [VoiceAssistant] Interface1 Error:', error);
            console.error('🚨 [VoiceAssistant] Error Info:', errorInfo);
          }}
        >
          <Interface1 key="stable-interface1" isActive={stableInterfaceStates.interface1} />
        </ErrorBoundary>
        
        {/* ✅ DISCONNECTED: Keep files but don't render 
        <Interface2 isActive={interfaceStates.interface2} />
        <Interface3 isActive={interfaceStates.interface3 || interfaceStates.interface3vi || interfaceStates.interface3fr} />
        <Interface4 isActive={interfaceStates.interface4} />
        */}
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
