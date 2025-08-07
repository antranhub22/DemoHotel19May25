import { isMobileDevice } from '@/utils/deviceDetection';
import logger from '@shared/utils/logger';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TouchDebugInfo {
  deviceInfo: {
    isMobile: boolean;
    userAgent: string;
    hasTouch: boolean;
    maxTouchPoints: number;
    screen: string;
    viewport: string;
    dpr: number;
  };
  containerInfo: {
    found: boolean;
    rect: DOMRect | null;
    style: any;
    computedStyle: any;
    eventListeners: string[];
  };
  touchEvents: Array<{
    timestamp: number;
    type: string;
    target: string;
    position: { x: number; y: number };
    touches: number;
    prevented: boolean;
  }>;
  callbackStatus: {
    onCallStartAvailable: boolean;
    onCallEndAvailable: boolean;
    isListening: boolean;
    lastCallAttempt: number | null;
    callAttempts: number;
  };
}

interface UseTouchDebuggerProps {
  containerId: string;
  onCallStart?: () => Promise<void>;
  onCallEnd?: () => void;
  isListening: boolean;
  enabled?: boolean;
}

export const useTouchDebugger = ({
  containerId,
  onCallStart,
  onCallEnd,
  isListening,
  enabled = true,
}: UseTouchDebuggerProps) => {
  const [debugInfo, setDebugInfo] = useState<TouchDebugInfo | null>(null);
  const touchEventsRef = useRef<TouchDebugInfo['touchEvents']>([]);
  const callAttemptsRef = useRef(0);
  const lastCallAttemptRef = useRef<number | null>(null);

  const updateDebugInfo = useCallback(() => {
    const container = document.getElementById(containerId);

    const deviceInfo = {
      isMobile: isMobileDevice(),
      userAgent: navigator.userAgent,
      hasTouch: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      dpr: window.devicePixelRatio || 1,
    };

    const containerInfo = {
      found: !!container,
      rect: container?.getBoundingClientRect() || null,
      style: container
        ? {
            position: container.style.position,
            zIndex: container.style.zIndex,
            pointerEvents: container.style.pointerEvents,
          }
        : null,
      computedStyle: container ? window.getComputedStyle(container) : null,
      eventListeners: [], // Simplified - actual implementation would be complex
    };

    const callbackStatus = {
      onCallStartAvailable: !!onCallStart,
      onCallEndAvailable: !!onCallEnd,
      isListening,
      lastCallAttempt: lastCallAttemptRef.current,
      callAttempts: callAttemptsRef.current,
    };

    setDebugInfo({
      deviceInfo,
      containerInfo,
      touchEvents: [...touchEventsRef.current],
      callbackStatus,
    });
  }, [containerId, onCallStart, onCallEnd, isListening]);

  const logTouchEvent = useCallback(
    (e: TouchEvent) => {
      const eventInfo = {
        timestamp: Date.now(),
        type: e.type,
        target: (e.target as Element)?.tagName || 'unknown',
        position: {
          x: e.touches[0]?.clientX || 0,
          y: e.touches[0]?.clientY || 0,
        },
        touches: e.touches.length,
        prevented: e.defaultPrevented,
      };

      touchEventsRef.current = [
        eventInfo,
        ...touchEventsRef.current.slice(0, 9),
      ]; // Keep last 10 events
      updateDebugInfo();
    },
    [updateDebugInfo]
  );

  const testCallStart = useCallback(async () => {
    try {
      callAttemptsRef.current += 1;
      lastCallAttemptRef.current = Date.now();
      if (onCallStart) {
        await onCallStart();
        logger.debug('[TouchDebugger] Test call start successful', 'Component');
      }
    } catch (error) {
      logger.error(
        '[TouchDebugger] Test call start failed:',
        'Component',
        error
      );
    }
    updateDebugInfo();
  }, [onCallStart, updateDebugInfo]);

  const testCallEnd = useCallback(() => {
    try {
      if (onCallEnd) {
        onCallEnd();
        logger.debug('[TouchDebugger] Test call end successful', 'Component');
      }
    } catch (error) {
      logger.error('[TouchDebugger] Test call end failed:', 'Component', error);
    }
    updateDebugInfo();
  }, [onCallEnd, updateDebugInfo]);

  useEffect(() => {
    if (!enabled || !isMobileDevice()) {
      return;
    }

    updateDebugInfo();

    const container = document.getElementById(containerId);
    if (!container) {
      logger.warn(
        `[TouchDebugger] Container ${containerId} not found`,
        'Component'
      );
      return;
    }

    // Add touch event logging
    const touchEvents = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
    touchEvents.forEach(eventType => {
      container.addEventListener(eventType, logTouchEvent as EventListener, {
        passive: false,
      });
      document.addEventListener(eventType, logTouchEvent as EventListener, {
        passive: false,
      });
    });

    const interval = setInterval(updateDebugInfo, 2000);

    return () => {
      touchEvents.forEach(eventType => {
        container.removeEventListener(
          eventType,
          logTouchEvent as EventListener
        );
        document.removeEventListener(eventType, logTouchEvent as EventListener);
      });
      clearInterval(interval);
    };
  }, [containerId, enabled, logTouchEvent, updateDebugInfo]);

  return {
    debugInfo,
    testCallStart,
    testCallEnd,
    isEnabled: enabled && isMobileDevice(),
  };
};
