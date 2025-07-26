import { useAssistant } from '@/context';
import { useIsMobile } from '@/hooks/use-mobile';
import { Language } from '@/types/interface1.types';
import { logger } from '@shared/utils/logger';
import {
  CheckCircle,
  ChevronDown,
  Mic,
  Smartphone,
  Volume2,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  voiceId?: string;
  accent: string;
  sampleText: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    accent: 'American',
    sampleText: 'Hello, welcome to our hotel. How can I assist you today?',
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    accent: 'Northern',
    sampleText:
      'Xin chào, chào mừng quý khách đến khách sạn. Tôi có thể giúp gì?',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    accent: 'Parisien',
    sampleText:
      'Bonjour, bienvenue dans notre hôtel. Comment puis-je vous aider?',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    accent: 'Mandarin',
    sampleText: '您好，欢迎来到我们的酒店。我可以为您做些什么？',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    accent: 'Moscow',
    sampleText: 'Здравствуйте, добро пожаловать в наш отель. Чем могу помочь?',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    accent: 'Seoul',
    sampleText:
      '안녕하세요, 저희 호텔에 오신 것을 환영합니다. 무엇을 도와드릴까요?',
  },
];

// Enhanced language-specific colors with gradients
const LANGUAGE_COLORS = {
  en: {
    primary: '#5DB6B9',
    secondary: '#E8B554',
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-cyan-500',
  },
  vi: {
    primary: '#EC4899',
    secondary: '#F9A8D4',
    bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
    border: 'border-pink-200',
    gradient: 'from-pink-500 to-rose-500',
  },
  fr: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-indigo-500',
  },
  zh: {
    primary: '#EF4444',
    secondary: '#FCA5A5',
    bg: 'bg-gradient-to-br from-red-50 to-orange-50',
    border: 'border-red-200',
    gradient: 'from-red-500 to-orange-500',
  },
  ru: {
    primary: '#10B981',
    secondary: '#6EE7B7',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-200',
    gradient: 'from-green-500 to-emerald-500',
  },
  ko: {
    primary: '#F59E0B',
    secondary: '#FDE68A',
    bg: 'bg-gradient-to-br from-orange-50 to-yellow-50',
    border: 'border-orange-200',
    gradient: 'from-orange-500 to-yellow-500',
  },
} as const;

interface VoiceLanguageSwitcherProps {
  position?: 'header' | 'floating' | 'inline';
  showVoicePreview?: boolean;
  onLanguageChange?: (language: Language) => void;
  className?: string;
}

