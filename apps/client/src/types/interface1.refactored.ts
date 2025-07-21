import { RefObject } from 'react';
import { Language } from './interface1.types';

/**
 * Interface1 Refactored - Type Definitions
 *
 * Comprehensive type system for the refactored Interface1 architecture
 * Ensures type safety across all modular components and hooks
 */

// ============================================
// Hook Type Definitions
// ============================================

/**
 * Layout Management Types
 */
export interface Interface1Layout {
  refs: {
    heroSectionRef: RefObject<HTMLDivElement>;
    serviceGridRef: RefObject<HTMLDivElement>;
    conversationRef: RefObject<HTMLDivElement>;
    rightPanelRef: RefObject<HTMLDivElement>;
  };
}

/**
 * State Management Types
 */
export interface Interface1State {
  // Loading & Error states
  isLoading: boolean;
  error: string | null;
  hotelConfig: any;

  // Assistant data
  micLevel: number;
  transcripts: any[];
  callSummary: any;
  serviceRequests: any[];
  language: Language;

  // UI states
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
  conversationPopupId: string | null;
  setConversationPopupId: (id: string | null) => void;
}

/**
 * Event Handlers Types
 */
export interface Interface1Handlers {
  // Conversation state
  isCallStarted: boolean;
  showConversation: boolean;

  // Call handlers
  handleCallStart: (
    lang: Language
  ) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => void;
  handleCancel: () => void;
  handleConfirm: () => void;

  // UI handlers
  handleRightPanelToggle: () => void;
  handleRightPanelClose: () => void;
}

/**
 * Scroll Behavior Types
 */
export interface Interface1Scroll {
  showScrollButton: boolean;
  scrollToTop: () => void;
  scrollToSection: (section: 'hero' | 'services' | 'conversation') => void;
}

/**
 * Popup Management Types
 */
export interface Interface1Popups {
  handleShowConversationPopup: () => void;
  handleShowNotificationDemo: () => void;
  handleShowSummaryDemo: () => void;
}

// ============================================
// Component Type Definitions
// ============================================

/**
 * Layout Components Types
 */
export interface ResponsiveContainerProps {
  children: {
    desktop: React.ReactNode;
    mobile: React.ReactNode;
  };
  className?: string;
}

export interface DesktopLayoutProps {
  conversation: React.ReactNode;
  siriButton: React.ReactNode;
  rightPanel: React.ReactNode;
  className?: string;
}

export interface MobileLayoutProps {
  siriButton: React.ReactNode;
  conversation: React.ReactNode;
  rightPanel: React.ReactNode;
  className?: string;
}

/**
 * Section Components Types
 */
export interface CallSectionProps {
  state: {
    isCallStarted: boolean;
    showConversation: boolean;
    showRightPanel: boolean;
    micLevel: number;
  };
  handlers: {
    handleCallStart: (
      lang: Language
    ) => Promise<{ success: boolean; error?: string }>;
    handleCallEnd: () => void;
    handleCancel: () => void;
    handleConfirm: () => void;
    handleRightPanelClose: () => void;
  };
  refs: {
    conversationRef: RefObject<HTMLDivElement>;
    rightPanelRef: RefObject<HTMLDivElement>;
  };
  className?: string;
}

// ============================================
// Main Hook & Component Types
// ============================================

/**
 * Main useInterface1 Hook Props
 */
export interface UseInterface1Props {
  isActive: boolean;
}

/**
 * Main useInterface1 Hook Return Type
 *
 * This maintains 100% compatibility with the original API
 * while being backed by modular hooks internally
 */
export interface UseInterface1Return {
  // Loading & Error states
  isLoading: boolean;
  error: string | null;
  hotelConfig: any;

  // Assistant integration
  micLevel: number;

  // Scroll behavior
  showScrollButton: boolean;
  scrollToTop: () => void;
  scrollToSection: (section: 'hero' | 'services' | 'conversation') => void;
  heroSectionRef: RefObject<HTMLDivElement>;
  serviceGridRef: RefObject<HTMLDivElement>;
  conversationRef: RefObject<HTMLDivElement>;
  rightPanelRef: RefObject<HTMLDivElement>;

  // Conversation state
  isCallStarted: boolean;
  showConversation: boolean;
  handleCallStart: (
    lang: Language
  ) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => void;
  handleCancel: () => void;
  handleConfirm: () => void;

  // Right panel state
  showRightPanel: boolean;
  handleRightPanelToggle: () => void;
  handleRightPanelClose: () => void;

  // Popup system demo functions
  handleShowConversationPopup: () => void;
  handleShowNotificationDemo: () => void;
  handleShowSummaryDemo: () => void;
}

/**
 * Main Interface1 Component Props
 */
export interface Interface1Props {
  isActive: boolean;
}

// ============================================
// Utility Types
// ============================================

/**
 * Hook Dependencies Type
 *
 * Used to type the dependencies passed between modular hooks
 */
export interface HookDependencies {
  state: Interface1State;
  layout: Interface1Layout;
}

/**
 * Component References Type
 *
 * Central type for all component refs used in Interface1
 */
export interface ComponentRefs {
  heroSection: RefObject<HTMLDivElement>;
  serviceGrid: RefObject<HTMLDivElement>;
  conversation: RefObject<HTMLDivElement>;
  rightPanel: RefObject<HTMLDivElement>;
}

/**
 * Call State Union Type
 */
export type CallState = 'idle' | 'starting' | 'active' | 'ending' | 'error';

/**
 * UI State Union Type
 */
export type UIState = 'loading' | 'ready' | 'error';

/**
 * Layout Mode Union Type
 */
export type LayoutMode = 'desktop' | 'mobile';

// ============================================
// Type Guards
// ============================================

/**
 * Type guard to check if component is in loading state
 */
export const isLoadingState = (state: Interface1State): boolean => {
  return state.isLoading || !state.hotelConfig;
};

/**
 * Type guard to check if component has error
 */
export const hasError = (
  state: Interface1State
): state is Interface1State & { error: string } => {
  return state.error !== null;
};

/**
 * Type guard to check if call is active
 */
export const isCallActive = (handlers: Interface1Handlers): boolean => {
  return handlers.isCallStarted;
};

// ============================================
// Re-exports
// ============================================

// Re-export existing types for convenience
export type { Language } from './interface1.types';
