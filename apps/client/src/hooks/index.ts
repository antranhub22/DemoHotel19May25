/**
 * Hooks - Public API
 * Custom React hooks for DemoHotel application
 */

// ========================================
// Responsive & Mobile Hooks
// ========================================
export * from './use-mobile.tsx';
export { useSiriResponsiveSize } from './useSiriResponsiveSize.ts';
export { useSimplifiedMobileTouch } from './useSimplifiedMobileTouch.ts';

// ========================================
// UI & Behavior Hooks
// ========================================
export * from './use-toast.ts';
export * from './useScrollBehavior.ts';

// ========================================
// Voice Assistant Hooks
// ========================================
export * from "./useCallHandler";
export * from './useConversationState.ts';
export * from './useInterface1.ts';

// ========================================
// Button Handler Hooks
// ========================================
export { useCancelHandler } from "./useCancelHandler";
export { useConfirmHandler } from './useConfirmHandler.ts';
export { useSendToFrontDeskHandler } from './useSendToFrontDeskHandler.ts';

// ========================================
// Communication Hooks
// ========================================
export * from './useTranscriptSocket.ts';
export * from './useWebSocket.ts';

// ========================================
// Configuration Hooks
// ========================================
export * from './useHotelConfiguration.ts';
