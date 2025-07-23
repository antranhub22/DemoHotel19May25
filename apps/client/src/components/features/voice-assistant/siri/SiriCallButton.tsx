/// <reference types="vite/client" />

// Type declaration for import.meta

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SiriButton } from './SiriButton';
import { SimpleMobileSiriVisual } from './SimpleMobileSiriVisual';
import { isMobileDevice, logDeviceInfo } from '@/utils/deviceDetection';

import '../../../../styles/voice-interface.css';
import { logger } from '@shared/utils/logger';
interface SiriCallButtonProps {
  isListening: boolean;
  volumeLevel: number;
  containerId: string;
  onCallStart?: () => Promise<void>;
  onCallEnd?: () => void;
  language?: Language;
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
  language = 'en',
  colors,
}) => {
  // Component render debug - Development only
  if (import.meta.env.DEV) {
    logger.debug(
      `[SiriCallButton] Component render - Container: ${containerId}, onCallStart: ${!!onCallStart}, Mobile: ${/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}`,
      'Component'
    );
  }

  // 🔧 PHASE 2: DEBUG CONTROL - Emergency debug level control
  const DEBUG_LEVEL = import.meta.env.DEV ? 1 : 0; // 0: off, 1: errors only, 2: all

  // Debug utility methods - Environment aware
  const debug = (message: string, ...args: any[]) => {
    if (import.meta.env.DEV && DEBUG_LEVEL >= 2) {
      logger.debug('[SiriCallButton] ${message}', 'Component', ...args);
    }
  };

  const debugWarn = (message: string, ...args: any[]) => {
    if (import.meta.env.DEV && DEBUG_LEVEL >= 1) {
      logger.warn('[SiriCallButton] ${message}', 'Component', ...args);
    }
  };

  const debugError = (message: string, ...args: any[]) => {
    // Always show errors, even in production
    logger.error('[SiriCallButton] ${message}', 'Component', ...args);
  };

  const buttonRef = useRef<SiriButton | null>(null);
  const cleanupFlagRef = useRef<boolean>(false);
  const [status, setStatus] = useState<
    'idle' | 'listening' | 'processing' | 'speaking'
  >('idle');
  const [canvasReady, setCanvasReady] = useState(false);

  // 🚨 PHASE 1: EMERGENCY GUARDS - Prevent double firing and infinite loops
  const isHandlingClick = useRef<boolean>(false);
  const initAttemptCount = useRef<number>(0);
  const maxInitAttempts = 3;
  const emergencyStopRequested = useRef<boolean>(false);

  // Mobile optimization - Using direct JSX event handlers (handleDirectTouch)

  // 🚨 PHASE 1: SAFE CLEANUP - Enhanced cleanup with better error handling
  const safeCleanup = useCallback(() => {
    if (cleanupFlagRef.current) {
      return;
    }
    cleanupFlagRef.current = true;

    try {
      if (buttonRef.current) {
        try {
          buttonRef.current.cleanup();
        } catch (error) {
          debugWarn('Cleanup error:', error);
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
          debugError('Failed to remove canvases:', error);
        }
      }

      setCanvasReady(false);
    } catch (error) {
      debugError('Safe cleanup failed:', error);
    }
  }, [containerId]);

  // 🚨 PHASE 1: EMERGENCY STOP - Force stop all operations
  const emergencyStop = useCallback(() => {
    debugWarn('🚨 EMERGENCY STOP TRIGGERED');
    emergencyStopRequested.current = true;

    try {
      // Stop SiriButton if exists
      if (buttonRef.current) {
        try {
          if (typeof buttonRef.current.emergencyStopPublic === 'function') {
            buttonRef.current.emergencyStopPublic();
          }
        } catch (error) {
          debugError('Failed to emergency stop SiriButton:', error);
        }
      }

      // Force cleanup
      safeCleanup();

      debugWarn('🚨 EMERGENCY STOP COMPLETED');
    } catch (error) {
      debugError('Emergency stop failed:', error);
    }
  }, [safeCleanup]);

  // ✅ CENTRALIZED interaction handlers
  const handleInteractionStart = useCallback(
    (e: Event, position?: { x: number; y: number }) => {
      if (buttonRef.current) {
        buttonRef.current.setInteractionMode('active');
        if (position) {
          buttonRef.current.setTouchPosition(position.x, position.y);
        }
      }
      debug('🎯 [SiriCallButton] Interaction start:', { position });
    },
    []
  );

  const handleInteractionEnd = useCallback(
    async (e: Event) => {
      debug('🔔 [SiriCallButton] 🎯 INTERACTION END STARTED');
      debug('  🎯 Event type:', e.type);
      debug('  🎯 Event target:', e.target);

      if (buttonRef.current) {
        buttonRef.current.setInteractionMode('idle');
        debug('  ✅ Visual state set to idle');
      }

      // Business logic - prevent double-firing
      if (isHandlingClick.current) {
        debug(
          '🔔 [SiriCallButton] ⚠️ Click already being handled, ignoring...'
        );
        return;
      }

      isHandlingClick.current = true;
      debug('🔔 [SiriCallButton] 🚀 BUSINESS LOGIC STARTING');
      debug('  🎧 isListening:', isListening);
      debug('  ✅ onCallStart available:', !!onCallStart);
      debug('  ✅ onCallEnd available:', !!onCallEnd);

      try {
        if (!isListening && onCallStart) {
          setStatus('listening');
          debug(
            '🎤 [SiriCallButton] 🟢 STARTING CALL - Calling onCallStart()...'
          );
          try {
            await onCallStart();
            debug(
              '🎤 [SiriCallButton] ✅ onCallStart() completed successfully'
            );
          } catch (error) {
            debugError('🎤 [SiriCallButton] ❌ onCallStart() error:', error);
            setStatus('idle');
          }
        } else if (isListening && onCallEnd) {
          setStatus('processing');
          debug('🛑 [SiriCallButton] 🔴 ENDING CALL - Calling onCallEnd()...');
          onCallEnd();
          debug('🛑 [SiriCallButton] ✅ onCallEnd() completed');
          setTimeout(() => setStatus('idle'), 500);
        } else {
          debug('🔔 [SiriCallButton] ⚠️ NO ACTION TAKEN:');
          debug('  🎧 isListening:', isListening);
          debug('  🎤 onCallStart available:', !!onCallStart);
          debug('  🛑 onCallEnd available:', !!onCallEnd);
        }
      } finally {
        setTimeout(() => {
          isHandlingClick.current = false;
          debug('🔔 [SiriCallButton] 🔓 isHandlingClick reset to false');
        }, 100);
      }

      debug('🔔 [SiriCallButton] 🎯 INTERACTION END COMPLETED');
    },
    [isListening, onCallStart, onCallEnd]
  );

  const handleHover = useCallback((isHovered: boolean) => {
    if (buttonRef.current) {
      buttonRef.current.setInteractionMode(isHovered ? 'hover' : 'idle');
    }
  }, []);

  // 🚨 PHASE 1: SAFE INITIALIZATION - Initialize SiriButton with emergency guards
  useEffect(() => {
    const isMobile = isMobileDevice();

    // Skip SiriButton creation on mobile - using visual-only mode
    if (isMobile) {
      debug(
        '[SiriCallButton] Bypassing SiriButton creation - using mobile visual only'
      );
      setCanvasReady(true); // Set ready immediately for mobile visual
      return () => {
        // 🛡️ SAFETY: Reset protection flags for mobile
        isHandlingClick.current = false;
        debug(
          '🛡️ [SiriCallButton] Mobile cleanup - isHandlingClick reset to false'
        );
      };
    }

    // 🚨 EMERGENCY: Check if emergency stop was requested
    if (emergencyStopRequested.current) {
      debugWarn('Skipping initialization due to emergency stop');
      return;
    }

    // 🚨 EMERGENCY: Check initialization attempt count
    initAttemptCount.current++;
    if (initAttemptCount.current > maxInitAttempts) {
      debugError('Too many initialization attempts, triggering emergency stop');
      emergencyStop();
      return;
    }

    cleanupFlagRef.current = false;

    // 🚨 FIX: Reset emergency stop flag on re-initialization
    emergencyStopRequested.current = false;
    debug('🔄 [SiriCallButton] Emergency stop flag reset on re-initialization');

    const element = document.getElementById(containerId);
    if (!element) {
      debugWarn('Container element not found:', containerId);
      return;
    }

    // Clear existing content
    const existingCanvases = element.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => {
      if (canvas.parentElement && document.contains(canvas)) {
        canvas.parentElement.removeChild(canvas);
      }
    });

    // 🚨 PHASE 1: SAFE INITIALIZATION - Try-catch for SiriButton creation
    try {
      buttonRef.current = new SiriButton(containerId, colors);
      setCanvasReady(true);

      // 🔧 FIX 4: Single resize trigger for better mobile performance
      setTimeout(() => {
        if (
          buttonRef.current &&
          !cleanupFlagRef.current &&
          !emergencyStopRequested.current
        ) {
          debug('🔧 [SiriCallButton] Single resize for mobile compatibility');
          window.dispatchEvent(new Event('resize'));
        }
      }, 200);
    } catch (error) {
      debugError('Init error:', error);

      // 🚨 PHASE 1: SAFE RETRY - Limited retry with emergency guards
      if (initAttemptCount.current < maxInitAttempts) {
        setTimeout(() => {
          if (!cleanupFlagRef.current && !emergencyStopRequested.current) {
            try {
              buttonRef.current = new SiriButton(containerId, colors);
              setCanvasReady(true);
              debug(
                '🔧 [SiriCallButton] Retry successful - no additional resize needed'
              );
            } catch (retryError) {
              debugError('Retry failed:', retryError);
              if (initAttemptCount.current >= maxInitAttempts) {
                emergencyStop();
              }
            }
          }
        }, 200);
      } else {
        debugError('Max init attempts reached, triggering emergency stop');
        emergencyStop();
      }
    }

    // ✅ DEVICE-SPECIFIC event setup with centralized handlers
    const isMobileDevice_local = isMobileDevice();

    logDeviceInfo('SiriCallButton');
    logger.debug(
      '📱 [SiriCallButton] Device detection - isMobile:',
      'Component',
      isMobileDevice_local
    );

    // Mobile devices use JSX direct event handlers (handleDirectTouch)
    // Desktop gets mouse events for hover effects
    if (isMobileDevice_local) {
      if (import.meta.env.DEV) {
        logger.debug(
          '[SiriCallButton] Mobile device detected - using direct JSX handlers',
          'Component'
        );
      }
      return () => {
        safeCleanup();
      };
    } else {
      // ✅ DESKTOP: Mouse events with hover support + Enhanced Debug
      const handleMouseEnter = () => {
        handleHover(true);
        logger.debug('🖱️ [SiriCallButton] 🟢 DESKTOP Mouse enter', 'Component');
      };

      const handleMouseLeave = () => {
        handleHover(false);
        logger.debug('🖱️ [SiriCallButton] 🔴 DESKTOP Mouse leave', 'Component');
      };

      const handleMouseDown = (e: MouseEvent) => {
        logger.debug(
          '🖱️ [SiriCallButton] 🔽 DESKTOP Mouse down - event target:',
          'Component',
          e.target
        );
        logger.debug(
          '🖱️ [SiriCallButton] 🔽 Element ID:',
          'Component',
          element.id
        );
        logger.debug(
          '🖱️ [SiriCallButton] 🔽 isHandlingClick before:',
          'Component',
          isHandlingClick.current
        );

        const rect = element.getBoundingClientRect();
        handleInteractionStart(e, {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        logger.debug(
          '🖱️ [SiriCallButton] 🔽 Mouse down completed',
          'Component'
        );
      };

      const handleMouseUp = (e: MouseEvent) => {
        logger.debug(
          '🖱️ [SiriCallButton] 🔼 DESKTOP Mouse up - event target:',
          'Component',
          e.target
        );
        logger.debug(
          '🖱️ [SiriCallButton] 🔼 onCallStart available:',
          'Component',
          !!onCallStart
        );
        logger.debug(
          '🖱️ [SiriCallButton] 🔼 isListening state:',
          'Component',
          isListening
        );
        logger.debug(
          '🖱️ [SiriCallButton] 🔼 isHandlingClick before:',
          'Component',
          isHandlingClick.current
        );

        handleInteractionEnd(e);
        logger.debug(
          '🖱️ [SiriCallButton] 🔼 Mouse up - triggering action completed',
          'Component'
        );
      };

      // Enhanced debug for element setup
      logger.debug('🖱️ [SiriCallButton] 🎯 DESKTOP EVENT SETUP:', 'Component');
      logger.debug('  📦 Element ID:', 'Component', element.id);
      logger.debug('  📦 Element tagName:', 'Component', element.tagName);
      logger.debug('  🎛️ onCallStart available:', 'Component', !!onCallStart);
      logger.debug('  🎛️ onCallEnd available:', 'Component', !!onCallEnd);
      logger.debug(
        '  🎨 Element computed style:',
        'Component',
        window.getComputedStyle(element).pointerEvents
      );

      // 🔧 MANUAL TEST: Add click listener for debugging
      const testClickHandler = (e: MouseEvent) => {
        logger.debug(
          '🎯 [SiriCallButton] 🔥 MANUAL TEST CLICK DETECTED!',
          'Component'
        );
        logger.debug('  🎯 Click target:', 'Component', e.target);
        logger.debug(
          `  🎯 Click coordinates: ${e.clientX}, ${e.clientY}`,
          'Component'
        );
        logger.debug(
          '  🎯 Element rect:',
          'Component',
          element.getBoundingClientRect()
        );
        logger.debug('  🎯 onCallStart available:', 'Component', !!onCallStart);
      };

      element.addEventListener('click', testClickHandler);

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mouseup', handleMouseUp);

      logger.debug(
        '🖱️ [SiriCallButton] ✅ Desktop mouse events added successfully',
        'Component'
      );

      return () => {
        logger.debug(
          '🖱️ [SiriCallButton] 🧹 Cleaning up desktop mouse events',
          'Component'
        );

        // 🛡️ SAFETY: Reset protection flags
        isHandlingClick.current = false;
        debug(
          '🛡️ [SiriCallButton] Desktop cleanup - isHandlingClick reset to false'
        );

        element.removeEventListener('click', testClickHandler);
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mouseup', handleMouseUp);
        safeCleanup();
      };
    }
  }, [
    containerId,
    colors,
    handleInteractionStart,
    handleInteractionEnd,
    handleHover,
    safeCleanup,
    onCallStart,
    isListening,
    emergencyStop, // Added missing dependency
  ]);

  // ✅ SYNC visual state with props
  useEffect(() => {
    if (buttonRef.current && !cleanupFlagRef.current) {
      buttonRef.current.setListening(isListening);
      // ✅ FIX 4: Remove unnecessary resize on listening state change
      // Canvas animations handle listening state internally, no resize needed
      logger.debug(
        '🔧 [SiriCallButton] Listening state updated without resize trigger',
        'Component'
      );
    }
  }, [isListening]); // Fixed: Removed containerId as it's not used in this effect

  useEffect(() => {
    if (buttonRef.current && !cleanupFlagRef.current) {
      buttonRef.current.setVolumeLevel(volumeLevel);
    }
  }, [volumeLevel]); // Dependencies are correct

  useEffect(() => {
    if (buttonRef.current && colors && !cleanupFlagRef.current) {
      buttonRef.current.updateColors(colors);
    }
  }, [colors]); // Dependencies are correct

  // Mobile touch handler - unified with desktop logic
  const handleDirectTouch = async (e: any) => {
    if (import.meta.env.DEV) {
      logger.debug(
        `📱 [SiriCallButton] Mobile touch event: ${e.type} on ${containerId}`,
        'Component'
      );
      logger.debug(
        '📱 [SiriCallButton] Current isListening state:',
        'Component',
        isListening
      );
    }

    // Handle touch end or click events
    if (e.type === 'touchend' || e.type === 'click') {
      debug('📱 [SiriCallButton] 🎯 MOBILE INTERACTION END STARTED');
      debug('  📱 Event type:', e.type);
      debug('  📱 Event target:', e.target);

      // 🛡️ UNIFIED: Add same protection as desktop
      if (isHandlingClick.current) {
        debug(
          '📱 [SiriCallButton] ⚠️ Mobile touch already being handled, ignoring...'
        );
        return;
      }

      isHandlingClick.current = true;
      debug('📱 [SiriCallButton] 🚀 MOBILE BUSINESS LOGIC STARTING');
      debug('  🎧 isListening:', isListening);
      debug('  ✅ onCallStart available:', !!onCallStart);
      debug('  ✅ onCallEnd available:', !!onCallEnd);

      try {
        if (!isListening && onCallStart) {
          // 🟢 START CALL - with status management
          setStatus('listening');
          debug('📱 [SiriCallButton] 🟢 MOBILE - STARTING CALL');
          try {
            await onCallStart();
            debug(
              '📱 [SiriCallButton] ✅ Mobile onCallStart() completed successfully'
            );
          } catch (error) {
            debugError(
              '📱 [SiriCallButton] ❌ Mobile onCallStart() error:',
              error
            );
            setStatus('idle');
          }
        } else if (isListening && onCallEnd) {
          // 🔴 END CALL - with status management
          setStatus('processing');
          debug('📱 [SiriCallButton] 🔴 MOBILE - ENDING CALL');
          onCallEnd();
          debug('📱 [SiriCallButton] ✅ Mobile onCallEnd() completed');
          setTimeout(() => setStatus('idle'), 500);
        } else {
          // 🚨 DEBUG: Log when no action is taken
          debug('📱 [SiriCallButton] ⚠️ MOBILE NO ACTION TAKEN:');
          debug('  📱 isListening:', isListening);
          debug('  📱 onCallStart available:', !!onCallStart);
          debug('  📱 onCallEnd available:', !!onCallEnd);
        }
      } finally {
        // 🛡️ UNIFIED: Same protection reset as desktop
        setTimeout(() => {
          isHandlingClick.current = false;
          debug('📱 [SiriCallButton] 🔓 Mobile isHandlingClick reset to false');
        }, 100);
      }

      debug('📱 [SiriCallButton] 🎯 MOBILE INTERACTION END COMPLETED');
    }
  };

  return (
    <div
      id={containerId}
      className="voice-button"
      // Direct event handlers for mobile touch and desktop click
      onTouchStart={handleDirectTouch}
      onTouchEnd={handleDirectTouch}
      onClick={handleDirectTouch}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
        zIndex: 10,
        borderRadius: '50%',
        pointerEvents: 'auto',
        overflow: 'visible',
        // Mobile touch optimizations
        touchAction: 'manipulation', // Improve touch responsiveness
        WebkitTapHighlightColor: 'transparent', // Remove mobile tap highlight
        WebkitUserSelect: 'none', // Prevent text selection
        userSelect: 'none', // Prevent text selection
        WebkitTouchCallout: 'none', // Disable context menu on long press
      }}
    >
      {/* 🔍 DEBUG: Container setup validation */}
      {import.meta.env.DEV && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                const container = document.getElementById('${containerId}');
                if (container) {
                  logger.debug('🔍 [SiriCallButton] CONTAINER DEBUG:', 'Component');
                  logger.debug('  📦 Container element:', 'Component', container);
                  logger.debug('  📦 Container style.pointerEvents:', 'Component', container.style.pointerEvents);
                  logger.debug('  📦 Container computed pointerEvents:', 'Component', getComputedStyle(container).pointerEvents);
                  logger.debug('  📦 Container zIndex:', 'Component', getComputedStyle(container).zIndex);
                  logger.debug('  📦 Container position:', 'Component', getComputedStyle(container).position);
                  logger.debug('  📦 Container dimensions:', 'Component', container.getBoundingClientRect());
                  
                  // Test click detection
                  container.addEventListener('click', (e) => {
                    logger.debug('🎯 [SiriCallButton] Container received click!', 'Component', e);
                  }, { once: true });
                }
              }, 500);
            `,
          }}
        />
      )}

      {/* Mobile visual component */}
      {isMobileDevice() && canvasReady && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none', // Don't block container events
          }}
        >
          <SimpleMobileSiriVisual
            isListening={isListening}
            volumeLevel={volumeLevel}
            colors={
              colors || {
                primary: '#5DB6B9',
                secondary: '#E8B554',
                glow: 'rgba(93, 182, 185, 0.4)',
                name: 'English',
              }
            }
            size={Math.min(
              300,
              Math.min(
                parseInt(
                  getComputedStyle(
                    document.getElementById(containerId) || document.body
                  ).width
                ) - 20,
                parseInt(
                  getComputedStyle(
                    document.getElementById(containerId) || document.body
                  ).height
                ) - 20
              )
            )}
          />
        </div>
      )}

      {/* Loading state - Only show for non-mobile devices */}
      {!canvasReady && !isMobileDevice() && (
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors?.primary || '#5DB6B9'}, ${colors?.secondary || '#E8B554'})`,
            color: 'white',
            fontSize: '36px', // ✅ FIX 3: Reduced from 48px to 36px for better mobile fit
            boxShadow: `0 0 30px ${colors?.glow || 'rgba(93, 182, 185, 0.4)'}`,
            border: '2px solid rgba(255,255,255,0.1)',
            pointerEvents: 'none', // Don't block container events
          }}
        >
          🎤
        </div>
      )}

      {/* Status indicator */}
      {status !== 'idle' && status !== 'listening' && (
        <div
          className={`status-indicator ${status}`}
          style={{
            position: 'absolute',
            top: '-48px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: colors?.primary || '#5DB6B9',
            textShadow: `0 0 10px ${colors?.glow || 'rgba(93, 182, 185, 0.4)'}`,
            pointerEvents: 'none', // Don't block container events
          }}
        >
          {status === 'processing' ? 'Processing...' : 'Speaking...'}
        </div>
      )}
    </div>
  );
};

export default SiriCallButton;
