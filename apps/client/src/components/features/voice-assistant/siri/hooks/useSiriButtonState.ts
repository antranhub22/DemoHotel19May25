import { logger } from '@shared/utils/logger';
import { useCallback, useRef, useState } from 'react';

interface UseSiriButtonStateProps {
  isListening: boolean;
  onCallStart?: () => Promise<void>;
  onCallEnd?: () => Promise<void>;
}

interface UseSiriButtonStateReturn {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  isHandlingClick: React.MutableRefObject<boolean>;
  handleCallAction: () => Promise<void>;
  setStatus: (status: 'idle' | 'listening' | 'processing' | 'speaking') => void;
}

export const useSiriButtonState = ({
  isListening,
  onCallStart,
  onCallEnd,
}: UseSiriButtonStateProps): UseSiriButtonStateReturn => {
  const [status, setStatus] = useState<
    'idle' | 'listening' | 'processing' | 'speaking'
  >('idle');
  const isHandlingClick = useRef<boolean>(false);

  const handleCallAction = useCallback(async () => {
    // Prevent double-firing
    if (isHandlingClick.current) {
      logger.debug(
        '[useSiriButtonState] Click already being handled, ignoring...',
        'Component'
      );
      return;
    }

    isHandlingClick.current = true;
    logger.debug('[useSiriButtonState] Starting call action', 'Component', {
      isListening,
      hasOnCallStart: !!onCallStart,
      hasOnCallEnd: !!onCallEnd,
    });

    try {
      if (!isListening && onCallStart) {
        // Start call
        setStatus('listening');
        logger.debug('[useSiriButtonState] Starting call...', 'Component');

        await onCallStart();
        logger.debug(
          '[useSiriButtonState] Call started successfully',
          'Component'
        );
      } else if (isListening && onCallEnd) {
        // End call
        setStatus('processing');
        logger.debug('[useSiriButtonState] Ending call...', 'Component');

        await onCallEnd();
        logger.debug(
          '[useSiriButtonState] Call ended successfully',
          'Component'
        );

        // Reset status after a short delay
        setTimeout(() => setStatus('idle'), 500);
      } else {
        logger.warn(
          '[useSiriButtonState] No action taken - conditions not met',
          'Component',
          {
            isListening,
            hasOnCallStart: !!onCallStart,
            hasOnCallEnd: !!onCallEnd,
          }
        );
      }
    } catch (error) {
      logger.error(
        '[useSiriButtonState] Error in call action:',
        'Component',
        error
      );
      setStatus('idle');
    } finally {
      // Reset handling flag after a short delay
      setTimeout(() => {
        isHandlingClick.current = false;
        logger.debug('[useSiriButtonState] Reset handling flag', 'Component');
      }, 100);
    }
  }, [isListening, onCallStart, onCallEnd]);

  return {
    status,
    isHandlingClick,
    handleCallAction,
    setStatus,
  };
};
