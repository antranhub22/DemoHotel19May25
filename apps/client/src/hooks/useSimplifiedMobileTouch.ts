import { useCallback } from 'react';
import { logger } from '@shared/utils/logger';
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
  debugEnabled = import.meta.env.DEV,
}: UseSimplifiedMobileTouchProps) => {
  const isMobile = isMobileDevice();
  const isEnabled = enabled && isMobile;

  // Simple test function for manual testing
  const manualTest = useCallback(async () => {
    if (debugEnabled) {
      logger.debug(
        '🧪 [useSimplifiedMobileTouch] Manual test call start',
        'Component'
      );
      if (onCallStart) {
        try {
          await onCallStart();
          logger.debug(
            '✅ [useSimplifiedMobileTouch] Manual test successful',
            'Component'
          );
        } catch (error) {
          logger.error(
            '❌ [useSimplifiedMobileTouch] Manual test failed:',
            'Component',
            error
          );
        }
      } else {
        logger.warn(
          '⚠️ [useSimplifiedMobileTouch] onCallStart not available for test',
          'Component'
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
