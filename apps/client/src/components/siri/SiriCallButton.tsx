import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SiriButton } from './SiriButton';
import { isMobileDevice, logDeviceInfo } from '@/utils/deviceDetection';
import '../../styles/voice-interface.css';
import { Language } from '@/types/interface1.types';

interface SiriCallButtonProps {
  containerId: string;
  isListening: boolean;
  onCallStart: () => void;
  onCallEnd: () => void;
  volumeLevel: number;
  language: Language;
  colors?: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  };
}

const SiriCallButton: React.FC<SiriCallButtonProps> = ({
  isListening,
  volumeLevel,
  containerId,
  onCallStart,
  onCallEnd,
  language,
  colors
}) => {
  // 🎯 STATE MANAGEMENT
  const buttonRef = useRef<SiriButton | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const cleanupFlagRef = useRef<boolean>(false);
  
  // UI State
  const [canvasReady, setCanvasReady] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'speaking'>('idle');
  
  // Debug flags
  const DEBUG_LEVEL = parseInt(process.env.NODE_ENV === 'development' ? '2' : '0');
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  // Emergency management
  const maxInitAttempts = 3;
  const initAttemptCount = useRef<number>(0);
  const emergencyStopRequested = useRef<boolean>(false);

  // Modular SiriButton handles all mobile interactions now

  // 🚨 PHASE 1: SAFE CLEANUP - Enhanced cleanup with better error handling
  const safeCleanup = useCallback(() => {
    if (cleanupFlagRef.current) return;
    cleanupFlagRef.current = true;
    
    try {
      if (buttonRef.current) {
        try {
          buttonRef.current.cleanup();
        } catch (error) {
          console.warn('Cleanup error:', error);
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
          console.warn('Canvas cleanup error:', error);
        }
      }
      
    } catch (error) {
      console.error('General cleanup error:', error);
    }
  }, [containerId]);

  // Debug helpers
  const debug = useCallback((message: string, ...args: any[]) => {
    if (DEBUG_LEVEL >= 1) {
      console.log(`[SiriCallButton] ${message}`, ...args);
    }
  }, [DEBUG_LEVEL]);

  const debugWarn = useCallback((message: string, ...args: any[]) => {
    if (DEBUG_LEVEL >= 1) {
      console.warn(`[SiriCallButton] ${message}`, ...args);
    }
  }, [DEBUG_LEVEL]);

  const debugError = useCallback((message: string, ...args: any[]) => {
    console.error(`[SiriCallButton] ${message}`, ...args);
  }, []);

  // 🚨 EMERGENCY STOP HANDLER
  const triggerEmergencyStop = useCallback((reason: string) => {
    debugError(`🚨 EMERGENCY STOP: ${reason}`);
    emergencyStopRequested.current = true;
    
    try {
      safeCleanup();
      setCanvasReady(false);
      setStatus('idle');
    } catch (error) {
      debugError('Emergency stop cleanup failed:', error);
    }
  }, [safeCleanup, debugError]);

  // 🚨 PHASE 1: SAFE INITIALIZATION - Initialize SiriButton with emergency guards
  useEffect(() => {
    const isMobile = isMobileDevice();
    
    // 🚨 EMERGENCY: Check if emergency stop was requested
    if (emergencyStopRequested.current) {
      debugWarn('Skipping initialization due to emergency stop');
      return;
    }

    // 🚨 EMERGENCY: Check initialization attempt count
    initAttemptCount.current++;
    if (initAttemptCount.current > maxInitAttempts) {
      debugError('Too many initialization attempts, triggering emergency stop');
      triggerEmergencyStop('Max initialization attempts reached');
      return;
    }

    debug('🚀 [INIT] Starting initialization', { 
      attempt: initAttemptCount.current,
      isMobile,
      containerId 
    });

    let isInitializing = true;
    const initStartTime = Date.now();

    const initializeButton = async () => {
      try {
        // Get container reference
        const container = document.getElementById(containerId);
        containerRef.current = container;
        
        if (!container) {
          throw new Error(`Container with ID "${containerId}" not found`);
        }

        debug('✅ [INIT] Container found', { containerId });

        // Clear any existing canvases
        const existingCanvases = container.querySelectorAll('canvas');
        existingCanvases.forEach(canvas => {
          if (canvas.parentElement) {
            canvas.parentElement.removeChild(canvas);
          }
        });

        // Create and setup canvas
        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
        container.appendChild(canvas);

        debug('✅ [INIT] Canvas created and appended');

        // Initialize SiriButton with timeout protection
        const initTimeout = setTimeout(() => {
          if (isInitializing) {
            triggerEmergencyStop('Initialization timeout');
          }
        }, 10000); // 10 second timeout

        // Check for max attempts before creating SiriButton
        if (initAttemptCount.current < maxInitAttempts) {
          debug('✅ [INIT] Creating SiriButton instance...');
          
                     buttonRef.current = new SiriButton(containerId, colors);

          debug('✅ [INIT] SiriButton created successfully');
        } else {
          debugError('Max init attempts reached, triggering emergency stop');
          clearTimeout(initTimeout);
          triggerEmergencyStop('Max initialization attempts reached');
          return;
        }

        clearTimeout(initTimeout);
        isInitializing = false;

        // Set ready state
        setCanvasReady(true);
        setStatus('idle');
        
        const initDuration = Date.now() - initStartTime;
        debug('🎉 [INIT] Initialization completed successfully', { 
          duration: `${initDuration}ms`,
          attempt: initAttemptCount.current 
        });

      } catch (error) {
        isInitializing = false;
        debugError('❌ [INIT] Initialization failed:', error);
        
        if (initAttemptCount.current >= maxInitAttempts) {
          triggerEmergencyStop('Initialization failed after max attempts');
        } else {
          // Try again after delay
          setTimeout(() => {
            if (!emergencyStopRequested.current) {
              debug('🔄 [INIT] Retrying initialization...');
              initializeButton();
            }
          }, 1000);
        }
      }
    };

    // Start initialization
    initializeButton();

    // Cleanup function
    return () => {
      isInitializing = false;
      safeCleanup();
    };
  }, [containerId, onCallStart, onCallEnd, language, colors, DEBUG_LEVEL, debug, debugWarn, debugError, triggerEmergencyStop, safeCleanup]);

  // 🚨 PHASE 2: SAFE INTERACTION HANDLERS
  useEffect(() => {
    if (!buttonRef.current || !canvasReady) return;

    const button = buttonRef.current;
    debug('🎯 [INTERACTION] Setting up interaction handlers');

    // Setup container click handler with emergency protection
    const container = document.getElementById(containerId);
    if (!container) {
      debugWarn('Container not found for interaction setup');
      return;
    }

    const handleContainerInteraction = async (event: Event) => {
      try {
        if (emergencyStopRequested.current) {
          debugWarn('Interaction blocked - emergency stop active');
          return;
        }

        debug('🎯 [INTERACTION] Container interaction detected');
        
        // Handle the interaction based on current state
        if (isListening) {
          debug('🔴 [INTERACTION] Stopping call (was listening)');
          if (onCallEnd) {
            await onCallEnd();
          }
        } else {
          debug('🔵 [INTERACTION] Starting call (was idle)');
          if (onCallStart) {
            await onCallStart();
          }
        }
      } catch (error) {
        debugError('❌ [INTERACTION] Handler error:', error);
      }
    };

    // Add event listeners
    container.addEventListener('click', handleContainerInteraction);
    container.addEventListener('touchend', handleContainerInteraction);

    return () => {
      container.removeEventListener('click', handleContainerInteraction);
      container.removeEventListener('touchend', handleContainerInteraction);
    };
  }, [canvasReady, isListening, onCallStart, onCallEnd, containerId, debug, debugWarn, debugError]);

  // 🚨 PHASE 3: VISUAL STATE UPDATES
  useEffect(() => {
    if (!buttonRef.current || !canvasReady) return;

    try {
             buttonRef.current.setListening(isListening);
      debug('✅ [STATE] Updated listening state', { isListening });
    } catch (error) {
      debugError('❌ [STATE] Failed to update listening state:', error);
    }
  }, [isListening, canvasReady, debug, debugError]);

  useEffect(() => {
    if (!buttonRef.current || !canvasReady) return;

    try {
             buttonRef.current.setVolumeLevel(volumeLevel);
      debug('✅ [STATE] Updated volume level', { volumeLevel });
    } catch (error) {
      debugError('❌ [STATE] Failed to update volume level:', error);
    }
  }, [volumeLevel, canvasReady, debug, debugError]);

  // 🎨 PHASE 4: RENDER
  return (
    <div
      id={containerId}
      className="siri-call-button-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        overflow: 'hidden',
        cursor: 'pointer',
        touchAction: 'manipulation',
        background: 'rgba(255, 0, 0, 0.1)', // 🚨 TEMPORARY: Red background for testing
        border: DEBUG_LEVEL >= 1 ? '2px solid yellow' : 'none'
      }}
    >
      {/* Error Injection for Testing - Only in development */}
      {DEBUG_LEVEL >= 2 && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('🧪 [SiriCallButton] Debug injection active');
              window.testSiriError = () => {
                console.log('🧪 [SiriCallButton] Triggering test error...');
                throw new Error('Test error for debugging');
              };
              
              setTimeout(() => {
                console.log('🧪 [SiriCallButton] Testing canvas detection...');
                const canvas = document.querySelector('#${containerId} canvas');
                console.log('🧪 [SiriCallButton] Canvas found:', !!canvas, canvas);
                if (canvas) {
                  console.log('🧪 [SiriCallButton] Canvas dimensions:', {
                    width: canvas.width,
                    height: canvas.height,
                    style: canvas.style.cssText
                  });
                }
              }, 500);
            `
          }}
        />
      )}

      {/* Loading state */}
      {!canvasReady && (
        <div 
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Loading...
        </div>
      )}

      {/* Status display */}
      {(status === 'processing' || status === 'speaking') && (
        <div
          className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold z-50"
          style={{
            background: status === 'processing' ? '#ff9800' : '#4caf50',
            color: 'white'
          }}
        >
          {status === 'processing' ? 'Processing...' : 'Speaking...'}
        </div>
      )}
    </div>
  );
};

export default SiriCallButton; 