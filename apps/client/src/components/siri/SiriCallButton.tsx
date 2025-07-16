import React, { useEffect, useRef, useState } from 'react';
import { SiriButton } from './SiriButton';
import '../../styles/voice-interface.css';

interface SiriCallButtonProps {
  isListening: boolean;
  volumeLevel: number;
  containerId: string;
  onCallStart?: () => Promise<void>;
  onCallEnd?: () => void;
}

const SiriCallButton: React.FC<SiriCallButtonProps> = ({ 
  isListening, 
  volumeLevel,
  containerId,
  onCallStart,
  onCallEnd
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
    
    // Initialize SiriButton
    buttonRef.current = new SiriButton(containerId);

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
  }, [containerId]); // Remove other dependencies to avoid recreating

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
    listening: 'Listening...',
    processing: 'Processing...',
    speaking: 'Speaking...'
  };

  return (
    <div className="relative">
      {/* Status Indicator */}
      {status !== 'idle' && (
        <div className={`status-indicator ${status}`}>
          {statusText[status]}
        </div>
      )}

      {/* Main Button */}
      <div 
        id={containerId}
        className={`voice-button ${isListening ? 'listening' : ''} relative rounded-full overflow-visible`}
        style={{ 
          cursor: 'pointer',
          width: '357.5px', // 550px * 0.65
          height: '357.5px', // 550px * 0.65
          transform: 'translate(-25%, -25%)', // Adjust position to maintain center alignment
          margin: '25% auto' // Add margin to prevent overlap
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
        <div className="gradient-ring" style={{ transform: 'scale(0.65)' }} />
      </div>

      {/* Waveform Animation */}
      {isListening && (
        <div className="waveform-container" style={{ transform: 'scale(0.65)' }}>
          {waveformBars.map((_, index) => (
            <div
              key={index}
              className="waveform-bar"
              style={{
                animation: `waveform ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                animationDelay: `${index * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SiriCallButton; 