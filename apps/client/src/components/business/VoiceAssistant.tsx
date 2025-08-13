import * as React from "react";
/**
 * VoiceAssistant - Guest Experience with Domain-Driven Architecture
 * Mobile-First Guest Experience using Domain-Driven Architecture
 *
 * GUEST JOURNEY FLOW (Domain-based):
 * 1. Welcome Modal (first-time users) - managed by guestExperience domain
 * 2. Language Selection (manual only) - managed by guestExperience domain
 * 3. Voice Call (mobile-optimized) - managed by guestExperience domain
 * 4. Real-time Conversation Display - managed by guestExperience domain
 * 5. Summary Popup (call end) - managed by guestExperience domain
 * 6. Database Integration (Hotel + SaaS Provider) - existing API endpoints unchanged
 */

import { Interface1 } from "@/components/business/Interface1";
import {
  PopupManager,
  PopupProvider,
  usePopup,
} from "@/components/features/popup-system";
import WelcomePopup from "@/components/features/popup-system/WelcomePopup";
import { VoiceLanguageSwitcher } from "@/components/features/voice-assistant/interface1/VoiceLanguageSwitcher";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSummaryManager } from "@/hooks/useSummaryManager";
// ✅ EMERGENCY FIX: Import SummaryPopupFix component
import SummaryPopupFix from "@/components/debug/SummaryPopupFix";
// ✅ NEW: Import Guest Experience domain hooks
import {
  useGuestExperience,
  useLanguageSelection,
} from "@/domains/guest-experience/hooks/useGuestExperience";
import type { Language } from "@/domains/guest-experience/types/guestExperience.types";
// ✅ UNIFIED: useConfirmHandler replaced by useSummaryManager
// import { useConfirmHandler } from "@/hooks/useConfirmHandler";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { UI_CONSTANTS } from "@/lib/constants";
import logger from "@shared/utils/logger";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ✅ NEW: Component to expose PopupSystem globally for migration

interface GlobalPopupSystemProviderProps {
  className?: string;
  children?: React.ReactNode;
  // TODO: Add specific props for GlobalPopupSystemProvider
}

const GlobalPopupSystemProvider: React.FC<GlobalPopupSystemProviderProps> = ({
  children,
}) => {
  const popupSystem = usePopup();

  // ✅ UNIFIED: Use new summary manager instead of legacy useConfirmHandler
  // Legacy useConfirmHandler replaced by useSummaryManager for better architecture
  const summaryManager = useSummaryManager(); // ✅ CRITICAL: Must be active for window.triggerSummaryPopup

  // Expose PopupSystem globally for migration from NotificationSystem
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).unifiedPopupSystem = popupSystem;
      logger.debug(
        "🔄 [Migration] PopupSystem exposed globally",
        "VoiceAssistant",
      );
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).unifiedPopupSystem;
      }
    };
  }, [popupSystem]);

  // ✅ UNIFIED: Summary manager now handled by UnifiedSummaryPopup component
  useEffect(() => {
    console.log(
      "🔗 [VoiceAssistant] Summary system unified - legacy handlers removed",
    );
  }, []);

  return (
    <>
      {children}
      {/* ✅ EMERGENCY FIX: Ensure Summary popup functions are available */}
      <SummaryPopupFix />
    </>
  );
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

// Language Selection Modal Component (unchanged for compatibility)
const LanguageSelectionModal: React.FC<{
  onLanguageSelect: (lang: Language) => void;
}> = ({ onLanguageSelect }) => (
  <LanguageSelectionModalInner onLanguageSelect={onLanguageSelect} />
);

