/**
 * VoiceAssistant with SaaS Provider Integration
 * ✅ ENHANCED: Includes feature gating, usage tracking, and multi-tenant support
 * Mobile-First Guest Experience with complete SaaS integration
 */

import { logger } from "@shared/utils/logger";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ErrorBoundary from "@/components/layout/ErrorBoundary";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

// ✅ NEW: Enhanced Guest Experience with SaaS integration
import {
  useEnhancedGuestExperience,
  useEnhancedLanguageSelection,
} from "@/domains/guest-experience/hooks/useGuestExperience.enhanced";
import type { Language } from "@/domains/guest-experience/types/guestExperience.types";

// ✅ NEW: SaaS Provider components
import {
  AdvancedAnalyticsGate,
  FeatureGate,
  UsageDashboard,
  VoiceCloningGate,
} from "@/domains/saas-provider";

interface VoiceAssistantWithSaaSProps {
  className?: string;
}

// ✅ NEW: Usage Alert Component
const UsageAlertBanner: React.FC<{ usageStatus: any }> = ({ usageStatus }) => {
  if (!usageStatus?.warningMessage) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-yellow-400">⚠️</span>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {usageStatus.warningMessage}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Remaining: {usageStatus.remainingCalls} calls,{" "}
            {usageStatus.remainingMinutes} minutes
          </p>
        </div>
      </div>
    </div>
  );
};

