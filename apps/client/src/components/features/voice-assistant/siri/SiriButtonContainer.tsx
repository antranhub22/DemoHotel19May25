/// <reference types="vite/client" />

// Type declaration for import.meta

import { useAssistant } from '@/context';
import { useSiriResponsiveSize } from '@/hooks/useSiriResponsiveSize';
import { Language } from '@/types/interface1.types';
import { logger } from '@shared/utils/logger';
import React from 'react';
import { MobileTouchDebugger } from './MobileTouchDebugger';
import SiriCallButton from './SiriCallButton';
import { SiriButtonStatus } from './components/SiriButtonStatus';
import { useCallProtection } from './hooks/useCallProtection';
import { useLanguageColors } from './hooks/useLanguageColors';

interface SiriButtonContainerProps {
  isCallStarted: boolean;
  micLevel: number;
  onCallStart: (lang: Language) => Promise<void>;
  onCallEnd: () => Promise<void>;
  // ✅ REMOVED: onCancel and onConfirm are no longer needed
  // Summary popup will auto-show when call ends via Siri button tap
  showingSummary?: boolean; // ✅ NEW: Hide Cancel/Confirm when summary is showing
  _showingSummary?: boolean; // ✅ NEW: Internal state for summary display
}

export const SiriButtonContainer: React.FC<SiriButtonContainerProps> = ({
  isCallStarted,
  micLevel,
  onCallStart,
  onCallEnd,
}) => {
  const { language } = useAssistant();
  const responsiveSize = useSiriResponsiveSize();

  // Custom hooks
  const currentColors = useLanguageColors(language);
  const { isConfirming, protectedOnCallStart } = useCallProtection({
    isCallStarted,
    onCallStart,
  });

  // Minimal debug logging
  if (import.meta.env.DEV) {
    logger.debug(
      `[SiriButtonContainer] Language: ${language}, isCallStarted: ${isCallStarted}`,
      'Component'
    );
  }

  // ✅ REMOVED: handleConfirm function is no longer needed
  // Summary popup will auto-show when call ends via Siri button tap

  return (
    <div
      className="relative flex flex-col items-center justify-center voice-button-container"
      style={{
        marginBottom: '2rem',
        zIndex: 10000,
        pointerEvents: 'auto',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      role="application"
      aria-label="Voice Assistant Control Panel"
    >
      {/* Screen Reader Only Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isConfirming
          ? 'Processing call summary, please wait'
          : isCallStarted
            ? `Voice call active in ${currentColors.name}. Press space or enter to end call.`
            : `Voice assistant ready in ${currentColors.name}. Press space or enter to start speaking.`}
      </div>

      {/* Top Row: Cancel + Confirm - COMPLETELY REMOVED */}
      {/* ✅ REMOVED: Cancel and Confirm buttons are no longer needed */}
      {/* Summary popup will auto-show when call ends via Siri button tap */}

      {/* Enhanced Siri Button Container with Full Accessibility */}
      <div
        className={`relative transition-all duration-500 ease-in-out voice-control hardware-accelerated ${isCallStarted ? 'listening active' : ''} ${isConfirming ? 'confirming' : ''} focus-ring ${isConfirming ? 'gentle-glow' : ''}`}
        data-testid="siri-button"
        data-language={language}
        role="button"
        tabIndex={0}
        aria-pressed={isCallStarted}
        aria-disabled={isConfirming}
        aria-label={
          isConfirming
            ? 'Processing call summary, please wait'
            : isCallStarted
              ? `End voice call in ${currentColors.name}`
              : `Start voice call in ${currentColors.name}`
        }
        aria-describedby="voice-button-status"
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !isConfirming) {
            e.preventDefault();
            if (isCallStarted) {
              onCallEnd();
            } else {
              protectedOnCallStart(language);
            }
          }
        }}
        onFocus={() => {
          // Add focus ring for keyboard navigation - removed due to typing issue
        }}
        style={{
          // 🔧 HYBRID FIX: Use responsive sizing hook
          width: responsiveSize.width,
          height: responsiveSize.height,
          minWidth: responsiveSize.minWidth,
          minHeight: responsiveSize.minHeight,
          maxWidth: responsiveSize.maxWidth,
          maxHeight: responsiveSize.maxHeight,
          borderRadius: '50%',
          boxShadow: isConfirming
            ? `0 10px 20px rgba(128, 128, 128, 0.3), 0 0 30px rgba(128, 128, 128, 0.2)` // ✅ NEW: Muted glow when confirming
            : `0 20px 40px ${currentColors.glow}, 0 0 60px ${currentColors.glow}`,
          background: isConfirming
            ? `linear-gradient(135deg, #80808020, #80808010)` // ✅ NEW: Muted background when confirming
            : `linear-gradient(135deg, ${currentColors.primary}15, ${currentColors.secondary}10)`,
          backdropFilter: 'blur(10px)',
          border: isConfirming
            ? `2px solid #80808040` // ✅ NEW: Muted border when confirming
            : `2px solid ${currentColors.primary}40`,
          cursor: isConfirming ? 'not-allowed' : 'pointer', // ✅ NEW: Show disabled state
          touchAction: 'manipulation', // Improve touch response
          opacity: isConfirming ? 0.6 : 1, // ✅ NEW: Visual dimming when confirming
          // ✅ HYBRID FIX: Stable positioning without layout shifts
          position: 'relative',
          flexShrink: 0, // Prevent container from shrinking
          alignSelf: 'center', // Self-align to center
          aspectRatio: '1', // Force perfect square
          margin: '0 auto', // Center horizontally
          contain: 'layout style', // Enhanced containment for stability
          // Enhanced focus styles
          outline: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <SiriCallButton
          containerId="main-siri-button"
          isListening={isCallStarted}
          volumeLevel={micLevel}
          onCallStart={() => protectedOnCallStart(language)}
          onCallEnd={onCallEnd}
          language={language}
          colors={currentColors}
        />
      </div>

      {/* Status Component */}
      <SiriButtonStatus
        isCallStarted={isCallStarted}
        isConfirming={isConfirming}
        language={language}
        colors={currentColors}
      />

      {/* 🧪 DEBUG: Mobile Touch Debugger - Development only */}
      {import.meta.env.DEV && (
        <MobileTouchDebugger
          containerId="main-siri-button"
          onCallStart={() => protectedOnCallStart(language)}
          onCallEnd={onCallEnd}
          isListening={isCallStarted}
          enabled={true}
        />
      )}
    </div>
  );
};
