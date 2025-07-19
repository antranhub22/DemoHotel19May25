import { useEffect, useRef, useCallback } from 'react';
import { isMobileDevice } from '@/utils/deviceDetection';
import { SimplifiedMobileTouchHandler, TouchCallbacks, TouchHandlerConfig } from '@/components/siri/handlers/SimplifiedMobileTouchHandler';

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
  debugEnabled = process.env.NODE_ENV === 'development'
}: UseSimplifiedMobileTouchProps) => {
  const handlerRef = useRef<SimplifiedMobileTouchHandler | null>(null);
  const isMobile = isMobileDevice();

  // Create stable callback refs to avoid unnecessary re-initializations
  const callbacksRef = useRef<TouchCallbacks>({});
  
  // Update callbacks ref when props change
  useEffect(() => {
    callbacksRef.current = {
      onCallStart,
      onCallEnd,
      onInteractionStart,
      onInteractionEnd
    };

    // Update handler callbacks if it exists
    if (handlerRef.current) {
      handlerRef.current.updateCallbacks(callbacksRef.current);
    }
  }, [onCallStart, onCallEnd, onInteractionStart, onInteractionEnd]);

  // Initialize handler
  useEffect(() => {
    console.log('🔧 [useSimplifiedMobileTouch] useEffect triggered:', {
      isMobile,
      enabled,
      containerId
    });

    // Only initialize on mobile devices
    if (!isMobile || !enabled) {
      console.log('🔧 [useSimplifiedMobileTouch] Skipping initialization:', {
        isMobile,
        enabled
      });
      return;
    }

    console.log('🔧 [useSimplifiedMobileTouch] Proceeding with initialization');

    const config: TouchHandlerConfig = {
      containerId,
      isListening,
      enabled: true,
      debugEnabled
    };

    // Create handler if it doesn't exist
    if (!handlerRef.current) {
      handlerRef.current = new SimplifiedMobileTouchHandler(config, callbacksRef.current);
      
      // Initialize with retry logic
      const initializeWithRetry = () => {
        const success = handlerRef.current?.initialize();
        if (!success && handlerRef.current) {
          // Retry after a short delay if container not found
          setTimeout(() => {
            handlerRef.current?.initialize();
          }, 100);
        }
      };

      // Try immediate initialization
      initializeWithRetry();

      // Also try after a delay in case the DOM isn't ready
      setTimeout(initializeWithRetry, 200);
    }

    return () => {
      // Don't cleanup here - let the final useEffect handle it
    };
  }, [containerId, isMobile, enabled, debugEnabled]);

  // Update config when props change
  useEffect(() => {
    if (handlerRef.current && isMobile && enabled) {
      handlerRef.current.updateConfig({
        isListening,
        enabled: true,
        debugEnabled
      });
    }
  }, [isListening, enabled, debugEnabled, isMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (handlerRef.current) {
        handlerRef.current.cleanup();
        handlerRef.current = null;
      }
    };
  }, []);

  // Manual test function for debugging
  const testCallStart = useCallback(async () => {
    if (callbacksRef.current.onCallStart) {
      try {
        console.log('🧪 [useSimplifiedMobileTouch] Manual test call start');
        await callbacksRef.current.onCallStart();
        console.log('✅ [useSimplifiedMobileTouch] Manual test successful');
      } catch (error) {
        console.error('❌ [useSimplifiedMobileTouch] Manual test failed:', error);
      }
    } else {
      console.warn('⚠️ [useSimplifiedMobileTouch] onCallStart not available for test');
    }
  }, []);

  // Get handler state for debugging
  const getHandlerState = useCallback(() => {
    return handlerRef.current?.getState() || null;
  }, []);

  return {
    isMobile,
    isEnabled: isMobile && enabled,
    testCallStart,
    getHandlerState,
    handler: handlerRef.current
  };
}; 