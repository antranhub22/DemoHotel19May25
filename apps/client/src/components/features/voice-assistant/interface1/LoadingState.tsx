import React from 'react';
import { designSystem } from '@/styles/designSystem';

export 
interface LoadingStateProps {
  className?: string;
  children?: React.ReactNode;
  // TODO: Add specific props for LoadingState
}

const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <div
      className="absolute w-full min-h-screen h-full flex items-center justify-center z-10"
      data-testid="loading-state"
      style={{
        background: `linear-gradient(135deg, ${designSystem.colors.primary}, ${designSystem.colors.secondary})`,
        fontFamily: designSystem.fonts.primary,
      }}
    >
      <div
        className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl"
        style={{ boxShadow: designSystem.shadows.card }}
      >
        <div
          className="animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto mb-6"
          style={{ width: '64px', height: '64px' }}
        ></div>
        <p className="text-white text-lg font-medium">
          Loading hotel configuration...
        </p>
      </div>
    </div>
  );
};
