import React from 'react';
import { designSystem } from '@/styles/designSystem';
import SiriCallButton from './SiriCallButton';
import { Language } from '@/types/interface1.types';
import { useAssistant } from '@/context/AssistantContext';
import { useSiriResponsiveSize } from '@/hooks/useSiriResponsiveSize';

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

  // Use LANGUAGE_COLORS mapping based on current language
  const currentColors = LANGUAGE_COLORS[language as keyof typeof LANGUAGE_COLORS] || LANGUAGE_COLORS['en'];
  
  // Debug: Log language and color changes
  console.log('🎨 [SiriButtonContainer] Language:', language, 'Colors:', currentColors.name, 'Primary:', currentColors.primary);
  console.log('📏 [SiriButtonContainer] Responsive size:', responsiveSize);

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
      {/* Top Row: Cancel + Confirm - FIXED positioning to prevent layout shifts */}
      <div 
        className="flex items-center justify-center gap-4 w-full max-w-sm px-4"
        style={{
          // 🔧 HYBRID FIX: Absolute positioning to prevent layout shifts
          position: 'absolute',
          top: '20px',              // Fixed position above Siri button
          left: '50%',
          transform: 'translateX(-50%)',
          height: '40px',           // Fixed height for buttons
          opacity: isCallStarted && !showingSummary ? 1 : 0, // ✅ NEW: Hide when summary is showing
          visibility: isCallStarted && !showingSummary ? 'visible' : 'hidden', // ✅ NEW: Hide when summary is showing
          transition: 'opacity 0.3s ease-in-out',
          zIndex: 1,                // Above container but below outer z-index
        }}
      >
        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
          style={{ minWidth: '80px' }}
        >
          Cancel
        </button>

        {/* Confirm Button */}
        <button
          onClick={() => {
            console.log('🔵 [SiriButtonContainer] Confirm button clicked');
            try {
              if (onConfirm) {
                console.log('🔵 [SiriButtonContainer] Calling onConfirm...');
                onConfirm();
                console.log('✅ [SiriButtonContainer] onConfirm completed successfully');
              } else {
                console.warn('⚠️ [SiriButtonContainer] onConfirm is undefined');
                alert('Confirm function is not available');
              }
            } catch (error) {
              console.error('❌ [SiriButtonContainer] Error in Confirm button:', error);
              console.error('❌ [SiriButtonContainer] Error details:', {
                name: error?.name,
                message: error?.message,
                stack: error?.stack
              });
              
              // Prevent error from bubbling up to ErrorBoundary
              alert('Call completed! There was an issue with the summary. Please check with front desk.');
            }
          }}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
          style={{ minWidth: '80px' }}
        >
          Confirm
        </button>
      </div>

      {/* Siri Button Container - HYBRID: Desktop fixed + Mobile responsive */}
      <div 
        className={`relative transition-all duration-500 ease-in-out voice-button ${isCallStarted ? 'listening' : ''}`}
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
          boxShadow: `0 20px 40px ${currentColors.glow}, 0 0 60px ${currentColors.glow}`,
          background: `linear-gradient(135deg, ${currentColors.primary}15, ${currentColors.secondary}10)`,
          backdropFilter: 'blur(10px)',
          border: `2px solid ${currentColors.primary}40`,
          cursor: 'pointer', // Show it's clickable
          touchAction: 'manipulation', // Improve touch response
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
          onCallStart={() => onCallStart(language)}
          onCallEnd={onCallEnd}
          language={language}
          colors={currentColors}
        />
      </div>
      
      {/* Tap To Speak text - Visible only when not calling */}
      {!isCallStarted && (
        <div
          className="block mt-4 text-center transition-colors duration-300"
          style={{
            color: currentColors.primary,
            fontSize: '1rem',
            fontWeight: '600',
            textShadow: `0 2px 8px ${currentColors.glow}`,
          }}
        >
          Tap To Speak
        </div>
      )}
    </div>
  );
}; 