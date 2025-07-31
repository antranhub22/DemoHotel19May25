import { Interface1 } from '@/components/business/Interface1';
import {
  PopupManager,
  PopupProvider,
  usePopup,
} from '@/components/features/popup-system';
import WelcomePopup from '@/components/features/popup-system/WelcomePopup';
import { VoiceLanguageSwitcher } from '@/components/features/voice-assistant/interface1/VoiceLanguageSwitcher';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import { useAssistant } from '@/context';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
// ✅ NEW: Import useConfirmHandler to ensure it's always mounted
import { useConfirmHandler } from '@/hooks/useConfirmHandler';
import { Language } from '@/types/interface1.types';
import { logger } from '@shared/utils/logger';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ NEW: Component to expose PopupSystem globally for migration
const GlobalPopupSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const popupSystem = usePopup();

  // Expose PopupSystem globally for migration from NotificationSystem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).unifiedPopupSystem = popupSystem;
      logger.debug(
        '🔄 [Migration] PopupSystem exposed globally',
        'VoiceAssistant'
      );
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).unifiedPopupSystem;
      }
    };
  }, [popupSystem]);

  return <>{children}</>;
};

// Error fallback component for Interface1
const Interface1ErrorFallback: React.FC<{
  error?: Error;
  onRetry?: () => void;
}> = ({ onRetry }) => (
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

// Language Selection Modal Component
const LanguageSelectionModal: React.FC<{
  onLanguageSelect: (lang: Language) => void;
  isMobile: boolean;
}> = ({ onLanguageSelect, isMobile }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div
      className={`bg-white rounded-xl p-6 mx-4 ${isMobile ? 'w-full max-w-sm' : 'w-full max-w-md'}`}
    >
      <h2 className="text-xl font-bold text-center mb-4">
        {isMobile ? 'Select Language' : 'Choose Your Language'}
      </h2>
      <VoiceLanguageSwitcher
        position="inline"
        showVoicePreview={false}
        onLanguageChange={onLanguageSelect}
      />
    </div>
  </div>
);

/**
 * VoiceAssistant - Mobile-First Guest Experience
 *
 * NEW GUEST JOURNEY FLOW:
 * 1. Welcome Modal (first-time users)
 * 2. Language Selection (manual only, no voice preview)
 * 3. Voice Call (mobile-optimized)
 * 4. Real-time Conversation Display
 * 5. Summary Popup (call end)
 * 6. Database Integration (Hotel + SaaS Provider)
 */
const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const { setLanguage } = useAssistant();
  const { logout } = useAuth();
  const isMobile = useIsMobile();

  // ✅ NEW: Ensure useConfirmHandler is always mounted for summary popup
  const {
    autoTriggerSummary,
    updateSummaryPopup,
    resetSummarySystem,
    storeCallId,
  } = useConfirmHandler();

  // ✅ NEW: Guest Journey State Management
  const [guestJourneyState, setGuestJourneyState] = useState<{
    showWelcome: boolean;
    hasSelectedLanguage: boolean;
    isInVoiceCall: boolean;
    hasCompletedCall: boolean;
  }>({
    showWelcome: false,
    hasSelectedLanguage: false,
    isInVoiceCall: false,
    hasCompletedCall: false,
  });

  // ✅ NEW: Initialize Guest Journey on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;

    if (!hasVisited) {
      // First-time user - show welcome popup
      setGuestJourneyState(prev => ({
        ...prev,
        showWelcome: true,
        hasSelectedLanguage: false,
      }));
      localStorage.setItem('hasVisited', 'true');
      logger.debug(
        '🎯 [VoiceAssistant] First-time user detected - showing welcome',
        'Component'
      );
    } else {
      // Returning user - check if language was previously selected
      const hasLanguage =
        savedLanguage &&
        ['en', 'vi', 'fr', 'zh', 'ru', 'ko'].includes(savedLanguage);
      if (hasLanguage) {
        setLanguage(savedLanguage);
      }
      setGuestJourneyState(prev => ({
        ...prev,
        showWelcome: false,
        hasSelectedLanguage: hasLanguage,
      }));
      logger.debug('🎯 [VoiceAssistant] Returning user detected', 'Component', {
        hasLanguage,
        savedLanguage,
      });
    }
  }, [setLanguage]);

  // ✅ NEW: Debug logging for useConfirmHandler
  useEffect(() => {
    console.log(
      '🔗 [VoiceAssistant] useConfirmHandler mounted with functions:',
      {
        hasAutoTriggerSummary: typeof autoTriggerSummary === 'function',
        hasUpdateSummaryPopup: typeof updateSummaryPopup === 'function',
        hasResetSummarySystem: typeof resetSummarySystem === 'function',
        hasStoreCallId: typeof storeCallId === 'function',
      }
    );
  }, [autoTriggerSummary, updateSummaryPopup, resetSummarySystem, storeCallId]);

  // ✅ NEW: Handle Welcome completion
  const handleWelcomeComplete = () => {
    setGuestJourneyState(prev => ({
      ...prev,
      showWelcome: false,
    }));
    logger.debug(
      '🎯 [VoiceAssistant] Welcome completed - proceeding to language selection',
      'Component'
    );
  };

  // ✅ NEW: Enhanced language selection handler (mobile-first, manual only)
  const handleLanguageSelection = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setGuestJourneyState(prev => ({
      ...prev,
      hasSelectedLanguage: true,
    }));

    // Persist language selection
    localStorage.setItem('selectedLanguage', newLanguage);

    logger.debug('🌍 [VoiceAssistant] Language selected:', 'Component', {
      language: newLanguage,
      isMobile,
      journeyState: 'language-selected',
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ NEW: Mobile-First UI Rendering
  return (
    <PopupProvider>
      <GlobalPopupSystemProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
          {/* ✅ STEP 1: Welcome Modal (First-time users only) */}
          {guestJourneyState.showWelcome && (
            <WelcomePopup onClose={handleWelcomeComplete} />
          )}

          {/* ✅ STEP 2: Language Selection (Mobile-First, Manual Only) */}
          {!guestJourneyState.showWelcome &&
            !guestJourneyState.hasSelectedLanguage && (
              <LanguageSelectionModal
                onLanguageSelect={handleLanguageSelection}
                isMobile={isMobile}
              />
            )}

          {/* Mobile-First Header */}
          <div className="fixed top-0 left-0 right-0 z-[9997] bg-white/90 backdrop-blur-sm border-b">
            <div className="flex items-center justify-between px-4 py-2">
              {/* Logo/Title */}
              <div className="text-lg font-bold text-blue-900">
                {isMobile ? 'Hotel Assistant' : 'Hotel Voice Assistant'}
              </div>

              {/* Language Switcher (Mobile-Optimized) */}
              {guestJourneyState.hasSelectedLanguage && (
                <div className="flex items-center space-x-2">
                  <VoiceLanguageSwitcher
                    position="header"
                    showVoicePreview={false}
                    onLanguageChange={handleLanguageSelection}
                  />
                  {!isMobile && (
                    <button
                      onClick={handleLogout}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ✅ STEP 3-5: Main Interface (Voice Call + Real-time Conversation + Summary) */}
          {guestJourneyState.hasSelectedLanguage && (
            <div
              className="relative w-full h-full"
              style={{
                marginTop: isMobile ? '50px' : '60px',
                minHeight: isMobile
                  ? 'calc(100vh - 50px)'
                  : 'calc(100vh - 60px)',
              }}
            >
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
                <Interface1 key="mobile-first-interface1" isActive={true} />
              </ErrorBoundary>
            </div>
          )}

          {/* Mobile-First Popup System */}
          <PopupManager
            position="bottom"
            maxVisible={isMobile ? 2 : 4}
            autoCloseDelay={isMobile ? 8000 : 10000}
            isMobile={isMobile}
          />
        </div>
      </GlobalPopupSystemProvider>
    </PopupProvider>
  );
};

export default VoiceAssistant;
