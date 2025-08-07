import React from 'react';
import { designSystem } from '@/styles/designSystem';

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div
      className="absolute w-full min-h-screen h-full flex items-center justify-center z-10"
      data-testid="error-state"
      style={{
        background: `linear-gradient(135deg, ${designSystem.colors.primary}, ${designSystem.colors.error})`,
        fontFamily: designSystem.fonts.primary,
      }}
    >
      <div
        className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl"
        style={{ boxShadow: designSystem.shadows.card }}
      >
        <div className="text-white text-xl font-semibold mb-4">
          Failed to load hotel configuration
        </div>
        <p className="text-white/80">{error}</p>
      </div>
    </div>
  );
};