export const VoiceLanguageSwitcher: React.FC<VoiceLanguageSwitcherProps> = ({
  position = 'floating',
  showVoicePreview = true,
  onLanguageChange,
  className = '',
}) => {
  const { language, setLanguage } = useAssistant();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [previewingLanguage, setPreviewingLanguage] = useState<Language | null>(
    null
  );
  const [animationState, setAnimationState] = useState<
    'idle' | 'opening' | 'closing'
  >('idle');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<any>(null);
  const isMobile = useIsMobile();

  const currentOption =
    LANGUAGE_OPTIONS.find(opt => opt.code === language) || LANGUAGE_OPTIONS[0];
  const currentColors = LANGUAGE_COLORS[language];

  // Enhanced close dropdown handler with animation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as any)
      ) {
        handleCloseDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced dropdown close with animation
  const handleCloseDropdown = useCallback(() => {
    if (isOpen) {
      setAnimationState('closing');
      setTimeout(() => {
        setIsOpen(false);
        setAnimationState('idle');
      }, 300);
    }
  }, [isOpen]);

  // Enhanced dropdown open with animation
  const handleOpenDropdown = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
      setAnimationState('opening');
      setTimeout(() => {
        setAnimationState('idle');
      }, 400);
    }
  }, [isOpen]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechRef.current && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Enhanced language change handler with visual feedback
  const handleLanguageSelect = useCallback(
    async (newLanguage: Language) => {
      logger.debug(
        `🗣️ [VoiceLanguageSwitcher] Language selected: ${newLanguage}`,
        'Component'
      );

      setIsChanging(true);

      try {
        // Update language in context
        setLanguage(newLanguage);

        // Notify parent component
        onLanguageChange?.(newLanguage);

        // ✅ ENHANCED: Better notification with assistant info
        if (typeof window !== 'undefined' && (window as any).addNotification) {
          const selectedOption = LANGUAGE_OPTIONS.find(
            opt => opt.code === newLanguage
          );

          // Get assistant ID for this language (for display purposes)
          const assistantId = newLanguage === 'vi'
            ? import.meta.env.VITE_VAPI_ASSISTANT_ID_VI
            : newLanguage === 'fr'
              ? import.meta.env.VITE_VAPI_ASSISTANT_ID_FR
              : newLanguage === 'zh'
                ? import.meta.env.VITE_VAPI_ASSISTANT_ID_ZH
                : newLanguage === 'ru'
                  ? import.meta.env.VITE_VAPI_ASSISTANT_ID_RU
                  : newLanguage === 'ko'
                    ? import.meta.env.VITE_VAPI_ASSISTANT_ID_KO
                    : import.meta.env.VITE_VAPI_ASSISTANT_ID;

          (window as any).addNotification({
            type: 'success',
            title: '🤖 Voice Assistant Switched',
            message: `${selectedOption?.name || newLanguage} assistant ready (${assistantId ? assistantId.substring(0, 8) + '...' : 'default'})`,
            duration: 4000,
          });
        }

        // Enhanced voice confirmation with error handling
        if (showVoicePreview && 'speechSynthesis' in window) {
          setTimeout(() => {
            playVoicePreview(newLanguage, true);
          }, 500);
        }

        logger.debug(
          `✅ [VoiceLanguageSwitcher] Language changed successfully to: ${newLanguage}`,
          'Component'
        );
      } catch (error) {
        logger.error(
          `❌ [VoiceLanguageSwitcher] Error changing language:`,
          'Component',
          error
        );

        // Show error notification
        if (typeof window !== 'undefined' && (window as any).addNotification) {
          (window as any).addNotification({
            type: 'error',
            title: 'Language Change Failed',
            message: 'Unable to change language. Please try again.',
            duration: 5000,
          });
        }
      } finally {
        setIsChanging(false);
        handleCloseDropdown();
      }
    },
    [setLanguage, onLanguageChange, showVoicePreview, handleCloseDropdown]
  );

  // Enhanced voice preview with better error handling
  const playVoicePreview = useCallback(
    (langCode: Language, isConfirmation = false) => {
      if (
        !('speechSynthesis' in window) ||
        typeof window.speechSynthesis === 'undefined'
      ) {
        logger.warn('Speech synthesis not supported', 'Component');
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const option = LANGUAGE_OPTIONS.find(opt => opt.code === langCode);
      if (!option) {
        return;
      }

      setPreviewingLanguage(langCode);

      const utterance = new window.SpeechSynthesisUtterance(
        isConfirmation
          ? option.sampleText
          : `${option.name}. ${option.sampleText}`
      );

      // Enhanced language-specific voice settings
      utterance.lang =
        langCode === 'en'
          ? 'en-US'
          : langCode === 'vi'
            ? 'vi-VN'
            : langCode === 'fr'
              ? 'fr-FR'
              : langCode === 'zh'
                ? 'zh-CN'
                : langCode === 'ru'
                  ? 'ru-RU'
                  : langCode === 'ko'
                    ? 'ko-KR'
                    : 'en-US';

      utterance.rate = 0.9;
      utterance.volume = 0.7;
      utterance.pitch = 1;

      // Enhanced event handlers
      utterance.onstart = () => {
        logger.debug(
          `🔊 [VoiceLanguageSwitcher] Voice preview started for ${langCode}`,
          'Component'
        );
      };

      utterance.onend = () => {
        setPreviewingLanguage(null);
        logger.debug(
          `🔊 [VoiceLanguageSwitcher] Voice preview ended for ${langCode}`,
          'Component'
        );
      };

      utterance.onerror = event => {
        setPreviewingLanguage(null);
        logger.warn(
          `🔊 [VoiceLanguageSwitcher] Voice preview error for ${langCode}:`,
          'Component',
          event
        );
      };

      speechRef.current = utterance;

      try {
        window.speechSynthesis.speak(utterance);
        logger.debug(
          `🎤 [VoiceLanguageSwitcher] Playing voice preview for ${langCode}`,
          'Component'
        );
      } catch (error) {
        logger.error(
          `🔊 [VoiceLanguageSwitcher] Failed to play voice preview:`,
          'Component',
          error
        );
        setPreviewingLanguage(null);
      }
    },
    []
  );

  // Stop voice preview
  const stopVoicePreview = useCallback(() => {
    if (speechRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setPreviewingLanguage(null);
      speechRef.current = null;
    }
  }, []);

  // Get enhanced position-specific styles
  const getPositionStyles = () => {
    const baseStyles = 'backdrop-blur-lg shadow-xl transition-all duration-300';

    switch (position) {
      case 'header':
        return `${baseStyles} bg-white/95 border border-gray-200/50`;
      case 'floating':
        return `${baseStyles} bg-white/90 border border-white/30 shadow-2xl`;
      case 'inline':
        return `${baseStyles} bg-transparent border-2`;
      default:
        return `${baseStyles} bg-white/90 border border-white/30`;
    }
  };

  // Get animation classes
  const getAnimationClasses = () => {
    const mobileClass = isMobile ? 'mobile' : '';
    const animationClass =
      animationState === 'opening'
        ? 'opening'
        : animationState === 'closing'
          ? 'closing'
          : '';
    return `voice-language-switcher ${mobileClass} ${animationClass}`.trim();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Enhanced Main Button */}
      <button
        onClick={isOpen ? handleCloseDropdown : handleOpenDropdown}
        disabled={isChanging}
        className={`
          voice-control flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
          ${getPositionStyles()}
          ${currentColors.bg} ${currentColors.border}
          hover:shadow-lg hover:scale-105 active:scale-95 focus:scale-105
          ${isChanging ? 'opacity-50 cursor-wait voice-loading' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
          ${isMobile ? 'px-3 py-2 text-sm' : ''}
        `}
        style={{
          borderColor: isOpen ? currentColors.primary : undefined,
        }}
        aria-label={`Current language: ${currentOption.nativeName}. Click to change language.`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Flag and Language Info */}
        <div className="flex items-center gap-2">
          <span
            className={`${isMobile ? 'text-lg' : 'text-xl'}`}
            role="img"
            aria-label={currentOption.name}
          >
            {currentOption.flag}
          </span>
          <div className="text-left">
            <div
              className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} voice-feedback-text`}
              style={{ color: currentColors.primary }}
            >
              {currentOption.nativeName}
            </div>
            {!isMobile && (
              <div className="text-xs text-gray-500">
                {currentOption.accent}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Status Indicators */}
        <div className="flex items-center gap-2 ml-auto">
          {isChanging && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          )}

          {showVoicePreview && !isMobile && (
            <div className="flex items-center gap-1 voice-particles">
              <Mic className="h-3 w-3 text-gray-500" />
              <Volume2 className="h-3 w-3 text-gray-500" />
            </div>
          )}

          {isMobile && <Smartphone className="h-3 w-3 text-gray-500" />}

          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
              }`}
          />
        </div>
      </button>

      {/* Enhanced Dropdown Menu with Animations */}
      {isOpen && (
        <div
          className={`
          ${getAnimationClasses()}
          absolute ${position === 'header' ? 'top-full right-0' : 'top-full left-0 right-0'} 
          mt-2 py-2 bg-white/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl z-50 
          ${isMobile ? 'min-w-[280px]' : 'min-w-[320px]'}
          voice-particles
        `}
        >
          {/* Enhanced Language Options */}
          {LANGUAGE_OPTIONS.map(option => {
            const isSelected = option.code === language;
            const isPreviewing = previewingLanguage === option.code;
            const colors = LANGUAGE_COLORS[option.code];

            return (
              <div
                key={option.code}
                className={`
                  language-option flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 cursor-pointer transition-all duration-200
                  ${isSelected ? `${colors.bg} ${isSelected ? 'selected' : ''}` : ''}
                  ${isPreviewing ? 'bg-blue-50/50 voice-wave' : ''}
                  ${isMobile ? 'px-3 py-2' : ''}
                `}
                onClick={() => handleLanguageSelect(option.code)}
                onMouseEnter={() =>
                  showVoicePreview && !isMobile && playVoicePreview(option.code)
                }
                onMouseLeave={stopVoicePreview}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLanguageSelect(option.code);
                  }
                }}
              >
                {/* Flag and Names */}
                <div className="flex items-center gap-3 flex-1">
                  <span
                    className={`${isMobile ? 'text-lg' : 'text-xl'}`}
                    role="img"
                    aria-label={option.name}
                  >
                    {option.flag}
                  </span>
                  <div>
                    <div
                      className={`font-medium ${isMobile ? 'text-sm' : 'text-sm'}`}
                      style={{ color: isSelected ? colors.primary : '#374151' }}
                    >
                      {option.nativeName}
                    </div>
                    <div
                      className={`text-xs text-gray-500 ${isMobile ? 'hidden' : ''}`}
                    >
                      {option.name} • {option.accent}
                    </div>
                  </div>
                </div>

                {/* Enhanced Status Indicators */}
                <div className="flex items-center gap-2">
                  {isPreviewing && (
                    <div className="flex items-center gap-1 text-blue-500">
                      <Volume2 className="h-3 w-3 animate-pulse" />
                      <div className="flex gap-0.5">
                        <div className="voice-wave w-1 h-3 bg-blue-500 rounded-full"></div>
                        <div className="voice-wave w-1 h-3 bg-blue-500 rounded-full"></div>
                        <div className="voice-wave w-1 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {showVoicePreview && !isPreviewing && !isMobile && (
                    <div className="flex items-center gap-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Volume2 className="h-3 w-3" />
                    </div>
                  )}

                  {isSelected && (
                    <CheckCircle
                      className="h-4 w-4 voice-success"
                      style={{ color: colors.primary }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Enhanced Footer */}
          <div className="border-t border-gray-200/50 mt-2 pt-2 px-4">
            <div
              className={`text-xs text-gray-500 text-center ${isMobile ? 'text-xs' : ''}`}
            >
              {isMobile
                ? '🎤 Tap to preview • Tap to switch'
                : '🎤 Hover to preview voice • Click to switch'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};