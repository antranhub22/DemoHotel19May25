import React, { useEffect, useRef, useState } from 'react';
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
  const clickHandlerRef = useRef<((event: Event) => void) | null>(null);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [waveformBars] = useState(() => Array(12).fill(0));

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
    
    // Initialize SiriButton with colors
    buttonRef.current = new SiriButton(containerId, colors);

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

    // Store reference for cleanup
    clickHandlerRef.current = clickHandler;

    // Add click handler to container element
    const element = document.getElementById(containerId);
    if (element) {
      console.log('[SiriCallButton] Adding click listener to element:', element);
      element.addEventListener('click', clickHandler);
      
      // Also add to canvas if it exists
      const canvas = element.querySelector('canvas');
      if (canvas) {
        console.log('[SiriCallButton] Adding click listener to canvas');
        canvas.addEventListener('click', clickHandler);
      }
    } else {
      console.error('[SiriCallButton] Container element not found:', containerId);
    }

    // Cleanup on unmount
    return () => {
      console.log('[SiriCallButton] Cleaning up');
      if (buttonRef.current) {
        buttonRef.current.cleanup();
        buttonRef.current = null;
      }
      
      const element = document.getElementById(containerId);
      if (element && clickHandlerRef.current) {
        element.removeEventListener('click', clickHandlerRef.current);
        const canvas = element.querySelector('canvas');
        if (canvas) {
          canvas.removeEventListener('click', clickHandlerRef.current);
        }
      }
      clickHandlerRef.current = null;
    };
  }, [containerId, colors]); // Add colors to dependencies

  // Update colors when language changes
  useEffect(() => {
    if (buttonRef.current && colors) {
      buttonRef.current.updateColors(colors);
    }
  }, [colors]);

  // Separate effect for updating callbacks
  useEffect(() => {
    console.log('[SiriCallButton] Callbacks updated - isListening:', isListening);
  }, [isListening, onCallStart, onCallEnd]);

  useEffect(() => {
    // Update listening state
    if (buttonRef.current) {
      buttonRef.current.setListening(isListening);
    }
  }, [isListening]);

  useEffect(() => {
    // Update volume level
    if (buttonRef.current) {
      buttonRef.current.setVolumeLevel(volumeLevel);
    }
  }, [volumeLevel]);

  // Status text mapping
  const statusText = {
    idle: '',
    listening: '', // Bỏ hiển thị chữ "Listening"
    processing: 'Processing...',
    speaking: 'Speaking...'
  };

  return (
    <div className="relative flex items-center justify-center">
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

      {/* Main Button */}
      <div 
        id={containerId}
        className={`voice-button ${isListening ? 'listening' : ''} relative rounded-full overflow-visible flex items-center justify-center z-50`}
        style={{ 
          cursor: 'pointer',
          width: '280px',  // Increased to match SiriButtonContainer
          height: '280px', // Increased to match SiriButtonContainer
          zIndex: 9999,
          pointerEvents: 'auto',
          position: 'relative'
        }}
        onClick={(e) => {
          console.log('[SiriCallButton] Div click detected!');
          // Fallback click handler
          if (!isListening && onCallStart) {
            console.log('[SiriCallButton] Fallback - calling onCallStart');
            setStatus('listening');
            onCallStart();
          } else if (isListening && onCallEnd) {
            console.log('[SiriCallButton] Fallback - calling onCallEnd');
            setStatus('processing');
            onCallEnd();
            setTimeout(() => setStatus('idle'), 500);
          }
        }}
      >
        {/* Gradient Ring Effect */}
        <div 
          className="gradient-ring absolute inset-0 transition-all duration-300" 
          style={{
            background: colors ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` : undefined,
            opacity: 0.6
          }}
        />
      </div>
    </div>
  );
};

export default SiriCallButton; 