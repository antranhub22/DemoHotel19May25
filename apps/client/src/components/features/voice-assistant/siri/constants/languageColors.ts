import { Language } from '@/types/interface1.types';

export interface LanguageColorScheme {
  primary: string;
  secondary: string;
  glow: string;
  name: string;
}

// Màu sắc cho từng ngôn ngữ
export const LANGUAGE_COLORS: Record<Language, LanguageColorScheme> = {
  en: {
    primary: '#5DB6B9',
    secondary: '#E8B554',
    glow: 'rgba(93, 182, 185, 0.4)',
    name: 'English',
  },
  vi: {
    primary: '#FF6B9D',
    secondary: '#C44569',
    glow: 'rgba(255, 107, 157, 0.4)',
    name: 'Tiếng Việt',
  },
  fr: {
    primary: '#4834D4',
    secondary: '#686DE0',
    glow: 'rgba(72, 52, 212, 0.4)',
    name: 'Français',
  },
  zh: {
    primary: '#FF9FF3',
    secondary: '#F8B500',
    glow: 'rgba(255, 159, 243, 0.4)',
    name: '中文',
  },
  ru: {
    primary: '#FF3838',
    secondary: '#FF6B9D',
    glow: 'rgba(255, 56, 56, 0.4)',
    name: 'Русский',
  },
  ko: {
    primary: '#3D5A80',
    secondary: '#98C1D9',
    glow: 'rgba(61, 90, 128, 0.4)',
    name: '한국어',
  },
} as const;
