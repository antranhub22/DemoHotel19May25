/**
 * Guest Experience Domain - Public API
 * Export all public interfaces for Guest Experience domain
 */

// Types
export type {
  CallSession,
  CallSummary,
  ConversationState,
  GuestExperienceEvents,
  GuestJourneyState,
  GuestJourneyStep,
  Language,
  ServiceContext,
  Transcript,
  VoiceInteractionState,
} from "./types/guestExperience.types";

// Redux Store
export {
  addModelOutput,
  addTranscript,
  clearCallSummary,
  clearModelOutput,
  clearTranscripts,
  completeGuestJourney,
  completeWelcome,
  endVoiceCall,
  guestJourneySlice,
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
} from "./store/guestJourneySlice";

export type { GuestExperienceState } from "./store/guestJourneySlice";

// Services
export { GuestExperienceService } from "./services/guestExperienceService";

// Hooks
export {
  useConversation,
  useGuestExperience,
  useLanguageSelection,
  useVoiceInteraction,
} from "./hooks/useGuestExperience";

// Adapters
export {
  useAssistantAdapter,
  useAssistantMigrationHelper,
  useEnhancedAssistantAdapter,
} from "./adapters/useAssistantAdapter";

export type { LegacyAssistantInterface } from "./adapters/useAssistantAdapter";
