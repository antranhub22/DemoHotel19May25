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

  // Use LANGUAGE_COLORS mapping based on current language
  const currentColors = LANGUAGE_COLORS[language as keyof typeof LANGUAGE_COLORS] || LANGUAGE_COLORS['en'];
  
  // Debug: Log language and color changes
  console.log('🎨 [SiriButtonContainer] Language:', language, 'Colors:', currentColors.name, 'Primary:', currentColors.primary);

  return (
    <div 
      className="flex flex-col items-center justify-center w-full relative z-50"
      style={{ 
        marginBottom: designSystem.spacing.xl,
        zIndex: 9999, // Ensure highest priority
        pointerEvents: 'auto'
      }}
    >
      {/* Top Row: Cancel + Confirm */}
      {isCallStarted && (
        <div className="flex items-center justify-center gap-4 w-full max-w-sm mb-4 px-4">
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
            onClick={onConfirm}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-semibold transition-all duration-200 active:scale-95"
            style={{ minWidth: '80px' }}
          >
            Confirm
          </button>
        </div>
      )}

      {/* Siri Button Container với External Volume Bars */}
      <div 
        className="relative flex items-center justify-center transition-all duration-500 ease-in-out"
        style={{ 
          width: '320px',  // Slightly larger to accommodate external bars
          height: '320px', // Slightly larger to accommodate external bars
          borderRadius: '50%',
          boxShadow: `0 20px 40px ${currentColors.glow}, 0 0 60px ${currentColors.glow}`,
          background: `linear-gradient(135deg, ${currentColors.primary}15, ${currentColors.secondary}10)`,
          backdropFilter: 'blur(10px)',
          border: `2px solid ${currentColors.primary}40`,
        }}
      >
        {/* External Volume Bars - Compact và xung quanh button */}
        {isCallStarted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(16)].map((_, i) => {
              const angle = (360 / 16) * i;
              const radians = (angle * Math.PI) / 180;
              const baseRadius = 110; // Adjusted for new container size
              const barHeight = 8 + Math.round((micLevel/100)*16) * ((i%2)+1); // Better proportions
              const x = Math.cos(radians) * baseRadius;
              const y = Math.sin(radians) * baseRadius;
              
              return (
                <div
                  key={i}
                  className="absolute transition-all duration-150 ease-out"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
                    width: '3px', // Slightly wider for better visibility
                    height: `${barHeight}px`,
                    backgroundColor: currentColors.primary,
                    borderRadius: '1.5px',
                    boxShadow: `0 0 6px ${currentColors.glow}`,
                    opacity: 0.7 + (micLevel/100) * 0.3,
                    transformOrigin: 'center bottom',
                    zIndex: 1
                  }}
                />
              );
            })}
          </div>
        )}

        <div className="relative z-10">
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