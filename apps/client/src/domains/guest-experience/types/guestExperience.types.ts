/**
 * Guest Experience Domain Types
 * Centralized type definitions for guest journey and voice interactions
 */

export type Language = "en" | "vi" | "fr" | "zh" | "ru" | "ko";

export type GuestJourneyStep =
  | "welcome"
  | "language-selection"
  | "voice-interaction"
  | "conversation"
  | "call-summary"
  | "completed";

export interface GuestJourneyState {
  currentStep: GuestJourneyStep;
  showWelcome: boolean;
  hasSelectedLanguage: boolean;
  isInVoiceCall: boolean;
  hasCompletedCall: boolean;
  isFirstTimeUser: boolean;
}

export interface VoiceInteractionState {
  isCallStarted: boolean;
  isCallActive: boolean;
  micLevel: number;
  isLoading: boolean;
  error: string | null;
  callId: string | null;
  callStartTime: Date | null;
  callEndTime: Date | null;
}

export interface ConversationState {
  showConversation: boolean;
  transcripts: Transcript[];
  modelOutput: string[];
  showingSummary: boolean;
  showRightPanel: boolean;
  conversationPopupId: string | null;
}

export interface Transcript {
  id: string;
  text: string;
  timestamp: Date;
  type: "user" | "assistant";
  language: Language;
}

export interface CallSession {
  id: string;
  language: Language;
  startTime: Date;
  endTime?: Date;
  status: "active" | "ended" | "cancelled";
  transcripts: Transcript[];
  summary?: CallSummary;
}

export interface CallSummary {
  id: string;
  callId: string;
  content: string;
  extractedData: {
    guestName?: string;
    roomNumber?: string;
    serviceType?: string;
    specialRequests?: string[];
  };
  generatedAt: Date;
}

export interface ServiceContext {
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  language: Language;
}

// Events that can be dispatched across the Guest Experience domain
export interface GuestExperienceEvents {
  "journey:step-changed": { step: GuestJourneyStep; timestamp: Date };
  "language:selected": { language: Language; timestamp: Date };
  "call:started": { callId: string; language: Language; timestamp: Date };
  "call:ended": { callId: string; summary?: CallSummary; timestamp: Date };
  "conversation:updated": { transcripts: Transcript[]; timestamp: Date };
}