const LanguageSelectionModalInner: React.FC<{
  onLanguageSelect: (lang: Language) => void;
}> = ({ onLanguageSelect }) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${prefersReducedMotion ? "bg-black/50" : "bg-black/50 backdrop-blur-sm"}`}
      style={{ zIndex: UI_CONSTANTS.Z_INDEX.MODAL_BACKDROP }}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Select Language
        </h2>
        <VoiceLanguageSwitcher
          position="inline"
          showVoicePreview={false}
          onLanguageChange={onLanguageSelect}
        />
      </div>
    </div>
  );
};

/**
 * VoiceAssistant - Domain Architecture Implementation
 * Uses Guest Experience domain for state management
 */
const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  // ✅ NEW: Use Guest Experience domain hooks instead of local state
  const guestExperienceHook = useGuestExperience();
  const languageSelectionHook = useLanguageSelection();

  // ✅ SAFETY: Extract values with fallbacks
  const {
    journey = null,
    initializeJourney = () => {},
    completeWelcome = () => {},
    selectLanguage = () => {},
  } = guestExperienceHook || {};

  const { hasSelectedLanguage = false } = languageSelectionHook || {};

  // ✅ DEBUG: Add error boundary for hooks
  if (!journey) {
    console.error("🚨 [VoiceAssistant] Journey is null/undefined", {
      journey,
      hasSelectedLanguage,
    });
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading guest experience...</p>
        </div>
      </div>
    );
  }

  // ✅ NEW: Initialize Guest Journey on component mount
  useEffect(() => {
    initializeJourney();
    logger.debug("🎯 [VoiceAssistant] Guest journey initialized", "Component");
  }, [initializeJourney]);

  // ✅ NEW: Handle Welcome completion using domain action
  const handleWelcomeComplete = () => {
    completeWelcome();
    logger.debug(
      "🎯 [VoiceAssistant] Welcome completed - proceeding to language selection",
      "Component",
    );
  };

  // ✅ NEW: Enhanced language selection handler using domain action
  const handleLanguageSelection = (newLanguage: Language) => {
    selectLanguage(newLanguage);
    logger.debug(
      `🗣️ [VoiceAssistant] Language selected: ${newLanguage}`,
      "Component",
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ NEW: Mobile-First UI Rendering with Domain State
  return (
    <PopupProvider>
      <GlobalPopupSystemProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
          {/* ✅ STEP 1: Welcome Modal (First-time users only) - Domain Controlled */}
          {journey.showWelcome && (
            <WelcomePopup onClose={handleWelcomeComplete} />
          )}

          {/* ✅ STEP 2: Language Selection (Mobile-First, Manual Only) - Domain Controlled */}
          {!journey.showWelcome && !hasSelectedLanguage && (
            <LanguageSelectionModal
              onLanguageSelect={handleLanguageSelection}
            />
          )}

          {/* Mobile-First Header */}
          <div
            className={`fixed top-0 left-0 right-0 h-14 md:h-16 border-b shadow-sm ${prefersReducedMotion ? "bg-white/95" : "bg-white/95 backdrop-blur-sm"}`}
            style={{
              zIndex: UI_CONSTANTS.Z_INDEX.STICKY,
              contain: "layout paint style" as any,
            }}
          >
            <div className="container mx-auto max-w-7xl h-full flex items-center justify-between px-4 md:px-6">
              {/* Logo/Title */}
              <div className="text-base md:text-lg font-semibold text-blue-900">
                {isMobile ? "Hotel Assistant" : "Hotel Voice Assistant"}
              </div>

              {/* Language Switcher (Mobile-Optimized) - Domain Controlled */}
              {hasSelectedLanguage && (
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

          {/* ✅ STEP 3-5: Main Interface (Voice Call + Real-time Conversation + Summary) - Domain Controlled */}
          {hasSelectedLanguage && (
            <main className="pt-14 md:pt-16">
              <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <ErrorBoundary
                  fallbackComponent={Interface1ErrorFallback}
                  onError={(error, errorInfo) => {
                    logger.error(
                      "🚨 [VoiceAssistant] Interface1 Error:",
                      "Component",
                      error,
                    );
                    logger.error(
                      "🚨 [VoiceAssistant] Error Info:",
                      "Component",
                      errorInfo,
                    );
                  }}
                >
                  <Interface1 key="domain-based-interface1" isActive={true} />
                </ErrorBoundary>
              </div>
            </main>
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
