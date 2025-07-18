import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SiriButton } from './SiriButton';
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

  // Handle click events - WRAPPED IN useCallback to prevent memory leaks
  const handleClick = useCallback(async () => {
    // Prevent double-firing between click and touch events
    if (isHandlingClick.current) {
      console.log('🔔 [SiriCallButton] Click already being handled, ignoring...');
      return;
    }
    
    isHandlingClick.current = true;
    console.log('🔔 [SiriCallButton] Click/Touch event triggered! isListening:', isListening);
    
    try {
      if (!isListening && onCallStart) {
        setStatus('listening');
        console.log('🎤 [SiriCallButton] Starting call...');
        try {
          await onCallStart();
        } catch (error) {
          console.error('[SiriCallButton] Start error:', error);
          setStatus('idle');
        }
      } else if (isListening && onCallEnd) {
        setStatus('processing');
        console.log('🛑 [SiriCallButton] Ending call...');
        onCallEnd();
        setTimeout(() => setStatus('idle'), 500);
      }
    } finally {
      // Reset flag after a short delay to allow for proper event handling
      setTimeout(() => {
        isHandlingClick.current = false;
      }, 100);
    }
  }, [isListening, onCallStart, onCallEnd]); // Proper dependencies

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
    } catch (error) {
      console.error('[SiriCallButton] Init error:', error);
      // Retry once
      setTimeout(() => {
        if (!cleanupFlagRef.current) {
          try {
            buttonRef.current = new SiriButton(containerId, colors);
            setCanvasReady(true);
          } catch (retryError) {
            console.error('[SiriCallButton] Retry failed:', retryError);
          }
        }
      }, 200);
    }

    // Detect if user is on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    ('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0);

    console.log('📱 [SiriCallButton] Device detection - isMobile:', isMobile);

    if (isMobile) {
      // Mobile: Use touch events for better responsiveness
      const handleTouchStart = (e: TouchEvent) => {
        console.log('📱 [SiriCallButton] Touch start detected');
        e.stopPropagation();
        // Visual feedback only - don't trigger action yet
      };

      const handleTouchEnd = (e: TouchEvent) => {
        console.log('📱 [SiriCallButton] Touch end - triggering click');
        e.preventDefault(); // Prevent ghost click
        e.stopPropagation();
        handleClick(); // Directly trigger click handler
      };

      // Add touch handlers for mobile - CRITICAL for mobile functionality
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });

      // Clean removal function for mobile
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
        safeCleanup();
      };
    } else {
      // Desktop: Use click events as normal
      const handleDesktopClick = (e: MouseEvent) => {
        console.log('🖱️ [SiriCallButton] Desktop click detected');
        e.stopPropagation();
        handleClick();
      };

      element.addEventListener('click', handleDesktopClick);

      // Clean removal function for desktop
      return () => {
        element.removeEventListener('click', handleDesktopClick);
        safeCleanup();
      };
    }
  }, [containerId, colors]); // handleClick and safeCleanup are stable with useCallback

  // Update SiriButton state
  useEffect(() => {
    if (buttonRef.current && !cleanupFlagRef.current) {
      buttonRef.current.setListening(isListening);
      
      // CRITICAL FIX: Trigger resize when listening state changes
      // This fixes alignment issues when layout changes (Cancel/Confirm buttons appear)
      setTimeout(() => {
        if (buttonRef.current && !cleanupFlagRef.current) {
          console.log('🔧 [SiriCallButton] Triggering resize due to listening state change');
          // Force canvas to recalculate size when layout changes
          const container = document.getElementById(containerId);
          if (container) {
            // Dispatch resize event to trigger SiriButton.resize()
            window.dispatchEvent(new Event('resize'));
          }
        }
      }, 100); // Small delay to let DOM update
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
        position: 'relative', // Change back to relative 
        cursor: 'pointer',
        zIndex: 50,
        borderRadius: '50%', // Match container shape
        display: 'flex', // Add flexbox
        alignItems: 'center', // Center vertically
        justifyContent: 'center', // Center horizontally
        // Mobile touch optimizations
        touchAction: 'manipulation', // Improve touch responsiveness
        WebkitTapHighlightColor: 'transparent', // Remove mobile tap highlight
        WebkitUserSelect: 'none', // Prevent text selection
        userSelect: 'none', // Prevent text selection
        WebkitTouchCallout: 'none', // Disable context menu on long press
      }}
    >
      {/* Loading state */}
      {!canvasReady && (
        <div 
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors?.primary || '#5DB6B9'}, ${colors?.secondary || '#E8B554'})`,
            color: 'white',
            fontSize: '48px',
            boxShadow: `0 0 30px ${colors?.glow || 'rgba(93, 182, 185, 0.4)'}`,
            border: '2px solid rgba(255,255,255,0.1)'
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
            textShadow: `0 0 10px ${colors?.glow || 'rgba(93, 182, 185, 0.4)'}`
          }}
        >
          {status === 'processing' ? 'Processing...' : 'Speaking...'}
        </div>
      )}
    </div>
  );
};

export default SiriCallButton; 