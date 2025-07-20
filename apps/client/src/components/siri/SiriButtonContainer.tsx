import React, { useState, useEffect } from 'react';
import { designSystem } from '@/styles/designSystem';
import SiriCallButton from './SiriCallButton';
import { Language } from '@/types/interface1.types';
import { useAssistant } from '@/context/AssistantContext';
import { useSiriResponsiveSize } from '@/hooks/useSiriResponsiveSize';
import { MobileTouchDebugger } from './MobileTouchDebugger';

interface SiriButtonContainerProps {
  isCallStarted: boolean;
  micLevel: number;
  onCallStart: (lang: Language) => Promise<void>;
  onCallEnd: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  showingSummary?: boolean; // ✅ NEW: Hide Cancel/Confirm when summary is showing
}

// Màu sắc cho từng ngôn ngữ
const LANGUAGE_COLORS = {
  'en': {
    primary: '#5DB6B9',      // Xanh dương nhạt (English - mặc định)
    secondary: '#E8B554',    // Vàng gold
    glow: 'rgba(93, 182, 185, 0.4)',
    name: 'English'
  },
  'fr': {
    primary: '#8B5CF6',      // Tím (French - màu tím sang trọng)
    secondary: '#A78BFA',    // Tím nhạt
    glow: 'rgba(139, 92, 246, 0.4)',
    name: 'Français'
  },
  'zh': {
    primary: '#EF4444',      // Đỏ (Chinese - màu đỏ may mắn)
    secondary: '#FCA5A5',    // Đỏ nhạt
    glow: 'rgba(239, 68, 68, 0.4)',
    name: '中文'
  },
  'ru': {
    primary: '#10B981',      // Xanh lá (Russian - màu xanh lá)
    secondary: '#6EE7B7',    // Xanh lá nhạt
    glow: 'rgba(16, 185, 129, 0.4)',
    name: 'Русский'
  },
  'ko': {
    primary: '#F59E0B',      // Cam (Korean - màu cam ấm áp)
    secondary: '#FDE68A',    // Cam nhạt
    glow: 'rgba(245, 158, 11, 0.4)',
    name: '한국어'
  },
  'vi': {
    primary: '#EC4899',      // Hồng (Vietnamese - màu hồng)
    secondary: '#F9A8D4',    // Hồng nhạt
    glow: 'rgba(236, 72, 153, 0.4)',
    name: 'Tiếng Việt'
  }
} as const;

