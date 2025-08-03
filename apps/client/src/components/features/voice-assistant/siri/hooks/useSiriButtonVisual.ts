import { isMobileDevice } from '@/utils/deviceDetection';
import { logger } from '@shared/utils/logger';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SiriButton } from '../SiriButton';

interface UseSiriButtonVisualProps {
  containerId: string;
  isListening: boolean;
  volumeLevel: number;
  colors?: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  };
}

interface UseSiriButtonVisualReturn {
  canvasReady: boolean;
  buttonRef: React.MutableRefObject<SiriButton | null>;
  cleanupCanvas: () => void;
}

export const useSiriButtonVisual = ({
  containerId,
  isListening,
  volumeLevel,
  colors,
}: UseSiriButtonVisualProps): UseSiriButtonVisualReturn => {
  const [canvasReady, setCanvasReady] = useState(false);
  const buttonRef = useRef<SiriButton | null>(null);
  const cleanupFlagRef = useRef<boolean>(false);

  const cleanupCanvas = useCallback(() => {
    if (cleanupFlagRef.current) {
      return;
    }
    cleanupFlagRef.current = true;

    try {
      if (buttonRef.current) {
        try {
          buttonRef.current.cleanup();
        } catch (error) {
          logger.warn(
            '[useSiriButtonVisual] Cleanup error:',
            'Component',
            error
          );
        }
        buttonRef.current = null;
      }

      const container = document.getElementById(containerId);
      if (container) {
        try {
          const canvases = container.querySelectorAll('canvas');
          canvases.forEach(canvas => {
            if (canvas.parentElement && document.contains(canvas)) {
              canvas.parentElement.removeChild(canvas);
            }
          });
        } catch (error) {
          logger.error(
            '[useSiriButtonVisual] Failed to remove canvases:',
            'Component',
            error
          );
        }
      }

      setCanvasReady(false);
    } catch (error) {
      logger.error(
        '[useSiriButtonVisual] Safe cleanup failed:',
        'Component',
        error
      );
    }
  }, [containerId]);

  // Initialize SiriButton for desktop
  useEffect(() => {
    const isMobile = isMobileDevice();

    // Skip SiriButton creation on mobile - using visual-only mode
    if (isMobile) {
      logger.debug(
        '[useSiriButtonVisual] Mobile device - using visual only mode',
        'Component'
      );
      setCanvasReady(true);
      return () => {
        cleanupFlagRef.current = false;
      };
    }

    cleanupFlagRef.current = false;

    const element = document.getElementById(containerId);
    if (!element) {
      logger.warn(
        '[useSiriButtonVisual] Container element not found:',
        'Component',
        containerId
      );
      return;
    }

    // Clear existing content
    const existingCanvases = element.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => {
      if (canvas.parentElement && document.contains(canvas)) {
        canvas.parentElement.removeChild(canvas);
      }
    });

    // Create SiriButton for desktop
    try {
      buttonRef.current = new SiriButton(containerId, colors);
      setCanvasReady(true);
      logger.debug(
        '[useSiriButtonVisual] SiriButton created successfully',
        'Component'
      );
    } catch (error) {
      logger.error(
        '[useSiriButtonVisual] Failed to create SiriButton:',
        'Component',
        error
      );
      setCanvasReady(false);
    }

    return () => {
      cleanupCanvas();
    };
  }, [containerId, colors, cleanupCanvas]);

  // Sync visual state with props
  useEffect(() => {
    if (buttonRef.current && !cleanupFlagRef.current) {
      buttonRef.current.setListening(isListening);
      logger.debug(
        '[useSiriButtonVisual] Listening state updated',
        'Component',
        { isListening }
      );
    }
  }, [isListening]);

  useEffect(() => {
    if (buttonRef.current && !cleanupFlagRef.current) {
      buttonRef.current.setVolumeLevel(volumeLevel);
      logger.debug('[useSiriButtonVisual] Volume level updated', 'Component', {
        volumeLevel,
      });
    }
  }, [volumeLevel]);

  useEffect(() => {
    if (buttonRef.current && colors && !cleanupFlagRef.current) {
      buttonRef.current.updateColors(colors);
      logger.debug('[useSiriButtonVisual] Colors updated', 'Component', {
        colors,
      });
    }
  }, [colors]);

  return {
    canvasReady,
    buttonRef,
    cleanupCanvas,
  };
};
