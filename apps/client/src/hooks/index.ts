/**
 * Barrel exports for hooks directory
 */

export * from './use-mobile';
export * from './use-toast';
export * from './useCallHandler';
export * from './useConversationState';
export * from './useHotelConfiguration';
export * from './useInterface1';
export * from './useScrollBehavior';
export * from './useTranscriptSocket';
export * from './useWebSocket';
// Export only the main hook to avoid conflicts with existing useIsMobile
export { useSiriResponsiveSize } from './useSiriResponsiveSize';
export { useSimplifiedMobileTouch } from './useSimplifiedMobileTouch';
export { useCancelHandler } from './useCancelHandler';
export { useConfirmHandler } from './useConfirmHandler';
export { useSendToFrontDeskHandler } from './useSendToFrontDeskHandler'; 