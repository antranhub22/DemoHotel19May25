/**
 * STANDARD INTERFACES - Common Type Definitions
 * =============================================
 *
 * These interfaces define standard data structures across contexts
 * to reduce inconsistencies and prepare for future consolidation.
 *
 * NOTE: These are additive interfaces - they don't replace existing types
 * but provide a migration path for future consistency improvements.
 */

import { Language } from "@/context/contexts/LanguageContext";

// ============================================================================
// CALL STATE INTERFACES
// ============================================================================

/**
 * Standard call state structure across all contexts
 * Unifies: VapiContextSimple, useConversationState, CallContext
 */
export interface StandardCallState {
  // Core state
  isActive: boolean; // Technical connection status
  isStarted: boolean; // UI interaction status
  callId: string | null; // Consistent identifier
  language: Language; // Current call language

  // Status tracking
  status: "idle" | "connecting" | "active" | "processing" | "ending";

  // Timing
  startTime?: Date;
  endTime?: Date;
  duration?: string;

  // Audio/Visual
  micLevel?: number;
  volumeLevel?: number;
}

/**
 * Standard call actions interface
 * Unifies call control methods across contexts
 */
export interface StandardCallActions {
  startCall: (language?: Language) => Promise<void>;
  endCall: () => Promise<void>;
  updateMicLevel: (level: number) => void;
  updateCallDetails: (details: Partial<StandardCallState>) => void;
}

// ============================================================================
// TRANSCRIPT INTERFACES
// ============================================================================

/**
 * Standard transcript data structure
 * Unifies: TranscriptContext, VapiContextSimple, useGuestExperience
 */
export interface StandardTranscriptData {
  // Identity
  id: string | number;
  callId: string;
  tenantId: string;

  // Content
  role: "user" | "assistant";
  content: string;

  // Metadata
  timestamp: Date;
  language: Language;

  // Optional fields for backward compatibility
  message?: string; // Fallback for legacy data
}

/**
 * Standard transcript actions interface
 * Unifies transcript management methods
 */
export interface StandardTranscriptActions {
  addTranscript: (
    transcript: Omit<StandardTranscriptData, "id" | "timestamp">,
  ) => void;
  clearTranscripts: () => void;
  getTranscriptsByCall: (callId: string) => StandardTranscriptData[];
  saveToDatabase: (transcript: StandardTranscriptData) => Promise<void>;
}

// ============================================================================
// LANGUAGE INTERFACES
// ============================================================================

/**
 * Standard language state structure
 * Unifies: LanguageContext, VapiContextSimple, RefactoredAssistantContext
 */
export interface StandardLanguageState {
  // Current language
  current: Language;

  // Translation state
  vietnameseSummary?: string | null;

  // Configuration
  availableLanguages: Language[];
  isLocked: boolean; // Prevent changes during calls
}

/**
 * Standard language actions interface
 * Unifies language management methods
 */
export interface StandardLanguageActions {
  setLanguage: (language: Language) => void;
  lockLanguage: () => void;
  unlockLanguage: () => void;
  setVietnameseSummary: (summary: string) => void;
  clearTranslations: () => void;
}

// ============================================================================
// INTEGRATION INTERFACES
// ============================================================================

/**
 * Standard integration points between contexts
 * Defines how contexts should communicate with each other
 */
export interface StandardContextIntegration {
  // Language changes should trigger:
  onLanguageChange?: (newLanguage: Language) => void;

  // Call state changes should trigger:
  onCallStateChange?: (newState: Partial<StandardCallState>) => void;

  // Transcript events should trigger:
  onTranscriptReceived?: (transcript: StandardTranscriptData) => void;
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Helper type for gradual migration from existing interfaces
 * Allows components to accept both old and new interface structures
 */
export type MigrationCompatible<TOld, TNew> = TOld | TNew;

/**
 * Utility type for marking deprecated fields
 * Helps track what needs to be migrated
 */
export type Deprecated<T> = T & {
  __deprecated?: true;
  __migration_note?: string;
};

// ============================================================================
// FUTURE EXPANSION
// ============================================================================

/**
 * Placeholder for future standard interfaces
 * Add new interfaces here as patterns emerge
 */
export interface StandardErrorHandling {
  onError: (error: Error, context: string) => void;
  onRetry: (action: string) => void;
  onFallback: (reason: string) => void;
}

export interface StandardPerformanceMonitoring {
  onMetric: (metric: string, value: number) => void;
  onEvent: (event: string, data: Record<string, any>) => void;
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from "./standardInterfaces";

// Re-export common types for convenience
export type { Language } from "@/context/contexts/LanguageContext";
