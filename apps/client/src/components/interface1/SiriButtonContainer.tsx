import React from 'react';
import { designSystem } from '@/styles/designSystem';
import SiriCallButton from '../SiriCallButton';
import { Language } from '@/types/interface1.types';

interface SiriButtonContainerProps {
  isCallStarted: boolean;
  micLevel: number;
  onCallStart: (lang: Language) => void;
  onCallEnd: () => void;
}

export const SiriButtonContainer: React.FC<SiriButtonContainerProps> = ({
  isCallStarted,
  micLevel,
  onCallStart,
  onCallEnd
}) => {
  return (
    <div 
      className="flex flex-col items-center mt-32 md:mt-4"
      style={{ 
        marginBottom: designSystem.spacing.xl,
        width: '357.5px',
        height: '357.5px',
        position: 'relative',
        zIndex: designSystem.zIndex.above
      }}
    >
      <div 
        style={{ 
          borderRadius: '50%',
          boxShadow: designSystem.shadows.large,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <SiriCallButton
          containerId="main-siri-button"
          isListening={isCallStarted}
          volumeLevel={micLevel}
          onCallStart={onCallStart}
          onCallEnd={onCallEnd}
        />
      </div>
      {/* Tap To Speak text - Only visible on mobile */}
      <div
        className="block md:hidden"
        style={{
          color: designSystem.colors.text,
          fontSize: '1rem',
          fontWeight: '500',
          marginTop: '1rem',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}
      >
        Tap To Speak
      </div>
    </div>
  );
}; 