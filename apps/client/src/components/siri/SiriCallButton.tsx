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

    // Add click handler
    element.addEventListener('click', handleClick);

    return () => {
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
      id={containerId}
      className="voice-button"
      style={{ 
        width: '100%', // Use full container width
        height: '100%', // Use full container height
        position: 'absolute', // Absolute positioning within container
        top: 0,
        left: 0,
        cursor: 'pointer',
        zIndex: 50,
        borderRadius: '50%', // Match container shape
        border: '2px solid red', // DEBUG: temporary border to see boundaries
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