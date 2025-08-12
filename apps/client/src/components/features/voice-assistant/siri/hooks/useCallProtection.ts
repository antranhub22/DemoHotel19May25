import { Language } from '@/types/interface1.types';
import logger from '@shared/utils/logger';
import { useCallback, useEffect, useState } from 'react';

interface UseCallProtectionProps {
  isCallStarted: boolean;
  onCallStart: (lang: Language) => Promise<void>;
}

interface UseCallProtectionReturn {
  isConfirming: boolean;
  protectedOnCallStart: (lang: Language) => Promise<void>;
}

/**
 * Hook to manage call protection logic
 * Prevents restart during/after confirm state
 */
export const useCallProtection = ({
  isCallStarted,
  onCallStart,
}: UseCallProtectionProps): UseCallProtectionReturn => {
  const [isConfirming, setIsConfirming] = useState(false);

  // Reset confirming state when call ends
  useEffect(() => {
    if (!isCallStarted) {
      setIsConfirming(false);
    }
  }, [isCallStarted]);

  const protectedOnCallStart = useCallback(
    async (lang: Language) => {
      if (isConfirming) {
        logger.debug(
          '[useCallProtection] Call start blocked - confirming in progress',
          'Component'
        );
        return;
      }

      logger.debug(
        '[useCallProtection] Starting call normally...',
        'Component'
      );

      try {
        await onCallStart(lang);
        logger.debug(
          '[useCallProtection] Call started successfully',
          'Component'
        );
      } catch (error) {
        logger.error(
          '[useCallProtection] Error starting call:',
          'Component',
          error
        );
        throw error; // Re-throw to let parent handle
      }
    },
    [isConfirming, onCallStart]
  );

  return {
    isConfirming,
    protectedOnCallStart,
  };
};
