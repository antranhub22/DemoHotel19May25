/**
 * Guest Journey Redux Slice
 * Manages the complete guest journey state with Redux Toolkit
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Language } from '@shared/types';
import type {
  CallSession,
  CallSummary,
  ConversationState,
  GuestJourneyState,
  GuestJourneyStep,
  Language,
  Transcript,
  VoiceInteractionState,
} from "../types/guestExperience.types";

// Initial States
const initialGuestJourneyState: GuestJourneyState = {
  currentStep: "welcome",
  showWelcome: false,
  hasSelectedLanguage: false,
  isInVoiceCall: false,
  hasCompletedCall: false,
  isFirstTimeUser: true,
};

const initialVoiceInteractionState: VoiceInteractionState = {
  isCallStarted: false,
  isCallActive: false,
  micLevel: 0,
  isLoading: false,
  error: null,
  callId: null,
  callStartTime: null,
  callEndTime: null,
};

const initialConversationState: ConversationState = {
  showConversation: false,
  transcripts: [],
  modelOutput: [],
  showingSummary: false,
  showRightPanel: false,
  conversationPopupId: null,
};

// Combined Guest Experience State
export interface GuestExperienceState {
  journey: GuestJourneyState;
  voiceInteraction: VoiceInteractionState;
  conversation: ConversationState;
  selectedLanguage: Language | null;
  currentCallSession: CallSession | null;
  callSummary: CallSummary | null;
}

const initialState: GuestExperienceState = {
  journey: initialGuestJourneyState,
  voiceInteraction: initialVoiceInteractionState,
  conversation: initialConversationState,
  selectedLanguage: null,
  currentCallSession: null,
  callSummary: null,
};

// Guest Journey Slice
export const guestJourneySlice = createSlice({
  name: "guestExperience",
  initialState,
  reducers: {
    // Journey Management
    setCurrentStep: (state, action: PayloadAction<GuestJourneyStep>) => {
      state.journey.currentStep = action.payload;

      // Update related states based on step
      switch (action.payload) {
        case "welcome":
          state.journey.showWelcome = true;
          break;
        case "language-selection":
          state.journey.showWelcome = false;
          break;
        case "voice-interaction":
          state.journey.hasSelectedLanguage = true;
          break;
        case "conversation":
          state.journey.isInVoiceCall = true;
          state.conversation.showConversation = true;
          break;
        case "completed":
          state.journey.hasCompletedCall = true;
          state.journey.isInVoiceCall = false;
          break;
      }
    },

    initializeGuestJourney: (
      state,
      action: PayloadAction<{ isFirstTime: boolean; savedLanguage?: Language }>,
    ) => {
      const { isFirstTime, savedLanguage } = action.payload;

      state.journey.isFirstTimeUser = isFirstTime;

      if (isFirstTime) {
        state.journey.showWelcome = true;
        state.journey.currentStep = "welcome";
      } else if (savedLanguage) {
        state.selectedLanguage = savedLanguage;
        state.journey.hasSelectedLanguage = true;
        state.journey.currentStep = "voice-interaction";
      } else {
        state.journey.currentStep = "language-selection";
      }
    },

    completeWelcome: (state) => {
      state.journey.showWelcome = false;
      state.journey.currentStep = "language-selection";
    },

    // Language Management
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.selectedLanguage = action.payload;
      state.journey.hasSelectedLanguage = true;
      state.journey.currentStep = "voice-interaction";
    },

    // Voice Interaction Management
    startVoiceCall: (
      state,
      action: PayloadAction<{ callId: string; language: Language }>,
    ) => {
      const { callId, language } = action.payload;

      state.voiceInteraction.isCallStarted = true;
      state.voiceInteraction.isCallActive = true;
      state.voiceInteraction.callId = callId;
      state.voiceInteraction.callStartTime = new Date();
      state.voiceInteraction.error = null;

      state.journey.isInVoiceCall = true;
      state.journey.currentStep = "conversation";

      // Initialize call session
      state.currentCallSession = {
        id: callId,
        language,
        startTime: new Date(),
        status: "active",
        transcripts: [],
      };
    },

    endVoiceCall: (
      state,
      action: PayloadAction<{ callId: string; summary?: CallSummary }>,
    ) => {
      const { callId, summary } = action.payload;

      state.voiceInteraction.isCallActive = false;
      state.voiceInteraction.callEndTime = new Date();

      if (state.currentCallSession && state.currentCallSession.id === callId) {
        state.currentCallSession.status = "ended";
        state.currentCallSession.endTime = new Date();

        if (summary) {
          state.currentCallSession.summary = summary;
          state.callSummary = summary;
        }
      }

      state.journey.currentStep = "call-summary";
      state.conversation.showingSummary = true;
    },

    updateMicLevel: (state, action: PayloadAction<number>) => {
      state.voiceInteraction.micLevel = action.payload;
    },

    setVoiceInteractionLoading: (state, action: PayloadAction<boolean>) => {
      state.voiceInteraction.isLoading = action.payload;
    },

    setVoiceInteractionError: (state, action: PayloadAction<string | null>) => {
      state.voiceInteraction.error = action.payload;
      if (action.payload) {
        state.voiceInteraction.isLoading = false;
      }
    },

    // Conversation Management
    addTranscript: (state, action: PayloadAction<Transcript>) => {
      state.conversation.transcripts.push(action.payload);

      // Also add to current call session
      if (state.currentCallSession) {
        state.currentCallSession.transcripts.push(action.payload);
      }
    },

    clearTranscripts: (state) => {
      state.conversation.transcripts = [];
    },

    addModelOutput: (state, action: PayloadAction<string>) => {
      state.conversation.modelOutput.push(action.payload);
    },

    clearModelOutput: (state) => {
      state.conversation.modelOutput = [];
    },

    setShowConversation: (state, action: PayloadAction<boolean>) => {
      state.conversation.showConversation = action.payload;
    },

    setShowRightPanel: (state, action: PayloadAction<boolean>) => {
      state.conversation.showRightPanel = action.payload;
    },

    setConversationPopupId: (state, action: PayloadAction<string | null>) => {
      state.conversation.conversationPopupId = action.payload;
    },

    // Call Summary Management
    setCallSummary: (state, action: PayloadAction<CallSummary>) => {
      state.callSummary = action.payload;

      if (state.currentCallSession) {
        state.currentCallSession.summary = action.payload;
      }
    },

    clearCallSummary: (state) => {
      state.callSummary = null;
    },

    // Reset Actions
    resetGuestJourney: (state) => {
      state.journey = initialGuestJourneyState;
      state.voiceInteraction = initialVoiceInteractionState;
      state.conversation = initialConversationState;
      state.currentCallSession = null;
      state.callSummary = null;
      // Keep selected language for better UX
    },

    resetConversation: (state) => {
      state.conversation = initialConversationState;
      state.voiceInteraction = { ...initialVoiceInteractionState };
      state.currentCallSession = null;
      state.callSummary = null;
    },

    completeGuestJourney: (state) => {
      state.journey.hasCompletedCall = true;
      state.journey.currentStep = "completed";
      state.conversation.showingSummary = false;
      state.conversation.showRightPanel = false;
    },
  },
});

// Export actions
export const {
  setCurrentStep,
  initializeGuestJourney,
  completeWelcome,
  setLanguage,
  startVoiceCall,
  endVoiceCall,
  updateMicLevel,
  setVoiceInteractionLoading,
  setVoiceInteractionError,
  addTranscript,
  clearTranscripts,
  addModelOutput,
  clearModelOutput,
  setShowConversation,
  setShowRightPanel,
  setConversationPopupId,
  setCallSummary,
  clearCallSummary,
  resetGuestJourney,
  resetConversation,
  completeGuestJourney,
} = guestJourneySlice.actions;

// Export reducer
export default guestJourneySlice.reducer;

// Selectors
export const selectGuestJourney = (state: {
  guestExperience: GuestExperienceState;
}) => state.guestExperience.journey;

export const selectVoiceInteraction = (state: {
  guestExperience: GuestExperienceState;
}) => state.guestExperience.voiceInteraction;

export const selectConversation = (state: {
  guestExperience: GuestExperienceState;
}) => state.guestExperience.conversation;

export const selectSelectedLanguage = (state: {
  guestExperience: GuestExperienceState;
}) => state.guestExperience.selectedLanguage;

export const selectCurrentCallSession = (state: {
  guestExperience: GuestExperienceState;
}) => state.guestExperience.currentCallSession;

export const selectCallSummary = (state: {
  guestExperience: GuestExperienceState;
}) => state.guestExperience.callSummary;

export const selectIsInActiveCall = (state: {
  guestExperience: GuestExperienceState;
}) => state.guestExperience.voiceInteraction.isCallActive;

export const selectCanStartCall = (state: {
  guestExperience: GuestExperienceState;
}) =>
  state.guestExperience.journey.hasSelectedLanguage &&
  !state.guestExperience.voiceInteraction.isCallActive;
