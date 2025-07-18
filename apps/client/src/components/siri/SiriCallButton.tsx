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
  const fallbackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [canvasReady, setCanvasReady] = useState(false);

  // Fallback canvas creation for mobile
  const createFallbackCanvas = () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    console.log('[SiriCallButton] Creating fallback canvas for mobile');
    
    // Remove any existing canvas
    const existingCanvas = container.querySelector('canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }

    // Create simple canvas
    const canvas = document.createElement('canvas');
    const size = 280;
    
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.style.position = 'absolute';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.zIndex = '30';
    canvas.style.borderRadius = '50%';
    canvas.style.pointerEvents = 'auto';
    
    container.appendChild(canvas);
    fallbackCanvasRef.current = canvas;

    // Draw simple animated Siri button
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = size * 0.35;
      
      const animate = () => {
        if (!fallbackCanvasRef.current) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, size, size);
        
        // Animated pulse
        const time = Date.now() * 0.002;
        const pulse = 1 + 0.1 * Math.sin(time * 2);
        const currentRadius = baseRadius * pulse;
        
        // Get current colors
        const primaryColor = colors?.primary || '#5DB6B9';
        const secondaryColor = colors?.secondary || '#E8B554';
        const glowColor = colors?.glow || 'rgba(93, 182, 185, 0.4)';
        
        // Outer glow
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius + 20, 0, Math.PI * 2);
        ctx.fillStyle = glowColor;
        ctx.fill();
        ctx.restore();
        
        // Main circle with gradient
        ctx.save();
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, currentRadius
        );
        gradient.addColorStop(0, secondaryColor);
        gradient.addColorStop(1, primaryColor);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Inner highlight
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 20, currentRadius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.restore();
        
        // Microphone icon
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(2.5, 2.5);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        
        // Mic body
        ctx.beginPath();
        ctx.arc(0, -8, 12, Math.PI * 0.15, Math.PI * 1.85, false);
        ctx.fill();
        
        // Mic stand
        ctx.beginPath();
        ctx.rect(-3, 8, 6, 12);
        ctx.fill();
        
        // Mic base
        ctx.beginPath();
        ctx.arc(0, 20, 8, 0, Math.PI, true);
        ctx.fill();
        
        ctx.restore();
        
        // Continue animation
        requestAnimationFrame(animate);
      };
      
      animate();
      setCanvasReady(true);
      console.log('[SiriCallButton] Fallback canvas animation started');
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
    
    // Clear container
    const element = document.getElementById(containerId);
    if (element) {
      element.innerHTML = '';
      element.style.position = 'relative';
      element.style.overflow = 'visible';
    }

    // Try to create SiriButton first
    const initTimer = setTimeout(() => {
      try {
        buttonRef.current = new SiriButton(containerId, colors);
        console.log('[SiriCallButton] SiriButton instance created successfully');
        
        // Check if canvas was created successfully
        setTimeout(() => {
          const canvas = element?.querySelector('canvas');
          if (canvas && canvas.width > 0) {
            setCanvasReady(true);
            console.log('[SiriCallButton] SiriButton canvas confirmed working');
          } else {
            console.log('[SiriCallButton] SiriButton canvas failed, using fallback');
            createFallbackCanvas();
          }
        }, 500);
        
      } catch (error) {
        console.error('[SiriCallButton] SiriButton failed, using fallback:', error);
        createFallbackCanvas();
      }
    }, 100);

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

    clickHandlerRef.current = clickHandler;

    if (element) {
      element.addEventListener('click', clickHandler);
      
      setTimeout(() => {
        const canvas = element.querySelector('canvas');
        if (canvas) {
          canvas.addEventListener('click', clickHandler);
        }
      }, 200);
    }

    // Cleanup on unmount
    return () => {
      console.log('[SiriCallButton] Cleaning up');
      
      clearTimeout(initTimer);
      
      if (buttonRef.current) {
        buttonRef.current.cleanup();
        buttonRef.current = null;
      }
      
      if (fallbackCanvasRef.current) {
        fallbackCanvasRef.current.remove();
        fallbackCanvasRef.current = null;
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
  }, [containerId, colors]);

  // Update colors when language changes
  useEffect(() => {
    if (buttonRef.current && colors) {
      buttonRef.current.updateColors(colors);
    }
  }, [colors]);

  // Update listening state
  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.setListening(isListening);
    }
  }, [isListening]);

  // Update volume level
  useEffect(() => {
    if (buttonRef.current) {
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
        className={`voice-button ${isListening ? 'listening' : ''} relative rounded-full overflow-hidden flex items-center justify-center z-50`}
        style={{ 
          cursor: 'pointer',
          width: '280px',
          height: '280px',
          zIndex: 9999,
          pointerEvents: 'auto',
          position: 'relative'
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