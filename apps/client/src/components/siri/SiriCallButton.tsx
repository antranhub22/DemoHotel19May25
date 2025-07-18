import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SiriButton } from './SiriButton';
import { isMobileDevice, logDeviceInfo } from '@/utils/deviceDetection';
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
  const buttonRef = useRef<SiriButton | null>(null);
  const cleanupFlagRef = useRef<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [canvasReady, setCanvasReady] = useState(false);
  
  // Prevent double-firing between click and touch events
  const isHandlingClick = useRef<boolean>(false);

  // Safe cleanup function
  const safeCleanup = useCallback(() => {
    if (cleanupFlagRef.current) return;
    cleanupFlagRef.current = true;
    
    if (buttonRef.current) {
      try {
        buttonRef.current.cleanup();
      } catch (error) {
        console.warn('[SiriCallButton] Cleanup error:', error);
      }
      buttonRef.current = null;
    }

    const container = document.getElementById(containerId);
    if (container) {
      const canvases = container.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        if (canvas.parentElement && document.contains(canvas)) {
          canvas.parentElement.removeChild(canvas);
        }
      });
    }
    
    setCanvasReady(false);
  }, [containerId]);

  // ✅ CENTRALIZED interaction handlers
  const handleInteractionStart = useCallback((e: Event, position?: { x: number; y: number }) => {
    if (buttonRef.current) {
      buttonRef.current.setInteractionMode('active');
      if (position) {
        buttonRef.current.setTouchPosition(position.x, position.y);
      }
    }
    console.log('🎯 [SiriCallButton] Interaction start:', { position });
  }, []);

  const handleInteractionEnd = useCallback(async (e: Event) => {
    console.log('🔔 [SiriCallButton] 🎯 INTERACTION END STARTED');
    console.log('  🎯 Event type:', e.type);
    console.log('  🎯 Event target:', e.target);
    
    if (buttonRef.current) {
      buttonRef.current.setInteractionMode('idle');
      console.log('  ✅ Visual state set to idle');
    }
    
    // Business logic - prevent double-firing
    if (isHandlingClick.current) {
      console.log('🔔 [SiriCallButton] ⚠️ Click already being handled, ignoring...');
      return;
    }
    
    isHandlingClick.current = true;
    console.log('🔔 [SiriCallButton] 🚀 BUSINESS LOGIC STARTING');
    console.log('  🎧 isListening:', isListening);
    console.log('  ✅ onCallStart available:', !!onCallStart);
    console.log('  ✅ onCallEnd available:', !!onCallEnd);
    
    try {
      if (!isListening && onCallStart) {
        setStatus('listening');
        console.log('🎤 [SiriCallButton] 🟢 STARTING CALL - Calling onCallStart()...');
        try {
          await onCallStart();
          console.log('🎤 [SiriCallButton] ✅ onCallStart() completed successfully');
        } catch (error) {
          console.error('🎤 [SiriCallButton] ❌ onCallStart() error:', error);
          setStatus('idle');
        }
      } else if (isListening && onCallEnd) {
        setStatus('processing');
        console.log('🛑 [SiriCallButton] 🔴 ENDING CALL - Calling onCallEnd()...');
        onCallEnd();
        console.log('🛑 [SiriCallButton] ✅ onCallEnd() completed');
        setTimeout(() => setStatus('idle'), 500);
      } else {
        console.log('🔔 [SiriCallButton] ⚠️ NO ACTION TAKEN:');
        console.log('  🎧 isListening:', isListening);
        console.log('  🎤 onCallStart available:', !!onCallStart);
        console.log('  🛑 onCallEnd available:', !!onCallEnd);
      }
    } finally {
      setTimeout(() => {
        isHandlingClick.current = false;
        console.log('🔔 [SiriCallButton] 🔓 isHandlingClick reset to false');
      }, 100);
    }
    
    console.log('🔔 [SiriCallButton] 🎯 INTERACTION END COMPLETED');
  }, [isListening, onCallStart, onCallEnd]);

  const handleHover = useCallback((isHovered: boolean) => {
    if (buttonRef.current) {
      buttonRef.current.setInteractionMode(isHovered ? 'hover' : 'idle');
    }
  }, []);

  // Initialize SiriButton
  useEffect(() => {
    cleanupFlagRef.current = false;
    
    const element = document.getElementById(containerId);
    if (!element) return;

    // Clear existing content
    const existingCanvases = element.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => {
      if (canvas.parentElement && document.contains(canvas)) {
        canvas.parentElement.removeChild(canvas);
      }
    });

    // Initialize SiriButton
    try {
      buttonRef.current = new SiriButton(containerId, colors);
      setCanvasReady(true);
      
      // 🔧 CRITICAL FIX: Force resize after container is fully setup
      setTimeout(() => {
        if (buttonRef.current && !cleanupFlagRef.current) {
          console.log('🔧 [SiriCallButton] Forcing post-init resize for perfect alignment');
          window.dispatchEvent(new Event('resize'));
        }
      }, 100);
      
      // Additional resize for mobile/slower devices
      setTimeout(() => {
        if (buttonRef.current && !cleanupFlagRef.current) {
          console.log('🔧 [SiriCallButton] Final alignment resize');
          window.dispatchEvent(new Event('resize'));
        }
      }, 300);
      
    } catch (error) {
      console.error('[SiriCallButton] Init error:', error);
      // Retry once
      setTimeout(() => {
        if (!cleanupFlagRef.current) {
          try {
            buttonRef.current = new SiriButton(containerId, colors);
            setCanvasReady(true);
            
            // Force resize on retry too
            setTimeout(() => {
              if (buttonRef.current && !cleanupFlagRef.current) {
                console.log('🔧 [SiriCallButton] Retry resize for alignment');
                window.dispatchEvent(new Event('resize'));
              }
            }, 100);
            
          } catch (retryError) {
            console.error('[SiriCallButton] Retry failed:', retryError);
          }
        }
      }, 200);
    }

    // ✅ DEVICE-SPECIFIC event setup with centralized handlers
    const isMobile = isMobileDevice();
    
    logDeviceInfo('SiriCallButton');
    console.log('📱 [SiriCallButton] Device detection - isMobile:', isMobile);

    if (isMobile) {
      // ✅ MOBILE: Touch events with enhanced debugging
      console.log('📱 [SiriCallButton] 🔥 SETTING UP MOBILE TOUCH EVENTS');
      console.log('  📱 Element for touch events:', element);
      console.log('  📱 Element rect:', element.getBoundingClientRect());
      console.log('  📱 Element computed style:', {
        position: getComputedStyle(element).position,
        zIndex: getComputedStyle(element).zIndex,
        pointerEvents: getComputedStyle(element).pointerEvents,
        display: getComputedStyle(element).display,
        width: getComputedStyle(element).width,
        height: getComputedStyle(element).height
      });
      
      const handleTouchStart = (e: TouchEvent) => {
        console.log('📱 [SiriCallButton] 🔥 TOUCH START DETECTED!');
        console.log('  📱 Touch event:', e);
        console.log('  📱 Touch target:', e.target);
        console.log('  📱 Touch position:', e.touches[0].clientX, e.touches[0].clientY);
        console.log('  📱 Element rect:', element.getBoundingClientRect());
        console.log('  📱 Touches count:', e.touches.length);
        
        const touch = e.touches[0];
        const rect = element.getBoundingClientRect();
        handleInteractionStart(e, {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
        
        console.log('  ✅ Touch start handled successfully');
      };

      const handleTouchEnd = (e: TouchEvent) => {
        console.log('📱 [SiriCallButton] 🔥 TOUCH END DETECTED!');
        console.log('  📱 Touch event:', e);
        console.log('  📱 Touch target:', e.target);
        console.log('  📱 Changed touches:', e.changedTouches.length);
        console.log('  📱 Preventing default to avoid ghost clicks');
        
        e.preventDefault(); // Prevent ghost click
        handleInteractionEnd(e);
        
        console.log('  ✅ Touch end handled successfully');
      };

      const handleTouchCancel = (e: TouchEvent) => {
        console.log('📱 [SiriCallButton] ⚠️ TOUCH CANCELLED');
        console.log('  📱 Touch event:', e);
        if (buttonRef.current) {
          buttonRef.current.setInteractionMode('idle');
        }
      };

      // Add events with enhanced logging
      console.log('📱 [SiriCallButton] 🎯 ADDING TOUCH EVENT LISTENERS');
      console.log('  📱 Adding to element:', element.id, element.tagName);
      
      // Test if element can receive events
      const testEventHandler = (e: Event) => {
        console.log('📱 [SiriCallButton] 🧪 TEST EVENT RECEIVED:', e.type);
      };
      
      element.addEventListener('touchstart', testEventHandler, { once: true });
      
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
      element.addEventListener('touchcancel', handleTouchCancel, { passive: true });
      
      console.log('📱 [SiriCallButton] ✅ Touch event listeners added successfully');

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchcancel', handleTouchCancel);
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
      
      // 🔧 SIMPLIFIED: Single resize trigger without layout thrashing
      const triggerResize = () => {
        if (buttonRef.current && !cleanupFlagRef.current) {
          console.log('🔧 [SiriCallButton] Triggering resize due to listening state change');
          // Simple resize trigger without forcing display changes
          window.dispatchEvent(new Event('resize'));
        }
      };

      // 🔧 REDUCED: Only trigger resize after layout settles, no forced reflows
      setTimeout(triggerResize, 100);  // Single resize after DOM update
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

  return (
    <div 
      id={containerId}
      className="voice-button"
      style={{ 
        width: '100%', // Use full container width
        height: '100%', // Use full container height
        position: 'relative', // Relative for absolute canvas positioning
        cursor: 'pointer',
        zIndex: 10, // Higher than canvas (zIndex: 1)
        borderRadius: '50%', // Match container shape
        display: 'flex', // Add flexbox
        alignItems: 'center', // Center vertically
        justifyContent: 'center', // Center horizontally
        // 🔧 CRITICAL FIX: Ensure container can receive events
        pointerEvents: 'auto', // Explicitly enable pointer events
        background: 'transparent', // Ensure no background blocking
        overflow: 'visible', // Allow canvas to be visible
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

      {/* Loading state */}
      {!canvasReady && (
        <div 
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors?.primary || '#5DB6B9'}, ${colors?.secondary || '#E8B554'})`,
            color: 'white',
            fontSize: '48px',
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
    </div>
  );
};

export default SiriCallButton; 