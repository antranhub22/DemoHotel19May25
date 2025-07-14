import React, { useEffect, useRef } from 'react';
import { SiriButton } from './SiriButton';

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
        try {
          await onCallStart();
        } catch (error) {
          console.error('[SiriCallButton] Error in onCallStart:', error);
        }
      } else if (isListening && onCallEnd) {
        console.log('[SiriCallButton] Calling onCallEnd');
        onCallEnd();
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

  return (
    <div 
      id={containerId}
      className="w-[220px] h-[220px] relative rounded-full overflow-visible"
      style={{ cursor: 'pointer', borderRadius: '50%' }}
      onClick={(e) => {
        console.log('[SiriCallButton] Div click detected!');
        // Fallback click handler
        if (!isListening && onCallStart) {
          console.log('[SiriCallButton] Fallback - calling onCallStart');
          onCallStart();
        } else if (isListening && onCallEnd) {
          console.log('[SiriCallButton] Fallback - calling onCallEnd');
          onCallEnd();
        }
      }}
    />
  );
};

export default SiriCallButton; 