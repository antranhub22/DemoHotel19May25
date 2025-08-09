/**
 * useAssistant Adapter
 * Bridges existing useAssistant context with Guest Experience domain
 * Ensures backward compatibility during refactor transition
 */

import { useCallback } from "react";
import {
  useGuestExperience,
  useLanguageSelection,
  useVoiceInteraction,
} from "../hooks/useGuestExperience";
import type { Language } from "../types/guestExperience.types";

// Legacy interface (matching existing useAssistant)
export interface LegacyAssistantInterface {
  language: Language | null;
  setLanguage: (language: Language) => void;
  recentRequest: any;
  setRecentRequest: (request: any) => void;
  // Add other legacy properties as needed during transition
}

/**
 * Adapter hook that provides legacy useAssistant interface
 * while using Guest Experience domain underneath
 */
export const useAssistantAdapter = (): LegacyAssistantInterface => {
  const { selectedLanguage, selectLanguage } = useLanguageSelection();

  // Mock implementation for properties not yet migrated to domain
  const mockRecentRequest = null;
  const mockSetRecentRequest = useCallback(() => {
    // TODO: Implement when Request Management domain is created
    console.warn("setRecentRequest not yet implemented in domain architecture");
  }, []);

  const legacySetLanguage = useCallback(
    (language: Language) => {
      selectLanguage(language);

      // Also update legacy context if it still exists (for backward compatibility)
      // This will be removed once all components are migrated
      if (typeof window !== "undefined" && (window as any).legacySetLanguage) {
        (window as any).legacySetLanguage(language);
      }
    },
    [selectLanguage],
  );

  return {
    language: selectedLanguage,
    setLanguage: legacySetLanguage,
    recentRequest: mockRecentRequest,
    setRecentRequest: mockSetRecentRequest,
  };
};

/**
 * Enhanced adapter with additional domain features
 * For components that want to take advantage of new domain features
 */
export const useEnhancedAssistantAdapter = () => {
  const guestExperience = useGuestExperience();
  const languageSelection = useLanguageSelection();
  const voiceInteraction = useVoiceInteraction();

  // Legacy interface
  const legacy = useAssistantAdapter();

  // Enhanced features
  const enhanced = {
    // Guest Journey
    currentStep: guestExperience.journey.currentStep,
    journeyProgress: guestExperience.journeyProgress,
    isFirstTimeUser: guestExperience.isFirstTimeUser,
    canProceedToVoiceCall: guestExperience.canProceedToVoiceCall,

    // Voice Interaction
    isInActiveCall: guestExperience.isInActiveCall,
    canStartCall: guestExperience.canStartCall,
    micLevel: voiceInteraction.micLevel,
    callDuration: guestExperience.callDuration,
    formattedCallDuration: guestExperience.formattedCallDuration,

    // Conversation
    transcripts: guestExperience.conversation.transcripts,
    showConversation: guestExperience.conversation.showConversation,

    // Actions
    startCall: voiceInteraction.startCall,
    endCall: voiceInteraction.endCall,
    addTranscript: guestExperience.addTranscript,
    resetJourney: guestExperience.resetJourney,
  };

  return {
    ...legacy,
    enhanced,
  };
};

/**
 * Migration helper for gradually updating components
 * Logs when legacy methods are used to track migration progress
 */
export const useAssistantMigrationHelper = () => {
  const adapter = useAssistantAdapter();

  const loggedSetLanguage = useCallback(
    (language: Language) => {
      console.log(`🔄 [Migration] setLanguage called with: ${language}`);
      adapter.setLanguage(language);
    },
    [adapter],
  );

  const loggedSetRecentRequest = useCallback(
    (request: any) => {
      console.log(
        "🔄 [Migration] setRecentRequest called - consider migrating to Request Management domain",
      );
      adapter.setRecentRequest(request);
    },
    [adapter],
  );

  return {
    ...adapter,
    setLanguage: loggedSetLanguage,
    setRecentRequest: loggedSetRecentRequest,
  };
};
