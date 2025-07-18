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
    const allCanvases = document.querySelectorAll('canvas');
    
    const info = {
      containerExists: !!container,
      containerSize: container ? `${container.clientWidth}x${container.clientHeight}` : 'N/A',
      containerStyle: container ? {
        display: container.style.display || 'default',
        position: container.style.position || 'default',
        zIndex: container.style.zIndex || 'default'
      } : 'N/A',
      canvasExists: !!canvas,
      canvasCount: allCanvases.length,
      canvasSize: canvas ? `${canvas.width}x${canvas.height}` : 'N/A',
      canvasStyle: canvas ? `${canvas.style.width}x${canvas.style.height}` : 'N/A',
      canvasDisplay: canvas ? canvas.style.display : 'N/A',
      canvasZIndex: canvas ? canvas.style.zIndex : 'N/A',
      canvasPosition: canvas ? canvas.style.position : 'N/A',
      siriButtonInstance: !!buttonRef.current,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      isMobile: window.innerWidth < 768
    };
    
    // Also log to console for easy copying
    console.log('[SiriCallButton] Debug info:', info);
    console.log('[SiriCallButton] Container element:', container);
    console.log('[SiriCallButton] Canvas element:', canvas);
    console.log('[SiriCallButton] All canvases:', allCanvases);
    
    // Create readable debug text
    const debugText = Object.entries(info)
      .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join('\n');
    
    setDebugInfo(debugText);
    
    // Force canvas visibility and test drawing
    if (canvas) {
      console.log('[SiriCallButton] Canvas found - testing visibility');
      canvas.style.display = 'block';
      canvas.style.zIndex = '9999';
      canvas.style.position = 'absolute';
      canvas.style.top = '50%';
      canvas.style.left = '50%';
      canvas.style.transform = 'translate(-50%, -50%)';
      canvas.style.background = 'rgba(255,0,0,0.5)'; // Semi-transparent red
      canvas.style.border = '3px solid yellow'; // Yellow border
      
      // Try to draw on canvas directly
      const ctx = canvas.getContext('2d');
      if (ctx) {
        console.log('[SiriCallButton] Drawing test circle on canvas');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'lime';
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, 50, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Remove visual debugging after 3 seconds
      setTimeout(() => {
        canvas.style.background = 'transparent';
        canvas.style.border = 'none';
      }, 3000);
    } else {
      console.log('[SiriCallButton] No canvas found - trying to create one manually');
      
      // Manual canvas creation for testing
      if (container) {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 280;
        testCanvas.height = 280;
        testCanvas.style.width = '280px';
        testCanvas.style.height = '280px';
        testCanvas.style.position = 'absolute';
        testCanvas.style.top = '50%';
        testCanvas.style.left = '50%';
        testCanvas.style.transform = 'translate(-50%, -50%)';
        testCanvas.style.zIndex = '9999';
        testCanvas.style.background = 'rgba(0,255,0,0.5)'; // Green background
        testCanvas.style.border = '3px solid blue'; // Blue border
        testCanvas.id = 'manual-test-canvas';
        
        container.appendChild(testCanvas);
        
        // Draw test pattern
        const ctx = testCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'magenta';
          ctx.beginPath();
          ctx.arc(140, 140, 60, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = 'white';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('TEST', 140, 145);
        }
        
        console.log('[SiriCallButton] Manual test canvas created');
        
        // Remove test canvas after 5 seconds
        setTimeout(() => {
          testCanvas.remove();
        }, 5000);
      }
    }
    
    // Force SiriButton to recreate if instance exists
    if (buttonRef.current) {
      console.log('[SiriCallButton] Forcing SiriButton debug draw');
      try {
        // Access the debug method if it exists
        (buttonRef.current as any).debugDraw?.();
      } catch (error) {
        console.log('[SiriCallButton] Debug draw not available:', error);
      }
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