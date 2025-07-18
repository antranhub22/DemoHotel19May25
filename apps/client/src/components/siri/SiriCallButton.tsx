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
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Debug function to check canvas status
  const checkCanvasStatus = () => {
    const container = document.getElementById(containerId);
    const canvas = container?.querySelector('canvas');
    const info = {
      containerExists: !!container,
      containerSize: container ? `${container.clientWidth}x${container.clientHeight}` : 'N/A',
      canvasExists: !!canvas,
      canvasSize: canvas ? `${canvas.width}x${canvas.height}` : 'N/A',
      canvasStyle: canvas ? `${canvas.style.width}x${canvas.style.height}` : 'N/A',
      canvasVisible: canvas ? canvas.style.display : 'N/A',
      canvasZIndex: canvas ? canvas.style.zIndex : 'N/A',
      siriButtonInstance: !!buttonRef.current
    };
    
    const debugText = JSON.stringify(info, null, 2);
    console.log('[SiriCallButton] Debug info:', info);
    setDebugInfo(debugText);
    
    // Force canvas visibility if it exists but isn't visible
    if (canvas && canvas.style.display !== 'block') {
      console.log('[SiriCallButton] Forcing canvas visibility');
      canvas.style.display = 'block';
      canvas.style.zIndex = '9999';
      canvas.style.position = 'absolute';
      canvas.style.top = '50%';
      canvas.style.left = '50%';
      canvas.style.transform = 'translate(-50%, -50%)';
      canvas.style.background = 'red'; // Temporary red background for debugging
      
      // Remove red background after 2 seconds
      setTimeout(() => {
        canvas.style.background = 'transparent';
      }, 2000);
    }
  };

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
    
    // Clear any existing canvas in the container first
    const element = document.getElementById(containerId);
    if (element) {
      // Remove any existing canvas elements
      const existingCanvases = element.querySelectorAll('canvas');
      existingCanvases.forEach(canvas => canvas.remove());
      
      // Clear any existing content
      element.innerHTML = '';
      
      // Ensure container has proper styling for canvas
      element.style.position = 'relative';
      element.style.overflow = 'visible';
      
      console.log('[SiriCallButton] Container cleared and ready for canvas');
    }

    // Force a slight delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      try {
        // Initialize SiriButton with colors
        buttonRef.current = new SiriButton(containerId, colors);
        console.log('[SiriCallButton] SiriButton instance created successfully');
        
        // Check canvas status after creation
        setTimeout(() => {
          checkCanvasStatus();
        }, 500);
      } catch (error) {
        console.error('[SiriCallButton] Error creating SiriButton:', error);
        // Retry once more after another delay
        setTimeout(() => {
          try {
            buttonRef.current = new SiriButton(containerId, colors);
            console.log('[SiriCallButton] SiriButton retry successful');
            setTimeout(() => {
              checkCanvasStatus();
            }, 500);
          } catch (retryError) {
            console.error('[SiriCallButton] Retry failed:', retryError);
          }
        }, 500);
      }
    }, 150);

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
    if (element) {
      console.log('[SiriCallButton] Adding click listener to element:', element);
      element.addEventListener('click', clickHandler);
      
      // Also add to canvas when it exists (delayed)
      setTimeout(() => {
        const canvas = element.querySelector('canvas');
        if (canvas) {
          console.log('[SiriCallButton] Adding click listener to canvas');
          canvas.addEventListener('click', clickHandler);
        }
      }, 200);
    } else {
      console.error('[SiriCallButton] Container element not found:', containerId);
    }

    // Cleanup on unmount
    return () => {
      console.log('[SiriCallButton] Cleaning up');
      
      // Clear timers
      clearTimeout(initTimer);
      
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
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Debug Button - Only show on mobile for testing */}
      {window.innerWidth < 768 && (
        <button
          onClick={checkCanvasStatus}
          className="absolute top-0 right-0 z-50 bg-red-500 text-white text-xs px-2 py-1 rounded"
          style={{ fontSize: '10px' }}
        >
          Debug Canvas
        </button>
      )}
      
      {/* Debug Info - Only show on mobile */}
      {window.innerWidth < 768 && debugInfo && (
        <div 
          className="absolute top-6 right-0 z-50 bg-black text-white text-xs p-2 rounded max-w-xs overflow-auto"
          style={{ fontSize: '8px', maxHeight: '100px' }}
        >
          <pre>{debugInfo}</pre>
        </div>
      )}

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

      {/* Main Button - Canvas will be inserted here by SiriButton class */}
      <div 
        id={containerId}
        className={`voice-button ${isListening ? 'listening' : ''} relative rounded-full overflow-hidden flex items-center justify-center z-50`}
        style={{ 
          cursor: 'pointer',
          width: '280px',
          height: '280px',
          zIndex: 9999,
          pointerEvents: 'auto',
          position: 'relative',
          border: '2px solid rgba(255,0,0,0.3)' // Temporary red border for debugging
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
        {/* Canvas will be created by SiriButton class */}
      </div>
    </div>
  );
};

export default SiriCallButton; 