import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Language } from '@/types/interface1.types';
import { useRefactoredAssistant as useAssistant } from '@/context/RefactoredAssistantContext';
import { ChevronDown, Mic, Volume2, CheckCircle } from 'lucide-react';
import { logger } from '@shared/utils/logger';

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
    sampleText: 'Xin chào, chào mừng quý khách đến khách sạn. Tôi có thể giúp gì?',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    accent: 'Parisien',
    sampleText: 'Bonjour, bienvenue dans notre hôtel. Comment puis-je vous aider?',
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
    sampleText: '안녕하세요, 저희 호텔에 오신 것을 환영합니다. 무엇을 도와드릴까요?',
  },
];

// Language-specific colors (matching SiriButtonContainer)
const LANGUAGE_COLORS = {
  en: { primary: '#5DB6B9', secondary: '#E8B554', bg: 'bg-blue-50', border: 'border-blue-200' },
  vi: { primary: '#EC4899', secondary: '#F9A8D4', bg: 'bg-pink-50', border: 'border-pink-200' },
  fr: { primary: '#8B5CF6', secondary: '#A78BFA', bg: 'bg-purple-50', border: 'border-purple-200' },
  zh: { primary: '#EF4444', secondary: '#FCA5A5', bg: 'bg-red-50', border: 'border-red-200' },
  ru: { primary: '#10B981', secondary: '#6EE7B7', bg: 'bg-green-50', border: 'border-green-200' },
  ko: { primary: '#F59E0B', secondary: '#FDE68A', bg: 'bg-orange-50', border: 'border-orange-200' },
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
  const [previewingLanguage, setPreviewingLanguage] = useState<Language | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentOption = LANGUAGE_OPTIONS.find(opt => opt.code === language) || LANGUAGE_OPTIONS[0];
  const currentColors = LANGUAGE_COLORS[language];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Stop speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle language change with voice feedback
  const handleLanguageSelect = useCallback(async (newLanguage: Language) => {
    logger.debug(`🗣️ [VoiceLanguageSwitcher] Language selected: ${newLanguage}`, 'Component');
    
    setIsChanging(true);
    
    try {
      // Update language in context
      setLanguage(newLanguage);
      
      // Notify parent component
      onLanguageChange?.(newLanguage);
      
      // Add notification
      if (typeof window !== 'undefined' && (window as any).addNotification) {
        const selectedOption = LANGUAGE_OPTIONS.find(opt => opt.code === newLanguage);
        (window as any).addNotification({
          type: 'success',
          title: 'Language Changed',
          message: `Voice assistant switched to ${selectedOption?.name || newLanguage}`,
          duration: 3000,
        });
      }
      
      // Play confirmation sound/voice (optional)
      if (showVoicePreview && 'speechSynthesis' in window) {
        setTimeout(() => {
          playVoicePreview(newLanguage, true);
        }, 500);
      }
      
      logger.debug(`✅ [VoiceLanguageSwitcher] Language changed successfully to: ${newLanguage}`, 'Component');
    } catch (error) {
      logger.error(`❌ [VoiceLanguageSwitcher] Error changing language:`, 'Component', error);
      
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
      setIsOpen(false);
    }
  }, [setLanguage, onLanguageChange, showVoicePreview]);

  // Play voice preview for language option
  const playVoicePreview = useCallback((langCode: Language, isConfirmation = false) => {
    if (!('speechSynthesis' in window)) {
      logger.warn('Speech synthesis not supported', 'Component');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const option = LANGUAGE_OPTIONS.find(opt => opt.code === langCode);
    if (!option) return;

    setPreviewingLanguage(langCode);

    const utterance = new SpeechSynthesisUtterance(
      isConfirmation 
        ? option.sampleText 
        : `${option.name}. ${option.sampleText}`
    );
    
    // Set language-specific voice settings
    utterance.lang = langCode === 'en' ? 'en-US' 
                   : langCode === 'vi' ? 'vi-VN'
                   : langCode === 'fr' ? 'fr-FR'
                   : langCode === 'zh' ? 'zh-CN'
                   : langCode === 'ru' ? 'ru-RU'
                   : langCode === 'ko' ? 'ko-KR'
                   : 'en-US';

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onend = () => {
      setPreviewingLanguage(null);
    };

    utterance.onerror = () => {
      setPreviewingLanguage(null);
      logger.warn(`Voice preview failed for ${langCode}`, 'Component');
    };

    speechRef.current = utterance;
    speechSynthesis.speak(utterance);

    logger.debug(`🔊 [VoiceLanguageSwitcher] Playing voice preview for: ${langCode}`, 'Component');
  }, []);

  // Stop current voice preview
  const stopVoicePreview = useCallback(() => {
    speechSynthesis.cancel();
    setPreviewingLanguage(null);
  }, []);

  // Get position-specific styles
  const getPositionStyles = () => {
    switch (position) {
      case 'header':
        return 'bg-white/90 border shadow-sm';
      case 'floating':
        return 'bg-white/95 backdrop-blur-md border border-white/20 shadow-lg';
      case 'inline':
        return 'bg-transparent border-2';
      default:
        return 'bg-white/95 backdrop-blur-md border border-white/20 shadow-lg';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
          ${getPositionStyles()}
          ${currentColors.bg} ${currentColors.border}
          hover:shadow-md hover:scale-105 active:scale-95
          ${isChanging ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        `}
        style={{
          borderColor: isOpen ? currentColors.primary : undefined,
        }}
      >
        {/* Flag and Language */}
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentOption.flag}</span>
          <div className="text-left">
            <div className="font-medium text-sm" style={{ color: currentColors.primary }}>
              {currentOption.nativeName}
            </div>
            <div className="text-xs text-gray-500">
              {currentOption.accent}
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 ml-auto">
          {isChanging && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          )}
          
          {showVoicePreview && (
            <div className="flex items-center gap-1">
              <Mic className="h-3 w-3 text-gray-500" />
              <Volume2 className="h-3 w-3 text-gray-500" />
            </div>
          )}

          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-xl z-50 min-w-[300px]">
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = option.code === language;
            const isPreviewing = previewingLanguage === option.code;
            const colors = LANGUAGE_COLORS[option.code];

            return (
              <div
                key={option.code}
                className={`
                  flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 cursor-pointer transition-all duration-200
                  ${isSelected ? colors.bg : ''}
                  ${isPreviewing ? 'bg-blue-50/50' : ''}
                `}
                onClick={() => handleLanguageSelect(option.code)}
                onMouseEnter={() => showVoicePreview && playVoicePreview(option.code)}
                onMouseLeave={stopVoicePreview}
              >
                {/* Flag and Names */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">{option.flag}</span>
                  <div>
                    <div className="font-medium text-sm" style={{ 
                      color: isSelected ? colors.primary : '#374151' 
                    }}>
                      {option.nativeName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.name} • {option.accent}
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center gap-2">
                  {isPreviewing && (
                    <div className="flex items-center gap-1 text-blue-500">
                      <Volume2 className="h-3 w-3 animate-pulse" />
                    </div>
                  )}
                  
                  {showVoicePreview && !isPreviewing && (
                    <div className="flex items-center gap-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Volume2 className="h-3 w-3" />
                    </div>
                  )}

                  {isSelected && (
                    <CheckCircle className="h-4 w-4" style={{ color: colors.primary }} />
                  )}
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div className="border-t border-gray-200/50 mt-2 pt-2 px-4">
            <div className="text-xs text-gray-500 text-center">
              🎤 Hover to preview voice • Click to switch
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 