// ✅ NEW: Feature Upgrade Prompt
const FeatureUpgradePrompt: React.FC<{
  feature: string;
  requiredPlan: string;
  onClose: () => void;
}> = ({ feature, requiredPlan, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🔒 Premium Feature
        </h3>
        <p className="text-gray-600 mb-4">
          {feature} requires <strong>{requiredPlan}</strong> plan or higher.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Navigate to upgrade page
              window.open("/upgrade", "_blank");
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ NEW: Enhanced Language Selector with Feature Gating
const EnhancedLanguageSelector: React.FC = () => {
  const {
    selectedLanguage,
    availableLanguages,
    selectLanguage,
    getLanguageAvailability,
    hasMultiLanguageAccess,
  } = useEnhancedLanguageSelection();

  const [showUpgradePrompt, setShowUpgradePrompt] = useState<{
    show: boolean;
    feature?: string;
    requiredPlan?: string;
  }>({ show: false });

  const handleLanguageSelect = (language: Language) => {
    const availability = getLanguageAvailability(language);

    if (!availability.available) {
      setShowUpgradePrompt({
        show: true,
        feature: "Multi-language support",
        requiredPlan: "Basic",
      });
      return;
    }

    selectLanguage(language);
  };

  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Choose Your Language</h3>
        <div className="grid grid-cols-2 gap-3">
          {availableLanguages.map((lang) => {
            const availability = getLanguageAvailability(lang.code);
            const isSelected = selectedLanguage === lang.code;
            const isDisabled = !availability.available;

            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                disabled={isDisabled}
                className={`
                  p-3 rounded-lg border-2 transition-all relative
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }
                  ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                <div className="text-sm font-medium">{lang.name}</div>
                {lang.premium && !hasMultiLanguageAccess && (
                  <span className="absolute top-1 right-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {showUpgradePrompt.show && (
        <FeatureUpgradePrompt
          feature={showUpgradePrompt.feature!}
          requiredPlan={showUpgradePrompt.requiredPlan!}
          onClose={() => setShowUpgradePrompt({ show: false })}
        />
      )}
    </>
  );
};

// ✅ NEW: Enhanced Voice Interface with SaaS Features
const EnhancedVoiceInterface: React.FC = () => {
  const { journey, voiceInteraction, currentTenant, usageStatus, actions } =
    useEnhancedGuestExperience();

  const [showUpgradePrompt, setShowUpgradePrompt] = useState<{
    show: boolean;
    feature?: string;
    requiredPlan?: string;
  }>({ show: false });

  const handleStartCall = async () => {
    try {
      await actions.startCall(journey.hasSelectedLanguage ? "en" : "en"); // TODO: Get selected language from journey state
    } catch (error) {
      if (error instanceof Error && error.message.includes("requires")) {
        const match = error.message.match(/requires (\w+) plan/);
        setShowUpgradePrompt({
          show: true,
          feature: "Voice Assistant",
          requiredPlan: match?.[1] || "Premium",
        });
      } else {
        console.error("Failed to start call:", error);
      }
    }
  };

  if (!currentTenant) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading tenant context...</p>
      </div>
    );
  }

  return (
    <>
      {/* Usage Alert Banner */}
      {usageStatus && <UsageAlertBanner usageStatus={usageStatus} />}

      {/* Usage Dashboard for transparency */}
      <div className="mb-6">
        <UsageDashboard />
      </div>

      {/* Voice Features with Feature Gates */}
      <div className="space-y-4">
        {/* Basic Voice Feature */}
        <FeatureGate feature="basicVoice">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">🎤 Voice Assistant</h4>
            <p className="text-sm text-gray-600 mb-3">
              Talk to our AI assistant for instant help
            </p>
            <button
              onClick={handleStartCall}
              disabled={
                voiceInteraction.isLoading || !usageStatus?.canMakeCalls
              }
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {voiceInteraction.isLoading ? "Starting..." : "Start Voice Call"}
            </button>
          </div>
        </FeatureGate>

        {/* Voice Cloning Feature */}
        <VoiceCloningGate>
          <div className="p-4 border rounded-lg bg-purple-50">
            <h4 className="font-medium mb-2">✨ Voice Cloning (Premium)</h4>
            <p className="text-sm text-gray-600 mb-3">
              Custom voice that matches your hotel's personality
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Configure Voice Cloning
            </button>
          </div>
        </VoiceCloningGate>

        {/* Advanced Analytics Feature */}
        <AdvancedAnalyticsGate>
          <div className="p-4 border rounded-lg bg-green-50">
            <h4 className="font-medium mb-2">
              📊 Advanced Analytics (Enterprise)
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Detailed insights into guest interactions
            </p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              View Analytics
            </button>
          </div>
        </AdvancedAnalyticsGate>
      </div>

      {/* Active Call Interface */}
      {voiceInteraction.isCallActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
            <h3 className="text-lg font-semibold mb-4">📞 Voice Call Active</h3>
            <p className="text-gray-600 mb-4">
              Speak naturally. I'm listening...
            </p>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">🎤</span>
              </div>
            </div>
            <button
              onClick={() => actions.endCall()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {showUpgradePrompt.show && (
        <FeatureUpgradePrompt
          feature={showUpgradePrompt.feature!}
          requiredPlan={showUpgradePrompt.requiredPlan!}
          onClose={() => setShowUpgradePrompt({ show: false })}
        />
      )}
    </>
  );
};

// ✅ MAIN: Enhanced Voice Assistant Component
const VoiceAssistantWithSaaS: React.FC<VoiceAssistantWithSaaSProps> = ({
  className,
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { journey, actions, currentTenant } = useEnhancedGuestExperience();

  // Initialize journey on mount
  useEffect(() => {
    if (currentTenant) {
      actions.initializeJourney();
      logger.debug(
        "[VoiceAssistantWithSaaS] Initialized with tenant:",
        currentTenant.id,
      );
    }
  }, [currentTenant, actions.initializeJourney]);

  // Handle mobile optimization
  useEffect(() => {
    if (isMobile) {
      // Mobile-specific optimizations
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isMobile]);

  if (!currentTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel context...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentTenant.hotelName}
              </h1>
              <p className="text-sm text-gray-600">
                {currentTenant.subscriptionPlan.toUpperCase()} Plan
              </p>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => navigate("/hotel-dashboard")}
                className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
              >
                Dashboard
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {journey.currentStep === "welcome" && journey.showWelcome && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Welcome! 👋</h2>
              <p className="text-gray-600 mb-4">
                I'm your AI assistant. How can I help you today?
              </p>
              <button
                onClick={() => actions.selectLanguage("en")}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Get Started
              </button>
            </div>
          )}

          {journey.currentStep === "language-selection" && (
            <EnhancedLanguageSelector />
          )}

          {journey.currentStep === "voice-interaction" && (
            <EnhancedVoiceInterface />
          )}

          {/* Conversation View */}
          {journey.currentStep === "conversation" && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Conversation</h3>
              {/* Conversation content would go here */}
              <p className="text-gray-600">Conversation in progress...</p>
            </div>
          )}

          {/* Call Summary */}
          {journey.currentStep === "call-summary" && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Call Summary</h3>
              {/* Call summary content would go here */}
              <p className="text-gray-600">Call completed successfully!</p>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default VoiceAssistantWithSaaS;
