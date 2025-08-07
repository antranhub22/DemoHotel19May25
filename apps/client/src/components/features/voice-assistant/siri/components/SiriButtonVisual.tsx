import { isMobileDevice } from '@/utils/deviceDetection';
import React from 'react';
import { SimpleMobileSiriVisual } from '../SimpleMobileSiriVisual';

interface SiriButtonVisualProps {
  containerId: string;
  isListening: boolean;
  volumeLevel: number;
  canvasReady: boolean;
  colors?: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  };
}

export const SiriButtonVisual: React.FC<SiriButtonVisual> = ({ containerId, isListening, volumeLevel, canvasReady, colors }) => {
  const isMobile = isMobileDevice();
  const defaultColors = {
    primary: '#5DB6B9',
    secondary: '#E8B554',
    glow: 'rgba(93, 182, 185, 0.4)',
    name: 'English',
  };

  const currentColors = colors || defaultColors;

  // Mobile visual component
  if (isMobile && canvasReady) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none', // Don't block container events
        }}
      >
        <SimpleMobileSiriVisual
          isListening={isListening}
          volumeLevel={volumeLevel}
          colors={currentColors}
          size={Math.min(
            300,
            Math.min(
              parseInt(
                getComputedStyle(
                  document.getElementById(containerId) || document.body
                ).width
              ) - 20,
              parseInt(
                getComputedStyle(
                  document.getElementById(containerId) || document.body
                ).height
              ) - 20
            )
          )}
        />
      </div>
    );
  }

  // Desktop loading state
  if (!canvasReady && !isMobile) {
    return (
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`,
          color: 'white',
          fontSize: '36px',
          boxShadow: `0 0 30px ${currentColors.glow}`,
          border: '2px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none', // Don't block container events
        }}
      >
        🎤
      </div>
    );
  }

  // Desktop canvas is handled by SiriButton class
  return null;
};
