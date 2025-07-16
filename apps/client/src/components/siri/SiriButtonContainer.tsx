import React from 'react';
import { designSystem } from '@/styles/designSystem';
import SiriCallButton from './SiriCallButton';
import { Language } from '@/types/interface1.types';

interface SiriButtonContainerProps {
  isCallStarted: boolean;
  micLevel: number;
  onCallStart: (lang: Language) => Promise<void>;
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
      className="flex flex-col items-center justify-center w-full"
      style={{ 
        marginBottom: designSystem.spacing.xl,
        zIndex: designSystem.zIndex.above
      }}
    >
      {/* Siri Button Container */}
      <div 
        className="relative flex items-center justify-center"
        style={{ 
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          boxShadow: designSystem.shadows.large,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <SiriCallButton
          containerId="main-siri-button"
          isListening={isCallStarted}
          volumeLevel={micLevel}
          onCallStart={() => onCallStart('en')}
          onCallEnd={onCallEnd}
        />
      </div>
      
      {/* Tap To Speak text - Visible on all devices */}
      <div
        className="block mt-4 text-center"
        style={{
          color: designSystem.colors.text,
          fontSize: '1rem',
          fontWeight: '500',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}
      >
        Tap To Speak
      </div>
    </div>
  );
}; 