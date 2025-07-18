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
  // Removed fallback canvas - mobile uses same SiriButton as desktop
  const cleanupFlagRef = useRef<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [canvasReady, setCanvasReady] = useState(false);

  // Safe cleanup function
  const safeCleanup = useCallback(() => {
    if (cleanupFlagRef.current) return; // Prevent double cleanup
    cleanupFlagRef.current = true;
    
    console.log('[SiriCallButton] Starting safe cleanup');
    
    // Cleanup SiriButton instance
    if (buttonRef.current) {
      try {
        buttonRef.current.cleanup();
      } catch (error) {
        console.warn('[SiriCallButton] Error during SiriButton cleanup:', error);
      }
      buttonRef.current = null;
    }
    
    // No fallback canvas to cleanup
    
    // Clear container safely
    const container = document.getElementById(containerId);
    if (container) {
      try {
        // Remove all canvas elements
        const canvases = container.querySelectorAll('canvas');
        canvases.forEach(canvas => {
          try {
            if (canvas.parentElement && document.contains(canvas)) {
              canvas.parentElement.removeChild(canvas);
            }
          } catch (error) {
            console.warn('[SiriCallButton] Error removing canvas:', error);
          }
        });
      } catch (error) {
        console.warn('[SiriCallButton] Error during container cleanup:', error);
      }
    }
    
    setCanvasReady(false);
    console.log('[SiriCallButton] Safe cleanup completed');
  }, [containerId]);

  // Fallback canvas creation for mobile
  // No fallback canvas function - mobile uses SiriButton class like desktop

  // Effect for status changes based on isListening
  useEffect(() => {
    if (isListening) {
      setStatus('listening');
    } else {
      setStatus('idle');
    }
  }, [isListening]);

  useEffect(() => {
    console.log('[SiriCallButton] Initializing with containerId:', containerId);
    
    // Reset cleanup flag
    cleanupFlagRef.current = false;
    
    // Clear container safely
    const element = document.getElementById(containerId);
    if (element) {
      try {
        // Remove existing content safely
        const existingCanvases = element.querySelectorAll('canvas');
        existingCanvases.forEach(canvas => {
          if (canvas.parentElement && document.contains(canvas)) {
            canvas.parentElement.removeChild(canvas);
          }
        });
        
        element.style.position = 'relative';
        element.style.overflow = 'visible';
      } catch (error) {
        console.warn('[SiriCallButton] Error clearing container:', error);
      }
    }

    // Try SiriButton first on both mobile and desktop, fallback if needed
    const initTimer = setTimeout(() => {
      if (cleanupFlagRef.current) return; // Don't proceed if cleanup started
      
      try {
        buttonRef.current = new SiriButton(containerId, colors);
        console.log('[SiriCallButton] SiriButton instance created successfully');
        
        // Trust SiriButton to work - no fallback needed
        setTimeout(() => {
          if (cleanupFlagRef.current) return;
          setCanvasReady(true);
          console.log('[SiriCallButton] SiriButton initialized - no fallback needed');
        }, 100);
        
      } catch (error) {
        console.error('[SiriCallButton] SiriButton initialization error:', error);
        // No fallback - force retry with SiriButton
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
    }, 100);

    // Store timer for cleanup
    return () => {
      clearTimeout(initTimer);
    };

    // Create click handler function
    const clickHandler = async (event: Event) => {
      console.log('[SiriCallButton] Click detected! isListening:', isListening);
      event.preventDefault();
      event.stopPropagation();
      
      if (!isListening && onCallStart) {
        console.log('[SiriCallButton] Calling onCallStart');
        setStatus('listening');
        try {
          await onCallStart();
        } catch (error) {
          console.error('[SiriCallButton] Error in onCallStart:', error);
          setStatus('idle');
        }
      } else if (isListening && onCallEnd) {
        console.log('[SiriCallButton] Calling onCallEnd');
        setStatus('processing');
        onCallEnd();
        setTimeout(() => setStatus('idle'), 500);
      }
    };

    if (element) {
      element.addEventListener('click', clickHandler);
      
      setTimeout(() => {
        if (!cleanupFlagRef.current) {
          const canvas = element.querySelector('canvas');
          if (canvas) {
            canvas.addEventListener('click', clickHandler);
          }
        }
      }, 200);
    }

    // Cleanup on unmount
    return () => {
      if (element) {
        element.removeEventListener('click', clickHandler);
        const canvas = element.querySelector('canvas');
        if (canvas) {
          canvas.removeEventListener('click', clickHandler);
        }
      }
      safeCleanup();
    };
  }, [containerId, colors, safeCleanup]);

  // Update colors when language changes
  useEffect(() => {
    if (buttonRef.current && colors && !cleanupFlagRef.current) {
      buttonRef.current.updateColors(colors);
    }
  }, [colors]);

  // Update listening state
  useEffect(() => {
    if (buttonRef.current && !cleanupFlagRef.current) {
      buttonRef.current.setListening(isListening);
    }
  }, [isListening]);

  // Update volume level
  useEffect(() => {
    if (buttonRef.current && !cleanupFlagRef.current) {
      buttonRef.current.setVolumeLevel(volumeLevel);
    }
  }, [volumeLevel]);

  // Status text mapping
  const statusText = {
    idle: '',
    listening: '',
    processing: 'Processing...',
    speaking: 'Speaking...'
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Status Indicator */}
      {status !== 'idle' && status !== 'listening' && (
        <div 
          className={`status-indicator ${status} absolute -top-12 left-1/2 transform -translate-x-1/2`}
          style={{
            color: colors?.primary || '#5DB6B9',
            textShadow: `0 0 10px ${colors?.glow || 'rgba(93, 182, 185, 0.4)'}`
          }}
        >
          {statusText[status]}
        </div>
      )}

      {/* Main Button Container */}
      <div 
        id={containerId}
        className={`voice-button ${isListening ? 'listening' : ''} relative rounded-full flex items-center justify-center z-50`}
        style={{ 
          cursor: 'pointer',
          width: '280px',
          height: '280px',
          zIndex: 9999,
          pointerEvents: 'auto',
          position: 'relative',
          background: 'transparent',
          overflow: 'visible'
        }}
        onClick={(e) => {
          console.log('[SiriCallButton] Container click detected!');
          if (!isListening && onCallStart) {
            setStatus('listening');
            onCallStart();
          } else if (isListening && onCallEnd) {
            setStatus('processing');
            onCallEnd();
            setTimeout(() => setStatus('idle'), 500);
          }
        }}
      >
        {/* Canvas will be created by SiriButton class or fallback */}
        {!canvasReady && (
          <div 
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors?.primary || '#5DB6B9'}, ${colors?.secondary || '#E8B554'})`,
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            🎤
          </div>
        )}
      </div>
    </div>
  );
};

export default SiriCallButton; 