/**
 * Hooks - Public API
 * Custom React hooks for DemoHotel application
 */

// ========================================
// Responsive & Mobile Hooks
// ========================================
export * from "./use-mobile";
export { useSiriResponsiveSize } from "./useSiriResponsiveSize";
export { useSimplifiedMobileTouch } from "./useSimplifiedMobileTouch";

// ========================================
// UI & Behavior Hooks
// ========================================
export * from "./use-toast";
export * from "./useScrollBehavior";

// ========================================
// Voice Assistant Hooks
// ========================================
export * from "./useCallHandler";
export * from "./useConversationState";
export * from "./useInterface1";

// ========================================
// Button Handler Hooks
// ========================================
export { useCancelHandler } from "./useCancelHandler";
export { useConfirmHandler } from "./useConfirmHandler";
export { useSendToFrontDeskHandler } from "./useSendToFrontDeskHandler";

// ========================================
// Communication Hooks
// ========================================
export * from "./useTranscriptSocket";
export * from "./useWebSocket";

// ========================================
// Configuration Hooks
// ========================================
export * from "./useHotelConfiguration";
