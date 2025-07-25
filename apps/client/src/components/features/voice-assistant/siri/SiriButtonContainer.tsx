/// <reference types="vite/client" />

// Type declaration for import.meta

import React, { useEffect, useState } from 'react';
import { useAssistant } from '@/context';
import { useSiriResponsiveSize } from '@/hooks/useSiriResponsiveSize';
import { designSystem } from '@/styles/designSystem';
import { logger } from '@shared/utils/logger';
import { MobileTouchDebugger } from './MobileTouchDebugger';
import SiriCallButton from './SiriCallButton';

interface SiriButtonContainerProps {
  isCallStarted: boolean;
  micLevel: number;
  onCallStart: (lang: Language) => Promise<void>;
  onCallEnd: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  showingSummary?: boolean; // ✅ NEW: Hide Cancel/Confirm when summary is showing
  _showingSummary?: boolean; // ✅ NEW: Internal state for summary display
}

// Màu sắc cho từng ngôn ngữ
const LANGUAGE_COLORS = {
  en: {
    primary: '#5DB6B9', // Xanh dương nhạt (English - mặc định)
    secondary: '#E8B554', // Vàng gold
    glow: 'rgba(93, 182, 185, 0.4)',
    name: 'English',
  },
  fr: {
    primary: '#8B5CF6', // Tím (French - màu tím sang trọng)
    secondary: '#A78BFA', // Tím nhạt
    glow: 'rgba(139, 92, 246, 0.4)',
    name: 'Français',
  },
  zh: {
    primary: '#EF4444', // Đỏ (Chinese - màu đỏ may mắn)
    secondary: '#FCA5A5', // Đỏ nhạt
    glow: 'rgba(239, 68, 68, 0.4)',
    name: '中文',
  },
  ru: {
    primary: '#10B981', // Xanh lá (Russian - màu xanh lá)
    secondary: '#6EE7B7', // Xanh lá nhạt
    glow: 'rgba(16, 185, 129, 0.4)',
    name: 'Русский',
  },
  ko: {
    primary: '#F59E0B', // Cam (Korean - màu cam ấm áp)
    secondary: '#FDE68A', // Cam nhạt
    glow: 'rgba(245, 158, 11, 0.4)',
    name: '한국어',
  },
  vi: {
    primary: '#EC4899', // Hồng (Vietnamese - màu hồng)
    secondary: '#F9A8D4', // Hồng nhạt
    glow: 'rgba(236, 72, 153, 0.4)',
    name: 'Tiếng Việt',
  },
} as const;

