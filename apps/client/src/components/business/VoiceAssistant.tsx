import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logger } from '@shared/utils/logger';
import { useAssistant } from '@/context';
import {
  PopupProvider,
  PopupManager,
} from '@/components/features/popup-system';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import { Interface1 } from '@/components/business/Interface1';
import { VoiceLanguageSwitcher } from '@/components/features/voice-assistant/interface1/VoiceLanguageSwitcher';
import { useAuth } from '@/context/AuthContext';
import { Language } from '@/types/interface1.types';
import { useIsMobile } from '@/hooks/use-mobile';

// Error fallback component for Interface1
const Interface1ErrorFallback: React.FC<{
  error?: Error;
  onRetry?: () => void;
}> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
    <div className="text-red-500 text-6xl mb-4">⚠️</div>
    <h2 className="text-2xl font-bold text-gray-800 mb-4">
      Voice Assistant Error
    </h2>
    <p className="text-gray-600 mb-6 max-w-md">
      Something went wrong with the voice assistant. Please try refreshing the
      page.
    </p>
    <button
      onClick={onRetry}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

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
    interface3: false,
    interface3vi: false,
    interface3fr: false,
    interface4: false,
  });

  // Enhanced language change handler
  const handleLanguageChange = (newLanguage: Language) => {
    setSelectedLanguage(newLanguage);
    setLanguage(newLanguage);

    logger.debug(
      `🗣️ [VoiceAssistant] Language changed to: ${newLanguage}`,
      'Component'
    );
  };

  // Update selectedLanguage when language changes from context
  useEffect(() => {
    setSelectedLanguage(language);

    // no cleanup needed
  }, [language]); // Fixed: Dependencies are correct

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
              <span className="font-bold text-blue-600 text-lg">
                Mi Nhon Hotel
              </span>
              <span className="hidden sm:inline text-sm text-gray-500">
                Voice Assistant
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Enhanced Language Selector */}
              <VoiceLanguageSwitcher
                position="header"
                showVoicePreview={false}
                onLanguageChange={handleLanguageChange}
                className="scale-75 origin-right"
              />

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
            minHeight: 'calc(100vh - 42px)', // Adjust height to account for header
          }}
        >
          {/* ✅ INTERFACE1 ONLY - Focus Development */}
          <ErrorBoundary
            fallbackComponent={Interface1ErrorFallback}
            onError={(error, errorInfo) => {
              logger.error(
                '🚨 [VoiceAssistant] Interface1 Error:',
                'Component',
                error
              );
              logger.error(
                '🚨 [VoiceAssistant] Error Info:',
                'Component',
                errorInfo
              );
            }}
          >
            <Interface1
              key="stable-interface1"
              isActive={stableInterfaceStates.interface1}
            />
          </ErrorBoundary>

          {/* ✅ DISCONNECTED: Keep files but don't render 
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
