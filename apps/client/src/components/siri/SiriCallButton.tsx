import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SiriButton } from './SiriButton';
import { SimpleMobileSiriVisual } from './SimpleMobileSiriVisual';
import { isMobileDevice, logDeviceInfo } from '@/utils/deviceDetection';
import { MobileTouchDebugger } from './MobileTouchDebugger';
import { useSimplifiedMobileTouch } from '@/hooks/useSimplifiedMobileTouch';
import '../../styles/voice-interface.css';
import { Language } from '@/types/interface1.types';

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
  colors
}) => {
  // Component render debug - Development only
  if (process.env.NODE_ENV === 'development') {
    console.log('[SiriCallButton] Component render - Container:', containerId, 'onCallStart:', !!onCallStart, 'Mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }

  // 🔧 PHASE 2: DEBUG CONTROL - Emergency debug level control  
  const DEBUG_LEVEL = process.env.NODE_ENV === 'development' ? 1 : 0; // 0: off, 1: errors only, 2: all
  
  // Debug utility methods - Environment aware
  const debug = (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development' && DEBUG_LEVEL >= 2) {
      console.log(`[SiriCallButton] ${message}`, ...args);
    }
  };

  const debugWarn = (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development' && DEBUG_LEVEL >= 1) {
      console.warn(`[SiriCallButton] ${message}`, ...args);
    }
  };

  const debugError = (message: string, ...args: any[]) => {
    // Always show errors, even in production
    console.error(`[SiriCallButton] ${message}`, ...args);
  };

  const buttonRef = useRef<SiriButton | null>(null);
  const cleanupFlagRef = useRef<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [canvasReady, setCanvasReady] = useState(false);
  
  // 🚨 PHASE 1: EMERGENCY GUARDS - Prevent double firing and infinite loops
  const isHandlingClick = useRef<boolean>(false);
  const initAttemptCount = useRef<number>(0);
  const maxInitAttempts = 3;
  const emergencyStopRequested = useRef<boolean>(false);

  // Mobile optimization - Always using simplified approach based on testing results
  
  const simplifiedMobileTouch = useSimplifiedMobileTouch({
    containerId,
    isListening,
    onCallStart,
    onCallEnd,
    onInteractionStart: (position) => {
      // Mobile visual only mode - no SiriButton updates needed
    },
    onInteractionEnd: () => {
      // Mobile visual only mode - no SiriButton updates needed  
    },
    enabled: true, // Always use simplified mobile touch
    debugEnabled: DEBUG_LEVEL >= 1
  });

  // 🚨 PHASE 1: SAFE CLEANUP - Enhanced cleanup with better error handling
  const safeCleanup = useCallback(() => {
    if (cleanupFlagRef.current) return;
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
  const handleInteractionStart = useCallback((e: Event, position?: { x: number; y: number }) => {
    if (buttonRef.current) {
      buttonRef.current.setInteractionMode('active');
      if (position) {
        buttonRef.current.setTouchPosition(position.x, position.y);
      }
    }
    debug('🎯 [SiriCallButton] Interaction start:', { position });
  }, []);

  const handleInteractionEnd = useCallback(async (e: Event) => {
    debug('🔔 [SiriCallButton] 🎯 INTERACTION END STARTED');
    debug('  🎯 Event type:', e.type);
    debug('  🎯 Event target:', e.target);
    
    if (buttonRef.current) {
      buttonRef.current.setInteractionMode('idle');
      debug('  ✅ Visual state set to idle');
    }
    
    // Business logic - prevent double-firing
    if (isHandlingClick.current) {
      debug('🔔 [SiriCallButton] ⚠️ Click already being handled, ignoring...');
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
        debug('🎤 [SiriCallButton] 🟢 STARTING CALL - Calling onCallStart()...');
        try {
          await onCallStart();
          debug('🎤 [SiriCallButton] ✅ onCallStart() completed successfully');
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
  }, [isListening, onCallStart, onCallEnd]);

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
      debug('[SiriCallButton] Bypassing SiriButton creation - using mobile visual only');
      setCanvasReady(true); // Set ready immediately for mobile visual
      return () => {
        // No cleanup needed for mobile visual only
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
        if (buttonRef.current && !cleanupFlagRef.current && !emergencyStopRequested.current) {
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
              debug('🔧 [SiriCallButton] Retry successful - no additional resize needed');
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
    console.log('📱 [SiriCallButton] Device detection - isMobile:', isMobileDevice_local);

    // Mobile devices use JSX direct event handlers (handleDirectTouch)
    // Desktop gets mouse events for hover effects
    if (isMobileDevice_local) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[SiriCallButton] Mobile device detected - using direct JSX handlers');
      }
      return () => {
        safeCleanup();
      };
    } else {
      // ✅ DESKTOP: Mouse events with hover support + Enhanced Debug
      const handleMouseEnter = () => {
        handleHover(true);
        console.log('🖱️ [SiriCallButton] 🟢 DESKTOP Mouse enter');
      };
      
      const handleMouseLeave = () => {
        handleHover(false);
        console.log('🖱️ [SiriCallButton] 🔴 DESKTOP Mouse leave');
      };
      
      const handleMouseDown = (e: MouseEvent) => {
        console.log('🖱️ [SiriCallButton] 🔽 DESKTOP Mouse down - event target:', e.target);
        console.log('🖱️ [SiriCallButton] 🔽 Element ID:', element.id);
        console.log('🖱️ [SiriCallButton] 🔽 isHandlingClick before:', isHandlingClick.current);
        
        const rect = element.getBoundingClientRect();
        handleInteractionStart(e, {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        console.log('🖱️ [SiriCallButton] 🔽 Mouse down completed');
      };
      
      const handleMouseUp = (e: MouseEvent) => {
        console.log('🖱️ [SiriCallButton] 🔼 DESKTOP Mouse up - event target:', e.target);
        console.log('🖱️ [SiriCallButton] 🔼 onCallStart available:', !!onCallStart);
        console.log('🖱️ [SiriCallButton] 🔼 isListening state:', isListening);
        console.log('🖱️ [SiriCallButton] 🔼 isHandlingClick before:', isHandlingClick.current);
        
        handleInteractionEnd(e);
        console.log('🖱️ [SiriCallButton] 🔼 Mouse up - triggering action completed');
      };

      // Enhanced debug for element setup
      console.log('🖱️ [SiriCallButton] 🎯 DESKTOP EVENT SETUP:');
      console.log('  📦 Element ID:', element.id);
      console.log('  📦 Element tagName:', element.tagName);
      console.log('  🎛️ onCallStart available:', !!onCallStart);
      console.log('  🎛️ onCallEnd available:', !!onCallEnd);
      console.log('  🎨 Element computed style:', window.getComputedStyle(element).pointerEvents);

      // 🔧 MANUAL TEST: Add click listener for debugging
      const testClickHandler = (e: MouseEvent) => {
        console.log('🎯 [SiriCallButton] 🔥 MANUAL TEST CLICK DETECTED!');
        console.log('  🎯 Click target:', e.target);
        console.log('  🎯 Click coordinates:', e.clientX, e.clientY);
        console.log('  🎯 Element rect:', element.getBoundingClientRect());
        console.log('  🎯 onCallStart available:', !!onCallStart);
      };

      element.addEventListener('click', testClickHandler);

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mouseup', handleMouseUp);

      console.log('🖱️ [SiriCallButton] ✅ Desktop mouse events added successfully');

      return () => {
        console.log('🖱️ [SiriCallButton] 🧹 Cleaning up desktop mouse events');
        element.removeEventListener('click', testClickHandler);
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mouseup', handleMouseUp);
        safeCleanup();
      };
    }
  }, [containerId, colors, handleInteractionStart, handleInteractionEnd, handleHover, safeCleanup, onCallStart, isListening]);

  // ✅ SYNC visual state with props
  useEffect(() => {
    if (buttonRef.current && !cleanupFlagRef.current) {
      buttonRef.current.setListening(isListening);
      // ✅ FIX 4: Remove unnecessary resize on listening state change
      // Canvas animations handle listening state internally, no resize needed
      console.log('🔧 [SiriCallButton] Listening state updated without resize trigger');
    }
  }, [isListening, containerId]);

  useEffect(() => {
    if (buttonRef.current && !cleanupFlagRef.current) {
      buttonRef.current.setVolumeLevel(volumeLevel);
    }
  }, [volumeLevel]);

  useEffect(() => {
    if (buttonRef.current && colors && !cleanupFlagRef.current) {
      buttonRef.current.updateColors(colors);
    }
  }, [colors]);

  // Mobile touch handler - triggers voice calls
  const handleDirectTouch = (e: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[SiriCallButton] Touch event:', e.type, 'on', containerId);
    }
    
    // Trigger voice call on touch end or click
    if (e.type === 'touchend' || e.type === 'click') {
      if (onCallStart) {
        onCallStart().then(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[SiriCallButton] Voice call started successfully');
          }
        }).catch((error) => {
          console.error('[SiriCallButton] Voice call failed:', error);
        });
      }
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
      {process.env.NODE_ENV === 'development' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                const container = document.getElementById('${containerId}');
                if (container) {
                  console.log('🔍 [SiriCallButton] CONTAINER DEBUG:');
                  console.log('  📦 Container element:', container);
                  console.log('  📦 Container style.pointerEvents:', container.style.pointerEvents);
                  console.log('  📦 Container computed pointerEvents:', getComputedStyle(container).pointerEvents);
                  console.log('  📦 Container zIndex:', getComputedStyle(container).zIndex);
                  console.log('  📦 Container position:', getComputedStyle(container).position);
                  console.log('  📦 Container dimensions:', container.getBoundingClientRect());
                  
                  // Test click detection
                  container.addEventListener('click', (e) => {
                    console.log('🎯 [SiriCallButton] Container received click!', e);
                  }, { once: true });
                }
              }, 500);
            `
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
            pointerEvents: 'none' // Don't block container events
          }}
        >
          <SimpleMobileSiriVisual
            isListening={isListening}
            volumeLevel={volumeLevel}
            colors={colors || {
              primary: '#5DB6B9',
              secondary: '#E8B554',
              glow: 'rgba(93, 182, 185, 0.4)',
              name: 'English'
            }}
            size={Math.min(300, Math.min(
              parseInt(getComputedStyle(document.getElementById(containerId) || document.body).width) - 20,
              parseInt(getComputedStyle(document.getElementById(containerId) || document.body).height) - 20
            ))}
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
            pointerEvents: 'none' // Don't block container events
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
            pointerEvents: 'none' // Don't block container events
          }}
        >
          {status === 'processing' ? 'Processing...' : 'Speaking...'}
        </div>
      )}

      {/* Debug components - Development only */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <MobileTouchDebugger
            containerId={containerId}
            onCallStart={onCallStart}
            onCallEnd={onCallEnd}
            isListening={isListening}
            enabled={true}
          />
          
          {/* Simplified mobile touch debug info - Development only */}
          {process.env.NODE_ENV === 'development' && simplifiedMobileTouch.isMobile && (
            <div
              style={{
                position: 'fixed',
                top: '10px',
                left: '10px',
                zIndex: 99997,
                background: simplifiedMobileTouch.isEnabled ? '#4CAF50' : '#f44336',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              {simplifiedMobileTouch.isEnabled ? '🚀 SIMPLIFIED TOUCH' : '🔧 COMPLEX TOUCH'}
              <button
                onClick={async () => {
                  console.log('🧪 [DEBUG] Manual TEST button clicked');
                  console.log('🧪 [DEBUG] onCallStart available:', !!onCallStart);
                  console.log('🧪 [DEBUG] isListening:', isListening);
                  if (onCallStart) {
                    try {
                      console.log('🧪 [DEBUG] Calling onCallStart...');
                      await onCallStart();
                      console.log('✅ [DEBUG] onCallStart completed');
                    } catch (error) {
                      console.error('❌ [DEBUG] onCallStart failed:', error);
                    }
                  }
                }}
                style={{
                  marginLeft: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                TEST
              </button>
            </div>
          )}


        </>
      )}
    </div>
  );
};

export default SiriCallButton; 