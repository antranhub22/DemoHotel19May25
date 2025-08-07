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
} from './types/guestExperience.types.ts';

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
} from './store/guestJourneySlice.ts';

export type { GuestExperienceState } from './store/guestJourneySlice.ts';

// Services
// NOTE: Service exports temporarily disabled to resolve circular dependency
// Will be re-enabled after architectural refactor

// Hooks
// NOTE: Hooks exports temporarily disabled to resolve circular dependency
// Will be re-enabled after architectural refactor

// Adapters
export {
  useAssistantAdapter,
  useAssistantMigrationHelper,
  useEnhancedAssistantAdapter,
} from './adapters/useAssistantAdapter.ts';

export type { LegacyAssistantInterface } from './adapters/useAssistantAdapter.ts';
