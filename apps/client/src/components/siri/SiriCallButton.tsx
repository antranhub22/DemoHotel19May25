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
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Handle click events
  const handleClick = async () => {
    if (!isListening && onCallStart) {
      setStatus('listening');
      try {
        await onCallStart();
      } catch (error) {
        console.error('[SiriCallButton] Start error:', error);
        setStatus('idle');
      }
    } else if (isListening && onCallEnd) {
      setStatus('processing');
      onCallEnd();
      setTimeout(() => setStatus('idle'), 500);
    }
  };

  // Initialize SiriButton
  useEffect(() => {
    cleanupFlagRef.current = false;
    
    const element = document.getElementById(containerId);
    if (!element) {
      console.error('[SiriCallButton] Container element not found:', containerId);
      return;
    }

    // Clear existing content
    const existingCanvases = element.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => {
      if (canvas.parentElement && document.contains(canvas)) {
        canvas.parentElement.removeChild(canvas);
      }
    });

    // Add explicit sizing to container for better canvas sizing
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.position = 'relative';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';

    // Initialize SiriButton with delay for proper container sizing
    const initTimeout = setTimeout(() => {
      if (!cleanupFlagRef.current) {
        try {
          buttonRef.current = new SiriButton(containerId, colors);
          setCanvasReady(true);
          console.log('[SiriCallButton] SiriButton initialized successfully');
        } catch (error) {
          console.error('[SiriCallButton] Init error:', error);
          // Retry once with longer delay
          setTimeout(() => {
            if (!cleanupFlagRef.current) {
              try {
                buttonRef.current = new SiriButton(containerId, colors);
                setCanvasReady(true);
                console.log('[SiriCallButton] SiriButton initialized on retry');
              } catch (retryError) {
                console.error('[SiriCallButton] Retry failed:', retryError);
              }
            }
          }, 500);
        }
      }
    }, 100);

    // Add click handler
    element.addEventListener('click', handleClick);

    return () => {
      clearTimeout(initTimeout);
      element.removeEventListener('click', handleClick);
      safeCleanup();
    };
  }, [containerId, colors, handleClick, safeCleanup]);

  // Update SiriButton state
  useEffect(() => {
    if (buttonRef.current && !cleanupFlagRef.current) {
      buttonRef.current.setListening(isListening);
    }
  }, [isListening]);

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
      ref={containerRef}
      id={containerId}
      className="voice-button"
      style={{ 
        width: '100%', // Use full width of parent container
        height: '100%', // Use full height of parent container
        position: 'relative',
        cursor: 'pointer',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0',
        background: 'transparent',
        border: 'none',
        outline: 'none'
      }}
    >
      {/* Loading state with better visibility */}
      {!canvasReady && (
        <div 
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors?.primary || '#5DB6B9'}, ${colors?.secondary || '#E8B554'})`,
            color: 'white',
            fontSize: 'clamp(32px, 8vw, 48px)', // Responsive emoji size
            boxShadow: `0 0 30px ${colors?.glow || 'rgba(93, 182, 185, 0.4)'}`,
            border: '2px solid rgba(255,255,255,0.1)',
            zIndex: 10
          }}
        >
          🎤
        </div>
      )}
      
      {/* Status indicator - better positioning */}
      {status !== 'idle' && status !== 'listening' && (
        <div 
          className={`status-indicator ${status}`}
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: colors?.primary || '#5DB6B9',
            textShadow: `0 0 10px ${colors?.glow || 'rgba(93, 182, 185, 0.4)'}`,
            fontSize: 'clamp(12px, 2.5vw, 14px)', // Responsive font size
            fontWeight: '600',
            background: 'rgba(0,0,0,0.8)',
            padding: '8px 16px',
            borderRadius: '20px',
            zIndex: 100,
            whiteSpace: 'nowrap' // Prevent text wrapping
          }}
        >
          {status === 'processing' ? 'Processing...' : 'Speaking...'}
        </div>
      )}
    </div>
  );
};

export default SiriCallButton; 