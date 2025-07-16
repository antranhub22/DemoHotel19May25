import React from 'react';
import { designSystem } from '@/styles/designSystem';
import SiriCallButton from './SiriCallButton';
import { Language } from '@/types/interface1.types';
import { useAssistant } from '@/context/AssistantContext';

interface SiriButtonContainerProps {
  isCallStarted: boolean;
  micLevel: number;
  onCallStart: (lang: Language) => Promise<void>;
  onCallEnd: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
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
  onConfirm
}) => {
  const { language } = useAssistant();
  const currentColors = LANGUAGE_COLORS[language] || LANGUAGE_COLORS['en'];

  return (
    <div 
      className="flex flex-col items-center justify-center w-full"
      style={{ 
        marginBottom: designSystem.spacing.xl,
        zIndex: designSystem.zIndex.above
      }}
    >
      {/* Language Indicator */}
      <div
        className="mb-3 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300"
        style={{
          backgroundColor: currentColors.primary,
          color: 'white',
          boxShadow: `0 0 20px ${currentColors.glow}`,
          fontSize: '0.85rem'
        }}
      >
        🎤 {currentColors.name}
      </div>

      {/* Siri Button Container */}
      <div 
        className="relative flex items-center justify-center transition-all duration-500 ease-in-out"
        style={{ 
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          boxShadow: `0 20px 40px ${currentColors.glow}, 0 0 60px ${currentColors.glow}`,
          background: `linear-gradient(135deg, ${currentColors.primary}15, ${currentColors.secondary}10)`,
          backdropFilter: 'blur(10px)',
          border: `2px solid ${currentColors.primary}40`,
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
      
      {/* Tap To Speak text - Visible on all devices */}
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

      {/* Cancel and Confirm buttons - Show only when call is active */}
      {isCallStarted && (
        <div className="flex gap-4 mt-4">
          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors duration-200 shadow-lg"
            style={{
              minWidth: '100px',
              fontSize: '0.9rem'
            }}
          >
            Cancel
          </button>

          {/* Confirm Button */}
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-white rounded-full font-medium transition-colors duration-200 shadow-lg"
            style={{
              minWidth: '100px',
              fontSize: '0.9rem',
              backgroundColor: currentColors.primary,
              boxShadow: `0 4px 12px ${currentColors.glow}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.primary;
            }}
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}; 