import { useCallback } from 'react';
import { isMobileDevice } from '@/utils/deviceDetection';

interface UseSimplifiedMobileTouchProps {
  containerId: string;
  isListening: boolean;
  onCallStart?: () => Promise<void>;
  onCallEnd?: () => void;
  onInteractionStart?: (position: { x: number; y: number }) => void;
  onInteractionEnd?: () => void;
  enabled?: boolean;
  debugEnabled?: boolean;
}

export const useSimplifiedMobileTouch = ({
  containerId,
  isListening,
  onCallStart,
  onCallEnd,
  onInteractionStart,
  onInteractionEnd,
  enabled = true,
  debugEnabled = process.env.NODE_ENV === 'development',
}: UseSimplifiedMobileTouchProps) => {
  const isMobile = isMobileDevice();
  const isEnabled = enabled && isMobile;

  // Simple test function for manual testing
  const manualTest = useCallback(async () => {
    if (debugEnabled) {
      console.log('🧪 [useSimplifiedMobileTouch] Manual test call start');
      if (onCallStart) {
        try {
          await onCallStart();
          console.log('✅ [useSimplifiedMobileTouch] Manual test successful');
        } catch (error) {
          console.error(
            '❌ [useSimplifiedMobileTouch] Manual test failed:',
            error
          );
        }
      } else {
        console.warn(
          '⚠️ [useSimplifiedMobileTouch] onCallStart not available for test'
        );
      }
    }
  }, [onCallStart, debugEnabled]);

  return {
    isMobile,
    isEnabled,
    manualTest,
    // Legacy compatibility - provide handler state for existing code
    handlerState: {
      isInitialized: isEnabled,
      isProcessing: false,
      containerId,
      isListening,
    },
  };
};
