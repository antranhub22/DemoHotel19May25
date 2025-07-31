import { useEffect, useRef, useState } from 'react';

interface Ripple {
  id: number;
  scale: number;
  opacity: number;
}

interface UseSiriAnimationProps {
  isListening: boolean;
  volumeLevel: number;
}

interface UseSiriAnimationReturn {
  pulsePhase: number;
  ripples: Ripple[];
  finalScale: number;
}

export const useSiriAnimation = ({
  isListening,
  volumeLevel,
}: UseSiriAnimationProps): UseSiriAnimationReturn => {
  const [pulsePhase, setPulsePhase] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const animationIdRef = useRef<number>();
  const rippleIntervalRef = useRef<NodeJS.Timeout>();

  // Animation loop
  useEffect(() => {
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

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // Add ripples when listening
  useEffect(() => {
    if (isListening) {
      rippleIntervalRef.current = setInterval(() => {
        setRipples(prev => [
          ...prev,
          {
            id: Date.now(),
            scale: 1,
            opacity: 0.4,
          },
        ]);
      }, 300);
    } else {
      if (rippleIntervalRef.current) {
        clearInterval(rippleIntervalRef.current);
      }
    }

    return () => {
      if (rippleIntervalRef.current) {
        clearInterval(rippleIntervalRef.current);
      }
    };
  }, [isListening]);

  // Calculate final scale
  const pulse = 1 + 0.1 * Math.sin(pulsePhase);
  const volumeBoost = isListening ? volumeLevel * 0.3 : 0;
  const finalScale = pulse + volumeBoost;

  return {
    pulsePhase,
    ripples,
    finalScale,
  };
};
