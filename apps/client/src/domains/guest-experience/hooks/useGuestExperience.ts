/**
 * Guest Experience Custom Hooks
 * Abstracts Redux logic for Guest Experience domain
 * Provides easy-to-use interface for components
 */

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { GuestExperienceService } from "../services/guestExperienceService";
import type { Language } from '@shared/types';
import {
  addModelOutput,
  addTranscript,
  clearCallSummary,
  clearModelOutput,
  clearTranscripts,
  completeGuestJourney,
  completeWelcome,
  endVoiceCall,
  initializeGuestJourney,
  resetConversation,
  resetGuestJourney,
  selectCallSummary,
  selectCanStartCall,
  selectConversation,
  selectCurrentCallSession,
  selectGuestJourney,
  selectIsInActiveCall,
  selectSelectedLanguage,
  selectVoiceInteraction,
  setCallSummary,
  setConversationPopupId,
  setCurrentStep,
  setLanguage,
  setShowConversation,
  setShowRightPanel,
  setVoiceInteractionError,
  setVoiceInteractionLoading,
  startVoiceCall,
  updateMicLevel,
} from '../store/guestJourneySlice';
import type {
  CallSummary,
  Language,
  ServiceContext,
} from "../types/guestExperience.types";

/**
 * Main Guest Experience Hook
 * Provides complete interface for guest journey management
 */
export const useGuestExperience = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const journey = useAppSelector(selectGuestJourney);
  const voiceInteraction = useAppSelector(selectVoiceInteraction);
  const conversation = useAppSelector(selectConversation);
  const selectedLanguage = useAppSelector(selectSelectedLanguage);
  const currentCallSession = useAppSelector(selectCurrentCallSession);
  const callSummary = useAppSelector(selectCallSummary);
  const isInActiveCall = useAppSelector(selectIsInActiveCall);
  const canStartCall = useAppSelector(selectCanStartCall);

  // Actions
  const actions = {
    // Journey Management
    setCurrentStep: useCallback(
      (step: string) => {
        dispatch(setCurrentStep(step as any));
      },
      [dispatch],
    ),

    initializeJourney: useCallback(() => {
      const journeyData = GuestExperienceService.initializeGuestJourney();
      dispatch(initializeGuestJourney(journeyData));
    }, [dispatch]),

    completeWelcome: useCallback(() => {
      dispatch(completeWelcome());
    }, [dispatch]),

    // Language Management
    selectLanguage: useCallback(
      (language: Language) => {
        GuestExperienceService.saveLanguageSelection(language);
        dispatch(setLanguage(language));
      },
      [dispatch],
    ),

    // Voice Interaction Management
    startCall: useCallback(
      async (language: Language, serviceContext?: ServiceContext) => {
        try {
          dispatch(setVoiceInteractionLoading(true));
          dispatch(setVoiceInteractionError(null));

          // Validate service context if provided
          if (
            serviceContext &&
            !GuestExperienceService.validateServiceContext(serviceContext)
          ) {
            throw new Error("Invalid service context");
          }

          const callSession =
            GuestExperienceService.createCallSession(language);
          dispatch(startVoiceCall({ callId: callSession.id, language }));

          return callSession.id;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to start call";
          dispatch(setVoiceInteractionError(errorMessage));
          throw error;
        } finally {
          dispatch(setVoiceInteractionLoading(false));
        }
      },
      [dispatch],
    ),

    endCall: useCallback(
      (callId: string, summaryText?: string) => {
        let callSummary: CallSummary | undefined;

        if (summaryText) {
          callSummary = GuestExperienceService.createCallSummary(
            callId,
            summaryText,
          );
          dispatch(setCallSummary(callSummary));
        }

        dispatch(endVoiceCall({ callId, summary: callSummary }));
      },
      [dispatch],
    ),

    updateMicLevel: useCallback(
      (level: number) => {
        dispatch(updateMicLevel(level));
      },
      [dispatch],
    ),

    setLoading: useCallback(
      (loading: boolean) => {
        dispatch(setVoiceInteractionLoading(loading));
      },
      [dispatch],
    ),

    setError: useCallback(
      (error: string | null) => {
        dispatch(setVoiceInteractionError(error));
      },
      [dispatch],
    ),

    // Conversation Management
    addTranscript: useCallback(
      (text: string, type: "user" | "assistant") => {
        if (!selectedLanguage) return;

        const processedText =
          GuestExperienceService.processConversationText(text);
        const transcript = GuestExperienceService.createTranscript(
          processedText,
          type,
          selectedLanguage,
        );
        dispatch(addTranscript(transcript));
      },
      [dispatch, selectedLanguage],
    ),

    clearTranscripts: useCallback(() => {
      dispatch(clearTranscripts());
    }, [dispatch]),

    addModelOutput: useCallback(
      (output: string) => {
        const processedOutput =
          GuestExperienceService.processConversationText(output);
        dispatch(addModelOutput(processedOutput));
      },
      [dispatch],
    ),

    clearModelOutput: useCallback(() => {
      dispatch(clearModelOutput());
    }, [dispatch]),

    setShowConversation: useCallback(
      (show: boolean) => {
        dispatch(setShowConversation(show));
      },
      [dispatch],
    ),

    setShowRightPanel: useCallback(
      (show: boolean) => {
        dispatch(setShowRightPanel(show));
      },
      [dispatch],
    ),

    setConversationPopupId: useCallback(
      (id: string | null) => {
        dispatch(setConversationPopupId(id));
      },
      [dispatch],
    ),

    // Call Summary Management
    setCallSummary: useCallback(
      (summary: CallSummary) => {
        dispatch(setCallSummary(summary));
      },
      [dispatch],
    ),

    clearCallSummary: useCallback(() => {
      dispatch(clearCallSummary());
    }, [dispatch]),

    // Reset Actions
    resetJourney: useCallback(() => {
      dispatch(resetGuestJourney());
    }, [dispatch]),

    resetConversation: useCallback(() => {
      dispatch(resetConversation());
    }, [dispatch]),

    completeJourney: useCallback(() => {
      dispatch(completeGuestJourney());
    }, [dispatch]),
  };

  // Computed values
  const computed = {
    isFirstTimeUser: journey.isFirstTimeUser,
    canProceedToVoiceCall: journey.hasSelectedLanguage && !isInActiveCall,
    currentStepIndex: getCurrentStepIndex(journey.currentStep),
    callDuration: currentCallSession
      ? GuestExperienceService.calculateCallDuration(
          currentCallSession.startTime,
          currentCallSession.endTime,
        )
      : 0,
    formattedCallDuration: currentCallSession
      ? GuestExperienceService.formatCallDuration(
          GuestExperienceService.calculateCallDuration(
            currentCallSession.startTime,
            currentCallSession.endTime,
          ),
        )
      : "0s",
    languageDisplayName: selectedLanguage
      ? GuestExperienceService.getLanguageDisplayName(selectedLanguage)
      : null,
    journeyProgress: calculateJourneyProgress(journey.currentStep),
  };

  return {
    // State
    journey,
    voiceInteraction,
    conversation,
    selectedLanguage,
    currentCallSession,
    callSummary,
    isInActiveCall,
    canStartCall,

    // Actions
    ...actions,

    // Computed
    ...computed,
  };
};

