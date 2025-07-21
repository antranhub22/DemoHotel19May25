import React, { useEffect, useState } from 'react';
import { logger } from '@shared/utils/logger';

interface SimpleMobileSiriVisualProps {
  isListening: boolean;
  volumeLevel: number;
  colors: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  };
  size?: number;
}

export const SimpleMobileSiriVisual: React.FC<SimpleMobileSiriVisualProps> = ({
  isListening,
  volumeLevel,
  colors,
  size = 280,
}) => {
  const [pulsePhase, setPulsePhase] = useState(0);
  const [ripples, setRipples] = useState<
    Array<{ id: number; scale: number; opacity: number }>
  >([]);

  // Animation loop
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= 16) {
        // ~60fps
        setPulsePhase(prev => prev + 0.05);

        // Update ripples
        setRipples(prev =>
          prev
            .map(ripple => ({
              ...ripple,
              scale: ripple.scale + 0.02,
              opacity: ripple.opacity - 0.01,
            }))
            .filter(ripple => ripple.opacity > 0)
        );

        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Add ripples when listening
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setRipples(prev => [
          ...prev,
          {
            id: Date.now(),
            scale: 1,
            opacity: 0.4,
          },
        ]);
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isListening]);

  const pulse = 1 + 0.1 * Math.sin(pulsePhase);
  const volumeBoost = isListening ? volumeLevel * 0.3 : 0;
  const finalScale = pulse + volumeBoost;

  // logger.debug('🎨 [SimpleMobileSiriVisual] Render:', 'Component', { isListening, volumeLevel, colors: colors.name });

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ripples */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            border: `2px solid ${colors.primary}`,
            transform: `scale(${ripple.scale})`,
            opacity: ripple.opacity,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Outer glow */}
      <div
        style={{
          position: 'absolute',
          width: size + 40,
          height: size + 40,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          transform: `scale(${finalScale})`,
          opacity: isListening ? 0.8 : 0.4,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Main circle */}
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          transform: `scale(${finalScale})`,
          boxShadow: `0 0 ${isListening ? 40 : 20}px ${colors.glow}`,
          transition: 'box-shadow 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Microphone Icon */}
        <div
          style={{
            color: 'white',
            fontSize: size * 0.25,
            textShadow: '0 0 20px rgba(255,255,255,0.8)',
            transform: `scale(${1 + volumeLevel * 0.2})`,
            transition: 'transform 0.1s ease',
          }}
        >
          🎤
        </div>
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: '50%',
            transform: 'translateX(-50%)',
            color: colors.primary,
            fontSize: 14,
            fontWeight: 'bold',
            textAlign: 'center',
            animation: 'pulse 1.5s infinite',
          }}
        >
          Listening...
        </div>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};