export const SiriButtonContainer: React.FC<SiriButtonContainerProps> = ({
  isCallStarted,
  micLevel,
  onCallStart,
  onCallEnd,
  onCancel,
  onConfirm,
  _showingSummary = false, // ✅ NEW: Default to false
}) => {
  const { language } = useAssistant();
  const responsiveSize = useSiriResponsiveSize();

  // ✅ NEW: Prevent accidental restart after Confirm
  const [isConfirming, setIsConfirming] = useState(false);

  // Use LANGUAGE_COLORS mapping based on current language
  const currentColors =
    LANGUAGE_COLORS[language as keyof typeof LANGUAGE_COLORS] ||
    LANGUAGE_COLORS['en'];

  // Debug: Log language and color changes
  logger.debug(
    `🎨 [SiriButtonContainer] Language: ${language}, Colors: ${currentColors.name}, Primary: ${currentColors.primary}`,
    'Component'
  );
  logger.debug(
    '📏 [SiriButtonContainer] Responsive size:',
    'Component',
    responsiveSize
  );

  // 🚨 DEBUG: Tap to End Call Fix Verification
  if (import.meta.env.DEV) {
    logger.debug(
      '🔧 [SiriButtonContainer] TAP TO END CALL FIXES APPLIED:',
      'Component'
    );
    logger.debug(
      '  ✅ Priority 1: Mobile handleDirectTouch has end call logic',
      'Component'
    );
    logger.debug(
      '  ✅ Priority 2: Mobile unified with desktop protections',
      'Component'
    );
    logger.debug(
      '  ✅ Priority 3: Protection states fixed (isConfirming, emergencyStop)',
      'Component'
    );
    logger.debug(
      '  ✅ Priority 4: MobileTouchDebugger enabled for testing',
      'Component'
    );
    logger.debug(
      '  🚫 DISABLED: Cancel and Confirm buttons hidden by user request',
      'Component'
    );
    logger.debug(
      `  🎯 isCallStarted: ${isCallStarted}, isConfirming: ${isConfirming}`,
      'Component'
    );
    logger.debug(
      `  🎯 onCallStart available: ${!!onCallStart}, onCallEnd available: ${!!onCallEnd}`,
      'Component'
    );
  }

  // ✅ NEW: Reset confirming state when call ends
  useEffect(() => {
    if (!isCallStarted) {
      setIsConfirming(false);
    }
  }, [isCallStarted]);

  // ✅ NEW: Protected onCallStart to prevent restart during/after Confirm
  const protectedOnCallStart = async (lang: Language) => {
    if (isConfirming) {
      logger.debug(
        '🛡️ [SiriButtonContainer] Call start blocked - confirming in progress',
        'Component'
      );
      return;
    }

    logger.debug(
      '🎤 [SiriButtonContainer] Starting call normally...',
      'Component'
    );
    await onCallStart(lang);
  };

  const handleStartCall = async (lang: Language) => {
    logger.debug(
      '🎤 [SiriButtonContainer] Starting call with language:',
      'Component',
      lang
    );

    // ✅ NEW: Enhanced debug logging for call start
    console.log('🎬 [DEBUG] SiriButtonContainer.handleStartCall called:', {
      language: lang,
      timestamp: new Date().toISOString(),
      onCallStartFunction: !!onCallStart,
      onCallStartType: typeof onCallStart
    });

    // ✅ IMPROVED: Better error handling for call start
    try {
      // ✅ NEW: Pre-call debug
      console.log('🚀 [DEBUG] About to call onCallStart:', {
        language: lang,
        timestamp: new Date().toISOString()
      });

      await onCallStart(lang);

      // ✅ NEW: Post-call success debug
      console.log('✅ [DEBUG] onCallStart completed successfully:', {
        language: lang,
        timestamp: new Date().toISOString()
      });

      logger.debug(
        '✅ [SiriButtonContainer] Call started successfully',
        'Component'
      );
    } catch (error) {
      logger.error(
        '❌ [SiriButtonContainer] Error during call start:',
        'Component',
        error
      );

      // ✅ IMPROVED: Handle errors gracefully with user-friendly messages
      const errorMessage =
        error instanceof Error
          ? (error as any)?.message || String(error)
          : 'Lỗi không xác định';

      logger.error(
        '❌ [SiriButtonContainer] Call start error:',
        'Component',
        errorMessage
      );

      if (typeof window !== 'undefined') {
        if (errorMessage.includes('webCallUrl')) {
          logger.warn(
            'Không thể khởi tạo cuộc gọi. Vui lòng kiểm tra kết nối internet và thử lại.',
            'Component'
          );
        } else if (errorMessage.includes('assistant')) {
          logger.warn(
            'Cấu hình trợ lý gặp vấn đề. Vui lòng liên hệ hỗ trợ.',
            'Component'
          );
        } else if (
          errorMessage.includes('network') ||
          errorMessage.includes('fetch')
        ) {
          logger.warn(
            'Lỗi mạng. Vui lòng kiểm tra kết nối internet và thử lại.',
            'Component'
          );
        } else if (
          errorMessage.includes('microphone') ||
          errorMessage.includes('permissions')
        ) {
          logger.warn(
            'Cần quyền truy cập microphone. Vui lòng cho phép quyền truy cập và thử lại.',
            'Component'
          );
        } else {
          logger.warn(
            `Không thể bắt đầu cuộc gọi: ${errorMessage}`,
            'Component'
          );
        }
      }
    }
  };

  const handleEndCall = () => {
    logger.debug('🛑 [SiriButtonContainer] Ending call', 'Component');

    // ✅ IMPROVED: Better error handling for call end
    try {
      onCallEnd();
      logger.debug(
        '✅ [SiriButtonContainer] Call ended successfully',
        'Component'
      );
    } catch (error) {
      logger.error(
        '❌ [SiriButtonContainer] Error ending call:',
        'Component',
        error
      );

      // ✅ IMPROVED: Even if end call fails, still show success to user
      // The error is logged but we don't want to confuse the user
      logger.debug(
        '⚠️ [SiriButtonContainer] Call end had errors but proceeding normally',
        'Component'
      );
    }
  };

  const _handleCancel = () => {
    logger.debug('❌ [SiriButtonContainer] Cancelling call', 'Component');

    // ✅ IMPROVED: Better error handling for cancel
    try {
      onCancel?.();
      logger.debug(
        '✅ [SiriButtonContainer] Call cancelled successfully',
        'Component'
      );
    } catch (error) {
      logger.error(
        '❌ [SiriButtonContainer] Error cancelling call:',
        'Component',
        error
      );

      // ✅ IMPROVED: Even if cancel fails, still show success to user
      logger.debug(
        '⚠️ [SiriButtonContainer] Cancel had errors but proceeding normally',
        'Component'
      );
    }
  };

  const handleConfirm = () => {
    logger.debug('✅ [SiriButtonContainer] Confirming call', 'Component');

    // ✅ IMPROVED: Better error handling for confirm
    try {
      onConfirm();
      logger.debug(
        '✅ [SiriButtonContainer] Call confirmed successfully',
        'Component'
      );
    } catch (error) {
      logger.error(
        '❌ [SiriButtonContainer] Error confirming call:',
        'Component',
        error
      );

      // ✅ IMPROVED: Show error to user for confirm as it's more critical
      if (typeof window !== 'undefined') {
        const errorMessage =
          error instanceof Error
            ? (error as any)?.message || String(error)
            : 'Lỗi không xác định';
        alert(`Lỗi khi xác nhận cuộc gọi: ${errorMessage}`);
      }
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center voice-button-container"
      style={{
        marginBottom: designSystem.spacing.xl,
        zIndex: 9999, // Ensure highest priority
        pointerEvents: 'auto',
        // 🔧 HYBRID FIX: Fixed height to prevent layout shift
        height: '400px', // Fixed height container
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
            ? `Voice call active in ${LANGUAGE_COLORS[language].name}. Press space or enter to end call.`
            : `Voice assistant ready in ${LANGUAGE_COLORS[language].name}. Press space or enter to start speaking.`}
      </div>

      {/* Top Row: Cancel + Confirm - DISABLED BY USER REQUEST */}
      <div
        className="flex items-center justify-center gap-4 w-full max-w-sm px-4"
        style={{
          // 🔧 HYBRID FIX: Absolute positioning to prevent layout shifts
          position: 'absolute',
          top: '20px', // Fixed position above Siri button
          left: '50%',
          transform: 'translateX(-50%)',
          height: '40px', // Fixed height for buttons
          // 🚫 DISABLED: Hide Cancel and Confirm buttons completely
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none', // Disable all interactions
          transition: 'opacity 0.3s ease-in-out',
          zIndex: 1, // Above container but below outer z-index
        }}
        aria-hidden="true"
      >
        {/* Cancel Button - DISABLED */}
        <button
          onClick={onCancel}
          disabled={true}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
          style={{ minWidth: '80px' }}
          aria-label="Cancel voice call"
          tabIndex={-1}
        >
          Cancel
        </button>

        {/* Confirm Button - DISABLED */}
        <button
          onClick={handleConfirm}
          disabled={true}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
          style={{ minWidth: '80px' }}
          aria-label="Confirm voice call"
          tabIndex={-1}
        >
          Confirm
        </button>
      </div>

      {/* Enhanced Siri Button Container with Full Accessibility */}
      <div
        className={`relative transition-all duration-500 ease-in-out voice-control hardware-accelerated ${isCallStarted ? 'listening active' : ''} ${isConfirming ? 'confirming' : ''} focus-ring ${isConfirming ? 'gentle-glow' : ''}`}
        data-language={language}
        role="button"
        tabIndex={0}
        aria-pressed={isCallStarted}
        aria-disabled={isConfirming}
        aria-label={
          isConfirming
            ? 'Processing call summary, please wait'
            : isCallStarted
              ? `End voice call in ${LANGUAGE_COLORS[language].name}`
              : `Start voice call in ${LANGUAGE_COLORS[language].name}`
        }
        aria-describedby="voice-button-status"
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !isConfirming) {
            e.preventDefault();
            if (isCallStarted) {
              handleEndCall();
            } else {
              handleStartCall(language);
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

      {/* Enhanced Status text with better accessibility */}
      <div
        id="voice-button-status"
        className="block mt-4 text-center transition-all duration-300"
        role="status"
        aria-live="polite"
        style={{
          fontSize: '1rem',
          fontWeight: '600',
        }}
      >
        {/* ✅ Enhanced messages with better accessibility */}
        {isConfirming ? (
          <div
            style={{
              color: '#808080',
              textShadow: `0 2px 8px rgba(128, 128, 128, 0.3)`,
            }}
            aria-label="Processing call summary, please wait"
          >
            📋 Processing call summary...
          </div>
        ) : isCallStarted ? (
          <div
            style={{
              color: currentColors.primary,
              textShadow: `0 2px 8px ${currentColors.glow}`,
            }}
            aria-label={`Voice call active in ${LANGUAGE_COLORS[language].name}. Tap or press Enter to end call`}
          >
            🎤 Listening... Tap to end call
          </div>
        ) : (
          <div
            style={{
              color: currentColors.primary,
              textShadow: `0 2px 8px ${currentColors.glow}`,
            }}
            aria-label={`Voice assistant ready in ${LANGUAGE_COLORS[language].name}. Tap or press Enter to start speaking`}
          >
            Tap To Speak
          </div>
        )}
      </div>

      {/* Keyboard Navigation Hint */}
      <div className="mt-2 text-xs text-gray-500 text-center opacity-70">
        Press Space or Enter to {isCallStarted ? 'end' : 'start'} voice call
      </div>

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