/**
 * Simplified hook for language management only
 */
export const useLanguageSelection = () => {
  const dispatch = useAppDispatch();
  const selectedLanguage = useAppSelector(selectSelectedLanguage);
  const journey = useAppSelector(selectGuestJourney);

  const selectLanguage = useCallback(
    (language: Language) => {
      GuestExperienceService.saveLanguageSelection(language);
      dispatch(setLanguage(language));
    },
    [dispatch],
  );

  return {
    selectedLanguage,
    hasSelectedLanguage: journey.hasSelectedLanguage,
    selectLanguage,
    getLanguageDisplayName: GuestExperienceService.getLanguageDisplayName,
  };
};

/**
 * Simplified hook for voice interaction only
 */
export const useVoiceInteraction = () => {
  const dispatch = useAppDispatch();
  const voiceInteraction = useAppSelector(selectVoiceInteraction);
  const selectedLanguage = useAppSelector(selectSelectedLanguage);
  const canStartCall = useAppSelector(selectCanStartCall);

  const startCall = useCallback(
    async (serviceContext?: ServiceContext) => {
      if (!selectedLanguage) {
        throw new Error("No language selected");
      }

      const callSession =
        GuestExperienceService.createCallSession(selectedLanguage);
      dispatch(
        startVoiceCall({ callId: callSession.id, language: selectedLanguage }),
      );

      return callSession.id;
    },
    [dispatch, selectedLanguage],
  );

  const endCall = useCallback(
    (callId: string, summaryText?: string) => {
      let callSummary: CallSummary | undefined;

      if (summaryText) {
        callSummary = GuestExperienceService.createCallSummary(
          callId,
          summaryText,
        );
        dispatch(setCallSummary(callSummary));
      }

      dispatch(endVoiceCall({ callId, summary: callSummary }));
    },
    [dispatch],
  );

  return {
    ...voiceInteraction,
    canStartCall,
    startCall,
    endCall,
    updateMicLevel: (level: number) => dispatch(updateMicLevel(level)),
  };
};

/**
 * Simplified hook for conversation management only
 */
export const useConversation = () => {
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(selectConversation);
  const selectedLanguage = useAppSelector(selectSelectedLanguage);

  const addTranscript = useCallback(
    (text: string, type: "user" | "assistant") => {
      if (!selectedLanguage) return;

      const processedText =
        GuestExperienceService.processConversationText(text);
      const transcript = GuestExperienceService.createTranscript(
        processedText,
        type,
        selectedLanguage,
      );
      dispatch(addTranscript(transcript));
    },
    [dispatch, selectedLanguage],
  );

  return {
    ...conversation,
    addTranscript,
    clearTranscripts: () => dispatch(clearTranscripts()),
    addModelOutput: (output: string) => dispatch(addModelOutput(output)),
    clearModelOutput: () => dispatch(clearModelOutput()),
  };
};

// Helper functions
function getCurrentStepIndex(step: string): number {
  const steps = [
    "welcome",
    "language-selection",
    "voice-interaction",
    "conversation",
    "call-summary",
    "completed",
  ];
  return steps.indexOf(step);
}

function calculateJourneyProgress(step: string): number {
  const stepIndex = getCurrentStepIndex(step);
  const totalSteps = 6; // Total number of steps
  return Math.round((stepIndex / (totalSteps - 1)) * 100);
}