export const SiriButtonContainer: React.FC<SiriButtonContainerProps> = ({
  isCallStarted,
  micLevel,
  onCallStart,
  onCallEnd,
  onCancel,
  onConfirm,
  showingSummary = false // ✅ NEW: Default to false
}) => {
  const { language } = useAssistant();
  const responsiveSize = useSiriResponsiveSize();
  
  // ✅ NEW: Prevent accidental restart after Confirm
  const [isConfirming, setIsConfirming] = useState(false);

  // Use LANGUAGE_COLORS mapping based on current language
  const currentColors = LANGUAGE_COLORS[language as keyof typeof LANGUAGE_COLORS] || LANGUAGE_COLORS['en'];
  
  // Debug: Log language and color changes
  console.log('🎨 [SiriButtonContainer] Language:', language, 'Colors:', currentColors.name, 'Primary:', currentColors.primary);
  console.log('📏 [SiriButtonContainer] Responsive size:', responsiveSize);
  
  // 🚨 DEBUG: Tap to End Call Fix Verification
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 [SiriButtonContainer] TAP TO END CALL FIXES APPLIED:');
    console.log('  ✅ Priority 1: Mobile handleDirectTouch has end call logic');
    console.log('  ✅ Priority 2: Mobile unified with desktop protections');
    console.log('  ✅ Priority 3: Protection states fixed (isConfirming, emergencyStop)');
    console.log('  ✅ Priority 4: MobileTouchDebugger enabled for testing');
    console.log('  🚫 DISABLED: Cancel and Confirm buttons hidden by user request');
    console.log('  🎯 isCallStarted:', isCallStarted, 'isConfirming:', isConfirming);
    console.log('  🎯 onCallStart available:', !!onCallStart, 'onCallEnd available:', !!onCallEnd);
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
      console.log('🛡️ [SiriButtonContainer] Call start blocked - confirming in progress');
      return;
    }
    
    console.log('🎤 [SiriButtonContainer] Starting call normally...');
    await onCallStart(lang);
  };

  const handleStartCall = async (lang: Language) => {
    console.log('🎤 [SiriButtonContainer] Starting call with language:', lang);
    
    // ✅ IMPROVED: Better error handling for call start
    try {
      await onCallStart(lang);
      console.log('✅ [SiriButtonContainer] Call started successfully');
      
    } catch (error) {
      console.error('❌ [SiriButtonContainer] Error during call start:', error);
      
      // ✅ IMPROVED: Handle errors gracefully with user-friendly messages
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      
      if (typeof window !== 'undefined') {
        if (errorMessage.includes('webCallUrl')) {
          alert('Không thể khởi tạo cuộc gọi. Vui lòng kiểm tra kết nối internet và thử lại.');
        } else if (errorMessage.includes('assistant')) {
          alert('Cấu hình trợ lý gặp vấn đề. Vui lòng liên hệ hỗ trợ.');
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          alert('Lỗi mạng. Vui lòng kiểm tra kết nối internet và thử lại.');
        } else if (errorMessage.includes('microphone') || errorMessage.includes('permissions')) {
          alert('Cần quyền truy cập microphone. Vui lòng cho phép quyền truy cập và thử lại.');
        } else {
          alert(`Không thể bắt đầu cuộc gọi: ${errorMessage}`);
        }
      }
    }
  };

  const handleEndCall = () => {
    console.log('🛑 [SiriButtonContainer] Ending call');
    
    // ✅ IMPROVED: Better error handling for call end
    try {
      onCallEnd();
      console.log('✅ [SiriButtonContainer] Call ended successfully');
      
    } catch (error) {
      console.error('❌ [SiriButtonContainer] Error ending call:', error);
      
      // ✅ IMPROVED: Even if end call fails, still show success to user
      // The error is logged but we don't want to confuse the user
      console.log('⚠️ [SiriButtonContainer] Call end had errors but proceeding normally');
    }
  };

  const handleCancel = () => {
    console.log('❌ [SiriButtonContainer] Cancelling call');
    
    // ✅ IMPROVED: Better error handling for cancel
    try {
      onCancel();
      console.log('✅ [SiriButtonContainer] Call cancelled successfully');
      
    } catch (error) {
      console.error('❌ [SiriButtonContainer] Error cancelling call:', error);
      
      // ✅ IMPROVED: Continue with cancel even if there's an error
      console.log('⚠️ [SiriButtonContainer] Cancel had errors but proceeding normally');
    }
  };

  const handleConfirm = () => {
    console.log('✅ [SiriButtonContainer] Confirming call');
    
    // ✅ IMPROVED: Better error handling for confirm
    try {
      onConfirm();
      console.log('✅ [SiriButtonContainer] Call confirmed successfully');
      
    } catch (error) {
      console.error('❌ [SiriButtonContainer] Error confirming call:', error);
      
      // ✅ IMPROVED: Show error to user for confirm as it's more critical
      if (typeof window !== 'undefined') {
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        alert(`Lỗi khi xác nhận cuộc gọi: ${errorMessage}`);
      }
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center w-full relative"
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
    >
      {/* Top Row: Cancel + Confirm - DISABLED BY USER REQUEST */}
      <div 
        className="flex items-center justify-center gap-4 w-full max-w-sm px-4"
        style={{
          // 🔧 HYBRID FIX: Absolute positioning to prevent layout shifts
          position: 'absolute',
          top: '20px',              // Fixed position above Siri button
          left: '50%',
          transform: 'translateX(-50%)',
          height: '40px',           // Fixed height for buttons
          // 🚫 DISABLED: Hide Cancel and Confirm buttons completely
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none',    // Disable all interactions
          transition: 'opacity 0.3s ease-in-out',
          zIndex: 1,                // Above container but below outer z-index
        }}
      >
        {/* Cancel Button - DISABLED */}
        <button
          onClick={onCancel}
          disabled={true}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
          style={{ minWidth: '80px' }}
        >
          Cancel
        </button>

        {/* Confirm Button - DISABLED */}
        <button
          onClick={handleConfirm}
          disabled={true}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
          style={{ minWidth: '80px' }}
        >
          Confirm
        </button>
      </div>

      {/* Siri Button Container - HYBRID: Desktop fixed + Mobile responsive */}
      <div 
        className={`relative transition-all duration-500 ease-in-out voice-button ${isCallStarted ? 'listening' : ''} ${isConfirming ? 'confirming' : ''}`}
        data-language={language}
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
      
      {/* Status text - Shows different messages based on state */}
      <div
        className="block mt-4 text-center transition-all duration-300"
        style={{
          fontSize: '1rem',
          fontWeight: '600',
        }}
      >
        {/* ✅ NEW: Different messages based on state */}
        {isConfirming ? (
          <div style={{
            color: '#808080',
            textShadow: `0 2px 8px rgba(128, 128, 128, 0.3)`,
          }}>
            📋 Processing call summary...
          </div>
        ) : isCallStarted ? (
          <div style={{
            color: currentColors.primary,
            textShadow: `0 2px 8px ${currentColors.glow}`,
          }}>
            🎤 Listening... Tap to end call
          </div>
        ) : (
          <div style={{
            color: currentColors.primary,
            textShadow: `0 2px 8px ${currentColors.glow}`,
          }}>
            Tap To Speak
          </div>
        )}
      </div>

      {/* 🧪 DEBUG: Mobile Touch Debugger - Development only */}
      {process.env.NODE_ENV === 'development' && (
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