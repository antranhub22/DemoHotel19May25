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
  const fallbackCanvasRef = useRef<HTMLCanvasElement | null>(null);
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
    
    // Cleanup fallback canvas
    if (fallbackCanvasRef.current) {
      try {
        if (fallbackCanvasRef.current.parentElement && document.contains(fallbackCanvasRef.current)) {
          fallbackCanvasRef.current.parentElement.removeChild(fallbackCanvasRef.current);
        }
      } catch (error) {
        console.warn('[SiriCallButton] Error removing fallback canvas:', error);
      }
      fallbackCanvasRef.current = null;
    }
    
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
  const createFallbackCanvas = useCallback(() => {
    if (cleanupFlagRef.current) return; // Don't create if cleanup is in progress
    
    const container = document.getElementById(containerId);
    if (!container) return;

    console.log('[SiriCallButton] Creating enhanced fallback canvas for mobile');
    
    // Remove any existing canvas safely
    try {
      const existingCanvases = container.querySelectorAll('canvas');
      existingCanvases.forEach(canvas => {
        if (canvas.parentElement && document.contains(canvas)) {
          canvas.parentElement.removeChild(canvas);
        }
      });
    } catch (error) {
      console.warn('[SiriCallButton] Error removing existing canvases:', error);
    }

    // Create enhanced canvas
    const canvas = document.createElement('canvas');
    const size = 280;
    const dpr = window.devicePixelRatio || 1;
    
    // High DPI setup
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.style.position = 'absolute';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.zIndex = '30';
    canvas.style.borderRadius = '50%';
    canvas.style.pointerEvents = 'auto';
    canvas.style.background = 'transparent';
    canvas.setAttribute('data-mobile-canvas', 'true');
    
    try {
      container.appendChild(canvas);
      fallbackCanvasRef.current = canvas;

      // Enhanced animation with proper scaling
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Scale for high DPI
        ctx.scale(dpr, dpr);
        
        const centerX = size / 2;
        const centerY = size / 2;
        const baseRadius = size * 0.35;
        let animationId: number;
        let pulsePhase = 0;
        
        const animate = () => {
          if (cleanupFlagRef.current || !fallbackCanvasRef.current) {
            if (animationId) cancelAnimationFrame(animationId);
            return;
          }
          
          // Clear canvas
          ctx.clearRect(0, 0, size, size);
          
          // Update pulse phase
          pulsePhase += 0.05;
          
          // Get current colors
          const primaryColor = colors?.primary || '#5DB6B9';
          const secondaryColor = colors?.secondary || '#E8B554';
          const glowColor = colors?.glow || 'rgba(93, 182, 185, 0.4)';
          
          // Animated pulse effect
          const breath = 0.85 + 0.15 * Math.sin(pulsePhase * 1.5);
          const currentRadius = baseRadius * breath;
          
          // Enhanced background with multiple glow layers
          for (let i = 4; i >= 1; i--) {
            ctx.save();
            ctx.globalAlpha = 0.15 * (5 - i);
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius + (i * 20), 0, Math.PI * 2);
            const glowGradient = ctx.createRadialGradient(
              centerX, centerY, 0,
              centerX, centerY, currentRadius + (i * 20)
            );
            glowGradient.addColorStop(0, primaryColor);
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.fill();
            ctx.restore();
          }
          
          // Main circle with glassmorphism effect
          ctx.save();
          const mainGradient = ctx.createRadialGradient(
            centerX - 40, centerY - 40, 0,
            centerX, centerY, currentRadius
          );
          mainGradient.addColorStop(0, 'rgba(255,255,255,0.2)');
          mainGradient.addColorStop(0.3, secondaryColor);
          mainGradient.addColorStop(0.7, primaryColor);
          mainGradient.addColorStop(1, 'rgba(0,0,0,0.1)');
          ctx.fillStyle = mainGradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
          ctx.restore();
          
          // Inner glassmorphism highlight
          ctx.save();
          ctx.globalAlpha = 0.25;
          const innerGradient = ctx.createRadialGradient(
            centerX - 20, centerY - 20, 0,
            centerX, centerY, currentRadius * 0.7
          );
          innerGradient.addColorStop(0, 'rgba(255,255,255,0.8)');
          innerGradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
          innerGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = innerGradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, currentRadius * 0.75, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          // Border ring
          ctx.save();
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = `rgba(255,255,255,0.4)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, currentRadius - 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          
          // Inner highlight (top-left)
          ctx.save();
          ctx.globalAlpha = 0.4;
          const highlightGradient = ctx.createRadialGradient(
            centerX - 25, centerY - 25, 0,
            centerX - 25, centerY - 25, currentRadius * 0.7
          );
          highlightGradient.addColorStop(0, 'rgba(255,255,255,0.8)');
          highlightGradient.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = highlightGradient;
          ctx.beginPath();
          ctx.arc(centerX - 15, centerY - 15, currentRadius * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          // Enhanced microphone icon with proper scaling
          ctx.save();
          ctx.translate(centerX, centerY);
          const micScale = 2.8 * breath; // Scale with breath
          ctx.scale(micScale, micScale);
          
          // Mic shadow
          ctx.save();
          ctx.translate(1, 1);
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          
          // Shadow mic body
          ctx.beginPath();
          ctx.arc(0, -8, 12, Math.PI * 0.15, Math.PI * 1.85, false);
          ctx.fill();
          
          // Shadow mic stand
          ctx.beginPath();
          ctx.rect(-3, 8, 6, 12);
          ctx.fill();
          
          // Shadow mic base
          ctx.beginPath();
          ctx.arc(0, 20, 8, 0, Math.PI, true);
          ctx.fill();
          ctx.restore();
          
          // Enhanced microphone icon with 3D effect
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.3)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 2;
          
          // Mic body gradient
          const micGradient = ctx.createLinearGradient(-12, -15, 12, 15);
          micGradient.addColorStop(0, 'rgba(255,255,255,1)');
          micGradient.addColorStop(0.5, 'rgba(240,240,240,0.95)');
          micGradient.addColorStop(1, 'rgba(220,220,220,0.9)');
          ctx.fillStyle = micGradient;
          
          // Mic body
          ctx.beginPath();
          ctx.arc(0, -6, 14, Math.PI * 0.15, Math.PI * 1.85, false);
          ctx.fill();
          
          // Mic stand with gradient
          const standGradient = ctx.createLinearGradient(-3, 8, 3, 20);
          standGradient.addColorStop(0, 'rgba(255,255,255,0.95)');
          standGradient.addColorStop(1, 'rgba(200,200,200,0.9)');
          ctx.fillStyle = standGradient;
          ctx.beginPath();
          ctx.rect(-3, 8, 6, 12);
          ctx.fill();
          
          // Mic base with gradient
          const baseGradient = ctx.createRadialGradient(0, 20, 0, 0, 20, 8);
          baseGradient.addColorStop(0, 'rgba(255,255,255,0.95)');
          baseGradient.addColorStop(1, 'rgba(180,180,180,0.9)');
          ctx.fillStyle = baseGradient;
          ctx.beginPath();
          ctx.arc(0, 20, 8, 0, Math.PI, true);
          ctx.fill();
          
          // Enhanced mic grille with 3D effect
          ctx.save();
          ctx.strokeStyle = 'rgba(100,100,100,0.7)';
          ctx.lineWidth = 1;
          ctx.lineCap = 'round';
          for (let i = -8; i <= 8; i += 4) {
            ctx.beginPath();
            ctx.moveTo(i, -14);
            ctx.lineTo(i, -2);
            ctx.stroke();
          }
          
          // Add highlight lines
          ctx.strokeStyle = 'rgba(255,255,255,0.8)';
          ctx.lineWidth = 0.5;
          for (let i = -6; i <= 6; i += 4) {
            ctx.beginPath();
            ctx.moveTo(i - 0.5, -13);
            ctx.lineTo(i - 0.5, -3);
            ctx.stroke();
          }
          ctx.restore();
          
          ctx.restore();
          
          ctx.restore(); // End microphone drawing
          
          // Enhanced pulsing effects when listening
          if (isListening) {
            // Multiple pulsing rings with different speeds
            for (let ring = 0; ring < 3; ring++) {
              ctx.save();
              const ringSpeed = 2 + ring * 0.5;
              const ringRadius = currentRadius + 25 + ring * 15 + 8 * Math.sin(pulsePhase * ringSpeed);
              const ringAlpha = 0.4 - ring * 0.1;
              
              ctx.globalAlpha = ringAlpha;
              const ringGradient = ctx.createRadialGradient(
                centerX, centerY, ringRadius - 5,
                centerX, centerY, ringRadius + 5
              );
              ringGradient.addColorStop(0, primaryColor);
              ringGradient.addColorStop(0.5, secondaryColor);
              ringGradient.addColorStop(1, 'transparent');
              
              ctx.strokeStyle = ringGradient;
              ctx.lineWidth = 4 - ring;
              ctx.beginPath();
              ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();
            }
            
            // Volume level indicator particles
            if (volumeLevel > 0) {
              for (let p = 0; p < 8; p++) {
                ctx.save();
                const angle = (p / 8) * Math.PI * 2 + pulsePhase;
                const distance = currentRadius + 40 + (volumeLevel / 100) * 20;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                ctx.globalAlpha = 0.6 + (volumeLevel / 100) * 0.4;
                ctx.fillStyle = secondaryColor;
                ctx.beginPath();
                ctx.arc(x, y, 2 + (volumeLevel / 100) * 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            }
          }
          
          // Continue animation
          animationId = requestAnimationFrame(animate);
        };
        
        animate();
        setCanvasReady(true);
        console.log('[SiriCallButton] Enhanced fallback canvas animation started');
      }
    } catch (error) {
      console.error('[SiriCallButton] Error creating enhanced fallback canvas:', error);
    }
  }, [containerId, colors, isListening]);

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
        
        // Check if canvas was created successfully
        setTimeout(() => {
          if (cleanupFlagRef.current) return;
          
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
        if (!cleanupFlagRef.current) {
          createFallbackCanvas();
        }
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
  }, [containerId, colors, createFallbackCanvas, safeCleanup]);

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